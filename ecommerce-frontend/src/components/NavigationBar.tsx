import { Navbar, Container, Nav, Button } from "react-bootstrap";
import type { User, CurrentView } from "../types/types";

/**
 * Props do componente de barra de navegação
 * @interface NavigationBarProps
 */
interface NavigationBarProps {
  /** Dados do usuário logado */
  user: User;
  /** Função para alterar a view atual da aplicação */
  onViewChange: (view: CurrentView) => void;
  /** Função para voltar ao catálogo */
  onGoToCatalog: () => void;
  /** Função para realizar logout */
  onLogout: () => void;
  /** Quantidade de itens no carrinho */
  cartCount: number;
}
/**
 * Componente de barra de navegação do e-commerce
 * Fornece navegação entre as diferentes seções da aplicação
 * e exibe informações do usuário logado
 */
const NavigationBar: React.FC<NavigationBarProps> = ({
  user,
  onViewChange,
  onGoToCatalog,
  onLogout,
  cartCount,
}) => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand href="#" onClick={onGoToCatalog}>
          E-commerce AV1
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={() => onViewChange("categories")}>
              Categorias
            </Nav.Link>
            <Nav.Link onClick={onGoToCatalog}>
              Catálogo
            </Nav.Link>
            <Nav.Link onClick={() => onViewChange("history")}>
              Meus Pedidos
            </Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            {/* NOVO/MODIFICADO: Link para o Perfil/Endereços. Usa o e-mail como texto de boas-vindas */}
            <Nav.Link onClick={() => onViewChange("profile")} className="text-info me-3">
              Olá, <span className="fw-bold">{user.email}</span>
            </Nav.Link>
            <Button
              variant={cartCount > 0 ? "warning" : "outline-light"}
              className="mx-2 position-relative"
              onClick={() => onViewChange("cart")}
            >
              🛒 Carrinho ({cartCount})
            </Button>
            <Button variant="outline-danger" onClick={onLogout}>
              Sair
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;