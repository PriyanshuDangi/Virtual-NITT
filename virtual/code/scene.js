import * as THREE from 'three';

THREE.Cache.enabled = true;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3dd);

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(-3, 0.6, -70);
camera.lookAt(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 1));

const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(-2, 0, 0);
scene.add(dirLight);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

export { renderer, scene, camera };
