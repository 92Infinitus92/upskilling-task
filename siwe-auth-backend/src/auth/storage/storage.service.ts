import { Injectable } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { Nonce } from '../schemas/nonce.schema';
import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Nonce)
    private readonly nonceRepository: Repository<Nonce>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async create(user: User): Promise<void> {
    await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ _id: id });
  }

  async findByAddress(address: string): Promise<User | null> {
    return this.userRepository.findOneBy({ address });
  }

  async saveRefreshToken(refreshToken: RefreshToken): Promise<void> {
    await this.refreshTokenRepository.save(refreshToken);
  }

  async findRefreshToken(tokenString: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { token: tokenString },
      relations: ['user'],
    });
  }

  async deleteRefreshToken(tokenString: string): Promise<void> {
    await this.refreshTokenRepository.delete({ token: tokenString });
  }

  async saveNonce(nonce: string): Promise<void> {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 15);

    const nonceEntity = new Nonce();
    nonceEntity.value = nonce;
    nonceEntity.expiryDate = expiryDate;

    await this.nonceRepository.save(nonceEntity);

    this.cleanupExpiredNonces();
  }

  async saveNonceWithMessage(nonce: string, message: string): Promise<void> {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 15);

    const nonceEntity = new Nonce();
    nonceEntity.value = nonce;
    nonceEntity.siweMessage = message;
    nonceEntity.expiryDate = expiryDate;

    await this.nonceRepository.save(nonceEntity);

    // Cleanup expired nonces occasionally
    this.cleanupExpiredNonces();
  }

  async validateNonce(nonce: string): Promise<boolean> {
    const nonceEntity = await this.nonceRepository.findOneBy({ value: nonce });

    if (nonceEntity) {
      if (nonceEntity.expiryDate && nonceEntity.expiryDate < new Date()) {
        await this.nonceRepository.remove(nonceEntity);
        return false;
      }

      await this.nonceRepository.remove(nonceEntity);
      return true;
    }

    return false;
  }

  async validateNonceAndMessage(
    nonce: string,
    message: string,
  ): Promise<boolean> {
    const nonceEntity = await this.nonceRepository.findOneBy({ value: nonce });

    if (nonceEntity) {
      if (nonceEntity.expiryDate && nonceEntity.expiryDate < new Date()) {
        await this.nonceRepository.remove(nonceEntity);
        return false;
      }

      await this.nonceRepository.remove(nonceEntity);

      return nonceEntity.siweMessage === message;
    }

    return false;
  }

  private async cleanupExpiredNonces(): Promise<void> {
    try {
      await this.nonceRepository.delete({
        expiryDate: LessThan(new Date()),
      });
    } catch (error) {
      console.error('Failed to clean up expired nonces:', error);
    }
  }
}
