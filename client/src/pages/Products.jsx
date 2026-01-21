import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getProducts, getCategories } from '../services/api'
import './Products.css'

function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    inStock: searchParams.get('inStock') === 'true'
  })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [filters])

  const loadCategories = async () => {
    try {
      const categories = await getCategories()
      setCategories(categories)
    } catch (err) {
      console.error('Errore nel caricamento delle categorie:', err)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.category) params.category = filters.category
      if (filters.search) params.search = filters.search
      if (filters.inStock) params.inStock = 'true'
      
      const products = await getProducts(params)
      setProducts(products)
      setError(null)
    } catch (err) {
      setError('Errore nel caricamento dei prodotti')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Aggiorna URL
    const params = new URLSearchParams()
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.inStock) params.set('inStock', 'true')
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({ category: '', search: '', inStock: false })
    setSearchParams({})
  }

  if (loading) return <div className="loading">Caricamento prodotti...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="products-page fade-in">
      <div className="products-header">
        <h1>I Nostri Prodotti</h1>
        <p>Esplora la collezione completa di sneakers Golden Goose</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Cerca prodotti..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="category-select"
          >
            <option value="">Tutte le categorie</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            />
            Solo disponibili
          </label>
        </div>

        {(filters.category || filters.search || filters.inStock) && (
          <button onClick={clearFilters} className="clear-filters-btn">
            Cancella filtri
          </button>
        )}
      </div>

      <div className="products-info">
        <p>Trovati {products.length} prodotti</p>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <p>Nessun prodotto trovato con i filtri selezionati</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Products
