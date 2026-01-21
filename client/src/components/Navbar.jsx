import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Navbar.css'

function Navbar() {
  const { getCartCount } = useCart()
  const cartCount = getCartCount()

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h1>GOLDEN GOOSE</h1>
        </Link>
        
        <div className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Prodotti</Link>
          <Link to="/orders" className="nav-link">Ordini</Link>
          <Link to="/admin" className="nav-link">Admin</Link>
          <Link to="/cart" className="nav-link cart-link">
            Carrello
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
