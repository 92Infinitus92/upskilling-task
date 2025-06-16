import { Injectable } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { RefreshToken } from '../schemas/refresh-token.schema';

@Injectable()
export class StorageService {
  private storage: Map<string, User> = new Map();
  private refreshTokenStorage: Map<string, RefreshToken> = new Map();
  private nonces: Set<string> = new Set();
  private lastId = 0;

  private generateId(): string {
    this.lastId++;
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${this.lastId}-${random}`;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.storage.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async create(user: User): Promise<void> {
    const id = this.generateId();
    this.storage.set(id, new User({ ...user, _id: id }));
  }

  async findById(id: string): Promise<User | null> {
    return this.storage.get(id) || null;
  }

  async findByAddress(address: string): Promise<User | null> {
    for (const user of this.storage.values()) {
      if (
        user.address &&
        user.address.toLocaleLowerCase() === address.toLocaleLowerCase()
      ) {
        return user;
      }
    }
    return null;
  }

  async saveRefreshToken(refreshToken: RefreshToken): Promise<void> {
    this.refreshTokenStorage.set(refreshToken.token, refreshToken);
  }

  async findRefreshToken(tokenString: string): Promise<RefreshToken | null> {
    return this.refreshTokenStorage.get(tokenString) || null;
  }

  async deleteRefreshToken(tokenString: string): Promise<void> {
    this.refreshTokenStorage.delete(tokenString);
  }

  async saveNonce(nonce: string): Promise<void> {
    this.nonces.add(nonce);
  }

  async validateNonce(nonce: string): Promise<boolean> {
    if (this.nonces.has(nonce)) {
      this.nonces.delete(nonce);
      return true;
    }
    return false;
  }
}
