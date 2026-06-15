import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Guard for API token authentication.
 * Checks X-API-Key header against stored API tokens.
 */
@Injectable()
export class ApiTokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      return false;
    }

    // This will be implemented when the ApiToken entity is available
    // For now, pass through to JWT auth
    return false;
  }
}
