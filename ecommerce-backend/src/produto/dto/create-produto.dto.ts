import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  MaxLength,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProdutoDto {
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @MaxLength(150)
  nome: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string.' })
  descricao?: string;

  @IsNotEmpty({ message: 'O preço é obrigatório.' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O preço deve ser um número com no máximo 2 casas decimais.' },
  )
  @Min(0.01, { message: 'O preço deve ser maior que zero.' })
  @Type(() => Number) // Garante a conversão da string para number
  preco: number;

  @IsOptional()
  @IsInt({ message: 'O estoque deve ser um número inteiro.' })
  @Min(0, { message: 'O estoque não pode ser negativo.' })
  @Type(() => Number)
  estoque?: number = 0;

  @IsOptional()
  @IsString({ message: 'O caminho da imagem deve ser uma string.' })
  imagem?: string = 'placeholder.png';

  @IsOptional()
  @IsBoolean({ message: 'O status ativo deve ser um valor booleano.' })
  @Type(() => Boolean)
  statusAtivo?: boolean = true;

  // Chave estrangeira para Categoria
  @IsNotEmpty({ message: 'A categoria do produto é obrigatória.' })
  @IsInt({ message: 'O ID da categoria deve ser um número inteiro.' })
  @Type(() => Number)
  categoriaId: number;
}
