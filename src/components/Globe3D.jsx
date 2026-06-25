import { useRef, useEffect, memo } from "react";
import * as THREE from "three";
import earthMapUrl from "../assets/earthmap.jpg";
import earthLightsUrl from "../assets/earthlights.jpg";

/*
  Globe3D — Three.js WebGL threat globe. Loaded ONLY via dynamic import from
  CyberGlobe (after the Canvas2D placeholder paints), so the ~600KB three.js
  chunk never blocks first paint.

  Real threats: accepts a `threatsRef` whose .current is an array of
  { country, threat, kind } from /api/threats (URLhaus malware + Feodo
  botnet C&C). Arc origins are the real source countries; targets bias
  toward India. Falls back to random city pairs when no live data yet.
*/

const ATTACK_COLORS = [0xff3355, 0xffd700, 0xff6b35, 0xc084fc, 0x38bdf8];
const CYAN = 0x06ffd0;

const NODES = [
  { lat: 40.7, lon: -74, label: "NYC" }, { lat: 34, lon: -118.2, label: "LA" },
  { lat: 51.5, lon: -0.1, label: "LON" }, { lat: 52.5, lon: 13.4, label: "BER" },
  { lat: 48.9, lon: 2.35, label: "PAR" }, { lat: 55.8, lon: 37.6, label: "MOS" },
  { lat: 19.1, lon: 72.9, label: "MUM" }, { lat: 28.6, lon: 77.2, label: "DEL" },
  { lat: 39.9, lon: 116.4, label: "BEI" }, { lat: 31.2, lon: 121.5, label: "SHA" },
  { lat: 35.7, lon: 139.7, label: "TKY" }, { lat: 37.6, lon: 127, label: "SEL" },
  { lat: 1.35, lon: 103.8, label: "SGP" }, { lat: -23.5, lon: -46.6, label: "SAO" },
  { lat: -33.9, lon: 151.2, label: "SYD" }, { lat: 6.5, lon: 3.4, label: "LAG" },
  { lat: 25.2, lon: 55.3, label: "DXB" }, { lat: 30, lon: 31.2, label: "CAI" },
  { lat: 19.4, lon: -99.1, label: "MEX" }, { lat: -1.3, lon: 36.8, label: "NBI" },
];

// Country (ISO-ish name) → approximate capital lat/lon, for mapping real
// threat-feed source countries onto the globe.
const COUNTRY_COORDS = {
  "United States": { lat: 38.9, lon: -77 }, "US": { lat: 38.9, lon: -77 },
  "Russia": { lat: 55.8, lon: 37.6 }, "RU": { lat: 55.8, lon: 37.6 },
  "China": { lat: 39.9, lon: 116.4 }, "CN": { lat: 39.9, lon: 116.4 },
  "Germany": { lat: 52.5, lon: 13.4 }, "DE": { lat: 52.5, lon: 13.4 },
  "Netherlands": { lat: 52.4, lon: 4.9 }, "NL": { lat: 52.4, lon: 4.9 },
  "France": { lat: 48.9, lon: 2.35 }, "FR": { lat: 48.9, lon: 2.35 },
  "United Kingdom": { lat: 51.5, lon: -0.1 }, "GB": { lat: 51.5, lon: -0.1 },
  "India": { lat: 28.6, lon: 77.2 }, "IN": { lat: 28.6, lon: 77.2 },
  "Singapore": { lat: 1.35, lon: 103.8 }, "SG": { lat: 1.35, lon: 103.8 },
  "Japan": { lat: 35.7, lon: 139.7 }, "JP": { lat: 35.7, lon: 139.7 },
  "Brazil": { lat: -15.8, lon: -47.9 }, "BR": { lat: -15.8, lon: -47.9 },
  "Ukraine": { lat: 50.4, lon: 30.5 }, "UA": { lat: 50.4, lon: 30.5 },
  "Iran": { lat: 35.7, lon: 51.4 }, "IR": { lat: 35.7, lon: 51.4 },
  "Turkey": { lat: 39.9, lon: 32.9 }, "TR": { lat: 39.9, lon: 32.9 },
  "South Korea": { lat: 37.6, lon: 127 }, "KR": { lat: 37.6, lon: 127 },
  "Canada": { lat: 45.4, lon: -75.7 }, "CA": { lat: 45.4, lon: -75.7 },
  "Australia": { lat: -33.9, lon: 151.2 }, "AU": { lat: -33.9, lon: 151.2 },
  "Vietnam": { lat: 21, lon: 105.8 }, "VN": { lat: 21, lon: 105.8 },
  "Hong Kong": { lat: 22.3, lon: 114.2 }, "HK": { lat: 22.3, lon: 114.2 },
};
const INDIA_TARGETS = [{ lat: 19.1, lon: 72.9 }, { lat: 28.6, lon: 77.2 }, { lat: 12.97, lon: 77.6 }];

function latLonToVec3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
function createArcCurve(start, end) {
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dist = start.distanceTo(end);
  mid.normalize().multiplyScalar(2.5 + dist * 0.35);
  return new THREE.QuadraticBezierCurve3(start, mid, end);
}

const Globe3D = memo(function Globe3D({ size, threatsRef, onContextLost, onArc, pausedRef }) {
  const containerRef = useRef(null);
  const onContextLostRef = useRef(onContextLost);
  onContextLostRef.current = onContextLost;
  const pausedReadRef = useRef(pausedRef);
  pausedReadRef.current = pausedRef;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const w = container.clientWidth, h = size;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(0, 0, 5.5);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "default" });
    } catch { onContextLostRef.current?.(); return; }
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x030712, 1);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); onContextLostRef.current?.(); });

    const loader = new THREE.TextureLoader();
    const earthGeom = new THREE.SphereGeometry(2, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({ color: 0x225588, emissive: 0x112244, shininess: 15 });
    const earth = new THREE.Mesh(earthGeom, earthMat);
    scene.add(earth);
    loader.load(earthMapUrl, (tex) => { earthMat.map = tex; earthMat.color.set(0xffffff); earthMat.needsUpdate = true; });
    loader.load(earthLightsUrl, (tex) => { earthMat.emissiveMap = tex; earthMat.emissive.set(0xffcc88); earthMat.emissiveIntensity = 0.4; earthMat.needsUpdate = true; });

    const fresnel = (power, mult, side) => new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vNormal; void main(){ float i=pow(${side === THREE.BackSide ? "0.5" : "0.65"}-dot(vNormal,vec3(0.0,0.0,1.0)),${power}); gl_FragColor=vec4(0.024,1.0,0.82,1.0)*i*${mult}; }`,
      side, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(2.04, 64, 64), fresnel("2.5", "0.6", THREE.FrontSide)));
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(2.3, 64, 64), fresnel("3.0", "0.25", THREE.BackSide)));

    const ring1 = new THREE.Mesh(new THREE.RingGeometry(2.25, 2.26, 128), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.06, side: THREE.DoubleSide }));
    ring1.rotation.x = Math.PI * 0.45; ring1.rotation.z = 0.2; scene.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(2.5, 2.51, 128), new THREE.MeshBasicMaterial({ color: 0xff3355, transparent: true, opacity: 0.03, side: THREE.DoubleSide }));
    ring2.rotation.x = Math.PI * 0.35; ring2.rotation.z = -0.4; scene.add(ring2);

    const starsGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(4000 * 3);
    for (let i = 0; i < 4000; i++) {
      const r = 50 + Math.random() * 150, theta = Math.random() * Math.PI * 2, phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starsGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starsGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, sizeAttenuation: true, transparent: true, opacity: 0.7 }));
    scene.add(stars);

    const nodesGroup = new THREE.Group(); scene.add(nodesGroup);
    const nodeDots = [];
    NODES.forEach((n) => {
      const pos = latLonToVec3(n.lat, n.lon, 2.02);
      const glowMat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.3 });
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), glowMat); glow.position.copy(pos); nodesGroup.add(glow);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: CYAN })); dot.position.copy(pos); nodesGroup.add(dot);
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); center.position.copy(pos); nodesGroup.add(center);
      nodeDots.push({ glow, glowMat, phase: Math.random() * Math.PI * 2 });
    });

    const arcsGroup = new THREE.Group(); scene.add(arcsGroup);
    const attacks = [];

    scene.add(new THREE.AmbientLight(0x334466, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(5, 3, 5); scene.add(sun);
    const backLight = new THREE.PointLight(0x06ffd0, 0.3, 50); backLight.position.set(-5, -3, 5); scene.add(backLight);

    let mouseDown = false, prevMX = 0, prevMY = 0, rotY = 0, rotX = 0.3;
    const autoSpeed = 0.001;
    const onDown = (x, y) => { mouseDown = true; prevMX = x; prevMY = y; renderer.domElement.style.cursor = "grabbing"; };
    const onUp = () => { mouseDown = false; renderer.domElement.style.cursor = "grab"; };
    const onMove = (x, y) => { if (!mouseDown) return; rotY += (x - prevMX) * 0.005; rotX += (y - prevMY) * 0.005; rotX = Math.max(-1.2, Math.min(1.2, rotX)); prevMX = x; prevMY = y; };
    renderer.domElement.addEventListener("mousedown", (e) => onDown(e.clientX, e.clientY));
    renderer.domElement.addEventListener("touchstart", (e) => { e.preventDefault(); onDown(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    window.addEventListener("mouseup", onUp); window.addEventListener("touchend", onUp);
    renderer.domElement.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
    renderer.domElement.addEventListener("touchmove", (e) => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });

    // STRICT REAL: only draw arcs from real abuse.ch threats whose source
    // country maps to coords. No random/fabricated lines — returns null when
    // there's no real threat to draw (then we draw nothing).
    const pickEndpoints = () => {
      const live = threatsRef?.current;
      if (!live || !live.length) return null;
      const usable = live.filter((t) => t.country && COUNTRY_COORDS[t.country]);
      if (!usable.length) return null;
      const t = usable[Math.floor(Math.random() * usable.length)];
      const origin = COUNTRY_COORDS[t.country];
      const target = INDIA_TARGETS[Math.floor(Math.random() * INDIA_TARGETS.length)];
      return {
        start: latLonToVec3(origin.lat, origin.lon, 2.02),
        end: latLonToVec3(target.lat, target.lon, 2.02),
        threat: t,
      };
    };

    let lastAttackTime = 0;
    const spawnAttack = (now) => {
      const ep = pickEndpoints();
      if (!ep) return; // no real threat → no line (honest)
      const { start, end, threat } = ep;
      if (onArc) onArc(threat);
      const curve = createArcCurve(start, end);
      // color by real threat kind: malware = red, botnet = purple
      const color = threat.kind === "botnet" ? 0xa78bfa : 0xef4444;
      const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 });
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), lineMat); arcsGroup.add(line);
      const particle = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); arcsGroup.add(particle);
      const pGlowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
      const pGlow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), pGlowMat); arcsGroup.add(pGlow);
      const impactMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide });
      const impact = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.06, 16), impactMat); impact.position.copy(end); impact.lookAt(new THREE.Vector3(0, 0, 0)); arcsGroup.add(impact);
      attacks.push({ line, lineMat, particle, pGlow, pGlowMat, impact, impactMat, curve, born: now });
      if (attacks.length > 10) {
        const old = attacks.shift();
        [old.line, old.particle, old.pGlow, old.impact].forEach((m) => { arcsGroup.remove(m); m.geometry.dispose(); });
        [old.lineMat, old.pGlowMat, old.impactMat].forEach((m) => m.dispose());
        old.particle.material.dispose();
      }
    };

    const onResize = () => { const nw = container.clientWidth; camera.aspect = nw / size; camera.updateProjectionMatrix(); renderer.setSize(nw, size); };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const delta = clock.getDelta(), elapsed = clock.getElapsedTime(), now = Date.now();
      // Off-screen → consume the clock delta (avoid a jump on resume) but skip
      // the WebGL render + arc updates entirely. Kills GPU cost while scrolled away.
      if (pausedReadRef.current?.current) return;
      if (!mouseDown) rotY += autoSpeed;
      [earth, nodesGroup, arcsGroup].forEach((o) => { o.rotation.y = rotY; o.rotation.x = rotX; });
      ring1.rotation.z += delta * 0.05; ring2.rotation.z -= delta * 0.03;
      nodeDots.forEach((nd) => { nd.phase += delta * 2; nd.glow.scale.setScalar(1 + Math.sin(nd.phase) * 0.4); nd.glowMat.opacity = 0.15 + Math.sin(nd.phase) * 0.1; });
      if (now - lastAttackTime > 1600) { spawnAttack(now); lastAttackTime = now; }
      attacks.forEach((a) => {
        const age = (now - a.born) / 1000, fade = Math.max(0, 1 - age / 5);
        a.lineMat.opacity = 0.6 * fade;
        const t = (age * 0.22) % 1, point = a.curve.getPoint(t);
        a.particle.position.copy(point); a.pGlow.position.copy(point);
        a.pGlowMat.opacity = (0.2 + Math.sin(elapsed * 6) * 0.1) * fade;
        if (age > 1) { a.impactMat.opacity = Math.max(0, 0.4 - (age - 1) * 0.1) * fade; a.impact.scale.setScalar(1 + (age - 1) * 3); }
      });
      stars.rotation.y += delta * 0.003;
      renderer.render(scene, camera);
    };
    animate();
    spawnAttack(Date.now());
    setTimeout(() => spawnAttack(Date.now()), 400);
    setTimeout(() => spawnAttack(Date.now()), 800);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mouseup", onUp); window.removeEventListener("touchend", onUp);
      if (renderer.domElement.parentNode) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [size, threatsRef, onArc]);

  return <div ref={containerRef} style={{ width: "100%", height: size, background: "#060a14" }} />;
});

export default Globe3D;
