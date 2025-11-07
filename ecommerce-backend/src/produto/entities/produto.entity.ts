import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { ItemPedido } from '../../item-pedido/entities/item-pedido.entity'; // IMPORTADO

@Entity('produto')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco: number;

  @Column({ default: 0 })
  estoque: number;

  @Column({ default: 'placeholder.png' })
  imagem: string;

  @Column({ default: true })
  statusAtivo: boolean;

  @ManyToOne(() => Categoria, (categoria) => categoria.produtos)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @Column({ name: 'categoria_id' })
  categoriaId: number;

  // CORRIGIDO: Adiciona o array de itens de pedido
  @OneToMany(() => ItemPedido, (itemPedido) => itemPedido.produto)
  itensPedido: ItemPedido[];
}
