import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Auth from "./components/Auth.jsx";
import Painel from "./components/Painel.jsx";
import Comunidade from "./components/Comunidade.jsx";
import BolinhaComunidade from "./components/BolinhaComunidade.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [tela, setTela] = useState("painel"); // "painel" | "comunidade"
  // Evita o "piscar" da tela ao criar conta (cria, desloga e pede login)
  const ignorarLogin = useRef(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        if (ignorarLogin.current) return;
        setUser(u);
        if (!u) setTela("painel");
        setCarregando(false);
      }),
    []
  );

  if (carregando) return null;
  if (!user) return <Auth ignorarLogin={ignorarLogin} />;

  if (tela === "comunidade") {
    return <Comunidade user={user} voltar={() => setTela("painel")} />;
  }

  return (
    <>
      <Painel user={user} />
      <BolinhaComunidade onAbrir={() => setTela("comunidade")} />
    </>
  );
}
