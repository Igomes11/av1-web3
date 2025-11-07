import { useState, useEffect } from "react";
import axios from "axios";
import { formatPrice } from "../utils/format";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import type { Produto } from "../types";

const API_URL = "http://localhost:3000/produto";

interface ProductCatalogProps {
  onSelectProduct: (id: number) => void;
  cartItems: { productId: number; quantidade: number }[];
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onSelectProduct,
  cartItems,
}) => {
  const [products, setProducts] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get<Produto[]>(API_URL);
      setProducts(response.data);
    } catch (err) {
      setError(
        "Erro ao carregar o catálogo de produtos. Verifique se o Back-end está ativo e se há produtos cadastrados na API."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getItemCount = (productId: number) => {
    const item = cartItems.find((item) => item.productId === productId);
    return item ? item.quantidade : 0;
  };

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando catálogo...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={fetchProducts}>Tentar Recarregar</Button>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h2>Catálogo de Produtos</h2>
      <Row>
        {products.map((product) => {
          const count = getItemCount(product.id);
          return (
            <Col md={4} lg={3} key={product.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={`https://placehold.co/400x300?text=${product.nome.substring(
                    0,
                    15
                  )}`}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{product.nome}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1">
                    {product.descricao
                      ? product.descricao.substring(0, 50) + "..."
                      : "Sem descrição."}
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="fs-5 fw-bold text-success">
                      R$ {formatPrice(product.preco)}
                    </span>
                    <span
                      className={`badge bg-${
                        product.estoque > 0 ? "info" : "danger"
                      }`}
                    >
                      Estoque: {product.estoque}
                    </span>
                  </div>
                  {count > 0 && (
                    <Alert variant="success" className="mt-2 p-1 text-center">
                      No Carrinho: {count}
                    </Alert>
                  )}
                  <Button
                    variant="primary"
                    className="mt-3"
                    onClick={() => onSelectProduct(product.id)}
                    disabled={product.estoque === 0}
                  >
                    Ver Detalhes
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
        {products.length === 0 && (
          <Col>
            <Alert variant="info">
              Nenhum produto encontrado
            </Alert>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default ProductCatalog;
