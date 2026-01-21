import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getProducts } from '../services/api'
import './Home.css'

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [stats, setStats] = useState({ total: 0, categories: 0, inStock: 0 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const products = await getProducts()
      
      // Filtra prodotti con immagini valide (no loghi Yupoo)
      const validProducts = products.filter(p => {
        if (!p.images || p.images.length === 0 || !p.inStock) return false
        
        const hasValidImage = p.images.some(img => {
          const url = img.toLowerCase()
          const invalidPatterns = ['logo', 'watermark', 'qrcode', '/avatar/', 'banner', 'icon',
                                  'wechat', 'whatsapp', 'contact', '_logo', 'yupoo_logo', 'album_cover']
          const hasInvalidPattern = invalidPatterns.some(pattern => url.includes(pattern))
          const isValidFormat = /\.(jpg|jpeg|png|webp)$/i.test(url)
          const hasSmallSize = /\d+x\d+/.test(url) && parseInt(url.match(/(\d+)x\d+/)?.[1] || '999') < 200
          
          return !hasInvalidPattern && isValidFormat && !hasSmallSize
        })
        
        return hasValidImage
      })
      
      // Filtra immagini valide per ogni prodotto
      const productsWithValidImages = validProducts.map(p => ({
        ...p,
        images: p.images.filter(img => {
          const url = img.toLowerCase()
          const invalidPatterns = ['logo', 'watermark', 'qrcode', '/avatar/', 'banner', 'icon',
                                  'wechat', 'whatsapp', 'contact', '_logo', 'yupoo_logo', 'album_cover']
          const hasInvalidPattern = invalidPatterns.some(pattern => url.includes(pattern))
          const isValidFormat = /\.(jpg|jpeg|png|webp)$/i.test(url)
          const hasSmallSize = /\d+x\d+/.test(url) && parseInt(url.match(/(\d+)x\d+/)?.[1] || '999') < 200
          
          return !hasInvalidPattern && isValidFormat && !hasSmallSize
        })
      }))
      
      const shuffled = productsWithValidImages.sort(() => 0.5 - Math.random())
      setFeaturedProducts(shuffled.slice(0, 3))
      
      const categories = [...new Set(products.map(p => p.category))].length
      const inStock = products.filter(p => p.inStock).length
      setStats({ total: products.length, categories, inStock })
    } catch (err) {
      console.error('Errore caricamento:', err)
    }
  }

  return (
    <div className="home fade-in">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">GOLDEN GOOSE</h1>
          <p className="hero-subtitle">Luxury Italian Sneakers</p>
          <p className="hero-description">
            Scopri la collezione esclusiva di sneakers artigianali Golden Goose.
            Design unico, qualità premium, stile inconfondibile.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Prodotti</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.categories}</span>
              <span className="stat-label">Categorie</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.inStock}</span>
              <span className="stat-label">Disponibili</span>
            </div>
          </div>
          <Link to="/products" className="cta-button">
            Esplora la Collezione
          </Link>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="featured-section">
          <h2>In Evidenza</h2>
          <div className="featured-grid">
            {featuredProducts.map(product => (
              <Link 
                key={product.id}
                to={`/product/${product.id}`}
                className="featured-card"
              >
                <div className="featured-image">
                  <img src={product.images[0]} alt={product.name} />
                  {product.discount > 0 && (
                    <span className="discount-tag">-{product.discount}%</span>
                  )}
                </div>
                <div className="featured-info">
                  <h3>{product.name}</h3>
                  <div className="featured-price">
                    {product.discount > 0 ? (
                      <>
                        <span className="price-old">€{product.price.toFixed(2)}</span>
                        <span className="price-new">€{(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="price-new">€{product.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="features">
        <div className="feature-card">
          <h3>Design Unico</h3>
          <p>Ogni scarpa è un'opera d'arte con dettagli distintivi e lavorazione artigianale premium</p>
        </div>
        <div className="feature-card">
          <h3>Made in Italy</h3>
          <p>Artigianalità italiana di altissima qualità con materiali selezionati</p>
        </div>
        <div className="feature-card">
          <h3>Stile Iconico</h3>
          <p>Il distressed look distintivo che ha conquistato il mondo della moda</p>
        </div>
      </section>

      <section className="categories-preview">
        <h2>Collezioni Popolari</h2>
        <div className="categories-grid">
          <Link to="/products?category=Super-Star" className="category-item">
            <div className="category-name">Super-Star</div>
          </Link>
          <Link to="/products?category=Ball Star" className="category-item">
            <div className="category-name">Ball Star</div>
          </Link>
          <Link to="/products?category=Dad-Star" className="category-item">
            <div className="category-name">Dad-Star</div>
          </Link>
          <Link to="/products?category=Donna" className="category-item">
            <div className="category-name">Donna</div>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
