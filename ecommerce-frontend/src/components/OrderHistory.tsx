import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Button,
  Spinner,
  Modal,
  Form,
  Toast,
  Table,
} from "react-bootstrap";
import type { CurrentView, User, Produto } from "../types/types";
import { useState, useEffect } from "react";
import axios from "axios";
import { formatPrice } from "../utils/format";
import styles from "./OrderHistory.module.css";

// Endpoints do Backend - Foco da Integração
const API_PEDIDO_URL = "http://localhost:3000/pedido";
const API_PAGAMENTO_URL = "http://localhost:3000/pagamento";

// Interfaces adaptadas para tipagem rigorosa do TypeScript
interface ItemPedido {
  id: number;
  quantidade: number;
  precoVenda: number;
  subtotal: number;
  produto: Produto; // Inclui os detalhes do produto
}

interface Pedido {
  id: number;
  subtotal: number;
  total: number;
  quantidadeTotal: number;
  dataCriacao: string;
  status: string; // Reflete o PedidoStatus do Backend (ABERTO, AGUARDANDO_PAGAMENTO, PAGO, CANCELADO)
  itens: ItemPedido[];
  endereco: {
    id: number;
    logradouro: string;
    numero: string;
    cidade: string;
    estado: string;
  };
}

interface OrderHistoryProps {
  user: User;
  onChangeView: (view: CurrentView) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ user, onChangeView }) => {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook para buscar os pedidos sempre que o ID do usuário mudar
  useEffect(() => {
    fetchOrders();
  }, [user.id]);

  // Função central para buscar dados dos pedidos do cliente no Backend
  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Chama GET /pedido/cliente/:clienteId
      const response = await axios.get<Pedido[]>(
        `${API_PEDIDO_URL}/cliente/${user.id}`
      );
      setOrders(response.data);
    } catch (err) {
      // Captura erros de rede ou servidor
      setError("Erro ao carregar o histórico de pedidos. Verifique o Backend.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Lógica do Modal de Pagamento ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalOrderId, setModalOrderId] = useState<number | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("PIX");

  const openPaymentModal = (orderId: number) => {
    setModalOrderId(orderId);
    setSelectedMethod("PIX");
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => setShowPaymentModal(false);

  // Mapeia os nomes amigáveis do Frontend para os valores do DTO do Backend
  const mapFrontendMethodToBackend = (m: string) => {
    switch (m) {
      case "Dinheiro":
        return "Boleto"; // Mapeamento simplificado
      case "Débito":
      case "Crédito":
        return "Cartão";
      case "PIX":
        return "PIX";
      default:
        return m;
    }
  };

  // Função crítica: Simula o processamento do pagamento
  const processPaymentRequest = async (
    pedidoId: number,
    metodo: string,
    novoStatus: "PAGO" | "CANCELADO",
    valor?: number
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Recupera o valor do pedido
      let finalValor = valor;
      if (finalValor === undefined) {
        const order = orders.find((o) => o.id === pedidoId);
        finalValor = order ? Number(order.total) : 0;
      }

      finalValor = Number(finalValor ?? 0);

      // CORREÇÃO LÓGICA APLICADA:
      // Removemos a validação "finalValor <= 0" aqui, pois o Backend (CreatePagamentoDto)
      // garante que o valor é positivo e trata essa RN de forma unificada.

      // 2. Chama POST /pagamento/processar no Backend
      // Esta chamada contém a lógica crítica de transação (débito de estoque e mudança de status)
      await axios.post(`${API_PAGAMENTO_URL}/processar`, {
        pedidoId,
        metodo,
        valor: finalValor,
        novoStatus,
      });

      // 3. Sucesso: Recarrega o histórico e mostra feedback
      await fetchOrders();
      closePaymentModal();
      setToastMessage(`Pagamento do pedido #${pedidoId} processado com sucesso.`);
      setToastVariant("success");
      setShowToast(true);
    } catch (err) {
      // 4. Tratamento de Erro do Backend
      let errorMsg = "Erro ao processar pagamento. Verifique o estoque.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        // Exibe a mensagem de erro detalhada enviada pelo Backend (ex: Estoque insuficiente)
        errorMsg = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message;
      }
      setError(errorMsg);
      setToastMessage(errorMsg);
      setToastVariant("danger");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Lógica de Feedback (Toasts e Status) ---
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "danger">("success");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Mapeia o status do pedido para cores visuais
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PAGO":
        return "success"; // Pedido concluído com sucesso
      case "AGUARDANDO_PAGAMENTO":
        return "warning"; // Ação do usuário necessária
      case "ABERTO":
        return "info"; // Status inicial (novo pedido)
      case "CANCELADO":
        return "danger"; // Estado final de falha
      default:
        return "secondary";
    }
  };

  // --- Renderização de Telas de Estado ---
  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando histórico...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={fetchOrders}>Tentar Recarregar</Button>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="info">Você não tem pedidos realizados.</Alert>
        <Button onClick={() => onChangeView("catalog")}>
          Ir para o Catálogo
        </Button>
      </Container>
    );
  }

  // --- Layout Principal do Histórico ---
  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center my-3">
        <h2>📋 Histórico de Pedidos</h2>
        <div>
          <Button variant="outline-secondary" className="me-2" onClick={() => setShowClearConfirm(true)}>
            Limpar tela
          </Button>
          <Button variant="primary" onClick={fetchOrders}>Recarregar</Button>
        </div>
      </div>
      {orders.map((order) => (
        <Card key={order.id} className="mb-4 shadow-sm">
          <Card.Header
            className={`bg-${getStatusVariant(
              order.status
            )} text-white d-flex justify-content-between align-items-center`}
          >
            <h4 className="mb-0">Pedido #{order.id}</h4>
            <span className={`badge bg-dark`}>{order.status}</span>
          </Card.Header>
          <Card.Body>
            <Row>
              {/* Detalhes do Pedido */}
              <Col md={6}>
                <h5>Detalhes</h5>
                <p>
                  <strong>Data:</strong>{" "}
                  {new Date(order.dataCriacao).toLocaleDateString()}
                </p>
                <p>
                  <strong>Itens Totais:</strong> {order.quantidadeTotal}
                </p>
                <p className="fw-bold">
                  <strong>Total:</strong> R$ {formatPrice(order.total)}
                </p>
              </Col>
              {/* Detalhes do Endereço */}
              <Col md={6}>
                <h5>Entrega</h5>
                <p className="mb-1">
                  {order.endereco.logradouro}, {order.endereco.numero}
                </p>
                <p>
                  {order.endereco.cidade} - {order.endereco.estado}
                </p>
              </Col>
            </Row>
            <hr />

            {/* Tabela de Itens do Pedido */}
            <h5 className="mb-3">Produtos Comprados</h5>
            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtde</th>
                  <th>Preço unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.itens.map((item) => (
                  <tr key={item.id}>
                    <td>{item.produto.nome}</td>
                    <td>{item.quantidade}</td>
                    <td>R$ {formatPrice(item.precoVenda)}</td>
                    <td>R$ {formatPrice(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Ações de Pagamento / Cancelamento (Visível apenas se o status for AGUARDANDO_PAGAMENTO) */}
            {order.status === "AGUARDANDO_PAGAMENTO" && (
              <div className="mt-4">
                <Alert variant="warning">Ação Necessária: Simular Pagamento</Alert>
                <Button
                  variant="primary"
                  className="me-2"
                  onClick={() => openPaymentModal(order.id)}
                >
                  Pagar
                </Button>
                <Button
                  variant="danger"
                  // Chama a requisição de pagamento com novoStatus = "CANCELADO"
                  onClick={() =>
                    processPaymentRequest(
                      order.id,
                      mapFrontendMethodToBackend(selectedMethod), // Usamos o método selecionado, mas o status é CANCELADO
                      "CANCELADO"
                    )
                  }
                >
                  Cancelar Pedido
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      ))}

      {/* --- MODAL PARA SIMULAÇÃO DE PAGAMENTO --- */}
      <Modal show={showPaymentModal} onHide={closePaymentModal}>
        <Modal.Header closeButton>
          <Modal.Title>Pagar Pedido #{modalOrderId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalOrderId ? (
            (() => {
              const order = orders.find((o) => o.id === modalOrderId);
              if (!order) return <p>Pedido não encontrado.</p>;
              return (
                <div>
                  <p>
                    <strong>Total:</strong> R$ {formatPrice(order.total)}
                  </p>
                  <Form.Group className="mb-3">
                    <Form.Label>Método de Pagamento</Form.Label>
                    <Form.Select
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                    >
                      <option>Dinheiro</option>
                      <option>Débito</option>
                      <option>Crédito</option>
                      <option>PIX</option>
                    </Form.Select>
                  </Form.Group>
                  <h6>Itens</h6>
                  <Table bordered size="sm">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Qtde</th>
                        <th>Preço unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.itens.map((it) => (
                        <tr key={it.id}>
                          <td>{it.produto.nome}</td>
                          <td>{it.quantidade}</td>
                          <td>R$ {formatPrice(it.precoVenda)}</td>
                          <td>R$ {formatPrice(it.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              );
            })()
          ) : (
            <p>Selecione um pedido.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closePaymentModal}>
            Fechar
          </Button>
          <Button
            variant="success"
            onClick={() => {
              if (!modalOrderId) return;
              const backendMethod = mapFrontendMethodToBackend(selectedMethod);
              // Dispara a requisição para o Backend com status PAGO
              processPaymentRequest(modalOrderId, backendMethod, "PAGO");
            }}
          >
            Pagar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmação para limpar a tela de pedidos (apenas visualização) */}
      <Modal show={showClearConfirm} onHide={() => setShowClearConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar limpeza</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja limpar a tela de pedidos? Esta ação só afeta a visualização atual e não excluirá pedidos no servidor.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setOrders([]);
              setShowClearConfirm(false);
              setToastMessage('Tela de pedidos limpa.');
              setToastVariant('success');
              setShowToast(true);
            }}
          >
            Confirmar limpeza
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Toast container fixo (feedback de sucesso/erro) */}
      <div aria-live="polite" className={styles.toastFixed}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          bg={toastVariant}
          delay={3500}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastVariant === "success" ? "Sucesso" : "Erro"}
            </strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === "danger" ? styles.toastBodyDanger : ""}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </div>
    </Container>
  );
};

export default OrderHistory;