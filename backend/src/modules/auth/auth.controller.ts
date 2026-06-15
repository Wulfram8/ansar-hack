import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, CreateApiTokenDto } from './dto';
import { Auth, CurrentUser } from '../../common/decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout (invalidate refresh token)' })
  logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }
}

@ApiTags('API Tokens')
@Controller('api-tokens')
export class ApiTokensController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List your API tokens' })
  @ApiResponse({ status: 200, description: 'List of API tokens' })
  listTokens(@CurrentUser('id') userId: string) {
    return this.authService.listApiTokens(userId);
  }

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a new API token' })
  @ApiResponse({ status: 201, description: 'Token created (full token shown only once)' })
  createToken(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateApiTokenDto,
  ) {
    return this.authService.createApiToken(userId, dto);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke an API token' })
  @ApiResponse({ status: 204, description: 'Token revoked' })
  revokeToken(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) tokenId: string,
  ) {
    return this.authService.revokeApiToken(userId, tokenId);
  }
}
