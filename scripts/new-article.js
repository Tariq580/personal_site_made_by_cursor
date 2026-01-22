#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const WRITING_DIR = path.join(__dirname, '../content/writing');

// Get title from command line argument
const title = process.argv[2];

if (!title) {
  console.error('❌ Please provide a title:');
  console.error('   npm run new "My Article Title"');
  process.exit(1);
}

// Generate filename from title
const today = new Date();
const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const filename = `${dateStr}-${slug}.md`;
const filePath = path.join(WRITING_DIR, filename);

// Check if file already exists
if (fs.existsSync(filePath)) {
  console.error(`❌ File already exists: ${filename}`);
  process.exit(1);
}

// Create markdown template
const template = `---
title: ${title}
date: ${dateStr}
---

Write your article here...
`;

// Write file
fs.writeFileSync(filePath, template);

console.log(`✅ Created new article: ${filename}`);
console.log(`\n📝 Edit the file:`);
console.log(`   ${filePath}\n`);
console.log(`🔨 Then build:`);
console.log(`   npm run build\n`);
