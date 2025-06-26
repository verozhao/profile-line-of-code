import githubService from './github.js';
import languageDetector from './language-detector.js';

export class LineCounter {
  countLines(content) {
    if (!content || typeof content !== 'string') {
      return { total: 0, code: 0, comments: 0, blank: 0 };
    }

    const lines = content.split('\n');
    let codeLines = 0;
    let commentLines = 0;
    let blankLines = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === '') {
        blankLines++;
      } else if (this.isCommentLine(trimmed)) {
        commentLines++;
      } else {
        codeLines++;
      }
    }

    return {
      total: lines.length,
      code: codeLines,
      comments: commentLines,
      blank: blankLines,
    };
  }

  isCommentLine(line) {
    // Common comment patterns
    const commentPatterns = [
      /^\s*\/\//, // //
      /^\s*\/\*/, // /*
      /^\s*\*/, // *
      /^\s*#/, // #
      /^\s*--/, // --
      /^\s*;/, // ;
      /^\s*%/, // %
      /^\s*"/, // " (for some languages)
      /^\s*'/, // ' (for some languages)
      /^\s*<!--/, // <!--
      /^\s*\{-/, // {- (Haskell)
      /^\s*\(\*/, // (* (OCaml, Pascal)
    ];

    return commentPatterns.some(pattern => pattern.test(line));
  }

  async countRepoLines(owner, repoName, branch = 'main') {
    const languageStats = {};
    
    try {
      // First try to get repository languages from GitHub API (faster)
      const githubLanguages = await githubService.getRepoLanguages(owner, repoName);
      
      // If GitHub provides language data, use it as a starting point
      if (Object.keys(githubLanguages).length > 0) {
        for (const [language, bytes] of Object.entries(githubLanguages)) {
          languageStats[language] = {
            lines: 0,
            files: 0,
            bytes: bytes,
            code: 0,
            comments: 0,
            blank: 0,
          };
        }
      }

      // Now get detailed line counts by scanning files
      await this.scanDirectory(owner, repoName, '', languageStats);
      
      return languageStats;
    } catch (error) {
      console.error(`Error counting lines for ${owner}/${repoName}:`, error.message);
      return {};
    }
  }

  async scanDirectory(owner, repo, path, languageStats) {
    try {
      const contents = await githubService.getRepoContents(owner, repo, path);
      
      if (!Array.isArray(contents)) {
        return;
      }

      for (const item of contents) {
        if (item.type === 'dir') {
          // Skip ignored directories
          if (languageDetector.isIgnoredDirectory(item.name)) {
            continue;
          }
          
          // Recursively scan subdirectories
          await this.scanDirectory(owner, repo, item.path, languageStats);
        } else if (item.type === 'file') {
          await this.processFile(owner, repo, item, languageStats);
        }
      }
    } catch (error) {
      // Skip directories we can't access
      console.warn(`Skipping directory ${path}: ${error.message}`);
    }
  }

  async processFile(owner, repo, fileItem, languageStats) {
    const language = languageDetector.detectLanguage(fileItem.name);
    
    if (!language) {
      return; // Skip files we can't detect or ignore
    }

    try {
      const content = await githubService.getFileContent(owner, repo, fileItem.path);
      
      if (!content) {
        return; // Skip files we can't read or that are too large
      }

      const lineStats = this.countLines(content);
      
      // Initialize language stats if not exists
      if (!languageStats[language]) {
        languageStats[language] = {
          lines: 0,
          files: 0,
          bytes: 0,
          code: 0,
          comments: 0,
          blank: 0,
        };
      }

      // Update stats
      languageStats[language].lines += lineStats.total;
      languageStats[language].code += lineStats.code;
      languageStats[language].comments += lineStats.comments;
      languageStats[language].blank += lineStats.blank;
      languageStats[language].files += 1;
      languageStats[language].bytes += fileItem.size || content.length;

    } catch (error) {
      console.warn(`Skipping file ${fileItem.path}: ${error.message}`);
    }
  }

  async countUserTotalLines(username) {
    try {
      const repos = await githubService.getAllUserRepos(username);
      const totalStats = {};
      const repoStats = [];

      console.log(`Found ${repos.length} repositories for ${username}`);

      for (const repo of repos) {
        if (repo.size === 0) continue; // Skip empty repos
        
        console.log(`Processing ${repo.full_name}...`);
        
        const repoLines = await this.countRepoLines(repo.owner.login, repo.name);
        
        // Aggregate to total stats
        for (const [language, stats] of Object.entries(repoLines)) {
          if (!totalStats[language]) {
            totalStats[language] = {
              lines: 0,
              files: 0,
              bytes: 0,
              code: 0,
              comments: 0,
              blank: 0,
              repos: 0,
            };
          }
          
          totalStats[language].lines += stats.lines;
          totalStats[language].files += stats.files;
          totalStats[language].bytes += stats.bytes;
          totalStats[language].code += stats.code;
          totalStats[language].comments += stats.comments;
          totalStats[language].blank += stats.blank;
          totalStats[language].repos += 1;
        }

        repoStats.push({
          name: repo.name,
          fullName: repo.full_name,
          languages: repoLines,
          updatedAt: repo.updated_at,
          stars: repo.stargazers_count,
          size: repo.size,
        });
      }

      return {
        username,
        totalLanguages: Object.keys(totalStats).length,
        totalRepos: repos.length,
        processedRepos: repoStats.length,
        languages: totalStats,
        repositories: repoStats,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to count lines for user ${username}: ${error.message}`);
    }
  }
}

export default new LineCounter();