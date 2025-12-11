import React, { useState } from 'react';
import axios from 'axios';
import { Container, Card, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { formatPrice } from '../utils/format';

interface PaymentScreenProps {
  orderId: number | null;
  total: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ orderId, total, onPaymentSuccess, onCancel }) => {
  // Valor inicial deve ser um dos permitidos pelo DTO ('PIX', 'Cartão', 'Boleto')
  const [method, setMethod] = useState('PIX');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmPayment = async () => {
    if (!orderId) return;
    setLoading(true);
    setError('');

    try {
      // CORREÇÃO: Enviando exatamente o formato que o CreatePagamentoDto exige
      // Campo: 'metodo'
      // Valores: 'PIX', 'Cartão', 'Boleto'
      await axios.post('http://localhost:3000/pagamento/processar', {
        pedidoId: orderId,
        metodo: method, 
        valor: total,
        novoStatus: 'PAGO'
      });

      alert('Pagamento confirmado com sucesso! O estoque foi debitado.');
      onPaymentSuccess();
    } catch (err: any) {
        console.error("Erro no pagamento:", err);
        
        // Pega a mensagem de erro detalhada do Backend (ex: "Método de pagamento inválido")
        const msg = err.response?.data?.message 
          ? (Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message)
          : 'Erro ao processar pagamento.';
          
        setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!orderId) return <Alert variant="danger">Nenhum pedido selecionado para pagamento.</Alert>;

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center">
              <h3>Pagamento Seguro</h3>
            </Card.Header>
            <Card.Body>
              <h5 className="text-center mb-4">Pedido #{orderId}</h5>
              
              <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
                <span className="lead">Total a Pagar:</span>
                <span className="h3 text-success m-0">R$ {formatPrice(total)}</span>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form.Group className="mb-4" controlId="paymentMethodSelect">
                <Form.Label>Forma de Pagamento:</Form.Label>
                <Form.Select 
                  size="lg" 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)}
                  aria-label="Escolha a forma de pagamento"
                >
                  {/* CORREÇÃO: Os valores (value) devem ser IGUAIS ao DTO do backend */}
                  <option value="PIX">PIX (Aprovação Imediata)</option>
                  <option value="Cartão">Cartão de Crédito</option>
                  <option value="Boleto">Boleto Bancário</option>
                </Form.Select>
              </Form.Group>

              {method === 'PIX' && (
                <Alert variant="info" className="small">
                    ℹ️ Ambiente de Teste: Ao clicar em confirmar, o pagamento será aprovado automaticamente via PIX.
                </Alert>
              )}

              <div className="d-grid gap-2 mt-4">
                <Button 
                  variant="success" 
                  size="lg" 
                  onClick={handleConfirmPayment} 
                  disabled={loading}
                >
                  {loading ? (
                    <><Spinner as="span" animation="border" size="sm" /> Processando...</>
                  ) : (
                    'Confirmar Pagamento'
                  )}
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={onCancel} 
                  disabled={loading}
                >
                  Pagar Depois
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentScreen;