# Golden Goose E-commerce

E-commerce completo con scraper per il catalogo Yupoo di Golden Goose, backend Express e frontend React.

## 🎯 Funzionalità

- **Scraper Yupoo**: Estrae automaticamente prodotti, immagini e dettagli dal catalogo
- **Backend API**: Server Express con endpoint RESTful per gestire prodotti e prezzi
- **Frontend React**: Interfaccia utente moderna e responsive
- **Sistema Prezzi**: Prezzi completamente configurabili tramite file JSON
- **Carrello**: Sistema completo di carrello acquisti con localStorage
- **Pannello Admin**: Gestione prezzi, sconti e disponibilità prodotti
- **Filtri Prodotti**: Ricerca, filtro per categoria e disponibilità

## 📁 Struttura Progetto

```
goldengoose/
├── scraper/              # Scraper per Yupoo
│   └── scraper.js
├── server/               # Backend Express
│   └── server.js
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Componenti React
│   │   ├── pages/        # Pagine applicazione
│   │   ├── context/      # Context API (Carrello)
│   │   └── services/     # API client
│   ├── package.json
│   └── vite.config.js
├── data/                 # Dati JSON
│   ├── products.json     # Prodotti estratti
│   └── prices.json       # Prezzi configurabili
└── package.json
```

## 🚀 Installazione

### 1. Clona il repository
```bash
cd c:\Users\mdemi\Documents\GitHub\goldengoose
```

### 2. Installa dipendenze backend
```bash
npm install
```

### 3. Installa dipendenze frontend
```bash
cd client
npm install
cd ..
```

## 📊 Utilizzo

### Step 1: Esegui lo Scraper
Estrai i prodotti dal catalogo Yupoo:

```bash
npm run scrape
```

Questo creerà:
- `data/products.json` - Catalogo prodotti con immagini
- `data/prices.json` - File prezzi iniziale

### Step 2: Avvia il Backend
```bash
npm run server
```

Il server sarà disponibile su `http://localhost:3001`

### Step 3: Avvia il Frontend
In un altro terminale:

```bash
cd client
npm run dev
```

L'app sarà disponibile su `http://localhost:3000`

### Oppure: Avvia Tutto Insieme
```bash
npm run dev
```

## 🔧 API Endpoints

### Prodotti
- `GET /api/products` - Lista prodotti (con filtri opzionali)
- `GET /api/products/:id` - Dettaglio prodotto
- `GET /api/categories` - Lista categorie

### Prezzi
- `GET /api/prices` - Tutti i prezzi
- `PUT /api/prices/:id` - Aggiorna prezzo singolo
- `PUT /api/prices` - Aggiorna tutti i prezzi

### Sistema
- `POST /api/refresh` - Ricarica dati (invalida cache)
- `GET /api/health` - Health check

## 💰 Configurazione Prezzi

Modifica `data/prices.json` per configurare prezzi:

```json
{
  "product_id": {
    "price": 250.00,
    "currency": "EUR",
    "inStock": true,
    "discount": 10
  }
}
```

Oppure usa il **Pannello Admin** su `/admin` per gestire prezzi tramite interfaccia grafica.

## 📱 Pagine Disponibili

- `/` - Home page
- `/products` - Catalogo prodotti
- `/products/:id` - Dettaglio prodotto
- `/cart` - Carrello
- `/admin` - Pannello amministrazione

## 🎨 Caratteristiche Frontend

- Design responsive e moderno
- Filtri prodotti avanzati
- Carrello con localStorage
- Gestione sconti e disponibilità
- Galleria immagini prodotto
- Sistema di routing React Router

## 🛠️ Tecnologie Utilizzate

### Backend
- Node.js
- Express.js
- Axios
- Cheerio (web scraping)
- CORS

### Frontend
- React 18
- React Router DOM
- Vite
- Axios
- Context API

## 📝 Note

- I prezzi sono **fittizi** e completamente configurabili
- Lo scraper rispetta delay tra richieste per non sovraccaricare il server
- Il carrello persiste in localStorage
- Il checkout è una demo (nessun pagamento reale)

## 🔄 Aggiornamento Dati

Per aggiornare il catalogo prodotti:

1. Esegui nuovamente lo scraper: `npm run scrape`
2. Ricarica i dati via API: `POST /api/refresh`
3. Oppure riavvia il server

## 🎯 Prossimi Sviluppi

- [ ] Autenticazione utenti
- [ ] Sistema ordini persistente
- [ ] Integrazione pagamenti
- [ ] Dashboard analytics
- [ ] Sistema recensioni
- [ ] Wishlist

## 📄 Licenza

MIT

## 👤 Autore

Massimiliano Demiri
