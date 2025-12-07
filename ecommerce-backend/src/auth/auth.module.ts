// ecommerce-backend/src/auth/auth.module.ts

import { Module, forwardRef } from '@nestjs/common'; // <-- NOVO: Importa forwardRef
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { ClienteModule } from '../cliente/cliente.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    forwardRef(() => ClienteModule), // <-- FIX: Envolve o ClienteModule com forwardRef
    PassportModule,
    JwtModule.register({
      secret: 'SUA_CHAVE_SECRETA_MUITO_FORTE', // TODO: Usar variável de ambiente!
      signOptions: { expiresIn: '60m' }, // Token expira em 60 minutos
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
