import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty({
    description: 'Nome completo do cliente',
    example: 'João Silva',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @MaxLength(150)
  nome: string;

  @ApiProperty({
    description: 'Email do cliente (usado para login)',
    example: 'joao.silva@email.com',
  })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  @IsEmail({}, { message: 'O email deve ser um endereço de e-mail válido.' })
  email: string;

  @ApiProperty({
    description: 'Senha do cliente (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  senha: string;

  @ApiPropertyOptional({
    description: 'Telefone do cliente',
    example: '(11) 98765-4321',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'O telefone deve ser uma string.' })
  @MaxLength(20)
  telefone: string;
}