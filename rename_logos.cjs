const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk('d:/LOMBA ABYAN/FINLIT/src').filter(f => f.endsWith('.jsx'));
const svgIcon = '><svg viewBox="0 0 24 24" style={{ width: "55%", height: "55%", fill: "none", stroke: "currentColor", strokeWidth: 2 }}><circle cx="12" cy="12" r="3" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)" /></svg><';

let changed = 0;
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;

    content = content.replace(/>F</g, svgIcon);
    content = content.replace(/Fin<span style=\{\{ color: 'var\(--color-accent\)' \}\}>Lit<\/span>/g, '<span style={{ letterSpacing: "0.05em" }}>NEMOS</span>');
    content = content.replace(/Fin<span style=\{\{ color: 'var\(--color-login-accent\)' \}\}>Lit<\/span>/g, '<span style={{ letterSpacing: "0.05em" }}>NEMOS</span>');
    content = content.replace(/linear-gradient\(135deg, var\(--color-primary\), #7C5CFC\)/g, 'linear-gradient(135deg, #134B5B, #1B7A8B)');
    content = content.replace(/linear-gradient\(135deg, var\(--color-login-accent\), #7C5CFC\)/g, 'linear-gradient(135deg, #134B5B, #1B7A8B)');

    if (original !== content) {
        fs.writeFileSync(f, content);
        changed++;
        console.log('Updated', f);
    }
});
console.log('Total files updated:', changed);
