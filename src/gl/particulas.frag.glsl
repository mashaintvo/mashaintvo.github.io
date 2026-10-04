uniform sampler2D uAtlas;
uniform float uAtlasCols;

varying float vGlyph;
varying float vMix;
varying float vLum;
varying float vAlpha;
varying vec3 vCode;
varying vec3 vDesign;

void main() {
  vec2 pc = gl_PointCoord;

  // Código: el glifo que le toca, tomado del atlas.
  vec2 cell = vec2(mod(vGlyph, uAtlasCols), floor(vGlyph / uAtlasCols));
  float glyph = texture2D(uAtlas, vec2((cell.x + pc.x) / uAtlasCols, 1.0 - (cell.y + pc.y) / uAtlasCols)).a;
  // A 6–10 px los mipmaps promedian el trazo y el glifo se apaga: se le
  // devuelve el contraste.
  glyph = smoothstep(0.04, 0.42, glyph);

  // Diseño: una gota de pintura suave.
  float r = length(pc - 0.5);
  float drop = smoothstep(0.5, 0.05, r);

  float shape = mix(glyph, drop * drop, vMix);
  vec3 color = mix(vCode, vDesign, vMix);
  float a = shape * mix(0.16 + 0.84 * pow(vLum, 1.05), 0.42, vMix) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(color, a);
  #include <colorspace_fragment>
}
