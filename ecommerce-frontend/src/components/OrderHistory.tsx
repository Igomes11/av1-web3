/**
 * OrderHistory.tsx
 * 
 * Componente responsável por exibir e gerenciar o histórico de pedidos do usuário.
 * Este componente é uma parte central do e-commerce, fornecendo uma interface
 * completa para o usuário gerenciar seus pedidos.
 * 
 * Funcionalidades principais:
 * - Listagem e visualização detalhada de pedidos (itens, valores, endereço)
 * - Processamento de múltiplos métodos de pagamento (PIX, Cartão, etc.)
 * - Cancelamento de pedidos pendentes
 * - Sistema de feedback visual (status, toasts, modais)
 * - Atualização em tempo real do status dos pedidos
 * 
 * Fluxo de Pagamento:
 * 1. Usuário seleciona um pedido pendente
 * 2. Escolhe o método de pagamento no modal
 * 3. Sistema processa o pagamento via API
 * 4. Atualização do status e feedback visual
 * 
 * @component
 * @example
 * ```tsx
 * <OrderHistory 
 *   user={{ id: 1, email: "user@example.com" }}
 *   onChangeView={(view) => handleViewChange(view)} 
 * />
 * ```
 */

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
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { formatPrice } from "../utils/format";
import styles from "./OrderHistory.module.css";

/**
 * Endpoints da API para integração com o backend
 * Configurados para ambiente de desenvolvimento local
 * @todo Mover para arquivo de configuração em produção
 */
const API_PEDIDO_URL = "http://localhost:3000/pedido";     // Gerenciamento de pedidos
const API_PAGAMENTO_URL = "http://localhost:3000/pagamento"; // Processamento de pagamentos

/**
 * Interface que representa um item do pedido
 * Contém informações sobre quantidade, preços e o produto associado
 */
interface ItemPedido {
  id: number;               // ID único do item
  quantidade: number;       // Quantidade do produto
  precoVenda: number;      // Preço unitário no momento da venda
  subtotal: number;        // Valor total do item (quantidade * precoVenda)
  produto: Produto;        // Detalhes completos do produto
}

/**
 * Interface que representa um pedido completo
 * Contém todas as informações necessárias para exibição no histórico
 */
interface Pedido {
  id: number;              // ID único do pedido
  subtotal: number;        // Valor dos produtos sem descontos/taxas
  total: number;           // Valor final do pedido
  quantidadeTotal: number; // Soma das quantidades de todos os itens
  dataCriacao: string;     // Data de criação do pedido
  status: string;          // Status atual: ABERTO, AGUARDANDO_PAGAMENTO, PAGO, CANCELADO
  itens: ItemPedido[];     // Lista de itens do pedido
  endereco: {              // Endereço de entrega
    id: number;
    logradouro: string;
    numero: string;
    cidade: string;
    estado: string;
  };
}

/**
 * Props para o componente OrderHistory
 */
interface OrderHistoryProps {
  user: User;                              // Dados do usuário logado
  onChangeView: (view: CurrentView) => void; // Função para navegação entre views
}

/**
 * Componente para exibição do histórico de pedidos do usuário
 * Permite visualizar, pagar e cancelar pedidos
 */
const OrderHistory: React.FC<OrderHistoryProps> = ({ user, onChangeView }) => {
  /**
   * Estados para gerenciamento de dados e interface do usuário
   */
  const [orders, setOrders] = useState<Pedido[]>([]);         // Lista de pedidos do usuário
  const [isLoading, setIsLoading] = useState(true);           // Indicador de carregamento de dados
  const [error, setError] = useState<string | null>(null);    // Mensagens de erro globais

  /**
   * Função para buscar os pedidos do usuário no backend
   */
  /**
   * Busca os pedidos do usuário no backend
   * Memorizado com useCallback para evitar recriações desnecessárias
   */
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<Pedido[]>(
        `${API_PEDIDO_URL}/cliente/${user.id}`
      );
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setError("Erro ao carregar o histórico de pedidos. Verifique o Backend.");
    } finally {
      setIsLoading(false);
    }
  }, [user.id]); // Dependência: ID do usuário

  // Busca os pedidos quando o componente monta ou quando o ID do usuário muda
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Estados para controle do modal de pagamento
  const [showPaymentModal, setShowPaymentModal] = useState(false);    // Controla visibilidade do modal
  const [modalOrderId, setModalOrderId] = useState<number | null>(null); // ID do pedido selecionado
  const [selectedMethod, setSelectedMethod] = useState<string>("PIX"); // Método de pagamento selecionado

  /**
   * Abre o modal de pagamento para um pedido específico
   * @param orderId - ID do pedido a ser pago
   */
  const openPaymentModal = (orderId: number) => {
    setModalOrderId(orderId);
    setSelectedMethod("PIX"); // Inicia com PIX como método padrão
    setShowPaymentModal(true);
  };

  /**
   * Fecha o modal de pagamento e limpa o estado
   */
  const closePaymentModal = () => setShowPaymentModal(false);

  // Mapeia os nomes amigáveis do Frontend para os valores do DTO do Backend
  /**
   * Converte os métodos de pagamento do frontend para os valores aceitos pelo backend
   * @param m - Método de pagamento selecionado no frontend
   * @returns Método de pagamento correspondente no backend
   */
  const mapFrontendMethodToBackend = (m: string) => {
    switch (m) {
      case "Dinheiro":
        return "Boleto";   // No backend, "Dinheiro" é tratado como "Boleto"
      case "Débito":
      case "Crédito":
        return "Cartão";   // Ambos são tratados como "Cartão" no backend
      case "PIX":
        return "PIX";      // PIX mantém o mesmo nome
      default:
        return m;
    }
  };

  // Função crítica: Simula o processamento do pagamento
  /**
 * Processa o pagamento ou cancelamento de um pedido
 * @param pedidoId - ID do pedido a ser processado
 * @param metodo - Método de pagamento (PIX, Cartão, etc)
 * @param novoStatus - Novo status do pedido (PAGO ou CANCELADO)
 * @param valor - Valor opcional do pagamento
 */
const processPaymentRequest = async (
    pedidoId: number,
    metodo: string,
    novoStatus: "PAGO" | "CANCELADO",
    valor?: number
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // Determina o valor final do pagamento
      let finalValor = valor;
      if (finalValor === undefined) {
        const order = orders.find((o) => o.id === pedidoId);
        finalValor = order ? Number(order.total) : 0;
      }
      finalValor = Number(finalValor ?? 0);

      // Envia requisição de processamento de pagamento
      await axios.post(`${API_PAGAMENTO_URL}/processar`, {
        pedidoId,
        metodo,
        valor: finalValor,
        novoStatus,
      });

      // Atualiza a interface após sucesso
      await fetchOrders();
      closePaymentModal();
      setToastMessage(`Pagamento do pedido #${pedidoId} processado com sucesso.`);
      setToastVariant("success");
      setShowToast(true);
    } catch (error) {
      // Tratamento de erros e exibição de feedback
      let errorMsg = "Erro ao processar pagamento. Verifique o estoque.";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMsg = Array.isArray(error.response.data.message)
          ? error.response.data.message[0]
          : error.response.data.message;
      }
      console.error('Erro no processamento do pagamento:', error);
      setError(errorMsg);
      setToastMessage(errorMsg);
      setToastVariant("danger");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Lógica de Feedback (Toasts e Status) ---
  // Estados para gerenciamento de feedback ao usuário
  const [showToast, setShowToast] = useState(false);                          // Controla visibilidade do toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);      // Mensagem do toast
  const [toastVariant, setToastVariant] = useState<"success" | "danger">("success"); // Tipo do toast
  const [showClearConfirm, setShowClearConfirm] = useState(false);           // Controla modal de confirmação

  /**
   * Define a cor do status do pedido baseado em seu estado atual
   * @param status - Status atual do pedido
   * @returns Variante de cor do Bootstrap
   */
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PAGO":
        return "success";    // Verde para pedidos concluídos
      case "AGUARDANDO_PAGAMENTO":
        return "warning";    // Amarelo para ação pendente
      case "ABERTO":
        return "info";       // Azul para pedidos novos
      case "CANCELADO":
        return "danger";     // Vermelho para pedidos cancelados
      default:
        return "secondary";  // Cinza para outros estados
    }
  };

  /**
   * Renderização condicional baseada no estado do componente
   */

  // Exibe indicador de carregamento enquanto os dados são buscados
  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando histórico...</p>
      </Container>
    );
  }

  // Exibe mensagem de erro com opção de recarregar
  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={fetchOrders}>Tentar Recarregar</Button>
      </Container>
    );
  }

  // Exibe mensagem quando não há pedidos
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

  /**
   * Layout principal do histórico de pedidos
   * Exibe a lista de pedidos com suas informações detalhadas,
   * status e opções de pagamento quando aplicável
   */
  return (
    <Container className="my-5">
      {/* Cabeçalho com título e botões de ação */}
      <div className="d-flex justify-content-between align-items-center my-3">
        <h2>📋 Histórico de Pedidos</h2>
        <div>
          <Button 
            variant="outline-secondary" 
            className="me-2" 
            onClick={() => setShowClearConfirm(true)}
            title="Limpa a visualização atual sem afetar os dados"
          >
            Limpar tela
          </Button>
          <Button 
            variant="primary" 
            onClick={fetchOrders}
            title="Atualiza a lista de pedidos"
          >
            Recarregar
          </Button>
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
                <tr>                 <th>Produto</th>
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

      {/* Modal de confirmação para limpar visualização */}
      <Modal 
        show={showClearConfirm} 
        onHide={() => setShowClearConfirm(false)}
        aria-labelledby="clear-confirm-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="clear-confirm-modal">Confirmar limpeza</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja limpar a tela de pedidos? 
          <br />
          <small className="text-muted">
            Esta ação apenas oculta os pedidos da tela atual. 
            Você pode recarregá-los usando o botão "Recarregar".
            Os dados permanecem salvos no servidor.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowClearConfirm(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setOrders([]); // Limpa apenas a visualização local
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
      {/* Sistema de notificações flutuantes */}
      <div 
        aria-live="polite" 
        className={styles.toastFixed}
        role="alert"
        aria-atomic="true"
      >
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          bg={toastVariant}
          delay={3500}
          autohide
          animation={true}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastVariant === "success" ? "✅ Sucesso" : "❌ Erro"}
            </strong>
          </Toast.Header>
          <Toast.Body 
            className={toastVariant === "danger" ? styles.toastBodyDanger : ""}
          >
            {toastMessage}
          </Toast.Body>
        </Toast>
      </div>
    </Container>
  );
};

export default OrderHistory;