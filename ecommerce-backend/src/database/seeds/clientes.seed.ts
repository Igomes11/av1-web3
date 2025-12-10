import { DataSource } from 'typeorm';
import { Cliente } from '../../cliente/entities/cliente.entity';
import * as bcrypt from 'bcryptjs';

export async function seedClientes(dataSource: DataSource) {
  const clienteRepository = dataSource.getRepository(Cliente);

  // Verifica se já existem clientes
  const count = await clienteRepository.count();
  if (count > 0) {
    console.log('Clientes já existem, pulando...');
    return;
  }

  // Hash da senha "123456" para usuários de teste
  const senhaHash = await bcrypt.hash('123456', 10);

  const clientes = [
    {
      nome: 'Admin Teste',
      email: 'admin@teste.com',
      senha: senhaHash,
      telefone: '11999999999',
      cpf: '12345678900',
      papel: 'admin',
    },
    {
      nome: 'Cliente Teste',
      email: 'cliente@teste.com',
      senha: senhaHash,
      telefone: '11988888888',
      cpf: '98765432100',
      papel: 'cliente',
    },
    {
      nome: 'João Silva',
      email: 'joao@email.com',
      senha: senhaHash,
      telefone: '11977777777',
      cpf: '11122233344',
      papel: 'cliente',
    },
  ];

  for (const clienteData of clientes) {
    const cliente = clienteRepository.create(clienteData);
    await clienteRepository.save(cliente);
  }

  console.log('Clientes criados com sucesso!');
  console.log('');
  console.log('CREDENCIAIS DE TESTE:');
  console.log('Admin: admin@teste.com / 123456');
  console.log('Cliente: cliente@teste.com / 123456');
  console.log('');
}