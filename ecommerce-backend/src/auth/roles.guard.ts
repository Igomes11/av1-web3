// ecommerce-backend/src/auth/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cliente, Role } from '../cliente/entities/cliente.entity';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    // O request.user é populado pelo AuthGuard/JwtStrategy
    const { user } = context.switchToHttp().getRequest();

    // Verifica se o papel do usuário está na lista de papéis requeridos
    return requiredRoles.some((role) => user.role === role);
  }
}
