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

// Copia index.html come 404.html per il routing di GitHub Pages (dopo il build)
const indexPath = path.join(__dirname, 'dist', 'index.html');
const notFoundPath = path.join(__dirname, 'dist', '404.html');
if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('✓ Creato 404.html per GitHub Pages routing');
}
