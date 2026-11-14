import { useEffect, useMemo, useState } from "react";
import { ref, onValue, push, set, remove, serverTimestamp } from "firebase/database";
import { rtdb } from "../firebase";
import { msgErro } from "../utils";

const lista = (obj) => Object.entries(obj || {}).map(([id, v]) => ({ id, ...v }));

/*
  Estrutura no Realtime Database:
  forum/posts/{postId}              -> { titulo, texto?, autorUid, autorEmail, criadoEm }
  forum/votos/{postId}/{uid}        -> 1 | -1
  forum/comentarios/{postId}/{id}   -> { texto, autorUid, autorEmail, criadoEm }
*/
export function useForum(user, setAviso) {
  const [postsBrutos, setPostsBrutos] = useState(null); // null = carregando
  const [votos, setVotos] = useState({});
  const [comentarios, setComentarios] = useState({});

  useEffect(() => {
    const erro = (e) => setAviso(msgErro(e));
    const cancelar = [
      onValue(ref(rtdb, "forum/posts"), (s) => setPostsBrutos(lista(s.val())), erro),
      onValue(ref(rtdb, "forum/votos"), (s) => setVotos(s.val() || {}), erro),
      onValue(ref(rtdb, "forum/comentarios"), (s) => setComentarios(s.val() || {}), erro),
    ];
    return () => cancelar.forEach((off) => off());
  }, [setAviso]);

  const posts = useMemo(
    () =>
      (postsBrutos || []).map((p) => {
        const v = votos[p.id] || {};
        return {
          ...p,
          score: Object.values(v).reduce((a, b) => a + b, 0),
          meuVoto: v[user.uid] || 0,
          nComentarios: Object.keys(comentarios[p.id] || {}).length,
        };
      }),
    [postsBrutos, votos, comentarios, user.uid]
  );

  const comentariosDe = (postId) =>
    lista(comentarios[postId]).sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0));

  // Executa uma operação e mostra o erro (se houver). Retorna true/false.
  async function tentar(fn) {
    setAviso("");
    try {
      await fn();
      return true;
    } catch (e) {
      setAviso(msgErro(e));
      return false;
    }
  }

  const autor = { autorUid: user.uid, autorEmail: user.email };

  return {
    carregando: postsBrutos === null,
    posts,
    comentariosDe,
    publicar: (titulo, texto) =>
      tentar(() =>
        push(ref(rtdb, "forum/posts"), {
          titulo, ...(texto ? { texto } : {}), ...autor, criadoEm: serverTimestamp(),
        })
      ),
    apagarPost: (id) => tentar(() => remove(ref(rtdb, `forum/posts/${id}`))),
    // Clicar no mesmo voto de novo remove o voto
    votar: (id, atual, novo) => {
      const r = ref(rtdb, `forum/votos/${id}/${user.uid}`);
      return tentar(() => (atual === novo ? remove(r) : set(r, novo)));
    },
    comentar: (postId, texto) =>
      tentar(() =>
        push(ref(rtdb, `forum/comentarios/${postId}`), { texto, ...autor, criadoEm: serverTimestamp() })
      ),
    apagarComentario: (postId, comId) =>
      tentar(() => remove(ref(rtdb, `forum/comentarios/${postId}/${comId}`))),
  };
}
