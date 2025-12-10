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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
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

@ApiTags('pedido')
@ApiBearerAuth()
@Controller('pedido')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard)
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso', type: Pedido })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou estoque insuficiente' })
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreatePedidoDto) {
    return this.pedidoService.create({
      ...dto,
      clienteId: req.user.id,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  @ApiParam({ name: 'id', description: 'ID do pedido', type: Number })
  @ApiResponse({ status: 200, description: 'Pedido encontrado', type: Pedido })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Pedido> {
    return this.pedidoService.findOne(id);
  }

  @Get('meus-pedidos/lista')
  @ApiOperation({ summary: 'Buscar todos os pedidos do usuário logado' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos do usuário', type: [Pedido] })
  findAllMyOrders(@Request() req: AuthenticatedRequest): Promise<Pedido[]> {
    return this.pedidoService.findAllByCliente(req.user.id);
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: 'Buscar pedidos de um cliente específico' })
  @ApiParam({ name: 'clienteId', description: 'ID do cliente', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de pedidos do cliente', type: [Pedido] })
  findAllByCliente(
    @Param('clienteId', ParseIntPipe) clienteId: number,
  ): Promise<Pedido[]> {
    return this.pedidoService.findAllByCliente(clienteId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido', type: Number })
  @ApiResponse({ status: 200, description: 'Status atualizado', type: Pedido })
  @ApiResponse({ status: 400, description: 'Status inválido' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<Pedido> {
    if (!Object.values(PedidoStatus).includes(status as PedidoStatus)) {
      throw new BadRequestException(
        `Status inválido. Valores válidos: ${Object.values(PedidoStatus).join(', ')}`,
      );
    }
    return this.pedidoService.updateStatus(id, status as PedidoStatus);
  }
}