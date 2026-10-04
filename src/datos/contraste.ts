/** Contraste WCAG 2.1 entre dos colores #RRGGBB. Se usa al compilar (en la plantilla) y en las demos. */
const lin = (c: number) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

export function luminancia(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

export function contraste(a: string, b: string) {
  const x = luminancia(a), y = luminancia(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** «7,7:1» en español, «7.7:1» en inglés. */
export const formatoRatio = (r: number, lang: 'en' | 'es') => `${r.toFixed(1).replace('.', lang === 'es' ? ',' : '.')}:1`;
