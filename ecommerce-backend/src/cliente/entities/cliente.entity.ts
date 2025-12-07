// ecommerce-backend/src/cliente/entities/cliente.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Endereco } from '../../endereco/entities/endereco.entity';
import { Pedido } from '../../pedido/entities/pedido.entity';

// NOVO: Enum para definir os papéis
export enum Role {
  Admin = 'admin',
  Cliente = 'cliente',
}

@Entity('cliente')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nome: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  senha: string;

  // NOVO CAMPO ROLE
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Cliente, // NOVO: Define 'cliente' como padrão para novos cadastros
  })
  role: Role;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataDeCadastro: Date;

  @OneToMany(() => Endereco, (endereco) => endereco.cliente)
  enderecos: Endereco[];

  @OneToMany(() => Pedido, (pedido) => pedido.cliente)
  pedidos: Pedido[];
}
