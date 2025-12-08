/**
 * pedido.controller.ts
 * Controller responsável pelas rotas de pedidos
 * Gerencia criação, consulta e atualização de pedidos
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Request,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { Pedido, PedidoStatus } from './entities/pedido.entity';
import { AuthGuard } from '../auth/auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

@Controller('pedido')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard)
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  /**
   * Cria um novo pedido a partir do carrinho do usuário
   * @param req - Request com informações do usuário autenticado
   * @param dto - Dados para criar o pedido (endereçoId)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreatePedidoDto) {
    return this.pedidoService.create({
      ...dto,
      clienteId: req.user.id,
    });
  }

  /**
   * Busca um pedido específico por ID
   * @param id - ID do pedido
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Pedido> {
    return this.pedidoService.findOne(id);
  }

  /**
   * Busca todos os pedidos do cliente autenticado
   * Rota mais segura que passa o ID via token JWT
   * @param req - Request com informações do usuário autenticado
   */
  @Get('meus-pedidos/lista')
  findAllMyOrders(@Request() req: AuthenticatedRequest): Promise<Pedido[]> {
    return this.pedidoService.findAllByCliente(req.user.id);
  }

  /**
   * Busca todos os pedidos de um cliente específico (por ID)
   * @param clienteId - ID do cliente
   */
  @Get('cliente/:clienteId')
  findAllByCliente(
    @Param('clienteId', ParseIntPipe) clienteId: number,
  ): Promise<Pedido[]> {
    return this.pedidoService.findAllByCliente(clienteId);
  }

  /**
   * Atualiza o status de um pedido
   * @param id - ID do pedido
   * @param status - Novo status do pedido
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<Pedido> {
    // Valida se o status é válido
    if (!Object.values(PedidoStatus).includes(status as PedidoStatus)) {
      throw new BadRequestException(
        `Status inválido. Valores válidos: ${Object.values(PedidoStatus).join(', ')}`,
      );
    }
    return this.pedidoService.updateStatus(id, status as PedidoStatus);
  }
}
