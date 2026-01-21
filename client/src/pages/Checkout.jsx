import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { createOrder } from '../services/orders'
import { sendOrderConfirmation, isEmailConfigured } from '../services/email'
import './Checkout.css'

function Checkout() {
  const navigate = useNavigate()
  const { cart, clearCart, getCartTotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Italia'
  })

  const [paymentMethod, setPaymentMethod] = useState('paypal')

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || 
        !formData.address || !formData.city || !formData.postalCode) {
      setError('Compilare tutti i campi obbligatori')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Email non valida')
      return false
    }

    return true
  }

  const handlePayPalPayment = async () => {
    // Simulazione pagamento PayPal (modalità test)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          paymentId: `PAYPAL-TEST-${Date.now()}`
        })
      }, 1500)
    })
  }

  const handleStripePayment = async () => {
    // Simulazione pagamento Stripe (modalità test)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          paymentId: `STRIPE-TEST-${Date.now()}`
        })
      }, 1500)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    if (cart.length === 0) {
      setError('Il carrello è vuoto')
      return
    }

    setLoading(true)

    try {
      // Processa pagamento
      let paymentResult
      if (paymentMethod === 'paypal') {
        paymentResult = await handlePayPalPayment()
      } else {
        paymentResult = await handleStripePayment()
      }

      if (!paymentResult.success) {
        throw new Error('Pagamento non riuscito')
      }

      // Crea ordine
      const order = createOrder(cart, formData, paymentMethod, paymentResult.paymentId)

      // Invia email di conferma (se configurato)
      if (isEmailConfigured()) {
        await sendOrderConfirmation({
          orderId: order.id,
          customerName: formData.name,
          customerEmail: formData.email,
          total: order.total,
          items: order.items
        })
      }

      // Pulisci carrello
      clearCart()

      // Reindirizza a pagina successo
      navigate(`/order-success/${order.id}`)

    } catch (err) {
      console.error('Checkout error:', err)
      setError('Errore durante il pagamento. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-checkout">
          <h2>Carrello vuoto</h2>
          <p>Aggiungi prodotti al carrello per procedere al checkout</p>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Vai ai prodotti
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page fade-in">
      <h1>Checkout</h1>

      <div className="checkout-container">
        <div className="checkout-form-section">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2>Informazioni di spedizione</h2>
              
              <div className="form-group">
                <label htmlFor="name">Nome completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Mario Rossi"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="mario.rossi@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Telefono *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Indirizzo *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Via Roma 123"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">Città *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Milano"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="postalCode">CAP *</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    placeholder="20100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="country">Paese *</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Italia">Italia</option>
                  <option value="Svizzera">Svizzera</option>
                  <option value="San Marino">San Marino</option>
                  <option value="Vaticano">Vaticano</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h2>Metodo di pagamento</h2>
              
              <div className="payment-methods">
                <label className={`payment-option ${paymentMethod === 'paypal' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <strong>PayPal</strong>
                    <span className="payment-badge">Test Mode</span>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === 'stripe' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <strong>Carta di credito</strong>
                    <span className="payment-badge">Test Mode</span>
                  </div>
                </label>
              </div>

              <p className="test-mode-notice">
                Modalità test: nessun pagamento reale verrà effettuato
              </p>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-checkout"
              disabled={loading}
            >
              {loading ? 'Elaborazione...' : `Paga €${getCartTotal().toFixed(2)}`}
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h2>Riepilogo ordine</h2>
          
          <div className="summary-items">
            {cart.map(item => {
              const finalPrice = item.discount 
                ? item.price * (1 - item.discount / 100)
                : item.price

              return (
                <div key={item.id} className="summary-item">
                  <img src={item.images?.[0]} alt={item.name} />
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Quantità: {item.quantity}</p>
                  </div>
                  <p className="item-price">€{(finalPrice * item.quantity).toFixed(2)}</p>
                </div>
              )
            })}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotale</span>
              <span>€{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Spedizione</span>
              <span>Gratis</span>
            </div>
            <div className="summary-row total">
              <span>Totale</span>
              <span>€{getCartTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
