import { useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useDados } from "../hooks/useDados";
import { mesAtual, moeda } from "../utils";
import FormLancamento from "./FormLancamento.jsx";
import ListaLancamentos from "./ListaLancamentos.jsx";
import Categorias from "./Categorias.jsx";

export default function Painel({ user }) {
  const [mes, setMes] = useState(mesAtual());
  const [aviso, setAviso] = useState("");
  const { categorias, lancamentos } = useDados(user.uid, mes, setAviso);

  const { receitas, despesas, porCategoria } = useMemo(() => {
    let receitas = 0, despesas = 0;
    const por = {};
    lancamentos.forEach((l) => {
      if (l.tipo === "receita") receitas += l.valor;
      else {
        despesas += l.valor;
        por[l.categoria] = (por[l.categoria] || 0) + l.valor;
      }
    });
    return { receitas, despesas, porCategoria: Object.entries(por).sort((a, b) => b[1] - a[1]) };
  }, [lancamentos]);

  return (
    <main className="app">
      <header className="topo">
        <h1>Meus gastos</h1>
        <div className="usuario">
          <span>{user.email}</span>
          <button type="button" className="remover" onClick={() => signOut(auth)}>Sair</button>
        </div>
      </header>

      <p className="erro" role="alert">{aviso}</p>

      <div className="mes-linha">
        <label>
          <span className="sr">Mês</span>
          <input type="month" value={mes} onChange={(e) => e.target.value && setMes(e.target.value)} />
        </label>
      </div>

      <section className="resumo" aria-label="Resumo do mês">
        <div className="saldo">
          <span>Saldo do mês</span>
          <strong>{moeda.format(receitas - despesas)}</strong>
        </div>
        <div className="par">
          <div><span>Receitas</span><strong className="pos">{moeda.format(receitas)}</strong></div>
          <div><span>Despesas</span><strong className="neg">{moeda.format(despesas)}</strong></div>
        </div>
      </section>

      <FormLancamento uid={user.uid} categorias={categorias} mes={mes} setMes={setMes} setAviso={setAviso} />

      <section className="bloco">
        <h2>Despesas por categoria</h2>
        <div className="categorias">
          {porCategoria.length === 0 && <p className="vazio">Nenhuma despesa neste mês.</p>}
          {porCategoria.map(([nome, valor]) => {
            const pct = (valor / despesas) * 100;
            return (
              <div key={nome}>
                <div className="cat-topo">
                  <span>{nome}</span>
                  <span>{moeda.format(valor)} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="barra"><i style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      </section>

      <ListaLancamentos uid={user.uid} lancamentos={lancamentos} setAviso={setAviso} />
      <Categorias uid={user.uid} categorias={categorias} setAviso={setAviso} />
    </main>
  );
}
