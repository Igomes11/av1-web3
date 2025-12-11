
/**
 * pedido.cron.service.ts
 * Serviço responsável por executar tarefas agendadas (CRON) relacionadas a pedidos
 * Cancela automaticamente pedidos expirados e devolve estoque
 */

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Pedido, PedidoStatus } from './entities/pedido.entity';
import { Produto } from '../produto/entities/produto.entity';

@Injectable()
export class PedidoCronService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,
  ) {}

  /**
   * Executa a cada 5 minutos para verificar e cancelar pedidos expirados
   * 
   * Processo:
   * 1. Busca pedidos aguardando pagamento há mais de 30 minutos
   * 2. Devolve o estoque dos produtos ao repositório
   * 3. Atualiza o status para CANCELADO
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCronCancelamentoPedidos() {
    console.log('Executando Cron Job: Verificando pedidos expirados...');

    try {
      // Define o tempo limite (30 minutos atrás)
      const tempoLimite = new Date();
      tempoLimite.setMinutes(tempoLimite.getMinutes() - 30);

      // Busca pedidos AGUARDANDO_PAGAMENTO criados antes do tempo limite
      const pedidosExpirados = await this.pedidoRepository.find({
        where: {
          status: PedidoStatus.AGUARDANDO_PAGAMENTO,
          dataCriacao: LessThan(tempoLimite),
        },
        relations: ['itens', 'itens.produto'],
      });

      if (pedidosExpirados.length === 0) {
        console.log('Nenhum pedido expirado encontrado.');
        return;
      }

      console.log(`Encontrados ${pedidosExpirados.length} pedidos expirados.`);

      // Processa cada pedido expirado
      for (const pedido of pedidosExpirados) {
        console.log(`Cancelando pedido expirado: #${pedido.id}`);

        // 1. Devolve os itens para o estoque
        for (const item of pedido.itens) {
          const produto = item.produto;

          produto.reserved -= item.quantidade;

          if(produto.reserved < 0) produto.reserved = 0;


          await this.produtoRepository.save(produto);
          console.log(
            `Estoque devolvido: Produto #${produto.id} - ${item.quantidade} unidades`, 
          );
        }

        // 2. Atualiza status para CANCELADO
        pedido.status = PedidoStatus.CANCELADO;
        await this.pedidoRepository.save(pedido);
        console.log(`Pedido #${pedido.id} cancelado com sucesso.`);
      }

      console.log('Cron Job finalizado com sucesso.');
    } catch (error) {
      console.error('Erro ao executar Cron Job de cancelamento:', error);
    }
  }
} 