export class BadgeGenerator {
  constructor() {
    this.colors = {
      brightgreen: '#4c1',
      green: '#97CA00',
      yellowgreen: '#a4a61d',
      yellow: '#dfb317',
      orange: '#fe7d37',
      red: '#e05d44',
      lightgrey: '#9f9f9f',
      blue: '#007ec6',
      purple: '#6f42c1',
      pink: '#ff69b4',
    };

    this.languageColors = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Java: '#b07219',
      'C++': '#f34b7d',
      'C#': '#239120',
      PHP: '#4F5D95',
      Ruby: '#701516',
      Go: '#00ADD8',
      Rust: '#dea584',
      Swift: '#ffac45',
      Kotlin: '#F18E33',
      HTML: '#e34c26',
      CSS: '#1572B6',
      Shell: '#89e051',
      Vue: '#2c3e50',
      React: '#61dafb',
      SQL: '#e38c00',
    };
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getColorForNumber(num, thresholds = [1000, 10000, 50000, 100000]) {
    if (num >= thresholds[3]) return this.colors.brightgreen;
    if (num >= thresholds[2]) return this.colors.green;
    if (num >= thresholds[1]) return this.colors.yellowgreen;
    if (num >= thresholds[0]) return this.colors.yellow;
    return this.colors.orange;
  }

  createTotalLinesBadge(totalLines) {
    const formattedLines = this.formatNumber(totalLines);
    const color = this.getColorForNumber(totalLines);
    
    return this.generateSVG('Total Lines', formattedLines, color);
  }

  createLanguageBadge(language, lines) {
    const formattedLines = this.formatNumber(lines);
    const color = this.languageColors[language] || this.colors.blue;
    
    return this.generateSVG(language, formattedLines, color);
  }

  createLanguageDistributionBadge(languages, totalLines) {
    const topLanguages = Object.entries(languages)
      .sort(([,a], [,b]) => b.lines - a.lines)
      .slice(0, 5)
      .map(([lang, stats]) => ({
        name: lang,
        percentage: ((stats.lines / totalLines) * 100).toFixed(1),
        color: this.languageColors[lang] || this.colors.lightgrey,
      }));

    return this.generateDistributionSVG(topLanguages);
  }

  createRepoCountBadge(count) {
    const color = this.getColorForNumber(count, [5, 20, 50, 100]);
    return this.generateSVG('Repositories', count.toString(), color);
  }

  generateSVG(label, value, color) {
    const labelWidth = this.getTextWidth(label) + 20;
    const valueWidth = this.getTextWidth(value) + 20;
    const totalWidth = labelWidth + valueWidth;

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="a">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#a)">
    <path fill="#555" d="M0 0h${labelWidth}v20H0z"/>
    <path fill="${color}" d="M${labelWidth} 0h${valueWidth}v20H${labelWidth}z"/>
    <path fill="url(#b)" d="M0 0h${totalWidth}v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110">
    <text x="${labelWidth / 2 * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(labelWidth - 20) * 10}">${label}</text>
    <text x="${labelWidth / 2 * 10}" y="140" transform="scale(.1)" textLength="${(labelWidth - 20) * 10}">${label}</text>
    <text x="${(labelWidth + valueWidth / 2) * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(valueWidth - 20) * 10}">${value}</text>
    <text x="${(labelWidth + valueWidth / 2) * 10}" y="140" transform="scale(.1)" textLength="${(valueWidth - 20) * 10}">${value}</text>
  </g>
</svg>`.trim();
  }

  generateDistributionSVG(languages) {
    const width = 400;
    const height = 120;
    const barHeight = 20;
    const spacing = 5;
    
    let svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#ffffff" rx="5"/>
  <text x="10" y="20" font-family="monospace" font-size="12" fill="#333">Language Distribution</text>`;

    languages.forEach((lang, index) => {
      const y = 35 + index * (barHeight + spacing);
      const barWidth = (parseFloat(lang.percentage) / 100) * (width - 120);
      
      svg += `
  <rect x="10" y="${y}" width="${barWidth}" height="${barHeight}" fill="${lang.color}" rx="2"/>
  <text x="15" y="${y + 14}" font-family="monospace" font-size="10" fill="#fff">${lang.name}</text>
  <text x="${width - 50}" y="${y + 14}" font-family="monospace" font-size="10" fill="#333">${lang.percentage}%</text>`;
    });

    svg += '</svg>';
    return svg;
  }

  getTextWidth(text) {
    // Approximate text width calculation (rough estimate)
    return text.length * 7;
  }

  generateStatsCard(userData) {
    const { languages, totalRepos, username } = userData;
    const totalLines = Object.values(languages).reduce((sum, lang) => sum + lang.lines, 0);
    const topLanguages = Object.entries(languages)
      .sort(([,a], [,b]) => b.lines - a.lines)
      .slice(0, 6);

    const width = 600;
    const height = 320;
    
    let svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f1419" stop-opacity="1"/>
      <stop offset="100%" stop-color="#161b22" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#58a6ff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#bd2fc7" stop-opacity="0.3"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>
  
  <!-- Main card background -->
  <rect width="${width}" height="${height}" fill="url(#cardGradient)" rx="12" stroke="#30363d" stroke-width="1" filter="url(#shadow)"/>
  
  <!-- Header section -->
  <rect x="0" y="0" width="${width}" height="80" fill="url(#headerGradient)" rx="12"/>
  <rect x="0" y="68" width="${width}" height="12" fill="url(#cardGradient)"/>
  
  <!-- Profile section -->
  <circle cx="40" cy="40" r="20" fill="#58a6ff" opacity="0.2"/>
  <text x="40" y="47" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="16" font-weight="600" text-anchor="middle" fill="#58a6ff">👨‍💻</text>
  
  <!-- Title -->
  <text x="75" y="35" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="18" font-weight="700" fill="#f0f6fc">${username}</text>
  <text x="75" y="55" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="14" fill="#8b949e">Code Statistics</text>
  
  <!-- Stats grid -->
  <g transform="translate(30, 100)">
    <!-- Total lines stat -->
    <rect x="0" y="0" width="130" height="60" fill="#21262d" rx="8" stroke="#30363d" stroke-width="1"/>
    <text x="65" y="20" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="11" font-weight="600" text-anchor="middle" fill="#7c3aed">TOTAL LINES</text>
    <text x="65" y="40" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="#f0f6fc">${this.formatNumber(totalLines)}</text>
    
    <!-- Repositories stat -->
    <rect x="180" y="0" width="130" height="60" fill="#21262d" rx="8" stroke="#30363d" stroke-width="1"/>
    <text x="245" y="20" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="11" font-weight="600" text-anchor="middle" fill="#f85149">REPOSITORIES</text>
    <text x="245" y="40" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="#f0f6fc">${totalRepos}</text>
    
    <!-- Languages stat -->
    <rect x="360" y="0" width="130" height="60" fill="#21262d" rx="8" stroke="#30363d" stroke-width="1"/>
    <text x="425" y="20" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="11" font-weight="600" text-anchor="middle" fill="#3fb950">LANGUAGES</text>
    <text x="425" y="40" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="#f0f6fc">${Object.keys(languages).length}</text>
  </g>
  
  <!-- Languages section -->
  <text x="30" y="200" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="16" font-weight="600" fill="#f0f6fc">Top Languages</text>
  
  <g transform="translate(30, 215)">`;

    topLanguages.forEach(([language, stats], index) => {
      const y = index * 15;
      const percentage = ((stats.lines / totalLines) * 100).toFixed(1);
      const barWidth = Math.max((stats.lines / totalLines) * 420, 8); // Minimum width for visibility
      const color = this.languageColors[language] || '#58a6ff';
      
      svg += `
    <!-- Language ${index + 1}: ${language} -->
    <g transform="translate(0, ${y})">
      <!-- Progress bar background -->
      <rect x="0" y="2" width="420" height="8" fill="#21262d" rx="4"/>
      <!-- Progress bar fill -->
      <rect x="0" y="2" width="${barWidth}" height="8" fill="${color}" rx="4" opacity="0.8"/>
      <!-- Language name -->
      <circle cx="435" cy="6" r="4" fill="${color}"/>
      <text x="445" y="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="12" fill="#f0f6fc">${language}</text>
      <!-- Percentage -->
      <text x="540" y="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="11" fill="#8b949e" text-anchor="end">${percentage}%</text>
    </g>`;
    });

    svg += `
  </g>
  
  <!-- Footer -->
  <text x="${width - 20}" y="${height - 15}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="10" fill="#6e7681" text-anchor="end">Profile Line of Code API</text>
</svg>`;
    
    return svg;
  }
}

export default new BadgeGenerator();