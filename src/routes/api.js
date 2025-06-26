import express from 'express';
import lineCounter from '../services/line-counter.js';
import badgeGenerator from '../services/badge.js';
import cacheService from '../services/cache.js';
import githubService from '../services/github.js';
import { languageExtensions } from '../services/language-detector.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { strictRateLimit, badgeRateLimit } from '../middleware/rate-limit.js';

const router = express.Router();

// Get user statistics
router.get('/user/:username', strictRateLimit, asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { refresh } = req.query;

  // Validate username
  if (!/^[a-zA-Z0-9]([a-zA-Z0-9-])*[a-zA-Z0-9]$/.test(username) || username.length > 39) {
    return res.status(400).json({
      error: 'Invalid username',
      message: 'Username must be a valid GitHub username',
    });
  }

  // Check cache first (unless refresh is requested)
  if (!refresh) {
    const cached = cacheService.getUserStats(username);
    if (cached) {
      return res.json({
        ...cached,
        cached: true,
        cacheAge: Math.floor((Date.now() - new Date(cached.lastUpdated)) / 1000),
      });
    }
  }

  try {
    const stats = await lineCounter.countUserTotalLines(username);
    
    // Cache the results
    cacheService.setUserStats(username, stats);
    
    res.json({
      ...stats,
      cached: false,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'User not found',
        message: `GitHub user '${username}' does not exist`,
      });
    }
    throw error;
  }
}));

// Get user badge
router.get('/user/:username/badge', badgeRateLimit, asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { style = 'total', language, theme = 'default' } = req.query;

  const cacheKey = `${username}-${style}-${language || 'all'}-${theme}`;
  
  // Check badge cache
  const cachedBadge = cacheService.getBadge(cacheKey);
  if (cachedBadge) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.send(cachedBadge);
  }

  // Get user stats
  let stats = cacheService.getUserStats(username);
  if (!stats) {
    stats = await lineCounter.countUserTotalLines(username);
    cacheService.setUserStats(username, stats);
  }

  let badge;
  
  switch (style) {
  case 'total': {
    const totalLines = Object.values(stats.languages).reduce((sum, lang) => sum + lang.lines, 0);
    badge = badgeGenerator.createTotalLinesBadge(totalLines);
    break;
  }
      
  case 'language': {
    if (!language) {
      return res.status(400).json({
        error: 'Missing language parameter',
        message: 'Language parameter is required for language-specific badges',
      });
    }
      
    const langStats = stats.languages[language];
    if (!langStats) {
      return res.status(404).json({
        error: 'Language not found',
        message: `No ${language} code found for user ${username}`,
      });
    }
      
    badge = badgeGenerator.createLanguageBadge(language, langStats.lines);
    break;
  }
      
  case 'repos':
    badge = badgeGenerator.createRepoCountBadge(stats.processedRepos);
    break;
      
  default:
    return res.status(400).json({
      error: 'Invalid style',
      message: 'Style must be one of: total, language, repos',
    });
  }

  // Cache the badge
  cacheService.setBadge(cacheKey, badge);
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.send(badge);
}));

// Get user stats card
router.get('/user/:username/card', badgeRateLimit, asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { theme = 'default' } = req.query;

  const cacheKey = `card-${username}-${theme}`;
  
  // Check badge cache
  const cachedCard = cacheService.getBadge(cacheKey);
  if (cachedCard) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.send(cachedCard);
  }

  // Get user stats
  let stats = cacheService.getUserStats(username);
  if (!stats) {
    stats = await lineCounter.countUserTotalLines(username);
    cacheService.setUserStats(username, stats);
  }

  const card = badgeGenerator.generateStatsCard(stats);
  
  // Cache the card
  cacheService.setBadge(cacheKey, card);
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.send(card);
}));

// Get repository statistics
router.get('/repo/:owner/:repo', strictRateLimit, asyncHandler(async (req, res) => {
  const { owner, repo } = req.params;
  const { refresh } = req.query;

  // Check cache first
  if (!refresh) {
    const cached = cacheService.getRepoStats(owner, repo);
    if (cached) {
      return res.json({
        ...cached,
        cached: true,
      });
    }
  }

  try {
    const stats = await lineCounter.countRepoLines(owner, repo);
    
    const result = {
      owner,
      repository: repo,
      languages: stats,
      totalLines: Object.values(stats).reduce((sum, lang) => sum + lang.lines, 0),
      totalFiles: Object.values(stats).reduce((sum, lang) => sum + lang.files, 0),
      lastUpdated: new Date().toISOString(),
    };
    
    // Cache the results
    cacheService.setRepoStats(owner, repo, result);
    
    res.json({
      ...result,
      cached: false,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Repository not found',
        message: `Repository '${owner}/${repo}' does not exist or is not accessible`,
      });
    }
    throw error;
  }
}));

// Get available languages
router.get('/languages', (req, res) => {
  res.json({
    languages: Object.keys(languageExtensions).sort(),
    totalSupported: Object.keys(languageExtensions).length,
  });
});

// Get rate limit status
router.get('/rate-limit', asyncHandler(async (req, res) => {
  const rateLimitInfo = await githubService.getRateLimit();
  
  res.json({
    github: rateLimitInfo,
    cache: cacheService.getStats(),
  });
}));

export default router;