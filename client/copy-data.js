import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'data');
const destDir = path.join(__dirname, 'dist', 'data');

// Crea la directory di destinazione
fs.mkdirSync(destDir, { recursive: true });

// Copia tutti i file JSON
fs.readdirSync(srcDir).forEach(file => {
  if (file.endsWith('.json')) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copiato: ${file}`);
  }
});

console.log('✓ Dati copiati con successo in dist/data');

// Copia index.html come 404.html per il routing di GitHub Pages
const indexPath = path.join(__dirname, 'dist', 'index.html');
const notFoundPath = path.join(__dirname, 'dist', '404.html');
fs.copyFileSync(indexPath, notFoundPath);
console.log('✓ Creato 404.html per GitHub Pages routing');
