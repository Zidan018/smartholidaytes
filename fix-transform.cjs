const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

const regex = /\/\* Scale Posters on Mobile to Hide White Borders \*\/[\s\S]*?\}\s*\}/g;

const newMobileCSS = `
/* Scale Posters on Mobile to Hide White Borders */
@media (max-width: 768px) {
    .overview-images {
        overflow: hidden;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        margin-bottom: 24px;
        background: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .img-main {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        object-fit: contain !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        /* Scale up to push the baked-in white borders out of the hidden overflow bounds */
        transform: scale(1.45) !important;
    }
}
`;

if (css.match(regex)) {
    css = css.replace(regex, newMobileCSS);
    fs.writeFileSync('style.css', css, 'utf8');
    console.log('Replaced with CSS transform scale technique');
} else {
    // Fallback if regex failed
    console.log('Regex did not match. Appending new CSS.');
    css += newMobileCSS;
    fs.writeFileSync('style.css', css, 'utf8');
}
