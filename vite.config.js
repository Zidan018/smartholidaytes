import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get all .html files in the root directory
const getHtmlFiles = () => {
    const files = fs.readdirSync(__dirname);
    const htmlFiles = files.filter(file => file.endsWith('.html'));

    const input = {};
    htmlFiles.forEach(file => {
        const name = file.replace('.html', '');
        input[name] = resolve(__dirname, file);
    });

    return input;
};

export default defineConfig({
    build: {
        rollupOptions: {
            input: getHtmlFiles()
        }
    }
});
