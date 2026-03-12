const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

const regex = /\/\* Scale Posters on Mobile to Hide White Borders \*\/[\s\S]*?\}\s*\}/g;

const newMobileCSS = `
/* Scale Posters on Mobile to Hide White Borders */
@media (max-width: 900px) {
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
        /* Enlarge layout width so height scales automatically without clipping */
        width: 155% !important;
        max-width: 155% !important;
        height: auto !important;
        
        /* Shift the enlarged image left to hide the white left-margin */
        margin-left: -27.5% !important;
        margin-right: -27.5% !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        
        object-fit: contain !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        transform: none !important;
    }
}
`;

if (css.match(regex)) {
    css = css.replace(regex, newMobileCSS);
    fs.writeFileSync('style.css', css, 'utf8');
    console.log('Replaced with 900px max-width scaling technique');
} else {
    console.log('Regex did not match. Appending new CSS.');
    css += newMobileCSS;
    fs.writeFileSync('style.css', css, 'utf8');
}
