import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { seedCategorias } from './categorias.seed';
import { seedProdutos } from './produtos.seed';
import { seedClientes } from './clientes.seed';

// Carrega variáveis de ambiente
config();

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: configService.get<string>('DATABASE_HOST'),
  port: parseInt(configService.get<string>('DATABASE_PORT') ?? '3306', 10),
  username: configService.get<string>('DATABASE_USERNAME'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: false,
});

async function runSeeds() {
  console.log('Iniciando seeds...');
  console.log('');

  try {
    await AppDataSource.initialize();
    console.log('Conexão com banco de dados estabelecida');
    console.log('');

    // Executa os seeds na ordem correta
    await seedCategorias(AppDataSource);
    await seedProdutos(AppDataSource);
    await seedClientes(AppDataSource);

    console.log('');
    console.log('Seeds executados com sucesso!');
  } catch (error) {
    console.error('Erro ao executar seeds:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

runSeeds();