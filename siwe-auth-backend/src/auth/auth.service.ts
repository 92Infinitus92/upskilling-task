import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
// import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { StorageService } from './storage/storage.service';
import { User } from './schemas/user.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { generateNonce, SiweMessage } from 'siwe';

@Injectable()
export class AuthService {
  constructor(
    private storageService: StorageService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  // async signUp(signupData: SignupDto) {
  //   const { name, email, password } = signupData;

  //   const emailInUse = await this.storageService.findByEmail(email);
  //   if (emailInUse) {
  //     throw new BadRequestException('Email already in use');
  //   }

  //   const hashedPassword = await bcrypt.hash(password, 10);

  //   await this.storageService.create(
  //     new User({
  //       name,
  //       email,
  //       password: hashedPassword,
  //     }),
  //   );
  // }

  // async login(credentials: LoginDto) {
  //   const user = await this.storageService.findByEmail(credentials.email);

  //   // User must exist and have a password for classic login
  //   if (!user || !user.password) {
  //     throw new UnauthorizedException('Invalid credentials.');
  //   }

  //   const passwordMatches = await bcrypt.compare(
  //     credentials.password,
  //     user.password,
  //   );

  //   if (!passwordMatches) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }

  //   if (!user._id) {
  //     throw new InternalServerErrorException('User ID not found');
  //   }

  //   return this.generateToken(user._id);
  // }

  async generateToken(userId: string) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '30s' });

    const refreshToken =
      await this.refreshTokenService.createRefreshToken(userId);
    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshTokenString: string) {
    const existingRefreshToken =
      await this.refreshTokenService.validateRefreshToken(refreshTokenString);

    if (!existingRefreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const userId = existingRefreshToken.userId;
    if (!userId) {
      await this.refreshTokenService.deleteRefreshToken(refreshTokenString);
      throw new InternalServerErrorException('User ID not found');
    }

    await this.refreshTokenService.deleteRefreshToken(refreshTokenString);

    return this.generateToken(userId);
  }

  async getNonce(): Promise<string> {
    const nonce = generateNonce();
    await this.storageService.saveNonce(nonce);
    return nonce;
  }

  async siweLogin(siweLoginDto: { message: string; signature: string }) {
    const { message, signature } = siweLoginDto;
    const siweMessage = new SiweMessage(message);

    try {
      const fields = await siweMessage.verify({ signature });

      const nonceIsValid = await this.storageService.validateNonce(
        fields.data.nonce,
      );

      if (!nonceIsValid) {
        throw new UnauthorizedException('Invalid nonce');
      }

      const { address } = fields.data;
      let user = await this.storageService.findByAddress(address);
      if (!user) {
        await this.storageService.create(new User({ address }));
        user = await this.storageService.findByAddress(address);
      }

      if (!user || !user._id) {
        throw new InternalServerErrorException('User ID not found');
      }

      return this.generateToken(user._id);
    } catch (error) {
      throw new UnauthorizedException('Invalid signature');
    }
  }

  async logout(refreshTokenString: string) {
    await this.refreshTokenService.deleteRefreshToken(refreshTokenString);
  }
}
