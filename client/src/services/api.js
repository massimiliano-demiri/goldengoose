import axios from 'axios'

// Per ora usiamo sempre i file JSON statici per evitare problemi con il backend
const isDev = false // Disabilitato: import.meta.env.MODE === 'development'
const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// In produzione usa dati locali dalla build
const getDataPath = (file) => {
  if (isDev) return null
  // Usa il base URL di Vite per il path corretto
  const base = import.meta.env.BASE_URL || '/goldengoose/'
  return `${base}data/${file}`
}

export const getProducts = async (params = {}) => {
  if (!isDev) {
    const response = await axios.get(getDataPath('products.json'))
    let products = response.data
    
    // Assicurati che products sia un array
    if (!Array.isArray(products)) {
      console.error('Products is not an array:', products)
      return []
    }
    
    // Applica filtri
    if (params.category) {
      products = products.filter(p => p.category === params.category)
    }
    if (params.search) {
      const search = params.search.toLowerCase()
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      )
    }
    if (params.inStock === 'true') {
      products = products.filter(p => p.inStock)
    }
    
    return products
  }
  const response = await api.get('/products', { params })
  return response.data
}

export const getProduct = async (id) => {
  if (!isDev) {
    const products = await getProducts()
    return products.find(p => p.id === id)
  }
  const response = await api.get(`/products/${id}`)
  return response.data
}

export const getCategories = async () => {
  if (!isDev) {
    const products = await getProducts()
    if (!Array.isArray(products)) {
      console.error('Products is not an array in getCategories:', products)
      return []
    }
    return [...new Set(products.map(p => p.category))].sort()
  }
  const response = await api.get('/categories')
  return response.data
}

export const getPrices = async () => {
  if (!isDev) {
    const response = await axios.get(getDataPath('prices.json'))
    return response.data
  }
  const response = await api.get('/prices')
  return response.data
}

export const updatePrice = async (id, priceData) => {
  if (!isDev) throw new Error('Cannot update in production')
  const response = await api.put(`/prices/${id}`, priceData)
  return response.data
}

export const updateAllPrices = async (prices) => {
  if (!isDev) throw new Error('Cannot update in production')
  const response = await api.put('/prices', prices)
  return response.data
}

export const refreshData = async () => {
  if (!isDev) throw new Error('Cannot refresh in production')
  const response = await api.post('/refresh')
  return response.data
}

export default api
