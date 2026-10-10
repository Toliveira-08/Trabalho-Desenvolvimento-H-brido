import { useState } from "react";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail, signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import { msgErro } from "../utils";

export default function Auth({ ignorarLogin }) {
  const [modo, setModo] = useState("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");

  const criar = modo === "criar";

  function trocarModo(novo) {
    setModo(novo);
    setErro("");
    setConfirmar("");
  }

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    try {
      if (criar) {
        if (senha !== confirmar) {
          setErro("As senhas não coincidem. Digite novamente.");
          return;
        }
        ignorarLogin.current = true;
        await createUserWithEmailAndPassword(auth, email.trim(), senha);
        await signOut(auth);
        ignorarLogin.current = false;
        alert("Conta criada com sucesso! Por favor, faça o login.");
        setSenha("");
        trocarModo("entrar");
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), senha);
      }
    } catch (err) {
      ignorarLogin.current = false;
      setErro(msgErro(err));
    }
  }

  async function esqueciSenha() {
    setErro("");
    if (!email.trim()) {
      setErro("Digite o seu e-mail acima para redefinir a senha.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      alert(`E-mail de redefinição enviado para ${email.trim()}! Verifique a caixa de entrada e o spam.`);
    } catch (err) {
      setErro(msgErro(err));
    }
  }

  return (
    <main className="app auth">
      <h1>Meus gastos</h1>
      <p className="sub">Entre ou crie sua conta para ver seus lançamentos.</p>
      <section className="bloco">
        <div className="abas" role="tablist">
          <button type="button" role="tab" aria-selected={!criar} onClick={() => trocarModo("entrar")}>
            Entrar
          </button>
          <button type="button" role="tab" aria-selected={criar} onClick={() => trocarModo("criar")}>
            Criar conta
          </button>
        </div>
        <form onSubmit={enviar}>
          <input
            type="email" placeholder="E-mail" autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password" placeholder="Senha (mínimo 6 caracteres)" minLength={6} required
            autoComplete={criar ? "new-password" : "current-password"}
            value={senha} onChange={(e) => setSenha(e.target.value)}
          />
          {criar ? (
            <input
              type="password" placeholder="Confirmar senha" minLength={6} required
              autoComplete="new-password"
              value={confirmar} onChange={(e) => setConfirmar(e.target.value)}
            />
          ) : (
            <button type="button" className="link" onClick={esqueciSenha}>
              Esqueci minha senha
            </button>
          )}
          <p className="erro" role="alert">{erro}</p>
          <button type="submit">{criar ? "Criar conta" : "Entrar"}</button>
        </form>
      </section>
    </main>
  );
}
