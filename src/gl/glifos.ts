/**
 * El atlas de glifos: cada carácter del código, una vez, en una rejilla.
 * Potencia de dos para poder usar mipmaps (los glifos se ven a 6–10 px), y
 * cada glifo con aire alrededor para que los niveles pequeños no se mezclen
 * con el vecino.
 */
export function crearAtlas(caracteres: string[], fuente: string) {
  const cols = caracteres.length <= 64 ? 8 : 16;
  const CELDA = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = cols * CELDA;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(CELDA * 0.8)}px ${fuente}`;
  caracteres.forEach((ch, i) => {
    ctx.fillText(ch, ((i % cols) + 0.5) * CELDA, (Math.floor(i / cols) + 0.5) * CELDA + CELDA * 0.03);
  });
  return { canvas, cols };
}
