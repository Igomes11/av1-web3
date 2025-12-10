import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemDto {
  @ApiProperty({
    description: 'ID do produto a ser adicionado',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  produtoId: number;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 2,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'A quantidade deve ser no mínimo 1.' })
  quantidade: number;
}