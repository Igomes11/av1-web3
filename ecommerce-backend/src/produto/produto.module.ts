import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutoService } from './produto.service';
import { ProdutoController } from './produto.controller';
import { Produto } from './entities/produto.entity';
import { Categoria } from '../categoria/entities/categoria.entity';

@Module({
  // Registra Produto e Categoria, pois o ProdutoService precisa dos dois repositórios
  imports: [TypeOrmModule.forFeature([Produto, Categoria])],
  controllers: [ProdutoController],
  providers: [ProdutoService],
  // Exportamos o serviço para que PedidoModule possa usá-lo
  exports: [ProdutoService, TypeOrmModule],
})
export class ProdutoModule {}
