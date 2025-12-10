import { PartialType } from '@nestjs/swagger';
import { CreateProdutoDto } from './create-produto.dto';
import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {
  @IsOptional()
  @IsInt({ message: 'O ID da categoria deve ser um número inteiro.' })
  @Type(() => Number)
  categoriaId?: number;
}