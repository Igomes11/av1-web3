import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemPedido } from './entities/item-pedido.entity';
import { Produto } from '../produto/entities/produto.entity';
import { Pedido } from '../pedido/entities/pedido.entity';
import { ItemPedidoDto } from '../pedido/dto/item-pedido.dto';

@Injectable()
export class ItemPedidoService {
  constructor(
    @InjectRepository(ItemPedido)
    private itemPedidoRepository: Repository<ItemPedido>,
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,
  ) {}

  async createItem(pedido: Pedido, itemDto: ItemPedidoDto): Promise<ItemPedido> {
    const { produtoId, quantidade } = itemDto;

    const produto = await this.produtoRepository.findOne({
      where: { id: produtoId, statusAtivo: true },
    });

    if (!produto) {
      throw new BadRequestException(`Produto com ID ${produtoId} não encontrado ou inativo.`);
    }

    const estoqueDisponível = produto.estoque - produto.reserved;

    if (estoqueDisponível < quantidade) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponível: ${estoqueDisponível}.`
      );
    }

    produto.reserved += quantidade;
    await this.produtoRepository.save(produto);
    
    const precoVenda = produto.preco;
    const subtotal = precoVenda * quantidade;

    const item = this.itemPedidoRepository.create({
      pedido: pedido,
      produto: produto,
      quantidade: quantidade,
      precoVenda: precoVenda,
      subtotal: subtotal,
    });

    // Salva o item para que seja persistido no banco antes de retornar
    return this.itemPedidoRepository.save(item);
  }
}
