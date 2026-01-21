import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home fade-in">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">GOLDEN GOOSE</h1>
          <p className="hero-subtitle">Luxury Italian Sneakers</p>
          <p className="hero-description">
            Scopri la collezione esclusiva di sneakers artigianali Golden Goose.
            Design unico, qualità premium, stile inconfondibile.
          </p>
          <Link to="/products" className="cta-button">
            Esplora la Collezione
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Design Unico</h3>
          <p>Ogni scarpa è un'opera d'arte con dettagli distintivi e lavorazione artigianale premium</p>
        </div>
        <div className="feature-card">
          <h3>Made in Italy</h3>
          <p>Artigianalità italiana di altissima qualità con materiali selezionati</p>
        </div>
        <div className="feature-card">
          <h3>Stile Iconico</h3>
          <p>Il distressed look distintivo che ha conquistato il mondo della moda</p>
        </div>
      </section>

      <section className="categories-preview">
        <h2>Collezioni Popolari</h2>
        <div className="categories-grid">
          <Link to="/products?category=Super-Star" className="category-item">
            <div className="category-name">Super-Star</div>
          </Link>
          <Link to="/products?category=Ball Star" className="category-item">
            <div className="category-name">Ball Star</div>
          </Link>
          <Link to="/products?category=Dad-Star" className="category-item">
            <div className="category-name">Dad-Star</div>
          </Link>
          <Link to="/products?category=Donna" className="category-item">
            <div className="category-name">Donna</div>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
