// ecommerce-backend/src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClienteService } from '../cliente/cliente.service';

// Interface para o payload do JWT
export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private clienteService: ClienteService) {
    // Configura a estratégia para usar o token Bearer e uma chave secreta
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SUA_CHAVE_SECRETA_MUITO_FORTE', // TODO: Usar variável de ambiente!
    });
  }

  // Método que valida o token e retorna o usuário (payload)
  async validate(payload: JwtPayload): Promise<any> {
    // Aqui você pode adicionar lógica para buscar o usuário no banco, se necessário
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  }
}
