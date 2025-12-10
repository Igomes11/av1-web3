/**
 * ProductDetails.tsx
 * 
 * Componente para exibição detalhada de um produto.
 * Fornece interface completa para visualização e compra,
 * incluindo:
 * - Informações detalhadas do produto
 * - Imagem em tamanho maior
 * - Controles de quantidade
 * - Integração com carrinho
 * - Validações de estoque
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatPrice } from '../utils/format';
import { Container, Card, Button, Alert, Spinner, Row, Col, Form } from 'react-bootstrap';
import type { Produto, CurrentView } from '../types';
import type { Cart } from '../services/cartService';

/** URL base da API para operações com produtos */
const API_URL = 'http://localhost:3000/produto';

/**
 * Props do componente de detalhes do produto
 * @interface ProductDetailsProps
 */
interface ProductDetailsProps {
    /** ID do produto a ser exibido */
    productId: number;
    /** Callback para navegação entre views */
    onChangeView: (view: CurrentView) => void;
    /** Carrinho completo do usuário */
    cart: Cart | null;
    /** Callback para adicionar item ao carrinho */
    onAddToCart: (productId: number, quantidade: number) => Promise<void>;
}

/**
 * Componente de detalhes do produto
 * Gerencia a visualização detalhada e ações de compra
 */
const ProductDetails: React.FC<ProductDetailsProps> = ({ 
    productId, 
    onChangeView, 
    cart,
    onAddToCart,
}) => {
    // Estados para gerenciamento de dados e UI
    const [product, setProduct] = useState<Produto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    
    // Quantidade atual no carrinho para controle de estoque
    const currentQuantity = cart?.itens.find(
        item => item.produto.id === productId
    )?.quantidade || 0;

    /**
     * Carrega os detalhes do produto selecionado
     */
    const fetchProductDetails = async () => {
        try {
            const response = await axios.get<Produto>(`${API_URL}/${productId}`);
            setProduct(response.data);
            setQuantity(1);
        } catch (error) {
            console.error('Erro ao carregar produto:', error);
            setError('Erro ao carregar detalhes do produto.');
        } finally {
            setIsLoading(false);
        }
    };

    // Carrega detalhes quando o ID do produto muda
    useEffect(() => {
        void fetchProductDetails();
    }, [productId]);
    
    /**
     * Adiciona produtos ao carrinho
     * Valida quantidade contra estoque disponível
     */
    const handleAddToCart = async () => {
        if (!product) return;

        const availableStock = product.estoque - currentQuantity;

        if (quantity > 0 && quantity <= availableStock) {
            try {
                await onAddToCart(product.id, quantity);
                alert(`Adicionado ${quantity}x ${product.nome} ao carrinho!`);
                setQuantity(1);
            } catch (error) {
                alert('Erro ao adicionar ao carrinho. Tente novamente.');
            }
        } else if (quantity > availableStock) {
            alert(`Erro: Apenas ${availableStock} unidades disponíveis (você já tem ${currentQuantity} no carrinho).`);
        }
    };

    if (isLoading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Carregando detalhes...</p>
            </Container>
        );
    }

    if (error || !product) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error || 'Detalhes do produto não encontrados.'}</Alert>
                <Button onClick={() => onChangeView('catalog')}>Voltar ao Catálogo</Button>
            </Container>
        );
    }

    const availableStock = product.estoque - currentQuantity;

    /**
     * Interface principal de detalhes do produto
     */
    return (
        <Container className="my-5">
            {/* Navegação */}
            <Row>
                <Col md={12} className="mb-4">
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => onChangeView('catalog')}
                        title="Voltar para a lista de produtos"
                    >
                        ← Voltar ao Catálogo
                    </Button>
                </Col>
            </Row>

            {/* Card principal com detalhes */}
            <Card className="shadow-lg">
                <Card.Body>
                    <Row>
                        {/* Coluna da imagem */}
                        <Col md={5}>
                            <img
                                src={`https://placehold.co/600x400?text=${product.nome.substring(0, 15)}`}
                                alt={`Imagem do produto ${product.nome}`}
                                className="img-fluid rounded"
                            />
                        </Col>

                        {/* Coluna de informações e ações */}
                        <Col md={7}>
                            {/* Cabeçalho com nome e preço */}
                            <Card.Title as="h1" className="text-primary">{product.nome}</Card.Title>
                            <h2 className="text-success mb-4">
                                R$ {formatPrice(product.preco)}
                            </h2>

                            {/* Informações adicionais */}
                            <p className="text-muted">
                                **Categoria:** {product.categoria?.nome || 'N/A'}
                            </p>
                            <p className="lead">{product.descricao}</p>

                            <hr />

                            {/* Informação de estoque */}
                            <p 
                                className={`fw-bold ${
                                    product.estoque > 5 ? 'text-success' : 'text-danger'
                                }`}
                            >
                                Disponível em Estoque: {product.estoque}
                            </p>
                            
                            {/* Alerta de quantidade no carrinho */}
                            {currentQuantity > 0 && (
                                <Alert 
                                    variant="info" 
                                    className="p-2 text-center"
                                >
                                    {currentQuantity} item(s) deste produto já estão no seu carrinho.
                                </Alert>
                            )}

                            {/* Controles de quantidade e ações */}
                            <div className="d-flex align-items-center mt-4">
                                {/* Input de quantidade */}
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max={availableStock}
                                    value={quantity}
                                    onChange={(e) => setQuantity(
                                        Math.max(1, Math.min(availableStock, parseInt(e.target.value) || 1))
                                    )}
                                    style={{ width: '80px' }}
                                    className="me-3"
                                    disabled={availableStock === 0}
                                    title={
                                        availableStock === 0 
                                            ? "Produto sem estoque disponível" 
                                            : `Máximo: ${availableStock}`
                                    }
                                />
                                
                                {/* Botão de adicionar ao carrinho */}
                                <Button 
                                    variant="primary" 
                                    onClick={handleAddToCart}
                                    disabled={availableStock === 0}
                                    title={
                                        availableStock === 0 
                                            ? "Produto sem estoque disponível" 
                                            : "Adicionar a quantidade selecionada ao carrinho"
                                    }
                                >
                                    Adicionar ao Carrinho
                                </Button>
                            </div>
                            
                            {/* Alerta de produto esgotado */}
                            {availableStock === 0 && (
                                <Alert variant="danger" className="mt-3">
                                    {currentQuantity > 0 
                                        ? "Você já tem todo o estoque disponível no carrinho!" 
                                        : "Produto Esgotado!"}
                                </Alert>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProductDetails;