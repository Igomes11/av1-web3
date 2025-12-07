// ecommerce-backend/src/cliente/cliente.controller.ts

import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { Cliente, Role } from './entities/cliente.entity'; // Importa Role
import { AuthService } from '../auth/auth.service'; // NOVO

// DTO para a rota de login
interface LoginRequestDto {
  email: string;
  senha: string;
}

// NOVO: Interface de Retorno do Login
interface LoginResponse {
  access_token: string;
  id: number;
  email: string;
  role: Role; // Incluído o papel para o frontend
}

@Controller('cliente')
export class ClienteController {
  constructor(
    private readonly clienteService: ClienteService,
    private readonly authService: AuthService, // NOVO
  ) {}

  /**
   * Rota POST /cliente para cadastrar um novo cliente.
   * @param createClienteDto Dados de criação do cliente
   * @returns
   */
  @Post()
  // Aplica a validação do DTO
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createClienteDto: CreateClienteDto): Promise<Cliente> {
    // Certifica que novos clientes são criados com o papel padrão 'cliente'
    const clienteComRolePadrao: CreateClienteDto & { role: Role } = {
      ...createClienteDto,
      role: Role.Cliente, // NOVO: Garante que o campo role esteja definido no payload antes de criar
    };
    // O service agora aceitará o role no objeto, se você quiser persistir o role no banco,
    // embora no service a criação ainda não esteja usando o role.
    // Para simplificar, ajustamos apenas a Entidade para ter o default.
    return this.clienteService.create(createClienteDto);
  }

  /**
   * NOVO: Rota POST /cliente/login para simular o login e obter o JWT.
   * @param loginData Email e senha.
   * @returns Token JWT e dados do usuário (ID, E-mail, Role).
   */
  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() loginData: LoginRequestDto): Promise<LoginResponse> {
    const { email, senha } = loginData;

    const cliente = await this.clienteService.findByEmail(email);

    // Simulação da verificação de senha
    const isPasswordValid = await (
      await import('bcryptjs')
    ).compare(senha, cliente.senha);

    if (!isPasswordValid) {
      throw new BadRequestException('Credenciais inválidas.');
    }

    // NOVO: Gera e retorna o token JWT
    return this.authService.login(cliente) as Promise<LoginResponse>;
  }
}
