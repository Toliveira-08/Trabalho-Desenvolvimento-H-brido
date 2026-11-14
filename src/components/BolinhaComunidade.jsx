import { useEffect, useRef, useState } from "react";

const TAM = 56;
const MARGEM = 8;
const CHAVE = "bolinha-comunidade";

const limitar = (v, min, max) => Math.min(Math.max(v, min), max);

function posicaoSalva() {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE));
    if (s && (s.lado === "left" || s.lado === "right") && typeof s.y === "number") return s;
  } catch {
    /* sem localStorage: usa a posição padrão */
  }
  return { lado: "right", y: Math.round(window.innerHeight * 0.55) };
}

// Bolinha flutuante: arraste para mover (ela gruda na lateral); clique para abrir a comunidade
export default function BolinhaComunidade({ onAbrir }) {
  const [pos, setPos] = useState(posicaoSalva);
  const [arrasto, setArrasto] = useState(null); // {x, y} enquanto arrasta
  const [tela, setTela] = useState({ w: window.innerWidth, h: window.innerHeight });
  const g = useRef({ ativo: false, moveu: false, dx: 0, dy: 0, x0: 0, y0: 0 });

  useEffect(() => {
    const aoRedimensionar = () => setTela({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, []);

  const yMax = tela.h - TAM - MARGEM;
  const left = arrasto ? arrasto.x : pos.lado === "left" ? MARGEM : tela.w - TAM - MARGEM;
  const top = limitar(arrasto ? arrasto.y : pos.y, MARGEM, yMax);

  function aoPressionar(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = e.currentTarget.getBoundingClientRect();
    g.current = { ativo: true, moveu: false, dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY };
  }

  function aoMover(e) {
    const d = g.current;
    if (!d.ativo) return;
    if (!d.moveu && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 6) return; // ainda é um clique
    d.moveu = true;
    setArrasto({
      x: limitar(e.clientX - d.dx, 0, tela.w - TAM),
      y: limitar(e.clientY - d.dy, MARGEM, yMax),
    });
  }

  function aoSoltar(e) {
    const d = g.current;
    if (!d.ativo) return;
    d.ativo = false;
    if (!d.moveu) return;
    // Gruda na lateral mais próxima
    const centro = e.clientX - d.dx + TAM / 2;
    const nova = { lado: centro < tela.w / 2 ? "left" : "right", y: limitar(e.clientY - d.dy, MARGEM, yMax) };
    setPos(nova);
    setArrasto(null);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(nova));
    } catch {
      /* ignora */
    }
  }

  function aoClicar() {
    // Depois de arrastar, o navegador dispara um "click": ignoramos esse
    if (g.current.moveu) {
      g.current.moveu = false;
      return;
    }
    onAbrir();
  }

  return (
    <button
      type="button"
      className={`bolinha${arrasto ? " arrastando" : ""}`}
      style={{ left, top }}
      aria-label="Abrir a comunidade (arraste para mover a bolinha)"
      title="Comunidade"
      onPointerDown={aoPressionar}
      onPointerMove={aoMover}
      onPointerUp={aoSoltar}
      onPointerCancel={aoSoltar}
      onClick={aoClicar}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.6-.8L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z" />
      </svg>
    </button>
  );
}
