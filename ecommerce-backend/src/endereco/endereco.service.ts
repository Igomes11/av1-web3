import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Endereco } from './entities/endereco.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { CreateEnderecoDto } from './dto/create-endereco.dto';
import { UpdateEnderecoDto } from './dto/update-endereco.dto';

@Injectable()
export class EnderecoService {
  constructor(
    @InjectRepository(Endereco)
    private enderecoRepository: Repository<Endereco>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  /**
   * Garante que o cliente existe e desmarca outros endereços como principais, se necessário.
   */
  private async preProcess(
    clienteId: number,
    isPrincipal: boolean,
  ): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id: clienteId },
    });
    if (!cliente) {
      throw new BadRequestException(
        `Cliente com ID ${clienteId} não encontrado.`,
      );
    }

    if (isPrincipal) {
      // Regra de Negócio: Se este for marcado como principal, desmarcar todos os outros do mesmo cliente
      await this.enderecoRepository.update(
        { cliente: { id: clienteId }, principal: true },
        { principal: false },
      );
    }
    return cliente;
  }

  // --- CREATE ---
  async create(createEnderecoDto: CreateEnderecoDto): Promise<Endereco> {
    const { clienteId, principal, ...data } = createEnderecoDto;

    // Processa a regra de "apenas um principal"
    const cliente = await this.preProcess(clienteId, principal ?? false);

    const novoEndereco = this.enderecoRepository.create({
      ...data,
      principal: principal ?? false,
      cliente: cliente,
    });

    return this.enderecoRepository.save(novoEndereco);
  }

  // --- READ ALL (por cliente) ---
  async findAllByCliente(clienteId: number): Promise<Endereco[]> {
    const cliente = await this.clienteRepository.findOne({
      where: { id: clienteId },
    });
    if (!cliente) {
      throw new NotFoundException(
        `Cliente com ID ${clienteId} não encontrado.`,
      );
    }

    return this.enderecoRepository.find({
      where: { cliente: { id: clienteId } },
      order: { principal: 'DESC' },
      relations: ['cliente'],
    });
  }

  // --- READ ONE (CORRIGIDO: adiciona o relacionamento 'cliente') ---
  async findOne(id: number): Promise<Endereco> {
    const endereco = await this.enderecoRepository.findOne({
      where: { id },
      relations: ['cliente'], // <--- ADICIONADO: Carrega o relacionamento Cliente
    });
    if (!endereco) {
      throw new NotFoundException(`Endereço com ID ${id} não encontrado.`);
    }
    return endereco;
  }

  // --- UPDATE ---
  async update(
    id: number,
    updateEnderecoDto: UpdateEnderecoDto,
  ): Promise<Endereco> {
    // findOne agora traz o relacionamento 'cliente', garantindo que a linha abaixo não falhe
    const endereco = await this.findOne(id);
    const { principal, ...data } = updateEnderecoDto;

    // Se a flag principal for alterada, aplica a regra de negócio
    if (principal !== undefined && principal !== endereco.principal) {
      // endereco.cliente.id agora é seguro de acessar
      await this.preProcess(endereco.cliente.id, principal);
    }

    // Aplica as atualizações e salva
    const enderecoAtualizado = this.enderecoRepository.merge(endereco, data);

    if (principal !== undefined) {
      enderecoAtualizado.principal = principal;
    }

    return this.enderecoRepository.save(enderecoAtualizado);
  }

  // --- DELETE ---
  async remove(id: number): Promise<void> {
    const result = await this.enderecoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Endereço com ID ${id} não encontrado.`);
    }
  }
}
