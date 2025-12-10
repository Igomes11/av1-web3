import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EnderecoService } from './endereco.service';
import { CreateEnderecoDto } from './dto/create-endereco.dto';
import { UpdateEnderecoDto } from './dto/update-endereco.dto';
import { Endereco } from './entities/endereco.entity';

@ApiTags('endereco')
@Controller('endereco')
@UsePipes(new ValidationPipe({ transform: true }))
export class EnderecoController {
  constructor(private readonly enderecoService: EnderecoService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo endereço' })
  @ApiResponse({ status: 201, description: 'Endereço criado com sucesso', type: Endereco })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createEnderecoDto: CreateEnderecoDto): Promise<Endereco> {
    return this.enderecoService.create(createEnderecoDto);
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: 'Listar endereços de um cliente' })
  @ApiParam({ name: 'clienteId', description: 'ID do cliente', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de endereços', type: [Endereco] })
  findAllByCliente(
    @Param('clienteId', ParseIntPipe) clienteId: number,
  ): Promise<Endereco[]> {
    return this.enderecoService.findAllByCliente(clienteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar endereço por ID' })
  @ApiParam({ name: 'id', description: 'ID do endereço', type: Number })
  @ApiResponse({ status: 200, description: 'Endereço encontrado', type: Endereco })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Endereco> {
    return this.enderecoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar endereço' })
  @ApiParam({ name: 'id', description: 'ID do endereço', type: Number })
  @ApiResponse({ status: 200, description: 'Endereço atualizado', type: Endereco })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnderecoDto: UpdateEnderecoDto,
  ): Promise<Endereco> {
    return this.enderecoService.update(id, updateEnderecoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar endereço' })
  @ApiParam({ name: 'id', description: 'ID do endereço', type: Number })
  @ApiResponse({ status: 200, description: 'Endereço removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.enderecoService.remove(id);
  }
}