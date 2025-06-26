# Profile Line of Code

An API I built to track my coding activity across all my GitHub repositories. It counts lines of code by language and generates clean badges that I can embed in my README files.

[![Total Lines of Code](https://profile-line-of-code.vercel.app/api/user/verozhao/badge?style=total)](https://profile-line-of-code.vercel.app/api/user/verozhao)
[![Repositories](https://profile-line-of-code.vercel.app/api/user/verozhao/badge?style=repos)](https://profile-line-of-code.vercel.app/api/user/verozhao)

## What it does

- Scans all my public repositories and counts lines of code
- Supports 50+ programming languages with proper detection
- Breaks down statistics: actual code vs comments vs blank lines
- Generates SVG badges I can drop into any README
- Creates visual stats cards showing my language distribution
- Caches results so it's fast and doesn't hit GitHub rate limits
- Works with GitHub Actions to keep stats updated automatically

## How to use it

### API Endpoints

#### Get User Statistics
```
GET /api/user/{username}
```

Example response:
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

#### Generate Badges
```
GET /api/user/{username}/badge?style={style}&language={language}
```

**Badge Styles:**
- `total` - Total lines of code across all languages
- `language` - Lines for a specific language (requires `language` parameter)
- `repos` - Repository count

#### Generate Stats Card
```
GET /api/user/{username}/card
```

### Example usage

Just replace `username` with your GitHub username:

```markdown
![Total Lines of Code](https://profile-line-of-code.vercel.app/api/user/username/badge?style=total)
![JavaScript Lines](https://profile-line-of-code.vercel.app/api/user/username/badge?style=language&language=JavaScript)
![My Code Stats](https://profile-line-of-code.vercel.app/api/user/username/card)
```

## Running it yourself

If you want to deploy your own instance:

1. Clone this repo and install dependencies:
   ```bash
   git clone https://github.com/verozhao/profile-line-of-code.git
   cd profile-line-of-code
   npm install
   ```

2. Get a GitHub personal access token and add it to `.env`:
   ```bash
   cp .env.example .env
   # Add GITHUB_TOKEN=your_token_here
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

For deployment, I'm using Vercel but it works on any Node.js platform. Just make sure to set the `GITHUB_TOKEN` environment variable.

## Technical details

### Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/user/{username}` | GET | Get user statistics | `username`, `refresh` (optional) |
| `/api/user/{username}/badge` | GET | Generate badge | `username`, `style`, `language` (optional) |
| `/api/user/{username}/card` | GET | Generate stats card | `username`, `theme` (optional) |
| `/api/repo/{owner}/{repo}` | GET | Get repo statistics | `owner`, `repo`, `refresh` (optional) |
| `/api/languages` | GET | List supported languages | None |
| `/api/rate-limit` | GET | Check rate limit status | None |
| `/health` | GET | Health check | None |

### Languages I track

Currently detecting 50+ languages including JavaScript, TypeScript, Python, Java, C++, Go, Rust, HTML, CSS, and more. It automatically ignores things like `node_modules`, build artifacts, and other non-source files.

### Rate Limits

- **General API**: 100 requests per 15 minutes
- **Data Endpoints**: 30 requests per 15 minutes
- **Badge Endpoints**: 200 requests per 5 minutes

### Caching

- **User Statistics**: Cached for 1 hour
- **Repository Data**: Cached for 1 hour
- **Badges**: Cached for 5 minutes

### Automation

I've set up GitHub Actions to automatically update the badges daily. The workflow is included in this repo if you want to use it.

## Implementation notes

Built with Node.js and Express. Uses the GitHub API to fetch repository data and analyzes file contents to count lines. Results are cached to avoid hitting rate limits.

The badges use the same color scheme as GitHub's language colors for consistency. Everything is generated as SVG so they're lightweight and scalable.

## My stats

Here's what the API shows for my own repositories:

![Total Lines](https://profile-line-of-code.vercel.app/api/user/verozhao/badge?style=total)
![JavaScript](https://profile-line-of-code.vercel.app/api/user/verozhao/badge?style=language&language=JavaScript)

![Code Statistics](https://profile-line-of-code.vercel.app/api/user/verozhao/card)

---

Built by [Vero Zhao](https://github.com/verozhao)