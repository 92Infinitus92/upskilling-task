import { StorageService } from './../storage/storage.service';
import { Controller, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Get } from '@nestjs/common';

@Controller('profile')
export class ProfileController {
  constructor(private readonly storageService: StorageService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(@Req() req) {
    const address = req.user.address;
    const user = await this.storageService.findByAddress(address);
    if (!user) {
      return {
        address,
        isRegistered: false,
      };
    }
    return {
      id: user._id,
      address: user.address,
      name: user.name,
      isRegistered: true,
    };
  }
}
