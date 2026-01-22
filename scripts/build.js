#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const CONTENT_DIR = path.join(__dirname, '../content');
const TEMPLATE_FILE = path.join(__dirname, '../index.template.html');
const OUTPUT_FILE = path.join(__dirname, '../index.html');

// Read all markdown files from a directory
function readMarkdownFiles(dir) {
  const files = fs.readdirSync(dir);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(content);
      return {
        ...parsed.data,
        content: parsed.content,
        filename: file
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
}

// Generate article list for writing section
function generateWritingList(articles) {
  return articles.map((article, index) => `
  <div class="article-row"><span class="article-num">[${index + 1}]</span><span class="article-title">${article.title}</span><span class="article-date">${article.date}</span></div>`).join('');
}

// Generate individual article templates
function generateArticleTemplates(articles) {
  return articles.map((article, index) => {
    const html = marked(article.content);
    return `
    <!-- ARTICLE ${index + 1} -->
    <template id="tpl-article-${index + 1}">
<p class="cmd-echo">$ cat ~/writing/${article.filename.replace('.md', '.txt')}</p>
<article class="full-article">
  <h2>${article.title}</h2>
  <p class="article-meta">${new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  
  <div class="article-body">
    ${html}
  </div>
</article>
<p class="nav-hint">type 'writing' to go back · or enter another command</p>
    </template>`;
  }).join('\n');
}

// Generate key-value display for structured sections
function generateKVList(sections) {
  return sections.map(section => {
    const key = section.name;
    const value = section.items.map(item => {
      if (item.status) {
        return `${item.name} (${item.status})`;
      }
      if (item.author) {
        return item.name;
      }
      if (item.year) {
        return `${item.name} '${item.year.toString().slice(2)}`;
      }
      return item.name;
    }).join(', ');
    return `  <div class="kv-row"><span class="kv-key">${key}</span><span class="kv-val">${value}</span></div>`;
  }).join('\n');
}

// Generate detail templates for drill-down sections
function generateDetailTemplates(sectionName, sections) {
  return sections.map(section => {
    const safeName = section.name.replace(/\s+/g, '-').toLowerCase();
    const title = section.title || section.name.charAt(0).toUpperCase() + section.name.slice(1);
    
    const items = section.items.map(item => {
      let statusHtml = item.status ? `<span class="detail-status">[${item.status}]</span>` : '';
      if (item.author) {
        statusHtml = `<span class="detail-status">${item.author}</span>`;
      }
      if (item.year) {
        statusHtml = `<span class="detail-status">[${item.year}]</span>`;
      }
      
      return `  <div class="detail-item">
    <span class="detail-name">→ ${item.name}</span>${statusHtml ? '\n    ' + statusHtml : ''}
    <p class="detail-desc">${item.desc || ''}</p>
  </div>`;
    }).join('\n');

    return `
    <!-- ${sectionName.toUpperCase()} - ${section.name.toUpperCase()} -->
    <template id="tpl-${sectionName}-${safeName}">
<p class="cmd-echo">$ cat ~/${sectionName}/${safeName}.txt</p>
<h2># ${title}</h2>

<div class="detail-list">
${items}
</div>
<p class="nav-hint">type 'back' to return to ${sectionName} · or another command</p>
    </template>`;
  }).join('\n');
}

// Build the site
function build() {
  console.log('🔨 Building site...\n');

  // Read content files
  console.log('📖 Reading content files...');
  const articles = readMarkdownFiles(path.join(CONTENT_DIR, 'writing'));
  const nowData = matter(fs.readFileSync(path.join(CONTENT_DIR, 'now.md'), 'utf8')).data;
  const workData = matter(fs.readFileSync(path.join(CONTENT_DIR, 'work.md'), 'utf8')).data;
  const lifeData = matter(fs.readFileSync(path.join(CONTENT_DIR, 'life.md'), 'utf8')).data;
  const aboutData = matter(fs.readFileSync(path.join(CONTENT_DIR, 'about.md'), 'utf8')).data;
  const linksData = matter(fs.readFileSync(path.join(CONTENT_DIR, 'links.md'), 'utf8')).data;

  console.log(`  ✓ Found ${articles.length} articles`);
  console.log(`  ✓ Loaded now, work, life, about, links\n`);

  // Read template
  console.log('📝 Reading template...');
  let template = fs.readFileSync(TEMPLATE_FILE, 'utf8');
  console.log('  ✓ Template loaded\n');

  // Generate content
  console.log('⚙️  Generating templates...');
  
  // Writing section
  const writingList = generateWritingList(articles);
  const articleTemplates = generateArticleTemplates(articles);
  
  // Now section
  const nowKV = generateKVList(nowData.sections);
  const nowDetails = generateDetailTemplates('now', nowData.sections);
  
  // Work section
  const workKV = generateKVList(workData.sections);
  const workDetails = generateDetailTemplates('work', workData.sections);
  
  // Life section
  const lifeKV = generateKVList(lifeData.sections);
  const lifeDetails = generateDetailTemplates('life', lifeData.sections);
  
  // About section
  const aboutIntro = aboutData.intro.map(p => `  <p>${p}</p>`).join('\n');
  const aboutSiteKV = Object.entries(aboutData.site).map(([key, value]) =>
    `  <div class="kv-row"><span class="kv-key">${key}</span><span class="kv-val">${value}</span></div>`
  ).join('\n');
  const aboutContactKV = `  <div class="kv-row"><span class="kv-key">email</span><span class="kv-val"><a href="mailto:${aboutData.contact.email}">${aboutData.contact.email}</a></span></div>
  <div class="kv-row"><span class="kv-key">twitter</span><span class="kv-val"><a href="${aboutData.contact.twitter_url}" target="_blank">${aboutData.contact.twitter}</a></span></div>
  <div class="kv-row"><span class="kv-key">github</span><span class="kv-val"><a href="${aboutData.contact.github_url}" target="_blank">${aboutData.contact.github}</a></span></div>`;

  // Links section
  const linksSections = linksData.sections.map(section => {
    const items = section.items.map(item => {
      if (item.url) {
        return `  <li><a href="${item.url}" target="_blank">${item.name}</a>${item.desc ? ` — ${item.desc}` : ''}</li>`;
      } else {
        return `  <li><span class="name">${item.name}</span>${item.desc ? ` — ${item.desc}` : ''}</li>`;
      }
    }).join('\n');
    
    return `<h3>## ${section.name}</h3>
<ul>
${items}
</ul>`;
  }).join('\n\n');

  console.log('  ✓ Generated all templates\n');

  // Replace placeholders in template
  console.log('🔄 Injecting content...');
  template = template
    .replace('<!-- WRITING_LIST -->', writingList)
    .replace('<!-- ARTICLE_TEMPLATES -->', articleTemplates)
    .replace('<!-- NOW_KV -->', nowKV)
    .replace('<!-- NOW_DETAILS -->', nowDetails)
    .replace('  <div class="kv-row"><span class="kv-key">Last updated</span><span class="kv-val">January 2026</span></div>', `  <div class="kv-row"><span class="kv-key">Last updated</span><span class="kv-val">${nowData.updated}</span></div>`)
    .replace('<!-- WORK_KV -->', workKV)
    .replace('<!-- WORK_DETAILS -->', workDetails)
    .replace('<!-- LIFE_KV -->', lifeKV)
    .replace('<!-- LIFE_DETAILS -->', lifeDetails)
    .replace('<!-- ABOUT_INTRO -->', aboutIntro)
    .replace('<!-- ABOUT_SITE_KV -->', aboutSiteKV)
    .replace('<!-- ABOUT_CONTACT_KV -->', aboutContactKV)
    .replace('<!-- LINKS_SECTIONS -->', linksSections);

  // Write output
  fs.writeFileSync(OUTPUT_FILE, template);
  console.log('  ✓ Content injected\n');

  console.log(`✅ Build complete! Generated ${OUTPUT_FILE}\n`);
}

// Run build
try {
  build();
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
