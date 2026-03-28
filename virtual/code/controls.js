import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { camera } from './scene.js';

export function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

// --- Shared movement state ---
export const movement = {
    forward: 0,
    backward: 0,
    left: 0,
    right: 0,
};

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const PI_2 = Math.PI / 2;

let pointerLockControls = null;
let isTouch = false;

// Touch-drag look state
const touchLook = { dx: 0, dy: 0 };
let lookTouchId = null;
let lastLookPos = { x: 0, y: 0 };

export function initControls(mainEl) {
    isTouch = isTouchDevice();

    if (!isTouch) {
        initDesktopControls(mainEl);
    } else {
        initMobileControls(mainEl);
    }
}

// --- Desktop: PointerLock + keyboard ---
function initDesktopControls(mainEl) {
    pointerLockControls = new PointerLockControls(camera, document.body);

    mainEl.addEventListener('click', () => {
        pointerLockControls.lock();
    });

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

function onKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            movement.forward = 1;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            movement.left = 1;
            break;
        case 'ArrowDown':
        case 'KeyS':
            movement.backward = 1;
            break;
        case 'ArrowRight':
        case 'KeyD':
            movement.right = 1;
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            movement.forward = 0;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            movement.left = 0;
            break;
        case 'ArrowDown':
        case 'KeyS':
            movement.backward = 0;
            break;
        case 'ArrowRight':
        case 'KeyD':
            movement.right = 0;
            break;
    }
}

// --- Mobile: left joystick + screen drag for look ---
function initMobileControls(mainEl) {
    const joystickContainer = document.getElementById('joystick-container');
    if (joystickContainer) joystickContainer.classList.add('show');

    createJoystick('joystick-move', handleMoveJoystick);
    initTouchLook(mainEl);
}

function createJoystick(elementId, onMove) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const knob = el.querySelector('.joystick-knob');
    const radius = el.offsetWidth / 2;
    let active = false;
    let touchId = null;

    function getRelative(touch) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = touch.clientX - cx;
        let dy = touch.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = radius * 0.8;
        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }
        return { dx, dy, nx: dx / maxDist, ny: dy / maxDist };
    }

    el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (active) return;
        const touch = e.changedTouches[0];
        touchId = touch.identifier;
        active = true;
        const { dx, dy, nx, ny } = getRelative(touch);
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        onMove(nx, ny);
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!active) return;
        for (const touch of e.changedTouches) {
            if (touch.identifier === touchId) {
                const { dx, dy, nx, ny } = getRelative(touch);
                knob.style.transform = `translate(${dx}px, ${dy}px)`;
                onMove(nx, ny);
                break;
            }
        }
    }, { passive: false });

    const endTouch = (e) => {
        for (const touch of e.changedTouches) {
            if (touch.identifier === touchId) {
                active = false;
                touchId = null;
                knob.style.transform = 'translate(0px, 0px)';
                onMove(0, 0);
                break;
            }
        }
    };
    document.addEventListener('touchend', endTouch);
    document.addEventListener('touchcancel', endTouch);
}

// Drag anywhere on screen (that isn't the joystick) to look around
function initTouchLook(mainEl) {
    mainEl.addEventListener('touchstart', (e) => {
        if (lookTouchId !== null) return;
        const touch = e.changedTouches[0];
        lookTouchId = touch.identifier;
        lastLookPos.x = touch.clientX;
        lastLookPos.y = touch.clientY;
        touchLook.dx = 0;
        touchLook.dy = 0;
    }, { passive: true });

    mainEl.addEventListener('touchmove', (e) => {
        for (const touch of e.changedTouches) {
            if (touch.identifier === lookTouchId) {
                touchLook.dx = touch.clientX - lastLookPos.x;
                touchLook.dy = touch.clientY - lastLookPos.y;
                lastLookPos.x = touch.clientX;
                lastLookPos.y = touch.clientY;
                break;
            }
        }
    }, { passive: true });

    const endLook = (e) => {
        for (const touch of e.changedTouches) {
            if (touch.identifier === lookTouchId) {
                lookTouchId = null;
                touchLook.dx = 0;
                touchLook.dy = 0;
                break;
            }
        }
    };
    mainEl.addEventListener('touchend', endLook, { passive: true });
    mainEl.addEventListener('touchcancel', endLook, { passive: true });
}

function handleMoveJoystick(nx, ny) {
    const deadzone = 0.15;
    movement.forward = ny < -deadzone ? Math.abs(ny) : 0;
    movement.backward = ny > deadzone ? ny : 0;
    movement.left = nx < -deadzone ? Math.abs(nx) : 0;
    movement.right = nx > deadzone ? nx : 0;
}

// --- Update (called each frame) ---
export function updateMovement(delta) {
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = movement.forward - movement.backward;
    direction.x = movement.right - movement.left;
    direction.normalize();

    const speed = 40.0;
    if (movement.forward || movement.backward) velocity.z -= direction.z * speed * delta;
    if (movement.left || movement.right) velocity.x -= direction.x * speed * delta;

    if (isTouch) {
        // Apply accumulated drag delta to camera rotation
        const sensitivity = 0.003;
        euler.setFromQuaternion(camera.quaternion);
        euler.y -= touchLook.dx * sensitivity;
        euler.x -= touchLook.dy * sensitivity;
        euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
        camera.quaternion.setFromEuler(euler);

        // Consume the delta so it doesn't keep rotating
        touchLook.dx = 0;
        touchLook.dy = 0;

        // Move in camera look direction
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        right.y = 0;
        right.normalize();

        camera.position.addScaledVector(forward, -velocity.z * delta);
        camera.position.addScaledVector(right, -velocity.x * delta);
    } else {
        if (pointerLockControls) {
            pointerLockControls.moveRight(-velocity.x * delta);
            pointerLockControls.moveForward(-velocity.z * delta);
        }
    }
}

export function isActive() {
    if (isTouch) return true;
    return pointerLockControls ? pointerLockControls.isLocked : false;
}

export function getCameraPosition() {
    return camera.position;
}
