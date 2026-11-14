import { useState } from "react";
import Votos from "./Votos.jsx";
import { nomeDe, tempoAtras } from "../utils";

export default function PostDetalhe({ post, forum, user, fechar }) {
  const [texto, setTexto] = useState("");
  const comentarios = forum.comentariosDe(post.id);

  async function comentar(e) {
    e.preventDefault();
    const t = texto.trim();
    if (!t) return;
    if (await forum.comentar(post.id, t)) setTexto("");
  }

  async function excluirPost() {
    if (window.confirm("Excluir esta publicação?") && (await forum.apagarPost(post.id))) fechar();
  }

  return (
    <>
      <button type="button" className="remover voltar" onClick={fechar}>← Voltar à lista</button>

      <article className="bloco post">
        <Votos score={post.score} meuVoto={post.meuVoto} onVotar={(novo) => forum.votar(post.id, post.meuVoto, novo)} />
        <div>
          <h2 className="post-titulo-aberto">{post.titulo}</h2>
          {post.texto && <p className="post-texto completo">{post.texto}</p>}
          <div className="post-meta">
            <span>por {nomeDe(post.autorEmail)}</span>
            <span>{tempoAtras(post.criadoEm)}</span>
            {post.autorUid === user.uid && <button type="button" onClick={excluirPost}>Excluir</button>}
          </div>
        </div>
      </article>

      <section className="bloco">
        <h2>Comentários ({comentarios.length})</h2>
        <form onSubmit={comentar}>
          <textarea
            placeholder="Escreva um comentário..." maxLength={500} required
            value={texto} onChange={(e) => setTexto(e.target.value)}
          />
          <button type="submit">Comentar</button>
        </form>
        <ul className="lista">
          {comentarios.length === 0 && <li className="vazio">Ninguém comentou ainda. Seja a primeira pessoa!</li>}
          {comentarios.map((c) => (
            <li key={c.id} className="comentario">
              <div className="post-meta">
                <strong>{nomeDe(c.autorEmail)}</strong>
                <span>{tempoAtras(c.criadoEm)}</span>
                {c.autorUid === user.uid && (
                  <button type="button" onClick={() => forum.apagarComentario(post.id, c.id)}>Excluir</button>
                )}
              </div>
              <p className="comentario-texto">{c.texto}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
