import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import vertexShader from './particulas.vert.glsl?raw';
import fragmentShader from './particulas.frag.glsl?raw';
import type { Forma } from './formas';
import { crearAtlas } from './glifos';

import { CLAVES, estadoInicial, type EstadoMundo } from './estado';
export { estadoInicial, type EstadoMundo } from './estado';

/** Tonos 0 base · 1 acento · 2 claro · 3 rosa · 4 luz, por paleta. */
const PALETAS = [
  ['#B8A9E8', '#8EE3D3', '#FBF3EE', '#F3B0C3', '#FDF0A6'], // María (los pasteles de su monograma)
  ['#A9A6E3', '#4DFF4B', '#F4F4F6', '#A9A6E3', '#F4F4F6'], // Lúmina Tech (manual de marca)
  ['#8BB8C8', '#FF6B6B', '#F5F9FB', '#8BB8C8', '#2ECC71'], // Lúmina Campus (design system)
];

export interface OpcionesMundo {
  canvas: HTMLCanvasElement;
  state: EstadoMundo;
  /** Hasta 7 figuras de n × 4 (xyz + tono). La 0 es la de arranque. */
  formas: Forma[];
  n: number;
  /** Glifo de cada partícula y caracteres del atlas. Sin ellos: solo gotas. */
  glifo?: Float32Array;
  caracteres?: string[];
  /** Color de la foto para la cara de diseño del retrato (lineal, n × 3). */
  color?: Float32Array;
  /** Alto de un glifo en unidades del mundo. */
  fila?: number;
  /** Las figuras que deben quedar de frente (el retrato, el monograma, el símbolo). */
  deFrente?: number[];
  /** De dónde se lee el tamaño y el puntero: la ventana o un elemento. */
  marco?: HTMLElement;
  /** 0 código · 1 diseño. Fijo si `materialFijo`. */
  modo?: number;
  materialFijo?: boolean;
  lite: boolean;
  reducedMotion: boolean;
  fuenteGlifos?: string;
  /** El arranque escribe la figura 0 en su sitio, fila a fila (el retrato). */
  introEnSitio?: boolean;
  /** Ancho y alto de la figura 0 en unidades del mundo (para alinear el póster). */
  tamFigura0?: { w: number; h: number };
  /** Gotas de tamaños muy distintos y resplandor: el aspecto del motor de luminahub.com.co. */
  estiloLumina?: boolean;
  /** Avisa dónde dibujar el aro de la lupa (en píxeles del marco). */
  onLente?: (x: number, y: number, visible: boolean) => void;
}

export class Mundo {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private points: THREE.Points;
  private material: THREE.ShaderMaterial;
  private composer?: EffectComposer;
  private bloom?: UnrealBloomPass;
  private timer = new THREE.Timer();
  private view = { halfW: 6, halfH: 3.5, fit: 1, w: 1, h: 1 };
  private pointer = new THREE.Vector2(0, 0);
  private pointerSmooth = new THREE.Vector2(0, 0);
  private lens = new THREE.Vector2(9, 9);
  private raycaster = new THREE.Raycaster();
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private mouseWorld = new THREE.Vector3(99, 99, 0);
  private smooth: EstadoMundo;
  private morph = { from: 0, to: 0, t: 1, cola: null as number | null };
  private modo = 0;
  private velocity = 0;
  private hasPointer = false;
  private lastMove = 0;
  private rotAcc = 0;
  private running = false;
  private visible = true;
  private fila: number;
  private deFrente: Set<number>;
  private marco?: HTMLElement;
  private onLente?: OpcionesMundo['onLente'];
  readonly state: EstadoMundo;

  constructor(private opts: OpcionesMundo) {
    const { canvas, n, lite, reducedMotion } = opts;
    this.state = opts.state;
    this.smooth = estadoInicial();
    for (const key of CLAVES) this.smooth[key] = opts.state[key];
    this.fila = opts.fila ?? 0.055;
    this.deFrente = new Set(opts.deFrente ?? []);
    this.marco = opts.marco;
    this.onLente = opts.onLente;
    this.modo = opts.modo ?? 0;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    this.camera.position.set(0, 0, 13);

    const geometry = new THREE.BufferGeometry();
    for (let i = 0; i < 7; i++) {
      const f = opts.formas[Math.min(i, opts.formas.length - 1)];
      geometry.setAttribute(`aS${i}`, new THREE.BufferAttribute(f, 4));
    }
    // xyz del arranque + aleatorios por partícula. El retrato no llega desde
    // una nube: cada glifo cae en su sitio desde un poco más cerca de la
    // cámara, como si se escribiera encima de la foto.
    const scatter = new Float32Array(n * 3);
    const rand = new Float32Array(n * 4);
    const f0 = opts.formas[0];
    for (let i = 0; i < n; i++) {
      if (opts.introEnSitio) {
        scatter.set([f0[i * 4], f0[i * 4 + 1] + 0.04, f0[i * 4 + 2] + 0.6 + Math.random() * 0.8], i * 3);
      } else {
        const u = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2, r = 9 + Math.random() * 9;
        const s = Math.sqrt(1 - u * u);
        scatter.set([Math.cos(t) * s * r, u * r, Math.sin(t) * s * r - 4], i * 3);
      }
      // Glifos de tamaño casi parejo (texto); en el estilo Lúmina, la mezcla
      // de motas y luces grandes de su motor (0,45 + r³ · 1,6).
      const tam = opts.estiloLumina ? 0.45 + Math.pow(Math.random(), 3) * 1.6 : 0.92 + Math.random() * 0.2;
      rand.set([Math.random(), tam, Math.random(), Math.random()], i * 4);
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(scatter, 3));
    geometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));
    geometry.setAttribute('aGlyph', new THREE.BufferAttribute(opts.glifo ?? new Float32Array(n), 1));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(opts.color ?? new Float32Array(n * 3), 3));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);

    const caracteres = opts.caracteres ?? ['·'];
    const { canvas: atlasCanvas, cols } = crearAtlas(caracteres, opts.fuenteGlifos ?? '"Geist Mono Variable", ui-monospace, monospace');
    const atlas = new THREE.CanvasTexture(atlasCanvas);
    atlas.generateMipmaps = true;
    atlas.minFilter = THREE.LinearMipmapLinearFilter;
    atlas.magFilter = THREE.LinearFilter;
    atlas.anisotropy = 1;

    const pal = PALETAS.flat().map((h) => new THREE.Color(h));
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uFrom: { value: 0 },
        uTo: { value: 0 },
        uT: { value: 1 },
        uIntro: { value: reducedMotion ? 1 : 0 },
        uIntroRuido: { value: opts.introEnSitio ? 0.1 : 1 },
        uNoise: { value: 0 },
        uMotion: { value: reducedMotion ? 0 : 1 },
        uSize: { value: 10 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uAlpha: { value: 1 },
        uMode: { value: this.modo },
        uLensOn: { value: 0 },
        uLens: { value: 0.3 },
        uAspect: { value: 1 },
        uGlyphs: { value: caracteres.length },
        uPush: { value: 0 },
        uMouse: { value: this.lens },
        uMouseWorld: { value: this.mouseWorld },
        uPal: { value: pal },
        uPalW: { value: new THREE.Vector3(1, 0, 0) },
        uAtlas: { value: atlas },
        uAtlasCols: { value: cols },
      },
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    // Resplandor como el de luminahub.com.co (solo en ese estilo y con equipo de escritorio).
    if (opts.estiloLumina && !lite) {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.55, 0.0);
      this.composer.addPass(this.bloom);
      this.composer.addPass(new OutputPass());
    }

    this.resize();
    if (this.marco) new ResizeObserver(() => this.resize()).observe(this.marco);
    else window.addEventListener('resize', () => this.resize());

    const fuente: HTMLElement | Window = this.marco ?? window;
    fuente.addEventListener('pointermove', (e) => {
      const ev = e as PointerEvent;
      const r = this.rect();
      this.pointer.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      // En táctil no hay «pasar por encima»: el dedo no debe abrir un hueco en la figura.
      this.hasPointer = ev.pointerType === 'mouse';
      this.lastMove = performance.now();
    }, { passive: true });
    if (this.marco) this.marco.addEventListener('pointerleave', () => { this.hasPointer = false; });
    // El Timer se pausa solo cuando la pestaña no está visible.
    this.timer.connect(document);
  }

  private rect() {
    return this.marco ? this.marco.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
  }

  /** Cambia de figura. Si hay un cambio en curso, espera a que termine: nunca se ve una figura a medias. */
  setForma(i: number) {
    const m = this.morph;
    if (this.opts.reducedMotion) {
      m.from = m.to = i;
      m.t = 1;
      return;
    }
    if (m.t < 1) { m.cola = i; return; }
    if (i === m.to) return;
    m.from = m.to;
    m.to = i;
    m.t = 0;
  }

  get forma() { return this.morph.cola ?? this.morph.to; }

  /**
   * Dónde queda la figura 0 en pantalla (px), con el estado de destino, para
   * que el póster (la foto) coincida con el retrato de partículas.
   */
  rectFigura0() {
    const t = this.opts.tamFigura0;
    if (!t) return null;
    const v = this.view, s = this.state;
    const ppu = v.h / (2 * v.halfH);
    const sc = s.scale * v.fit;
    const cx = v.w / 2 + s.x * v.halfW * ppu, cy = v.h / 2 - s.y * v.halfH * ppu;
    const w = t.w * sc * ppu, h = t.h * sc * ppu;
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }

  /** 0 código · 1 diseño. */
  setModo(m: number) {
    if (!this.opts.materialFijo) this.modo = m;
  }

  /** Velocidad de scroll: agita un poco las partículas mientras se baja. */
  setVelocity(v: number) {
    this.velocity = v;
  }

  setVisible(v: boolean) {
    this.visible = v;
  }

  /** La nube inicial se recoge en la figura. */
  intro(duration = 2.4) {
    if (this.opts.reducedMotion) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const u = this.material.uniforms.uIntro;
      const start = performance.now();
      const step = () => {
        const t = Math.min(1, (performance.now() - start) / (duration * 1000));
        u.value = t;
        if (t < 1) requestAnimationFrame(step); else resolve();
      };
      step();
    });
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.renderer.setAnimationLoop((now) => this.tick(now));
  }

  private resize() {
    const r = this.rect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // En pantallas estrechas alejamos la cámara para que la figura no se salga.
    this.camera.position.z = w < 760 && !this.marco ? 15 : 13;
    this.camera.updateProjectionMatrix();
    const aspect = w / h;
    this.view.halfH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.position.z;
    this.view.halfW = this.view.halfH * aspect;
    this.view.fit = aspect < 0.9 ? 1 : THREE.MathUtils.clamp(aspect / 1.6, 0.7, 1);
    this.view.w = w;
    this.view.h = h;
    const u = this.material.uniforms;
    u.uAspect.value = aspect;
    u.uPixelRatio.value = this.renderer.getPixelRatio();
    this.composer?.setSize(w, h);
    this.bloom?.resolution.set(w, h);
  }

  private tick(now: number) {
    if (!this.visible) return;
    this.timer.update(now);
    const dt = Math.min(this.timer.getDelta(), 0.05);
    const t = this.timer.getElapsed();
    const u = this.material.uniforms;
    const motion = this.opts.reducedMotion ? 0 : 1;

    // Suavizado exponencial independiente del framerate. Solo las claves del
    // estado: GSAP le añade al objeto su propia caché (_gsap).
    const k = 1 - Math.pow(0.0015, dt);
    const s = this.smooth, target = this.state;
    for (const key of CLAVES) s[key] += (target[key] - s[key]) * k;

    // Cambio de figura por tiempo; si hay otro en cola, este termina más rápido.
    const m = this.morph;
    if (m.t < 1) m.t = Math.min(1, m.t + dt / (m.cola !== null ? 0.8 : 1.6));
    else if (m.cola !== null) {
      const c = m.cola;
      m.cola = null;
      if (c !== m.to) { m.from = m.to; m.to = c; m.t = 0; }
    }
    u.uFrom.value = m.from;
    u.uTo.value = m.to;
    u.uT.value = m.t;

    u.uMode.value += (this.modo - u.uMode.value) * (1 - Math.pow(0.02, dt));
    this.pointerSmooth.lerp(this.pointer, 1 - Math.pow(0.02, dt));

    u.uTime.value = t;
    u.uAlpha.value = s.alpha;
    u.uPalW.value.set(s.pM, s.pL, s.pC);
    const agitation = Math.min(Math.abs(this.velocity) * 0.01, 0.5) * motion;
    u.uNoise.value += (agitation - u.uNoise.value) * 0.08;

    const v = this.view;
    const scale = s.scale * v.fit;
    this.points.position.set(s.x * v.halfW, s.y * v.halfH, 0);
    this.points.scale.setScalar(scale);
    // El tamaño de un glifo sigue al de la figura: si no, al encoger se amontonan.
    u.uSize.value = this.fila * 1.08 * scale * v.h / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)));

    // Las figuras «de frente» se detienen en la vuelta completa más cercana.
    const ease = m.t * m.t * (3 - 2 * m.t);
    const front = (this.deFrente.has(m.from) ? 1 - ease : 0) + (this.deFrente.has(m.to) ? ease : 0);
    const TAU = Math.PI * 2;
    this.rotAcc += dt * 0.12 * (1 - front) * motion;
    if (front > 0) {
      const f = Math.round(this.rotAcc / TAU) * TAU;
      this.rotAcc += (f - this.rotAcc) * (1 - Math.pow(0.08, dt)) * front;
    }
    const sway = Math.sin(t * 0.32) * 0.1 * front * motion;
    this.points.rotation.y = (this.rotAcc + s.spin + sway) * motion + this.pointerSmooth.x * (0.18 + 0.14 * front);
    this.points.rotation.x = -this.pointerSmooth.y * 0.14 + Math.sin(t * 0.3) * 0.04 * motion * (1 - front);

    // Lupa: sigue al ratón; sin ratón (o quieto un rato) pasea sola por la cara.
    const idle = !this.hasPointer || now - this.lastMove > 3500;
    let lx = this.pointer.x, ly = this.pointer.y;
    if (idle) {
      // La cámara necesita su matriz al día antes de proyectar: en el primer
      // cuadro aún no ha renderizado y la proyección divide entre cero.
      this.camera.updateMatrixWorld();
      const c = this.points.position.clone().project(this.camera);
      // Recorre la cara, la mano y el cuello: que la cara también se vea en código.
      lx = c.x + Math.sin(t * 0.45) * 0.26 / v.w * v.h * motion;
      ly = c.y + (0.16 + Math.sin(t * 0.37) * 0.2 * motion) * scale;
    }
    const kl = 1 - Math.pow(idle ? 0.12 : 0.0005, dt);
    if (Number.isFinite(lx) && Number.isFinite(ly)) {
      this.lens.x += (lx - this.lens.x) * kl;
      this.lens.y += (ly - this.lens.y) * kl;
    }
    u.uLensOn.value = s.lente;
    u.uLens.value = 0.3;
    this.onLente?.((this.lens.x + 1) / 2 * v.w, (1 - this.lens.y) / 2 * v.h, s.lente > 0.5);

    // El cursor aparta las partículas: rayo contra el plano z = 0.
    this.raycaster.setFromCamera(this.pointerSmooth, this.camera);
    const hit = this.hasPointer && this.raycaster.ray.intersectPlane(this.plane, this.mouseWorld);
    u.uPush.value += ((hit ? s.empuje * motion : 0) - u.uPush.value) * 0.05;

    if (this.composer) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
  }
}

/** ¿Puede este navegador con WebGL? Si no, la página sigue entera, sin partículas. */
export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
