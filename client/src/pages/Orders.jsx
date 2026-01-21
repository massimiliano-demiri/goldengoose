import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, getStatusLabel, getStatusColor } from '../services/orders'
import './Orders.css'

function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = () => {
    const allOrders = getOrders()
    setOrders(allOrders)
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page fade-in">
        <h1>I miei ordini</h1>
        <div className="no-orders">
          <p>Non hai ancora effettuato ordini</p>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Scopri i prodotti
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page fade-in">
      <h1>I miei ordini</h1>
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Ordine {order.id}</h3>
                <p className="order-date">
                  {new Date(order.createdAt).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div 
                className="order-status-badge"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {getStatusLabel(order.status)}
              </div>
            </div>

            <div className="order-items">
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Quantità: {item.quantity}</p>
                  </div>
                  <p className="item-price">€{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="order-total">
                <span>Totale</span>
                <span className="total-amount">€{order.total.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => navigate(`/order-success/${order.id}`)}
                className="btn-view-details"
              >
                Dettagli
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
