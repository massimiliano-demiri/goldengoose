import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'data');
const destDir = path.join(__dirname, 'public', 'data');

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
