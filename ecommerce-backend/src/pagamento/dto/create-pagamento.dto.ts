import { IsNotEmpty, IsInt, IsString, IsIn, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePagamentoDto {
  @ApiProperty({
    description: 'ID do pedido a ser pago',
    example: 1,
  })
  @IsNotEmpty({ message: 'O ID do pedido é obrigatório.' })
  @IsInt({ message: 'O ID do pedido deve ser um número inteiro.' })
  @Type(() => Number)
  pedidoId: number;

  @ApiProperty({
    description: 'Método de pagamento',
    example: 'PIX',
    enum: ['Cartão', 'Boleto', 'PIX'],
  })
  @IsNotEmpty({ message: 'O método é obrigatório.' })
  @IsString({ message: 'O método deve ser uma string.' })
  @IsIn(['Cartão', 'Boleto', 'PIX'], { message: 'Método de pagamento inválido.' })
  metodo: string;

  @ApiProperty({
    description: 'Valor do pagamento',
    example: 299.90,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'O valor é obrigatório.' })
  @IsNumber({}, { message: 'O valor deve ser um número.' })
  @Min(0.01, { message: 'O valor deve ser positivo.' })
  @Type(() => Number)
  valor: number;
}