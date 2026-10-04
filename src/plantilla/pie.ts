import { PERFIL } from '../datos/perfil';
import { externo, idioma, type Lang } from './util';

export function renderPie(lang: Lang) {
  const L = idioma(lang);
  return `
  <footer class="pie">
    <p class="pie__marca" data-pie-marca aria-hidden="true"><b>maría</b> <span class="grad">sanjuán</span></p>
    <div class="pie__fila">
      <p class="pie__creditos">${L('Designed and built by María with AI agents. Reviewed by María.', 'Diseñado y construido por María con agentes de IA. Revisado por María.')}</p>
      <ul class="pie__redes">
        <li>${externo(PERFIL.linkedin, 'LinkedIn', L)}</li>
        <li>${externo(PERFIL.github, 'GitHub', L)}</li>
        <li>${externo(PERFIL.behance, 'Behance', L)}</li>
      </ul>
      <p class="pie__legal">© 2026 ${PERFIL.nombreCompleto}</p>
    </div>
  </footer>`;
}
