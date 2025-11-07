import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Button,
  Alert,
  Spinner,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { formatPrice } from "../utils/format";
import type { CurrentView, User, Endereco, Produto } from "../types/types";

const API_PEDIDO_URL = "http://localhost:3000/pedido";
const API_ENDERECO_URL = "http://localhost:3000/endereco";
const API_PRODUTO_URL = "http://localhost:3000/produto";

interface CartItem {
  productId: number;
  quantidade: number;
}

interface ItemPedidoDto {
  produtoId: number;
  quantidade: number;
}

interface CreatePedidoDto {
  clienteId: number;
  enderecoId: number;
  itens: ItemPedidoDto[];
}

interface CheckoutScreenProps {
  user: User;
  cartItems: CartItem[];
  onClearCart: () => void;
  onChangeView: (view: CurrentView) => void;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  user,
  cartItems,
  onClearCart,
  onChangeView,
}) => {
  const [addresses, setAddresses] = useState<Endereco[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<
    number | undefined
  >(undefined);
  const [productsDetails, setProductsDetails] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (cartItems.length === 0) return;

      try {
        // 1. Busca Endereços do Cliente
        const addressResponse = await axios.get<Endereco[]>(
          `${API_ENDERECO_URL}/cliente/${user.id}`
        );
        setAddresses(addressResponse.data);

        const principalAddress = addressResponse.data.find((a) => a.principal);
        if (principalAddress) {
          setSelectedAddressId(principalAddress.id);
        } else if (addressResponse.data.length > 0) {
          setSelectedAddressId(addressResponse.data[0].id);
        }

        // 2. Busca detalhes dos produtos no carrinho
        const productIds = cartItems.map((item) => item.productId);
        const productsPromises = productIds.map((id) =>
          axios.get<Produto>(`${API_PRODUTO_URL}/${id}`)
        );
        const results = await Promise.all(productsPromises);
        setProductsDetails(results.map((res) => res.data));
      } catch (err) {
        setError(
          "Erro ao carregar dados de checkout. Verifique se há endereços e produtos ativos no backend."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.id, JSON.stringify(cartItems)]);

  const calculateTotal = () => {
    return cartItems.reduce((total, cartItem) => {
      const product = productsDetails.find((p) => p.id === cartItem.productId);
      return total + (product ? product.preco * cartItem.quantidade : 0);
    }, 0);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError("Por favor, selecione um endereço de entrega.");
      return;
    }

    setIsPlacingOrder(true);
    setError(null);

    const itensPedidoDto: ItemPedidoDto[] = cartItems.map((item) => ({
      produtoId: item.productId,
      quantidade: item.quantidade,
    }));

    const orderData: CreatePedidoDto = {
      clienteId: user.id,
      enderecoId: selectedAddressId,
      itens: itensPedidoDto,
    };

    try {
      // Cria o pedido no backend
      const response = await axios.post(API_PEDIDO_URL, orderData);

      // Sucesso: Limpa o carrinho e navega para o histórico
      onClearCart();
      alert(
        `Pedido #${response.data.id} criado com sucesso! Status: AGUARDANDO_PAGAMENTO.`
      );

      // Redireciona para o histórico de pedidos
      onChangeView("history");
    } catch (err) {
      let errorMsg =
        "Erro ao finalizar o pedido. Verifique o estoque e tente novamente.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMsg = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando checkout...</p>
      </Container>
    );
  }

  const cartTotal = calculateTotal();

  if (cartItems.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Seu carrinho está vazio. Volte ao catálogo para adicionar produtos.
        </Alert>
        <Button onClick={() => onChangeView("catalog")}>
          Voltar ao Catálogo
        </Button>
      </Container>
    );
  }

  if (addresses.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Você precisa ter pelo menos um endereço cadastrado para finalizar o
          pedido.
        </Alert>
        <Button onClick={() => onChangeView("catalog")}>
          Voltar ao Catálogo
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2>💰 Finalizar Pedido</h2>
      <Row>
        <Col md={7}>
          <Card className="mb-4">
            <Card.Header>Endereço de Entrega</Card.Header>
            <Card.Body>
              <Form.Group controlId="selectAddress">
                <Form.Label id="selectAddressLabel">Selecione o Endereço:</Form.Label>
                <Form.Select
                  aria-labelledby="selectAddressLabel"
                  value={selectedAddressId || ""}
                  onChange={(e) =>
                    setSelectedAddressId(parseInt(e.target.value))
                  }
                >
                  <option value="" disabled>
                    Selecione um endereço
                  </option>
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.logradouro}, {addr.numero} - {addr.cidade} (
                      {addr.principal ? "Principal" : "Outro"})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Itens do Pedido</Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                {cartItems.map((item) => {
                  const product = productsDetails.find(
                    (p) => p.id === item.productId
                  );
                  if (!product) return null;
                  return (
                    <li
                      key={item.productId}
                      className="d-flex justify-content-between"
                    >
                      <span>
                        {product.nome} x {item.quantidade}
                      </span>
                      <span className="fw-bold">
                        R$ {formatPrice(Number(product.preco) * item.quantidade)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card>
            <Card.Body>
              <Card.Title>Resumo Final</Card.Title>
              <hr />
              {error && <Alert variant="danger">{error}</Alert>}

              <div className="d-flex justify-content-between fw-bold fs-4 mb-4">
                <span>Total a Pagar:</span>
                <span className="text-success">R$ {formatPrice(cartTotal)}</span>
              </div>

              <p className="text-muted">
                * O pedido será criado no status 'Aguardando Pagamento'.
              </p>

              <Button
                variant="success"
                className="w-100 mt-3"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !selectedAddressId}
              >
                {isPlacingOrder ? "Finalizando..." : "Confirmar Pedido"}
              </Button>
              <Button
                variant="outline-secondary"
                className="w-100 mt-2"
                onClick={() => onChangeView("cart")}
                disabled={isPlacingOrder}
              >
                Voltar ao Carrinho
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutScreen;
