import axios from 'axios';
import { config } from '../config/index.js';

class GitHubService {
  constructor() {
    this.api = axios.create({
      baseURL: config.github.apiUrl,
      headers: {
        Authorization: `token ${config.githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'profile-line-of-code/1.0.0',
      },
      timeout: 30000,
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403) {
          const resetTime = error.response.headers['x-ratelimit-reset'];
          if (resetTime) {
            const resetDate = new Date(resetTime * 1000);
            error.resetTime = resetDate;
          }
        }
        throw error;
      }
    );
  }

  async getUserRepos(username, page = 1) {
    try {
      const response = await this.api.get(`/users/${username}/repos`, {
        params: {
          per_page: 100,
          page,
          type: 'all',
          sort: 'updated',
          direction: 'desc',
        },
      });

      return {
        repos: response.data,
        hasNextPage: response.data.length === 100,
        rateLimit: {
          remaining: parseInt(response.headers['x-ratelimit-remaining']),
          reset: new Date(parseInt(response.headers['x-ratelimit-reset']) * 1000),
        },
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`User '${username}' not found`);
      }
      throw error;
    }
  }

  async getAllUserRepos(username) {
    const allRepos = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage && allRepos.length < config.github.maxReposPerUser) {
      const result = await this.getUserRepos(username, page);
      allRepos.push(...result.repos);
      hasNextPage = result.hasNextPage;
      page++;
    }

    return allRepos.filter(repo => !repo.fork || repo.fork === false);
  }

  async getRepoContents(owner, repo, path = '') {
    try {
      const response = await this.api.get(`/repos/${owner}/${repo}/contents/${path}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async getFileContent(owner, repo, path) {
    try {
      const response = await this.api.get(`/repos/${owner}/${repo}/contents/${path}`);
      
      if (response.data.size > config.github.maxFileSize) {
        return null; // Skip large files
      }

      if (response.data.encoding === 'base64') {
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      }
      
      return response.data.content;
    } catch (error) {
      return null; // Skip files we can't read
    }
  }

  async getRepoLanguages(owner, repo) {
    try {
      const response = await this.api.get(`/repos/${owner}/${repo}/languages`);
      return response.data;
    } catch (error) {
      return {};
    }
  }

  async getRateLimit() {
    try {
      const response = await this.api.get('/rate_limit');
      return response.data;
    } catch (error) {
      return null;
    }
  }
}

export default new GitHubService();