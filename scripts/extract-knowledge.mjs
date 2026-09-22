/**
 * Official Knowledge & AST Extractor for nstok Repositories.
 * Scans TypeScript (.ts, .tsx) source code and Markdown (.md) documents (PRD, SOP, ADR)
 * and generates knowledge-payload.json for dispatching to nstok-knowledge-master.
 */

import fs from 'node:fs';
import path from 'node:path';

const REPO_NAME = process.env.REPO_NAME || path.basename(process.cwd());
const COMMIT_HASH = process.env.GITHUB_SHA || process.env.COMMIT_HASH || 'manual-local';
const BRANCH = process.env.GITHUB_REF_NAME || process.env.BRANCH || 'main';

console.log(`🌲 [Knowledge Extractor] Memindai repositori: ${REPO_NAME} (Branch: ${BRANCH}, Commit: ${COMMIT_HASH.slice(0, 7)})...`);

const codeNodes = [];
const documentNodes = [];

function extractImports(code) {
  const imports = [];
  const importRegex = /import\s+(?:[\w\s{},*]+from\s+)?['"](.*?)['"]/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    if (match[1] && !imports.includes(match[1])) {
      imports.push(match[1]);
    }
  }
  return imports;
}

function extractCodeFile(fullPath, relativePath) {
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    const imports = extractImports(content);

    // 1. File Level Node
    const fileNodeId = `${REPO_NAME}::${relativePath}`;
    codeNodes.push({
      nodeId: fileNodeId,
      label: path.basename(relativePath),
      nodeType: 'file',
      sourcePath: relativePath,
      sourceLocation: `L1-L${lines.length}`,
      codeContent: content,
      dependsOn: imports,
      importedBy: []
    });

    // 2. Function / Component Level Nodes
    const funcRegex = /export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(([\s\S]*?)\)/g;
    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      const funcName = match[1];
      const matchLine = content.substring(0, match.index).split('\n').length;
      codeNodes.push({
        nodeId: `${REPO_NAME}::${relativePath}::${funcName}`,
        label: funcName,
        nodeType: 'function',
        sourcePath: relativePath,
        sourceLocation: `L${matchLine}`,
        codeContent: match[0],
        dependsOn: [fileNodeId],
        importedBy: []
      });
    }

    // 3. React Const Components (e.g. export const Button = ...)
    const compRegex = /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*(?::\s*React\.FC<[\s\S]*?>)?\s*=\s*/g;
    while ((match = compRegex.exec(content)) !== null) {
      const compName = match[1];
      const matchLine = content.substring(0, match.index).split('\n').length;
      codeNodes.push({
        nodeId: `${REPO_NAME}::${relativePath}::${compName}`,
        label: compName,
        nodeType: 'component',
        sourcePath: relativePath,
        sourceLocation: `L${matchLine}`,
        codeContent: `export const ${compName}...`,
        dependsOn: [fileNodeId],
        importedBy: []
      });
    }

    // 4. Drizzle ORM Schema Tables (e.g. export const users = sqliteTable(...))
    const schemaRegex = /export\s+const\s+([A-Za-z0-9_]+)\s*=\s*(?:sqliteTable|pgTable)\(['"](.*?)['"]/g;
    while ((match = schemaRegex.exec(content)) !== null) {
      const tableName = match[2];
      const varName = match[1];
      const matchLine = content.substring(0, match.index).split('\n').length;
      codeNodes.push({
        nodeId: `${REPO_NAME}::schema::${tableName}`,
        label: tableName,
        nodeType: 'schema',
        sourcePath: relativePath,
        sourceLocation: `L${matchLine}`,
        codeContent: `export const ${varName} = table('${tableName}')...`,
        dependsOn: [fileNodeId],
        importedBy: []
      });
    }
  } catch (err) {
    console.warn(`⚠️ [Extractor] Gagal membaca file kode ${relativePath}: ${err.message}`);
  }
}

function extractDocFile(fullPath, relativePath) {
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const fileName = path.basename(relativePath);
    const relLower = relativePath.toLowerCase();
    let docType = 'general_doc';

    if (relLower.includes('prd') || fileName.toLowerCase().startsWith('prd')) {
      docType = 'prd';
    } else if (relLower.includes('sop') || fileName.toLowerCase().startsWith('sop')) {
      docType = 'sop';
    } else if (relLower.includes('adr') || fileName.toLowerCase().startsWith('adr')) {
      docType = 'adr';
    } else if (relLower.includes('rule') || fileName.toLowerCase().startsWith('rule')) {
      docType = 'rule';
    }

    documentNodes.push({
      docId: `${REPO_NAME}::doc::${relativePath}`,
      title: fileName.replace(/\.md$/, ''),
      docType: docType,
      version: '1.0',
      sectionTitle: fileName,
      content: content,
      tags: [REPO_NAME, docType]
    });
  } catch (err) {
    console.warn(`⚠️ [Extractor] Gagal membaca file dokumen ${relativePath}: ${err.message}`);
  }
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '.next', 'dist', 'build', '.pending_changes', 'coverage'].includes(entry.name)) {
        scanDirectory(fullPath);
      }
      continue;
    }

    if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      if (!entry.name.endsWith('.d.ts')) {
        extractCodeFile(fullPath, relativePath);
      }
    } else if (entry.name.endsWith('.md')) {
      extractDocFile(fullPath, relativePath);
    }
  }
}

// Jalankan scanner
scanDirectory(process.cwd());

const payload = {
  repository: REPO_NAME,
  commit_hash: COMMIT_HASH,
  branch: BRANCH,
  code_nodes: codeNodes,
  document_nodes: documentNodes,
  timestamp: new Date().toISOString()
};

fs.writeFileSync('knowledge-payload.json', JSON.stringify(payload, null, 2));
console.log(`✅ [Knowledge Extractor] Selesai! Berhasil mengekstrak ${codeNodes.length} node kode dan ${documentNodes.length} dokumen.`);
