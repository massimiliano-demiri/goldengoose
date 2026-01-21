const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Percorsi ai file di dati
const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');
const PRICES_FILE = path.join(__dirname, '..', 'data', 'prices.json');

// Cache in memoria
let productsCache = null;
let pricesCache = null;

// Funzioni helper per caricare i dati
async function loadProducts() {
  if (!productsCache) {
    try {
      const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
      productsCache = JSON.parse(data);
    } catch (error) {
      console.error('Errore nel caricamento dei prodotti:', error.message);
      productsCache = [];
    }
  }
  return productsCache;
}

async function loadPrices() {
  if (!pricesCache) {
    try {
      const data = await fs.readFile(PRICES_FILE, 'utf-8');
      pricesCache = JSON.parse(data);
    } catch (error) {
      console.error('Errore nel caricamento dei prezzi:', error.message);
      pricesCache = {};
    }
  }
  return pricesCache;
}

async function savePrices(prices) {
  try {
    await fs.writeFile(PRICES_FILE, JSON.stringify(prices, null, 2));
    pricesCache = prices;
    return true;
  } catch (error) {
    console.error('Errore nel salvataggio dei prezzi:', error.message);
    return false;
  }
}

// Funzione per invalidare la cache
function invalidateCache() {
  productsCache = null;
  pricesCache = null;
}

// ROUTES

// GET /api/products - Ottieni tutti i prodotti con prezzi
app.get('/api/products', async (req, res) => {
  try {
    const products = await loadProducts();
    const prices = await loadPrices();
    
    // Query parameters per filtri
    const { category, search, minPrice, maxPrice, inStock } = req.query;
    
    let filteredProducts = products.map(product => ({
      ...product,
      ...(prices[product.id] || { price: 0, currency: 'EUR', inStock: false })
    }));
    
    // Applica filtri
    if (category) {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
    }
    
    if (inStock === 'true') {
      filteredProducts = filteredProducts.filter(p => p.inStock === true);
    }
    
    res.json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero dei prodotti'
    });
  }
});

// GET /api/products/:id - Ottieni un singolo prodotto
app.get('/api/products/:id', async (req, res) => {
  try {
    const products = await loadProducts();
    const prices = await loadPrices();
    
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato'
      });
    }
    
    const productWithPrice = {
      ...product,
      ...(prices[product.id] || { price: 0, currency: 'EUR', inStock: false })
    };
    
    res.json({
      success: true,
      data: productWithPrice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero del prodotto'
    });
  }
});

// GET /api/categories - Ottieni tutte le categorie
app.get('/api/categories', async (req, res) => {
  try {
    const products = await loadProducts();
    const categories = [...new Set(products.map(p => p.category))];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero delle categorie'
    });
  }
});

// GET /api/prices - Ottieni tutti i prezzi
app.get('/api/prices', async (req, res) => {
  try {
    const prices = await loadPrices();
    
    res.json({
      success: true,
      data: prices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero dei prezzi'
    });
  }
});

// PUT /api/prices/:id - Aggiorna il prezzo di un prodotto
app.put('/api/prices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price, currency, inStock, discount } = req.body;
    
    const prices = await loadPrices();
    
    prices[id] = {
      price: parseFloat(price) || 0,
      currency: currency || 'EUR',
      inStock: inStock !== undefined ? inStock : true,
      discount: parseFloat(discount) || 0
    };
    
    const saved = await savePrices(prices);
    
    if (saved) {
      res.json({
        success: true,
        message: 'Prezzo aggiornato con successo',
        data: prices[id]
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Errore nel salvataggio del prezzo'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nell\'aggiornamento del prezzo'
    });
  }
});

// PUT /api/prices - Aggiorna tutti i prezzi
app.put('/api/prices', async (req, res) => {
  try {
    const newPrices = req.body;
    
    const saved = await savePrices(newPrices);
    
    if (saved) {
      res.json({
        success: true,
        message: 'Prezzi aggiornati con successo'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Errore nel salvataggio dei prezzi'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nell\'aggiornamento dei prezzi'
    });
  }
});

// POST /api/refresh - Ricarica i dati (invalida cache)
app.post('/api/refresh', (req, res) => {
  invalidateCache();
  res.json({
    success: true,
    message: 'Cache invalidata, i dati saranno ricaricati al prossimo accesso'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server attivo',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint non trovato'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Errore interno del server'
  });
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`🚀 Server avviato sulla porta ${PORT}`);
  console.log(`📍 API disponibili su http://localhost:${PORT}/api`);
});

module.exports = app;
