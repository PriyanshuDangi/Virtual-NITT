import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { renderer, scene, camera } from './scene.js';
import { initControls, updateMovement, isActive, getCameraPosition, isTouchDevice } from './controls.js';
import { clampPosition } from './boundaries.js';

// --- DOM refs ---
const playButton = document.getElementById('playButton');
const percentageDiv = document.getElementById('percentage');
const progressFill = document.getElementById('progress-fill');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('load-error');
const playScreen = document.getElementById('play');
const mainScreen = document.getElementById('main');
const container = document.getElementById('container');
const audio = document.getElementById('pride_of_india');
const muteBtn = document.getElementById('mute-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const helpBtn = document.getElementById('help-btn');
const helpTooltip = document.getElementById('help-tooltip');

// --- Append renderer ---
container.appendChild(renderer.domElement);

// --- Play button ---
playButton.addEventListener('click', () => {
    playScreen.classList.remove('show');
    playScreen.classList.add('none');
    mainScreen.classList.remove('none');
    mainScreen.classList.add('show');
    audio.play().catch(() => {});
    initControls(mainScreen);
});

// --- Audio mute toggle ---
let muted = false;
muteBtn.addEventListener('click', () => {
    muted = !muted;
    audio.muted = muted;
    muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    muteBtn.querySelector('.icon-sound').classList.toggle('none', muted);
    muteBtn.querySelector('.icon-muted').classList.toggle('none', !muted);
});

// --- Fullscreen toggle ---
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
});

// --- Help tooltip ---
helpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    helpTooltip.classList.toggle('none');
});
document.addEventListener('click', () => {
    if (!helpTooltip.classList.contains('none')) {
        helpTooltip.classList.add('none');
    }
});

// --- Show correct instructions based on device ---
if (isTouchDevice()) {
    document.querySelectorAll('.desktop-only').forEach(el => el.classList.add('none'));
} else {
    document.querySelectorAll('.mobile-only').forEach(el => el.classList.add('none'));
}

// --- Load 3D model ---
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load(
    'nitt.glb',
    (gltf) => {
        const model = gltf.scene;
        model.position.set(0, -1, 0);
        scene.add(model);
        THREE.Cache.add('model', model);

        loadingDiv.classList.add('none');
        playButton.classList.remove('none');

        animate();
    },
    (xhr) => {
        if (xhr.lengthComputable) {
            const percent = Math.min((xhr.loaded / xhr.total) * 100, 100);
            percentageDiv.textContent = `${percent.toFixed(0)}%`;
            progressFill.style.width = `${percent}%`;
        } else {
            const mb = (xhr.loaded / (1024 * 1024)).toFixed(1);
            percentageDiv.textContent = `${mb} MB loaded`;
            progressFill.style.width = '50%';
        }
    },
    (error) => {
        console.error('Failed to load model:', error);
        loadingDiv.classList.add('none');
        errorDiv.classList.remove('none');
    }
);

// --- Animation loop ---
let prevTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (isActive()) {
        updateMovement(delta);
        clampPosition(getCameraPosition());
    }

    prevTime = time;
    renderer.render(scene, camera);
}
