import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getProduct } from '../services/api'
import './ProductDetail.css'

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='800'%20height='800'%20viewBox='0%200%20800%20800'%3E%3Crect%20width='100%25'%20height='100%25'%20fill='%23f3f4f6'/%3E%3Ctext%20x='50%25'%20y='50%25'%20dominant-baseline='middle'%20text-anchor='middle'%20fill='%239ca3af'%20font-family='Arial%2Csans-serif'%20font-size='32'%3ENo%20Image%3C/text%3E%3C/svg%3E"

const normalizeImageUrl = (url) => {
  if (typeof url !== 'string') return ''
  if (url.startsWith('//')) return `https:${url}`
  return url
}

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const productData = await getProduct(id)
      
      if (!productData) {
        setError('Prodotto non trovato')
        return
      }
      
      // Filtra immagini valide
      if (productData.images) {
        productData.images = productData.images.filter(img => {
          if (typeof img !== 'string') return false
          const url = img.toLowerCase()
          const invalidPatterns = ['logo', 'watermark', 'qrcode', '/avatar/', 'banner', 'icon',
                                  'wechat', 'whatsapp', 'contact', '_logo', 'yupoo_logo']
          const hasInvalidPattern = invalidPatterns.some(pattern => url.includes(pattern))
          const isValidFormat = /\.(jpg|jpeg|png|webp)$/i.test(url)
          const hasSmallSize = /\d+x\d+/.test(url) && parseInt(url.match(/(\d+)x\d+/)?.[1] || '999') < 200
          
          return !hasInvalidPattern && isValidFormat && !hasSmallSize
        })
      }
      
      setProduct(productData)
      setError(null)
    } catch (err) {
      setError('Prodotto non trovato')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product && product.inStock) {
      addToCart(product, quantity)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  if (loading) return <div className="loading">Caricamento...</div>
  if (error) return <div className="error">{error}</div>
  if (!product) return <div className="error">Prodotto non trovato</div>

  const finalPrice = product.discount 
    ? product.price * (1 - product.discount / 100)
    : product.price

  return (
    <div className="product-detail-page fade-in">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Indietro
      </button>

      <div className="product-detail-container">
        <div className="product-gallery">
          <div className="main-image-container">
            <img 
              src={(product.images && normalizeImageUrl(product.images[selectedImage])) || FALLBACK_IMAGE}
              alt={product.name}
              className="main-image"
              loading="eager"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = FALLBACK_IMAGE
              }}
            />
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="thumbnails">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={normalizeImageUrl(img) || FALLBACK_IMAGE}
                  alt={`${product.name} ${index + 1}`}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = FALLBACK_IMAGE
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info-detail">
          <span className="product-category-badge">{product.category}</span>
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-price-detail">
            {product.discount > 0 ? (
              <>
                <span className="price-original-large">€{product.price.toFixed(2)}</span>
                <span className="price-final-large">€{finalPrice.toFixed(2)}</span>
                <span className="discount-badge-large">-{product.discount}%</span>
              </>
            ) : (
              <span className="price-final-large">€{product.price.toFixed(2)}</span>
            )}
          </div>

          <div className="stock-status">
            {product.inStock ? (
              <span className="in-stock">✓ Disponibile</span>
            ) : (
              <span className="out-of-stock">✗ Non disponibile</span>
            )}
          </div>

          <div className="product-description">
            <h3>Descrizione</h3>
            <p>{product.description}</p>
          </div>

          {product.inStock && (
            <div className="quantity-selector">
              <label>Quantità:</label>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button 
              onClick={handleAddToCart}
              disabled={!product.inStock || addedToCart}
              className="add-to-cart-btn"
            >
              {addedToCart ? '✓ Aggiunto al carrello' : product.inStock ? 'Aggiungi al carrello' : 'Non disponibile'}
            </button>
          </div>

          <div className="product-meta">
            <p><strong>ID Prodotto:</strong> {product.id}</p>
            <p><strong>Valuta:</strong> {product.currency}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
