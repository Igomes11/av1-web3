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
import type { CurrentView, Produto } from '../types/types';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatPrice } from '../utils/format';

/** URL base da API para operações com produtos */
const API_URL = 'http://localhost:3000/produto';

/**
 * Interface de propriedades do componente CartScreen
 * @interface CartScreenProps
 */
interface CartScreenProps {
    /** Array de itens no carrinho com IDs e quantidades */
    cartItems: { productId: number; quantidade: number }[];
    /** Callback para atualizar quantidade de um item */
    onUpdateCart: (productId: number, change: number) => void;
    /** Callback para navegação entre views */
    onChangeView: (view: CurrentView, productId?: number) => void;
}

/**
 * Componente de carrinho de compras
 * Gerencia a visualização e interações com os itens do carrinho
 */
const CartScreen: React.FC<CartScreenProps> = ({ cartItems, onUpdateCart, onChangeView }) => {
    // Estado para armazenar detalhes dos produtos
    const [products, setProducts] = useState<Produto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Lista de IDs dos produtos no carrinho
    const productIds = cartItems.map(item => item.productId);

    /**
     * Efeito para carregar os detalhes dos produtos no carrinho
     * Dispara quando a lista de IDs muda
     */
    useEffect(() => {
        /**
         * Busca detalhes de todos os produtos no carrinho
         */
        const fetchCartProducts = async () => {
            // Otimização para carrinho vazio
            if (productIds.length === 0) {
                setProducts([]);
                setIsLoading(false);
                return;
            }

            try {
                // Carrega informações detalhadas de cada produto
                const productPromises = productIds.map(id => 
                    axios.get<Produto>(`${API_URL}/${id}`)
                );
                const results = await Promise.all(productPromises);
                setProducts(results.map(res => res.data));
            } catch (error) {
                console.error("Erro ao carregar produtos:", error);
                setError('Erro ao carregar detalhes dos produtos no carrinho.');
            } finally {
                setIsLoading(false);
            }
        };

        void fetchCartProducts();
    }, [productIds]); 

    /**
     * Calcula o valor total do carrinho
     * @returns {number} Soma de (preço * quantidade) de todos os itens
     */
    const calculateTotal = () => {
        return cartItems.reduce((total, cartItem) => {
            const product = products.find(p => p.id === cartItem.productId);
            return total + (product ? product.preco * cartItem.quantidade : 0);
        }, 0);
    };

    // Valor total do carrinho
    const cartTotal = calculateTotal();

    if (isLoading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p>Carregando carrinho...</p>
            </Container>
        );
    }
    
    if (error) {
        return (
             <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
                <Button onClick={() => onChangeView('catalog')}>Voltar ao Catálogo</Button>
            </Container>
        );
    }

    if (cartItems.length === 0) {
        return (
            <Container className="mt-5">
                <Alert variant="info">Seu carrinho está vazio.</Alert>
                <Button onClick={() => onChangeView('catalog')}>Ver Catálogo</Button>
            </Container>
        );
    }

    /**
     * Interface principal do carrinho
     * Exibe lista de produtos e resumo do pedido
     */
    return (
        <Container className="my-5">
            <h2>🛒 Meu Carrinho</h2>
            <Row>
                {/* Coluna principal - Lista de produtos */}
                <Col md={8}>
                    <ListGroup variant="flush">
                        {cartItems.map(cartItem => {
                            const product = products.find(p => p.id === cartItem.productId);
                            if (!product) return null; // Skip se produto não encontrado

                            return (
                                <ListGroup.Item 
                                    key={cartItem.productId} 
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    {/* Informações do produto */}
                                    <div>
                                        <h5 className="mb-1">{product.nome}</h5>
                                        <p className="mb-0 text-muted">
                                            R$ {formatPrice(product.preco)} x {cartItem.quantidade} un. 
                                        </p>
                                        <p className="fw-bold">
                                            Subtotal: R$ {formatPrice(Number(product.preco) * cartItem.quantidade)}
                                        </p>
                                        {/* Alerta de estoque máximo */}
                                        {product.estoque <= cartItem.quantidade && (
                                            <small className="text-danger">
                                                Estoque Máximo Atingido ({product.estoque})!
                                            </small>
                                        )}
                                    </div>

                                    {/* Controles de quantidade */}
                                    <div>
                                        <Button 
                                            variant="outline-secondary" 
                                            size="sm" 
                                            onClick={() => onUpdateCart(product.id, 1)}
                                            disabled={product.estoque <= cartItem.quantidade}
                                            title={
                                                product.estoque <= cartItem.quantidade 
                                                ? "Estoque máximo atingido" 
                                                : "Aumentar quantidade"
                                            }
                                        >
                                            +
                                        </Button>
                                        <Button 
                                            variant="outline-secondary" 
                                            size="sm" 
                                            className='mx-2' 
                                            onClick={() => onUpdateCart(product.id, -1)}
                                            title="Diminuir quantidade"
                                        >
                                            -
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => onUpdateCart(product.id, -cartItem.quantidade)}
                                            title="Remover item do carrinho"
                                        >
                                            Remover
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                </Col>

                {/* Coluna lateral - Resumo e finalização */}
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
                                title="Ir para tela de finalização do pedido"
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