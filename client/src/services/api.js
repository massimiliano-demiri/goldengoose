import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params })
  return response.data
}

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`)
  return response.data
}

export const getCategories = async () => {
  const response = await api.get('/categories')
  return response.data
}

export const getPrices = async () => {
  const response = await api.get('/prices')
  return response.data
}

export const updatePrice = async (id, priceData) => {
  const response = await api.put(`/prices/${id}`, priceData)
  return response.data
}

export const updateAllPrices = async (prices) => {
  const response = await api.put('/prices', prices)
  return response.data
}

export const refreshData = async () => {
  const response = await api.post('/refresh')
  return response.data
}

export default api
