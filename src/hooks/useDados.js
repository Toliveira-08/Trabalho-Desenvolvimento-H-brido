import { useEffect, useRef, useState } from "react";
import {
  collection, query, where, orderBy, onSnapshot,
  writeBatch, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { msgErro } from "../utils";

export const CATEGORIAS_PADRAO = [
  ["Alimentação", "despesa"], ["Moradia", "despesa"], ["Transporte", "despesa"],
  ["Saúde", "despesa"], ["Lazer", "despesa"], ["Salário", "receita"], ["Extra", "receita"],
];

// Caminho dos dados privados do usuário: usuarios/{uid}/{nome}
export const caminho = (uid, nome) => collection(db, "usuarios", uid, nome);

// Escuta categorias e lançamentos do mês em tempo real
export function useDados(uid, mes, setAviso) {
  const [categorias, setCategorias] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);
  const semeado = useRef(false);

  useEffect(() => {
    semeado.current = false;
    const q = query(caminho(uid, "categorias"), orderBy("nome"));
    return onSnapshot(
      q,
      (snap) => {
        // Primeiro acesso: cria as categorias iniciais da conta
        if (snap.empty && !snap.metadata.fromCache && !semeado.current) {
          semeado.current = true;
          const lote = writeBatch(db);
          CATEGORIAS_PADRAO.forEach(([nome, tipo]) =>
            lote.set(doc(caminho(uid, "categorias")), { nome, tipo, criadoEm: serverTimestamp() })
          );
          lote.commit().catch((e) => setAviso(msgErro(e)));
        }
        setCategorias(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (e) => setAviso(msgErro(e))
    );
  }, [uid, setAviso]);

  useEffect(() => {
    const q = query(
      caminho(uid, "lancamentos"),
      where("data", ">=", `${mes}-01`),
      where("data", "<=", `${mes}-31`),
      orderBy("data", "desc")
    );
    return onSnapshot(
      q,
      (snap) => setLancamentos(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => setAviso(msgErro(e))
    );
  }, [uid, mes, setAviso]);

  return { categorias, lancamentos };
}
