const fs = require('fs');
const path = require('path');

function getRelativePath(filePath, targetPath) {
    const fileDir = path.dirname(filePath);
    let relPath = path.relative(fileDir, targetPath);
    if (!relPath.startsWith('.')) {
        relPath = './' + relPath;
    }
    // Remove .ts extension if it gets added, though targetPath doesn't have it
    return relPath;
}

const srcDir = path.join(__dirname, 'src');
const target = path.join(__dirname, 'src', 'environments', 'environment');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath);
        } else if (filePath.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            
            const search1 = "'src/environments/environment'";
            const search2 = '"src/environments/environment"';
            
            if (content.includes(search1) || content.includes(search2)) {
                const relPath = getRelativePath(filePath, target);
                // ensure posix separators
                const posixRelPath = relPath.split(path.sep).join(path.posix.sep);
                
                content = content.split(search1).join(`'${posixRelPath}'`);
                content = content.split(search2).join(`'${posixRelPath}'`);
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Fixed ${filePath} -> ${getRelativePath(filePath, target).split(path.sep).join(path.posix.sep)}`);
            }
        }
    }
}

walk(srcDir);
