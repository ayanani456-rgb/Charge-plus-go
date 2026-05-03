// =========================================
// CUSTOM CURSOR
// =========================================
const cursor = document.querySelector('.custom-cursor');
document.addEventListener('mousemove', (e) => {
    if (cursor) { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; }
});
document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor?.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor?.classList.remove('hover'));
});

// =========================================
// UI CONTROLS & MENU
// =========================================
const menuToggle  = document.getElementById('menu-toggle');
const navMenu     = document.getElementById('nav-menu');
const navLinks    = document.querySelectorAll('.nav-link');
const uiOverlay   = document.querySelector('.ui-overlay');
const introOverlay = document.getElementById('intro-overlay');
const introCaption = document.getElementById('intro-caption');
const introSkip    = document.getElementById('intro-skip');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.textContent = navMenu.classList.contains('active') ? 'CLOSE' : 'MENU';
});

// Hide UI header/footer visually during intro — pointer-events handled by CSS
uiOverlay.style.opacity = '0';

// =========================================
// SCENE STATE
// =========================================
const scenes = ['home', 'problem', 'solution', 'how', 'pricing'];
let currentSceneIndex = 0;
let isTransitioning   = false;

// =========================================
// THREE.JS SETUP
// =========================================
const canvas  = document.getElementById('webgl-canvas');
const scene3d = new THREE.Scene();
scene3d.background = new THREE.Color(0x050505);
scene3d.fog = new THREE.Fog(0x050505, 80, 200);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 500);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

// =========================================
// STUDIO LIGHTING
// =========================================
scene3d.add(new THREE.AmbientLight(0xffffff, 0.4));

const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.8);
keyLight.position.set(10, 22, 20);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width  = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far  = 120;
keyLight.shadow.bias = -0.001;
scene3d.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xd8eeff, 0.5);
fillLight.position.set(-14, 2, 10);
scene3d.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
rimLight.position.set(2, 8, -18);
scene3d.add(rimLight);

// =========================================
// MATERIALS
// =========================================
const matBody = new THREE.MeshStandardMaterial({
    color: 0x181818, metalness: 0.6, roughness: 0.4
});
const matPanel = new THREE.MeshStandardMaterial({
    color: 0x111111, metalness: 0.35, roughness: 0.65
});
const matScreen = new THREE.MeshStandardMaterial({
    color: 0x050c18, emissive: 0x1a3a6a, emissiveIntensity: 0.5,
    roughness: 0.05, metalness: 0
});
const matPowerbank = new THREE.MeshStandardMaterial({
    color: 0x1c1c1c, metalness: 0.28, roughness: 0.62
});
const matLED = new THREE.MeshStandardMaterial({
    color: 0x001a00, emissive: 0x00bb33, emissiveIntensity: 1.0
});
const matConnector = new THREE.MeshStandardMaterial({
    color: 0x0d0d0d, metalness: 0.75, roughness: 0.3
});
const matGround = new THREE.MeshStandardMaterial({
    color: 0x070707, roughness: 0.95, transparent: true, opacity: 0.85
});

// =========================================
// KIOSK BUILD  (centred so camera sees all)
// =========================================
// Total kiosk height: body -6.75→+6.75, top housing at 8.85±2.1 → top ~11
// Foot bottom: -7.45.  Visual centre ≈ y=1.75
// We place the group at y=−2 so it sits centred in a 36-unit-deep view.
const homeGroup = new THREE.Group();
homeGroup.position.set(3, -2, 0); // x offset so hero text fits left side

// --- Body ---
const kioskBody = new THREE.Mesh(new THREE.BoxGeometry(7.5, 13.5, 2.8), matBody);
kioskBody.castShadow = true; kioskBody.receiveShadow = true;
homeGroup.add(kioskBody);

// --- Top screen housing ---
const topHousing = new THREE.Mesh(new THREE.BoxGeometry(7.5, 4.2, 2.8), matBody);
topHousing.position.set(0, 8.85, 0);
topHousing.rotation.x = -0.08;
topHousing.castShadow = true;
homeGroup.add(topHousing);

// Screen bezel
const matBezel = new THREE.MeshStandardMaterial({ color: 0x080808, metalness: 0.9, roughness: 0.15 });
const bezel = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.2), matBezel);
bezel.position.set(0, 8.85, 1.42);
bezel.rotation.x = -0.08;
homeGroup.add(bezel);

// Screen glow
const screenFace = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 2.7), matScreen);
screenFace.position.set(0, 8.85, 1.43);
screenFace.rotation.x = -0.08;
homeGroup.add(screenFace);

// --- Slot panel ---
const slotFace = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 10.6), matPanel);
slotFace.position.set(0, -0.4, 1.42);
homeGroup.add(slotFace);

// Column & row dividers
const colDiv = new THREE.Mesh(new THREE.BoxGeometry(0.05, 10.6, 0.06), matConnector);
colDiv.position.set(0, -0.4, 1.47);
homeGroup.add(colDiv);

for (let r = 0; r < 5; r++) {
    const rowLine = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.04, 0.05), matConnector);
    rowLine.position.set(0, 4.0 - r * 2.65, 1.47);
    homeGroup.add(rowLine);
}

// --- Powerbanks ---
const pbSlots = [
    { x: -1.6, y: 2.95 }, { x: 1.6, y: 2.95 },
    { x: -1.6, y: 0.30 }, { x: 1.6, y: 0.30 },
    { x: -1.6, y:-2.35 }, { x: 1.6, y:-2.35 },
    { x: -1.6, y:-5.00 }, { x: 1.6, y:-5.00 },
];

const powerbanks = [];
pbSlots.forEach((pos, i) => {
    const pb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.9, 0.46), matPowerbank);
    pb.position.set(pos.x, pos.y, 1.67);
    pb.castShadow = true;
    homeGroup.add(pb);
    powerbanks.push({ mesh: pb, baseZ: 1.67 });

    const port = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.15, 0.08), matConnector);
    port.position.set(pos.x, pos.y - 0.72, 1.92);
    homeGroup.add(port);

    const led = new THREE.Mesh(new THREE.CircleGeometry(0.075, 12), matLED);
    led.position.set(pos.x + (i % 2 === 0 ? 1.02 : -1.02), pos.y + 0.72, 1.92);
    homeGroup.add(led);
});

// Vent slits on right side
for (let s = 0; s < 6; s++) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.55, 0.04), matConnector);
    vent.position.set(3.82, 1.8 - s * 0.65, 1.42);
    homeGroup.add(vent);
}

// Base foot
const foot = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.42, 3.2), matBody);
foot.position.y = -7.2;
foot.receiveShadow = true;
homeGroup.add(foot);

// Shadow catcher ground
const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), matGround);
ground.rotation.x = -Math.PI / 2;
ground.position.set(3, -9.5, 0);
ground.receiveShadow = true;
scene3d.add(ground);

scene3d.add(homeGroup);

// --- Starfield ---
const starGeo = new THREE.BufferGeometry();
const starCount = 1800;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 500;
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ size: 0.18, color: 0x999999, transparent: true, opacity: 0.3, depthWrite: false });
const stars = new THREE.Points(starGeo, starMat);
scene3d.add(stars);

// =========================================
// WAYPOINT SCENES 2-5
// =========================================
const problemGroup = new THREE.Group();
problemGroup.position.set(65, 0, -42);
const probMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(4, 0), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.5, roughness: 0.5 }));
const probEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(4, 0)), new THREE.LineBasicMaterial({ color: 0x383838 }));
probMesh.add(probEdges);
problemGroup.add(probMesh);
scene3d.add(problemGroup);

const solutionGroup = new THREE.Group();
solutionGroup.position.set(-65, 50, -95);
const solBody = new THREE.Mesh(new THREE.BoxGeometry(6, 10, 2.5), matBody);
const solScreen2 = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.2), matScreen);
solScreen2.position.set(0, 3.2, 1.26);
solBody.add(solScreen2);
solutionGroup.add(solBody);
scene3d.add(solutionGroup);

const howGroup = new THREE.Group();
howGroup.position.set(105, -52, -145);
const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(7, 0.22, 32, 128), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.3 }));
ringMesh.rotation.x = Math.PI / 2;
howGroup.add(ringMesh);
scene3d.add(howGroup);

const pricingGroup = new THREE.Group();
pricingGroup.position.set(0, -105, -195);
const priceMesh = new THREE.Mesh(new THREE.OctahedronGeometry(5, 0), matBody);
const priceEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(5, 0)), new THREE.LineBasicMaterial({ color: 0x404040 }));
priceMesh.add(priceEdges);
pricingGroup.add(priceMesh);
scene3d.add(pricingGroup);

// =========================================
// CAMERA & WAYPOINTS
// =========================================
// HOME waypoint — camera at z=36 so full kiosk (height ≈18u) fits in 42° FOV
const HOME_CAM  = new THREE.Vector3(3, 1, 36);
const HOME_LOOK = new THREE.Vector3(3, 0, 0);

const lookAtTarget = HOME_LOOK.clone();

const waypoints = [
    { pos: HOME_CAM.clone(),                       lookAt: HOME_LOOK.clone() },
    { pos: new THREE.Vector3(65, 2, -14),          lookAt: problemGroup.position.clone() },
    { pos: new THREE.Vector3(-65, 52, -65),        lookAt: solutionGroup.position.clone() },
    { pos: new THREE.Vector3(105, -48, -115),      lookAt: howGroup.position.clone() },
    { pos: new THREE.Vector3(0, -102, -168),       lookAt: pricingGroup.position.clone() },
];

// Start far below for intro
camera.position.set(3, -14, 22);
camera.lookAt(3, -2, 0);
lookAtTarget.set(3, -2, 0);

// =========================================
// ANIMATION LOOP
// =========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Kiosk gentle float — always offset from base y=-2
    homeGroup.position.y = -2 + Math.sin(t * 0.45) * 0.28;

    // Powerbank breathing
    powerbanks.forEach((pb, i) => {
        pb.mesh.position.z = pb.baseZ + Math.sin(t * 1.1 + i * 0.85) * 0.018;
    });

    // Waypoint scene idles
    probMesh.rotation.y = t * 0.18;
    ringMesh.rotation.z = t * 0.28;
    priceMesh.rotation.y = t * 0.12;

    // Very slow key light drift
    keyLight.position.x = 10 + Math.sin(t * 0.12) * 4;

    stars.rotation.y = t * 0.007;

    camera.lookAt(lookAtTarget);
    renderer.render(scene3d, camera);
}

// =========================================
// INTRO CAPTION HELPER
// =========================================
function setCaption(text) {
    introCaption.classList.remove('visible');
    setTimeout(() => {
        introCaption.textContent = text;
        introCaption.classList.add('visible');
    }, 200);
}
function clearCaption() {
    introCaption.classList.remove('visible');
}

// =========================================
// CINEMATIC INTRO SEQUENCE
// =========================================
function playIntroSequence() {
    const tl = gsap.timeline();

    // Beat 0 — rise from below, full kiosk emerges
    tl.add(() => setCaption('SMART CAMPUS CHARGING.'))
      .to(camera.position, { x: 3, y: -6, z: 28, duration: 2.2, ease: 'power2.out' }, 0)
      .to(lookAtTarget,    { x: 3, y: -2, z: 0,  duration: 2.2, ease: 'power2.out' }, 0)

    // Beat 1 — zoom into screen
      .add(() => setCaption('SCAN. UNLOCK. GO.'), '+=0.4')
      .to(camera.position, { x: 3, y: 7.5, z: 18, duration: 2.0, ease: 'power3.inOut' }, '-=0.1')
      .to(lookAtTarget,    { x: 3, y: 6.8, z: 0,  duration: 2.0, ease: 'power3.inOut' }, '<')

    // Beat 2 — drift down to powerbank slots
      .add(() => setCaption('8 BANKS. ALWAYS READY.'), '+=0.5')
      .to(camera.position, { x: 3, y: 0, z: 16, duration: 2.0, ease: 'power3.inOut' }, '-=0.1')
      .to(lookAtTarget,    { x: 3, y:-1, z: 0,  duration: 2.0, ease: 'power3.inOut' }, '<')

    // Beat 3 — pull back to quarter angle, full kiosk reveal
      .add(() => setCaption('RETURN ANYWHERE ON CAMPUS.'), '+=0.5')
      .to(camera.position, { x: -4, y: 2, z: 30, duration: 2.4, ease: 'expo.inOut' }, '-=0.1')
      .to(lookAtTarget,    { x: 3,  y: 0, z: 0,  duration: 2.4, ease: 'expo.inOut' }, '<')

    // Beat 4 — fade caption, settle to home position
      .add(() => clearCaption(), '+=0.4')
      .to(camera.position, {
          x: HOME_CAM.x, y: HOME_CAM.y, z: HOME_CAM.z,
          duration: 2.6, ease: 'expo.inOut'
      }, '+=0.2')
      .to(lookAtTarget, {
          x: HOME_LOOK.x, y: HOME_LOOK.y, z: HOME_LOOK.z,
          duration: 2.6, ease: 'expo.inOut'
      }, '<')

    // End — reveal UI and home overlay
      .add(() => finishIntro(), '+=0.1');
}

function finishIntro() {
    // Hide intro overlay
    introOverlay.classList.add('hidden');

    // Show home scene content
    document.getElementById('scene-home').classList.add('active');

    // Fade in the UI — pointer-events stay on CSS children only, never on the overlay itself
    gsap.to(uiOverlay, { opacity: 1, duration: 1.0, ease: 'power2.out' });
}

// Skip button
introSkip.addEventListener('click', () => {
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(lookAtTarget);
    camera.position.copy(HOME_CAM);
    lookAtTarget.copy(HOME_LOOK);
    clearCaption();
    finishIntro();
});

// =========================================
// SCENE TRANSITIONS (post-intro)
// =========================================
function goToScene(index) {
    if (isTransitioning || index === currentSceneIndex) return;
    isTransitioning   = true;
    currentSceneIndex = index;

    const id = scenes[index];
    const wp = waypoints[index];

    document.querySelector('.scene-content.active')?.classList.remove('active');
    document.getElementById(`scene-${id}`)?.classList.add('active');
    document.querySelector('.nav-link.active')?.classList.remove('active');
    document.querySelector(`.nav-link[data-target="${id}"]`)?.classList.add('active');
    document.getElementById('current-scene-index').textContent = String(index + 1).padStart(2, '0');

    const tl = gsap.timeline({ onComplete: () => { isTransitioning = false; } });
    tl.to(starMat,       { size: 2.2, opacity: 0.65, duration: 0.35, ease: 'power2.in' })
      .to(camera.position, { x: wp.pos.x, y: wp.pos.y, z: wp.pos.z, duration: 2.2, ease: 'expo.inOut' }, 0)
      .to(lookAtTarget,    { x: wp.lookAt.x, y: wp.lookAt.y, z: wp.lookAt.z, duration: 2.2, ease: 'expo.inOut' }, 0)
      .to(starMat,       { size: 0.18, opacity: 0.3, duration: 0.9, ease: 'power2.out' }, 1.4);
}

// Navigation links
navLinks.forEach((link, i) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navMenu.classList.remove('active');
        menuToggle.textContent = 'MENU';
        goToScene(i);
    });
});

// Direct listeners on every NEXT / EXPLORE button at load time
document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextId = btn.dataset.next;
        const idx = scenes.indexOf(nextId);
        if (idx !== -1) goToScene(idx);
    });
});

const btnExplore = document.getElementById('btn-explore');
if (btnExplore) {
    btnExplore.addEventListener('click', (e) => {
        e.stopPropagation();
        goToScene(1);
    });
}

document.getElementById('nav-home')?.addEventListener('click', (e) => { e.preventDefault(); goToScene(0); });

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// =========================================
// LOADING → CANVAS FADE → INTRO
// =========================================
let loadProgress  = 0;
const loaderFill  = document.querySelector('.loader-fill');
const loadingScreen = document.getElementById('loading-screen');

animate(); // render immediately while still invisible

const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 14 + 6;
    loaderFill.style.width = Math.min(loadProgress, 100) + '%';

    if (loadProgress >= 100) {
        clearInterval(loadInterval);
        setTimeout(() => {
            // 1. Fade canvas in first
            canvas.style.opacity = '1';

            // 2. After canvas is visible, cross-fade loading screen out
            setTimeout(() => {
                gsap.to(loadingScreen, {
                    opacity: 0, duration: 0.9, ease: 'power2.inOut',
                    onComplete: () => {
                        loadingScreen.style.display = 'none';
                        // 3. Start the cinematic intro
                        playIntroSequence();
                    }
                });
            }, 700);
        }, 300);
    }
}, 100);
