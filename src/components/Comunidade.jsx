import { useMemo, useState } from "react";
import { useForum } from "../hooks/useForum";
import PostCard from "./PostCard.jsx";
import PostDetalhe from "./PostDetalhe.jsx";

export default function Comunidade({ user, voltar }) {
  const [aviso, setAviso] = useState("");
  const [ordem, setOrdem] = useState("populares");
  const [aberto, setAberto] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const forum = useForum(user, setAviso);

  const ordenados = useMemo(() => {
    const porData = (a, b) => (b.criadoEm || 0) - (a.criadoEm || 0);
    const l = [...forum.posts];
    l.sort(ordem === "populares" ? (a, b) => b.score - a.score || porData(a, b) : porData);
    return l;
  }, [forum.posts, ordem]);

  const postAberto = forum.posts.find((p) => p.id === aberto);

  async function publicar(e) {
    e.preventDefault();
    if (!titulo.trim()) return;
    if (await forum.publicar(titulo.trim(), texto.trim())) {
      setTitulo("");
      setTexto("");
    }
  }

  return (
    <main className="app">
      <header className="topo">
        <h1>Comunidade</h1>
        <button type="button" className="remover" onClick={voltar}>← Meus gastos</button>
      </header>

      <p className="erro" role="alert">{aviso}</p>

      {postAberto ? (
        <PostDetalhe post={postAberto} forum={forum} user={user} fechar={() => setAberto(null)} />
      ) : (
        <>
          <section className="bloco">
            <h2>Nova publicação</h2>
            <form onSubmit={publicar}>
              <input
                type="text" placeholder="Título" maxLength={120} required
                value={titulo} onChange={(e) => setTitulo(e.target.value)}
              />
              <textarea
                placeholder="Conte mais (opcional): dicas de economia, dúvidas, desafios..." maxLength={2000}
                value={texto} onChange={(e) => setTexto(e.target.value)}
              />
              <button type="submit">Publicar</button>
            </form>
          </section>

          <div className="forum-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={ordem === "populares"} onClick={() => setOrdem("populares")}>Populares</button>
            <button type="button" role="tab" aria-selected={ordem === "novos"} onClick={() => setOrdem("novos")}>Novos</button>
          </div>

          {forum.carregando && <p className="vazio">Carregando publicações...</p>}
          {!forum.carregando && ordenados.length === 0 && (
            <p className="vazio">Nenhuma publicação ainda. Faça a primeira!</p>
          )}
          {ordenados.map((p) => (
            <PostCard key={p.id} post={p} forum={forum} user={user} onAbrir={() => setAberto(p.id)} />
          ))}
        </>
      )}
    </main>
  );
}
