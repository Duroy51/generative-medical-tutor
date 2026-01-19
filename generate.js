#!/usr/bin/env node

/**
 * Script de génération du contexte complet du projet
 * Génère un fichier markdown avec toute la structure et le contenu du projet
 * Usage: node generate-context.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  outputFile: 'PROJECT_CONTEXT.md',
  maxFileSize: 500000, // 500KB max par fichier
  
  // Extensions de fichiers à inclure
  includeExtensions: [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.json', '.md', '.env.example',
    '.css', '.scss', '.html', '.yml', '.yaml', '.toml', '.txt'
  ],
  
  // Dossiers à ignorer
  ignoreDirs: [
    'node_modules', '.next', 'ENV', 'venv', '__pycache__', '.git',
    'dist', 'build', '.cache', 'coverage', '.vscode', '.idea',
    'staticfiles', 'media', 'data_exports', '.pytest_cache',
    'migrations', // Ignorer les migrations Django
  ],
  
  // Fichiers à ignorer
  ignoreFiles: [
    '.DS_Store', 'thumbs.db', '*.pyc', '*.pyo', '*.log',
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    '.env', '.env.local', '.env.production'
  ],
  
  // Fichiers importants à toujours inclure (même s'ils sont gros)
  priorityFiles: [
    'README.md', 'package.json', 'requirements.txt',
    'settings.py', 'urls.py', 'next.config.js', 'tailwind.config.js',
    'tsconfig.json', 'manage.py'
  ]
};

class ProjectContextGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.context = [];
    this.stats = {
      filesProcessed: 0,
      filesSkipped: 0,
      totalSize: 0,
      errors: []
    };
  }

  shouldIgnore(itemPath, itemName) {
    // Vérifier les dossiers à ignorer
    const pathParts = itemPath.split(path.sep);
    for (const ignoredDir of CONFIG.ignoreDirs) {
      if (pathParts.includes(ignoredDir)) return true;
    }

    // Vérifier les fichiers à ignorer
    for (const pattern of CONFIG.ignoreFiles) {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        if (regex.test(itemName)) return true;
      } else if (itemName === pattern) {
        return true;
      }
    }

    return false;
  }

  shouldIncludeFile(filePath, fileName) {
    // Toujours inclure les fichiers prioritaires
    if (CONFIG.priorityFiles.includes(fileName)) return true;

    // Vérifier l'extension
    const ext = path.extname(fileName);
    return CONFIG.includeExtensions.includes(ext);
  }

  async generateTreeStructure(dir = this.projectRoot, prefix = '', isLast = true) {
    const items = fs.readdirSync(dir);
    let tree = '';

    items.forEach((item, index) => {
      const itemPath = path.join(dir, item);
      const relativePath = path.relative(this.projectRoot, itemPath);
      
      if (this.shouldIgnore(relativePath, item)) return;

      const isLastItem = index === items.length - 1;
      const currentPrefix = prefix + (isLast ? '└── ' : '├── ');
      const nextPrefix = prefix + (isLast ? '    ' : '│   ');

      try {
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          tree += `${currentPrefix}📁 ${item}/\n`;
          tree += this.generateTreeStructure(itemPath, nextPrefix, isLastItem);
        } else {
          const icon = this.getFileIcon(item);
          tree += `${currentPrefix}${icon} ${item}\n`;
        }
      } catch (err) {
        this.stats.errors.push(`Erreur lecture: ${relativePath}`);
      }
    });

    return tree;
  }

  getFileIcon(fileName) {
    const ext = path.extname(fileName);
    const icons = {
      '.js': '📜', '.jsx': '⚛️', '.ts': '📘', '.tsx': '⚛️',
      '.py': '🐍', '.json': '📋', '.md': '📝', '.css': '🎨',
      '.scss': '🎨', '.html': '🌐', '.yml': '⚙️', '.yaml': '⚙️'
    };
    return icons[ext] || '📄';
  }

  async processDirectory(dir = this.projectRoot) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const relativePath = path.relative(this.projectRoot, itemPath);
      
      if (this.shouldIgnore(relativePath, item)) {
        this.stats.filesSkipped++;
        continue;
      }

      try {
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          await this.processDirectory(itemPath);
        } else if (this.shouldIncludeFile(itemPath, item)) {
          await this.processFile(itemPath, relativePath, stats);
        } else {
          this.stats.filesSkipped++;
        }
      } catch (err) {
        this.stats.errors.push(`Erreur: ${relativePath} - ${err.message}`);
      }
    }
  }

  async processFile(filePath, relativePath, stats) {
    const fileName = path.basename(filePath);
    const isPriority = CONFIG.priorityFiles.includes(fileName);

    // Ignorer les fichiers trop gros (sauf prioritaires)
    if (!isPriority && stats.size > CONFIG.maxFileSize) {
      this.stats.filesSkipped++;
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const ext = path.extname(fileName).substring(1) || 'txt';
      
      this.context.push({
        path: relativePath,
        content: content,
        extension: ext,
        size: stats.size,
        isPriority
      });

      this.stats.filesProcessed++;
      this.stats.totalSize += stats.size;
    } catch (err) {
      this.stats.errors.push(`Erreur lecture fichier: ${relativePath} - ${err.message}`);
    }
  }

  generateMarkdown() {
    const timestamp = new Date().toISOString();
    let markdown = `# Contexte Complet du Projet - Generative Medical Tutor\n\n`;
    markdown += `**Généré le:** ${timestamp}\n\n`;
    markdown += `---\n\n`;

    // Section 1: Informations générales
    markdown += `## 📊 Statistiques du Projet\n\n`;
    markdown += `- **Fichiers traités:** ${this.stats.filesProcessed}\n`;
    markdown += `- **Fichiers ignorés:** ${this.stats.filesSkipped}\n`;
    markdown += `- **Taille totale:** ${(this.stats.totalSize / 1024 / 1024).toFixed(2)} MB\n`;
    markdown += `- **Erreurs:** ${this.stats.errors.length}\n\n`;

    if (this.stats.errors.length > 0) {
      markdown += `### ⚠️ Erreurs rencontrées\n\n`;
      this.stats.errors.forEach(err => {
        markdown += `- ${err}\n`;
      });
      markdown += `\n`;
    }

    markdown += `---\n\n`;

    // Section 2: Architecture du projet
    markdown += `## 🏗️ Architecture du Projet\n\n`;
    markdown += `### Structure Générale\n\n`;
    markdown += `Le projet est structuré en deux parties principales:\n`;
    markdown += `- **Frontend:** Next.js (React) - Application web moderne\n`;
    markdown += `- **Backend:** Django (Python) - API RESTful\n\n`;

    // Section 3: Arborescence
    markdown += `## 📂 Arborescence Complète\n\n`;
    markdown += `\`\`\`\n`;
    markdown += this.generateTreeStructure();
    markdown += `\`\`\`\n\n`;
    markdown += `---\n\n`;

    // Section 4: Fichiers de configuration
    markdown += `## ⚙️ Fichiers de Configuration\n\n`;
    const configFiles = this.context.filter(f => 
      CONFIG.priorityFiles.includes(path.basename(f.path))
    );

    configFiles.forEach(file => {
      markdown += `### 📄 \`${file.path}\`\n\n`;
      markdown += `\`\`\`${file.extension}\n`;
      markdown += file.content;
      markdown += `\n\`\`\`\n\n`;
    });

    markdown += `---\n\n`;

    // Section 5: Code source Frontend
    markdown += `## 🎨 Frontend (Next.js)\n\n`;
    const frontendFiles = this.context
      .filter(f => f.path.startsWith('frontendv3') && !f.isPriority)
      .sort((a, b) => a.path.localeCompare(b.path));

    frontendFiles.forEach(file => {
      markdown += `### 📄 \`${file.path}\`\n\n`;
      markdown += `\`\`\`${file.extension}\n`;
      markdown += file.content;
      markdown += `\n\`\`\`\n\n`;
    });

    markdown += `---\n\n`;

    // Section 6: Code source Backend
    markdown += `## 🐍 Backend (Django)\n\n`;
    const backendFiles = this.context
      .filter(f => f.path.startsWith('backend') && !f.isPriority)
      .sort((a, b) => a.path.localeCompare(b.path));

    backendFiles.forEach(file => {
      markdown += `### 📄 \`${file.path}\`\n\n`;
      markdown += `\`\`\`${file.extension}\n`;
      markdown += file.content;
      markdown += `\n\`\`\`\n\n`;
    });

    markdown += `---\n\n`;

    // Section 7: Documentation
    markdown += `## 📚 Documentation\n\n`;
    const docFiles = this.context
      .filter(f => f.extension === 'md' && !CONFIG.priorityFiles.includes(path.basename(f.path)))
      .sort((a, b) => a.path.localeCompare(b.path));

    docFiles.forEach(file => {
      markdown += `### 📄 \`${file.path}\`\n\n`;
      markdown += file.content;
      markdown += `\n\n`;
    });

    markdown += `---\n\n`;

    // Section 8: Guide d'utilisation pour l'IA
    markdown += `## 🤖 Guide d'Utilisation pour l'IA\n\n`;
    markdown += `### Contexte du Projet\n\n`;
    markdown += `Ce projet est une plateforme éducative médicale utilisant l'IA générative.\n\n`;
    markdown += `**Stack Technique:**\n`;
    markdown += `- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS, Redux Toolkit\n`;
    markdown += `- **Backend:** Django 5.2, Django REST Framework, PostgreSQL\n`;
    markdown += `- **IA:** Intégration avec Groq, LangChain, Mistral\n\n`;
    markdown += `### Points d'Attention\n\n`;
    markdown += `1. Architecture full-stack séparée (frontend/backend)\n`;
    markdown += `2. Authentification JWT\n`;
    markdown += `3. Simulations médicales interactives\n`;
    markdown += `4. Système d'évaluation par IA\n`;
    markdown += `5. Interface expert pour validation de cas\n\n`;

    return markdown;
  }

  async generate() {
    console.log('🚀 Génération du contexte du projet...\n');
    
    console.log('📂 Analyse de la structure...');
    await this.processDirectory();
    
    console.log('📝 Génération du fichier markdown...');
    const markdown = this.generateMarkdown();
    
    console.log('💾 Écriture du fichier...');
    fs.writeFileSync(
      path.join(this.projectRoot, CONFIG.outputFile),
      markdown,
      'utf8'
    );
    
    console.log('\n✅ Contexte généré avec succès!');
    console.log(`📄 Fichier créé: ${CONFIG.outputFile}`);
    console.log(`📊 ${this.stats.filesProcessed} fichiers traités`);
    console.log(`💾 Taille: ${(this.stats.totalSize / 1024 / 1024).toFixed(2)} MB\n`);
  }
}

// Exécution
(async () => {
  try {
    const generator = new ProjectContextGenerator();
    await generator.generate();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
})();