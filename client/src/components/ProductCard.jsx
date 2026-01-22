import { Link } from 'react-router-dom'
import './ProductCard.css'

function ProductCard({ product }) {
  // Filtra immagini valide (esclude loghi Yupoo, watermark, etc)
  const validImages = product.images?.filter(img => {
    const url = img.toLowerCase()
    const invalidPatterns = ['logo', 'watermark', 'qrcode', '/avatar/', 'banner', 'icon', 
                            'wechat', 'whatsapp', 'contact', '_logo', 'yupoo_logo']
    const hasInvalidPattern = invalidPatterns.some(pattern => url.includes(pattern))
    const isValidFormat = /\.(jpg|jpeg|png|webp)$/i.test(url)
    const hasSmallSize = /\d+x\d+/.test(url) && parseInt(url.match(/(\d+)x\d+/)?.[1] || '999') < 200
    
    return !hasInvalidPattern && isValidFormat && !hasSmallSize
  }) || []

  const imageUrl = validImages.length > 0
    ? validImages[0] 
    : 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=No+Image'

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
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Image+Error'
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
