/**
 * endereco.entity.ts
 * Entidade que representa um endereço no sistema
 * Armazena informações de localização e permite múltiplos endereços por cliente
 */

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../../cliente/entities/cliente.entity';

@Entity('endereco')
export class Endereco {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  logradouro: string;  // Nome da rua, avenida, etc.

  @Column({ length: 10 })
  numero: string;      // Número do endereço (mantido como string para flexibilidade)

  @Column({ length: 50, nullable: true })
  complemento: string; // Informações adicionais (apto, sala, etc.)

  @Column({ length: 50 })
  bairro: string;     // Nome do bairro

  @Column({ length: 50 })
  cidade: string;     // Nome da cidade

  @Column({ length: 2 })
  estado: string;     // Sigla do estado (UF)

  @Column({ length: 9 })
  cep: string;        // CEP no formato XXXXX-XXX

  @Column({ default: false })
  principal: boolean; // Indica se é o endereço principal do cliente

  /**
   * Relacionamento Many-to-One com Cliente
   * Cada endereço pertence a um único cliente
   * Um cliente pode ter múltiplos endereços
   */
  @ManyToOne(() => Cliente, (cliente) => cliente.enderecos)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;
}