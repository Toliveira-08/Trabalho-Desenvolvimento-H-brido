import { useState } from "react";
import { addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { caminho } from "../hooks/useDados";
import { msgErro } from "../utils";

export default function Categorias({ uid, categorias, setAviso }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("despesa");

  async function adicionar(e) {
    e.preventDefault();
    setAviso("");
    const n = nome.trim();
    if (!n) return;
    if (categorias.some((c) => c.tipo === tipo && c.nome.toLowerCase() === n.toLowerCase())) {
      setAviso("Você já tem uma categoria com esse nome e tipo.");
      return;
    }
    try {
      await addDoc(caminho(uid, "categorias"), { nome: n, tipo, criadoEm: serverTimestamp() });
      setNome("");
    } catch (err) {
      setAviso(msgErro(err));
    }
  }

  const excluir = (id) =>
    deleteDoc(doc(caminho(uid, "categorias"), id)).catch((e) => setAviso(msgErro(e)));

  return (
    <section className="bloco">
      <h2>Minhas categorias</h2>
      <form onSubmit={adicionar}>
        <div className="linha">
          <input
            type="text" placeholder="Nome da categoria" maxLength={30} required
            value={nome} onChange={(e) => setNome(e.target.value)}
          />
          <select aria-label="Tipo da categoria" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </select>
        </div>
        <button type="submit">Adicionar categoria</button>
      </form>
      <ul className="lista">
        {categorias.length === 0 && <li className="vazio">Nenhuma categoria. Crie a primeira acima.</li>}
        {categorias.map((c) => (
          <li key={c.id} className="item cat">
            <div>
              <span>{c.nome}</span>
              <small>{c.tipo === "despesa" ? "Despesa" : "Receita"}</small>
            </div>
            <button
              type="button" className="remover"
              aria-label={`Excluir categoria ${c.nome}`} onClick={() => excluir(c.id)}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
