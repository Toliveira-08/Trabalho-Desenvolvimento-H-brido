import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Auth from "./components/Auth.jsx";
import Painel from "./components/Painel.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);
  // Evita o "piscar" da tela ao criar conta (cria, desloga e pede login)
  const ignorarLogin = useRef(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        if (ignorarLogin.current) return;
        setUser(u);
        setCarregando(false);
      }),
    []
  );

  if (carregando) return null;
  return user ? <Painel user={user} /> : <Auth ignorarLogin={ignorarLogin} />;
}
