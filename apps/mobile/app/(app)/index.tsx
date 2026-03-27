import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

const GLOBE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100%; background:#000; overflow:hidden; }
    canvas { display:block; width:100%; height:100%; }
    #label {
      position:absolute; bottom:90px; left:20px;
      color:rgba(255,255,255,0.85); font-family:-apple-system,sans-serif;
    }
    .row { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .dot { width:8px; height:8px; border-radius:50%; }
    .line { width:16px; height:2px; border-radius:1px; }
    .lbl { font-size:12px; color:#8E8E93; }
  </style>
</head>
<body>
<div id="label">
  <div class="row"><div class="dot" style="background:#ff9500"></div><span class="lbl">Cocoa Plantation · Brazil</span></div>
  <div class="row"><div class="dot" style="background:#ff9500"></div><span class="lbl">Factory · Switzerland</span></div>
  <div class="row"><div class="line" style="background:#ff453a"></div><span class="lbl">Supply route</span></div>
</div>
<script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
<script>
// ── scene setup ──────────────────────────────────────────────────────────────
const W = window.innerWidth, H = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, W/H, 0.1, 1000);
camera.position.set(0, 0, 2.8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W, H);
document.body.appendChild(renderer.domElement);

// ── stars ─────────────────────────────────────────────────────────────────────
const starPos = [];
for (let i = 0; i < 3000; i++) {
  const r = 60 + Math.random() * 40;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  starPos.push(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color:0xffffff, size:0.12, transparent:true, opacity:0.8 })));

// ── lights ────────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.25));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(5, 3, 5);
scene.add(sun);
const rimLight = new THREE.DirectionalLight(0x2244aa, 0.5);
rimLight.position.set(-5, -2, -5);
scene.add(rimLight);

// ── globe ─────────────────────────────────────────────────────────────────────
const globeGeo = new THREE.SphereGeometry(1, 64, 64);
let globe;

// Atmosphere
const atmMat = new THREE.MeshLambertMaterial({ color:0x0055ff, transparent:true, opacity:0.06, side:THREE.BackSide });
scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.05, 64, 64), atmMat));

function buildFallbackGlobe() {
  const mat = new THREE.MeshPhongMaterial({ color:0x0d2b6b, emissive:0x071433, specular:0x4477cc, shininess:20 });
  globe = new THREE.Mesh(globeGeo, mat);
  scene.add(globe);
}

const loader = new THREE.TextureLoader();
loader.load(
  'https://unpkg.com/three-globe/example/img/earth-dark.jpg',
  (tex) => {
    const mat = new THREE.MeshPhongMaterial({ map:tex, specular:new THREE.Color(0x222222), shininess:12 });
    globe = new THREE.Mesh(globeGeo, mat);
    scene.add(globe);
  },
  undefined,
  () => buildFallbackGlobe()
);
buildFallbackGlobe(); // always add immediately as fallback; will be replaced on texture load

// ── helpers ───────────────────────────────────────────────────────────────────
function ll2v(lat, lng, r) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lng + 180) * Math.PI / 180;
  return new THREE.Vector3(-r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
}

function buildArc(a, b, lift=1.32, segs=120) {
  const pts = [];
  for (let i = 0; i <= segs; i++) {
    const t = i/segs;
    const p = new THREE.Vector3().lerpVectors(a, b, t).normalize().multiplyScalar(lift);
    pts.push(p);
  }
  return pts;
}

// ── locations ─────────────────────────────────────────────────────────────────
const brazil = ll2v(-14.235, -51.925, 1);
const swiss   = ll2v( 47.377,   8.542, 1);

function addMarker(pos) {
  const inner = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 16), new THREE.MeshBasicMaterial({ color:0xff9500 }));
  inner.position.copy(pos);
  scene.add(inner);
  const outer = new THREE.Mesh(new THREE.SphereGeometry(0.036, 16, 16), new THREE.MeshBasicMaterial({ color:0xff6600, transparent:true, opacity:0.35 }));
  outer.position.copy(pos);
  scene.add(outer);
  return { inner, outer, base: pos.clone() };
}

const markerB = addMarker(brazil);
const markerS = addMarker(swiss);

// ── arc + particle ─────────────────────────────────────────────────────────────
const arcPoints = buildArc(brazil, swiss);
const arcGeo = new THREE.BufferGeometry();
const arcLine = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color:0xff453a }));
scene.add(arcLine);

const particle = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), new THREE.MeshBasicMaterial({ color:0xffffff }));
scene.add(particle);
// Trailing glow
const trailGeo = new THREE.BufferGeometry();
const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color:0xffffff, transparent:true, opacity:0.4 }));
scene.add(trail);

// ── orbit (touch drag) ────────────────────────────────────────────────────────
let rotY = 0, rotX = 0.2, dragging = false, last = null;
const c = renderer.domElement;
c.addEventListener('touchstart', e => { dragging=true; last={x:e.touches[0].clientX, y:e.touches[0].clientY}; }, {passive:true});
c.addEventListener('touchmove',  e => {
  if (!dragging||!last) return;
  rotY += (e.touches[0].clientX - last.x) * 0.006;
  rotX += (e.touches[0].clientY - last.y) * 0.006;
  rotX = Math.max(-1.2, Math.min(1.2, rotX));
  last = {x:e.touches[0].clientX, y:e.touches[0].clientY};
}, {passive:true});
c.addEventListener('touchend', () => { dragging=false; });

// ── animate ───────────────────────────────────────────────────────────────────
let t = 0, arcT = 0;
const rotMat = new THREE.Matrix4();

function applyRot(v, base) {
  rotMat.makeRotationFromEuler(new THREE.Euler(rotX, rotY, 0));
  v.copy(base).applyMatrix4(rotMat);
}

function animate() {
  requestAnimationFrame(animate);
  t += 0.016;

  if (!dragging) rotY += 0.0018;

  // Rotate globe mesh
  if (globe) { globe.rotation.x = rotX; globe.rotation.y = rotY; }

  // Markers follow globe rotation
  applyRot(markerB.inner.position, markerB.base);
  applyRot(markerB.outer.position, markerB.base);
  applyRot(markerS.inner.position, markerS.base);
  applyRot(markerS.outer.position, markerS.base);

  // Pulse
  const pulse = 0.85 + 0.15 * Math.sin(t * 3.5);
  markerB.outer.scale.setScalar(pulse);
  markerS.outer.scale.setScalar(pulse);

  // Arc progress (loops 0→1 repeatedly)
  arcT = (arcT + 0.004) % 1.4;
  const drawn = Math.min(arcT, 1);
  const end = Math.max(1, Math.floor(drawn * arcPoints.length));
  const rotPts = arcPoints.slice(0, end).map(p => { const v = new THREE.Vector3(); applyRot(v, p); return v; });
  arcGeo.setFromPoints(rotPts.length > 1 ? rotPts : [rotPts[0]||new THREE.Vector3()]);

  // Particle
  const pIdx = Math.floor((arcT % 1) * (arcPoints.length - 1));
  if (arcPoints[pIdx]) {
    applyRot(particle.position, arcPoints[pIdx]);
    particle.visible = drawn >= arcT % 1;
  }
  // Trail (last 10 points)
  const trailStart = Math.max(0, pIdx - 10);
  const trailPts = arcPoints.slice(trailStart, pIdx + 1).map(p => { const v = new THREE.Vector3(); applyRot(v, p); return v; });
  trailGeo.setFromPoints(trailPts.length > 1 ? trailPts : [particle.position.clone()]);

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w/h; camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
</script>
</body>
</html>`;

export default function GlobeScreen() {
  return (
    <View style={styles.container}>
      <WebView
        style={StyleSheet.absoluteFill}
        source={{ html: GLOBE_HTML }}
        originWhitelist={["*"]}
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        allowsFullscreenVideo={false}
        // allows loading three-globe texture from unpkg CDN
        mixedContentMode="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
