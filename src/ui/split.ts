/**
 * Parte un texto en palabras sin romper su marcado: los <em> siguen siendo
 * <em> y los <br> se quedan. Cada palabra va dentro de una ventana (.w) para
 * que pueda entrar desde abajo. (Adaptado de luminahub-web/src/ui/split.ts.)
 */
export function splitWords(root: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = [];
  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const part of (child.textContent ?? '').split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.append(document.createTextNode(' '));
            continue;
          }
          const win = document.createElement('span');
          win.className = 'w';
          const word = document.createElement('span');
          word.className = 'w__i';
          word.textContent = part;
          win.append(word);
          frag.append(win);
          out.push(word);
        }
        child.replaceWith(frag);
      } else if (child instanceof HTMLElement && child.tagName !== 'BR' && !child.classList.contains('anot')) {
        walk(child);
      }
    }
  };
  walk(root);
  return out;
}

/**
 * Las letras de un enlace en sus dos roles: la sans que se ve y la serif
 * cursiva que aparece al pasar por encima, apiladas en la misma celda para
 * que el ancho no salte. El nombre accesible no cambia.
 */
export function letrasDobles(a: HTMLElement) {
  const texto = a.textContent?.trim() ?? '';
  if (!texto || a.dataset.letras) return;
  a.dataset.letras = '1';
  a.setAttribute('aria-label', texto);
  a.textContent = '';
  Array.from(texto).forEach((ch, i) => {
    const l = document.createElement('span');
    l.className = 'letra';
    l.setAttribute('aria-hidden', 'true');
    l.style.setProperty('--i', String(i));
    const c = ch === ' ' ? ' ' : ch;
    l.innerHTML = `<span>${c}</span><span>${c}</span>`;
    a.append(l);
  });
}
