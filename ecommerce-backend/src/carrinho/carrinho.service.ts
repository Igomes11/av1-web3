import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrinho } from './entities/carrinho.entity';
import { ItemCarrinho } from './entities/item-carrinho.entity';
import { Produto } from '../produto/entities/produto.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CarrinhoService {
  constructor(
    @InjectRepository(Carrinho)
    private carrinhoRepository: Repository<Carrinho>,
    @InjectRepository(ItemCarrinho)
    private itemCarrinhoRepository: Repository<ItemCarrinho>,
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  // Busca o carrinho do cliente, se não existir, cria um.
  async findOrCreateCart(clienteId: number): Promise<Carrinho> {
    let carrinho = await this.carrinhoRepository.findOne({
      where: { cliente: { id: clienteId } },
      relations: ['itens', 'itens.produto'],
    });

    if (!carrinho) {
      const cliente = await this.clienteRepository.findOne({ where: { id: clienteId } });
      if (!cliente) throw new NotFoundException('Cliente não encontrado');

      carrinho = this.carrinhoRepository.create({ cliente, itens: [] });
      return this.carrinhoRepository.save(carrinho);
    }

    return carrinho;
  }

  // Adiciona item ao carrinho
  async addItem(clienteId: number, addItemDto: AddItemDto): Promise<Carrinho> {
    const { produtoId, quantidade } = addItemDto;
    const carrinho = await this.findOrCreateCart(clienteId);

    const produto = await this.produtoRepository.findOne({ where: { id: produtoId } });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    // Validação de Estoque (Lógica Core simples)
    if (produto.estoque < quantidade) {
      throw new BadRequestException(`Estoque insuficiente. Disponível: ${produto.estoque}`);
    }

    // Verifica se o item já existe no carrinho
    const itemExistente = carrinho.itens.find(item => item.produto.id === produtoId);

    if (itemExistente) {
      itemExistente.quantidade += quantidade;
      // Re-validar estoque com a nova quantidade total
      if (produto.estoque < itemExistente.quantidade) {
         throw new BadRequestException('Quantidade total excede o estoque disponível.');
      }
      await this.itemCarrinhoRepository.save(itemExistente);
    } else {
      const novoItem = this.itemCarrinhoRepository.create({
        carrinho,
        produto,
        quantidade,
      });
      await this.itemCarrinhoRepository.save(novoItem);
    }

    return this.findOrCreateCart(clienteId); // Retorna carrinho atualizado
  }

  // Atualiza quantidade de um item
  async updateItem(clienteId: number, itemId: number, updateDto: UpdateItemDto): Promise<Carrinho> {
    const item = await this.itemCarrinhoRepository.findOne({
      where: { id: itemId },
      relations: ['produto', 'carrinho', 'carrinho.cliente']
    });

    if (!item || item.carrinho.cliente.id !== clienteId) {
      throw new NotFoundException('Item não encontrado neste carrinho');
    }

    if (item.produto.estoque < updateDto.quantidade) {
      throw new BadRequestException('Estoque insuficiente para a quantidade solicitada');
    }

    item.quantidade = updateDto.quantidade;
    await this.itemCarrinhoRepository.save(item);

    return this.findOrCreateCart(clienteId);
  }

  // Remove item do carrinho
  async removeItem(clienteId: number, itemId: number): Promise<Carrinho> {
    const item = await this.itemCarrinhoRepository.findOne({
        where: { id: itemId },
        relations: ['carrinho', 'carrinho.cliente']
    });

    if (!item || item.carrinho.cliente.id !== clienteId) {
        throw new NotFoundException('Item não encontrado');
    }

    await this.itemCarrinhoRepository.remove(item);
    return this.findOrCreateCart(clienteId);
  }

  // Limpa o carrinho
  async clearCart(clienteId: number): Promise<void> {
    const carrinho = await this.findOrCreateCart(clienteId);
    await this.itemCarrinhoRepository.remove(carrinho.itens);
  }
}