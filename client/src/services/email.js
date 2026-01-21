import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''

// Inizializza EmailJS
if (PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY)
}

export const sendOrderConfirmation = async (orderData) => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS not configured. Skipping email.')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const templateParams = {
      order_id: orderData.orderId,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      order_total: `€${orderData.total.toFixed(2)}`,
      order_items: orderData.items.map(item => 
        `${item.name} x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`
      ).join('\n'),
      order_date: new Date().toLocaleDateString('it-IT'),
      tracking_link: `${window.location.origin}/orders/${orderData.orderId}`
    }

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams
    )

    return { success: true, response }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error.text }
  }
}

export const isEmailConfigured = () => {
  return !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)
}
