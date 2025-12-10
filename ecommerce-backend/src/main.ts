import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Frontend na porta 5173 (padrão Vite)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

const config = new DocumentBuilder()
  .setTitle('E-commerce API')
  .setDescription('API RESTful para sistema de e-commerce com autenticação JWT')
  .setVersion('1.0')
  .addTag('auth', 'Autenticação e autorização')
  .addTag('cliente', 'Gerenciamento de clientes')
  .addTag('produto', 'Gerenciamento de produtos')
  .addTag('categoria', 'Gerenciamento de categorias')
  .addTag('carrinho', 'Gerenciamento do carrinho de compras')
  .addTag('pedido', 'Gerenciamento de pedidos')
  .addTag('pagamento', 'Gerenciamento de pagamentos')
  .addTag('endereco', 'Gerenciamento de endereços')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('Aplicação rodando em: http://localhost:3000');
  console.log('Documentação Swagger em: http://localhost:3000/api');
}
bootstrap();