/**
 * produto.entity.ts
 * 
 * Entidade que representa um produto no sistema de e-commerce.
 * Esta entidade é central para o sistema, mantendo informações cruciais sobre
 * cada produto disponível para venda, incluindo seus detalhes, preços,
 * controle de estoque e relacionamentos.
 * 
 * @entity Produto
 * @see Categoria
 * @see ItemPedido
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { ItemPedido } from '../../item-pedido/entities/item-pedido.entity';

/**
 * Classe que representa a entidade Produto no banco de dados.
 * Gerencia todos os aspectos de um produto no e-commerce, desde suas
 * informações básicas até seus relacionamentos com outras entidades.
 */
@Entity('produto')
export class Produto {
  /** 
   * Identificador único do produto
   * Gerado automaticamente pelo banco de dados
   */
  @PrimaryGeneratedColumn()
  id: number;

  /** 
   * Nome do produto
   * Limitado a 150 caracteres para manter consistência na exibição
   */
  @Column({ length: 150 })
  nome: string;

  /** 
   * Descrição detalhada do produto
   * Campo opcional que pode conter texto longo com formatação
   */
  @Column({ type: 'text', nullable: true })
  descricao: string;

  /** 
   * Preço do produto
   * Armazenado com precisão de 10 dígitos e 2 casas decimais
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco: number;

  /** 
   * Quantidade disponível em estoque
   * Valor padrão é 0 para produtos recém-cadastrados
   */
  @Column({ default: 0 })
  estoque: number;

  /** 
   * URL ou nome do arquivo da imagem do produto
   * Se não fornecida, usa uma imagem padrão 'placeholder.png'
   */
  @Column({ default: 'placeholder.png' })
  imagem: string;

  /** 
   * Indica se o produto está ativo para venda
   * Produtos inativos não aparecem no catálogo
   * @default true
   */
  /** 
   * Indica se o produto está ativo para venda
   * Produtos inativos não aparecem no catálogo
   * @default true
   */
  @Column({ default: true })
  statusAtivo: boolean;

  /**
   * Relacionamento Many-to-One com Categoria
   * Cada produto pertence a uma única categoria
   * @see Categoria
   */
  @ManyToOne(() => Categoria, (categoria) => categoria.produtos)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  /** 
   * ID da categoria do produto
   * Chave estrangeira para a tabela de categorias
   */
  @Column({ name: 'categoria_id' })
  categoriaId: number;

  /**
   * Relacionamento One-to-Many com ItemPedido
   * Um produto pode estar presente em vários itens de pedido
   * Permite rastrear em quais pedidos este produto foi incluído
   * @see ItemPedido
   */
  @OneToMany(() => ItemPedido, (itemPedido) => itemPedido.produto)
  itensPedido: ItemPedido[];
}
