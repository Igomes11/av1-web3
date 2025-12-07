import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './entities/produto.entity';
import { Categoria } from '../categoria/entities/categoria.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,

    @InjectRepository(Categoria) // Injeta o repositório de Categoria para validação de FK
    private categoriaRepository: Repository<Categoria>,
  ) {}

  /**
   * Valida se a categoria existe.
   */
  private async validateCategoria(categoriaId: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id: categoriaId },
    });
    if (!categoria) {
      throw new BadRequestException(
        `Categoria com ID ${categoriaId} não encontrada.`,
      );
    }
    return categoria;
  }

  // --- CREATE ---
  async create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    await this.validateCategoria(createProdutoDto.categoriaId);

    const novoProduto = this.produtoRepository.create(createProdutoDto);
    return this.produtoRepository.save(novoProduto);
  }

  // --- READ ALL (com filtros) ---
  // Filtros conforme escopo (por nome, categoria, preço min/max)
  async findAll(
    nome?: string,
    categoriaId?: number,
    minPreco?: number,
    maxPreco?: number,
  ): Promise<Produto[]> {
    const query = this.produtoRepository
      .createQueryBuilder('produto')
      .leftJoinAndSelect('produto.categoria', 'categoria'); // Carrega a categoria

    if (nome) {
      query.andWhere('produto.nome LIKE :nome', { nome: `%${nome}%` });
    }
    if (categoriaId) {
      query.andWhere('produto.categoriaId = :categoriaId', { categoriaId });
    }
    if (minPreco !== undefined) {
      query.andWhere('produto.preco >= :minPreco', { minPreco });
    }
    if (maxPreco !== undefined) {
      query.andWhere('produto.preco <= :maxPreco', { maxPreco });
    }

    // Filtro essencial para o catálogo: apenas produtos ativos
    query.andWhere('produto.statusAtivo = true');

    return query.getMany();
  }

  // --- READ ONE ---
  async findOne(id: number): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({
      where: { id },
      relations: ['categoria'], // Carrega a categoria ao buscar um único produto
    });
    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }
    return produto;
  }

  // --- UPDATE ---
  async update(
    id: number,
    updateProdutoDto: UpdateProdutoDto,
  ): Promise<Produto> {
    const produto = await this.findOne(id);

    // Validação da categoria, se o ID for alterado
    if (updateProdutoDto.categoriaId) {
      await this.validateCategoria(updateProdutoDto.categoriaId);
    }

    // Aplica as atualizações e salva
    const produtoAtualizado = this.produtoRepository.merge(
      produto,
      updateProdutoDto,
    );
    return this.produtoRepository.save(produtoAtualizado);
  }

  // --- DELETE ---
  async remove(id: number): Promise<void> {
    // Em vez de deletar, idealmente mudamos o status. Mas para um CRUD simples:
    const result = await this.produtoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }
  }

  // --- Método utilitário para validação (usado no Pedido) ---
  async findActiveProductById(id: number): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({
      where: { id, statusAtivo: true },
    });
    if (!produto) {
      throw new NotFoundException(
        `Produto com ID ${id} não encontrado ou inativo.`,
      );
    }
    return produto;
  }
}
