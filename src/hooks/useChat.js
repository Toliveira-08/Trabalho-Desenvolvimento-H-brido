import { useEffect, useState } from "react";
import { ref, query, limitToLast, onValue, push, update, serverTimestamp } from "firebase/database";
import { rtdb } from "../firebase";
import { idDaConversa, msgErro } from "../utils";

// user = quem está logado | outro = { uid, email } de quem recebe
export function useChat(user, outro, setAviso) {
  const [mensagens, setMensagens] = useState([]);
  const chatId = idDaConversa(user.uid, outro.uid);

  // RECEBER: escuta as últimas 100 mensagens em tempo real
  useEffect(() => {
    const q = query(ref(rtdb, `chats/${chatId}/mensagens`), limitToLast(100));
    return onValue(
      q,
      (snap) => {
        const lista = [];
        snap.forEach((filho) => {
          lista.push({ id: filho.key, ...filho.val() });
        });
        setMensagens(lista);
      },
      (e) => setAviso(msgErro(e))
    );
  }, [chatId, setAviso]);

  // ENVIAR: grava a mensagem e atualiza a caixa de entrada dos dois, tudo de uma vez
  async function enviar(texto) {
    const msgId = push(ref(rtdb, `chats/${chatId}/mensagens`)).key;
    const resumo = texto.slice(0, 80);
    const agora = serverTimestamp();
    try {
      await update(ref(rtdb), {
        [`chats/${chatId}/mensagens/${msgId}`]: { uid: user.uid, texto, criadoEm: agora },
        [`userChats/${user.uid}/${chatId}`]: { comUid: outro.uid, comEmail: outro.email, ultima: resumo, atualizadoEm: agora },
        [`userChats/${outro.uid}/${chatId}`]: { comUid: user.uid, comEmail: user.email, ultima: resumo, atualizadoEm: agora },
      });
      return true;
    } catch (e) {
      setAviso(msgErro(e));
      return false;
    }
  }

  return { mensagens, enviar };
}