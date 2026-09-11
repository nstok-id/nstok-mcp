import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export interface EnvironmentConfig {
  nodeEnv: string;
  serverName: string;
  serverVersion: string;
  workspaceRoot: string;
  allowedRepoPattern: RegExp;
  allowedCommands: string[];
  maxAutoFixAttempts: number;
  defaultAppTemplate: string;
  defaultFeatureTemplate: string;
  databaseUrl?: string;
  enableAuditLog: boolean;
  auditLogPath: string;
}

export const config: EnvironmentConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  serverName: 'nstok-mcp-server',
  serverVersion: '1.0.0',
  workspaceRoot: process.env.NSTOK_WORKSPACE_ROOT || process.cwd(),
  allowedRepoPattern: /^Nstok-[\w-]+$/i,
  allowedCommands: ['node', 'npm', 'npx', 'git', 'pnpm', 'yarn', 'tsc'],
  maxAutoFixAttempts: parseInt(process.env.MAX_AUTO_FIX_ATTEMPTS || '3', 10),
  defaultAppTemplate: 'Nstok-app-template',
  defaultFeatureTemplate: 'Nstok-feature-template',
  databaseUrl: process.env.DATABASE_URL,
  enableAuditLog: process.env.ENABLE_AUDIT_LOG !== 'false',
  auditLogPath: process.env.AUDIT_LOG_PATH || path.join(process.cwd(), 'audit.log.jsonl'),
};
