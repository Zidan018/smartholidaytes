const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove inline styles from any img tag that has class="img-main"
    content = content.replace(/(<img[^>]*class=["'][^"']*img-main[^"']*["'][^>]*?)style=["'][^"']*["']([^>]*>)/gi, '$1$2');

    // Also specifically catch the user's manual jogja tags even if class is omitted
    content = content.replace(/(<img[^>]*src=["']\.\/aset\/jogja\.jpeg["'][^>]*?)style=["'][^"']*["']([^>]*>)/gi, '$1$2');

    // If the image doesn't have class="img-main", add it!
    content = content.replace(/(<img[^>]*src=["']\.\/aset\/jogja\.jpeg["'])(?![^>]*class=["'][^"']*img-main[^"']*["'])([^>]*>)/gi, '$1 class="img-main" $2');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Cleaned: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file === 'node_modules' || file === 'dist' || file === '.git' || file === 'aset') continue;
            walkDir(fullPath);
        } else if (file.endsWith('.html') || file.endsWith('.cjs')) {
            processFile(fullPath);
        }
    }
}

walkDir(__dirname);
console.log('Done stripping inline styles.');
