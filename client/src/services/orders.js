// Genera un ID ordine univoco
export const generateOrderId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 9)
  return `ORD-${timestamp}-${random}`.toUpperCase()
}

// Salva ordine in localStorage
export const saveOrder = (order) => {
  try {
    const orders = getOrders()
    orders.unshift(order)
    localStorage.setItem('orders', JSON.stringify(orders))
    return true
  } catch (error) {
    console.error('Error saving order:', error)
    return false
  }
}

// Ottieni tutti gli ordini
export const getOrders = () => {
  try {
    const orders = localStorage.getItem('orders')
    return orders ? JSON.parse(orders) : []
  } catch (error) {
    console.error('Error loading orders:', error)
    return []
  }
}

// Ottieni singolo ordine
export const getOrder = (orderId) => {
  const orders = getOrders()
  return orders.find(order => order.id === orderId)
}

// Crea nuovo ordine
export const createOrder = (cart, customerInfo, paymentMethod, paymentId = null) => {
  const order = {
    id: generateOrderId(),
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.discount 
        ? item.price * (1 - item.discount / 100) 
        : item.price,
      quantity: item.quantity,
      image: item.images?.[0] || '',
      category: item.category
    })),
    total: cart.reduce((sum, item) => {
      const price = item.discount 
        ? item.price * (1 - item.discount / 100) 
        : item.price
      return sum + (price * item.quantity)
    }, 0),
    customer: {
      name: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      address: customerInfo.address,
      city: customerInfo.city,
      postalCode: customerInfo.postalCode,
      country: customerInfo.country
    },
    payment: {
      method: paymentMethod,
      status: 'completed',
      id: paymentId,
      date: new Date().toISOString()
    },
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  saveOrder(order)
  return order
}

// Stati ordine
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

// Traduzioni stato
export const getStatusLabel = (status) => {
  const labels = {
    pending: 'In attesa',
    confirmed: 'Confermato',
    processing: 'In elaborazione',
    shipped: 'Spedito',
    delivered: 'Consegnato',
    cancelled: 'Annullato'
  }
  return labels[status] || status
}

// Colori stato
export const getStatusColor = (status) => {
  const colors = {
    pending: '#f59e0b',
    confirmed: '#10b981',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#059669',
    cancelled: '#ef4444'
  }
  return colors[status] || '#6b7280'
}
