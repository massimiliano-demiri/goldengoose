import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Cart.css'

function Cart() {
  const navigate = useNavigate()
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart()

  const handleCheckout = () => {
    if (cart.length === 0) return
    navigate('/checkout')
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page fade-in">
        <div className="empty-cart">
          <h2>Il tuo carrello è vuoto</h2>
          <p>Aggiungi prodotti al carrello per procedere all'acquisto</p>
          <button onClick={() => navigate('/products')} className="continue-shopping-btn">
            Continua lo shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page fade-in">
      <h1>Il Tuo Carrello</h1>

      <div className="cart-container">
        <div className="cart-items">
          {cart.map(item => {
            const finalPrice = item.discount 
              ? item.price * (1 - item.discount / 100)
              : item.price

            return (
              <div key={item.id} className="cart-item">
                <img 
                  src={item.images && item.images[0] || 'https://via.placeholder.com/120x120?text=No+Image'}
                  alt={item.name}
                  className="cart-item-image"
                  onClick={() => navigate(`/products/${item.id}`)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/120x120?text=No+Image'
                  }}
                />
                
                <div className="cart-item-info">
                  <h3 
                    className="cart-item-name"
                    onClick={() => navigate(`/products/${item.id}`)}
                  >
                    {item.name}
                  </h3>
                  <span className="cart-item-category">{item.category}</span>
                  
                  <div className="cart-item-price">
                    {item.discount > 0 && (
                      <span className="original-price">€{item.price.toFixed(2)}</span>
                    )}
                    <span className="final-price">€{finalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="qty-btn"
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    €{(finalPrice * item.quantity).toFixed(2)}
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="remove-btn"
                    title="Rimuovi dal carrello"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="cart-summary">
          <h2>Riepilogo Ordine</h2>
          
          <div className="summary-row">
            <span>Articoli:</span>
            <span>{cart.reduce((total, item) => total + item.quantity, 0)}</span>
          </div>

          <div className="summary-row">
            <span>Subtotale:</span>
            <span>€{getCartTotal().toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Spedizione:</span>
            <span>Gratis</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row total">
            <span>Totale:</span>
            <span>€{getCartTotal().toFixed(2)}</span>
          </div>

          <button onClick={handleCheckout} className="checkout-btn">
            Procedi al Checkout
          </button>

          <button onClick={() => navigate('/products')} className="continue-btn">
            Continua lo shopping
          </button>

          <button onClick={clearCart} className="clear-cart-btn">
            Svuota carrello
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart
