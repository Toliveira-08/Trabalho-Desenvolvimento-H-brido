export default function Votos({ score, meuVoto, onVotar }) {
  return (
    <div className="votos">
      <button type="button" className="cima" aria-label="Voto positivo" aria-pressed={meuVoto === 1} onClick={() => onVotar(1)}>▲</button>
      <span>{score}</span>
      <button type="button" className="baixo" aria-label="Voto negativo" aria-pressed={meuVoto === -1} onClick={() => onVotar(-1)}>▼</button>
    </div>
  );
}
