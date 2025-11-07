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
    /** Callback para atualização do carrinho */
    onUpdateCart: (productId: number, change: number) => void;
    /** Item atual no carrinho, se existir */
    currentCartItem: { productId: number; quantidade: number } | undefined;
}

/**
 * Componente de detalhes do produto
 * Gerencia a visualização detalhada e ações de compra
 */
const ProductDetails: React.FC<ProductDetailsProps> = ({ 
    productId, 
    onChangeView, 
    onUpdateCart, 
    currentCartItem 
}) => {
    // Estados para gerenciamento de dados e UI
    const [product, setProduct] = useState<Produto | null>(null);        // Dados do produto
    const [isLoading, setIsLoading] = useState(true);                   // Indicador de carregamento
    const [error, setError] = useState<string | null>(null);            // Mensagens de erro
    const [quantity, setQuantity] = useState(1);                        // Quantidade selecionada
    
    // Quantidade atual no carrinho para controle de estoque
    const currentQuantity = currentCartItem?.quantidade || 0;

    /**
     * Carrega os detalhes do produto selecionado
     */
    const fetchProductDetails = async () => {
        try {
            const response = await axios.get<Produto>(`${API_URL}/${productId}`);
            setProduct(response.data);
            setQuantity(1); // Reset para quantidade inicial
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
    const handleAddToCart = () => {
        if (!product) return;

        if (quantity > 0 && quantity <= product.estoque) {
            onUpdateCart(product.id, quantity);
            alert(`Adicionado ${quantity}x ${product.nome} ao carrinho!`);
            setQuantity(1); // Reset após adição
        } else if (quantity > product.estoque) {
            alert(`Erro: A quantidade excede o estoque disponível de ${product.estoque}.`);
        }
    };
    
    /**
     * Remove todos os itens do produto do carrinho
     */
    const handleRemoveFromCart = () => {
        if (!product || currentQuantity === 0) return;
        
        onUpdateCart(product.id, -currentQuantity);
        alert(`Removido ${product.nome} totalmente do carrinho.`);
    }

    if (isLoading) {
        return (
            <Container className="text-center mt-5"><Spinner animation="border" variant="primary" /><p className="mt-2">Carregando detalhes...</p></Container>
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
                                    max={product.estoque - currentQuantity}
                                    value={quantity}
                                    onChange={(e) => setQuantity(
                                        Math.max(1, parseInt(e.target.value) || 1)
                                    )}
                                    style={{ width: '80px' }}
                                    className="me-3"
                                    disabled={product.estoque === 0 || product.estoque === currentQuantity}
                                    title={
                                        product.estoque === 0 
                                            ? "Produto sem estoque" 
                                            : `Máximo: ${product.estoque - currentQuantity}`
                                    }
                                />
                                
                                {/* Botão de adicionar ao carrinho */}
                                <Button 
                                    variant="primary" 
                                    onClick={handleAddToCart}
                                    disabled={
                                        product.estoque === 0 || 
                                        quantity > (product.estoque - currentQuantity)
                                    }
                                    className="me-2"
                                    title={
                                        product.estoque === 0 
                                            ? "Produto sem estoque" 
                                            : "Adicionar a quantidade selecionada ao carrinho"
                                    }
                                >
                                    Adicionar ao Carrinho
                                </Button>
                                
                                {/* Botão de remover do carrinho (se houver) */}
                                {currentQuantity > 0 && (
                                    <Button 
                                        variant="outline-danger" 
                                        onClick={handleRemoveFromCart}
                                        title="Remover todos os itens deste produto do carrinho"
                                    >
                                        Remover Tudo
                                    </Button>
                                )}
                            </div>
                            
                            {/* Alerta de produto esgotado */}
                            {product.estoque === 0 && (
                                <Alert variant="danger" className="mt-3">
                                    Produto Esgotado!
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