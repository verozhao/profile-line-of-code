export const languageExtensions = {
  // Web Technologies
  'JavaScript': ['.js', '.jsx', '.mjs', '.cjs'],
  'TypeScript': ['.ts', '.tsx'],
  'HTML': ['.html', '.htm', '.xhtml'],
  'CSS': ['.css', '.scss', '.sass', '.less', '.styl'],
  'Vue': ['.vue'],
  'Svelte': ['.svelte'],
  
  // Programming Languages
  'Python': ['.py', '.pyw', '.pyi'],
  'Java': ['.java'],
  'C': ['.c', '.h'],
  'C++': ['.cpp', '.cc', '.cxx', '.hpp', '.hxx', '.h++'],
  'C#': ['.cs'],
  'Go': ['.go'],
  'Rust': ['.rs'],
  'Swift': ['.swift'],
  'Kotlin': ['.kt', '.kts'],
  'Scala': ['.scala', '.sc'],
  'Ruby': ['.rb', '.rbw'],
  'PHP': ['.php', '.phtml', '.php3', '.php4', '.php5', '.phps'],
  'Perl': ['.pl', '.pm', '.t', '.pod'],
  'R': ['.r', '.R'],
  'MATLAB': ['.m'],
  'Lua': ['.lua'],
  'Dart': ['.dart'],
  'Elixir': ['.ex', '.exs'],
  'Erlang': ['.erl', '.hrl'],
  'Haskell': ['.hs', '.lhs'],
  'OCaml': ['.ml', '.mli'],
  'F#': ['.fs', '.fsi', '.fsx'],
  'Clojure': ['.clj', '.cljs', '.cljc'],
  'Nim': ['.nim', '.nims'],
  'Crystal': ['.cr'],
  'Zig': ['.zig'],
  
  // Shell & Scripting
  'Shell': ['.sh', '.bash', '.zsh', '.fish', '.ksh', '.csh'],
  'PowerShell': ['.ps1', '.psm1', '.psd1'],
  'Batch': ['.bat', '.cmd'],
  
  // Database
  'SQL': ['.sql'],
  'PLpgSQL': ['.pgsql'],
  
  // Mobile Development
  'Objective-C': ['.m', '.mm'],
  'Objective-C++': ['.mm'],
  
  // Functional Languages
  'Scheme': ['.scm', '.ss'],
  'Common Lisp': ['.lisp', '.lsp', '.l', '.cl'],
  'Racket': ['.rkt', '.rktl'],
  
  // Systems Programming
  'Assembly': ['.asm', '.s', '.S'],
  'Verilog': ['.v', '.vh'],
  'VHDL': ['.vhd', '.vhdl'],
  
  // Configuration & Data
  'JSON': ['.json'],
  'YAML': ['.yml', '.yaml'],
  'TOML': ['.toml'],
  'XML': ['.xml', '.xsd', '.xsl', '.xslt'],
  'Markdown': ['.md', '.markdown', '.mdown', '.mkd'],
  'Text': ['.txt'],
  'Dockerfile': ['Dockerfile', '.dockerfile'],
  'Makefile': ['Makefile', 'makefile', '.mk'],
  
  // Other
  'TeX': ['.tex'],
  'LaTeX': ['.latex'],
  'GraphQL': ['.graphql', '.gql'],
  'Solidity': ['.sol'],
  'CMake': ['.cmake', 'CMakeLists.txt'],
  'Gradle': ['.gradle'],
  'Maven': ['.pom'],
};

// Binary and generated file extensions to ignore
export const ignoredExtensions = new Set([
  '.exe', '.dll', '.so', '.dylib', '.a', '.lib', '.o', '.obj',
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.ico', '.webp',
  '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.tar', '.gz', '.rar', '.7z', '.bz2',
  '.jar', '.war', '.ear', '.class',
  '.pyc', '.pyo', '.pyd',
  '.min.js', '.min.css',
  '.lock', '.tmp', '.temp', '.log',
  '.git', '.gitignore', '.gitkeep',
  '.DS_Store', 'Thumbs.db',
]);

// Directories to ignore
export const ignoredDirectories = new Set([
  'node_modules', '.git', '.svn', '.hg', '.bzr',
  'dist', 'build', 'out', 'target', 'bin', 'obj',
  '.next', '.nuxt', '.vscode', '.idea',
  '__pycache__', '.pytest_cache', '.mypy_cache',
  'vendor', 'packages', 'libs',
  '.env', '.venv', 'venv', 'env',
  'coverage', '.nyc_output',
]);

export class LanguageDetector {
  detectLanguage(filename) {
    const lowerFilename = filename.toLowerCase();
    
    // Check for special files first
    if (lowerFilename === 'dockerfile' || lowerFilename.includes('dockerfile')) {
      return 'Dockerfile';
    }
    if (lowerFilename === 'makefile' || lowerFilename === 'gnumakefile') {
      return 'Makefile';
    }
    if (lowerFilename === 'cmakelists.txt') {
      return 'CMake';
    }
    
    // Get file extension
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return null;
    
    const extension = filename.substring(lastDotIndex).toLowerCase();
    
    // Check if it's an ignored extension
    if (ignoredExtensions.has(extension)) {
      return null;
    }
    
    // Find matching language
    for (const [language, extensions] of Object.entries(languageExtensions)) {
      if (extensions.some(ext => ext.toLowerCase() === extension)) {
        return language;
      }
    }
    
    return null;
  }
  
  isIgnoredDirectory(dirname) {
    return ignoredDirectories.has(dirname.toLowerCase());
  }
  
  isIgnoredFile(filename) {
    const extension = filename.substring(filename.lastIndexOf('.'));
    return ignoredExtensions.has(extension.toLowerCase());
  }
}

export default new LanguageDetector();