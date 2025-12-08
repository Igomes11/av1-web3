import { useState } from 'react';
import { Container } from 'react-bootstrap';
import AuthScreen from './AuthScreen';
import NavigationBar from './components/NavigationBar';
import ProductCatalog from './components/ProductCatalog';
import ProductDetails from './components/ProductDetails';
import CartScreen from './components/CartScreen';
import CheckoutScreen from './components/CheckoutScreen'; // CORRIGIDO: Assumindo renomeado para CheckoutScreen.tsx
import OrderHistory from './components/OrderHistory';
import ProfileScreen from './components/ProfileScreen'; // NOVO IMPORT
import type { CurrentView, User } from './types/types'; // Importando do types/types.ts
import axios from 'axios';

// Adicione isso antes de renderizar o App
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

  // --- Lógica do Carrinho (Simulação de Estado no Front) ---
  const [cartItems, setCartItems] = useState<{ productId: number; quantidade: number }[]>([]);

  // Simulação de login
  const handleLogin = (user: User) => {
    setUser(user);
    setView('catalog');
  };

  const handleLogout = () => {
    setUser(null);
    setView('auth');
    setCartItems([]);
  };

  // Função para limpar o carrinho após o checkout
  const handleClearCart = () => { 
      setCartItems([]);
  };

  // Lógica para adicionar/remover do carrinho
  const updateCart = (productId: number, change: number) => {
    setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.productId === productId);
        
        if (existingItem) {
            const newQuantity = existingItem.quantidade + change;
            
            if (newQuantity <= 0) {
                return prevItems.filter(item => item.productId !== productId);
            }
            return prevItems.map(item =>
                item.productId === productId ? { ...item, quantidade: newQuantity } : item
            );
        }
        
        if (change > 0) {
            return [...prevItems, { productId, quantidade: change }];
        }

        return prevItems;
    });
  };


  const renderView = () => {
    if (!user || view === 'auth') {
      return <AuthScreen onLogin={handleLogin} />;
    }

    switch (view) {
      case 'catalog':
        return (
          <ProductCatalog 
            onSelectProduct={(id) => { setSelectedProductId(id); setView('details'); }} 
            cartItems={cartItems}
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
            onUpdateCart={updateCart}
            currentCartItem={cartItems.find(item => item.productId === selectedProductId)}
          />
        );
      case 'cart':
        return (
          <CartScreen 
            cartItems={cartItems} 
            onUpdateCart={updateCart} 
            onChangeView={setView}
          />
        );
      case 'checkout':
        return ( 
            <CheckoutScreen 
                user={user as User}
                cartItems={cartItems}
                onClearCart={handleClearCart}
                onChangeView={setView}
            />
        );
      case 'history':
        return <OrderHistory user={user} onChangeView={setView} />; 
      
      case 'profile': // NOVA ROTA: Perfil e Endereços
        return <ProfileScreen user={user} onChangeView={setView} />; 

      default:
        return <ProductCatalog 
            onSelectProduct={(id) => { setSelectedProductId(id); setView('details'); }} 
            cartItems={cartItems}
          />;
    }
  };

  return (
    <>
      {user && <NavigationBar 
        user={user} 
        onViewChange={setView} 
        onLogout={handleLogout} 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantidade, 0)} 
      />}
      
      <Container className="mt-4">
        {renderView()}
      </Container>
    </>
  );
}

export default App;