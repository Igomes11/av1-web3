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
import type { CurrentView, User, Endereco } from "../types/types";
import type { Cart } from "../services/cartService";

const API_PEDIDO_URL = "http://localhost:3000/pedido";
const API_ENDERECO_URL = "http://localhost:3000/endereco";

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
  cart: Cart | null;
  onClearCart: () => Promise<void>;
  onChangeView: (view: CurrentView) => void;
  // Nova prop opcional para integrar com o fluxo de pagamento
  onOrderCreated?: (orderId: number, total: number) => void;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  user,
  cart,
  onClearCart,
  onChangeView,
  onOrderCreated,
}) => {
  const [addresses, setAddresses] = useState<Endereco[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Carrega endereços
  useEffect(() => {
    const fetchData = async () => {
      if (!cart || cart.itens.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
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
      } catch (error) {
        setError("Erro ao carregar dados de checkout.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.id, cart]);

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.itens.reduce((total, item) => {
      return total + (item.produto.preco * item.quantidade);
    }, 0);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !cart) {
      setError("Por favor, selecione um endereço de entrega.");
      return;
    }

    setIsPlacingOrder(true);
    setError(null);

    const itensPedidoDto: ItemPedidoDto[] = cart.itens.map((item) => ({
      produtoId: item.produto.id,
      quantidade: item.quantidade,
    }));

    const orderData: CreatePedidoDto = {
      clienteId: user.id,
      enderecoId: selectedAddressId,
      itens: itensPedidoDto,
    };

    const cartTotal = calculateTotal();

    try {
      // 1. Cria o pedido
      const response = await axios.post(API_PEDIDO_URL, orderData);

      // 2. Limpa o carrinho
      await onClearCart();

      // 3. Decisão de fluxo: Pagamento ou Histórico
      if (onOrderCreated) {
         // Fluxo novo: Vai para a tela de pagamento
         onOrderCreated(response.data.id, cartTotal);
      } else {
         // Fluxo antigo (fallback): Vai para o histórico
         alert(`Pedido #${response.data.id} criado com sucesso! Status: AGUARDANDO_PAGAMENTO.`);
         onChangeView("history");
      }
      
    } catch (err) {
      let errorMsg = "Erro ao finalizar o pedido. Verifique o estoque e tente novamente.";
      
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const responseMessage = err.response.data.message;
        errorMsg = Array.isArray(responseMessage) ? responseMessage[0] : responseMessage;
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

  if (!cart || cart.itens.length === 0) {
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
          Você precisa ter pelo menos um endereço cadastrado para finalizar o pedido.
        </Alert>
        <Button onClick={() => onChangeView("profile")}>
          Cadastrar Endereço
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2> Finalizar Pedido</h2>
      <Row>
        <Col md={7}>
          <Card className="mb-4">
            <Card.Header>Endereço de Entrega</Card.Header>
            <Card.Body>
              <Form.Group controlId="selectAddress">
                <Form.Label id="selectAddressLabel">
                  Selecione o Endereço:
                </Form.Label>
                <Form.Select
                  aria-labelledby="selectAddressLabel"
                  title='Selecione o endereço de entrega'
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
                {cart.itens.map((item) => (
                  <li
                    key={item.id}
                    className="d-flex justify-content-between mb-2"
                  >
                    <span>
                      {item.produto.nome} x {item.quantidade}
                    </span>
                    <span className="fw-bold">
                      R$ {formatPrice(item.produto.preco * item.quantidade)}
                    </span>
                  </li>
                ))}
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
                <span className="text-success">
                  R$ {formatPrice(cartTotal)}
                </span>
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