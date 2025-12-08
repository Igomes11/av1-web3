import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateItemDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantidade: number;
}