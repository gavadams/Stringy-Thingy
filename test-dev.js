#!/usr/bin/env node

/**
 * Stringy-Thingy Development Testing Script
 * 
 * This script helps automate basic testing during development.
 * Run with: node test-dev.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Stringy-Thingy Development Testing Script');
console.log('==========================================\n');

// Test 1: Check if all required files exist
console.log('📁 Checking project structure...');

const requiredFiles = [
  'package.json',
  'tailwind.config.ts',
  'components.json',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/globals.css',
  'src/lib/utils.ts',
  'src/types/index.ts',
  'src/components/layout/Header.tsx',
  'src/components/layout/Footer.tsx',
  'src/app/(public)/shop/page.tsx',
  'src/app/(public)/login/page.tsx',
  'src/app/(public)/how-it-works/page.tsx',
  'src/app/(dashboard)/layout.tsx',
  'src/app/(dashboard)/dashboard/page.tsx',
  'src/app/(dashboard)/generate/page.tsx',
  'src/app/(dashboard)/my-generations/page.tsx',
  'src/app/(admin)/layout.tsx',
  'src/app/(admin)/admin/page.tsx',
  'src/app/(admin)/admin/codes/page.tsx',
  'src/app/(admin)/admin/orders/page.tsx',
  'src/app/(admin)/admin/products/page.tsx',
  'src/app/(admin)/admin/content/page.tsx',
  'src/app/(admin)/admin/frame-generator/page.tsx',
  'src/app/(admin)/admin/analytics/page.tsx',
  'src/app/api/health/route.ts'
];

let missingFiles = [];
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length === 0) {
  console.log('✅ All required files exist');
} else {
  console.log('❌ Missing files:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
}

// Test 2: Check package.json dependencies
console.log('\n📦 Checking dependencies...');

let missingDeps = [];
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'next',
    'react',
    'react-dom',
    'typescript',
    '@types/node',
    '@types/react',
    '@types/react-dom',
    'tailwindcss',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
    'lucide-react'
  ];

  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
      missingDeps.push(dep);
    }
  });

  if (missingDeps.length === 0) {
    console.log('✅ All required dependencies are installed');
  } else {
    console.log('❌ Missing dependencies:');
    missingDeps.forEach(dep => console.log(`   - ${dep}`));
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Test 3: Check TypeScript configuration
console.log('\n🔧 Checking TypeScript configuration...');

try {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
    console.log('✅ TypeScript paths configured');
  } else {
    console.log('⚠️  TypeScript paths not configured');
  }
} catch (error) {
  console.log('❌ Error reading tsconfig.json:', error.message);
}

// Test 4: Check Tailwind configuration
console.log('\n🎨 Checking Tailwind configuration...');

try {
  const tailwindConfig = fs.readFileSync('tailwind.config.ts', 'utf8');
  if (tailwindConfig.includes('primary') && tailwindConfig.includes('secondary')) {
    console.log('✅ Custom Tailwind theme configured');
  } else {
    console.log('⚠️  Custom Tailwind theme not fully configured');
  }
} catch (error) {
  console.log('❌ Error reading tailwind.config.ts:', error.message);
}

// Test 5: Check component structure
console.log('\n🧩 Checking component structure...');

const uiComponents = [
  'src/components/ui/button.tsx',
  'src/components/ui/card.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/label.tsx',
  'src/components/ui/textarea.tsx',
  'src/components/ui/dropdown-menu.tsx',
  'src/components/ui/dialog.tsx',
  'src/components/ui/toast.tsx',
  'src/components/ui/tabs.tsx',
  'src/components/ui/accordion.tsx'
];

let missingComponents = [];
uiComponents.forEach(component => {
  if (!fs.existsSync(component)) {
    missingComponents.push(component);
  }
});

if (missingComponents.length === 0) {
  console.log('✅ All UI components exist');
} else {
  console.log('❌ Missing UI components:');
  missingComponents.forEach(component => console.log(`   - ${component}`));
}

// Test 6: Check for common issues
console.log('\n🔍 Checking for common issues...');

// Check if there are any console.log statements in production code
const checkForConsoleLogs = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('console.log')) {
      return true;
    }
  } catch (error) {
    // File doesn't exist or can't be read
  }
  return false;
};

let filesWithConsoleLogs = [];
const sourceFiles = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/components/layout/Header.tsx',
  'src/components/layout/Footer.tsx'
];

sourceFiles.forEach(file => {
  if (checkForConsoleLogs(file)) {
    filesWithConsoleLogs.push(file);
  }
});

if (filesWithConsoleLogs.length === 0) {
  console.log('✅ No console.log statements found in main files');
} else {
  console.log('⚠️  Files with console.log statements:');
  filesWithConsoleLogs.forEach(file => console.log(`   - ${file}`));
}

// Test 7: Check file sizes
console.log('\n📊 Checking file sizes...');

const checkFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
};

const largeFiles = [];
const filesToCheck = [
  'src/app/globals.css',
  'src/app/layout.tsx',
  'src/app/page.tsx'
];

filesToCheck.forEach(file => {
  const size = checkFileSize(file);
  if (size > 10000) { // 10KB
    largeFiles.push({ file, size });
  }
});

if (largeFiles.length === 0) {
  console.log('✅ No unusually large files found');
} else {
  console.log('⚠️  Large files detected:');
  largeFiles.forEach(({ file, size }) => {
    console.log(`   - ${file}: ${(size / 1024).toFixed(2)}KB`);
  });
}

// Summary
console.log('\n📋 Testing Summary');
console.log('==================');

const totalTests = 7;
let passedTests = 0;

if (missingFiles.length === 0) passedTests++;
if (missingDeps.length === 0) passedTests++;
if (fs.existsSync('tsconfig.json')) passedTests++;
if (fs.existsSync('tailwind.config.ts')) passedTests++;
if (missingComponents.length === 0) passedTests++;
if (filesWithConsoleLogs.length === 0) passedTests++;
if (largeFiles.length === 0) passedTests++;

console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! Project is ready for development.');
} else {
  console.log('\n⚠️  Some issues found. Please review the output above.');
}

console.log('\n📝 Next steps:');
console.log('1. Run "npm run dev" to start the development server');
console.log('2. Open http://localhost:3000 in your browser');
console.log('3. Test all pages and functionality');
console.log('4. Update TESTING_CHECKLIST.txt as you test');
console.log('5. Update CHANGELOG.md with any changes');

console.log('\n🔗 Useful commands:');
console.log('- npm run dev          # Start development server');
console.log('- npm run build        # Build for production');
console.log('- npm run lint         # Run ESLint');
console.log('- npm run type-check   # Run TypeScript check');
