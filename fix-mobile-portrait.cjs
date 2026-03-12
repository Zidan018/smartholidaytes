const fs = require('fs');
const path = require('path');

const mobilePath = path.join(__dirname, 'mobile.css');
let content = fs.readFileSync(mobilePath, 'utf8');

// Fix 1: General .img-main on mobile
const old1 = `    .img-main {
        height: 220px !important;
    }`;
const new1 = `    .img-main {
        height: auto !important;
        max-height: 75vh;
        width: 100% !important;
        object-fit: contain !important;
    }`;

// Fix 2: Package page photo override
const old2 = `    /* === Package page photo === */
    .overview-images img.img-main {
        height: 220px !important;
        border-radius: 14px !important;
    }`;
const new2 = `    /* === Package page photo === */
    .overview-images img.img-main {
        height: auto !important;
        max-height: 75vh;
        border-radius: 14px !important;
    }`;

// Try LF then CRLF for fix 1
if (content.includes(old1)) {
    content = content.replace(old1, new1);
    console.log('Fix 1 applied (LF)');
} else {
    const old1CR = old1.replace(/\n/g, '\r\n');
    const new1CR = new1.replace(/\n/g, '\r\n');
    if (content.includes(old1CR)) {
        content = content.replace(old1CR, new1CR);
        console.log('Fix 1 applied (CRLF)');
    } else {
        console.log('Fix 1 FAILED - pattern not found');
    }
}

// Try LF then CRLF for fix 2
if (content.includes(old2)) {
    content = content.replace(old2, new2);
    console.log('Fix 2 applied (LF)');
} else {
    const old2CR = old2.replace(/\n/g, '\r\n');
    const new2CR = new2.replace(/\n/g, '\r\n');
    if (content.includes(old2CR)) {
        content = content.replace(old2CR, new2CR);
        console.log('Fix 2 applied (CRLF)');
    } else {
        console.log('Fix 2 FAILED - pattern not found');
    }
}

fs.writeFileSync(mobilePath, content, 'utf8');
console.log('Done writing mobile.css');
