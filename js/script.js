// =========================================
// THREE.JS SETUP
// =========================================
const canvas = document.getElementById('webgl-canvas');
const scene3d = new THREE.Scene();
scene3d.background = new THREE.Color(0x050505);
scene3d.fog = new THREE.Fog(0x050505, 10, 60);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 500);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// =========================================
// STUDIO LIGHTING
// =========================================
scene3d.add(new THREE.AmbientLight(0xffffff, 0.4));

const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.8);
keyLight.position.set(10, 22, 20);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.bias = -0.001;
scene3d.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x00f0ff, 0.8); // Teal fill to match "neon teal"
fillLight.position.set(-14, 2, 10);
scene3d.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
rimLight.position.set(2, 8, -18);
scene3d.add(rimLight);

// =========================================
// MATERIALS
// =========================================
const matBody = new THREE.MeshStandardMaterial({ color: 0x181818, metalness: 0.8, roughness: 0.3 });
const matPanel = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.4, roughness: 0.6 });
const matScreen = new THREE.MeshStandardMaterial({ color: 0x050c18, emissive: 0x00f0ff, emissiveIntensity: 0.3, roughness: 0.1, metalness: 0.1 });
const matPowerbank = new THREE.MeshStandardMaterial({ color: 0x151515, metalness: 0.9, roughness: 0.2 });
const matLED = new THREE.MeshStandardMaterial({ color: 0x001a00, emissive: 0x00f0ff, emissiveIntensity: 2.0 });
const matConnector = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, metalness: 0.8, roughness: 0.2 });

// =========================================
// KIOSK BUILD
// =========================================
const kioskGroup = new THREE.Group();
// Move kiosk right so it balances the hero text on the left
kioskGroup.position.set(5, -1, 0);

// Main Body
const kioskBody = new THREE.Mesh(new THREE.BoxGeometry(7.5, 13.5, 2.8), matBody);
kioskBody.castShadow = true; kioskBody.receiveShadow = true;
kioskGroup.add(kioskBody);

// Top Screen Housing
const topHousing = new THREE.Mesh(new THREE.BoxGeometry(7.5, 4.2, 2.8), matBody);
topHousing.position.set(0, 8.85, 0);
topHousing.rotation.x = -0.08;
kioskGroup.add(topHousing);

const screenFace = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 2.7), matScreen);
screenFace.position.set(0, 8.85, 1.43);
screenFace.rotation.x = -0.08;
kioskGroup.add(screenFace);

// Slot Panel
const slotFace = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 10.6), matPanel);
slotFace.position.set(0, -0.4, 1.42);
kioskGroup.add(slotFace);

// Powerbanks setup
const pbSlots = [
    { x: -1.6, y: 2.95 }, { x: 1.6, y: 2.95 },
    { x: -1.6, y: 0.30 }, { x: 1.6, y: 0.30 },
    { x: -1.6, y:-2.35 }, { x: 1.6, y:-2.35 },
    { x: -1.6, y:-5.00 }, { x: 1.6, y:-5.00 },
];

const powerbanks = [];

pbSlots.forEach((pos, i) => {
    const pbGroup = new THREE.Group();
    pbGroup.position.set(pos.x, pos.y, 1.67);
    
    const pb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.9, 0.46), matPowerbank);
    pb.castShadow = true;
    pbGroup.add(pb);

    const port = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.15, 0.08), matConnector);
    port.position.set(0, -0.72, 0.25);
    pbGroup.add(port);

    const led = new THREE.Mesh(new THREE.CircleGeometry(0.075, 12), matLED);
    led.position.set(i % 2 === 0 ? 1.02 : -1.02, 0.72, 0.25);
    pbGroup.add(led);

    kioskGroup.add(pbGroup);
    
    powerbanks.push({
        group: pbGroup,
        baseX: pos.x,
        baseY: pos.y,
        baseZ: 1.67
    });
});

scene3d.add(kioskGroup);

// =========================================
// PARTICLES / DATA STREAMS
// =========================================
const particleCount = 2000;
const particlesGeo = new THREE.BufferGeometry();
const particlesPos = new Float32Array(particleCount * 3);

for(let i=0; i<particleCount * 3; i++) {
    particlesPos[i] = (Math.random() - 0.5) * 60;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlesPos, 3));

const particleMat = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.06,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particles = new THREE.Points(particlesGeo, particleMat);
scene3d.add(particles);

// =========================================
// CAMERA SETUP
// =========================================
camera.position.set(0, 1, 34);
camera.lookAt(2, 0, 0);

// =========================================
// RENDER LOOP
// =========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Idle subtle floating
    kioskGroup.position.y = -1 + Math.sin(t * 0.6) * 0.2;
    
    // Idle particle flow
    particles.rotation.y = t * 0.05;
    particles.rotation.x = t * 0.02;

    renderer.render(scene3d, camera);
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// =========================================
// GSAP SCROLL ANIMATIONS (DEVELOPER VISION)
// =========================================
gsap.registerPlugin(ScrollTrigger);

// Timeline triggered by scrolling the page
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "#hero-section",
        start: "top top",
        endTrigger: "#scroll-spacer",
        end: "bottom center",
        scrub: 1.5 // Smooth scrubbing effect
    }
});

// 1. Dynamic Powerbank Detachment
powerbanks.forEach((pb, i) => {
    // Generate a random 3D spread towards the user
    // We want them to explode outwards and frame the center slightly
    const targetX = pb.baseX + (Math.random() - 0.5) * 16 - 6; // Move left towards the center of viewport
    const targetY = pb.baseY + (Math.random() - 0.5) * 12;
    const targetZ = pb.baseZ + 15 + Math.random() * 8; // Fly out towards camera
    
    // Dynamic rotations for a chaotic high-tech look
    const rotX = (Math.random() - 0.5) * Math.PI * 1.5;
    const rotY = (Math.random() - 0.5) * Math.PI * 1.5;
    const rotZ = (Math.random() - 0.5) * Math.PI * 1.5;

    tl.to(pb.group.position, {
        x: targetX,
        y: targetY,
        z: targetZ,
        ease: "power2.inOut"
    }, 0);

    tl.to(pb.group.rotation, {
        x: rotX,
        y: rotY,
        z: rotZ,
        ease: "power2.inOut"
    }, 0);
});

// 2. Camera Zoom & Shift
tl.to(camera.position, {
    z: 22, // Zoom in as they fly out
    x: -2, // Shift left slightly to counter the kiosk's right bias
    ease: "power1.inOut"
}, 0);

tl.to(camera.rotation, {
    y: -0.15, // Slight pan
    ease: "power1.inOut"
}, 0);

// 3. Intensify Light Streams/Particles
tl.to(particleMat, {
    size: 0.15,
    opacity: 0.9,
    ease: "power1.in"
}, 0);
