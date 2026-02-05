// Enhanced Three.js 3D Scene with Moving Yellow Stars
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('three-canvas'),
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.z = 50;

// Create floating geometric shapes
const geometries = [
    new THREE.IcosahedronGeometry(3, 0),
    new THREE.OctahedronGeometry(2),
    new THREE.TetrahedronGeometry(2.5)
];

const material = new THREE.MeshBasicMaterial({
    color: 0xD4AF37,
    wireframe: true,
    transparent: true,
    opacity: 0.6
});

const shapes = [];
for (let i = 0; i < 15; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const mesh = new THREE.Mesh(geometry, material.clone());

    mesh.position.x = (Math.random() - 0.5) * 100;
    mesh.position.y = (Math.random() - 0.5) * 100;
    mesh.position.z = (Math.random() - 0.5) * 100;

    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;

    mesh.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01
    };

    shapes.push(mesh);
    scene.add(mesh);
}

// ==================== ENHANCED STAR SYSTEM ====================
// Create multiple layers of stars with different speeds

// Layer 1: Large bright stars
const createStarField = (count, size, color, speedMultiplier) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 200;
        positions[i3 + 1] = (Math.random() - 0.5) * 200;
        positions[i3 + 2] = (Math.random() - 0.5) * 200;

        // Random velocity for each star
        velocities.push({
            x: (Math.random() - 0.5) * 0.05 * speedMultiplier,
            y: (Math.random() - 0.5) * 0.05 * speedMultiplier,
            z: (Math.random() - 0.5) * 0.02 * speedMultiplier
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: size,
        color: color,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });

    const stars = new THREE.Points(geometry, material);
    stars.userData.velocities = velocities;
    return stars;
};

// Create 3 layers of stars
const starLayer1 = createStarField(300, 0.8, 0xFFD700, 1);    // Large gold stars
const starLayer2 = createStarField(400, 0.5, 0xFFE55C, 1.5);  // Medium yellow stars
const starLayer3 = createStarField(500, 0.3, 0xFFF8DC, 2);    // Small cream stars

scene.add(starLayer1);
scene.add(starLayer2);
scene.add(starLayer3);

// Add some special twinkling stars
const twinkleStars = createStarField(50, 1.5, 0xFFD700, 0.5);
scene.add(twinkleStars);

// Mouse parallax effect
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate geometric shapes
    shapes.forEach(shape => {
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
    });

    // Animate star layers
    [starLayer1, starLayer2, starLayer3].forEach(layer => {
        const positions = layer.geometry.attributes.position.array;
        const velocities = layer.userData.velocities;

        for (let i = 0; i < velocities.length; i++) {
            const i3 = i * 3;

            // Move stars
            positions[i3] += velocities[i].x;
            positions[i3 + 1] += velocities[i].y;
            positions[i3 + 2] += velocities[i].z;

            // Wrap around if stars go too far
            if (positions[i3] > 100) positions[i3] = -100;
            if (positions[i3] < -100) positions[i3] = 100;
            if (positions[i3 + 1] > 100) positions[i3 + 1] = -100;
            if (positions[i3 + 1] < -100) positions[i3 + 1] = 100;
            if (positions[i3 + 2] > 50) positions[i3 + 2] = -50;
            if (positions[i3 + 2] < -50) positions[i3 + 2] = 50;
        }

        layer.geometry.attributes.position.needsUpdate = true;
    });

    // Twinkling effect for special stars
    const time = Date.now() * 0.001;
    twinkleStars.material.opacity = 0.5 + Math.sin(time * 2) * 0.5;

    // Rotate entire star field slowly
    starLayer1.rotation.y += 0.0002;
    starLayer2.rotation.y -= 0.0003;
    starLayer3.rotation.y += 0.0001;

    // Mouse parallax
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
