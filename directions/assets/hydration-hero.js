/**
 * Hydration · period. — interactive 3D liquid sculpture.
 *
 * Renders three refractive water-blobs using Three.js loaded via ESM CDN —
 * one central main blob and two smaller satellites orbiting around it.
 * Maps to the "three ingredients. nothing else." brand thesis without
 * ever stating it (per brand-voice.md: never explain visual signatures).
 *
 * Lazy-imports on viewport entry. Falls back silently to the static image if:
 *   - the browser dislikes anything (CDN fail, WebGL unavailable, exception)
 *   - the visitor prefers reduced motion
 *   - the canvas hasn't initialised within 1500ms
 *
 * Interactivity:
 *   - cursor pressure — moving the cursor over the MAIN blob raycasts a hit
 *     point and pushes a soft outward bulge there. Satellites are visual
 *     only — they don't accept pressure (avoids fighting cursor targets).
 *   - mobile tilt — device orientation drives a small rotational offset on
 *     all three blobs together. Skips iOS permission gate (graceful fail).
 *   - scroll recede — as the section scrolls past viewport bottom, the
 *     entire blob system shrinks ~15% for a clean handoff to whatever
 *     section eventually sits below.
 *
 * No build step. No bundler. Pure ESM.
 */

const THREE_VERSION = '0.160.0';
const THREE_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/build/three.module.js`;
const ROOMENV_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/environments/RoomEnvironment.js`;

console.log('[hydration-hero] build: v2-three-blob 2026-04-25');

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroes = document.querySelectorAll('[data-hydration-hero]');
heroes.forEach(setupHero);

function setupHero(hero) {
  const canvas = hero.querySelector('[data-hydration-hero-canvas]');
  if (!canvas || reducedMotion) return;

  const observer = new IntersectionObserver(
    (entries, io) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      mount(hero, canvas).catch((err) => {
        console.warn('[hydration-hero] mount failed:', err);
      });
    },
    { rootMargin: '200px' }
  );
  observer.observe(hero);
}

async function mount(hero, canvas) {
  const watchdog = setTimeout(() => {
    if (!hero.hasAttribute('data-hh-ready')) {
      console.warn('[hydration-hero] init timeout, sticking with fallback');
    }
  }, 1500);

  const [THREE, { RoomEnvironment }] = await Promise.all([
    import(THREE_URL),
    import(ROOMENV_URL),
  ]);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 4.4);

  // shared icosahedron geometry across all three blobs (cheap reuse)
  const geometry = new THREE.IcosahedronGeometry(1, 64);

  /**
   * Build a blob — its own MeshPhysicalMaterial + uniforms so each can breathe
   * on a distinct rhythm. We can't simply share a material; the breathing rate
   * is baked into the vertex shader via uniform, and onBeforeCompile produces
   * a different program per material instance.
   */
  function createBlob({ baseScale, breathRate, attenuationDistance }) {
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xADE8F9,
      transmission: 1,
      thickness: 1.1,
      ior: 1.4,
      roughness: 0.06,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0,
      attenuationColor: new THREE.Color(0xADE8F9),
      attenuationDistance,
      transparent: true,
    });

    const uniforms = {
      uTime: { value: 0 },
      uBreathRate: { value: breathRate },
      uPointer: { value: new THREE.Vector3(0, 0, 0) },
      uPointerStrength: { value: 0 },
    };

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uBreathRate = uniforms.uBreathRate;
      shader.uniforms.uPointer = uniforms.uPointer;
      shader.uniforms.uPointerStrength = uniforms.uPointerStrength;
      shader.vertexShader =
        SIMPLEX_GLSL +
        '\nuniform float uBreathRate;\nuniform vec3 uPointer;\nuniform float uPointerStrength;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
            #include <begin_vertex>
            // breathing — layered simplex noise displacement, rate is per-blob
            float t = uTime * uBreathRate;
            float n1 = snoise(vec3(position.xyz * 1.4 + t));
            float n2 = snoise(vec3(position.xyz * 2.6 - t * 0.7)) * 0.4;
            float baseDisp = (n1 + n2) * 0.085;

            // cursor pressure — outward bulge at pointer hit point
            // (only the main blob has nonzero uPointerStrength at runtime)
            vec3 toPointer = position.xyz - uPointer;
            float pointerDist = length(toPointer);
            float pointerFalloff = exp(-pointerDist * 3.0);
            float pointerDisp = pointerFalloff * uPointerStrength;

            float displacement = baseDisp + pointerDisp;
            transformed += normal * displacement;
          `
        );
    };

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(baseScale);
    return { mesh, material, uniforms, baseScale };
  }

  // Three blobs: main + two satellites. Sizes and breathing rates differ
  // so the composition feels organic, not uniform. Orbit radii / speeds /
  // phases are picked to keep the satellites apart at all times so they
  // never visually collide with each other or with the main blob.
  const blobs = [
    {
      ...createBlob({ baseScale: 1.0, breathRate: 0.45, attenuationDistance: 1.5 }),
      orbitRadius: 0,
      orbitSpeed: 0,
      orbitPhase: 0,
      orbitYTilt: 0,
      orbitZRange: 0,
      isMain: true,
    },
    {
      ...createBlob({ baseScale: 0.42, breathRate: 0.62, attenuationDistance: 0.9 }),
      orbitRadius: 1.7,
      orbitSpeed: 0.00018,
      orbitPhase: 0.6,
      orbitYTilt: 0.35,
      orbitZRange: 0.45,
      isMain: false,
    },
    {
      ...createBlob({ baseScale: 0.56, breathRate: 0.34, attenuationDistance: 1.1 }),
      orbitRadius: 2.0,
      orbitSpeed: -0.00012,
      orbitPhase: 3.7,
      orbitYTilt: -0.25,
      orbitZRange: 0.55,
      isMain: false,
    },
  ];
  blobs.forEach(b => scene.add(b.mesh));

  const mainBlob = blobs[0];

  // ---------- resize handling ----------
  let pendingResize = false;
  function resize() {
    pendingResize = false;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height, false);
  }
  function queueResize() {
    if (pendingResize) return;
    pendingResize = true;
    requestAnimationFrame(resize);
  }
  resize();
  window.addEventListener('resize', queueResize);
  new ResizeObserver(queueResize).observe(hero);

  // ---------- cursor pressure (main blob only) ----------
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  const targetPointer = new THREE.Vector3();
  const currentPointer = new THREE.Vector3();
  let targetStrength = 0;
  let currentStrength = 0;

  hero.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseNDC, camera);
    // intersect main blob only — satellites are visual, not interactive,
    // so the cursor never has to fight a moving target
    const hits = raycaster.intersectObject(mainBlob.mesh, false);
    if (hits.length > 0) {
      mainBlob.mesh.worldToLocal(targetPointer.copy(hits[0].point));
      targetStrength = 1.0;
    } else {
      targetStrength = 0.0;
    }
  });
  hero.addEventListener('pointerleave', () => { targetStrength = 0.0; });

  // ---------- mobile tilt ----------
  let tiltX = 0, tiltY = 0;
  let tiltXTarget = 0, tiltYTarget = 0;
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null) return;
    tiltXTarget = clamp(e.gamma / 60, -1, 1);
    tiltYTarget = clamp((e.beta - 50) / 60, -1, 1);
  }, { passive: true });

  // ---------- scroll recede ----------
  let recede = 0;
  function updateRecede() {
    const rect = hero.getBoundingClientRect();
    const winH = window.innerHeight;
    if (rect.bottom < winH) {
      recede = clamp(1 - rect.bottom / winH, 0, 1);
    } else {
      recede = 0;
    }
  }
  window.addEventListener('scroll', updateRecede, { passive: true });
  updateRecede();

  // ---------- render loop ----------
  let raf = 0;
  let visible = true;
  let firstFrame = true;

  function tick(t) {
    raf = 0;
    const tSec = t * 0.001;

    // pointer smoothing (lerp position, ease strength)
    currentPointer.lerp(targetPointer, 0.18);
    currentStrength += (targetStrength - currentStrength) * 0.08;

    // tilt smoothing
    tiltX += (tiltXTarget - tiltX) * 0.06;
    tiltY += (tiltYTarget - tiltY) * 0.06;

    const recedeScale = 1 - recede * 0.18;

    // update each blob
    blobs.forEach((b, i) => {
      // orbit position — main blob stays at origin, satellites orbit
      if (b.orbitRadius > 0) {
        const angle = t * b.orbitSpeed + b.orbitPhase;
        b.mesh.position.set(
          Math.cos(angle) * b.orbitRadius,
          Math.sin(angle * 1.3) * b.orbitRadius * 0.4 + b.orbitYTilt,
          Math.sin(angle * 0.8) * b.orbitZRange
        );
      }

      // rotation: shared base auto-spin + tilt offset (tilt moves all blobs
      // together so the whole system feels physical, not detached)
      b.mesh.rotation.y = t * 0.00012 + i * 0.7 + tiltX * 0.4;
      b.mesh.rotation.x = Math.sin(t * 0.00008 + i * 1.7) * 0.15 + tiltY * 0.25;

      // scale: per-blob base × shared recede
      b.mesh.scale.setScalar(b.baseScale * recedeScale);

      // shader uniforms
      b.uniforms.uTime.value = tSec;
      if (b.isMain) {
        b.uniforms.uPointer.value.copy(currentPointer);
        b.uniforms.uPointerStrength.value = currentStrength * 0.18;
      }
    });

    renderer.render(scene, camera);

    if (firstFrame) {
      firstFrame = false;
      hero.setAttribute('data-hh-ready', '');
      clearTimeout(watchdog);
    }
    if (visible) raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  // pause when out of viewport (battery)
  const visibilityIO = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(tick);
  });
  visibilityIO.observe(hero);

  // pause when tab hidden (battery)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else if (visible && !raf) {
      raf = requestAnimationFrame(tick);
    }
  });
}

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

/**
 * Ashima 3D simplex noise — public domain, MIT-style.
 * https://github.com/ashima/webgl-noise
 */
const SIMPLEX_GLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
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

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;
