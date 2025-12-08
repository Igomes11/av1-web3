import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarrinhoService } from './carrinho.service';
import { CarrinhoController } from './carrinho.controller';
import { Carrinho } from './entities/carrinho.entity';
import { ItemCarrinho } from './entities/item-carrinho.entity';
import { Produto } from '../produto/entities/produto.entity';
import { Cliente } from '../cliente/entities/cliente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carrinho, ItemCarrinho, Produto, Cliente])
  ],
  controllers: [CarrinhoController],
  providers: [CarrinhoService],
  exports: [CarrinhoService]
})
export class CarrinhoModule {}