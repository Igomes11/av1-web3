import { DataSource } from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';

export async function seedCategorias(dataSource: DataSource) {
  const categoriaRepository = dataSource.getRepository(Categoria);

  // Verifica se já existem categorias
  const count = await categoriaRepository.count();
  if (count > 0) {
    console.log('⏭️  Categorias já existem, pulando...');
    return;
  }

  const categorias = [
    {
      nome: 'Eletrônicos',
      descricao: 'Produtos eletrônicos e tecnologia',
    },
    {
      nome: 'Roupas',
      descricao: 'Vestuário e moda',
    },
    {
      nome: 'Livros',
      descricao: 'Livros e publicações',
    },
    {
      nome: 'Casa e Decoração',
      descricao: 'Itens para casa e decoração',
    },
    {
      nome: 'Esportes',
      descricao: 'Artigos esportivos e fitness',
    },
  ];

  for (const categoriaData of categorias) {
    const categoria = categoriaRepository.create(categoriaData);
    await categoriaRepository.save(categoria);
  }

  console.log('Categorias criadas com sucesso!');
}