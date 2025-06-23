import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StorageService } from './storage/storage.service';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './schemas/user.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import { Nonce } from './schemas/nonce.schema';
import { ProfileController } from './controllers/profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken, Nonce])],
  controllers: [AuthController, ProfileController],
  providers: [AuthService, StorageService, RefreshTokenService],
})
export class AuthModule {}
