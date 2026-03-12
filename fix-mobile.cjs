const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

if (!css.includes('.img-main-mobile-fix')) {
    css += `
/* Mobile Image Fill */
@media (max-width: 768px) {
  .img-main {
    max-width: 100% !important;
    width: 100% !important;
    border-radius: 16px !important;
    margin-bottom: 2rem !important;
  }
}
`;
    fs.writeFileSync('style.css', css, 'utf8');
    console.log('Added mobile fix to style.css');
}
