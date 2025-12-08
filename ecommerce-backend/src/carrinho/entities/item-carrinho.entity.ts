import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Carrinho } from './carrinho.entity';
import { Produto } from '../../produto/entities/produto.entity';

@Entity('item_carrinho')
export class ItemCarrinho {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quantidade: number;

  // Relacionamento N:1 com Carrinho
  @ManyToOne(() => Carrinho, (carrinho) => carrinho.itens, {
    onDelete: 'CASCADE', // Se apagar o carrinho, apaga os itens
  })
  @JoinColumn({ name: 'carrinho_id' })
  carrinho: Carrinho;

  // Relacionamento N:1 com Produto
  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produto_id' })
  produto: Produto;
}