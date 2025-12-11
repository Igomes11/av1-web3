import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import AuthScreen from './AuthScreen';
import NavigationBar from './components/NavigationBar';
import CategoryScreen from './components/CategoryScreen';
import ProductCatalog from './components/ProductCatalog';
import ProductDetails from './components/ProductDetails';
import CartScreen from './components/CartScreen';
import CheckoutScreen from './components/CheckoutScreen';
import OrderHistory from './components/OrderHistory';
import ProfileScreen from './components/ProfileScreen';
import PaymentScreen from './components/PaymentScreen';
import type { User } from './types/types';
import { cartService, type Cart } from './services/cartService';
import axios from 'axios';

// Interceptor para adicionar token JWT em todas as requisições
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Componente Wrapper para injetar o ID da categoria no Catálogo vindo da URL
const CatalogWithCategory = ({ cart, onSelectProduct }: { cart: Cart | null, onSelectProduct: (id: number) => void }) => {
  const { id } = useParams();
  return (
    <ProductCatalog 
      cart={cart} 
      categoryId={id ? Number(id) : undefined} 
      onSelectProduct={onSelectProduct}
    />
  );
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  
  // Estado para dados do pagamento
  const [paymentData, setPaymentData] = useState<{orderId: number, total: number} | null>(null);
  
  const navigate = useNavigate();

  // Função auxiliar para mapear nomes de views antigas para rotas novas
  const handleViewChange = (view: string) => {
    switch (view) {
      case 'checkout': navigate('/checkout'); break;
      case 'cart': navigate('/carrinho'); break;
      case 'catalog': navigate('/'); break;
      case 'history': navigate('/meus-pedidos'); break;
      case 'profile': navigate('/perfil'); break;
      default: navigate('/');
    }
  };

  const loadCart = async () => {
    if (!user) return;
    try {
      setIsLoadingCart(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    } finally {
      setIsLoadingCart(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const handleLogin = (user: User) => {
    setUser(user);
    navigate('/'); 
  };

  const handleLogout = () => {
    setUser(null);
    setCart(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleAddToCart = async (productId: number, quantidade: number) => {
    try {
      const updatedCart = await cartService.addItem(productId, quantidade);
      setCart(updatedCart);
    } catch (error) {
      console.error("Erro ao adicionar item ao carrinho:", error);
      alert("Erro ao adicionar item ao carrinho. Por favor, tente novamente.");
    }
  };

  const handleUpdateCartItem = async (itemId: number, quantidade: number) => {
    try {
      if (quantidade <= 0) {
        await cartService.removeItem(itemId);
      } else {
        await cartService.updateItem(itemId, quantidade);
      }
      await loadCart();
    } catch (error) {
      console.error("Erro ao atualizar item do carrinho:", error);
    }
  };

  const handleRemoveCartItem = async (itemId: number) => {
    try {
      await cartService.removeItem(itemId);
      await loadCart();
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      setCart(null);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    }
  };

  const handleOrderCreated = (orderId: number, total: number) => {
    setPaymentData({ orderId, total });
    navigate('/pagamento');
  };

  const cartItemCount = cart?.itens.reduce((acc, item) => acc + item.quantidade, 0) ?? 0;

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <>
      <NavigationBar 
        user={user} 
        onLogout={handleLogout} 
        cartCount={cartItemCount}
      />
      
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={
            <ProductCatalog 
              onSelectProduct={(id) => navigate(`/produto/${id}`)} 
              cart={cart}
            />
          } />

          <Route path="/categorias" element={
            <CategoryScreen 
              onSelectCategory={(id) => navigate(`/categoria/${id}`)} 
              onChangeView={handleViewChange} 
            />
          } />

          <Route path="/categoria/:id" element={
            <CatalogWithCategory 
              cart={cart} 
              onSelectProduct={(id) => navigate(`/produto/${id}`)} 
            />
          } />

          <Route path="/produto/:id" element={
            <ProductDetails 
              onChangeView={handleViewChange} 
              cart={cart}
              onAddToCart={handleAddToCart}
            />
          } />

          <Route path="/carrinho" element={
            <CartScreen 
              cart={cart}
              isLoading={isLoadingCart}
              onUpdateItem={handleUpdateCartItem} 
              onRemoveItem={handleRemoveCartItem}
              onChangeView={handleViewChange} // <--- AQUI ESTAVA O ERRO (Antes era navigate('/'))
            />
          } />

          <Route path="/checkout" element={ 
            <CheckoutScreen 
              user={user}
              cart={cart}
              onClearCart={handleClearCart}
              onChangeView={handleViewChange} // <--- AQUI TAMBÉM
              onOrderCreated={handleOrderCreated}
            />
          } />

          <Route path="/pagamento" element={
            <PaymentScreen 
              orderId={paymentData?.orderId ?? null}
              total={paymentData?.total ?? 0}
              onPaymentSuccess={() => navigate('/meus-pedidos')}
              onCancel={() => navigate('/meus-pedidos')}
            />
          } />

          <Route path="/meus-pedidos" element={
            <OrderHistory user={user} onChangeView={handleViewChange} />
          } />
          
          <Route path="/perfil" element={
            <ProfileScreen user={user} onChangeView={handleViewChange} />
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;