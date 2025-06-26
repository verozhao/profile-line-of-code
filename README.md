# Profile Line of Code

Track your coding activity across all your GitHub repositories. Get detailed statistics by programming language and generate beautiful badges for your README files.

[![Total Lines of Code](https://profile-line-of-code.vercel.app/api/user/verozhao/badge?style=total)](https://profile-line-of-code.vercel.app/api/user/verozhao)
[![Repositories](https://profile-line-of-code.vercel.app/api/user/verozhao/badge?style=repos)](https://profile-line-of-code.vercel.app/api/user/verozhao)

![Code Statistics](https://profile-line-of-code.vercel.app/api/user/verozhao/card)

## Features

- **Comprehensive Analysis**: Scans all your public repositories and counts lines of code
- **50+ Languages**: Supports JavaScript, TypeScript, Python, Java, C++, Go, Rust, HTML, CSS, and more
- **Detailed Statistics**: Breaks down actual code vs comments vs blank lines
- **Beautiful Badges**: Generates SVG badges you can embed in any README
- **Visual Stats Cards**: Creates professional-looking statistics cards
- **Smart Caching**: Fast responses without hitting GitHub rate limits
- **GitHub Actions Ready**: Automate badge updates in your workflows

## Quick Start

### Get Your Badges

Simply replace `username` with your GitHub username:

```markdown
![Total Lines of Code](https://profile-line-of-code.vercel.app/api/user/username/badge?style=total)
![JavaScript Lines](https://profile-line-of-code.vercel.app/api/user/username/badge?style=language&language=JavaScript)
![Code Statistics](https://profile-line-of-code.vercel.app/api/user/username/card)
```

### Badge Options

**Total Lines Badge:**
```
https://profile-line-of-code.vercel.app/api/user/username/badge?style=total
```

**Language-Specific Badge:**
```
https://profile-line-of-code.vercel.app/api/user/username/badge?style=language&language=JavaScript
```

**Repository Count Badge:**
```
https://profile-line-of-code.vercel.app/api/user/username/badge?style=repos
```

**Stats Card:**
```
https://profile-line-of-code.vercel.app/api/user/username/card
```

## API Endpoints

### Get User Statistics
```
GET /api/user/{username}
```

Returns comprehensive statistics for all repositories:

```json
{
  "username": "octocat",
  "totalLanguages": 15,
  "totalRepos": 42,
  "processedRepos": 38,
  "languages": {
    "JavaScript": {
      "lines": 45230,
      "files": 156,
      "bytes": 1234567,
      "code": 35420,
      "comments": 6810,
      "blank": 3000,
      "repos": 12
    }
  },
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

### Generate Badges
```
GET /api/user/{username}/badge?style={style}&language={language}
```

**Parameters:**
- `style`: `total`, `language`, or `repos`
- `language`: Required for language-specific badges (e.g., `JavaScript`, `Python`)

### Generate Stats Card
```
GET /api/user/{username}/card
```

Creates a beautiful visual statistics card showing your top languages and coding activity.

### Other Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/repo/{owner}/{repo}` | Get statistics for a specific repository |
| `/api/languages` | List all supported programming languages |
| `/api/rate-limit` | Check current rate limit status |
| `/health` | API health check |

## Supported Languages

The API detects 50+ programming languages including:

**Popular Languages:** JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, Swift, Kotlin

**Web Technologies:** HTML, CSS, SCSS, Vue, Svelte, React (JSX)

**System Languages:** C, Assembly, Verilog, VHDL

**Functional Languages:** Haskell, OCaml, F#, Clojure, Scheme

**Data & Config:** JSON, YAML, XML, SQL, GraphQL

[View complete list →](https://profile-line-of-code.vercel.app/api/languages)

## Performance & Limits

- **Caching**: Results cached for 1 hour for optimal performance
- **Rate Limits**: 100 requests per 15 minutes for general use
- **Badge Cache**: 5-minute cache for fast badge loading
- **Language Detection**: Automatically ignores `node_modules`, build artifacts, and binary files

## Self-Hosting

Want to run your own instance? Here's how:

### Prerequisites
- Node.js 18+
- GitHub Personal Access Token

### Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/verozhao/profile-line-of-code.git
   cd profile-line-of-code
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Add your GitHub token to .env:
   # GITHUB_TOKEN=your_token_here
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Deploy to production:**
   - **Vercel**: Connect your GitHub repo at [vercel.com](https://vercel.com)
   - **Railway**: Deploy at [railway.app](https://railway.app)
   - **Any Node.js host**: Set `GITHUB_TOKEN` environment variable

## GitHub Actions Integration

Automatically update your README badges:

```yaml
name: Update Profile Stats

on:
  schedule:
    - cron: '0 0 * * *'  # Daily
  workflow_dispatch:

jobs:
  update-stats:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Update README
      run: |
        # Your badge update script here
        git commit -am "Update stats [skip ci]"
        git push
```

## Examples

### Basic Usage
```markdown
![Lines of Code](https://profile-line-of-code.vercel.app/api/user/octocat/badge?style=total)
```

### Language Breakdown
```markdown
![JavaScript](https://profile-line-of-code.vercel.app/api/user/octocat/badge?style=language&language=JavaScript)
![Python](https://profile-line-of-code.vercel.app/api/user/octocat/badge?style=language&language=Python)
![TypeScript](https://profile-line-of-code.vercel.app/api/user/octocat/badge?style=language&language=TypeScript)
```

### Complete Stats Card
```markdown
![Code Statistics](https://profile-line-of-code.vercel.app/api/user/octocat/card)
```

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- 🐛 **Bug reports**: Open an issue with reproduction steps
- 💡 **Feature requests**: Describe your use case
- 🔧 **Pull requests**: Fork, create feature branch, submit PR
- 📖 **Documentation**: Help improve the docs

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Live API:** https://profile-line-of-code.vercel.app

Built by [Vero Zhao](https://github.com/verozhao)