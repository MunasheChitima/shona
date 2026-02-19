const fs = require('fs');
const path = require('path');

// Common fixes for ESLint errors
const fixes = [
  {
    pattern: /const\s+(\w+)\s*=\s*require\([^)]+\);\s*const\s+\1\s*=\s*new\s+\1\(\);/g,
    replacement: 'const $1 = require(\'$1\');\nconst $1Instance = new $1();'
  },
  {
    pattern: /\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\n/g,
    replacement: ''
  },
  {
    pattern: /\/\/ eslint-disable-next-line @typescript-eslint\/no-explicit-any\n/g,
    replacement: ''
  }
];

// Files to fix
const filesToFix = [
  'app/api/exercises/[id]/route.ts',
  'app/api/lessons/route.ts', 
  'app/api/progress/route.ts',
  'app/page.tsx',
  'app/login/page.tsx',
  'app/learn/page.tsx',
  'app/profile/page.tsx',
  'app/quests/page.tsx'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove unused error variables
    content = content.replace(/catch\s*\(\s*error\s*\)\s*{\s*console\.error\(error\);\s*}/g, 
      'catch (error) {\n    console.error(\'Error:\', error);\n  }');
    
    // Fix unused variables by prefixing with underscore
    content = content.replace(/const\s+(\w+)\s*=\s*require\([^)]+\);\s*\/\/ eslint-disable-line @typescript-eslint\/no-unused-vars/g,
      'const _$1 = require(\'$1\'); // eslint-disable-line @typescript-eslint/no-unused-vars');
    
    // Fix any types with unknown
    content = content.replace(/: any/g, ': unknown');
    
    // Fix unescaped entities
    content = content.replace(/'/g, '&apos;');
    content = content.replace(/"/g, '&quot;');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Fix each file
filesToFix.forEach(fixFile);

console.log('🎉 ESLint fixes applied!'); 