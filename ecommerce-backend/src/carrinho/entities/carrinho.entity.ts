import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { ItemCarrinho } from './item-carrinho.entity';

@Entity('carrinho')
export class Carrinho {
  @PrimaryGeneratedColumn()
  id: number;

  // Relacionamento 1:1 com Cliente (cada cliente tem um carrinho ativo)
  @OneToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  // Relacionamento 1:N com os itens
  @OneToMany(() => ItemCarrinho, (item) => item.carrinho, { cascade: true })
  itens: ItemCarrinho[];

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}