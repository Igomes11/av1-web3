// ecommerce-backend/src/auth/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { Role } from '../cliente/entities/cliente.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);