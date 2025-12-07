// ecommerce-backend/src/cliente/cliente.module.ts

import { Module, forwardRef } from '@nestjs/common'; // <-- NOVO: Importa forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { Cliente } from './entities/cliente.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  // Registra a entidade Cliente para que o Service possa injetar o repositório
  imports: [
    TypeOrmModule.forFeature([Cliente]),
    forwardRef(() => AuthModule), // <-- FIX: Envolve o AuthModule com forwardRef
  ],
  controllers: [ClienteController],
  providers: [ClienteService],
  // Exporta o serviço para ser usado em outros módulos (ex: Pedido)
  exports: [ClienteService, TypeOrmModule],
})
export class ClienteModule {}
