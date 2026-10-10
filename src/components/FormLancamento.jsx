import { useState } from "react";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { caminho } from "../hooks/useDados";
import { hoje, msgErro } from "../utils";

export default function FormLancamento({ uid, categorias, mes, setMes, setAviso }) {
  const [tipo, setTipo] = useState("despesa");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje());
  const [categoria, setCategoria] = useState("");

  const opcoes = categorias.filter((c) => c.tipo === tipo);
  // Se a categoria escolhida não existe para este tipo, usa a primeira da lista
  const catAtual = opcoes.some((c) => c.nome === categoria) ? categoria : opcoes[0]?.nome || "";

  async function enviar(e) {
    e.preventDefault();
    setAviso("");
    const v = parseFloat(valor);
    if (!(v > 0) || !catAtual) return;
    try {
      await addDoc(caminho(uid, "lancamentos"), {
        tipo,
        descricao: descricao.trim(),
        valor: v,
        data,
        categoria: catAtual,
        criadoEm: serverTimestamp(),
      });
      setDescricao("");
      setValor("");
      // Se o lançamento é de outro mês, mostra esse mês
      if (data.slice(0, 7) !== mes) setMes(data.slice(0, 7));
    } catch (err) {
      setAviso(msgErro(err));
    }
  }

  return (
    <section className="bloco">
      <h2>Novo lançamento</h2>
      <form onSubmit={enviar}>
        <div className="tipo" role="radiogroup" aria-label="Tipo">
          {["despesa", "receita"].map((t) => (
            <label key={t}>
              <input type="radio" name="tipo" value={t} checked={tipo === t} onChange={() => setTipo(t)} />
              <span>{t === "despesa" ? "Despesa" : "Receita"}</span>
            </label>
          ))}
        </div>
        <input
          type="text" placeholder="Descrição (ex.: mercado)" maxLength={60} required
          value={descricao} onChange={(e) => setDescricao(e.target.value)}
        />
        <div className="linha">
          <input
            type="number" placeholder="Valor (R$)" min="0.01" step="0.01" required
            value={valor} onChange={(e) => setValor(e.target.value)}
          />
          <input type="date" required value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <select aria-label="Categoria" required value={catAtual} onChange={(e) => setCategoria(e.target.value)}>
          {opcoes.length === 0 && <option value="">Crie uma categoria abaixo</option>}
          {opcoes.map((c) => (
            <option key={c.id} value={c.nome}>{c.nome}</option>
          ))}
        </select>
        <button type="submit">Adicionar lançamento</button>
      </form>
    </section>
  );
}
