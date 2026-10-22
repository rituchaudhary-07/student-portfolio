import { EventEmitter } from 'events'

// Step 1 of Practical 10: Dedicated EventEmitter module
class TaskEvents extends EventEmitter {}

const taskEvents = new TaskEvents()

export default taskEvents
