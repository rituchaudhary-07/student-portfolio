export const validateTaskInput = (req, res, next) => {
  const { title } = req.body

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: [{ field: 'title', message: 'Title is required and cannot be empty' }],
    })
  }

  next()
}

export const validateUserRegister = (req, res, next) => {
  const { email, password } = req.body

  if (!email || !email.trim()) {
    return res.status(400).json({ message: 'Email is required' })
  }

  if (!password || password.length < 4) {
    return res.status(400).json({ message: 'Password must be at least 4 characters long' })
  }

  next()
}
