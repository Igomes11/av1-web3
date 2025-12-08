import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddItemDto {
  @IsNotEmpty()
  @IsInt()
  produtoId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'A quantidade deve ser no mínimo 1.' })
  quantidade: number;
}