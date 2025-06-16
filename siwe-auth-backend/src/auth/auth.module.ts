import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StorageService } from './storage/storage.service';
import { RefreshTokenService } from './refresh-token/refresh-token.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, StorageService, RefreshTokenService],
})
export class AuthModule {}
