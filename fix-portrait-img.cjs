const fs = require('fs');
const path = require('path');

const stylePath = path.join(__dirname, 'style.css');
let content = fs.readFileSync(stylePath, 'utf8');

// Remove fixed height and fix object-fit to prevent portrait image cropping
const oldImgMain = `.img-main {
  width: 100%;
  height: 500px;
  object-fit: cover;
  transition: transform 0.5s ease;
}`;

const newImgMain = `.img-main {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  transition: transform 0.5s ease;
}`;

// Try LF then CRLF
if (content.includes(oldImgMain)) {
  content = content.replace(oldImgMain, newImgMain);
  fs.writeFileSync(stylePath, content, 'utf8');
  console.log('Fixed using LF');
} else {
  const oldCRLF = oldImgMain.replace(/\n/g, '\r\n');
  const newCRLF = newImgMain.replace(/\n/g, '\r\n');
  if (content.includes(oldCRLF)) {
    content = content.replace(oldCRLF, newCRLF);
    fs.writeFileSync(stylePath, content, 'utf8');
    console.log('Fixed using CRLF');
  } else {
    console.log('ERROR: Could not find target block');
  }
}
