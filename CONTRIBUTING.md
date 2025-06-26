# Contributing

Thanks for considering contributing to this project! Here's how you can help.

## Getting started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and add your GitHub token
5. Start the dev server: `npm run dev`

## What you can contribute

- **Bug fixes**: Found something broken? Open an issue or submit a PR
- **New languages**: Add support for more programming languages
- **Performance improvements**: Make the API faster or more efficient
- **Documentation**: Help make the docs clearer
- **Tests**: We need more test coverage

## Code style

- Follow the existing ESLint configuration
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## Adding a new language

To add support for a new programming language:

1. Edit `src/services/language-detector.js`
2. Add the language and its file extensions to `languageExtensions`
3. Add the language color to `src/services/badge.js` if you want custom colors
4. Test with repositories that use that language

## Submitting changes

1. Create a feature branch: `git checkout -b my-feature`
2. Make your changes
3. Test everything works: `npm test` and `npm run lint`
4. Commit with a clear message
5. Push and create a pull request

## Issues

- Use the issue template if available
- Include steps to reproduce for bugs
- Be specific about what you expected vs what happened
- Include your environment (Node version, OS, etc.)

## Questions?

Open an issue or reach out to [@verozhao](https://github.com/verozhao).