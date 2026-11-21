import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { nomeDe, tempoAtras } from "../utils";

export default function ChatPrivado({ user, outro, voltar }) {
  const [aviso, setAviso] = useState("");
  const [texto, setTexto] = useState("");
  const { mensagens, enviar } = useChat(user, outro, setAviso);
  const fimRef = useRef(null);

  // Sempre que chega mensagem nova, rola até a última
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [mensagens]);

  async function aoEnviar(e) {
    e.preventDefault();
    const t = texto.trim();
    if (!t) return;
    setAviso("");
    if (await enviar(t)) setTexto("");
  }

  return (
    <main className="app">
      <header className="topo">
        <h1>{nomeDe(outro.email)}</h1>
        <button type="button" className="remover" onClick={voltar}>← Voltar</button>
      </header>

      <p className="erro" role="alert">{aviso}</p>

      <section className="bloco">
        <ul className="chat-mensagens">
          {mensagens.length === 0 && <li className="vazio">Nenhuma mensagem ainda. Diga olá!</li>}
          {mensagens.map((m) => (
            <li key={m.id} className={`balao ${m.uid === user.uid ? "minha" : "dele"}`}>
              <p>{m.texto}</p>
              <small>{tempoAtras(m.criadoEm)}</small>
            </li>
          ))}
          <li ref={fimRef} aria-hidden="true" />
        </ul>

        <form className="chat-form" onSubmit={aoEnviar}>
          <input
            type="text" placeholder="Escreva uma mensagem..." maxLength={500}
            value={texto} onChange={(e) => setTexto(e.target.value)}
          />
          <button type="submit">Enviar</button>
        </form>
      </section>
    </main>
  );
}
