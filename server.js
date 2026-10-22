import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import Task from './models/Task.js'
import User from './models/User.js'
import { authMiddleware } from './middleware/auth.js'
import { validateTaskInput, validateUserRegister } from './middleware/validation.js'
import cache, {
  incrementHits,
  incrementMisses,
  getCacheStats,
  flushCacheStats,
} from './cache.js'
import taskEvents from './listeners.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ exposedHeaders: ['X-Cache'] }))
app.use(express.json())

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })

// ==================== AUTH ROUTES ====================

// POST /register - Register a new user
app.post('/register', validateUserRegister, async (req, res, next) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ email, password: hashedPassword })

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, email: user.email, createdAt: user.createdAt },
    })
  } catch (error) {
    return next(error)
  }
})

// POST /login - Authenticate user & return JWT
app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, createdAt: user.createdAt },
    })
  } catch (error) {
    return next(error)
  }
})

// GET /me - Return currently logged in user details
app.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.status(200).json(user)
  } catch (error) {
    return next(error)
  }
})

// ==================== CACHE DEBUG ENDPOINTS ====================

// Supplementary Problem 2: Debug endpoint exposing cache hit/miss statistics & active keys
app.get('/cache/stats', (req, res) => {
  return res.status(200).json(getCacheStats())
})

// Debug endpoint to flush all keys and reset stats
app.delete('/cache/flush', (req, res) => {
  flushCacheStats()
  return res.status(200).json({ message: 'Cache successfully flushed and counters reset' })
})

// ==================== TASK ROUTES (PROTECTED WITH CACHING) ====================

// Step 3 of Practical 9: GET /tasks with in-memory caching check
app.get('/tasks', authMiddleware, async (req, res, next) => {
  try {
    const cacheKey = 'all_tasks'
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      incrementHits()
      res.setHeader('X-Cache', 'HIT')
      return res.status(200).json(cachedData)
    }

    incrementMisses()
    res.setHeader('X-Cache', 'MISS')

    const tasks = await Task.find().sort({ createdAt: -1 })
    cache.set(cacheKey, tasks)

    return res.status(200).json(tasks)
  } catch (error) {
    return next(error)
  }
})

// Supplementary Problem 1: GET /tasks/:id single-task endpoint caching
app.get('/tasks/:id', authMiddleware, async (req, res, next) => {
  try {
    const taskId = req.params.id
    const cacheKey = `task_${taskId}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      incrementHits()
      res.setHeader('X-Cache', 'HIT')
      return res.status(200).json(cachedData)
    }

    incrementMisses()
    res.setHeader('X-Cache', 'MISS')

    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    cache.set(cacheKey, task)
    return res.status(200).json(task)
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task ID format' })
    }
    return next(error)
  }
})

// Step 4 of Practical 9 & Practical 10: Invalidate cache and emit task-created event
app.post('/tasks', authMiddleware, validateTaskInput, async (req, res, next) => {
  try {
    const task = await Task.create(req.body)

    // Invalidate list cache
    cache.del('all_tasks')

    // Step 3 & 6 of Practical 10: Send response immediately, log timestamp, and emit event asynchronously
    console.log(`[API] Response sent at ${new Date().toISOString()}`)
    res.status(201).json(task)

    setImmediate(() => {
      taskEvents.emit('task-created', task)
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      })
    }
    return next(error)
  }
})

// Step 4 of Practical 9: Invalidate cache inside PUT handler
app.put('/tasks/:id', authMiddleware, async (req, res, next) => {
  try {
    const taskId = req.params.id
    const task = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
      runValidators: true,
    })

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Invalidate both all_tasks list cache and specific single-task cache
    cache.del('all_tasks')
    cache.del(`task_${taskId}`)

    return res.status(200).json(task)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      })
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task ID format' })
    }

    return next(error)
  }
})

// Step 4 of Practical 9 & Practical 10: Invalidate cache and emit task-deleted event
app.delete('/tasks/:id', authMiddleware, async (req, res, next) => {
  try {
    const taskId = req.params.id
    const task = await Task.findByIdAndDelete(taskId)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Invalidate both all_tasks list cache and specific single-task cache
    cache.del('all_tasks')
    cache.del(`task_${taskId}`)

    // Practical 10 Supplementary Problem 1: task-deleted event emission
    console.log(`[API] Delete response sent at ${new Date().toISOString()}`)
    res.status(200).json({ message: 'Task deleted successfully' })

    setImmediate(() => {
      taskEvents.emit('task-deleted', taskId)
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task ID format' })
    }
    return next(error)
  }
})

// ==================== PRACTICAL 13: AI API INTEGRATION WITH GRACEFUL DEGRADATION ====================
app.post('/api/ai/generate-description', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required for AI generation' })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY

    // If an external AI API key is configured, call external AI service
    if (apiKey) {
      if (process.env.GEMINI_API_KEY) {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Generate a concise, professional 2-sentence task description for: "${title}". Be actionable. No quotes or markdown headings.`,
                    },
                  ],
                },
              ],
            }),
          }
        )
        const geminiData = await geminiRes.json()
        const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        if (text) {
          return res.status(200).json({
            description: text,
            provider: 'Google Gemini 1.5 Flash',
            fallback: false,
          })
        }
      } else if (process.env.OPENAI_API_KEY) {
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: `Write a concise 2-sentence actionable task description for: "${title}". No quotes.`,
              },
            ],
            max_tokens: 120,
          }),
        })
        const openaiData = await openaiRes.json()
        const text = openaiData?.choices?.[0]?.message?.content?.trim()
        if (text) {
          return res.status(200).json({
            description: text,
            provider: 'OpenAI GPT-4o-mini',
            fallback: false,
          })
        }
      }
    }

    // Graceful Fallback (Responsible AI & Offline Reliability):
    // If no key or external API is offline/rate-limited, generate realistic context-aware task description
    const lower = title.toLowerCase()
    let fallbackText = `Execute required action items for "${title}" adhering to standard specifications, testing guidelines, and quality benchmarks.`
    if (lower.includes('study') || lower.includes('learn') || lower.includes('read') || lower.includes('prepare')) {
      fallbackText = `Review syllabus modules, summarize core theoretical concepts, and practice coding implementations for ${title}.`
    } else if (lower.includes('bug') || lower.includes('fix') || lower.includes('error') || lower.includes('issue')) {
      fallbackText = `Isolate root cause using logs, write regression unit tests, and deploy a verified code fix for ${title}.`
    } else if (lower.includes('deploy') || lower.includes('docker') || lower.includes('build') || lower.includes('ci')) {
      fallbackText = `Build container image, verify environment variables, run integration tests, and push release bundle for ${title}.`
    }

    return res.status(200).json({
      description: fallbackText,
      provider: 'AI Assistant (Graceful Degradation Mode)',
      fallback: true,
      disclaimer: 'Generated via fallback intelligent assistant to guarantee 100% uptime.',
    })
  } catch (error) {
    console.error('AI Generation Error:', error.message)
    // Graceful degradation required by Practical 13: core app never crashes on 3rd-party failure
    return res.status(200).json({
      description: `Complete all required action items and milestones for "${req.body?.title || 'this task'}".`,
      provider: 'Fallback Recovery Mode',
      fallback: true,
      errorHandled: true,
    })
  }
})

// Global Error Handling Middleware
app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500).json({
    message: 'Internal server error',
    error: err.message,
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
