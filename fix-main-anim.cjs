const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'main.js');
let content = fs.readFileSync(mainPath, 'utf8');

// Use regex to ignore line ending differences
const targetRegex = /  \/\/ Stagger hero animations immediately[\s\S]*?  const heroElements = document\.querySelectorAll\('\.hero \.fade-in-up'\);[\s\S]*?  heroElements\.forEach\(\(el, index\) => \{[\s\S]*?    setTimeout\(\(\) => \{[\s\S]*?      el\.classList\.add\('visible'\);[\s\S]*?    \}, index \* 200 \+ 100\); \/\/ 100ms initial delay, then stagger[\s\S]*?  \}\);/m;

const replacementStr = `  // Trigger hero animations immediately (CSS handles the stagger via .delay-* classes)
  const heroElements = document.querySelectorAll('.hero .fade-in-up');
  heroElements.forEach(el => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 50);
  });`;

if (targetRegex.test(content)) {
    content = content.replace(targetRegex, replacementStr);
    fs.writeFileSync(mainPath, content, 'utf8');
    console.log('Successfully fixed main.js hero animations');
} else {
    console.log('Error: Could not find the exact regex to replace in main.js');
}
