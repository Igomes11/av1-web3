/**
 * AuthScreen.tsx
 * Componente responsável pela autenticação e registro de usuários
 * Fornece interface para login e cadastro de novos clientes
 */

import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import type { User } from "./types";

const API_URL = "http://localhost:3000/cliente";

/**
 * Interface para dados de cadastro de novo cliente
 */
interface CreateClienteDto {
  nome: string;      // Nome completo do cliente
  email: string;     // Email para login
  senha: string;     // Senha de acesso
  telefone: string;  // Telefone de contato (opcional)
}

/**
 * Interface para dados de login
 */
interface LoginDto {
  email: string;     // Email cadastrado
  senha: string;     // Senha de acesso
}

/**
 * Props do componente AuthScreen
 */
interface AuthScreenProps {
  onLogin: (user: User) => void;  // Callback chamado após login bem-sucedido
}

/**
 * Componente principal de autenticação
 * Gerencia as telas de login e cadastro
 */
const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  // Estados do componente
  const [isLoginView, setIsLoginView] = useState(true);          // Controla qual view está ativa
  const [cadastroData, setCadastroData] = useState<CreateClienteDto>({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
  });
  const [loginData, setLoginData] = useState<LoginDto>({
    email: "",
    senha: "",
  });
  const [message, setMessage] = useState<{                        // Mensagens de feedback
    type: "success" | "danger";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);             // Estado de carregamento

  /**
   * Manipuladores de eventos do formulário
   */

  /**
   * Atualiza o estado do formulário de cadastro
   * @param e - Evento de mudança do input
   */
  const handleCadastroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCadastroData({
      ...cadastroData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Atualiza o estado do formulário de login
   * @param e - Evento de mudança do input
   */
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Processa o envio do formulário de cadastro
   * @param e - Evento de submit do formulário
   */
  const handleCadastroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      // Envia dados para criação do novo cliente
      const response = await axios.post<User>(API_URL, cadastroData);

      // Feedback de sucesso
      setMessage({
        type: "success",
        text: `Cadastro realizado com sucesso! Cliente ID ${response.data.id}. Navegando para o catálogo...`,
      });

      // Realiza login automático após cadastro
      onLogin({ id: response.data.id, email: response.data.email });

      // Limpa formulário
      setCadastroData({ nome: "", email: "", senha: "", telefone: "" });
    } catch (error) {
      // Tratamento de erros
      let errorMsg = "Erro ao cadastrar. Tente novamente.";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMsg = Array.isArray(error.response.data.message)
          ? error.response.data.message[0]
          : error.response.data.message;
      }
      setMessage({ type: "danger", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Processa o envio do formulário de login
   * Realiza autenticação através da API e obtém dados do usuário
   * @param e - Evento de submit do formulário
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      // Tentativa de autenticação
      const response = await axios.post<{ id: number; email: string }>(
        `${API_URL}/login`,
        loginData
      );

      // Prepara dados do usuário após autenticação bem-sucedida
      const user: User = { id: response.data.id, email: response.data.email };

      // Feedback de sucesso
      setMessage({
        type: "success",
        text: `Login bem-sucedido! Cliente ID ${user.id}. Navegando para o Catálogo...`,
      });

      // Pequeno delay para mostrar a mensagem de sucesso
      setTimeout(() => onLogin(user), 500);
    } catch (error) {
      // Tratamento de erros de autenticação
      let errorMsg = "Credenciais inválidas. Verifique e-mail e senha.";

      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMsg = Array.isArray(error.response.data.message)
          ? error.response.data.message[0]
          : error.response.data.message;
      }

      setMessage({ type: "danger", text: errorMsg });
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  // -------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // -------------------------------------------------------------------------

  return (
    <Container className="my-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card>
            <Card.Header className="text-center bg-primary text-white">
              <h4>
                E-commerce AV1 -{" "}
                {isLoginView ? "Login de Cliente" : "Cadastro de Cliente"}
              </h4>
            </Card.Header>
            <Card.Body>
              {message && (
                <Alert
                  variant={message.type}
                  onClose={() => setMessage(null)}
                  dismissible
                >
                  {message.text}
                </Alert>
              )}

              {isLoginView ? (
                // ----------------- TELA DE LOGIN -----------------
                <Form onSubmit={handleLoginSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                      type="password"
                      name="senha"
                      value={loginData.senha}
                      onChange={handleLoginChange}
                      required
                    />
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button
                      variant="success"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verificando..." : "Entrar"}
                    </Button>
                  </div>
                </Form>
              ) : (
                // ----------------- TELA DE CADASTRO -----------------
                <Form onSubmit={handleCadastroSubmit}>
                  <h5 className="mb-4 text-center text-muted">
                  </h5>

                  <Form.Group className="mb-3">
                    <Form.Label>Nome Completo</Form.Label>
                    <Form.Control
                      type="text"
                      name="nome"
                      value={cadastroData.nome}
                      onChange={handleCadastroChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={cadastroData.email}
                      onChange={handleCadastroChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                      type="password"
                      name="senha"
                      value={cadastroData.senha}
                      onChange={handleCadastroChange}
                      minLength={6}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Telefone (Opcional)</Form.Label>
                    <Form.Control
                      type="text"
                      name="telefone"
                      value={cadastroData.telefone}
                      onChange={handleCadastroChange}
                    />
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Cadastrando..." : "Cadastrar Cliente"}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
            <Card.Footer className="text-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setMessage(null);
                  setIsLoading(false);
                }}
              >
                {isLoginView
                  ? "Não tem conta? Cadastre-se"
                  : "Já tem conta? Fazer Login"}
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthScreen;
