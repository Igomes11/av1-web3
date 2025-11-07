# 📬 Guia de Uso da API no Postman

Este guia explica passo a passo como usar a API do E-commerce no Postman.

**Base URL:** `http://localhost:3000`

---

## 📋 Pré-requisitos

1. **Postman instalado** ([baixar aqui](https://www.postman.com/downloads/))
2. **Backend rodando** na porta 3000
3. **MySQL configurado** e conectado

---

## 🚀 Configuração Inicial no Postman

### 1. Criar uma Collection (Opcional, mas recomendado)

1. Abra o Postman
2. Clique em **"New"** → **"Collection"**
3. Nomeie como: `E-commerce API`
4. Clique em **"Create"**

### 2. Configurar Variáveis de Ambiente (Opcional)

1. Clique no ícone de **engrenagem** (⚙️) no canto superior direito
2. Selecione **"Environments"**
3. Clique em **"+"** para criar novo ambiente
4. Nomeie como: `Local Development`
5. Adicione a variável:
   - **Variable:** `base_url`
   - **Initial Value:** `http://localhost:3000`
   - **Current Value:** `http://localhost:3000`
6. Clique em **"Save"**

**Agora você pode usar `{{base_url}}` em vez de digitar a URL completa!**

---

## 📚 Endpoints Disponíveis

### 🛍️ PRODUTOS

#### 1. Listar todos os produtos
**Método:** `GET`  
**URL:** `http://localhost:3000/produto`  
**Ou:** `{{base_url}}/produto`

**Query Parameters (opcionais):**
- `nome` - Filtrar por nome
- `categoriaId` - Filtrar por categoria
- `minPreco` - Preço mínimo
- `maxPreco` - Preço máximo

**Como fazer no Postman:**
1. Selecione método **GET**
2. Digite a URL: `http://localhost:3000/produto`
3. (Opcional) Clique na aba **"Params"** e adicione os filtros
4. Clique em **"Send"**

**Exemplo com filtros:**
```
GET http://localhost:3000/produto?nome=Notebook&categoriaId=1&minPreco=1000&maxPreco=5000
```

---

#### 2. Buscar produto por ID
**Método:** `GET`  
**URL:** `http://localhost:3000/produto/:id`

**Como fazer no Postman:**
1. Selecione método **GET**
2. Digite a URL: `http://localhost:3000/produto/1` (substitua 1 pelo ID desejado)
3. Clique em **"Send"**

---

#### 3. Criar produto
**Método:** `POST`  
**URL:** `http://localhost:3000/produto`

**Como fazer no Postman:**
1. Selecione método **POST**
2. Digite a URL: `http://localhost:3000/produto`
3. Clique na aba **"Headers"**
4. Adicione:
   - **Key:** `Content-Type`
   - **Value:** `application/json`
5. Clique na aba **"Body"**
6. Selecione **"raw"**
7. No dropdown à direita, selecione **"JSON"**
8. Cole o JSON abaixo:
```json
{
  "nome": "Notebook Gamer",
  "descricao": "Notebook para jogos com placa de vídeo dedicada",
  "preco": 3500.00,
  "estoque": 10,
  "imagem": "notebook.jpg",
  "statusAtivo": true,
  "categoriaId": 1
}
```
9. Clique em **"Send"**

**Campos obrigatórios:**
- `nome` (string)
- `preco` (number)
- `categoriaId` (number) - Deve existir uma categoria com esse ID

**Campos opcionais:**
- `descricao` (string)
- `estoque` (number, padrão: 0)
- `imagem` (string, padrão: "placeholder.png")
- `statusAtivo` (boolean, padrão: true)

---

#### 4. Atualizar produto
**Método:** `PATCH`  
**URL:** `http://localhost:3000/produto/:id`

**Como fazer no Postman:**
1. Selecione método **PATCH**
2. Digite a URL: `http://localhost:3000/produto/1` (substitua 1 pelo ID)
3. Configure **Headers** (Content-Type: application/json)
4. Configure **Body** (raw, JSON) com apenas os campos a atualizar:
```json
{
  "preco": 3200.00,
  "estoque": 5
}
```
5. Clique em **"Send"**

---

#### 5. Deletar produto
**Método:** `DELETE`  
**URL:** `http://localhost:3000/produto/:id`

**Como fazer no Postman:**
1. Selecione método **DELETE**
2. Digite a URL: `http://localhost:3000/produto/1`
3. Clique em **"Send"**

---

### 📂 CATEGORIAS

#### 1. Listar todas as categorias
**Método:** `GET`  
**URL:** `http://localhost:3000/categoria`

**Como fazer:** Selecione GET, digite a URL, clique Send.

---

#### 2. Buscar categoria por ID
**Método:** `GET`  
**URL:** `http://localhost:3000/categoria/:id`

**Exemplo:** `GET http://localhost:3000/categoria/1`

---

#### 3. Criar categoria
**Método:** `POST`  
**URL:** `http://localhost:3000/categoria`

**Headers:** `Content-Type: application/json`

**Body (raw, JSON):**
```json
{
  "nome": "Eletrônicos"
}
```

**⚠️ IMPORTANTE:** Crie uma categoria ANTES de criar produtos!

---

#### 4. Atualizar categoria
**Método:** `PATCH`  
**URL:** `http://localhost:3000/categoria/:id`

**Headers:** `Content-Type: application/json`

**Body (raw, JSON):**
```json
{
  "nome": "Eletrônicos e Informática"
}
```

---

#### 5. Deletar categoria
**Método:** `DELETE`  
**URL:** `http://localhost:3000/categoria/:id`

---

### 👤 CLIENTES

#### Criar cliente
**Método:** `POST`  
**URL:** `http://localhost:3000/cliente`

**Headers:** `Content-Type: application/json`

**Body (raw, JSON):**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "telefone": "81999999999"
}
```

**Campos obrigatórios:**
- `nome` (string)
- `email` (string, formato válido)
- `senha` (string, mínimo 6 caracteres)

**Campos opcionais:**
- `telefone` (string)

---

### 📍 ENDEREÇOS

#### 1. Criar endereço
**Método:** `POST`  
**URL:** `http://localhost:3000/endereco`

**Headers:** `Content-Type: application/json`

**Body (raw, JSON):**
```json
{
  "logradouro": "Rua Exemplo",
  "numero": "123",
  "complemento": "Apto 101",
  "bairro": "Centro",
  "cidade": "Recife",
  "estado": "PE",
  "cep": "50000-000",
  "principal": false,
  "clienteId": 1
}
```

**Campos obrigatórios:**
- `logradouro` (string)
- `numero` (string)
- `bairro` (string)
- `cidade` (string)
- `estado` (string, 2 caracteres)
- `cep` (string, formato: 12345-678)
- `clienteId` (number) - ID do cliente existente

---

#### 2. Listar endereços de um cliente
**Método:** `GET`  
**URL:** `http://localhost:3000/endereco/cliente/:clienteId`

**Exemplo:** `GET http://localhost:3000/endereco/cliente/1`

---

#### 3. Buscar endereço por ID
**Método:** `GET`  
**URL:** `http://localhost:3000/endereco/:id`

**Exemplo:** `GET http://localhost:3000/endereco/1`

---

#### 4. Atualizar endereço
**Método:** `PATCH`  
**URL:** `http://localhost:3000/endereco/:id`

**Headers:** `Content-Type: application/json`

**Body (raw, JSON):**
```json
{
  "numero": "456",
  "complemento": "Apto 202"
}
```

---

#### 5. Deletar endereço
**Método:** `DELETE`  
**URL:** `http://localhost:3000/endereco/:id`

---

### 🛒 PEDIDOS

#### 1. Criar pedido
**Método:** `POST`  
**URL:** `http://localhost:3000/pedido`

**Headers:** `Content-Type: application/json`

**Body (raw, JSON):**
```json
{
  "clienteId": 1,
  "enderecoId": 1,
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2
    },
    {
      "produtoId": 2,
      "quantidade": 1
    }
  ]
}
```

**Campos obrigatórios:**
- `clienteId` (number) - ID do cliente existente
- `enderecoId` (number) - ID do endereço existente
- `itens` (array) - Array com pelo menos 1 item
  - `produtoId` (number) - ID do produto existente
  - `quantidade` (number) - Quantidade do produto

---

#### 2. Buscar pedido por ID
**Método:** `GET`  
**URL:** `http://localhost:3000/pedido/:id`

**Exemplo:** `GET http://localhost:3000/pedido/1`

---

#### 3. Listar pedidos de um cliente
**Método:** `GET`  
**URL:** `http://localhost:3000/pedido/cliente/:clienteId`

**Exemplo:** `GET http://localhost:3000/pedido/cliente/1`

---

#### 4. Atualizar status do pedido
**Método:** `PATCH`  
**URL:** `http://localhost:3000/pedido/:id/status`

**Headers:** `Content-Type: application/json`

**Body (raw, JSON):**
```json
{
  "status": "CANCELADO"
}
```

**Status válidos:**
- `ABERTO`
- `AGUARDANDO_PAGAMENTO`
- `PAGO`
- `CANCELADO`

---

### 💳 PAGAMENTOS

#### Processar pagamento
**Método:** `POST`  
**URL:** `http://localhost:3000/pagamento/processar`

**Headers:** `Content-Type: application/json`

**Body (raw, JSON):**
```json
{
  "pedidoId": 1,
  "metodo": "Cartão",
  "valor": 7000.00,
  "novoStatus": "PAGO"
}
```

**Campos obrigatórios:**
- `pedidoId` (number) - ID do pedido existente
- `metodo` (string) - `"Cartão"`, `"Boleto"` ou `"PIX"`
- `valor` (number) - Valor do pagamento
- `novoStatus` (string) - `"PAGO"` ou `"CANCELADO"`

**⚠️ IMPORTANTE:** Quando `novoStatus` é `"PAGO"`, o estoque dos produtos é debitado automaticamente!

---

## 🔄 Fluxo Completo de Exemplo

Siga esta ordem para testar a API completa:

### Passo 1: Criar Categoria
```
POST http://localhost:3000/categoria
Headers: Content-Type: application/json
Body:
{
  "nome": "Eletrônicos"
}
```
**Anote o ID retornado!** (exemplo: `1`)

---

### Passo 2: Criar Produtos
```
POST http://localhost:3000/produto
Headers: Content-Type: application/json
Body:
{
  "nome": "Notebook Gamer",
  "descricao": "Notebook para jogos",
  "preco": 3500.00,
  "estoque": 10,
  "categoriaId": 1
}
```

```
POST http://localhost:3000/produto
Headers: Content-Type: application/json
Body:
{
  "nome": "Mouse Gamer",
  "descricao": "Mouse com RGB",
  "preco": 150.00,
  "estoque": 50,
  "categoriaId": 1
}
```

**Anote os IDs dos produtos!** (exemplo: `1` e `2`)

---

### Passo 3: Criar Cliente
```
POST http://localhost:3000/cliente
Headers: Content-Type: application/json
Body:
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "telefone": "81999999999"
}
```
**Anote o ID retornado!** (exemplo: `1`)

---

### Passo 4: Criar Endereço
```
POST http://localhost:3000/endereco
Headers: Content-Type: application/json
Body:
{
  "logradouro": "Rua Exemplo",
  "numero": "123",
  "complemento": "Apto 101",
  "bairro": "Centro",
  "cidade": "Recife",
  "estado": "PE",
  "cep": "50000-000",
  "clienteId": 1
}
```
**Anote o ID retornado!** (exemplo: `1`)

---

### Passo 5: Criar Pedido
```
POST http://localhost:3000/pedido
Headers: Content-Type: application/json
Body:
{
  "clienteId": 1,
  "enderecoId": 1,
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2
    },
    {
      "produtoId": 2,
      "quantidade": 1
    }
  ]
}
```
**Anote o ID retornado!** (exemplo: `1`)

---

### Passo 6: Processar Pagamento
```
POST http://localhost:3000/pagamento/processar
Headers: Content-Type: application/json
Body:
{
  "pedidoId": 1,
  "metodo": "Cartão",
  "valor": 7150.00,
  "novoStatus": "PAGO"
}
```

---

## ✅ Verificar Resultados

### Ver todos os produtos:
```
GET http://localhost:3000/produto
```

### Ver pedidos de um cliente:
```
GET http://localhost:3000/pedido/cliente/1
```

### Ver endereços de um cliente:
```
GET http://localhost:3000/endereco/cliente/1
```

---

## 🎯 Dicas Importantes

### 1. Headers são obrigatórios para POST/PATCH
Sempre adicione `Content-Type: application/json` no header quando enviar JSON.

### 2. IDs devem existir
- Para criar produto, a categoria deve existir
- Para criar endereço, o cliente deve existir
- Para criar pedido, cliente, endereço e produtos devem existir

### 3. Substitua :id pelos números reais
- `/produto/:id` → `/produto/1`
- `/categoria/:id` → `/categoria/1`

### 4. Use Query Parameters para filtros
Na aba **"Params"** do Postman, adicione:
- Key: `nome`, Value: `Notebook`
- Key: `categoriaId`, Value: `1`

### 5. Salve suas requisições
Clique em **"Save"** após criar uma requisição para reutilizar depois.

### 6. Verifique a resposta
- **Status 200/201** = Sucesso ✅
- **Status 400** = Dados inválidos ❌
- **Status 404** = Não encontrado ❌

---

## 🐛 Resolução de Problemas

### Erro: "Cannot POST /produto"
- Verifique se o backend está rodando na porta 3000
- Verifique a URL (deve ser `http://localhost:3000/produto`)

### Erro: "Validation failed"
- Verifique se todos os campos obrigatórios estão preenchidos
- Verifique o formato dos dados (email válido, números corretos, etc.)

### Erro: "Foreign key constraint failed"
- O ID referenciado não existe
- Exemplo: Tentar criar produto com `categoriaId: 999` quando categoria 999 não existe

### Erro: "Connection refused"
- Backend não está rodando
- Execute: `cd ecommerce-backend && npm run start:dev`

---

## 📖 Exemplos de Resposta

### Sucesso (200/201):
```json
{
  "id": 1,
  "nome": "Notebook Gamer",
  "preco": "3500.00",
  "estoque": 10
}
```

### Erro de Validação (400):
```json
{
  "statusCode": 400,
  "message": [
    "O nome é obrigatório.",
    "O preço deve ser maior que zero."
  ],
  "error": "Bad Request"
}
```

### Não Encontrado (404):
```json
{
  "statusCode": 404,
  "message": "Produto não encontrado.",
  "error": "Not Found"
}
```

---

## 🎓 Recursos Adicionais

- **Postman Learning Center:** [https://learning.postman.com/](https://learning.postman.com/)
- **Documentação NestJS:** [https://docs.nestjs.com/](https://docs.nestjs.com/)

---

**Pronto para começar!** 🚀

Crie suas primeiras requisições seguindo este guia e explore todos os endpoints da API.

