// FIREWORKS
let fireworks = [];
function createFirework(pos) {
  const pCount = 50;
  const pGeo = new THREE.BufferGeometry();
  const pPositions = new Float32Array(pCount * 3);
  const velocities = [];

  for (let i = 0; i < pCount; i++) {
    pPositions[i * 3] = pos.x;
    pPositions[i * 3 + 1] = pos.y;
    pPositions[i * 3 + 2] = pos.z;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const speed = 0.08 + Math.random() * 0.12;

    velocities.push(
      new THREE.Vector3(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.sin(phi) * Math.sin(theta),
        speed * Math.cos(phi),
      ),
    );
  }

  pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.35,
    color: 0xffd700,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
  });

  const pMesh = new THREE.Points(pGeo, pMat);
  scene.add(pMesh);

  fireworks.push({ mesh: pMesh, velocities: velocities, life: 1.0 });
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let targetCamPos = null;
let targetCamTarget = null;
let selectedLantern = null;

const wishModal = document.getElementById("wishModal");
const wishTitle = document.getElementById("wishTitle");
const wishText = document.getElementById("wishText");
const closeWishBtn = document.getElementById("closeWishBtn");

let pointerDownPos = { x: 0, y: 0 };

function onPointerDown(event) {
  pointerDownPos.x =
    event.clientX || (event.touches && event.touches[0].clientX) || 0;
  pointerDownPos.y =
    event.clientY || (event.touches && event.touches[0].clientY) || 0;
}

function onPointerUp(event) {
  if (event.target.closest(".top-bar") || event.target.closest(".wish-modal"))
    return;

  const clientX =
    event.clientX ||
    (event.changedTouches && event.changedTouches[0].clientX) ||
    0;
  const clientY =
    event.clientY ||
    (event.changedTouches && event.changedTouches[0].clientY) ||
    0;

  const distMoved = Math.hypot(
    clientX - pointerDownPos.x,
    clientY - pointerDownPos.y,
  );
  if (distMoved > 8) return;

  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveObjects, false);

  if (intersects.length > 0) {
    const hitMesh = intersects[0].object;
    selectedLantern = hitMesh.userData.parentLantern || hitMesh.parent;
    const lPos = selectedLantern.position;

    createFirework(lPos);

    const offset = new THREE.Vector3()
      .subVectors(camera.position, lPos)
      .normalize()
      .multiplyScalar(5.5);
    targetCamPos = new THREE.Vector3().addVectors(lPos, offset);
    targetCamTarget = lPos.clone();

    wishTitle.textContent = selectedLantern.userData.title || "Lời chúc đêm trăng";
    wishText.textContent = `"${selectedLantern.userData.wish}"`;

    setTimeout(() => {
      wishModal.classList.add("active");
    }, 280);
  }
}

window.addEventListener("pointerdown", onPointerDown, { passive: true });
window.addEventListener("pointerup", onPointerUp, { passive: true });

function resetCamera() {
  targetCamPos = DEFAULT_CAM_POS.clone();
  targetCamTarget = DEFAULT_CAM_TARGET.clone();
  selectedLantern = null;
}

function closeWishCard(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  wishModal.classList.remove("active");
  resetCamera();
}

closeWishBtn.addEventListener("click", closeWishCard);
closeWishBtn.addEventListener("touchend", closeWishCard);

wishModal.addEventListener("click", (e) => {
  if (e.target === wishModal) closeWishCard(e);
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeWishCard();
});

const resetCamBtn = document.getElementById("reset-cam-btn");
resetCamBtn.addEventListener("click", () => {
  if (wishModal.classList.contains("active")) wishModal.classList.remove("active");
  resetCamera();
});

const bgm = document.getElementById("bgm");
const audioBtn = document.getElementById("audio-btn");
let isPlaying = false;

audioBtn.addEventListener("click", () => {
  if (isPlaying) {
    bgm.pause();
    audioBtn.innerHTML = '<i class="fas fa-music" style="opacity:0.5;"></i>';
  } else {
    bgm
      .play()
      .then(() => {
        audioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
      })
      .catch(() => {});
  }
  isPlaying = !isPlaying;
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.033);
  const time = clock.getElapsedTime();

  lanterns.forEach((lantern) => {
    const d = lantern.userData;
    lantern.position.y =
      d.baseY + Math.sin(time * d.bobSpeed + d.bobPhase) * d.bobAmplitude;
    lantern.position.x =
      d.initialX + Math.sin(time * d.swingSpeed + d.id * 0.83) * d.swingRadius;
    lantern.position.z =
      d.initialZ + Math.cos(time * d.swingSpeed * 0.92 + d.id * 0.67) * d.swingRadius;
    lantern.rotation.y = time * d.rotationSpeed + d.id * 0.35;
  });

  const pPos = petalsGeo.attributes.position.array;
  for (let i = 0; i < fallingPetalsCount; i++) {
    pPos[i * 3 + 1] -= petalsData[i].speedY;
    pPos[i * 3] += Math.sin(time + i) * 0.01;
    pPos[i * 3 + 2] += Math.cos(time + i) * 0.01;

    if (pPos[i * 3 + 1] < -3) {
      pPos[i * 3 + 1] = 30;
      pPos[i * 3] = (Math.random() - 0.5) * 36;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
  }
  petalsGeo.attributes.position.needsUpdate = true;

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const fw = fireworks[i];
    fw.life -= delta * 1.2;
    const posArr = fw.mesh.geometry.attributes.position.array;

    for (let j = 0; j < fw.velocities.length; j++) {
      posArr[j * 3] += fw.velocities[j].x;
      posArr[j * 3 + 1] += fw.velocities[j].y;
      posArr[j * 3 + 2] += fw.velocities[j].z;
    }
    fw.mesh.geometry.attributes.position.needsUpdate = true;
    fw.mesh.material.opacity = fw.life;

    if (fw.life <= 0) {
      scene.remove(fw.mesh);
      fireworks.splice(i, 1);
    }
  }

  islandGroup.rotation.y = Math.sin(time * 0.15) * 0.05;

  grassBlades.forEach((g, i) => {
    g.mesh.rotation.z = Math.sin(time * 1.6 + g.sway + i * 0.03) * 0.16;
  });
  treeGroup.rotation.z = Math.sin(time * 0.55) * 0.018;
  treeGroup.rotation.x = Math.sin(time * 0.36) * 0.01;

  starLayers.forEach((layer, idx) => {
    layer.points.rotation.y += 0.00012 * (idx + 1);
    layer.material.opacity = 0.58 + Math.sin(time * layer.speed + layer.phase) * 0.18;
  });
  moonGlow.material.opacity = 0.42 + Math.sin(time * 1.15) * 0.08;

  updateRabbits(time);

  if (targetCamPos && targetCamTarget) {
    controls.enabled = false;
    const cameraEase = 1 - Math.exp(-4.1 * delta);
    camera.position.lerp(targetCamPos, cameraEase);
    controls.target.lerp(targetCamTarget, cameraEase);

    if (camera.position.distanceTo(targetCamPos) < 0.08) {
      targetCamPos = null;
      targetCamTarget = null;
      controls.enabled = true;
    }
  } else {
    controls.enabled = true;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.fov = width < 768 ? 64 : 45;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, width < 768 ? 1.3 : 1.8),
  );
});
