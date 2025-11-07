import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common'; // Adicionado Get e Param
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { Cliente } from './entities/cliente.entity';

// DTO para a rota de login, apenas para fins de tipagem na requisição (opcionalmente pode ser um DTO separado)
interface LoginRequestDto {
  email: string;
  senha: string;
}

@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  /**
   * Rota POST /cliente para cadastrar um novo cliente.
   * @param createClienteDto Dados de criação do cliente
   * @returns
   */
  @Post()
  // Aplica a validação do DTO
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createClienteDto: CreateClienteDto): Promise<Cliente> {
    return this.clienteService.create(createClienteDto);
  }

  /**
   * NOVO: Rota POST /cliente/login para simular o login e obter o ID do cliente.
   * IMPORTANTE: Esta é uma simulação de login. Em produção, usaria-se JWT.
   * @param loginData Email e senha.
   * @returns Cliente (sem a senha) se as credenciais forem válidas.
   */
  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(
    @Body() loginData: LoginRequestDto,
  ): Promise<{ id: number; email: string }> {
    const { email, senha } = loginData;

    const cliente = await this.clienteService.findByEmail(email);

    // Simulação da verificação de senha
    // O cliente retornado pelo service TEM a senha (porque usamos .select())
    const isPasswordValid = await (
      await import('bcryptjs')
    ).compare(senha, cliente.senha);

    if (!isPasswordValid) {
      throw new BadRequestException('Credenciais inválidas.');
    }

    // Retorna apenas o ID e E-mail para o Front-end
    return { id: cliente.id, email: cliente.email };
  }
}
