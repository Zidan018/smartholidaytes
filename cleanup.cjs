const fs = require('fs');
const content = fs.readFileSync('generate-pages.cjs', 'utf8');
const lines = content.split('\n');

// Find orphan block: starts at line 162 (idx 161) which is 'const tabs = pkgs.map'
// and ends somewhere around line 300 where the old function body ends
// Look for two consecutive blank lines or next section comment as boundary
let startDel = -1, endDel = -1;

for (let i = 158; i < 310; i++) {
    const line = lines[i] ? lines[i].replace(/\r/g, '') : '';
    if (line.trim().startsWith('const tabs = pkgs.map') && startDel === -1) {
        startDel = i - 1; // include blank line before
        console.log('Found start at line', i + 1, ':', JSON.stringify(lines[i]));
    }
    if (startDel !== -1 && i > startDel + 10) {
        const nextLine = lines[i + 1] ? lines[i + 1].replace(/\r/, '').trim() : '';
        // End when we hit the DATA section comment or const declaration
        if (nextLine.startsWith('// ==') || nextLine.startsWith('const fs') || nextLine.startsWith('const domesticPackages')) {
            endDel = i;
            console.log('Found end at line', i + 1, ':', JSON.stringify(lines[i]));
            break;
        }
    }
}

if (startDel > 0 && endDel > startDel) {
    const newLines = [...lines.slice(0, startDel), ...lines.slice(endDel + 1)];
    fs.writeFileSync('generate-pages.cjs', newLines.join('\n'), 'utf8');
    console.log('Deleted lines', startDel + 1, '-', endDel + 1);
    console.log('New total:', newLines.length, 'lines');
} else {
    console.log('Block not found. startDel=', startDel, 'endDel=', endDel);
    // Print lines 160-175 for debug:
    for (let i = 158; i < 175; i++) {
        console.log('Line', i + 1, ':', JSON.stringify(lines[i]));
    }
}
