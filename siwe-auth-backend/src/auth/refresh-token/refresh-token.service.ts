import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { randomBytes } from 'crypto';
import { RefreshToken } from '../schemas/refresh-token.schema';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly storageService: StorageService) {}

  async createRefreshToken(userId: string): Promise<string> {
    const tokenString = randomBytes(40).toString('hex');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    // expiryDate.setSeconds(expiryDate.getSeconds() + 60);

    const refreshToken = new RefreshToken();
    refreshToken.token = tokenString;
    refreshToken.userId = userId;
    refreshToken.expiryDate = expiryDate;

    await this.storageService.saveRefreshToken(refreshToken);
    return tokenString;
  }

  async validateRefreshToken(
    tokenString: string,
  ): Promise<RefreshToken | null> {
    const token = await this.storageService.findRefreshToken(tokenString);

    if (!token) {
      return null;
    }

    if (token.expiryDate < new Date()) {
      await this.storageService.deleteRefreshToken(tokenString);
      return null;
    }
    return token;
  }

  async deleteRefreshToken(tokenString: string): Promise<void> {
    await this.storageService.deleteRefreshToken(tokenString);
  }
}
