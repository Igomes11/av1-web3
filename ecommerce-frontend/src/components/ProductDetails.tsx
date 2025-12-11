import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row, Spinner, Badge, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api'; // Importa o axios configurado (default export)
import type { Produto } from '../types/types'; // Ajuste para o nome correto do tipo (provavelmente Produto)
import type { Cart } from '../services/cartService';

interface ProductDetailsProps {
  onChangeView: (view: any) => void;
  cart: Cart | null;
  onAddToCart: (productId: number, quantidade: number) => Promise<void>;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ onChangeView, cart, onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        // CORREÇÃO: Chamada direta ao axios em vez de productService
        const response = await axios.get<Produto>(`http://localhost:3000/produto/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        alert('Produto não encontrado.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    await onAddToCart(product.id, quantity);
    setAdding(false);
  };

  const itemInCart = cart?.itens.find((item) => item.produto.id === product?.id);
  const currentInCart = itemInCart ? itemInCart.quantidade : 0;
  // Cálculo de estoque disponível
  const stockAvailable = product ? product.estoque : 0;
  const canAdd = product && (quantity + currentInCart <= stockAvailable);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <Container className="mt-5">
      <Button variant="outline-secondary" className="mb-4" onClick={() => navigate('/')}>
        &larr; Voltar ao Catálogo
      </Button>
      
      <Row>
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Img 
              variant="top" 
              src={
                product.imagem && product.imagem.startsWith('http') 
                  ? product.imagem 
                  : `https://placehold.co/600x400?text=${product.nome}`
              }
              alt={product.nome}
              className="img-fluid rounded" 
            />
          </Card>
        </Col>
        
        <Col md={6}>
          <h2 className="fw-bold">{product.nome}</h2>
          <div className="mb-3">
             <Badge bg="info" className="me-2">{product.categoria?.nome || 'Sem Categoria'}</Badge>
             {stockAvailable > 0 ? (
                <Badge bg="success">Em Estoque ({stockAvailable})</Badge>
             ) : (
                <Badge bg="danger">Esgotado</Badge>
             )}
          </div>
          
          <h3 className="text-primary mb-4">
            R$ {Number(product.preco).toFixed(2).replace('.', ',')}
          </h3>
          
          <p className="lead text-muted">{product.descricao}</p>
          
          <hr />
          
          {stockAvailable > 0 ? (
            <div className="d-flex align-items-center gap-3">
              <Form.Group style={{ width: '80px' }}>
                <Form.Control 
                  type="number" 
                  min="1" 
                  max={Math.max(1, stockAvailable - currentInCart)}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </Form.Group>
              
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleAddToCart}
                disabled={!canAdd || adding}
              >
                {adding ? 'Adicionando...' : 'Adicionar ao Carrinho'}
              </Button>
            </div>
          ) : (
            <div className="alert alert-warning">
              Este produto está temporariamente indisponível.
            </div>
          )}
          
          {itemInCart && (
             <small className="text-muted d-block mt-2">
               Você já tem {itemInCart.quantidade} deste item no carrinho.
             </small>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails;