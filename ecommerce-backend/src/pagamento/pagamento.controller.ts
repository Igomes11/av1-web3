import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

import { PagamentoService } from './pagamento.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { Pagamento, PagamentoStatus } from './entities/pagamento.entity';

// DTO Auxiliar para simular o status do pagamento (sucesso/falha)
class SimulatePaymentDto extends CreatePagamentoDto {
  @IsString({ message: 'O status final deve ser uma string.' })
  @IsIn([PagamentoStatus.PAGO, PagamentoStatus.CANCELADO], {
    message: 'Status de simulação inválido.',
  })
  novoStatus: PagamentoStatus;
}

@ApiTags('pagamento')
@Controller('pagamento')
export class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoService) {}

  @Post('processar')
  @ApiOperation({ summary: 'Processar pagamento de um pedido' })
  @ApiResponse({ status: 200, description: 'Pagamento processado com sucesso', type: Pagamento })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async processarPagamento(
    @Body() simulatePaymentDto: SimulatePaymentDto,
  ): Promise<Pagamento> {
    const { novoStatus, ...pagamentoDto } = simulatePaymentDto;

    return this.pagamentoService.processarPagamento(pagamentoDto, novoStatus);
  }
}