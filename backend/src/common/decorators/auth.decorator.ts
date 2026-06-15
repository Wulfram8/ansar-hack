import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../enums';

/**
 * Combines JWT auth + optional role guard into a single decorator.
 * Usage: @Auth(UserRole.ADMIN) or @Auth() for any authenticated user.
 */
export function Auth(...roles: UserRole[]) {
  const decorators = [
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  ];

  if (roles.length > 0) {
    decorators.push(Roles(...roles) as ClassDecorator & MethodDecorator);
  }

  return applyDecorators(...decorators);
}
