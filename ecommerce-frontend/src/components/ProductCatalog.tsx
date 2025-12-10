/**
 * ProductCatalog.tsx
 * 
 * Componente que implementa a exibição do catálogo de produtos.
 * Responsabilidades:
 * - Carregamento e exibição da lista de produtos
 * - Visualização em grid com cards
 * - Exibição de informações básicas (nome, preço, estoque)
 * - Integração com carrinho
 * - Navegação para detalhes do produto
 */

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
import type { Cart } from "../services/cartService";

/** URL base da API para operações com produtos */
const API_URL = "http://localhost:3000/produto";

/**
 * Props do componente de catálogo
 * @interface ProductCatalogProps
 */
interface ProductCatalogProps {
  /** Callback para navegação aos detalhes do produto */
  onSelectProduct: (id: number) => void;
  /** Carrinho completo do usuário */
  cart: Cart | null;
  categoryId?: number;
  categoryName?: string;
}

/**
 * Componente de catálogo de produtos
 * Exibe grid de produtos com informações básicas e
 * integração com o estado do carrinho
 */
const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onSelectProduct,
  cart,
  categoryId,
  categoryName,
}) => {
  // Estados para gerenciamento de dados e UI
  const [products, setProducts] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega a lista de produtos do backend
   */
  const fetchProducts = async () => {
    try {
      // MODIFICAR: Adiciona filtro por categoria se existir
      let url = API_URL;
      if (categoryId) {
        url = `${API_URL}?categoriaId=${categoryId}`;
      }
      const response = await axios.get<Produto[]>(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError(
        "Erro ao carregar o catálogo de produtos. Verifique se o Back-end está ativo e se há produtos cadastrados na API."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega produtos quando o componente monta
  useEffect(() => {
    void fetchProducts();
  }, []);

  /**
   * Retorna a quantidade de um produto no carrinho
   * @param productId - ID do produto a verificar
   * @returns Quantidade do produto no carrinho
   */
  const getItemCount = (productId: number) => {
    if (!cart) return 0;
    const item = cart.itens.find((item) => item.produto.id === productId);
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

  /**
   * Grid de produtos com cards informativos
   */
  return (
    <Container className="my-4">
      {categoryName ? (
        <>
          <h2> {categoryName}</h2>
          <p className="text-muted">
            Produtos da categoria {categoryName}
          </p>
        </>
      ) : (
        <h2>Catálogo de Produtos</h2>
      )}
      <Row>
        {products.map((product) => {
          const count = getItemCount(product.id);
          return (
            <Col md={4} lg={3} key={product.id} className="mb-4">
              {/* Card do produto com imagem e informações */}
              <Card className="h-100 shadow-sm">
                {/* Imagem placeholder do produto */}
                <Card.Img
                  variant="top"
                  src={`https://placehold.co/400x300?text=${product.nome.substring(
                    0,
                    15
                  )}`}
                  style={{ height: "200px", objectFit: "cover" }}
                  alt={`Imagem do produto ${product.nome}`}
                />
                <Card.Body className="d-flex flex-column">
                  {/* Nome e descrição */}
                  <Card.Title>{product.nome}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1">
                    {product.descricao
                      ? product.descricao.substring(0, 50) + "..."
                      : "Sem descrição."}
                  </Card.Text>

                  {/* Preço e estoque */}
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="fs-5 fw-bold text-success">
                      R$ {formatPrice(product.preco)}
                    </span>
                    <span
                      className={`badge bg-${
                        product.estoque > 0 ? "info" : "danger"
                      }`}
                      title={product.estoque > 0 
                        ? `${product.estoque} unidades disponíveis` 
                        : "Produto indisponível"
                      }
                    >
                      Estoque: {product.estoque}
                    </span>
                  </div>

                  {/* Indicador de quantidade no carrinho */}
                  {count > 0 && (
                    <Alert 
                      variant="success" 
                      className="mt-2 p-1 text-center"
                    >
                      No Carrinho: {count}
                    </Alert>
                  )}

                  {/* Botão de ação principal */}
                  <Button
                    variant="primary"
                    className="mt-3"
                    onClick={() => onSelectProduct(product.id)}
                    disabled={product.estoque === 0}
                    title={product.estoque === 0 
                      ? "Produto fora de estoque" 
                      : "Ver mais detalhes e opções de compra"
                    }
                  >
                    Ver Detalhes
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}

        {/* Mensagem quando não há produtos */}
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