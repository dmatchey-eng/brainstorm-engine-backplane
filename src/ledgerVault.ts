// src/ledgerVault.ts
import sqlite3 from 'sqlite3';

class SandboxedDatabaseVault {
  private db: sqlite3.Database;

  constructor(dbPath = "brainstorm_master_vault.db") {
    // Open the local database file via standard asynchronous drivers
    self.db = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error("❌ Database binding failed:", err.message);
    });
    self.initializeVaultSchema();
  }

  private initializeVaultSchema(): void {
    self.db.serialize(() => {
      self.db.run(`
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
    });
  }

  public clearTransientLogs(): void {
    self.db.run("DELETE FROM temporal_matrix_history");
  }

  public logTimelineTransition(compId: string, evtType: string, x: number, y: number, payload: string, zone: string, isLandmark = 0): void {
    const timestamp = new Date().toLocaleTimeString();
    const stmt = self.db.prepare(`
      INSERT INTO temporal_matrix_history (timestamp, component_id, event_type, coord_x, coord_y, text_payload, temporal_zone, is_landmark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(timestamp, compId, evtType, x, y, payload, zone, isLandmark);
    stmt.finalize();
  }

  public purgeSlateShieldingLandmarks(): void {
    self.db.run("DELETE FROM temporal_matrix_history WHERE is_landmark = 0");
  }
}

export default SandboxedDatabaseVault;
