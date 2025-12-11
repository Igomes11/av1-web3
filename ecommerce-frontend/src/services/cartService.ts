import axios from 'axios';

const API_URL = 'http://localhost:3000/carrinho';

export interface CartItem {
  id: number;
  quantidade: number;
  produto: {
    id: number;
    nome: string;
    preco: number;
    descricao: string;
    estoque: number;
    imagem: string; // <--- ADICIONADO AQUI
  };
}

export interface Cart {
  id: number;
  itens: CartItem[];
}

export const cartService = {
  // Busca o carrinho do usuário
  async getCart(): Promise<Cart> {
    const response = await axios.get<Cart>(API_URL);
    return response.data;
  },

  // Adiciona um item ao carrinho
  async addItem(produtoId: number, quantidade: number): Promise<Cart> {
    const response = await axios.post<Cart>(`${API_URL}/item`, {
      produtoId,
      quantidade,
    });
    return response.data;
  },

  // Atualiza a quantidade de um item
  async updateItem(itemId: number, quantidade: number): Promise<Cart> {
    const response = await axios.patch<Cart>(`${API_URL}/item/${itemId}`, {
      quantidade,
    });
    return response.data;
  },

  // Remove um item do carrinho
  async removeItem(itemId: number): Promise<Cart> {
    const response = await axios.delete<Cart>(`${API_URL}/item/${itemId}`);
    return response.data;
  },

  // Limpa todo o carrinho
  async clearCart(): Promise<void> {
    await axios.delete(API_URL);
  },
};