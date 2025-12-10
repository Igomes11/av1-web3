import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoriaDto {
  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Eletrônicos',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @MaxLength(100)
  nome: string;
}