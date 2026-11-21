import { nomeDe, tempoAtras } from "../utils";

export default function ListaConversas({ conversas, carregando, onAbrir }) {
  if (carregando) return <p className="vazio">Carregando conversas...</p>;

  if (conversas.length === 0) {
    return (
      <p className="vazio">
        Você ainda não tem conversas. Abra uma publicação e clique em "Falar com usuário".
      </p>
    );
  }

  return (
    <ul className="conversas">
      {conversas.map((c) => (
        <li key={c.id}>
          <button
            type="button" className="conversa"
            onClick={() => onAbrir({ uid: c.comUid, email: c.comEmail })}
          >
            <span className="conversa-topo">
              <strong>{nomeDe(c.comEmail)}</strong>
              <small>{tempoAtras(c.atualizadoEm)}</small>
            </span>
            <span className="ultima">{c.ultima}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
