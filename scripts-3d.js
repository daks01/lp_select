import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Создание сцены, камеры и рендерера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(5, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);


// Включаем тени для рендерера
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Настройка камеры
camera.position.set(0, 0, 10);
camera.lookAt(scene.position);

// Добавляем освещение
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(-5, 5, 5);
scene.add(pointLight);

const spotLight = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 4, 0.5);
spotLight.position.set(0, 10, 0);
spotLight.castShadow = true;
scene.add(spotLight);

// Создание загрузчика GLTF
const loader = new GLTFLoader();

// Загрузка .glb-файла
loader.load('assets/3d/GLITF.glb',
    (gltf) => {
        const model = gltf.scene;
        scene.add(model);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error loading GLB file:', error);
    }
);

// Путь камеры (массив точек)
const cameraPath = [
    new THREE.Vector3(0, 0, 10), // Начальная позиция
    new THREE.Vector3(5, 5, 15), // Промежуточная точка
    new THREE.Vector3(10, 0, 20), // Конечная позиция
];

// Текущая позиция и кватернион камеры
const targetPosition = new THREE.Vector3();
const targetQuaternion = new THREE.Quaternion();

// Функция для обновления позиции камеры на основе скролла
function updateCameraPosition() {
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / maxScroll, 1);

    // Вычисляем текущую позицию на пути
    const pointIndex = Math.floor(progress * (cameraPath.length - 1));
    const pointA = cameraPath[pointIndex];
    const pointB = cameraPath[pointIndex + 1] || pointA;
    const localProgress = (progress * (cameraPath.length - 1)) % 1;

    // Интерполируем позицию
    targetPosition.lerpVectors(pointA, pointB, localProgress);

    // Направляем камеру на центр сцены
    const lookAtPosition = new THREE.Vector3(0, 0, 0); // Центр сцены
    targetQuaternion.setFromRotationMatrix(
        new THREE.Matrix4().lookAt(targetPosition, lookAtPosition, new THREE.Vector3(0, 1, 0))
    );
}

// Функция для плавного перемещения камеры
function smoothCameraUpdate() {
    const lerpFactor = 0.1; // Коэффициент интерполяции (0.1 = плавно, 0.5 = быстро)
    camera.position.lerp(targetPosition, lerpFactor);
    camera.quaternion.slerp(targetQuaternion, lerpFactor);
}

// Ограничение частоты обновления с помощью throttle
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function () {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function () {
                if (Date.now() - lastRan >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

// Ограничиваем вызов updateCameraPosition до 100 мс
const throttledUpdateCameraPosition = throttle(updateCameraPosition, 100);

// Добавляем обработчик скролла
window.addEventListener('scroll', throttledUpdateCameraPosition);

// Cцена корректно масштабиhetncz при изменения размера окна
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });

// Анимация (рендеринг сцены и плавное обновление камеры)
function animate() {
    requestAnimationFrame(animate);
    smoothCameraUpdate(); // Плавное обновление позиции и вращения камеры
    renderer.render(scene, camera);
}
animate();