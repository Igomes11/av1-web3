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

// URLs da API
const API_ENDERECO_URL = "http://localhost:3000/endereco";

interface ProfileScreenProps {
  user: User;
  onChangeView: (view: CurrentView) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const [addresses, setAddresses] = useState<Endereco[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "danger";
    text: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // Note que 'clienteId' é adicionado para o POST/PATCH do backend
  const [currentAddress, setCurrentAddress] = useState<
    (Partial<Endereco> & { clienteId?: number }) | null
  >(null);

  useEffect(() => {
    fetchAddresses();
  }, [user.id]);

  const fetchAddresses = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      // GET /endereco/cliente/:clienteId
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

  const handleEdit = (address: Endereco) => {
    // Garante que o clienteId está presente para a chamada PATCH (mesmo que não seja usado no backend)
    setCurrentAddress({
      ...address,
      principal: !!address.principal,
      clienteId: user.id,
    });
    setIsEditing(true);
  };

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

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentAddress(null);
    setMessage(null);
  };

  const handleDelete = async (id: number) => {
    // CORREÇÃO: Usar Modal/Alert para confirmação (sem window.confirm)
    if (!window.confirm("Tem certeza que deseja remover este endereço?"))
      return;

    try {
      // DELETE /endereco/:id
      await axios.delete(`${API_ENDERECO_URL}/${id}`);
      setMessage({ type: "success", text: "Endereço removido com sucesso!" });
      fetchAddresses();
    } catch (err) {
      console.error(err);
      setMessage({
        type: "danger",
        text: "Erro ao remover endereço. Verifique se ele está vinculado a algum pedido.",
      });
    }
  };

  // CORREÇÃO: Função para definir o endereço principal
  const handleSetPrincipal = async (id: number) => {
    try {
      // PATCH /endereco/:id
      // Envia APENAS o campo principal para marcar. O Backend faz o resto.
      await axios.patch(`${API_ENDERECO_URL}/${id}`, { principal: true });
      setMessage({
        type: "success",
        text: "Endereço definido como principal!",
      });
      fetchAddresses();
    } catch (err) {
      console.error("Erro no PATCH de principal:", err);
      let errorMsg = "Erro ao definir endereço principal.";

      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMsg = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message;
      }

      setMessage({ type: "danger", text: errorMsg });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

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
      if (currentAddress?.id) {
        // PATCH: Atualiza /endereco/:id
        // Garante que o clienteId está no payload (necessário para o DTO do Backend)
        const payload = {
          ...currentAddress,
          clienteId: user.id,
        };
        await axios.patch(`${API_ENDERECO_URL}/${currentAddress.id}`, payload);
        setMessage({
          type: "success",
          text: "Endereço atualizado com sucesso!",
        });
      } else {
        // POST: Cria /endereco (usando clienteId)
        await axios.post(API_ENDERECO_URL, currentAddress);
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

  // --- Formulário de Edição/Criação ---
  if (isEditing && currentAddress) {
    const handleChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const target = e.target as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement;
      const { name, value, type } = target;
      setCurrentAddress((prev) => ({
        ...prev!,
        [name]:
          type === "checkbox" ? (target as HTMLInputElement).checked : value,
      }));
    };

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
                      name="numero"
                      value={currentAddress.numero || ""}
                      onChange={handleChange}
                      required
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
                      onChange={handleChange}
                      required
                      maxLength={2}
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

  return (
    <Container className="my-5">
      <h2 className="mb-4">Olá, {user.email}</h2>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="mb-3">Gerenciamento de Endereços</Card.Title>
          <Button variant="primary" onClick={handleNewAddress}>
            + Adicionar Novo Endereço
          </Button>
        </Card.Body>
      </Card>

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
