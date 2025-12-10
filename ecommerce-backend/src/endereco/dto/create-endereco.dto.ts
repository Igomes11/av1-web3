import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsBoolean,
  IsInt,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnderecoDto {
  @ApiProperty({
    description: 'Logradouro (rua, avenida, etc)',
    example: 'Rua das Flores',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'O logradouro é obrigatório.' })
  @IsString({ message: 'O logradouro deve ser uma string.' })
  @MaxLength(100)
  logradouro: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
    maxLength: 10,
  })
  @IsNotEmpty({ message: 'O número é obrigatório.' })
  @IsString({ message: 'O número deve ser uma string.' })
  @Matches(/^[a-zA-Z0-9\s\/\-]{1,10}$/, {
    message:
      'O número deve conter apenas dígitos e caracteres básicos (letras, números, espaços, / e -).',
  })
  @MaxLength(10)
  numero: string;

  @ApiPropertyOptional({
    description: 'Complemento do endereço',
    example: 'Apto 45',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'O complemento deve ser uma string.' })
  @MaxLength(50)
  complemento?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'O bairro é obrigatório.' })
  @IsString({ message: 'O bairro deve ser uma string.' })
  @MaxLength(50)
  bairro: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'São Paulo',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'A cidade é obrigatória.' })
  @IsString({ message: 'A cidade deve ser uma string.' })
  @MaxLength(50)
  cidade: string;

  @ApiProperty({
    description: 'Estado (UF)',
    example: 'SP',
    maxLength: 2,
  })
  @IsNotEmpty({ message: 'O estado é obrigatório.' })
  @IsString({ message: 'O estado deve ser uma string.' })
  @MaxLength(2)
  @Matches(/^[A-Z]{2}$/, {
    message: 'O estado (UF) deve ter 2 letras maiúsculas.',
  })
  estado: string;

  @ApiProperty({
    description: 'CEP do endereço',
    example: '12345-678',
    maxLength: 9,
  })
  @IsNotEmpty({ message: 'O CEP é obrigatório.' })
  @IsString({ message: 'O CEP deve ser uma string.' })
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'O CEP deve ser um formato válido (ex: 12345-678).',
  })
  @MaxLength(9)
  cep: string;

  @ApiPropertyOptional({
    description: 'Define se é o endereço principal',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'O campo principal deve ser booleano.' })
  @Type(() => Boolean)
  principal?: boolean = false;

  @ApiProperty({
    description: 'ID do cliente proprietário',
    example: 1,
  })
  @IsNotEmpty({ message: 'O ID do cliente é obrigatório para testes.' })
  @IsInt({ message: 'O ID do cliente deve ser um número inteiro.' })
  @Type(() => Number)
  clienteId: number;
}