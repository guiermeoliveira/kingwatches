import { useState, useEffect } from "react";
import "./assets/styles/style.css";
import { api } from "./services/api";

export default function App() {
  const [secaoAtiva, setSecaoAtiva] = useState("inicio");
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  // Modais
  const [modalAuthAberto, setModalAuthAberto] = useState(false);
  const [abaAuth, setAbaAuth] = useState("login"); // 'login' | 'cadastro' | 'recuperar'
  const [drawerAberto, setDrawerAberto] = useState(false);

  // Dados da API Spring Boot
  const [produtos, setProdutos] = useState([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  // Sessão e Sacola
  const [usuario, setUsuario] = useState(null);
  const [sacola, setSacola] = useState([]);

  // Formulários
  const [authForm, setAuthForm] = useState({
    nome: "",
    email: "",
    senha: "",
    novaSenha: "",
  });
  const [authFeedback, setAuthFeedback] = useState("");

  const [contatoForm, setContatoForm] = useState({
    nome: "",
    email: "",
    assunto: "Aquisição de Peça",
    mensagem: "",
  });
  const [statusEnvio, setStatusEnvio] = useState("");

  const carregarCatalogo = () => {
    setCarregandoProdutos(true);
    api
      .listarProdutos()
      .then((dados) => setProdutos(dados))
      .catch(() => setProdutos([]))
      .finally(() => setCarregandoProdutos(false));
  };

  useEffect(() => {
    carregarCatalogo();
  }, []);

  const navegarPara = (idSecao) => {
    setSecaoAtiva(idSecao);
    setMenuMobileAberto(false);
    const el = document.getElementById(idSecao);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatarBRL = (valor) =>
    Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const handleAdicionarSacola = (produto) => {
    if (!usuario) {
      setDrawerAberto(false);
      setAbaAuth("login");
      setAuthFeedback("Faça login para adicionar peças à sua sacola.");
      setModalAuthAberto(true);
      return;
    }
    setSacola((prev) => [...prev, produto]);
    setDrawerAberto(true);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthFeedback("");

    try {
      if (abaAuth === "recuperar") {
        await api.redefinirSenha({
          email: authForm.email,
          novaSenha: authForm.novaSenha,
        });
        setAuthFeedback("Senha atualizada com sucesso. Entre com a nova credencial.");
        setAbaAuth("login");
        setAuthForm((prev) => ({ ...prev, senha: "", novaSenha: "" }));
        return;
      }

      const resposta =
        abaAuth === "login"
          ? await api.login({ email: authForm.email, senha: authForm.senha })
          : await api.cadastrar({
              nome: authForm.nome,
              email: authForm.email,
              senha: authForm.senha,
            });

      setUsuario(resposta);
      setModalAuthAberto(false);
      setAuthForm({ nome: "", email: "", senha: "", novaSenha: "" });
    } catch (err) {
      setAuthFeedback(err.message);
    }
  };

  const handleExcluirConta = async () => {
    if (!usuario?.id) return;
    if (!window.confirm("Deseja realmente excluir sua conta permanentemente?")) return;

    try {
      await api.excluirConta(usuario.id);
      setUsuario(null);
      setSacola([]);
      setMenuMobileAberto(false);
      alert("Conta removida do sistema.");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleContatoSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.enviarContato(contatoForm);
      setStatusEnvio("Mensagem registrada com sucesso. Nossa equipe retornará em breve.");
      setContatoForm({
        nome: "",
        email: "",
        assunto: "Aquisição de Peça",
        mensagem: "",
      });
    } catch {
      setStatusEnvio("Erro ao enviar mensagem. Verifique a conexão com o servidor.");
    }
  };

  const handleFinalizarCompra = async () => {
    try {
      await api.criarPedido({
        usuarioId: usuario.id,
        produtosIds: sacola.map((item) => item.id),
      });
      alert("Aquisição concluída e estoque atualizado!");
      setSacola([]);
      setDrawerAberto(false);
      carregarCatalogo();
    } catch (err) {
      alert(err.message);
    }
  };

  const produtosFiltrados =
    categoriaAtiva === "Todos"
      ? produtos
      : produtos.filter((p) => p.categoria === categoriaAtiva);

  const totalSacola = sacola.reduce((soma, item) => soma + Number(item.preco), 0);

  return (
    <>
      {/* HEADER RESPONSIVO */}
      <header className="site-header">
        <div className="container nav">
          <a
            href="#inicio"
            className="brand-logo"
            style={{ flexDirection: "row", alignItems: "center", gap: "0.75rem" }}
            onClick={(e) => {
              e.preventDefault();
              navegarPara("inicio");
            }}
          >
            <img
              src="/logo-kingwatches.png"
              alt="KingWatches"
              style={{ width: "38px", height: "38px", objectFit: "contain" }}
            />
            <div>
              <strong>KING WATCHES</strong>
              <span>HAUTE HORLOGERIE</span>
            </div>
          </a>

          <nav className="nav-links">
            {[
              { id: "inicio", label: "Início" },
              { id: "sobre", label: "Sobre a Maison" },
              { id: "produtos", label: "Produtos" },
              { id: "contato", label: "Contato" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={secaoAtiva === item.id ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  navegarPara(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            {usuario ? (
              <>
                <button
                  className="nav-icon-btn desktop-only"
                  onClick={() => setUsuario(null)}
                >
                  {usuario.nome} (Sair)
                </button>
                <button
                  className="nav-icon-btn desktop-only"
                  style={{ color: "var(--slate-400)" }}
                  onClick={handleExcluirConta}
                >
                  Excluir Conta
                </button>
              </>
            ) : (
              <button
                className="nav-icon-btn desktop-only"
                onClick={() => {
                  setDrawerAberto(false);
                  setAbaAuth("login");
                  setAuthFeedback("");
                  setModalAuthAberto(true);
                }}
              >
                Entrar / Cadastrar
              </button>
            )}

            <button
              className="nav-icon-btn"
              onClick={() => {
                setModalAuthAberto(false);
                setMenuMobileAberto(false);
                setDrawerAberto(true);
              }}
            >
              Sacola <span className="bag-badge">{sacola.length}</span>
            </button>

            <button
              className="mobile-toggle"
              aria-label="Abrir Menu"
              onClick={() => setMenuMobileAberto((prev) => !prev)}
            >
              {menuMobileAberto ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* MENU MOBILE DRAWER */}
      {menuMobileAberto && (
        <div className="mobile-drawer">
          <div className="mobile-nav-list">
            {[
              { id: "inicio", label: "Início" },
              { id: "sobre", label: "Sobre a Maison" },
              { id: "produtos", label: "Produtos" },
              { id: "contato", label: "Contato" },
            ].map((item) => (
              <button
                key={item.id}
                className={`mobile-nav-link ${secaoAtiva === item.id ? "active" : ""}`}
                onClick={() => navegarPara(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {usuario ? (
              <>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setUsuario(null);
                    setMenuMobileAberto(false);
                  }}
                >
                  Sair ({usuario.nome})
                </button>
                <button
                  className="btn btn-outline"
                  style={{ color: "var(--slate-400)" }}
                  onClick={handleExcluirConta}
                >
                  Excluir Minha Conta
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setMenuMobileAberto(false);
                  setAbaAuth("login");
                  setModalAuthAberto(true);
                }}
              >
                Entrar / Cadastrar
              </button>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO CONTÍNUO DA LANDING PAGE */}
      <main>
        {/* 1. HERO */}
        <section id="inicio" className="hero-luxury">
          <div className="hero-bg-media">
            <img
              src="https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&w=1800&q=80"
              alt="Calibre mecânico"
            />
          </div>
          <div className="container">
            <div className="hero-content anim-rise">
              <span className="eyebrow">Coleção Privée • Edições Numeradas</span>
              <h1>
                A arquitetura do tempo em sua forma mais <em>pura</em>.
              </h1>
              <p className="lede">
                Cada relógio KingWatches reúne calibres mecânicos ajustados à
                mão, caixas esculpidas em metais nobres e mostradores de
                equilíbrio atemporal.
              </p>
              <div className="hero-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navegarPara("produtos")}
                >
                  Explorar Catálogo
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => navegarPara("sobre")}
                >
                  Conhecer o Atelier
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SOBRE A MAISON */}
        <section id="sobre" className="section section-watermark">
          <div className="section-watermark-bg">
            <img
              src="https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=1800&q=80"
              alt="Engrenagens"
            />
          </div>
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Sobre a Maison • Nossa Herança</span>
                <h2 className="section-title">A Filosofia KingWatches</h2>
              </div>
            </div>

            <div className="feature-split">
              <div className="feature-body">
                <p className="lede" style={{ marginBottom: "1.25rem" }}>
                  Nascida da obsessão pelo silêncio visual e pela mecânica
                  honesta, a KingWatches projeta instrumentos de medição do
                  tempo livres de excessos.
                </p>
                <p className="lede">
                  Nossos movimentos operam a 28.800 alternâncias por hora com
                  pontes chanfradas manualmente, número de série gravado e
                  certificado individual de cronometria.
                </p>
                <div className="feature-specs">
                  <div className="spec-item">
                    <span>Frequência & Reserva</span>
                    <strong>4 Hz • Até 72 Horas</strong>
                  </div>
                  <div className="spec-item">
                    <span>Garantia & Estanqueidade</span>
                    <strong>5 Anos • 10 ATM / 100m</strong>
                  </div>
                </div>
              </div>
              <div className="feature-media">
                <img
                  src="https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=1000&q=80"
                  alt="Mostrador minimalista KingWatches"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. PRODUTOS / VITRINE DE ESTOQUE */}
        <section id="produtos" className="section section-cream">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Acervo & Disponibilidade</span>
                <h2 className="section-title">Coleção Atual</h2>
              </div>
              <p className="lede">
                Catálogo sincronizado com nosso estoque. Faça login para
                reservar ou adquirir peças disponíveis.
              </p>
            </div>

            <div className="filter-bar">
              {["Todos", "Clássicos", "Complicações", "Ultra-Thin"].map((cat) => (
                <button
                  key={cat}
                  className={`filter-pill ${categoriaAtiva === cat ? "active" : ""}`}
                  onClick={() => setCategoriaAtiva(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {carregandoProdutos ? (
              <p className="lede">Consultando acervo...</p>
            ) : produtosFiltrados.length === 0 ? (
              <div className="concierge-card text-center">
                <span className="eyebrow">Acervo em Atualização</span>
                <h3 style={{ marginBlock: "0.75rem" }}>
                  Nenhuma peça disponível nesta categoria no momento.
                </h3>
                <p className="lede" style={{ marginInline: "auto" }}>
                  Entre em contato com nosso Concierge para encomendas sob
                  medida.
                </p>
              </div>
            ) : (
              <div className="watch-grid">
                {produtosFiltrados.map((item) => {
                  const disponivel = item.estoque > 0;
                  return (
                    <article key={item.id} className="watch-card">
                      <div className="watch-frame">
                        <span
                          className={`stock-tag ${
                            disponivel ? "in-stock" : "sold-out"
                          }`}
                        >
                          {disponivel
                            ? `Em estoque (${item.estoque})`
                            : "Esgotado"}
                        </span>
                        <img src={item.imagemUrl} alt={item.nome} />
                      </div>
                      <span className="watch-ref">REF. {item.referencia}</span>
                      <h3 className="watch-name">{item.nome}</h3>
                      <p className="watch-caliber">{item.descricao}</p>
                      <div className="watch-footer">
                        <div className="watch-price">
                          <small>VALOR À VISTA</small>
                          {formatarBRL(item.preco)}
                        </div>
                        <button
                          className="btn btn-primary"
                          disabled={!disponivel}
                          onClick={() => handleAdicionarSacola(item)}
                        >
                          {disponivel ? "Adquirir" : "Indisponível"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 4. CONTATO / CONCIERGE */}
        <section id="contato" className="section">
          <div className="container contact-layout">
            <div>
              <span className="eyebrow">Concierge Privé</span>
              <h2 className="section-title" style={{ marginBottom: "1rem" }}>
                Atendimento Personalizado
              </h2>
              <p className="lede" style={{ marginBottom: "2rem" }}>
                Envie sua mensagem para agendar atendimento privado ou tirar
                dúvidas sobre disponibilidade de peças.
              </p>
              <div className="spec-item" style={{ marginBottom: "1.2rem" }}>
                <span>Boutique & Showroom</span>
                <strong>Av. Europa, Jardins — São Paulo, SP</strong>
              </div>
              <div className="spec-item">
                <span>Horário de Atendimento</span>
                <strong>Segunda a Sábado, das 10h às 19h</strong>
              </div>
            </div>

            <div className="concierge-card">
              <form onSubmit={handleContatoSubmit}>
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={contatoForm.nome}
                    onChange={(e) =>
                      setContatoForm({ ...contatoForm, nome: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={contatoForm.email}
                    onChange={(e) =>
                      setContatoForm({ ...contatoForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assunto</label>
                  <select
                    className="form-control"
                    value={contatoForm.assunto}
                    onChange={(e) =>
                      setContatoForm({ ...contatoForm, assunto: e.target.value })
                    }
                  >
                    <option>Aquisição de Peça</option>
                    <option>Disponibilidade em Estoque</option>
                    <option>Manutenção & Revisão</option>
                    <option>Atendimento Privado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Mensagem</label>
                  <textarea
                    className="form-control"
                    required
                    value={contatoForm.mensagem}
                    onChange={(e) =>
                      setContatoForm({ ...contatoForm, mensagem: e.target.value })
                    }
                  />
                </div>
                {statusEnvio && (
                  <p style={{ marginBottom: "1rem", fontSize: "0.88rem" }}>
                    {statusEnvio}
                  </p>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  Enviar Mensagem
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL LOGIN / CADASTRO / REDEFINIR SENHA */}
      {modalAuthAberto && (
        <div
          className="modal-backdrop"
          onClick={() => setModalAuthAberto(false)}
        >
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.2rem",
              }}
            >
              <span className="eyebrow">Área do Cliente</span>
              <button
                type="button"
                onClick={() => setModalAuthAberto(false)}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            {abaAuth !== "recuperar" ? (
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${abaAuth === "login" ? "active" : ""}`}
                  onClick={() => {
                    setAbaAuth("login");
                    setAuthFeedback("");
                  }}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  className={`auth-tab ${abaAuth === "cadastro" ? "active" : ""}`}
                  onClick={() => {
                    setAbaAuth("cadastro");
                    setAuthFeedback("");
                  }}
                >
                  Cadastrar
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.5rem" }}>Redefinir Senha</h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--slate-600)",
                    marginTop: "0.3rem",
                  }}
                >
                  Informe o e-mail cadastrado e defina uma nova senha.
                </p>
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {abaAuth === "cadastro" && (
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Seu nome completo"
                    required
                    value={authForm.nome}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, nome: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="cliente@exemplo.com"
                  required
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, email: e.target.value })
                  }
                />
              </div>

              {abaAuth !== "recuperar" ? (
                <div className="form-group">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <label className="form-label">Senha</label>
                    {abaAuth === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setAbaAuth("recuperar");
                          setAuthFeedback("");
                        }}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--champagne)",
                          textDecoration: "underline",
                        }}
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    required
                    value={authForm.senha}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, senha: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Nova Senha</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Digite a nova senha"
                    required
                    value={authForm.novaSenha}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, novaSenha: e.target.value })
                    }
                  />
                </div>
              )}

              {authFeedback && (
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--charcoal-950)",
                    backgroundColor: "var(--bg-cream)",
                    padding: "0.75rem",
                    marginBottom: "1rem",
                    borderLeft: "2px solid var(--champagne)",
                  }}
                >
                  {authFeedback}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "0.4rem" }}
              >
                {abaAuth === "login" && "Acessar Conta"}
                {abaAuth === "cadastro" && "Criar Conta"}
                {abaAuth === "recuperar" && "Atualizar Senha"}
              </button>

              {abaAuth === "recuperar" && (
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: "100%", marginTop: "0.75rem" }}
                  onClick={() => {
                    setAbaAuth("login");
                    setAuthFeedback("");
                  }}
                >
                  Voltar para o Login
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* DRAWER DA SACOLA */}
      {drawerAberto && (
        <div className="modal-backdrop" onClick={() => setDrawerAberto(false)}>
          <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span className="eyebrow">Sua Seleção</span>
                <h3 style={{ fontSize: "1.6rem" }}>Sacola Privée</h3>
              </div>
              <button onClick={() => setDrawerAberto(false)}>✕</button>
            </div>

            <div className="cart-items">
              {sacola.length === 0 ? (
                <p className="lede">Nenhuma peça selecionada no momento.</p>
              ) : (
                sacola.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="cart-item">
                    <img
                      src={item.imagemUrl}
                      alt={item.nome}
                      className="cart-item-img"
                    />
                    <div>
                      <span className="watch-ref">REF. {item.referencia}</span>
                      <h4>{item.nome}</h4>
                      <p>{formatarBRL(item.preco)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="cart-summary">
              {sacola.length > 0 ? (
                <>
                  <div className="cart-total-row">
                    <span className="form-label">Total</span>
                    <strong className="watch-price">
                      {formatarBRL(totalSacola)}
                    </strong>
                  </div>
                  <button
                    className="btn btn-champagne"
                    style={{ width: "100%" }}
                    onClick={handleFinalizarCompra}
                  >
                    Finalizar Compra
                  </button>
                </>
              ) : (
                !usuario && (
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                    onClick={() => {
                      setDrawerAberto(false);
                      setModalAuthAberto(true);
                    }}
                  >
                    Entrar para Comprar
                  </button>
                )
              )}
            </div>
          </aside>
        </div>
      )}

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-bottom">
            <span>© 2026 KING WATCHES. TODOS OS DIREITOS RESERVADOS.</span>
            <span>HAUTE HORLOGERIE • GENÈVE & SÃO PAULO</span>
          </div>
        </div>
      </footer>
    </>
  );
}

