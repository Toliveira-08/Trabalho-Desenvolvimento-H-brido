import Votos from "./Votos.jsx";
import { nomeDe, tempoAtras } from "../utils";

export default function PostCard({ post, forum, user, onAbrir, onConversar }) {
  const meu = post.autorUid === user.uid;
  const n = post.nComentarios;

  return (
    <article className="bloco post">
      <Votos score={post.score} meuVoto={post.meuVoto} onVotar={(novo) => forum.votar(post.id, post.meuVoto, novo)} />
      <div>
        <button type="button" className="post-titulo" onClick={onAbrir}>{post.titulo}</button>
        {post.texto && <p className="post-texto">{post.texto}</p>}
        <div className="post-meta">
          <span>por {nomeDe(post.autorEmail)}</span>
          <span>{tempoAtras(post.criadoEm)}</span>
          <button type="button" onClick={onAbrir}>{n} {n === 1 ? "comentário" : "comentários"}</button>
          {!meu && (
            <button type="button" onClick={() => onConversar({ uid: post.autorUid, email: post.autorEmail })}>
              Falar com usuário
            </button>
          )}
          {meu && (
            <button type="button" onClick={() => window.confirm("Excluir esta publicação?") && forum.apagarPost(post.id)}>
              Excluir
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
