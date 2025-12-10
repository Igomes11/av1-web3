import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProdutoService } from './produto.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Produto } from './entities/produto.entity';

@ApiTags('produto')
@Controller('produto')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo produto' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso', type: Produto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createProdutoDto: CreateProdutoDto): Promise<Produto> {
    return this.produtoService.create(createProdutoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos com filtros opcionais' })
  @ApiQuery({ name: 'nome', required: false, description: 'Filtrar por nome do produto' })
  @ApiQuery({ name: 'categoriaId', required: false, description: 'Filtrar por ID da categoria', type: Number })
  @ApiQuery({ name: 'minPreco', required: false, description: 'Preço mínimo', type: Number })
  @ApiQuery({ name: 'maxPreco', required: false, description: 'Preço máximo', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de produtos', type: [Produto] })
  async findAll(
    @Query('nome') nome?: string,
    @Query('categoriaId', new ParseIntPipe({ optional: true })) categoriaId?: number,
    @Query('minPreco') minPreco?: number,
    @Query('maxPreco') maxPreco?: number,
  ): Promise<Produto[]> {
    return this.produtoService.findAll(nome, categoriaId, minPreco, maxPreco);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiParam({ name: 'id', description: 'ID do produto', type: Number })
  @ApiResponse({ status: 200, description: 'Produto encontrado', type: Produto })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Produto> {
    return this.produtoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiParam({ name: 'id', description: 'ID do produto', type: Number })
  @ApiResponse({ status: 200, description: 'Produto atualizado', type: Produto })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProdutoDto: UpdateProdutoDto,
  ): Promise<Produto> {
    return this.produtoService.update(id, updateProdutoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar produto' })
  @ApiParam({ name: 'id', description: 'ID do produto', type: Number })
  @ApiResponse({ status: 200, description: 'Produto removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.produtoService.remove(id);
  }
}