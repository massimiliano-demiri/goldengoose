import { Link } from 'react-router-dom'
import './ProductCard.css'

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='800'%20height='800'%20viewBox='0%200%20800%20800'%3E%3Crect%20width='100%25'%20height='100%25'%20fill='%23f3f4f6'/%3E%3Ctext%20x='50%25'%20y='50%25'%20dominant-baseline='middle'%20text-anchor='middle'%20fill='%239ca3af'%20font-family='Arial%2Csans-serif'%20font-size='32'%3ENo%20Image%3C/text%3E%3C/svg%3E"

const normalizeImageUrl = (url) => {
  if (typeof url !== 'string') return ''
  if (url.startsWith('//')) return `https:${url}`
  return url
}

function ProductCard({ product }) {
  // Filtra immagini valide (esclude loghi Yupoo, watermark, etc)
  const validImages = product.images?.filter(img => {
    if (typeof img !== 'string') return false
    const url = img.toLowerCase()
    const invalidPatterns = ['logo', 'watermark', 'qrcode', '/avatar/', 'banner', 'icon', 
                            'wechat', 'whatsapp', 'contact', '_logo', 'yupoo_logo']
    const hasInvalidPattern = invalidPatterns.some(pattern => url.includes(pattern))
    const isValidFormat = /\.(jpg|jpeg|png|webp)$/i.test(url)
    const hasSmallSize = /\d+x\d+/.test(url) && parseInt(url.match(/(\d+)x\d+/)?.[1] || '999') < 200
    
    return !hasInvalidPattern && isValidFormat && !hasSmallSize
  }) || []

  const imageUrl = validImages.length > 0
    ? normalizeImageUrl(validImages[0])
    : FALLBACK_IMAGE

  const price = product.price || 0
  const discount = product.discount || 0
  const finalPrice = discount > 0 
    ? price * (1 - discount / 100)
    : price

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image-container">
        <img 
          src={imageUrl} 
          alt={product.name}
          className="product-image"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Prevent infinite error loops if fallback also fails
            e.currentTarget.onerror = null
            e.currentTarget.src = FALLBACK_IMAGE
          }}
        />
        {discount > 0 && (
          <span className="discount-badge">-{discount}%</span>
        )}
        {!product.inStock && (
          <span className="stock-badge">Esaurito</span>
        )}
      </div>
      
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-price">
          {discount > 0 ? (
            <>
              <span className="price-original">€{price.toFixed(2)}</span>
              <span className="price-final">€{finalPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="price-final">€{price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
