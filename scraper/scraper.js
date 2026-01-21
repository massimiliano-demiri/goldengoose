const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'https://golden-goose.x.yupoo.com';
const ALBUMS_URL = `${BASE_URL}/albums`;

// Funzione per ottenere tutti gli album da una pagina
async function getAlbumsFromPage(page = 1) {
  try {
    console.log(`Scaricamento pagina ${page}...`);
    const response = await axios.get(`${ALBUMS_URL}?page=${page}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const albums = [];
    
    // Trova tutti i link agli album
    $('a[href*="/albums/"]').each((i, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().trim();
      
      // Filtra solo i link agli album specifici (con ID)
      if (href && href.match(/\/albums\/\d+/)) {
        const albumId = href.match(/\/albums\/(\d+)/)[1];
        const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
        
        // Estrai il nome del prodotto dal testo
        if (text && text.length > 10) {
          albums.push({
            id: albumId,
            url: fullUrl,
            name: text.replace(/\[\d+ photos?\]/gi, '').trim()
          });
        }
      }
    });
    
    return albums;
  } catch (error) {
    console.error(`Errore nel recupero della pagina ${page}:`, error.message);
    return [];
  }
}

// Funzione per filtrare immagini non valide (logo, watermark, ecc)
function isValidProductImage(url) {
  const urlLower = url.toLowerCase();
  
  // Pattern più aggressivi per bloccare loghi Yupoo
  const invalidPatterns = [
    'searchicon',
    'qrcode',
    'logo',
    'watermark',
    '/avatar/',
    'yupoo.com/contact',
    '.svg',
    'data:image',
    'banner',
    'icon',
    'placeholder',
    'loading',
    // Pattern specifici per logo Yupoo
    'yupoo_logo',
    'contact_',
    '_logo',
    'wechat',
    'whatsapp',
    'album_cover'
  ];
  
  // Verifica che non contenga pattern non validi
  const isInvalid = invalidPatterns.some(pattern => 
    urlLower.includes(pattern.toLowerCase())
  );
  
  // Verifica che sia un'immagine valida
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(url);
  
  // Verifica dimensione minima nell'URL (spesso i loghi hanno dimensioni piccole)
  const hasSmallSize = /\d+x\d+/.test(url) && parseInt(url.match(/(\d+)x\d+/)?.[1] || '999') < 200;
  
  return !isInvalid && isImage && !hasSmallSize;
}

// Funzione per ottenere i dettagli di un album (immagini)
async function getAlbumDetails(albumUrl) {
  try {
    const response = await axios.get(albumUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const images = [];
    
    // Trova tutte le immagini nell'album
    $('img[src*="yupoo"]').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src && isValidProductImage(src)) {
        // Cerca di ottenere l'URL dell'immagine ad alta risoluzione
        let highResSrc = src;
        
        // Yupoo spesso usa pattern come .jpg!thumbnail -> .jpg per alta risoluzione
        highResSrc = highResSrc.replace(/!thumbnail.*$/, '');
        highResSrc = highResSrc.replace(/!small.*$/, '');
        
        // Verifica nuovamente dopo la pulizia
        if (isValidProductImage(highResSrc)) {
          images.push(highResSrc);
        }
      }
    });
    
    // Rimuove duplicati e limita a massimo 6 immagini per performance
    const uniqueImages = [...new Set(images)];
    return uniqueImages.slice(0, 6);
  } catch (error) {
    console.error(`Errore nel recupero dell'album ${albumUrl}:`, error.message);
    return [];
  }
}

// Funzione principale di scraping
async function scrapeAllProducts(maxPages = 5) {
  console.log('Inizio scraping...');
  const allProducts = [];
  
  // Scarica gli album da più pagine
  for (let page = 1; page <= maxPages; page++) {
    const albums = await getAlbumsFromPage(page);
    console.log(`Trovati ${albums.length} prodotti nella pagina ${page}`);
    
    for (const album of albums) {
      // Per evitare di essere bloccati, aggiungi un piccolo delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Processando: ${album.name}`);
      const images = await getAlbumDetails(album.url);
      
      allProducts.push({
        id: album.id,
        name: album.name,
        description: album.name, // Puoi migliorare questo
        images: images,
        category: detectCategory(album.name),
        url: album.url
      });
    }
    
    // Delay tra le pagine
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return allProducts;
}

// Funzione per rilevare la categoria dal nome
function detectCategory(name) {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes("women's") || nameLower.includes('women')) return 'Donna';
  if (nameLower.includes("men's") || nameLower.includes('men')) return 'Uomo';
  if (nameLower.includes('super-star') || nameLower.includes('superstar')) return 'Super-Star';
  if (nameLower.includes('ball star')) return 'Ball Star';
  if (nameLower.includes('dad-star')) return 'Dad-Star';
  if (nameLower.includes('hi star') || nameLower.includes('mid star')) return 'Hi/Mid Star';
  if (nameLower.includes('slide')) return 'Slide';
  
  return 'Altri';
}

// Esegui lo scraping
async function main() {
  try {
    const products = await scrapeAllProducts(5); // Scarica 5 pagine
    
    console.log(`\nTotale prodotti trovati: ${products.length}`);
    
    // Salva i dati
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const outputPath = path.join(dataDir, 'products.json');
    await fs.writeFile(outputPath, JSON.stringify(products, null, 2));
    
    console.log(`\nDati salvati in: ${outputPath}`);
    
    // Crea anche un file di prezzi di esempio
    const prices = {};
    products.forEach(product => {
      prices[product.id] = {
        price: Math.floor(Math.random() * 200) + 100, // Prezzo random tra 100-300
        currency: 'EUR',
        inStock: true
      };
    });
    
    const pricesPath = path.join(dataDir, 'prices.json');
    await fs.writeFile(pricesPath, JSON.stringify(prices, null, 2));
    
    console.log(`Prezzi salvati in: ${pricesPath}`);
    
  } catch (error) {
    console.error('Errore durante lo scraping:', error);
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  main();
}

module.exports = { scrapeAllProducts, getAlbumDetails };
