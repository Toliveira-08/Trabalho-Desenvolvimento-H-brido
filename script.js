import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, collection, addDoc, deleteDoc, doc, query, where, orderBy,
  onSnapshot, writeBatch, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* ============ 1) COLE AQUI A CONFIGURAÇÃO DO SEU PROJETO FIREBASE ============ */
const firebaseConfig = {
  apiKey: "AIzaSyDaYUTvG_pmdjFF-RKuhgGYuTQxxuFVAK4",
  authDomain: "controle-de-gastos-dh-7a4e7.firebaseapp.com",
  projectId: "controle-de-gastos-dh-7a4e7",
  storageBucket: "controle-de-gastos-dh-7a4e7.firebasestorage.app",
  messagingSenderId: "718649884365",
  appId: "1:718649884365:web:74a76d80c8196d508bf384"
};
/* =============================================================================== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const CATEGORIAS_PADRAO = [
  ["Alimentação", "despesa"], ["Moradia", "despesa"], ["Transporte", "despesa"],
  ["Saúde", "despesa"], ["Lazer", "despesa"], ["Salário", "receita"], ["Extra", "receita"],
];

const $ = (id) => document.getElementById(id);
const el = (tag, cls, txt) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt !== undefined) e.textContent = txt;
  return e;
};
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const ERROS = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/invalid-email": "E-mail inválido.",
  "auth/email-already-in-use": "Este e-mail já tem cadastro. Use a aba Entrar.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo.",
  "auth/network-request-failed": "Sem conexão. Verifique sua internet.",
  "permission-denied": "Sem permissão. Confira as regras do Firestore.",
};
const msgErro = (e) => ERROS[e.code] || "Algo deu errado. Tente novamente.";

/* ---------------- estado ---------------- */
let uid = null;
let categorias = [];
let lancamentos = [];
let semeado = false;
let cancelar = []; // funções para parar os listeners

const caminho = (nome) => collection(db, "usuarios", uid, nome);

/* ---------------- autenticação ---------------- */
let modo = "entrar";

const campoConfirmarSenha = $("confirmar-senha");
const btnEsqueciSenha = $("esqueci-senha");

document.querySelectorAll(".abas button").forEach((b) =>
  b.addEventListener("click", () => {
    modo = b.dataset.modo;
    document.querySelectorAll(".abas button").forEach((x) =>
      x.setAttribute("aria-selected", String(x === b))
    );
    $("auth-botao").textContent = modo === "criar" ? "Criar conta" : "Entrar";
    $("senha").autocomplete = modo === "criar" ? "new-password" : "current-password";
    $("auth-erro").textContent = "";

    // Exibe ou oculta os campos de acordo com a aba selecionada
    if (modo === "criar") {
      campoConfirmarSenha.hidden = false;
      campoConfirmarSenha.required = true;
      if (btnEsqueciSenha) btnEsqueciSenha.hidden = true;
    } else {
      campoConfirmarSenha.hidden = true;
      campoConfirmarSenha.required = false;
      campoConfirmarSenha.value = "";
      if (btnEsqueciSenha) btnEsqueciSenha.hidden = false;
    }
  })
);

$("form-auth").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("auth-erro").textContent = "";
  const email = $("email").value.trim();
  const senha = $("senha").value;
  const confirmarSenha = campoConfirmarSenha.value;

  try {
    if (modo === "criar") {
      // Validação no cliente: verifica se as senhas coincidem
      if (senha !== confirmarSenha) {
        $("auth-erro").textContent = "As senhas não coincidem. Digite novamente.";
        return;
      }
      await createUserWithEmailAndPassword(auth, email, senha);
    } else {
      await signInWithEmailAndPassword(auth, email, senha);
    }
  } catch (err) {
    $("auth-erro").textContent = msgErro(err);
  }
});

$("sair").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  cancelar.forEach((f) => f());
  cancelar = [];
  categorias = [];
  lancamentos = [];
  semeado = false;

  if (user) {
    uid = user.uid;
    $("usuario-email").textContent = user.email;
    $("tela-auth").hidden = true;
    $("tela-app").hidden = false;
    iniciar();
  } else {
    uid = null;
    $("form-auth").reset();
    $("tela-app").hidden = true;
    $("tela-auth").hidden = false;
  }
});

/* ---------------- dados em tempo real ---------------- */
function iniciar() {
  cancelar.push(
    onSnapshot(
      query(caminho("categorias"), orderBy("nome")),
      (snap) => {
        // Primeiro acesso: cria categorias iniciais para a conta nova
        if (snap.empty && !snap.metadata.fromCache && !semeado) {
          semeado = true;
          const lote = writeBatch(db);
          CATEGORIAS_PADRAO.forEach(([nome, tipo]) =>
            lote.set(doc(caminho("categorias")), { nome, tipo, criadoEm: serverTimestamp() })
          );
          lote.commit().catch(mostrarErro);
        }
        categorias = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        renderCategorias();
        preencherSelect();
      },
      mostrarErro
    )
  );
  assinarLancamentos();
}

function assinarLancamentos() {
  if (!uid) return;
  const mes = $("mes").value; // AAAA-MM
  const q = query(
    caminho("lancamentos"),
    where("data", ">=", `${mes}-01`),
    where("data", "<=", `${mes}-31`),
    orderBy("data", "desc")
  );
  if (cancelar.length > 1) cancelar.pop()();
  cancelar.push(
    onSnapshot(
      q,
      (snap) => {
        lancamentos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        renderLancamentos();
      },
      mostrarErro
    )
  );
}

function mostrarErro(e) {
  $("aviso").textContent = msgErro(e);
}

/* ---------------- CRUD 1: lançamentos ---------------- */
const tipoAtual = () => document.querySelector('input[name="tipo"]:checked').value;

function preencherSelect() {
  const sel = $("categoria");
  sel.replaceChildren();
  const lista = categorias.filter((c) => c.tipo === tipoAtual());
  if (!lista.length) {
    const op = el("option", "", "Crie uma categoria abaixo");
    op.value = "";
    sel.appendChild(op);
    return;
  }
  lista.forEach((c) => {
    const op = el("option", "", c.nome);
    op.value = c.nome;
    sel.appendChild(op);
  });
}

document.querySelectorAll('input[name="tipo"]').forEach((r) =>
  r.addEventListener("change", preencherSelect)
);

$("form-lanc").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("aviso").textContent = "";
  const valor = parseFloat($("valor").value);
  if (!(valor > 0) || !$("categoria").value) return;
  try {
    await addDoc(caminho("lancamentos"), {
      tipo: tipoAtual(),
      descricao: $("descricao").value.trim(),
      valor,
      data: $("data").value,
      categoria: $("categoria").value,
      criadoEm: serverTimestamp(),
    });
    const mesNovo = $("data").value.slice(0, 7);
    $("descricao").value = "";
    $("valor").value = "";
    $("descricao").focus();
    if (mesNovo !== $("mes").value) {
      $("mes").value = mesNovo;
      assinarLancamentos();
    }
  } catch (err) {
    mostrarErro(err);
  }
});

function renderLancamentos() {
  const soma = (t) => lancamentos.filter((l) => l.tipo === t).reduce((s, l) => s + l.valor, 0);
  const receitas = soma("receita");
  const despesas = soma("despesa");
  $("receitas").textContent = moeda.format(receitas);
  $("despesas").textContent = moeda.format(despesas);
  $("saldo").textContent = moeda.format(receitas - despesas);

  // por categoria
  const box = $("resumo-cat");
  box.replaceChildren();
  const por = {};
  lancamentos
    .filter((l) => l.tipo === "despesa")
    .forEach((l) => (por[l.categoria] = (por[l.categoria] || 0) + l.valor));
  const ordenado = Object.entries(por).sort((a, b) => b[1] - a[1]);
  if (!ordenado.length) box.appendChild(el("p", "vazio", "Nenhuma despesa neste mês."));
  ordenado.forEach(([nome, valor]) => {
    const pct = (valor / despesas) * 100;
    const topo = el("div", "cat-topo");
    topo.append(el("span", "", nome), el("span", "", `${moeda.format(valor)} (${pct.toFixed(0)}%)`));
    const barra = el("div", "barra");
    const fill = document.createElement("i");
    fill.style.width = `${pct}%`;
    barra.appendChild(fill);
    const bloco = el("div");
    bloco.append(topo, barra);
    box.appendChild(bloco);
  });

  // lista
  const ul = $("lista-lanc");
  ul.replaceChildren();
  if (!lancamentos.length) {
    ul.appendChild(el("li", "vazio", "Nada por aqui ainda. Adicione o primeiro lançamento acima."));
    return;
  }
  lancamentos.forEach((l) => {
    const li = el("li", "item");
    const info = el("div");
    const [a, m, d] = l.data.split("-");
    info.append(el("span", "", l.descricao), el("small", "", `${l.categoria} • ${d}/${m}/${a}`));
    const valor = el("span", `valor ${l.tipo}`, (l.tipo === "despesa" ? "− " : "+ ") + moeda.format(l.valor));
    const btn = el("button", "remover", "Excluir");
    btn.type = "button";
    btn.setAttribute("aria-label", `Excluir ${l.descricao}`);
    btn.addEventListener("click", () =>
      deleteDoc(doc(caminho("lancamentos"), l.id)).catch(mostrarErro)
    );
    li.append(info, valor, btn);
    ul.appendChild(li);
  });
}

/* ---------------- CRUD 2: categorias ---------------- */
$("form-cat").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("aviso").textContent = "";
  const nome = $("cat-nome").value.trim();
  const tipo = $("cat-tipo").value;
  if (!nome) return;
  if (categorias.some((c) => c.tipo === tipo && c.nome.toLowerCase() === nome.toLowerCase())) {
    $("aviso").textContent = "Você já tem uma categoria com esse nome e tipo.";
    return;
  }
  try {
    await addDoc(caminho("categorias"), { nome, tipo, criadoEm: serverTimestamp() });
    $("cat-nome").value = "";
  } catch (err) {
    mostrarErro(err);
  }
});

function renderCategorias() {
  const ul = $("lista-cat");
  ul.replaceChildren();
  if (!categorias.length) {
    ul.appendChild(el("li", "vazio", "Nenhuma categoria. Crie a primeira acima."));
    return;
  }
  categorias.forEach((c) => {
    const li = el("li", "item cat");
    const info = el("div");
    info.append(el("span", "", c.nome), el("small", "", c.tipo === "despesa" ? "Despesa" : "Receita"));
    const btn = el("button", "remover", "Excluir");
    btn.type = "button";
    btn.setAttribute("aria-label", `Excluir categoria ${c.nome}`);
    btn.addEventListener("click", () =>
      deleteDoc(doc(caminho("categorias"), c.id)).catch(mostrarErro)
    );
    li.append(info, btn);
    ul.appendChild(li);
  });
}

/* ---------------- início ---------------- */
const d = new Date();
d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
$("data").value = d.toISOString().slice(0, 10);
$("mes").value = d.toISOString().slice(0, 7);
$("mes").addEventListener("change", assinarLancamentos);

/* ---------------- redefinição de senha ---------------- */
if (btnEsqueciSenha) {
  btnEsqueciSenha.addEventListener("click", async (e) => {
    e.preventDefault();
    $("auth-erro").textContent = "";

    const email = $("email").value.trim();

    if (!email) {
      $("auth-erro").textContent = "Digite o seu e-mail acima para redefinir a senha.";
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert(`E-mail de redefinição enviado para ${email}! Verifique a sua caixa de entrada e spam.`);
    } catch (err) {
      $("auth-erro").textContent = msgErro(err);
    }
  });
}
