/**
 * pedido.entity.ts
 * 
 * Entidade que representa um pedido no e-commerce.
 * Implementa o modelo de dados e relacionamentos para
 * gestão completa de pedidos no sistema.
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Endereco } from '../../endereco/entities/endereco.entity';
import { ItemPedido } from '../../item-pedido/entities/item-pedido.entity';
import { Pagamento } from '../../pagamento/entities/pagamento.entity';

/**
 * Enum que define os possíveis status de um pedido
 * @enum PedidoStatus
 */
export enum PedidoStatus {
  /** Pedido criado, ainda não finalizado */
  ABERTO = 'ABERTO',
  /** Pedido finalizado, aguardando pagamento */
  AGUARDANDO_PAGAMENTO = 'AGUARDANDO_PAGAMENTO',
  /** Pagamento confirmado */
  PAGO = 'PAGO',
  /** Pedido cancelado */
  CANCELADO = 'CANCELADO',
}

/**
 * Entidade Pedido
 * 
 * Representa um pedido no sistema, mantendo informações sobre:
 * - Valores (subtotal, total)
 * - Quantidade de itens
 * - Data de criação
 * - Status atual
 * - Relacionamentos (cliente, endereço, itens, pagamento)
 * 
 * @entity Pedido
 */
@Entity('pedido')
export class Pedido {
  /** Identificador único do pedido */
  @PrimaryGeneratedColumn()
  id: number;

  /** 
   * Subtotal do pedido 
   * Soma dos preços individuais dos itens
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  subtotal: number;

  /** 
   * Total do pedido
   * Valor final incluindo eventuais taxas ou descontos
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  total: number;

  /** Quantidade total de itens no pedido */
  @Column({ type: 'int', default: 0 })
  quantidadeTotal: number;

  /** Data e hora de criação do pedido */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao: Date;

  /** 
   * Status atual do pedido 
   * @see PedidoStatus
   */
  @Column({
    type: 'enum',
    enum: PedidoStatus,
    default: PedidoStatus.ABERTO,
  })
  status: PedidoStatus;

  /** 
   * Relacionamento com o Cliente que fez o pedido
   * @see Cliente
   */
  @ManyToOne(() => Cliente, (cliente) => cliente.pedidos)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  /** 
   * Relacionamento com o Endereço de entrega do pedido
   * @see Endereco
   */
  @ManyToOne(() => Endereco)
  @JoinColumn({ name: 'endereco_id' })
  endereco: Endereco;

  /** 
   * Relacionamento com os Itens do pedido
   * @see ItemPedido
   */
  @OneToMany(() => ItemPedido, (item) => item.pedido)
  itens: ItemPedido[];

  /** 
   * Relacionamento com o Pagamento do pedido
   * @see Pagamento
   */
  @OneToOne(() => Pagamento)
  @JoinColumn()
  pagamento: Pagamento;
}

  // --- RELACIONAMENTOS ---

  // N:1 com Cliente
  @ManyToOne(() => Cliente, (cliente) => cliente.pedidos)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  // N:1 com Endereço
  @ManyToOne(() => Endereco)
  @JoinColumn({ name: 'endereco_id' })
  endereco: Endereco;

  // 1:N com ItemPedido
  @OneToMany(() => ItemPedido, (itemPedido) => itemPedido.pedido)
  itens: ItemPedido[];

  // NOVO: 1:1 com Pagamento (relacionamento inverso)
  @OneToOne(() => Pagamento, (pagamento) => pagamento.pedido)
  pagamento: Pagamento;
}