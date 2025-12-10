import { IsNotEmpty, IsInt, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ItemPedidoDto } from './item-pedido.dto';

export class CreatePedidoDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: 1,
  })
  @IsNotEmpty({ message: 'O ID do cliente é obrigatório.' })
  @IsInt({ message: 'O ID do cliente deve ser um número inteiro.' })
  @Type(() => Number)
  clienteId: number;

  @ApiProperty({
    description: 'ID do endereço de entrega',
    example: 1,
  })
  @IsNotEmpty({ message: 'O ID do endereço é obrigatório.' })
  @IsInt({ message: 'O ID do endereço deve ser um número inteiro.' })
  @Type(() => Number)
  enderecoId: number;

  @ApiProperty({
    description: 'Lista de itens do pedido',
    type: [ItemPedidoDto],
    example: [
      { produtoId: 1, quantidade: 2 },
      { produtoId: 3, quantidade: 1 },
    ],
  })
  @ArrayMinSize(1, { message: 'O pedido deve conter pelo menos um item.' })
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  itens: ItemPedidoDto[];
}