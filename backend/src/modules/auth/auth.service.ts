import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RefreshToken, ApiToken } from './entities';
import { LoginDto, RegisterDto, RefreshTokenDto, CreateApiTokenDto } from './dto';
import { UserRole } from '../../common/enums';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(ApiToken)
    private apiTokenRepository: Repository<ApiToken>,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
      role: UserRole.EMPLOYEE, // Default role for self-registration
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const tokenHash = this.hashToken(refreshTokenDto.refreshToken);

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash, isRevoked: false },
      relations: ['user'],
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old token
    storedToken.isRevoked = true;
    await this.refreshTokenRepository.save(storedToken);

    // Generate new tokens
    return this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
    );
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.refreshTokenRepository.update(
      { tokenHash },
      { isRevoked: true },
    );
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      createdAt: user.createdAt,
    };
  }

  // API Token Management
  async createApiToken(userId: string, dto: CreateApiTokenDto) {
    const rawToken = `crm_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const tokenPrefix = rawToken.substring(0, 8);

    const apiToken = this.apiTokenRepository.create({
      name: dto.name,
      tokenHash,
      tokenPrefix,
      userId,
      scopes: dto.scopes || [],
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });

    const saved = await this.apiTokenRepository.save(apiToken);

    return {
      id: saved.id,
      name: saved.name,
      token: rawToken, // Only returned once
      tokenPrefix: saved.tokenPrefix,
      scopes: saved.scopes,
      expiresAt: saved.expiresAt,
      createdAt: saved.createdAt,
    };
  }

  async listApiTokens(userId: string) {
    return this.apiTokenRepository.find({
      where: { userId, isRevoked: false },
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'tokenPrefix', 'scopes', 'lastUsedAt', 'expiresAt', 'createdAt'],
    });
  }

  async revokeApiToken(userId: string, tokenId: string) {
    const token = await this.apiTokenRepository.findOne({
      where: { id: tokenId, userId },
    });

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    token.isRevoked = true;
    await this.apiTokenRepository.save(token);
  }

  async validateApiToken(rawToken: string) {
    const tokenPrefix = rawToken.substring(0, 8);
    const tokens = await this.apiTokenRepository.find({
      where: { tokenPrefix, isRevoked: false },
      relations: ['user'],
    });

    for (const token of tokens) {
      const isValid = await bcrypt.compare(rawToken, token.tokenHash);
      if (isValid) {
        if (token.expiresAt && token.expiresAt < new Date()) {
          continue;
        }

        // Update last used
        token.lastUsedAt = new Date();
        await this.apiTokenRepository.save(token);

        return {
          id: token.user.id,
          email: token.user.email,
          role: token.user.role,
          firstName: token.user.firstName,
          lastName: token.user.lastName,
          scopes: token.scopes,
        };
      }
    }

    return null;
  }

  // Private helpers
  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.accessExpiration') as any,
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = this.hashToken(refreshToken);

    // Calculate refresh token expiry
    const refreshExpiration = this.configService.get<string>('jwt.refreshExpiration') || '7d';
    const expiresAt = new Date();
    const days = parseInt(refreshExpiration.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.refreshTokenRepository.save({
      tokenHash: refreshTokenHash,
      userId,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
