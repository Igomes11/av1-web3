/**
 * create-endereco.dto.ts
 * DTO para criação de novos endereços no sistema
 * Contém todas as validações necessárias para garantir a integridade dos dados
 */

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
  /**
   * Logradouro do endereço (rua, avenida, etc.)
   * Obrigatório, máximo 100 caracteres
   */
  @IsNotEmpty({ message: 'O logradouro é obrigatório.' })
  @IsString({ message: 'O logradouro deve ser uma string.' })
  @MaxLength(100)
  logradouro: string;

  /**
   * Número do endereço
   * Aceita números, letras e caracteres especiais limitados
   * Formato: até 10 caracteres, apenas letras, números, espaços, / e -
   */
  @IsNotEmpty({ message: 'O número é obrigatório.' })
  @IsString({ message: 'O número deve ser uma string.' })
  @Matches(/^[a-zA-Z0-9\s\/\-]{1,10}$/, {
    message:
      'O número deve conter apenas dígitos e caracteres básicos (letras, números, espaços, / e -).',
  })
  @MaxLength(10)
  numero: string;

  /**
   * Complemento do endereço (opcional)
   * Ex: apartamento, bloco, andar
   */
  @IsOptional()
  @IsString({ message: 'O complemento deve ser uma string.' })
  @MaxLength(50)
  complemento?: string;

  /**
   * Nome do bairro
   * Obrigatório, máximo 50 caracteres
   */
  @IsNotEmpty({ message: 'O bairro é obrigatório.' })
  @IsString({ message: 'O bairro deve ser uma string.' })
  @MaxLength(50)
  bairro: string;

  /**
   * Nome da cidade
   * Obrigatório, máximo 50 caracteres
   */
  @IsNotEmpty({ message: 'A cidade é obrigatória.' })
  @IsString({ message: 'A cidade deve ser uma string.' })
  @MaxLength(50)
  cidade: string;

  /**
   * Sigla do estado (UF)
   * Formato: 2 letras maiúsculas (ex: SP, RJ, MG)
   */
  @IsNotEmpty({ message: 'O estado é obrigatório.' })
  @IsString({ message: 'O estado deve ser uma string.' })
  @MaxLength(2)
  @Matches(/^[A-Z]{2}$/, {
    message: 'O estado (UF) deve ter 2 letras maiúsculas.',
  })
  estado: string;

  /**
   * CEP do endereço
   * Formato aceito: XXXXX-XXX ou XXXXXXXX
   */
  @IsNotEmpty({ message: 'O CEP é obrigatório.' })
  @IsString({ message: 'O CEP deve ser uma string.' })
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'O CEP deve ser um formato válido (ex: 12345-678).',
  })
  @MaxLength(9)
  cep: string;

  /**
   * Indica se é o endereço principal do cliente
   * Se true, outros endereços do mesmo cliente serão desmarcados como principais
   */
  @IsOptional()
  @IsBoolean({ message: 'O campo principal deve ser booleano.' })
  @Type(() => Boolean)
  principal?: boolean = false;

  /**
   * ID do cliente ao qual o endereço pertence
   * Usado para vinculação no momento da criação
   */
  @IsNotEmpty({ message: 'O ID do cliente é obrigatório para testes.' })
  @IsInt({ message: 'O ID do cliente deve ser um número inteiro.' })
  @Type(() => Number)
  clienteId: number;
}
