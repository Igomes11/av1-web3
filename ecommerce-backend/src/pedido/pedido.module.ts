/**
 * pedido.module.ts
 * 
 * Módulo responsável pelo gerenciamento de pedidos no e-commerce.
 * Fornece funcionalidades para criação, consulta e gestão de pedidos,
 * integrando-se com outros módulos do sistema.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoService } from './pedido.service';
import { PedidoController } from './pedido.controller';

// Entidades relacionadas
import { Pedido } from './entities/pedido.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Endereco } from '../endereco/entities/endereco.entity';
import { Produto } from '../produto/entities/produto.entity';
import { ItemPedido } from '../item-pedido/entities/item-pedido.entity';

// Módulos relacionados
import { ItemPedidoModule } from '../item-pedido/item-pedido.module';

/**
 * Módulo de Pedidos
 * 
 * Configuração do módulo de pedidos do e-commerce, responsável por:
 * - Registro das entidades no TypeORM
 * - Configuração de dependências
 * - Exposição de controllers e services
 * 
 * @module PedidoModule
 */
@Module({
  imports: [
    // Registro das entidades no TypeORM
    TypeOrmModule.forFeature([
      Pedido,      // Entidade principal de pedidos
      Cliente,     // Relacionamento com clientes
      Endereco,    // Endereços de entrega
      Produto,     // Produtos do pedido
      ItemPedido   // Itens individuais do pedido
    ]),
    // Módulo de itens de pedido para gerenciamento de produtos
    ItemPedidoModule,
  ],
  controllers: [PedidoController],  // Controller para endpoints HTTP
  providers: [PedidoService],       // Service para lógica de negócio
  exports: [PedidoService],         // Disponibiliza service para outros módulos
})
export class PedidoModule {}