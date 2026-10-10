import { deleteDoc, doc } from "firebase/firestore";
import { caminho } from "../hooks/useDados";
import { moeda, msgErro } from "../utils";

export default function ListaLancamentos({ uid, lancamentos, setAviso }) {
  const excluir = (id) =>
    deleteDoc(doc(caminho(uid, "lancamentos"), id)).catch((e) => setAviso(msgErro(e)));

  return (
    <section className="bloco">
      <h2>Lançamentos do mês</h2>
      <ul className="lista">
        {lancamentos.length === 0 && (
          <li className="vazio">Nada por aqui ainda. Adicione o primeiro lançamento acima.</li>
        )}
        {lancamentos.map((l) => {
          const [a, m, d] = l.data.split("-");
          return (
            <li key={l.id} className="item">
              <div>
                <span>{l.descricao}</span>
                <small>{l.categoria} • {d}/{m}/{a}</small>
              </div>
              <span className={`valor ${l.tipo}`}>
                {l.tipo === "despesa" ? "− " : "+ "}{moeda.format(l.valor)}
              </span>
              <button
                type="button" className="remover"
                aria-label={`Excluir ${l.descricao}`} onClick={() => excluir(l.id)}
              >
                Excluir
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
