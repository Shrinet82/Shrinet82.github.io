import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { glassEntries } from './registry'

// A single full-screen pass that draws every registered DOM panel as liquid
// glass. The refraction model (shape-normal edge, rim and corner displacement,
// blur, vertical tint) is ported from dashersw/liquid-glass-js. Instead of one
// WebGL context per element sampling a frozen html2canvas screenshot, all
// panels share one pass that samples the live shader-gradient canvas.

const MAX = 32

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  #define MAX ${MAX}
  precision highp float;

  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform float uDpr;
  uniform int uCount;
  uniform vec4 uRects[MAX];   // x, y (bottom-left, device px), w, h
  uniform vec4 uParams[MAX];  // radius (device px), tint, dark, strength

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  vec3 sampleBlur(vec2 uv, float lod) {
    vec2 px = 1.0 / uRes;
    float o = exp2(lod) * 0.75;
    vec3 c = textureLod(uTex, uv, lod).rgb * 0.36;
    c += textureLod(uTex, uv + vec2( o,  0.0) * px, lod).rgb * 0.16;
    c += textureLod(uTex, uv + vec2(-o,  0.0) * px, lod).rgb * 0.16;
    c += textureLod(uTex, uv + vec2( 0.0,  o) * px, lod).rgb * 0.16;
    c += textureLod(uTex, uv + vec2( 0.0, -o) * px, lod).rgb * 0.16;
    return c;
  }

  void main() {
    vec2 frag = gl_FragCoord.xy;
    int hit = -1;
    float dHit = 0.0;
    vec2 pHit = vec2(0.0);
    vec2 halfHit = vec2(0.0);
    float rHit = 0.0;
    vec4 prm = vec4(0.0);
    float shadow = 0.0;

    for (int i = 0; i < MAX; i++) {
      if (i >= uCount) break;
      vec4 R = uRects[i];
      vec2 half_ = R.zw * 0.5;
      vec2 p = frag - (R.xy + half_);
      float r = min(uParams[i].x, min(half_.x, half_.y));
      float d = sdRoundBox(p, half_, r);
      if (d < 0.5 * uDpr) {
        hit = i; dHit = d; pHit = p; halfHit = half_; rHit = r; prm = uParams[i];
        break;
      }
      // Soft drop shadow, offset downward.
      float ds = sdRoundBox(p + vec2(0.0, 10.0 * uDpr), half_, r);
      shadow = max(shadow, exp(-max(ds, 0.0) / (22.0 * uDpr)) * 0.22);
    }

    if (hit < 0) {
      if (shadow < 0.004) discard;
      gl_FragColor = vec4(0.0, 0.0, 0.0, shadow);
      return;
    }

    // Outward shape normal from the SDF gradient.
    float e = 1.0;
    vec2 n = vec2(
      sdRoundBox(pHit + vec2(e, 0.0), halfHit, rHit) - sdRoundBox(pHit - vec2(e, 0.0), halfHit, rHit),
      sdRoundBox(pHit + vec2(0.0, e), halfHit, rHit) - sdRoundBox(pHit - vec2(0.0, e), halfHit, rHit)
    );
    n = length(n) > 0.0 ? normalize(n) : vec2(0.0, 1.0);

    float inside = max(-dHit, 0.0) / uDpr;   // CSS px from the edge
    float strength = prm.w;

    float edge = exp(-inside * 0.06);
    float rim = exp(-inside * 0.35);
    float base = 1.0 - exp(-inside * 0.012);

    // Corner boost: displacement grows where both axes are near an edge.
    vec2 toEdge = (halfHit - abs(pHit)) / uDpr;
    float corner = exp(-min(toEdge.x, toEdge.y) * 0.08) * exp(-max(toEdge.x, toEdge.y) * 0.02);

    float amount = (edge * 0.022 + rim * 0.045 + corner * 0.02 + base * 0.004) * strength;
    vec2 perp = vec2(-n.y, n.x);
    float ripple = sin(inside * 0.25) * 0.004 * rim * strength;
    vec2 disp = n * amount + perp * ripple;

    vec2 uv = frag / uRes;
    float lod = 3.2;
    // Chromatic split grows toward the rim.
    float ca = 0.006 * (edge + rim) * strength;
    vec3 col;
    col.r = sampleBlur(uv + disp * (1.0 + ca * 40.0), lod).r;
    col.g = sampleBlur(uv + disp, lod).g;
    col.b = sampleBlur(uv + disp * (1.0 - ca * 40.0), lod).b;

    // Vertical tint (light top, dimmer bottom) then darken for text contrast.
    float vy = clamp(0.5 - pHit.y / (2.0 * halfHit.y), 0.0, 1.0);
    vec3 tint = mix(vec3(1.0), vec3(0.72, 0.72, 0.8), vy);
    col = mix(col, tint, prm.y);
    col = mix(col, vec3(0.02, 0.015, 0.05), prm.z);

    // Specular rim: bright on the top-left, faint on the bottom-right.
    vec2 light = normalize(vec2(-0.55, 0.85));
    float spec = pow(max(dot(n, light), 0.0), 2.0) * rim * 0.55
               + pow(max(dot(n, -light), 0.0), 2.0) * rim * 0.18;
    col += spec;
    col += exp(-inside * 1.4) * 0.08; // hairline edge

    float alpha = clamp(0.5 - dHit / uDpr, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`

export default function GlassPass({ texture }: { texture: THREE.Texture }) {
  const { gl } = useThree()

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTex: { value: texture },
          uRes: { value: new THREE.Vector2(1, 1) },
          uDpr: { value: 1 },
          uCount: { value: 0 },
          uRects: { value: Array.from({ length: MAX }, () => new THREE.Vector4()) },
          uParams: { value: Array.from({ length: MAX }, () => new THREE.Vector4()) },
        },
      }),
    [texture],
  )

  useFrame(() => {
    const u = material.uniforms
    const dpr = gl.getPixelRatio()
    const vw = window.innerWidth
    const vh = window.innerHeight
    u.uDpr.value = dpr
    gl.getDrawingBufferSize(u.uRes.value)

    const visible = [...glassEntries]
      .map((g) => ({ g, r: g.el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && r.bottom > -40 && r.top < vh + 40 && r.right > 0 && r.left < vw)
      .sort((a, b) => b.g.priority - a.g.priority)
      .slice(0, MAX)

    visible.forEach(({ g, r }, i) => {
      u.uRects.value[i].set(r.left * dpr, (vh - r.bottom) * dpr, r.width * dpr, r.height * dpr)
      u.uParams.value[i].set(g.radius * dpr, g.tint, g.dark, g.strength)
    })
    u.uCount.value = visible.length
  })

  return (
    <mesh frustumCulled={false} renderOrder={1000} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
