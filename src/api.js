const BASE_URL = 'http://localhost:5000'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}))
  if (response.status === 401) {
    // Supplementary Problem 2: Token expiry / 401 handling
    localStorage.removeItem('token')
  }
  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }
  return data
}

export const registerUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse(response)
}

export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse(response)
}

export const getMe = async () => {
  const response = await fetch(`${BASE_URL}/me`, {
    headers: {
      ...getAuthHeaders(),
    },
  })
  return handleResponse(response)
}

export const getTasks = async () => {
  const response = await fetch(`${BASE_URL}/tasks`, {
    headers: {
      ...getAuthHeaders(),
    },
  })
  return handleResponse(response)
}

export const createTask = async (taskData) => {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(taskData),
  })
  return handleResponse(response)
}

export const updateTask = async (id, updateData) => {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updateData),
  })
  return handleResponse(response)
}

export const deleteTask = async (id) => {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  })
  return handleResponse(response)
}

export const getCacheStatsApi = async () => {
  const response = await fetch(`${BASE_URL}/cache/stats`)
  return handleResponse(response)
}

export const flushCacheApi = async () => {
  const response = await fetch(`${BASE_URL}/cache/flush`, {
    method: 'DELETE',
  })
  return handleResponse(response)
}
