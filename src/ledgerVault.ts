// src/ledgerVault.ts
import Database from 'better-sqlite3';

export interface TimelineRow {
  timestamp: string;
  componentId: string;
  eventType: string;
  textPayload: string;
  isLandmark: number;
}

class SandboxedDatabaseVault {
  /**
   * Component 10: Manages time-series event sourcing.
   * Maps tracking logs across our inverted temporal zones: THEN (history) vs BEFORE (future).
   */
  private db: any;

  constructor(dbPath = "brainstorm_master_vault.db") {
    self.db = new Database(dbPath);
    self.initializeVaultSchema();
  }

  private initializeVaultSchema(): void {
    self.db.exec(`
      CREATE TABLE IF NOT EXISTS temporal_matrix_history (
        event_id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        component_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        coord_x INTEGER,
        coord_y INTEGER,
        text_payload TEXT,
        temporal_zone TEXT NOT NULL,
        is_landmark INTEGER DEFAULT 0
      );
    `);
  }

  public clearTransientLogs(): void {
    self.db.prepare("DELETE FROM temporal_matrix_history").run();
  }

  public logTimelineTransition(compId: string, evtType: string, x: number, y: number, payload: string, zone: string, isLandmark = 0): void {
    const timestamp = new Date().toLocaleTimeString();
    const statement = self.db.prepare(`
      INSERT INTO temporal_matrix_history (timestamp, component_id, event_type, coord_x, coord_y, text_payload, temporal_zone, is_landmark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    statement.run(timestamp, compId, evtType, x, y, payload, zone, isLandmark);
  }

  public purgeSlateShieldingLandmarks(): void {
    self.db.prepare("DELETE FROM temporal_matrix_history WHERE is_landmark = 0").run();
  }

  public fetchAllTimelineRows(): TimelineRow[] {
    return self.db.prepare("SELECT timestamp, component_id, event_type, text_payload, is_landmark FROM temporal_matrix_history ORDER BY event_id ASC").all() as TimelineRow[];
  }
}

export default SandboxedDatabaseVault;
