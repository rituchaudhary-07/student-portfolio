import taskEvents from './events.js'

// Step 2 & 5 of Practical 10: Register background notification listener with artificial delay
taskEvents.on('task-created', (task) => {
  console.log(
    `[Notification Worker] Event received for task: "${task.title}" at ${new Date().toISOString()}`
  )

  // Simulate slow asynchronous background processing (e.g., email notification, push alert)
  setTimeout(() => {
    console.log(
      `[Notification Worker] Background processing FINISHED for task: "${task.title}" at ${new Date().toISOString()}`
    )
  }, 2000)
})

// Supplementary Problem 1: Register task-deleted event listener
taskEvents.on('task-deleted', (taskId) => {
  console.log(
    `[Notification Worker] Task "${taskId}" was deleted. Cleanup notification logged at ${new Date().toISOString()}`
  )
})

// Supplementary Problem 2: Error event listener to catch any background listener exceptions
taskEvents.on('error', (err) => {
  console.error(`[Notification Error] Exception caught in background worker:`, err.message)
})

export default taskEvents
