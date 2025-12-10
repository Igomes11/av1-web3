import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { LoginDto } from './dto/login.dto';  // ✅ NOVO IMPORT
import { Cliente, Role } from './entities/cliente.entity';
import { AuthService } from '../auth/auth.service';

// Interface de Retorno do Login
interface LoginResponse {
  access_token: string;
  id: number;
  email: string;
  role: Role;
}

@ApiTags('cliente')
@Controller('cliente')
export class ClienteController {
  constructor(
    private readonly clienteService: ClienteService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso', type: Cliente })
  @ApiResponse({ status: 400, description: 'Email já cadastrado ou dados inválidos' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createClienteDto: CreateClienteDto): Promise<Cliente> {
    const clienteComRolePadrao: CreateClienteDto & { role: Role } = {
      ...createClienteDto,
      role: Role.Cliente,
    };
    return this.clienteService.create(createClienteDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Fazer login e obter token JWT' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'usuario@email.com' },
        role: { type: 'string', example: 'cliente' },
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Credenciais inválidas' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() loginData: LoginDto): Promise<LoginResponse> {  // ✅ MUDOU AQUI
    const { email, senha } = loginData;

    const cliente = await this.clienteService.findByEmail(email);

    const isPasswordValid = await (
      await import('bcryptjs')
    ).compare(senha, cliente.senha);

    if (!isPasswordValid) {
      throw new BadRequestException('Credenciais inválidas.');
    }

    return this.authService.login(cliente) as Promise<LoginResponse>;
  }
}