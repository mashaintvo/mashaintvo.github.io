uniform float uTime;
uniform float uFrom;
uniform float uTo;
uniform float uT;
uniform float uIntro;
uniform float uIntroRuido;
uniform float uNoise;
uniform float uMotion;
uniform float uSize;
uniform float uPixelRatio;
uniform float uAlpha;
uniform float uMode;
uniform float uLensOn;
uniform float uLens;
uniform float uAspect;
uniform float uGlyphs;
uniform float uPush;
uniform vec2 uMouse;
uniform vec3 uMouseWorld;
uniform vec3 uPal[15];
uniform vec3 uPalW;

attribute vec4 aS0;
attribute vec4 aS1;
attribute vec4 aS2;
attribute vec4 aS3;
attribute vec4 aS4;
attribute vec4 aS5;
attribute vec4 aS6;
attribute vec4 aRand;
attribute float aGlyph;
attribute vec3 aColor;

varying float vGlyph;
varying float vMix;
varying float vLum;
varying float vAlpha;
varying vec3 vCode;
varying vec3 vDesign;

// Simplex 3D — Ian McEwan, Ashima Arts (MIT). Igual que en luminahub-web.
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float hash(float n) { return fract(sin(n) * 43758.5453); }

/* 0 retrato · 1 monograma · 2 símbolo de Lúmina · 3 red neuronal · 4 onda · 5 hélice · 6 nudo */
vec4 shapeAt(float i) {
  if (i < 0.5) return aS0;
  if (i < 1.5) return aS1;
  if (i < 2.5) return aS2;
  if (i < 3.5) return aS3;
  if (i < 4.5) return aS4;
  if (i < 5.5) return aS5;
  return aS6;
}

/* Tonos con significado (0 base · 1 acento · 2 claro · 3 rosa · 4 luz), y
   tres paletas que se mezclan: la de María, la de Lúmina Tech y la de Campus.
   Así el lima de Lúmina solo existe dentro de su caso. */
vec3 tone(float t) {
  int k = int(t + 0.5);
  return uPalW.x * uPal[k] + uPalW.y * uPal[k + 5] + uPalW.z * uPal[k + 10];
}

/* En el retrato, w = 10 + luminancia: la luz de la foto decide el color. */
float lumOf(vec4 s) { return s.w > 9.5 ? fract(s.w) : 0.6 + aRand.w * 0.35; }

vec3 codeOf(vec4 s) {
  if (s.w > 9.5) {
    float l = fract(s.w);
    return l < 0.5
      ? mix(uPal[0] * 0.55, uPal[1], smoothstep(0.05, 0.5, l))
      : mix(uPal[1], uPal[4], smoothstep(0.5, 0.9, l));
  }
  return tone(floor(s.w));
}

vec3 designOf(vec4 s) {
  if (s.w > 9.5) return mix(aColor * 1.25, uPal[3], 0.22) + uPal[0] * 0.05;
  return mix(tone(floor(s.w)), vec3(1.0), 0.12);
}

void main() {
  // Cada partícula sale con su propio retraso: el cambio de figura es una ola.
  float lf = smoothstep(0.0, 1.0, clamp((uT - aRand.x * 0.4) / 0.6, 0.0, 1.0));
  vec4 A = shapeAt(uFrom);
  vec4 B = shapeAt(uTo);
  vec3 pos = mix(A.xyz, B.xyz, lf);

  // Arranque: el retrato se escribe fila a fila, de arriba abajo, al paso
  // de la línea de escaneo que recorre la foto (main.ts la sincroniza).
  float yn = clamp(0.5 - A.y / 6.4, 0.0, 1.0);
  float li = smoothstep(0.0, 1.0, clamp((uIntro * 1.35 - yn - aRand.x * 0.08) / 0.27, 0.0, 1.0));
  pos = mix(position, pos, li);

  // A mitad de camino la partícula se suelta y remolinea. En la entrada del
  // retrato casi nada: cada glifo cae en su sitio, no viaja.
  float transit = max(sin(lf * 3.14159265), sin(li * 3.14159265) * 0.8 * uIntroRuido);
  // El retrato apenas respira: si se agita, deja de ser una cara.
  float still = (A.w > 9.5 ? 1.0 - lf : 0.0) + (B.w > 9.5 ? lf : 0.0);
  float t = uTime * 0.22;
  vec3 np = pos * 0.55 + vec3(0.0, 0.0, t);
  vec3 n = vec3(snoise(np), snoise(np + 17.3), snoise(np + 41.7));
  float amp = (mix(0.035, 0.01, still) + uNoise * (1.0 - still * 0.7) + transit * 0.85) * uMotion;
  pos += n * amp;

  vec4 world = modelMatrix * vec4(pos, 1.0);

  // Fuera del retrato, el cursor aparta las partículas.
  vec3 d = world.xyz - uMouseWorld;
  d.z *= 0.35;
  float push = smoothstep(1.6, 0.0, length(d)) * uPush * (1.0 - still);
  world.xyz += normalize(d + vec3(1e-4)) * push * 0.55;

  vec4 mv = viewMatrix * world;
  vec4 clip = projectionMatrix * mv;

  // La lupa de doble exposición: dentro, el otro rol.
  vec2 ndc = clip.xy / clip.w;
  vec2 dl = (ndc - uMouse) * vec2(uAspect, 1.0);
  float lens = (1.0 - smoothstep(uLens * 0.8, uLens, length(dl))) * uLensOn;
  vMix = mix(uMode, 1.0 - uMode, lens);

  // De vez en cuando un glifo cambia: el código se está escribiendo.
  float tick = floor(uTime * 6.0 + aRand.z * 40.0);
  float flick = step(0.986, hash(aRand.z * 91.7 + tick)) * uMotion;
  vGlyph = mod(aGlyph + flick * floor(hash(tick + aRand.z * 13.0) * uGlyphs), uGlyphs);

  vCode = mix(codeOf(A), codeOf(B), lf);
  vDesign = mix(designOf(A), designOf(B), lf);
  vLum = mix(lumOf(A), lumOf(B), lf);

  float designSize = 2.1 + vLum * 1.3;
  gl_PointSize = uSize * aRand.y * mix(1.0, designSize, vMix) * uPixelRatio / -mv.z;
  vAlpha = uAlpha * smoothstep(-30.0, -6.0, mv.z) * li;
  gl_Position = clip;
}
