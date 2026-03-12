const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'generate-pages.cjs');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Replace the backLink template in generate-pages.cjs
const oldBackLink = /\$\{backLink \? `<p style="margin-bottom:12px;font-size:0.9rem;opacity:0.8;">◀ <a href="\$\{backLink\}" style="color:#f29f05;font-weight:600;">\$\{backLabel\}<\/a><\/p>` : ''\}/g;
const newBackLink = `\${backLink ? \`<p style="margin-bottom:12px;font-size:0.95rem;opacity:0.9;"><a href="./" style="color:#f29f05;font-weight:600;text-decoration:none;">🏠 Home</a> <span style="margin: 0 8px;color:#fff;">/</span> <a href="\${backLink}" style="color:#f29f05;font-weight:600;text-decoration:none;">\${backLabel}</a></p>\` : ''}`;

if (scriptContent.match(oldBackLink)) {
    scriptContent = scriptContent.replace(oldBackLink, newBackLink);
    fs.writeFileSync(scriptPath, scriptContent, 'utf8');
    console.log('Updated generate-pages.cjs');
} else {
    console.log('Could not find exact template string in generate-pages.cjs, might be manually changed.');
}

// Update existing HTML files
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Use regex to locate the existing backlink paragraph
    // Example: <p style="margin-bottom:12px;font-size:0.9rem;opacity:0.8;">◀ <a href="/domestic.html" style="color:#f29f05;font-weight:600;">Paket Domestik</a></p>
    const htmlRegex = /<p[^>]*mb-4[^>]*>◀\s*<a href="([^"]+)"[^>]*>([^<]+)<\/a><\/p>|<p[^>]*>◀\s*<a href="([^"]+)"[^>]*>([^<]+)<\/a><\/p>/g;
    
    content = content.replace(htmlRegex, (match, link1, label1, link2, label2) => {
        const link = link1 || link2;
        const label = label1 || label2;
        return `<p style="margin-bottom:12px;font-size:0.95rem;opacity:0.9;"><a href="./" style="color:#f29f05;font-weight:600;text-decoration:none;">🏠 Home</a> <span style="margin: 0 8px;color:#fff;">/</span> <a href="${link}" style="color:#f29f05;font-weight:600;text-decoration:none;">${label}</a></p>`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated HTML in: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file === 'node_modules' || file === 'dist' || file === '.git' || file === 'aset') continue;
            walkDir(fullPath);
        } else if (file.endsWith('.html')) {
            processFile(fullPath);
        }
    }
}

walkDir(__dirname);
console.log('Done adding breadcrumbs.');
