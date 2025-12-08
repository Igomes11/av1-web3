import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { ClienteModule } from './cliente/cliente.module';
import { EnderecoModule } from './endereco/endereco.module';
import { CategoriaModule } from './categoria/categoria.module';
import { ProdutoModule } from './produto/produto.module';
import { PedidoModule } from './pedido/pedido.module';
import { ItemPedidoModule } from './item-pedido/item-pedido.module';
import { PagamentoModule } from './pagamento/pagamento.module';
import { AuthModule } from './auth/auth.module';
import { CarrinhoModule } from './carrinho/carrinho.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 1. Configura o módulo de ambiente para ler o .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Configura o TypeORM de forma assíncrona (prática recomendada)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('DATABASE_TYPE'),
        host: configService.get<string>('DATABASE_HOST'),
        port: parseInt(
          configService.get<string>('DATABASE_PORT') ?? '3306',
          10,
        ),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
      }),
    }),

    // Agendamento de tarefas
    ScheduleModule.forRoot(),

    // Módulos da aplicação
    ClienteModule,
    EnderecoModule,
    CategoriaModule,
    ProdutoModule,
    PedidoModule,
    ItemPedidoModule,
    PagamentoModule,
    AuthModule,
    CarrinhoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
