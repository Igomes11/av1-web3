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

  async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    const { clienteId, enderecoId, itens: itensDto } = createPedidoDto;

    // 1. Validação de Entidades base
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

    // 2. Prepara o Pedido (Status ABERTO)
    const novoPedido = this.pedidoRepository.create({
      cliente,
      endereco,
      status: PedidoStatus.ABERTO,
      dataCriacao: new Date(),
    });

    // 3. Salva o pedido primeiro para obter um ID válido
    const pedidoSalvo = await this.pedidoRepository.save(novoPedido);

    // 4. Processa e valida os itens, verificando o estoque e associando ao pedido salvo
    const itensEntityPromises = itensDto.map((itemDto) =>
      this.itemPedidoService.createItem(pedidoSalvo, itemDto),
    );

    const itensEntity = await Promise.all(itensEntityPromises);

    // 4. Calcula Totais
    let subtotalGeral = 0;
    let quantidadeTotal = 0;

    itensEntity.forEach((item) => {
      subtotalGeral += item.subtotal;
      quantidadeTotal += item.quantidade;
    });

    // Atualiza o objeto Pedido salvo com os cálculos e itens persistidos
    pedidoSalvo.subtotal = subtotalGeral;
    pedidoSalvo.total = subtotalGeral;
    pedidoSalvo.quantidadeTotal = quantidadeTotal;
    pedidoSalvo.itens = itensEntity;

    // 5. Salva novamente o pedido já com itens vinculados
    return this.pedidoRepository.save(pedidoSalvo);
  }

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

  async findAllByCliente(clienteId: number): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      where: { cliente: { id: clienteId } },
      order: { dataCriacao: 'DESC' },
      relations: ['endereco', 'itens', 'itens.produto'],
    });
  }

  async updateStatus(id: number, newStatus: PedidoStatus): Promise<Pedido> {
    const pedido = await this.findOne(id);

    //Impede a alteração de status se o pedido já foi pago ou cancelado.
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
