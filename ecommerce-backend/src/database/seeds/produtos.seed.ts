import { DataSource } from 'typeorm';
import { Produto } from '../../produto/entities/produto.entity';
import { Categoria } from '../../categoria/entities/categoria.entity';

export async function seedProdutos(dataSource: DataSource) {
  const produtoRepository = dataSource.getRepository(Produto);
  const categoriaRepository = dataSource.getRepository(Categoria);

  // Verifica se já existem produtos
  const count = await produtoRepository.count();
  if (count > 0) {
    console.log('Produtos já existem, pulando...');
    return;
  }

  // Busca as categorias
  const categorias = await categoriaRepository.find();
  if (categorias.length === 0) {
    console.log('Erro: Nenhuma categoria encontrada. Execute seed de categorias primeiro.');
    return;
  }

  // Produtos por categoria com URLs de Imagem
  const produtosData = [
    // Eletrônicos
    {
      nome: 'Smartphone Galaxy S23',
      descricao: 'Smartphone top de linha com câmera de 200MP',
      preco: 3999.99,
      estoque: 50,
      imagem: 'https://imgur.com/P1ersdk.jpeg',
      categoriaId: categorias.find(c => c.nome === 'Eletrônicos')?.id,
    },
    {
      nome: 'Notebook Dell Inspiron',
      descricao: 'Notebook Intel Core i7, 16GB RAM, SSD 512GB',
      preco: 4500.00,
      estoque: 30,
      imagem: 'https://imgur.com/tJgOkMU.jpeg',
      categoriaId: categorias.find(c => c.nome === 'Eletrônicos')?.id,
    },
    {
      nome: 'Fone Bluetooth JBL',
      descricao: 'Fone de ouvido sem fio com cancelamento de ruído',
      preco: 350.00,
      estoque: 100,
      imagem: 'https://imgur.com/WkDrJUB.jpeg',
      categoriaId: categorias.find(c => c.nome === 'Eletrônicos')?.id,
    },
    
    // Roupas
    {
      nome: 'Camiseta Básica',
      descricao: 'Camiseta 100% algodão, várias cores disponíveis',
      preco: 49.90,
      estoque: 200,
      imagem: 'https://imgur.com/APFuzMb.jpeg',
      categoriaId: categorias.find(c => c.nome === 'Roupas')?.id,
    },
    {
      nome: 'Calça Jeans Slim',
      descricao: 'Calça jeans masculina corte slim fit',
      preco: 159.90,
      estoque: 80,
      imagem: 'https://imgur.com/zxhKrCP.jpeg',
      categoriaId: categorias.find(c => c.nome === 'Roupas')?.id,
    },
    {
      nome: 'Tênis Nike Air Force',
      descricao: 'Tênis esportivo confortável para corrida',
      preco: 599.90,
      estoque: 45,
      imagem: 'https://imgur.com/6aMqVtY.jpeg',
      categoriaId: categorias.find(c => c.nome === 'Roupas')?.id,
    },
    
    // Livros
    {
      nome: 'Clean Code',
      descricao: 'Livro sobre boas práticas de programação',
      preco: 89.90,
      estoque: 60,
      imagem: 'https://imgur.com/qyH8ab4.jpeg',
      categoriaId: categorias.find(c => c.nome === 'Livros')?.id,
    },
    {
      nome: 'Harry Potter - Coleção Completa',
      descricao: 'Box com os 7 livros da saga',
      preco: 250.00,
      estoque: 25,
      imagem: 'https://imgur.com/J2EY3QU.jpeg',
      categoriaId: categorias.find(c => c.nome === 'Livros')?.id,
    },
    
    // Casa e Decoração
    {
      nome: 'Jogo de Panelas Tramontina',
      descricao: 'Kit com 5 panelas antiaderentes',
      preco: 299.90,
      estoque: 40,
      imagem: 'https://imgur.com/xnYeh2L.jpeg',
      categoriaId: categorias.find(c => c.nome === 'Casa e Decoração')?.id,
    },
    {
      nome: 'Almofada Decorativa',
      descricao: 'Almofada 45x45cm com estampa moderna',
      preco: 39.90,
      estoque: 150,
      imagem: 'https://imgur.com/9XnFffb.jpeg',
      categoriaId: categorias.find(c => c.nome === 'Casa e Decoração')?.id,
    },
    
    // Esportes
    {
      nome: 'Bola de Futebol Penalty',
      descricao: 'Bola oficial de futebol campo',
      preco: 120.00,
      estoque: 70,
      imagem: 'https://imgur.com/GnSzqzv.jpeg',
      categoriaId: categorias.find(c => c.nome === 'Esportes')?.id,
    },
    {
      nome: 'Colchonete para Yoga',
      descricao: 'Colchonete antiderrapante 1,80m',
      preco: 89.90,
      estoque: 90,
      imagem: 'https://imgur.com/VDTCzpM.jpeg',
      categoriaId: categorias.find(c => c.nome === 'Esportes')?.id,
    },
  ];

  for (const produtoData of produtosData) {
    if (produtoData.categoriaId) {
      const produto = produtoRepository.create(produtoData);
      await produtoRepository.save(produto);
    }
  }

  console.log('Produtos criados com sucesso!');
}