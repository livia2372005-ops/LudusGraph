export interface LockRecord {
  nodeId: string;
  lockedBy: string; // "user" hoặc client-id
  acquiredAt: number;
  expiresAt: number;
}

export class SoftLockManager {
  private locks = new Map<string, LockRecord>();
  private defaultTtlMs = 1500; // Mặc định 1.5 giây

  /**
   * Yêu cầu cấp khóa mềm cho một phần tử node
   */
  acquire(nodeId: string, lockedBy: string, ttlMs = this.defaultTtlMs): boolean {
    const now = Date.now();
    const existing = this.locks.get(nodeId);

    // Nếu khóa cũ chưa hết hạn và thuộc về client khác
    if (existing && existing.expiresAt > now && existing.lockedBy !== lockedBy) {
      return false;
    }

    this.locks.set(nodeId, {
      nodeId,
      lockedBy,
      acquiredAt: now,
      expiresAt: now + ttlMs,
    });
    return true;
  }

  /**
   * Giải phóng khóa
   */
  release(nodeId: string, lockedBy: string): boolean {
    const existing = this.locks.get(nodeId);
    if (!existing) return true;

    if (existing.lockedBy === lockedBy) {
      this.locks.delete(nodeId);
      return true;
    }
    return false;
  }

  /**
   * Kiểm tra một phần tử có đang bị khóa hay không
   */
  isLocked(nodeId: string, checkBy?: string): boolean {
    const now = Date.now();
    const existing = this.locks.get(nodeId);
    if (!existing) return false;

    if (existing.expiresAt <= now) {
      this.locks.delete(nodeId);
      return false;
    }

    if (checkBy && existing.lockedBy === checkBy) {
      return false; // Bản thân người giữ khóa thì không tính là bị khóa
    }

    return true;
  }

  /**
   * Lấy danh sách tất cả các khóa còn hiệu lực
   */
  getActiveLocks(): LockRecord[] {
    const now = Date.now();
    const active: LockRecord[] = [];
    for (const [id, record] of this.locks.entries()) {
      if (record.expiresAt > now) {
        active.push(record);
      } else {
        this.locks.delete(id);
      }
    }
    return active;
  }
}
