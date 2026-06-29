const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('alert(')) {
        console.log(`Processing ${fullPath}`);
        
        // Simple heuristic: if it contains "success" or "copied", use toast.success. else use toast.error
        content = content.replace(/alert\((.*?)\)/g, (match, p1) => {
           if (p1.toLowerCase().includes('success') || p1.toLowerCase().includes('copied')) {
               return `toast.success(${p1})`;
           } else {
               return `toast.error(${p1})`;
           }
        });

        // Add import if not present
        if (!content.includes('import { toast }') && !content.includes('import toast ')) {
           const lines = content.split('\n');
           // Find the last import line or just put it after 'use client'
           let insertIdx = 0;
           for (let i=0; i<lines.length; i++) {
               if (lines[i].startsWith('import ')) {
                   insertIdx = i + 1;
               }
           }
           if (insertIdx === 0 && lines[0].includes('"use client"')) {
               insertIdx = 1;
           }
           lines.splice(insertIdx, 0, 'import { toast } from "react-hot-toast";');
           content = lines.join('\n');
        }

        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir(srcDir);
console.log('Done replacing alerts!');
