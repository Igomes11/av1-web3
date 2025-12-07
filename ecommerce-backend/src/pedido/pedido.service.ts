/**
 * pedido.service.ts
 * Serviço responsável pelo gerenciamento de pedidos no sistema
 * Lida com criação, consulta e atualização de status dos pedidos
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, PedidoStatus } from './entities/pedido.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Endereco } from '../endereco/entities/endereco.entity';
import { Produto } from '../produto/entities/produto.entity';
import { ItemPedido } from '../item-pedido/entities/item-pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { ItemPedidoService } from '../item-pedido/item-pedido.service';

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Endereco)
    private enderecoRepository: Repository<Endereco>,
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,
    private readonly itemPedidoService: ItemPedidoService,
  ) {}

  /**
   * Cria um novo pedido no sistema
   *
   * @param createPedidoDto - Dados do pedido a ser criado
   * @returns Promise com o pedido criado e seus itens
   * @throws NotFoundException se cliente ou endereço não forem encontrados
   *
   * Processo:
   * 1. Valida existência do cliente e endereço
   * 2. Cria o pedido com status inicial
   * 3. Processa os itens do pedido
   * 4. Calcula totais
   * 5. Finaliza o pedido
   */
  async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    const { clienteId, enderecoId, itens: itensDto } = createPedidoDto;

    // Validação de cliente e endereço
    const cliente = await this.clienteRepository.findOne({
      where: { id: clienteId },
    });
    if (!cliente) {
      throw new NotFoundException(
        `Cliente com ID ${clienteId} não encontrado.`,
      );
    }

    const endereco = await this.enderecoRepository.findOne({
      where: { id: enderecoId },
    });
    if (!endereco) {
      throw new NotFoundException(
        `Endereço com ID ${enderecoId} não encontrado.`,
      );
    }

    // Criação inicial do pedido
    const novoPedido = this.pedidoRepository.create({
      cliente,
      endereco,
      status: PedidoStatus.AGUARDANDO_PAGAMENTO,
      dataCriacao: new Date(),
    });

    const pedidoSalvo = await this.pedidoRepository.save(novoPedido);

    // Processamento dos itens do pedido
    const itensEntityPromises = itensDto.map((itemDto) =>
      this.itemPedidoService.createItem(pedidoSalvo, itemDto),
    );
    const itensEntity = await Promise.all(itensEntityPromises);

    // Cálculo dos totais
    let subtotalGeral = 0;
    let quantidadeTotal = 0;
    itensEntity.forEach((item) => {
      subtotalGeral += item.subtotal;
      quantidadeTotal += item.quantidade;
    });

    // Atualização e finalização do pedido
    pedidoSalvo.subtotal = subtotalGeral;
    pedidoSalvo.total = subtotalGeral;
    pedidoSalvo.quantidadeTotal = quantidadeTotal;
    pedidoSalvo.itens = itensEntity;

    return this.pedidoRepository.save(pedidoSalvo);
  }

  /**
   * Busca um pedido específico com todos os seus relacionamentos
   *
   * @param id - ID do pedido a ser buscado
   * @returns Promise com o pedido e seus dados relacionados
   * @throws NotFoundException se o pedido não for encontrado
   */
  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: ['cliente', 'endereco', 'itens', 'itens.produto'],
    });
    if (!pedido) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
    }
    return pedido;
  }

  /**
   * Busca todos os pedidos de um cliente específico
   *
   * @param clienteId - ID do cliente
   * @returns Promise com array de pedidos ordenados por data
   */
  async findAllByCliente(clienteId: number): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      where: { cliente: { id: clienteId } },
      order: { dataCriacao: 'DESC' },
      relations: ['endereco', 'itens', 'itens.produto'],
    });
  }

  /**
   * Atualiza o status de um pedido
   *
   * @param id - ID do pedido
   * @param newStatus - Novo status a ser definido
   * @returns Promise com o pedido atualizado
   * @throws BadRequestException se o pedido estiver pago ou cancelado
   */
  async updateStatus(id: number, newStatus: PedidoStatus): Promise<Pedido> {
    const pedido = await this.findOne(id);

    if (pedido.status === PedidoStatus.PAGO) {
      throw new BadRequestException(
        'Não é possível alterar o status de um pedido pago.',
      );
    }
    if (pedido.status === PedidoStatus.CANCELADO) {
      throw new BadRequestException(
        'Não é possível alterar o status de um pedido cancelado.',
      );
    }

    pedido.status = newStatus;
    return this.pedidoRepository.save(pedido);
  }
}
