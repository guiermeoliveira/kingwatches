const API_BASE_URL = "http://localhost:8080/api";

export const api = {
  // READ - Catálogo de relógios
  listarProdutos: async () => {
    const response = await fetch(`${API_BASE_URL}/produtos`);
    if (!response.ok) throw new Error("Erro ao carregar catálogo");
    return response.json();
  },

  // CREATE - Mensagem de Concierge / Contato
  enviarContato: async (dadosContato) => {
    const response = await fetch(`${API_BASE_URL}/contato`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosContato),
    });
    if (!response.ok) throw new Error("Erro ao enviar mensagem");
    return response.json();
  },

  // READ - Login
  login: async (credenciais) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credenciais),
    });
    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "E-mail ou senha inválidos");
    }
    return response.json();
  },

  // CREATE - Cadastro de Cliente
  cadastrar: async (dadosUsuario) => {
    const response = await fetch(`${API_BASE_URL}/auth/cadastro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosUsuario),
    });
    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "Erro ao cadastrar cliente");
    }
    return response.json();
  },

  // UPDATE - Esqueci minha senha
  redefinirSenha: async ({ email, novaSenha }) => {
    const response = await fetch(`${API_BASE_URL}/auth/redefinir-senha`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, novaSenha }),
    });
    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "E-mail não encontrado para redefinição");
    }
    return response.json();
  },

  // DELETE - Encerrar conta do cliente
  excluirConta: async (id) => {
    const response = await fetch(`${API_BASE_URL}/auth/usuarios/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao excluir conta");
  },

  // CREATE - Finalizar Compra e abater estoque no MySQL
  criarPedido: async (pedido) => {
    const response = await fetch(`${API_BASE_URL}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
    });
    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "Erro ao processar compra");
    }
    return response.json();
  },
};