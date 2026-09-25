// LANTERNS & MESSAGES WITH IMAGES
const lanternsGroup = new THREE.Group();
scene.add(lanternsGroup);

const lanterns = [];
const interactiveObjects = [];

const wishList = Array.isArray(window.TRUNG_THU_WISHES) && window.TRUNG_THU_WISHES.length
  ? window.TRUNG_THU_WISHES
  : [
      { title: "Lồng đèn thứ nhất", text: "Chúc cậu đêm trăng ấm áp, dịu êm, ngập tràn vui." },
      { title: "Lồng đèn thứ hai", text: "Mong cậu tối rằm bình an, thư thái, mãi rạng rỡ." },
      { title: "Lồng đèn thứ ba", text: "Chúc trăng sáng soi đường, cậu ngủ ngon và mơ đẹp." },
      { title: "Lồng đèn thứ tư", text: "Mong đèn hoa tỏa sáng, mang tới cậu những dịu dàng." },
      { title: "Lồng đèn cuối cùng", text: "Chúc cậu ngắm đêm trăng thật lâu, lòng nhẹ như mây." },
    ];

function createLanternTexture(topColor = "#ff8b63", midColor = "#ffbb78", bottomColor = "#ffd978", frameColor = "#ffe6a3") {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, topColor);
  grad.addColorStop(0.5, midColor);
  grad.addColorStop(1, bottomColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 120, 120);
  return new THREE.CanvasTexture(canvas);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const pinkLanternStyle = { top: "#ff82b5", mid: "#ffb8d6", bottom: "#ffe1ee", frame: "#fff2f8", emissive: 0xff67a7, glow: 0xffa3ca, tag: 0xff74ad, cap: 0xffeef5 };
const yellowLanternStyle = { top: "#ffbe3d", mid: "#ffd766", bottom: "#fff0a6", frame: "#fff4c9", emissive: 0xffbf38, glow: 0xffd45f, tag: 0xf0a428, cap: 0xffefb1 };

const lanternDescriptors = shuffleArray([
  { interactive: true }, { interactive: true }, { interactive: true }, { interactive: true }, { interactive: true },
  { interactive: false }, { interactive: false }, { interactive: false }, { interactive: false }, { interactive: false }, { interactive: false },
]);

function createLanternMesh(styleCfg = yellowLanternStyle) {
  const group = new THREE.Group();

  const bodyGeo = new THREE.CylinderGeometry(0.6, 0.45, 1.4, 6);
  const bodyMat = new THREE.MeshStandardMaterial({
    map: createLanternTexture(styleCfg.top, styleCfg.mid, styleCfg.bottom, styleCfg.frame),
    emissive: styleCfg.emissive,
    emissiveIntensity: 1.15,
    roughness: 0.3,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  const capGeo = new THREE.CylinderGeometry(0.63, 0.63, 0.1, 6);
  const capMat = new THREE.MeshStandardMaterial({
    color: styleCfg.cap,
    emissive: styleCfg.cap,
    emissiveIntensity: 0.12,
    metalness: 0.35,
  });
  const capTop = new THREE.Mesh(capGeo, capMat);
  capTop.position.y = 0.7;
  group.add(capTop);

  const tagGeo = new THREE.PlaneGeometry(0.35, 0.7);
  const tagMat = new THREE.MeshBasicMaterial({
    color: styleCfg.tag,
    side: THREE.DoubleSide,
  });
  const tag = new THREE.Mesh(tagGeo, tagMat);
  tag.position.set(0, -1.1, 0);
  group.add(tag);

  const spriteMat = new THREE.SpriteMaterial({
    map: createParticleTexture(),
    color: styleCfg.glow,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Sprite(spriteMat);
  glow.scale.set(4.5, 4.5, 1);
  group.add(glow);

  const hitGeo = new THREE.SphereGeometry(1.6, 8, 8);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  group.add(hitMesh);

  return { group, hitMesh };
}

const lanternCount = 11;
const interactiveLanternCount = Math.min(5, wishList.length);
let wishCursor = 0;

for (let i = 0; i < lanternCount; i++) {
  const descriptor = lanternDescriptors[i];
  const isInteractive = Boolean(descriptor.interactive) && wishCursor < interactiveLanternCount;
  const styleCfg = isInteractive ? pinkLanternStyle : yellowLanternStyle;
  const { group: lantern, hitMesh } = createLanternMesh(styleCfg);

  const radius = 11.5 + Math.random() * (isMobile ? 7.5 : 10.5);
  const angle = (i / lanternCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
  const baseY = 4 + Math.random() * (isMobile ? 12 : 16);
  const bobPhase = Math.random() * Math.PI * 2;

  lantern.position.set(
    Math.cos(angle) * radius,
    baseY,
    Math.sin(angle) * radius,
  );

  const wishData = isInteractive ? wishList[wishCursor++] : null;

  lantern.userData = {
    bobSpeed: 0.30 + Math.random() * 0.22,
    bobAmplitude: 0.75 + Math.random() * 0.75,
    bobPhase,
    swingSpeed: 0.42 + Math.random() * 0.42,
    swingRadius: 0.18 + Math.random() * 0.18,
    rotationSpeed: 0.12 + Math.random() * 0.08,
    initialX: lantern.position.x,
    initialZ: lantern.position.z,
    baseY,
    wish: wishData ? wishData.text : "",
    title: wishData ? wishData.title : "",
    id: i,
    interactive: isInteractive,
  };

  const sc = (isInteractive ? 1.02 : 0.86) + Math.random() * 0.13;
  lantern.scale.set(sc, sc, sc);

  hitMesh.userData.parentLantern = lantern;

  lanternsGroup.add(lantern);
  lanterns.push(lantern);
  if (isInteractive) interactiveObjects.push(hitMesh);
}

const fallingPetalsCount = isMobile ? 80 : 180;
const petalsGeo = new THREE.BufferGeometry();
const petalsPos = new Float32Array(fallingPetalsCount * 3);
const petalsData = [];

for (let i = 0; i < fallingPetalsCount; i++) {
  petalsPos[i * 3] = (Math.random() - 0.5) * 36;
  petalsPos[i * 3 + 1] = Math.random() * 36;
  petalsPos[i * 3 + 2] = (Math.random() - 0.5) * 36;

  petalsData.push({
    speedY: 0.02 + Math.random() * 0.03,
  });
}

petalsGeo.setAttribute("position", new THREE.BufferAttribute(petalsPos, 3));
const petalsMat = new THREE.PointsMaterial({
  size: isMobile ? 0.35 : 0.3,
  color: 0xf7d1d5,
  transparent: true,
  opacity: 0.75,
  map: createParticleTexture(),
  blending: THREE.NormalBlending,
  depthWrite: false,
});

const petalsParticles = new THREE.Points(petalsGeo, petalsMat);
scene.add(petalsParticles);

const starLayers = [];
function makeStarField(count, color, size, spreadY, opacity) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 200;
    pos[i * 3 + 1] = Math.random() * spreadY;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    map: createParticleTexture(),
    depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);
  starLayers.push({ points, material: mat, phase: Math.random() * Math.PI * 2, speed: 0.4 + Math.random() * 0.6 });
}
makeStarField(isMobile ? 650 : 1300, 0xffffff, 0.42, 95, 0.82);
makeStarField(isMobile ? 220 : 420, 0xfff0b2, 0.62, 90, 0.72);
makeStarField(isMobile ? 180 : 320, 0xcfe6ff, 0.56, 92, 0.62);
