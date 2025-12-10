import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import AuthScreen from './AuthScreen';
import NavigationBar from './components/NavigationBar';
import CategoryScreen from './components/CategoryScreen';
import ProductCatalog from './components/ProductCatalog';
import ProductDetails from './components/ProductDetails';
import CartScreen from './components/CartScreen';
import CheckoutScreen from './components/CheckoutScreen';
import OrderHistory from './components/OrderHistory';
import ProfileScreen from './components/ProfileScreen';
import type { CurrentView, User } from './types/types';
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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<CurrentView>('auth');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  // Estado do carrinho (integrado com API)
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  // Carrega o carrinho do backend quando o usuário faz login
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

  // Handler de login
  const handleLogin = (user: User) => {
    setUser(user);
    setView('catalog');
  };

  // Handler de logout
  const handleLogout = () => {
    setUser(null);
    setView('auth');
    setCart(null);
    setSelectedCategoryId(null);
    setSelectedCategoryName(''); 
  };

  const handleSelectCategory = (categoryId: number, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    setView('catalog');
  };

  const handleGoToCatalog = () => {
    setSelectedCategoryId(null);
    setSelectedCategoryName('');
    setView('catalog');
  };

  // Adiciona item ao carrinho via API
  const handleAddToCart = async (productId: number, quantidade: number) => {
    try {
      const updatedCart = await cartService.addItem(productId, quantidade);
      setCart(updatedCart);
    } catch (error) {
      console.error("Erro ao adicionar item ao carrinho:", error);
      alert("Erro ao adicionar item ao carrinho. Por favor, tente novamente.");
    }
  };

  // Atualiza quantidade de um item no carrinho
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
      alert("Erro ao atualizar item do carrinho.");
    }
  };

  // Remove item do carrinho
  const handleRemoveCartItem = async (itemId: number) => {
    try {
      await cartService.removeItem(itemId);
      await loadCart();
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  // Limpa o carrinho (usado após finalizar pedido)
  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      setCart(null);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    }
  };

  // Calcula total de itens no carrinho para exibir no badge
  const cartItemCount = cart?.itens.reduce((acc, item) => acc + item.quantidade, 0) ?? 0;

  const renderView = () => {
    if (!user || view === 'auth') {
      return <AuthScreen onLogin={handleLogin} />;
    }

    switch (view) {
      case 'categories':
        return <CategoryScreen onSelectCategory={handleSelectCategory} onChangeView={setView} />;

      case 'catalog':
        return (
          <ProductCatalog 
            onSelectProduct={(id) => { 
              setSelectedProductId(id); 
              setView('details'); 
            }} 
            cart={cart}
            categoryId={selectedCategoryId ?? undefined}
            categoryName={selectedCategoryName || undefined}
          />
        );

      case 'details':
        if (selectedProductId === null) {
          setView('catalog');
          return null; 
        }
        return (
          <ProductDetails 
            productId={selectedProductId} 
            onChangeView={setView} 
            cart={cart}
            onAddToCart={handleAddToCart}
          />
        );

      case 'cart':
        return (
          <CartScreen 
            cart={cart}
            isLoading={isLoadingCart}
            onUpdateItem={handleUpdateCartItem} 
            onRemoveItem={handleRemoveCartItem}
            onChangeView={setView}
          />
        );

      case 'checkout':
        return ( 
          <CheckoutScreen 
            user={user}
            cart={cart}
            onClearCart={handleClearCart}
            onChangeView={setView}
          />
        );

      case 'history':
        return <OrderHistory user={user} onChangeView={setView} />; 
      
      case 'profile':
        return <ProfileScreen user={user} onChangeView={setView} />; 

      default:
        return (
          <ProductCatalog 
            onSelectProduct={(id) => { 
              setSelectedProductId(id); 
              setView('details'); 
            }} 
            cart={cart}
            categoryId={selectedCategoryId ?? undefined}
            categoryName={selectedCategoryName || undefined}
          />
        );
    }
  };

  return (
    <>
      {user && (
        <NavigationBar 
          user={user} 
          onViewChange={setView} 
          onGoToCatalog={handleGoToCatalog}
          onLogout={handleLogout} 
          cartCount={cartItemCount}
        />
      )}
      
      <Container className="mt-4">
        {renderView()}
      </Container>
    </>
  );
}

export default App;