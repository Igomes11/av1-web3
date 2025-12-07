// ecommerce-backend/src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cliente } from '../cliente/entities/cliente.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // Gera o token JWT para o cliente autenticado
  async login(cliente: Cliente) {
    const payload = {
      email: cliente.email,
      id: cliente.id,
      role: cliente.role, // Inclui o papel no token
    };
    return {
      access_token: this.jwtService.sign(payload),
      id: cliente.id,
      email: cliente.email,
      role: cliente.role,
    };
  }
}
