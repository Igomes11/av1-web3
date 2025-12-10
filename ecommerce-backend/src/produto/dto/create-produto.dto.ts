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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProdutoDto {
  @ApiProperty({
    description: 'Nome do produto',
    example: 'Notebook Dell Inspiron 15',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @MaxLength(150)
  nome: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada do produto',
    example: 'Notebook com processador Intel Core i5, 8GB RAM, 256GB SSD',
  })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string.' })
  descricao?: string;

  @ApiProperty({
    description: 'Preço do produto em reais',
    example: 2999.90,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'O preço é obrigatório.' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O preço deve ser um número com no máximo 2 casas decimais.' },
  )
  @Min(0.01, { message: 'O preço deve ser maior que zero.' })
  @Type(() => Number)
  preco: number;

  @ApiPropertyOptional({
    description: 'Quantidade disponível em estoque',
    example: 50,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'O estoque deve ser um número inteiro.' })
  @Min(0, { message: 'O estoque não pode ser negativo.' })
  @Type(() => Number)
  estoque?: number = 0;

  @ApiPropertyOptional({
    description: 'Caminho da imagem do produto',
    example: 'notebook-dell.jpg',
    default: 'placeholder.png',
  })
  @IsOptional()
  @IsString({ message: 'O caminho da imagem deve ser uma string.' })
  imagem?: string = 'placeholder.png';

  @ApiPropertyOptional({
    description: 'Status de ativação do produto',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'O status ativo deve ser um valor booleano.' })
  @Type(() => Boolean)
  statusAtivo?: boolean = true;

  @ApiProperty({
    description: 'ID da categoria do produto',
    example: 1,
  })
  @IsNotEmpty({ message: 'A categoria do produto é obrigatória.' })
  @IsInt({ message: 'O ID da categoria deve ser um número inteiro.' })
  @Type(() => Number)
  categoriaId: number;
}