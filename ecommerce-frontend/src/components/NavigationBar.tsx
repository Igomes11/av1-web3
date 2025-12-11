import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom"; // Importa Link e hook de navegação
import type { User } from "../types/types";

// Interface simplificada: removemos onViewChange e onGoToCatalog
interface NavigationBarProps {
  user: User;
  onLogout: () => void;
  cartCount: number;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  user,
  onLogout,
  cartCount,
}) => {
  const navigate = useNavigate();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        {/* Navbar.Brand agora funciona como um Link para a home */}
        <Navbar.Brand as={Link} to="/">
          E-commerce AV1
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/categorias">
              Categorias
            </Nav.Link>
            <Nav.Link as={Link} to="/">
              Catálogo
            </Nav.Link>
            <Nav.Link as={Link} to="/meus-pedidos">
              Meus Pedidos
            </Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            <Nav.Link as={Link} to="/perfil" className="text-info me-3">
              Olá, <span className="fw-bold">{user.email}</span>
            </Nav.Link>
            
            <Button
              variant={cartCount > 0 ? "warning" : "outline-light"}
              className="mx-2 position-relative"
              onClick={() => navigate("/carrinho")}
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