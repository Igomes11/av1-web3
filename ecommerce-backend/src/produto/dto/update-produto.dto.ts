import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoDto } from './create-produto.dto';
import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

// O PartialType torna todos os campos do CreateProdutoDto opcionais
export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {
  // É necessário redefinir a FK para que o TypeScript e o ValidationPipe a reconheçam como opcional no PATCH.
  @IsOptional()
  @IsInt({ message: 'O ID da categoria deve ser um número inteiro.' })
  @Type(() => Number)
  categoriaId?: number;
}
