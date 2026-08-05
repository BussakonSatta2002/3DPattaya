import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

import { Capsule } from 'three/addons/math/Capsule.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
// 🚀 [เพิ่มใหม่ 1] Import MapControls
import { MapControls } from 'three/addons/controls/MapControls.js';

// อัปเกรด Three.js ให้รองรับ BVH
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const viewer = new GaussianSplats3D.Viewer({
    'initialCameraPosition': [0, 50, 0],
    'initialCameraLookAt': [50, 0, 0],
    'sharedMemoryForWorkers': false 
});

viewer.addSplatScene('./pattaya.splat', {
    'progressiveLoad': true,
    'rotation': [1, 0, 0, 0]
})
.then(() => {
    viewer.start();

    // เพิ่มเส้นแกน X(แดง), Y(เขียว), Z(น้ำเงิน) เพื่อดูจุดศูนย์กลาง (0,0,0)
    const axesHelper = new THREE.AxesHelper( 5 ); 
    viewer.threeScene.add( axesHelper );

    // เพิ่มเส้นตาราง (Grid) เพื่อให้ดูสเกลและพื้นระนาบได้ง่ายขึ้น
    const gridHelper = new THREE.GridHelper( 10, 10 );
    viewer.threeScene.add( gridHelper );

    // ==========================================
    // ส่วนสร้างกล่องเล็งเป้า (Helper Box)
    // ==========================================
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1); 
    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }); 
    const helperBox = new THREE.Mesh(boxGeometry, boxMaterial); 
    helperBox.scale.set(0.2, 0.2, 0.2);
    viewer.threeScene.add(helperBox);

    // ==========================================
    // ส่วนเชื่อมต่อแผงควบคุม (Sliders + Number Inputs)
    // ==========================================
    function setupControl(axisOrProp, isPosition = true) {
        const slider = document.getElementById(`slider-${axisOrProp}`);
        const numInput = document.getElementById(`num-${axisOrProp}`);

        function updateValue(val) {
            const parsedVal = parseFloat(val);
            slider.value = parsedVal;
            numInput.value = parsedVal;
            if (isPosition) {
                helperBox.position[axisOrProp] = parsedVal;
            } else {
                helperBox.scale.set(parsedVal, parsedVal, parsedVal);
            }
        }
        slider.addEventListener('input', (e) => updateValue(e.target.value));
        numInput.addEventListener('input', (e) => updateValue(e.target.value));
    }

    setupControl('x', true);
    setupControl('y', true);
    setupControl('z', true);
    setupControl('size', false); 

    // ดึงกล้องออกมาใช้งาน
    const camera = viewer.camera;

    // ==========================================
    // 🚀 [แก้ไขใหม่ 2] สลับ OrbitControls ของเดิม เป็น MapControls
    // ==========================================
    
    // 1. ปิดการทำงาน controls ดั้งเดิมที่ติดมากับ Viewer และทำลายทิ้ง
    if (viewer.controls) {
        viewer.controls.enabled = false;
        viewer.controls.dispose(); 
    }

    // 2. สร้าง MapControls ขึ้นมาใหม่แทนที่
    const mapControls = new MapControls(camera, viewer.renderer.domElement);
    mapControls.enableDamping = true; // เปิดความหน่วงให้ลื่นไหล
    mapControls.dampingFactor = 0.05;
    mapControls.screenSpacePanning = false; // 🚀 บังคับให้การ Pan ขนานไปกับพื้นโลก (แกน X, Z)
    mapControls.maxPolarAngle = Math.PI / 2; // ป้องกันไม่ให้กล้องมุดลงไปใต้ดิน
    
    // ตั้งค่าตัวแปรควบคุมโหมด
    let isFirstPersonMode = false; 
    let originalOrbitControls = mapControls; // 🚀 เปลี่ยนมาเก็บ MapControls ไว้ใช้สลับโหมดแทน
    
    // นำ MapControls ใส่กลับไปให้ Viewer จัดการ (เพื่อให้ Viewer ช่วยเรียก .update() ทุกเฟรม)
    viewer.controls = mapControls; 

    // ==========================================
    // โค้ดเชื่อมต่อปุ่มสไลด์ เปิด/ปิด Helper Box และ แผงควบคุม (Console)
    // ==========================================
    const toggleHelper = document.getElementById('toggle-helper');
    const controlPanel = document.getElementById('control-panel');
    
    if (toggleHelper) {
        isFirstPersonMode = !toggleHelper.checked;
        
        // เซ็ตสถานะตอนเริ่มโหลดเว็บ
        if (isFirstPersonMode) {
            viewer.controls = null;
        }

        toggleHelper.addEventListener('change', (e) => {
            const isHelperVisible = e.target.checked;
            
            helperBox.visible = isHelperVisible;
            if (controlPanel) controlPanel.style.display = isHelperVisible ? 'block' : 'none';
            
            isFirstPersonMode = !isHelperVisible;

            if (isHelperVisible) {
                // 🟢 เข้าสู่โหมดหาตำแหน่ง (ตอนนี้คือ MapControls)
                viewer.controls = originalOrbitControls; 
                if (viewer.controls) viewer.controls.enabled = true; 
                controls.unlock(); // ปลดล็อคเมาส์ของ FPS
                
            } else {
                // 🔴 เข้าสู่โหมด 1st Person (FPS)
                if (originalOrbitControls) {
                    originalOrbitControls.enabled = false; 
                }
                viewer.controls = null; 
                
                // ดึงตัวละครมาไว้ที่ตำแหน่งกล้อง
                const camPos = camera.position.clone();
                playerCapsule.start.set(camPos.x, camPos.y - 1.5 + 0.35, camPos.z);
                playerCapsule.end.set(camPos.x, camPos.y, camPos.z);
                playerVelocity.set(0, 0, 0); 
            }
        });
    }

    // ==========================================
    // ตั้งค่าตัวละคร First Person และระบบฟิสิกส์
    // ==========================================
    const controls = new PointerLockControls(camera, document.body);
    
    document.addEventListener('click', () => {
        if (isFirstPersonMode) {
            controls.lock();
        }
    });

    const clock = new THREE.Clock();
    const keyStates = {};
    const playerVelocity = new THREE.Vector3();
    const playerDirection = new THREE.Vector3();
    let playerOnFloor = false;

    const playerCapsule = new Capsule(
        new THREE.Vector3(0, 0.35, 0),
        new THREE.Vector3(0, 8, 0), 3.5);
    playerCapsule.translate(new THREE.Vector3(0, 50, 0));

    document.addEventListener('keydown', (e) => { keyStates[e.code] = true; });
    document.addEventListener('keyup', (e) => { keyStates[e.code] = false; });

    const colliders = []; 
    let isCollisionLoaded = false; 

    // ==========================================
    // ส่วนโหลดไฟล์ Collision Mesh (.glb)
    // ==========================================
    const gltfLoader = new GLTFLoader();
    
    gltfLoader.load('./output_pattaya577.collision.glb', (gltf) => {
        const collisionModel = gltf.scene;
        collisionModel.rotation.y = Math.PI; 

        collisionModel.traverse((child) => {
            if (child.isMesh) {
                child.geometry.computeBoundsTree(); 
                colliders.push(child);              
                child.material = new THREE.MeshBasicMaterial({
                    color: 0x00ff00, 
                    wireframe: true, 
                    transparent: true,
                    opacity: 0.3     
                });
            }
        });

        const toggleCheckbox = document.getElementById('toggle-collision');
        if (toggleCheckbox) {
            toggleCheckbox.checked = false; 
            collisionModel.visible = false; 
            
            toggleCheckbox.addEventListener('change', (e) => {
                collisionModel.visible = e.target.checked; 
            });
        } else {
            collisionModel.visible = false; 
        }

        viewer.threeScene.add(collisionModel);
        console.log("โหลดไฟล์ Collision สำเร็จ!");

        isCollisionLoaded = true; 

    }, undefined, (error) => {
        console.error("เกิดข้อผิดพลาดในการโหลด Collision:", error);
    });

    // ==========================================
    // ระบบคำนวณการเดินและชน (Game Loop)
    // ==========================================
    function getForwardVector() {
        camera.getWorldDirection(playerDirection);
        playerDirection.y = 0;
        playerDirection.normalize();
        return playerDirection;
    }

    function getSideVector() {
        camera.getWorldDirection(playerDirection);
        playerDirection.y = 0;
        playerDirection.normalize();
        playerDirection.cross(camera.up);
        return playerDirection;
    }

    function playerCollisions() {
        playerOnFloor = false;
        
        for (const collider of colliders) {
            const bvh = collider.geometry.boundsTree;
            if (!bvh) continue;

            collider.updateMatrixWorld();
            const transformMatrix = new THREE.Matrix4().copy(collider.matrixWorld).invert();
            
            const localCapsule = new Capsule().copy(playerCapsule);
            localCapsule.start.applyMatrix4(transformMatrix);
            localCapsule.end.applyMatrix4(transformMatrix);

            const capsuleBox = new THREE.Box3();
            capsuleBox.expandByPoint(localCapsule.start);
            capsuleBox.expandByPoint(localCapsule.end);
            capsuleBox.min.subScalar(playerCapsule.radius);
            capsuleBox.max.addScalar(playerCapsule.radius);

            const capsuleLine = new THREE.Line3(localCapsule.start, localCapsule.end);

            bvh.shapecast({
                intersectsBounds: box => box.intersectsBox(capsuleBox),
                intersectsTriangle: tri => {
                    const triPoint = new THREE.Vector3();
                    const capsulePoint = new THREE.Vector3();
                    
                    const distance = tri.closestPointToSegment(capsuleLine, triPoint, capsulePoint);
                    
                    if (distance < playerCapsule.radius) {
                        const depth = playerCapsule.radius - distance;
                        let direction = capsulePoint.sub(triPoint);
                        
                        if (direction.lengthSq() > 1e-10) {
                            direction.normalize();
                        } else {
                            direction.set(0, 1, 0); 
                        }
                        
                        localCapsule.start.addScaledVector(direction, depth);
                        localCapsule.end.addScaledVector(direction, depth);
                    }
                }
            });

            localCapsule.start.applyMatrix4(collider.matrixWorld);
            localCapsule.end.applyMatrix4(collider.matrixWorld);

            const deltaVector = new THREE.Vector3().subVectors(localCapsule.start, playerCapsule.start);
            
            if (deltaVector.length() > 1e-5) {
                playerCapsule.translate(deltaVector);
                if (deltaVector.y > 0.001) { 
                    playerOnFloor = true;
                    playerVelocity.y = Math.max(0, playerVelocity.y);
                }
            }
        }
    }

    function updatePlayer(deltaTime) {
        if (!isCollisionLoaded) return; 

        let damping = Math.exp(-4 * deltaTime) - 1;
        if (!playerOnFloor) {
            playerVelocity.y -= 30 * deltaTime; 
            
            if (playerVelocity.y < -20) playerVelocity.y = -20; 
            
            damping *= 0.1; 
        }

        playerVelocity.addScaledVector(playerVelocity, damping);
        
        const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
        playerCapsule.translate(deltaPosition);

        playerCollisions();

        if (playerCapsule.start.y < -20) {
            playerVelocity.set(0, 0, 0); 
            playerCapsule.start.set(0, 10 + 0.35, 0); 
            playerCapsule.end.set(0, 10 + 1.5, 0);
        }

        camera.position.copy(playerCapsule.end);
    }

    function animateFPS() {
        requestAnimationFrame(animateFPS);

        if (!isFirstPersonMode) return;
        
        const deltaTime = Math.min(clock.getDelta(), 0.1); 
        
        if (controls.isLocked) {
            const isSprinting = keyStates['ShiftLeft'] || keyStates['ShiftRight'];
            
            let baseSpeed = 23;
            if (playerOnFloor) {
                if (isSprinting) {
                    baseSpeed = 70; 
                } else {
                    baseSpeed = 23; 
                }
            } else {
                baseSpeed = 8; 
            }

            const speedDelta = deltaTime * baseSpeed;

            if (keyStates['KeyW']) playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
            if (keyStates['KeyS']) playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
            if (keyStates['KeyA']) playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
            if (keyStates['KeyD']) playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
            
            if (playerOnFloor && keyStates['Space']) {
                playerVelocity.y = 15;
            }
        }
        
        updatePlayer(deltaTime);
    }

    animateFPS();

});