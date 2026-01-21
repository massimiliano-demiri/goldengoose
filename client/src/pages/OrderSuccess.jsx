import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getOrder } from '../services/orders'
import './OrderSuccess.css'

function OrderSuccess() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (orderId) {
      const orderData = getOrder(orderId)
      if (orderData) {
        setOrder(orderData)
      }
    }
  }, [orderId])

  if (!order) {
    return (
      <div className="order-success-page fade-in">
        <div className="order-not-found">
          <h2>Ordine non trovato</h2>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Torna ai prodotti
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="order-success-page fade-in">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Ordine confermato!</h1>
        <p className="success-message">
          Grazie per il tuo ordine. Riceverai un'email di conferma all'indirizzo {order.customer.email}
        </p>

        <div className="order-details">
          <div className="detail-row">
            <span className="detail-label">ID Ordine</span>
            <span className="detail-value">{order.id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Data</span>
            <span className="detail-value">
              {new Date(order.createdAt).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Totale</span>
            <span className="detail-value total">€{order.total.toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Metodo di pagamento</span>
            <span className="detail-value payment-method">
              {order.payment.method === 'paypal' ? 'PayPal' : 'Carta di credito'}
              <span className="test-badge">Test</span>
            </span>
          </div>
        </div>

        <div className="order-items">
          <h3>Articoli ordinati</h3>
          {order.items.map(item => (
            <div key={item.id} className="order-item">
              <img src={item.image} alt={item.name} />
              <div className="item-info">
                <p className="item-name">{item.name}</p>
                <p className="item-qty">Quantità: {item.quantity}</p>
              </div>
              <p className="item-price">€{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="shipping-info">
          <h3>Indirizzo di spedizione</h3>
          <p>{order.customer.name}</p>
          <p>{order.customer.address}</p>
          <p>{order.customer.postalCode} {order.customer.city}</p>
          <p>{order.customer.country}</p>
          <p className="contact">{order.customer.phone}</p>
          <p className="contact">{order.customer.email}</p>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate('/orders')} className="btn-secondary">
            Visualizza ordini
          </button>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Continua acquisti
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
