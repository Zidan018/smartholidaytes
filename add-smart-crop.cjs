const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// Add the smart crop CSS for mobile
if (!css.includes('/* Smart Crop for Posters */')) {
    css += `
/* Smart Crop for Posters on Mobile */
@media (max-width: 768px) {
    .img-main {
        width: 100% !important;
        aspect-ratio: 3 / 4 !important;
        object-fit: cover !important;
        height: auto !important;
        border-radius: 16px !important;
        margin-bottom: 24px !important;
    }
}
`;
    fs.writeFileSync('style.css', css, 'utf8');
    console.log('Added smart crop CSS');
} else {
    console.log('CSS already exists');
}
