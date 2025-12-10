import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import type { CurrentView } from '../types/types';

const API_CATEGORIA_URL = 'http://localhost:3000/categoria';
const API_PRODUTO_URL = 'http://localhost:3000/produto';

interface Categoria {
  id: number;
  nome: string;
}

interface CategoryScreenProps {
  onSelectCategory: (categoryId: number, categoryName: string) => void;
  onChangeView: (view: CurrentView) => void;
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({ 
  onSelectCategory, 
  onChangeView 
}) => {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [productCounts, setProductCounts] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega categorias e conta produtos de cada uma
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Busca todas as categorias
        const categoriesResponse = await axios.get<Categoria[]>(API_CATEGORIA_URL);
        setCategories(categoriesResponse.data);

        // Busca todos os produtos
        const productsResponse = await axios.get(API_PRODUTO_URL);
        const products = productsResponse.data;

        // Conta quantos produtos tem em cada categoria
        const counts: { [key: number]: number } = {};
        categoriesResponse.data.forEach(cat => {
          counts[cat.id] = products.filter((p: any) => p.categoria?.id === cat.id).length;
        });
        setProductCounts(counts);

      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setError('Erro ao carregar categorias. Verifique se o backend está rodando.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando categorias...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => onChangeView('catalog')}>Voltar ao Catálogo</Button>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2>📂 Categorias</h2>
      <p className="text-muted">Navegue por categoria para encontrar o que procura</p>

      <Row className="mt-4">
        {/* Card para "Todos os Produtos" */}
        <Col md={4} lg={3} className="mb-4">
          <Card className="h-100 shadow-sm hover-card" style={{ cursor: 'pointer' }}>
            <Card.Body 
              className="d-flex flex-column align-items-center justify-content-center"
              onClick={() => onChangeView('catalog')}
            >
              <div className="display-4 mb-3">🏪</div>
              <Card.Title className="text-center">Todos os Produtos</Card.Title>
              <Card.Text className="text-muted text-center">
                Ver catálogo completo
              </Card.Text>
              <Button variant="primary" className="mt-auto w-100">
                Ver Todos
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Cards de Categorias */}
        {categories.map(category => {
          const count = productCounts[category.id] || 0;
          
          return (
            <Col md={4} lg={3} key={category.id} className="mb-4">
              <Card className="h-100 shadow-sm hover-card" style={{ cursor: 'pointer' }}>
                <Card.Body 
                  className="d-flex flex-column align-items-center justify-content-center"
                  onClick={() => onSelectCategory(category.id, category.nome)}
                >
                  <div className="display-4 mb-3">📦</div>
                  <Card.Title className="text-center">{category.nome}</Card.Title>
                  <Card.Text className="text-muted text-center">
                    {count} {count === 1 ? 'produto' : 'produtos'}
                  </Card.Text>
                  <Button variant="outline-primary" className="mt-auto w-100">
                    Ver Produtos
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {categories.length === 0 && (
        <Alert variant="info" className="mt-4">
          Nenhuma categoria cadastrada ainda.
        </Alert>
      )}
    </Container>
  );
};

export default CategoryScreen;