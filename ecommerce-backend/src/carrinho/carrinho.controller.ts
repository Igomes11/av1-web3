import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CarrinhoService } from './carrinho.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AuthGuard } from '../auth/auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

@ApiTags('carrinho')
@ApiBearerAuth()
@Controller('carrinho')
@UseGuards(AuthGuard)
export class CarrinhoController {
  constructor(private readonly carrinhoService: CarrinhoService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar carrinho do usuário logado' })
  @ApiResponse({ status: 200, description: 'Carrinho retornado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  getCart(@Request() req: AuthenticatedRequest) {
    return this.carrinhoService.findOrCreateCart(req.user.id);
  }

  @Post('item')
  @ApiOperation({ summary: 'Adicionar item ao carrinho' })
  @ApiResponse({ status: 201, description: 'Item adicionado com sucesso' })
  @ApiResponse({ status: 400, description: 'Estoque insuficiente' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  addItem(@Request() req: AuthenticatedRequest, @Body() addItemDto: AddItemDto) {
    return this.carrinhoService.addItem(req.user.id, addItemDto);
  }

  @Patch('item/:id')
  @ApiOperation({ summary: 'Atualizar quantidade de um item' })
  @ApiParam({ name: 'id', description: 'ID do item no carrinho', type: Number })
  @ApiResponse({ status: 200, description: 'Item atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  updateItem(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) itemId: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.carrinhoService.updateItem(req.user.id, itemId, updateItemDto);
  }

  @Delete('item/:id')
  @ApiOperation({ summary: 'Remover item do carrinho' })
  @ApiParam({ name: 'id', description: 'ID do item no carrinho', type: Number })
  @ApiResponse({ status: 200, description: 'Item removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  removeItem(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) itemId: number) {
    return this.carrinhoService.removeItem(req.user.id, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Limpar todo o carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho limpo com sucesso' })
  clearCart(@Request() req: AuthenticatedRequest) {
    return this.carrinhoService.clearCart(req.user.id);
  }
}