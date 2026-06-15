import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../enums';

/**
 * Guard to check if the user is the owner of a resource or has higher privileges.
 * This is a base class - extend it for specific entities.
 */
@Injectable()
export abstract class OwnershipGuard implements CanActivate {
  abstract getResourceOwnerId(request: any): Promise<string | null>;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    // Admin can access everything
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const ownerId = await this.getResourceOwnerId(request);

    if (!ownerId) {
      return true; // New resource, allow creation
    }

    // Manager can access their own and their team's resources
    if (user.role === UserRole.MANAGER) {
      // For now, managers can access any resource they're assigned to or created
      return ownerId === user.id || request.params?.assignedTo === user.id;
    }

    // Employee can only access their own resources
    return ownerId === user.id;
  }
}
