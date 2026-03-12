const fs = require('fs');
const path = require('path');

// Fix: Add gap between description section (with photo) and rundown section
// Description section has padding-bottom:0 and rundown has padding-top:0
// We change padding-bottom:0 to padding-bottom:40px on description section

const fixes = [
    {
        old: 'style="padding-bottom:0; padding-top: 60px;"',
        new: 'style="padding-bottom:40px; padding-top: 60px;"'
    },
    {
        old: 'style="padding-bottom:0;padding-top: 60px;"',
        new: 'style="padding-bottom:40px; padding-top: 60px;"'
    },
    {
        old: 'style="padding-top:0;"', // rundown section - keep some top padding
        new: 'style="padding-top:0; padding-bottom:20px;"'
    }
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const fix of fixes) {
        content = content.replaceAll(fix.old, fix.new);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${path.basename(filePath)}`);
    }
}

// Process all HTML files
const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !['dist', 'node_modules'].includes(f));

files.forEach(file => {
    const fullPath = path.join(dir, file);
    processFile(fullPath);
});

console.log('Done.');
