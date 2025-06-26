#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateBadges(username) {
  const apiBase = process.env.API_BASE_URL || 'https://profile-line-of-code.vercel.app';
  
  const badges = {
    total: `${apiBase}/api/user/${username}/badge?style=total`,
    repos: `${apiBase}/api/user/${username}/badge?style=repos`,
    card: `${apiBase}/api/user/${username}/card`,
    // Language specific badges (will be generated based on user's top languages)
    javascript: `${apiBase}/api/user/${username}/badge?style=language&language=JavaScript`,
    python: `${apiBase}/api/user/${username}/badge?style=language&language=Python`,
    typescript: `${apiBase}/api/user/${username}/badge?style=language&language=TypeScript`,
    java: `${apiBase}/api/user/${username}/badge?style=language&language=Java`,
    cpp: `${apiBase}/api/user/${username}/badge?style=language&language=C%2B%2B`,
    go: `${apiBase}/api/user/${username}/badge?style=language&language=Go`,
  };

  const badgesDir = path.join(__dirname, '..', 'badges');
  await fs.mkdir(badgesDir, { recursive: true });

  // Generate README snippet
  const readmeSnippet = `
## 📊 Code Statistics

<!-- Profile Line of Code badges -->
![Total Lines of Code](${badges.total})
![Repositories](${badges.repos})

### 📈 Language Statistics
![JavaScript](${badges.javascript})
![Python](${badges.python})
![TypeScript](${badges.typescript})

### 🎨 Stats Card
![Code Statistics](${badges.card})

<!-- End Profile Line of Code badges -->

### 🔗 Badge URLs

Copy these URLs to use the badges in your own projects:

**Total Lines:**
\`\`\`
${badges.total}
\`\`\`

**Repository Count:**
\`\`\`
${badges.repos}
\`\`\`

**Stats Card:**
\`\`\`
${badges.card}
\`\`\`

**HTML Usage:**
\`\`\`html
<img src="${badges.total}" alt="Total Lines of Code" />
<img src="${badges.card}" alt="Code Statistics" />
\`\`\`

**Markdown Usage:**
\`\`\`markdown
![Total Lines of Code](${badges.total})
![Code Statistics](${badges.card})
\`\`\`
  `;

  await fs.writeFile(
    path.join(badgesDir, 'README.md'),
    readmeSnippet.trim()
  );

  // Generate URLs file
  await fs.writeFile(
    path.join(badgesDir, 'urls.json'),
    JSON.stringify(badges, null, 2)
  );

  console.log(`✅ Generated badges for ${username}`);
  console.log(`📁 Files created in: ${badgesDir}`);
  console.log(`🔗 Badge URLs saved to: ${path.join(badgesDir, 'urls.json')}`);
}

// Get username from command line args
const username = process.argv[2];

if (!username) {
  console.error('❌ Please provide a username: node generate-badges.js <username>');
  process.exit(1);
}

generateBadges(username).catch(console.error);