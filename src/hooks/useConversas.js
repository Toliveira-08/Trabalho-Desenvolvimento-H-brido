import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase";
import { msgErro } from "../utils";

// Caixa de entrada: lê userChats/{meuUid} em tempo real
export function useConversas(uid, setAviso) {
  const [conversas, setConversas] = useState(null); // null = ainda carregando

  useEffect(() => {
    return onValue(
      ref(rtdb, `userChats/${uid}`),
      (snap) => {
        const lista = [];
        snap.forEach((filho) => {
          lista.push({ id: filho.key, ...filho.val() });
        });
        // Mais recentes primeiro
        lista.sort((a, b) => (b.atualizadoEm || 0) - (a.atualizadoEm || 0));
        setConversas(lista);
      },
      (e) => setAviso(msgErro(e))
    );
  }, [uid, setAviso]);

  return { conversas: conversas || [], carregando: conversas === null };
}
