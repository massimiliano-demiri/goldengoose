import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'data');
const destDir = path.join(__dirname, 'public', 'data');

const YUPOO_REFERER = 'https://golden-goose.x.yupoo.com/';

const normalizeRemoteUrl = (url) => {
  if (typeof url !== 'string') return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const getExtFromContentType = (contentType) => {
  const type = (contentType || '').split(';')[0].trim().toLowerCase();
  if (type === 'image/jpeg') return '.jpg';
  if (type === 'image/png') return '.png';
  if (type === 'image/webp') return '.webp';
  return '';
};

const cacheImagesEnabled = () => process.env.CACHE_IMAGES === '1';

async function downloadImageTo(url, outFilePath, referer) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      'referer': referer || YUPOO_REFERER
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(path.dirname(outFilePath), { recursive: true });
  fs.writeFileSync(outFilePath, buffer);

  return response.headers.get('content-type') || '';
}

async function cacheProductImages(products) {
  const maxPerProduct = parseInt(process.env.CACHE_IMAGES_MAX || '1', 10);
  const concurrency = Math.max(1, parseInt(process.env.CACHE_IMAGES_CONCURRENCY || '8', 10));
  const imagesRoot = path.join(__dirname, 'public', 'images');
  fs.mkdirSync(imagesRoot, { recursive: true });

  let queued = [];
  let totalDownloaded = 0;
  let totalSkipped = 0;

  const runBatch = async () => {
    const batch = queued.splice(0, concurrency);
    if (batch.length === 0) return;
    await Promise.allSettled(batch.map(fn => fn()));
  };

  for (const product of products) {
    if (!product || !product.id || !Array.isArray(product.images) || product.images.length === 0) continue;

    const referer = typeof product.url === 'string' ? product.url : YUPOO_REFERER;
    const limit = Math.min(maxPerProduct, product.images.length);

    for (let i = 0; i < limit; i++) {
      const original = normalizeRemoteUrl(product.images[i]);
      if (!original || original.startsWith('data:')) continue;

      queued.push(async () => {
        try {
          const urlObj = new URL(original);
          const urlExt = path.extname(urlObj.pathname) || '';
          const folder = path.join(imagesRoot, String(product.id));
          const baseName = String(i + 1);
          const tentativePath = path.join(folder, `${baseName}${urlExt || '.img'}`);

          // Skip if already exists
          if (fs.existsSync(tentativePath)) {
            product.images[i] = `images/${product.id}/${path.basename(tentativePath)}`;
            totalSkipped++;
            return;
          }

          const contentType = await downloadImageTo(original, tentativePath, referer);
          let finalPath = tentativePath;

          // If extension is unknown, rename based on content-type
          if (urlExt === '' || urlExt === '.img') {
            const ext = getExtFromContentType(contentType) || '.png';
            finalPath = path.join(folder, `${baseName}${ext}`);
            if (finalPath !== tentativePath) {
              // If we wrote to .img, move to proper extension
              if (fs.existsSync(tentativePath) && !fs.existsSync(finalPath)) {
                fs.renameSync(tentativePath, finalPath);
              }
            }
          }

          product.images[i] = `images/${product.id}/${path.basename(finalPath)}`;
          totalDownloaded++;
        } catch (err) {
          // Leave the original URL if caching fails
          // (frontend will still try remote URLs)
        }
      });

      if (queued.length >= concurrency) {
        await runBatch();
      }
    }
  }

  while (queued.length > 0) {
    await runBatch();
  }

  console.log(`✓ Immagini cache: scaricate=${totalDownloaded}, già presenti=${totalSkipped}`);
}

// Crea la directory di destinazione
fs.mkdirSync(destDir, { recursive: true });

// Copia tutti i file JSON dalla root data/ a public/data/
fs.readdirSync(srcDir).forEach(file => {
  if (file.endsWith('.json')) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copiato ${file} in public/data/`);
  }
});

console.log('✓ Dati sincronizzati in public/data/ per il build');

// (Opzionale) Cache delle immagini Yupoo in public/images per evitare hotlink block
if (cacheImagesEnabled()) {
  try {
    const productsPath = path.join(destDir, 'products.json');
    if (fs.existsSync(productsPath)) {
      const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      if (Array.isArray(products)) {
        console.log('Caching immagini prodotti in public/images...');
        await cacheProductImages(products);
        fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
        console.log('✓ products.json aggiornato con path immagini locali');
      }
    }
  } catch (err) {
    console.warn('⚠️ Cache immagini fallita:', err?.message || err);
  }
}

// Crea un 404.html per GitHub Pages che redirige i deep-link verso HashRouter
const indexPath = path.join(__dirname, 'dist', 'index.html');
const notFoundPath = path.join(__dirname, 'dist', '404.html');
if (fs.existsSync(indexPath)) {
  const base = '/goldengoose/';
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Redirecting…</title>
    <script>
      (function () {
        var base = ${JSON.stringify(base)};
        var path = window.location.pathname || '/';
        var search = window.location.search || '';
        var hash = window.location.hash || '';
        // If we already have a hash route, just go to app root
        if (hash && hash.startsWith('#/')) {
          window.location.replace(window.location.origin + base + hash + search);
          return;
        }
        // Strip base from pathname to build the hash route
        var route = '/';
        if (path.startsWith(base)) {
          route = '/' + path.slice(base.length).replace(/^\/+/, '');
        }
        // Normalize to "/" for empty route
        if (route === '//') route = '/';
        window.location.replace(window.location.origin + base + '#'+ route + search);
      })();
    </script>
  </head>
  <body>
    <p>Redirecting…</p>
  </body>
</html>`;

  fs.writeFileSync(notFoundPath, html, 'utf8');
  console.log('✓ Creato 404.html (redirect) per GitHub Pages routing');
}
