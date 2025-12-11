/**
 * CartScreen.tsx
 * 
 * Componente que implementa a tela de carrinho de compras do e-commerce.
 * Responsável por:
 * - Exibir produtos adicionados ao carrinho
 * - Permitir ajuste de quantidades
 * - Mostrar preços e totais
 * - Validar estoque
 * - Navegação para checkout
 */

import { Container, Row, Col, Card, ListGroup, Button, Alert, Spinner } from 'react-bootstrap';
import type { CurrentView } from '../types/types';
import { formatPrice } from '../utils/format';
import type { Cart } from '../services/cartService';
// Importação do CSS (geralmente já é importado no App.tsx ou main.tsx, então a classe estará disponível)

interface CartScreenProps {
    cart: Cart | null;
    isLoading: boolean;
    onUpdateItem: (itemId: number, quantidade: number) => void;
    onRemoveItem: (itemId: number) => void;
    onChangeView: (view: CurrentView) => void;
}

const CartScreen: React.FC<CartScreenProps> = ({ cart, isLoading, onUpdateItem, onRemoveItem, onChangeView }) => {
    if (isLoading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p>Carregando carrinho...</p>
            </Container>
        );
    }
    
    if (!cart || cart.itens.length === 0) {
        return (
            <Container className="mt-5">
                <Alert variant="info">Seu carrinho está vazio.</Alert>
                <Button onClick={() => onChangeView('catalog')}>Ver Catálogo</Button>
            </Container>
        );
    }

    const cartTotal = cart.itens.reduce((total, item) => {
        return total + (item.produto.preco * item.quantidade);
    }, 0);
    
    return (
        <Container className="my-5">
            <h2>Meu Carrinho</h2>
            <Row>
                <Col md={8}>
                    <ListGroup variant="flush">
                        {cart.itens.map(item => (
                            <ListGroup.Item 
                                key={item.id} 
                                className="d-flex justify-content-between align-items-center"
                            >
                                <div className="d-flex align-items-center">
                                    {/* IMAGEM DO PRODUTO (Com classe CSS em vez de style inline) */}
                                    <img 
                                        src={
                                            item.produto.imagem && item.produto.imagem.startsWith('http')
                                            ? item.produto.imagem
                                            : `https://placehold.co/100?text=${item.produto.nome.substring(0,3)}`
                                        }
                                        alt={item.produto.nome}
                                        className="cart-item-img rounded" 
                                    />

                                    <div>
                                        <h5 className="mb-1">{item.produto.nome}</h5>
                                        <p className="mb-0 text-muted">
                                            R$ {formatPrice(item.produto.preco)} x {item.quantidade} un.
                                        </p>
                                        <p className="fw-bold">
                                            Subtotal: R$ {formatPrice(item.produto.preco * item.quantidade)}
                                        </p>
                                        {item.produto.estoque <= item.quantidade && (
                                            <small className="text-danger">
                                                Estoque Máximo Atingido ({item.produto.estoque})!
                                            </small>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm" 
                                        onClick={() => onUpdateItem(item.id, item.quantidade + 1)} 
                                        disabled={item.produto.estoque <= item.quantidade}
                                    >
                                        +
                                    </Button>
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm" 
                                        className="mx-2" 
                                        onClick={() => onUpdateItem(item.id, item.quantidade - 1)}
                                    >
                                        -
                                    </Button>
                                    <Button 
                                        variant="danger" 
                                        size="sm" 
                                        onClick={() => onRemoveItem(item.id)}
                                    >
                                        Remover
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>
                <Col md={4}>
                    <Card className="mt-3 mt-md-0">
                        <Card.Body>
                            <Card.Title>Resumo do Pedido</Card.Title>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold fs-4">
                                <span>TOTAL:</span>
                                <span className="text-success">
                                    R$ {formatPrice(cartTotal)}
                                </span>
                            </div>
                            <Button 
                                variant="primary" 
                                className="w-100 mt-4" 
                                onClick={() => onChangeView('checkout')}
                            >
                                Finalizar Pedido
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CartScreen;