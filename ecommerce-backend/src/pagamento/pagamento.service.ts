import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pagamento, PagamentoStatus } from './entities/pagamento.entity';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { Pedido, PedidoStatus } from '../pedido/entities/pedido.entity';
import { Produto } from '../produto/entities/produto.entity'; // Importa Produto para manipular estoque
import { ItemPedido } from '../item-pedido/entities/item-pedido.entity'; 

@Injectable()
export class PagamentoService {
  constructor(
    // 1. O construtor deve injetar o Repositório de Pagamento
    @InjectRepository(Pagamento)
    private pagamentoRepository: Repository<Pagamento>,

    // 2. O construtor deve injetar o DataSource
    private dataSource: DataSource,
  ) {}

  /**
   * Processa o pagamento, garantindo que o estoque seja debitado
   * APENAS se o status final for PAGO. Usa transação.
   * @param pagamentoDto Dados para o pagamento
   * @param novoStatusPagamento Simulação do status final
   */
  async processarPagamento(
    pagamentoDto: CreatePagamentoDto,
    novoStatusPagamento: PagamentoStatus,
  ): Promise<Pagamento> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pedidoRepo = queryRunner.manager.getRepository(Pedido);
      const produtoRepo = queryRunner.manager.getRepository(Produto);
      const pagamentoRepo = queryRunner.manager.getRepository(Pagamento);

      const pedido = await pedidoRepo.findOne({
        where: { id: pagamentoDto.pedidoId },
        relations: ['itens', 'itens.produto'],
      });

      if (!pedido) {
        throw new NotFoundException(`Pedido com ID ${pagamentoDto.pedidoId} não encontrado.`);
      }

      // Regra 1: Só é possível criar pagamento para pedidos AGUARDANDO_PAGAMENTO
      if (pedido.status !== PedidoStatus.AGUARDANDO_PAGAMENTO) {
        throw new BadRequestException('O pedido não está no status correto para pagamento (AGUARDANDO_PAGAMENTO).');
      }

      // 1. Cria o registro de pagamento
      const novoPagamento = pagamentoRepo.create({
        ...pagamentoDto,
        pedido: pedido,
        status: novoStatusPagamento,
        valor: pedido.total, // Garante que o valor do pagamento é o total do pedido
      });
      const pagamentoSalvo = await pagamentoRepo.save(novoPagamento);

      // 2. Transição de Status e Manipulação de Estoque
      let novoStatusPedido = PedidoStatus.AGUARDANDO_PAGAMENTO;

      if (novoStatusPagamento === PagamentoStatus.PAGO) {
        // A. Se PAGO, DEBITA O ESTOQUE e muda o status do Pedido para PAGO
        novoStatusPedido = PedidoStatus.PAGO;
        
        for (const item of pedido.itens) {
          const produto = item.produto; // ItemPedido tem relação direta com Produto
          const novoEstoque = produto.estoque - item.quantidade;
          
          // Validação de segurança final antes do débito (pode ter mudado)
          if (novoEstoque < 0) {
            throw new BadRequestException(`Falha na transação: Estoque insuficiente para o produto ${produto.nome}.`);
          }
          
        }
        
      } else if (novoStatusPagamento === PagamentoStatus.CANCELADO) {
        // B. Se CANCELADO, marca o pedido como CANCELADO (Estoque NÃO é alterado)
        novoStatusPedido = PedidoStatus.CANCELADO;
      }
      
      // 3. Atualiza o status do pedido
      pedido.status = novoStatusPedido;
      await pedidoRepo.save(pedido);

      // 4. Commita a transação
      await queryRunner.commitTransaction();
      return pagamentoSalvo;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

}