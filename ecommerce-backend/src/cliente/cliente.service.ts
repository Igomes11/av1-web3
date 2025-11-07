/**
 * cliente.service.ts
 * Serviço responsável por gerenciar as operações relacionadas aos clientes
 * Inclui funcionalidades de cadastro, autenticação e busca de clientes
 */

import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class ClienteService {
  private readonly logger = new Logger(ClienteService.name);

  constructor(
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  /**
   * Cria um novo cliente no sistema
   * 
   * @param createClienteDto - DTO com os dados do cliente a ser criado
   * @returns Promise com o objeto Cliente criado (senha excluída da resposta)
   * @throws BadRequestException se o email já estiver em uso
   * 
   * Processo:
   * 1. Verifica se o email já está cadastrado
   * 2. Criptografa a senha usando bcrypt
   * 3. Cria e salva o novo cliente no banco
   */
  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const { email, senha } = createClienteDto;

    // Verifica email duplicado
    const clienteExistente = await this.clienteRepository.findOne({
      where: { email },
    });

    if (clienteExistente) {
      this.logger.warn(`Tentativa de cadastro com email duplicado: ${email}`);
      throw new BadRequestException('Este email já está em uso.');
    }

    // Criptografa a senha com bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    // Cria e salva o novo cliente
    const novoCliente = this.clienteRepository.create({
      ...createClienteDto,
      senha: hashedPassword,
    });

    return this.clienteRepository.save(novoCliente);
  }

  /**
   * Busca um cliente pelo email para autenticação
   * 
   * @param email - Email do cliente a ser buscado
   * @returns Promise com o objeto Cliente incluindo a senha criptografada
   * @throws NotFoundException se o cliente não for encontrado
   * 
   * Observação: Este método retorna a senha criptografada para permitir
   * a validação durante o login. Use com cuidado apenas no contexto de autenticação.
   */
  async findByEmail(email: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { email },
      select: ['id', 'nome', 'email', 'senha', 'telefone', 'dataDeCadastro'],
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado.');
    }
    return cliente;
  }
}
