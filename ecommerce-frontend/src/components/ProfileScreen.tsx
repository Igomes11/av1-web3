import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
  Form,
  ListGroup,
} from "react-bootstrap";
import type { CurrentView, User, Endereco } from "../types/types";

/**
 * URL base da API para operações com endereços
 * @todo Mover para arquivo de configuração em produção
 */
const API_ENDERECO_URL = "http://localhost:3000/endereco";

/**
 * Props do componente ProfileScreen
 * @interface ProfileScreenProps
 */
interface ProfileScreenProps {
  /** Dados do usuário logado */
  user: User;
  /** Função para navegação entre views */
  onChangeView: (view: CurrentView) => void;
}

/**
 * Componente de perfil do usuário
 * Fornece interface para gerenciamento de endereços do usuário:
 * - Listagem de endereços
 * - Adição de novos endereços
 * - Edição de endereços existentes
 * - Definição de endereço principal
 * - Exclusão de endereços
 */
const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  // Estados para gerenciamento de dados e UI
  const [addresses, setAddresses] = useState<Endereco[]>([]);        // Lista de endereços do usuário
  const [isLoading, setIsLoading] = useState(true);                 // Indicador de carregamento
  const [message, setMessage] = useState<{                          // Sistema de mensagens
    type: "success" | "danger";
    text: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);               // Controle do modo de edição
  const [currentAddress, setCurrentAddress] = useState<             // Endereço em edição/criação
    (Partial<Endereco> & { clienteId?: number }) | null            // Inclui clienteId para API
  >(null);

  /**
   * Busca a lista de endereços do usuário no backend
   */
  const fetchAddresses = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      // Requisição GET para lista de endereços do cliente
      const response = await axios.get<Endereco[]>(
        `${API_ENDERECO_URL}/cliente/${user.id}`
      );
      setAddresses(response.data);
    } catch (err) {
      console.error("Erro ao buscar endereços:", err);
      setMessage({
        type: "danger",
        text: "Erro ao carregar endereços. Verifique a conexão com o backend.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega endereços quando o componente monta ou o usuário muda
  useEffect(() => {
    void fetchAddresses();
  }, [user.id]);

  /**
   * Inicia edição de um endereço existente
   * @param address - Endereço a ser editado
   */
  const handleEdit = (address: Endereco) => {
    setCurrentAddress({
      ...address,
      principal: !!address.principal, // Garante boolean
      clienteId: user.id,            // Necessário para API
    });
    setIsEditing(true);
  };

  /**
   * Inicia criação de um novo endereço
   * Inicializa o formulário com valores vazios
   */
  const handleNewAddress = () => {
    setCurrentAddress({
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      principal: false,
      clienteId: user.id,
    });
    setIsEditing(true);
  };

  /**
   * Cancela edição/criação de endereço
   * Limpa estados e mensagens
   */
  const handleCancel = () => {
    setIsEditing(false);
    setCurrentAddress(null);
    setMessage(null);
  };

  /**
   * Remove um endereço existente
   * @param id - ID do endereço a ser removido
   */
  const handleDelete = async (id: number) => {
    // @todo Substituir por modal de confirmação
    if (!window.confirm("Tem certeza que deseja remover este endereço?")) {
      return;
    }

    try {
      await axios.delete(`${API_ENDERECO_URL}/${id}`);
      setMessage({ 
        type: "success", 
        text: "Endereço removido com sucesso!" 
      });
      void fetchAddresses();
    } catch (err) {
      console.error("Erro ao remover endereço:", err);
      setMessage({
        type: "danger",
        text: "Erro ao remover endereço. Verifique se ele está vinculado a algum pedido.",
      });
    }
  };

  /**
   * Define um endereço como principal
   * @param id - ID do endereço a ser definido como principal
   */
  const handleSetPrincipal = async (id: number) => {
    try {
      await axios.patch(`${API_ENDERECO_URL}/${id}`, { principal: true });
      setMessage({
        type: "success",
        text: "Endereço definido como principal!",
      });
      void fetchAddresses();
    } catch (err) {
      console.error("Erro ao definir endereço principal:", err);
      let errorMsg = "Erro ao definir endereço principal.";

      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMsg = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message;
      }

      setMessage({ type: "danger", text: errorMsg });
    }
  };

  /**
   * Salva um endereço (novo ou existente)
   * @param e - Evento do formulário
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validação de campos obrigatórios
    const { logradouro, numero, bairro, cidade, estado, cep } =
      currentAddress || {};
    if (!logradouro || !numero || !bairro || !cidade || !estado || !cep) {
      setMessage({
        type: "danger",
        text: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    try {
      // Garante que o estado está em maiúsculo no payload, se existir
      const finalState = currentAddress.estado
        ? currentAddress.estado.toUpperCase()
        : "";

      if (currentAddress?.id) {
        // PATCH: Atualiza /endereco/:id
        const payload = {
          ...currentAddress,
          clienteId: user.id,
          estado: finalState,
        };
        await axios.patch(`${API_ENDERECO_URL}/${currentAddress.id}`, payload);
        setMessage({
          type: "success",
          text: "Endereço atualizado com sucesso!",
        });
      } else {
        // POST: Cria /endereco (usando clienteId)
        const payload = {
          ...currentAddress,
          estado: finalState,
        };
        await axios.post(API_ENDERECO_URL, payload);
        setMessage({ type: "success", text: "Endereço criado com sucesso!" });
      }

      handleCancel();
      fetchAddresses(); // Recarrega a lista
    } catch (err) {
      console.error("Erro ao salvar endereço:", err);
      let errorMsg = "Erro ao salvar endereço.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMsg = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message;
      }
      setMessage({ type: "danger", text: errorMsg });
    }
  };

  /**
   * Manipula mudanças nos campos do formulário
   * Inclui lógica de validação e normalização de dados
   * @param e - Evento de mudança do input
   */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const { name, type } = target;
    let { value } = target;

    // Validação e normalização por tipo de campo
    switch (name) {
      case "numero":
        // Permite apenas dígitos numéricos
        value = value.replace(/[^0-9]/g, "");
        break;
      case "estado":
        // Garante formato UF: 2 letras maiúsculas
        value = value
          .replace(/[^a-zA-Z]/g, "")
          .toUpperCase()
          .slice(0, 2);
        break;
    }

    // Atualiza o estado do endereço atual
    setCurrentAddress((prev) => ({
      ...prev!,
      [name]: type === "checkbox" 
        ? (target as HTMLInputElement).checked 
        : value,
    }));
  };

  // Interface do formulário de edição/criação
  if (isEditing && currentAddress) {
    return (
      <Container className="my-5">
        <h2>
          {currentAddress.id ? "Editar Endereço" : "Adicionar Novo Endereço"}
        </h2>
        {message && <Alert variant={message.type}>{message.text}</Alert>}
        <Card className="shadow-sm">
          <Card.Body>
            <Form onSubmit={handleSave}>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Logradouro</Form.Label>
                    <Form.Control
                      type="text"
                      name="logradouro"
                      value={currentAddress.logradouro || ""}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Número</Form.Label>
                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="numero"
                      value={currentAddress.numero || ""}
                      onChange={handleChange}
                      required
                      maxLength={10}
                      placeholder="Digite apenas números"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Bairro</Form.Label>
                    <Form.Control
                      type="text"
                      name="bairro"
                      value={currentAddress.bairro || ""}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cidade</Form.Label>
                    <Form.Control
                      type="text"
                      name="cidade"
                      value={currentAddress.cidade || ""}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado (UF)</Form.Label>
                    <Form.Control
                      type="text"
                      name="estado"
                      value={currentAddress.estado || ""}
                      onChange={handleChange} // Usa o handleChange corrigido
                      required
                      maxLength={2}
                      className="text-uppercase"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>CEP (ex: 12345-678)</Form.Label>
                    <Form.Control
                      type="text"
                      name="cep"
                      value={currentAddress.cep || ""}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Complemento (Opcional)</Form.Label>
                    <Form.Control
                      type="text"
                      name="complemento"
                      value={currentAddress.complemento || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  label="Marcar como endereço principal"
                  name="principal"
                  checked={currentAddress.principal || false}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button variant="success" type="submit" className="me-2">
                Salvar
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // --- Tela de Listagem (default) ---
  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando perfil...</p>
      </Container>
    );
  }

  /**
   * Renderização principal do componente
   * Exibe lista de endereços e opções de gerenciamento
   */
  return (
    <Container className="my-5">
      {/* Cabeçalho com saudação ao usuário */}
      <h2 className="mb-4">Olá, {user.email}</h2>

      {/* Card de ações principais */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="mb-3">Gerenciamento de Endereços</Card.Title>
          <Button 
            variant="primary" 
            onClick={handleNewAddress}
            title="Clique para adicionar um novo endereço"
          >
            + Adicionar Novo Endereço
          </Button>
        </Card.Body>
      </Card>

      {/* Sistema de mensagens para feedback */}
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <Card className="shadow-sm">
        <Card.Header>Endereços Cadastrados</Card.Header>
        <ListGroup variant="flush">
          {addresses.map((addr) => (
            <ListGroup.Item
              key={addr.id}
              className="d-flex justify-content-between align-items-center flex-wrap"
            >
              <div>
                <p className="mb-1 fw-bold">
                  {addr.logradouro}, {addr.numero}
                  {addr.principal && (
                    <span className="badge bg-success ms-2">PRINCIPAL</span>
                  )}
                </p>
                <small className="text-muted">
                  {addr.bairro}, {addr.cidade} - {addr.estado} | CEP: {addr.cep}
                </small>
              </div>
              <div className="d-flex flex-wrap justify-content-end">
                {!addr.principal && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-2 mb-1 mt-1"
                    onClick={() => handleSetPrincipal(addr.id)}
                  >
                    Principal
                  </Button>
                )}
                <Button
                  variant="outline-info"
                  size="sm"
                  className="me-2 mb-1 mt-1"
                  onClick={() => handleEdit(addr)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="mb-1 mt-1"
                  onClick={() => handleDelete(addr.id)}
                >
                  Excluir
                </Button>
              </div>
            </ListGroup.Item>
          ))}
          {addresses.length === 0 && (
            <ListGroup.Item className="text-center text-muted">
              Nenhum endereço cadastrado. Use o botão acima para adicionar um.
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card>
    </Container>
  );
};

export default ProfileScreen;
