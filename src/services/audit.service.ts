import fs from 'fs';
import path from 'path';
import { config } from '../config/environment.js';

export interface AuditLogEntry {
  actor: string;
  action: string;
  repository?: string;
  path?: string;
  timestamp: string;
  jobId?: string;
  status?: 'success' | 'failed' | 'pending';
  details?: Record<string, unknown>;
}

export class AuditService {
  private static instance: AuditService;

  private constructor() {
    this.ensureLogDir();
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  private ensureLogDir() {
    if (!config.enableAuditLog) return;
    const dir = path.dirname(config.auditLogPath);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {
        // Silently handle if dir cannot be created
      }
    }
  }

  public log(entry: Omit<AuditLogEntry, 'timestamp'>): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    if (config.enableAuditLog) {
      try {
        const line = JSON.stringify(fullEntry) + '\n';
        fs.appendFileSync(config.auditLogPath, line, 'utf-8');
      } catch (err) {
        console.error('Failed to write audit log:', err);
      }
    }

    return fullEntry;
  }
}
