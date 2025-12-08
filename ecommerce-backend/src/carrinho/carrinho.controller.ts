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

@Controller('carrinho')
@UseGuards(AuthGuard)
export class CarrinhoController {
  constructor(private readonly carrinhoService: CarrinhoService) {}

  @Get()
  getCart(@Request() req: AuthenticatedRequest) {
    return this.carrinhoService.findOrCreateCart(req.user.id);
  }

  @Post('item')
  addItem(@Request() req: AuthenticatedRequest, @Body() addItemDto: AddItemDto) {
    return this.carrinhoService.addItem(req.user.id, addItemDto);
  }

  @Patch('item/:id')
  updateItem(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) itemId: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.carrinhoService.updateItem(req.user.id, itemId, updateItemDto);
  }

  @Delete('item/:id')
  removeItem(@Request() req: AuthenticatedRequest, @Param('id', ParseIntPipe) itemId: number) {
    return this.carrinhoService.removeItem(req.user.id, itemId);
  }

  @Delete()
  clearCart(@Request() req: AuthenticatedRequest) {
    return this.carrinhoService.clearCart(req.user.id);
  }
}