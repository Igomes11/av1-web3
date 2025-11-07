# 🛒 Projeto E-commerce — Overview completo

Este repositório contém uma aplicação de e-commerce dividida em duas aplicações dentro de um monorepo:

- `ecommerce-backend` — API RESTful construída com NestJS + TypeORM (persistência em MySQL/Postgres).
- `ecommerce-frontend` — Aplicação web em React + Vite (consome a API).

O objetivo deste README é documentar a arquitetura, instruções de instalação, configuração do banco, uso e overview dos módulos.

## Sumário

- Visão geral
- Arquitetura e stacks
- Estrutura do repositório
- Configuração (variáveis de ambiente)
- Como rodar (desenvolvimento e produção)
- Endpoints e módulos principais (resumo)
- Regras de negócio críticas
- Testes e validação
- Contribuindo
- Licença

---

## Visão geral

O sistema implementa um fluxo de e-commerce completo: gestão de clientes, endereços, catálogo de produtos (vinculados a categorias), carrinho/pedidos e integração de pagamentos (simulada). A lógica crítica (por exemplo: débito de estoque e mudança de status de pedidos) é implementada com transações atômicas no backend.

## Arquitetura e stacks

- Backend: NestJS, TypeScript, TypeORM, MySQL (ou PostgreSQL), bcryptjs, class-validator/class-transformer.
- Frontend: React (Vite), TypeScript, Axios, React-Bootstrap.
-+- Ferramentas dev: eslint, jest (backend possui testes de unidade/e2e configurados).

## Estrutura do repositório (resumida)

- `ecommerce-backend/` — código NestJS
	- `src/` — módulos (cliente, produto, pedido, pagamento, categoria, endereco, item-pedido, etc.)
	- `package.json`, `tsconfig.json`, scripts e configuração do Nest.
- `ecommerce-frontend/` — código React
	- `src/` — componentes, telas (ProductCatalog, ProductDetails, CartScreen, CheckoutScreen, ProfileScreen, etc.)
	- `package.json`, `vite.config.ts`.

## Configuração (variáveis de ambiente)

Crie um arquivo `.env` dentro de `ecommerce-backend/` com as credenciais do banco. Exemplo mínimo para MySQL:

```env
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=user
DATABASE_PASSWORD=sua_senha
DATABASE_NAME=ecommerce_av1
JWT_SECRET=uma_chave_secreta
JWT_EXPIRES_IN=3600s
```

Observações:
- Crie o banco `ecommerce_av1` no seu servidor MySQL antes de rodar (ou ajuste `DATABASE_NAME`).
- O projeto também pode ser configurado para PostgreSQL alterando `DATABASE_TYPE` e credenciais correspondentes.

## Como rodar (desenvolvimento)

Recomendações: usar Node 20+ e npm (ou yarn). A seguir comandos para PowerShell (Windows):

1) Backend

```powershell
cd ecommerce-backend
npm install
# ajustar .env conforme acima
npm run start:dev
```

Isso inicia a API em `http://localhost:3000` (modo dev com hot-reload). O projeto aplica migrações/initialization automáticas ao iniciar.

2) Frontend

```powershell
cd ecommerce-frontend
npm install
npm run dev
```

O front abre em `http://localhost:5173` por padrão.

## Como rodar (produção / build)

- Backend: siga a configuração padrão do Nest para build & start (npm run build && node dist/main.js) — veja `ecommerce-backend/package.json`.
- Frontend: `npm run build` em `ecommerce-frontend` e sirva os arquivos estáticos com seu servidor preferido.

## Resumo dos módulos e responsabilidades

- Cliente (`cliente`): cadastro, login (JWT), validação de e-mail único, criptografia de senha com bcryptjs.
- Endereço (`endereco`): vários endereços por cliente; apenas um pode ser marcado como principal (RN aplicada no serviço).
- Categoria (`categoria`): CRUD de categorias.
- Produto (`produto`): CRUD de produtos, atributo `statusAtivo` e controle de estoque.
- ItemPedido (`item-pedido`): regras que asseguram que quantidade não exceda estoque e produto esteja ativo.
- Pedido (`pedido`): criação com status inicial `AGUARDANDO_PAGAMENTO`.
- Pagamento (`pagamento`): processamento que altera status do pedido para `PAGO` ou `CANCELADO` dentro de transação atômica; se `PAGO`, debita estoque.

## Endpoints (visão geral)

O backend expõe endpoints REST em `/` (prefixo padrão). Veja os controllers em `ecommerce-backend/src/*/*.controller.ts`. Exemplo de rotas principais (resumo):

- POST `/auth/register` — registrar cliente
- POST `/auth/login` — autenticar (retorna JWT)
- GET `/produtos` — listar produtos ativos
- GET `/produtos/:id` — detalhes do produto
- POST `/pedidos` — criar pedido (autenticado)
- POST `/pagamentos/:pedidoId/processar` — processar pagamento (simulado)
- GET `/clientes/me/pedidos` — listar pedidos do cliente

Para documentação completa de cada rota, tipos e DTOs, abra os arquivos `src/*/dto` e `src/*/*.controller.ts` no backend.

## Regras de negócio críticas (detalhes importantes)

- Unicidade de e-mail para clientes e senha criptografada.
- Apenas um endereço principal por cliente.
- Produtos com `statusAtivo: false` não podem ser colocados em pedidos.
- Validação de quantidade de itens frente ao estoque em múltiplas camadas (frontend e backend).
- Fluxo de pagamento e débito de estoque em transação atômica:
	- Pedido criado: `AGUARDANDO_PAGAMENTO` (sem débito de estoque)
	- Ao processar pagamento:
		- Se `PAGO`: debitar estoque e atualizar pedido para `PAGO` dentro de uma transação (queryRunner)
		- Se `CANCELADO`: marcar pedido como `CANCELADO` sem mexer no estoque
	- Pedidos `PAGO` ou `CANCELADO` não podem ser alterados posteriormente.

## Testes e qualidade

- O backend inclui testes unitários e e2e (Jest). Para rodar os testes do backend:

```powershell
cd ecommerce-backend
npm run test
npm run test:e2e
```

Verifique `package.json` dentro de `ecommerce-backend` para scripts e configurações adicionais.

## Dicas de desenvolvimento

- Use ferramentas como Postman/Insomnia para testar endpoints da API.
- Ao alterar entidades ou migrations, revise as configurações do TypeORM em `ecommerce-backend`.
- Para debug no NestJS, rodar `npm run start:debug` ou usar breakpoints via VS Code (attach).

## Como contribuir

1. Fork do repositório
2. Crie uma branch com a feature/bugfix: `git checkout -b feat/nome-da-feature`
3. Faça commits claros e pequenos
4. Push e abra PR com descrição do que foi alterado

Antes de abrir PR, execute os testes e garanta que não há quebras.

## Arquivos importantes para olhar (ponto de partida)

- `ecommerce-backend/src/app.module.ts` — wiring dos módulos do backend
- `ecommerce-backend/src/*/*.service.ts` — lógica de negócio
- `ecommerce-backend/src/*/*.controller.ts` — endpoints
- `ecommerce-frontend/src/components` — componentes React principais

## Próximos passos e sugestões

- Adicionar documentação automática (ex.: Swagger) ao backend para listar endpoints.
- Implementar CI com lint, build e testes.
- Adicionar testes de integração cobrindo o fluxo de pagamento e débito de estoque.

## Licença

Este projeto inclui um arquivo `LICENSE` na raiz. Consulte-o para termos de uso.

---

Se quiser, eu posso também:

- Adicionar uma seção Swagger e instrução para habilitá-lo no backend.
- Gerar um arquivo `.env.example` em `ecommerce-backend/` com as variáveis comentadas.
- Criar scripts no `package.json` para facilitar builds locais.

Diga se quer que eu gere algum desses extras agora.