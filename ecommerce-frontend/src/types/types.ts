// ecommerce-frontend/src/types/types.ts
export type CurrentView =
  | "auth"
  | "catalog"
  | "details"
  | "cart"
  | "checkout"
  | "history"
  | "profile"; // 'profile' adicionado

export interface User {
  id: number;
  email: string;
  role: "admin" | "cliente"; // NOVO
  token: string; // NOVO
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem: string;
  categoria?: { nome: string };
}

export interface Endereco {
  // NOVO
  id: number;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  principal: boolean;
}
