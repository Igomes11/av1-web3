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

export class CreateEnderecoDto {
  @IsNotEmpty({ message: 'O logradouro é obrigatório.' })
  @IsString({ message: 'O logradouro deve ser uma string.' })
  @MaxLength(100)
  logradouro: string;

  @IsNotEmpty({ message: 'O número é obrigatório.' })
  @IsString({ message: 'O número deve ser uma string.' })
  // CORREÇÃO: Aceita apenas dígitos e caracteres básicos (letras, espaços, / e -)
  @Matches(/^[a-zA-Z0-9\s\/\-]{1,10}$/, {
    message:
      'O número deve conter apenas dígitos e caracteres básicos (letras, números, espaços, / e -).',
  })
  @MaxLength(10)
  numero: string;

  @IsOptional()
  @IsString({ message: 'O complemento deve ser uma string.' })
  @MaxLength(50)
  complemento?: string;

  @IsNotEmpty({ message: 'O bairro é obrigatório.' })
  @IsString({ message: 'O bairro deve ser uma string.' })
  @MaxLength(50)
  bairro: string;

  @IsNotEmpty({ message: 'A cidade é obrigatória.' })
  @IsString({ message: 'A cidade deve ser uma string.' })
  @MaxLength(50)
  cidade: string;

  @IsNotEmpty({ message: 'O estado é obrigatório.' })
  @IsString({ message: 'O estado deve ser uma string.' })
  @MaxLength(2)
  // CORREÇÃO: Aceita apenas 2 letras MAIÚSCULAS para o campo UF
  @Matches(/^[A-Z]{2}$/, {
    message: 'O estado (UF) deve ter 2 letras maiúsculas.',
  })
  estado: string;

  @IsNotEmpty({ message: 'O CEP é obrigatório.' })
  @IsString({ message: 'O CEP deve ser uma string.' })
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'O CEP deve ser um formato válido (ex: 12345-678).',
  })
  @MaxLength(9)
  cep: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo principal deve ser booleano.' })
  @Type(() => Boolean)
  principal?: boolean = false;

  @IsNotEmpty({ message: 'O ID do cliente é obrigatório para testes.' })
  @IsInt({ message: 'O ID do cliente deve ser um número inteiro.' })
  @Type(() => Number)
  clienteId: number;
}
