export const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const ERROS = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/invalid-email": "E-mail inválido.",
  "auth/email-already-in-use": "Este e-mail já tem cadastro. Use a aba Entrar.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo.",
  "auth/network-request-failed": "Sem conexão. Verifique sua internet.",
  "permission-denied": "Sem permissão. Confira as regras do Firestore.",
};

export const msgErro = (e) => ERROS[e.code] || "Algo deu errado. Tente novamente.";

// Data local no formato AAAA-MM-DD
export function hoje() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export const mesAtual = () => hoje().slice(0, 7);
