// ecommerce-backend/src/pedido/pedido.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  Patch,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards, // NOVO
  Request, // NOVO
} from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { Pedido } from './entities/pedido.entity';
import { PedidoStatus } from './entities/pedido.entity';
import { AuthGuard } from '../auth/auth.guard'; // NOVO
import { RolesGuard } from '../auth/roles.guard'; // NOVO
import { Roles } from '../auth/roles.decorator'; // NOVO
import { Role } from '../cliente/entities/cliente.entity'; // NOVO

@Controller('pedido')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard) // NOVO: Protege TODAS as rotas deste controller
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  // Podemos pegar o clienteId diretamente do token (request.user.id) para maior segurança,
  // mas vamos manter o DTO por enquanto.
  create(@Body() createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    return this.pedidoService.create(createPedidoDto);
  }

  // Exemplo de rota que exige papel específico (Admin) - Se aplicável
  /*
  @Patch(':id/status')
  @Roles(Role.Admin) // Apenas administradores podem mudar o status
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<Pedido> {
    // ...
  }
  */

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Pedido> {
    return this.pedidoService.findOne(id);
  }

  // Rota para listar pedidos do cliente logado, usando o ID do token.
  // Isso é mais seguro do que passar o clienteId no URL.
  @Get('meus-pedidos')
  findAllMyOrders(@Request() req: any): Promise<Pedido[]> {
    const clienteId = req.user.id; // ID extraído do JWT pelo AuthGuard
    return this.pedidoService.findAllByCliente(clienteId);
  }

  // A rota original findAllByCliente ainda pode ser mantida para uso interno, mas é menos segura para o frontend
  @Get('cliente/:clienteId')
  findAllByCliente(
    @Param('clienteId', ParseIntPipe) clienteId: number,
  ): Promise<Pedido[]> {
    return this.pedidoService.findAllByCliente(clienteId);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<Pedido> {
    // aceita uma string com o nome do enum, por exemplo "CANCELADO"
    if (!Object.values(PedidoStatus).includes(status as PedidoStatus)) {
      throw new BadRequestException('Status inválido.');
    }
    return this.pedidoService.updateStatus(id, status as PedidoStatus);
  }
}
