import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getProduct } from '../services/api'
import './ProductDetail.css'

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
      const response = await getProduct(id)
      const productData = response.data
      
      // Filtra immagini valide
      if (productData.images) {
        productData.images = productData.images.filter(img => {
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
              src={product.images && product.images[selectedImage] || 'https://via.placeholder.com/800x800/f3f4f6/9ca3af?text=No+Image'}
              alt={product.name}
              className="main-image"
              loading="eager"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x800/f3f4f6/9ca3af?text=Image+Error'
              }}
            />
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="thumbnails">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150x150/f3f4f6/9ca3af?text=Error'
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
