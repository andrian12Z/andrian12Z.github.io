import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

// ======================================
// 1. BASIC SCENE
// ======================================

const container = document.getElementById('hero-3d');

if (container) {

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        38,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );

    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);


    // ======================================
    // 2. LIGHTING
    // ======================================

    const ambientLight = new THREE.AmbientLight(
        0xffffff,
        1.5
    );

    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(
        0xffffff,
        35,
        30
    );

    mainLight.position.set(4, 5, 6);
    scene.add(mainLight);

    const secondaryLight = new THREE.PointLight(
        0x8c9aaa,
        25,
        25
    );

    secondaryLight.position.set(-5, -3, 4);
    scene.add(secondaryLight);


    // ======================================
    // 3. MATERIALS
    // ======================================

    const cubeMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95
    });

    const chainMaterial = new THREE.MeshStandardMaterial({
        color: 0xbfc5cc,
        metalness: 0.9,
        roughness: 0.22
    });


    // ======================================
    // 4. MAIN WIRE FRAME CUBE
    // ======================================

    const cubeGroup = new THREE.Group();

    scene.add(cubeGroup);

    const cubeGeometry = new THREE.BoxGeometry(
        2.2,
        2.2,
        2.2
    );

    const edgesGeometry = new THREE.EdgesGeometry(
        cubeGeometry
    );

    const wireframe = new THREE.LineSegments(
        edgesGeometry,
        cubeMaterial
    );

    cubeGroup.add(wireframe);


    // Inner cube for extra depth

    const innerGeometry = new THREE.BoxGeometry(
        1.15,
        1.15,
        1.15
    );

    const innerEdges = new THREE.EdgesGeometry(
        innerGeometry
    );

    const innerCube = new THREE.LineSegments(
        innerEdges,
        new THREE.LineBasicMaterial({
            color: 0x9da8b5,
            transparent: true,
            opacity: 0.45
        })
    );

    cubeGroup.add(innerCube);


    // ======================================
    // 5. CHAIN LINK GEOMETRY
    // ======================================

    const chainGeometry = new THREE.TorusGeometry(
        0.19,
        0.065,
        8,
        16
    );

    chainGeometry.scale(1.45, 1, 1);


    // ======================================
    // 6. CREATE ROTATING CHAINS
    // ======================================

    const chainGroups = [];

    const chainConfigurations = [

        {
            radiusX: 2.5,
            radiusY: 1.8,
            links: 30,
            rotation: [0.3, 0.2, 0.4],
            speed: 0.65,
            direction: 1
        },

        {
            radiusX: 2.8,
            radiusY: 1.5,
            links: 32,
            rotation: [1.1, 0.4, 0.2],
            speed: 0.85,
            direction: -1
        },

        {
            radiusX: 2.2,
            radiusY: 2.1,
            links: 28,
            rotation: [0.5, 1.2, 0.8],
            speed: 1.0,
            direction: 1
        },

        {
            radiusX: 2.7,
            radiusY: 1.9,
            links: 34,
            rotation: [1.4, 0.8, 1.1],
            speed: 0.75,
            direction: -1
        },

        {
            radiusX: 2.3,
            radiusY: 2.3,
            links: 30,
            rotation: [0.8, 1.5, 0.3],
            speed: 1.15,
            direction: 1
        }

    ];


    chainConfigurations.forEach((config, index) => {

        const orbitGroup = new THREE.Group();

        orbitGroup.rotation.set(
            config.rotation[0],
            config.rotation[1],
            config.rotation[2]
        );

        scene.add(orbitGroup);


        const linksGroup = new THREE.Group();

        orbitGroup.add(linksGroup);


        for (let i = 0; i < config.links; i++) {

            const angle =
                (i / config.links) * Math.PI * 2;

            const link = new THREE.Mesh(
                chainGeometry,
                chainMaterial
            );

            link.position.set(
                Math.cos(angle) * config.radiusX,
                Math.sin(angle) * config.radiusY,
                0
            );

            // Alternate chain link orientation

            link.rotation.z = angle + Math.PI / 2;

            if (i % 2 === 0) {
                link.rotation.x = Math.PI / 2;
            }

            linksGroup.add(link);

        }


        chainGroups.push({

            group: orbitGroup,
            speed: config.speed,
            direction: config.direction,
            index: index

        });

    });


    // ======================================
    // 7. ANIMATION
    // ======================================

    const clock = new THREE.Clock();

    function animate() {

        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        const elapsed = clock.elapsedTime;


        // Cube rotation: slower

        cubeGroup.rotation.x += delta * 0.22;
        cubeGroup.rotation.y += delta * 0.30;
        cubeGroup.rotation.z += delta * 0.12;


        // Constantly changing cube angles

        cubeGroup.rotation.x +=
            Math.sin(elapsed * 0.35) * 0.0008;

        cubeGroup.rotation.y +=
            Math.cos(elapsed * 0.28) * 0.0008;


        // Chain rotations: faster

        chainGroups.forEach((chain) => {

            const direction = chain.direction;
            const speed = chain.speed;

            const t = elapsed + chain.index * 2;


            chain.group.rotation.x +=
                delta * speed * direction;

            chain.group.rotation.y +=
                delta * speed * 0.65 * direction;

            chain.group.rotation.z +=
                delta * speed * 0.45 * direction;


            // Dynamic changing angles

            chain.group.rotation.x +=
                Math.sin(t * 0.7) * 0.0015;

            chain.group.rotation.y +=
                Math.cos(t * 0.6) * 0.0015;

        });


        // Subtle floating movement

        scene.position.y = Math.sin(elapsed * 0.7) * 0.08;


        renderer.render(scene, camera);

    }

    animate();


    // ======================================
    // 8. RESPONSIVE RESIZE
    // ======================================

    window.addEventListener('resize', () => {

        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

    });

}