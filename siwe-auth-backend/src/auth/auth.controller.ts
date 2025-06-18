import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { SiweDto } from './dtos/siwe.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly logger = new Logger(AuthController.name);

  // @Post('signup')
  // async signUp(@Body() signupData: SignupDto) {
  //   return this.authService.signUp(signupData);
  // }

  // @Post('login')
  // async login(
  //   @Body() credentails: LoginDto,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   const { accessToken, refreshToken } =
  //     await this.authService.login(credentails);

  //   response.cookie('refresh_token', refreshToken, {
  //     httpOnly: true,
  //     secure: false, //TODO: according to docs this should be true in prod as there is HTTPS!
  //   });
  // }

  @Post('nonce')
  async getNonce() {
    this.logger.log('Generating nonce...');
    const nonce = await this.authService.getNonce();
    this.logger.log('Nonce generated successfully');
    return { nonce };
  }

  @Post('siwe')
  async siweLogin(
    @Body() siweDto: SiweDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.log('SIWE login attempt...');
    const { accessToken, refreshToken } =
      await this.authService.siweLogin(siweDto);

    this.logger.log('SIWE login successful');

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false, //TODO: according to docs this should be true in prod as there is HTTPS!
      sameSite: 'lax',
    });

    return { accessToken };
  }

  @Post('refresh')
  async refreshTokens(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.log('Refresh token attempt...');
    const refreshTokenString = request.cookies['refresh_token'];
    if (!refreshTokenString) {
      this.logger.log('Refresh token not found');
      throw new UnauthorizedException('Refresh token not found');
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshTokens(refreshTokenString);
    this.logger.log('Refresh token successful');

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false, //TODO: according to docs this should be true in prod as there is HTTPS!
      sameSite: 'lax',
    });

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.log('Logout attempt...');
    const refreshTokenString = request.cookies['refresh_token'];
    if (refreshTokenString) {
      await this.authService.logout(refreshTokenString);
    }
    response.clearCookie('refresh_token');
    this.logger.log('Logout successful');
    return { message: 'Logged out successfully' };
  }

  @Get('test-auth')
  async testAuth(@Req() request: Request) {
    this.logger.log('Test auth endpoint accessed');
    return {
      message: 'Authentication successful',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('siwe-message')
  async getSiweMessage(
    @Body()
    body: {
      address: string;
      chainId: number;
      domain: string;
      uri: string;
    },
  ) {
    this.logger.log('Generating SIWE message...');
    const result = await this.authService.generateSiweMessage(
      body.address,
      body.chainId,
      body.domain,
      body.uri,
      'Sign in with Ethereum to the app.',
    );
    return result;
  }
}
