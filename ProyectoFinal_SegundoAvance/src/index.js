const HEXAGON_RADIUS = 10;
const HEXAGON_APOTHEM = HEXAGON_RADIUS / (2 * Math.tan(Math.PI / 6));

const canvas = document.getElementById("webglcanvas");
const duration = 10000;

let camera, scene, renderer, controls, effect;
let treesType0 = [];
let roadRocks = [];
let structures = [];
let timestamp = 0;

const TILE = {
    EMPTY: 'EMPTY',
    FOREST0: 'FOREST0',
    CIVILIZATION: 'CIVILIZATION'
};

// Helper functions
const occursWithProbability = (probability) => Math.random() < probability; // Returns a boolean with after evaluating a given probability
const distanceToRect = (A, B, x, y) => Math.abs((A*x+B*y)/Math.hypot(A, B)); // Distance between a point and a rect

const main = async () => {
    await createScene();
    update();
}

const update = () => {
    const now = Date.now();
    const deltat = now - timestamp;
    timestamp = now;
    const fract = deltat / duration;
    requestAnimationFrame(update);

    effect.render(scene, camera);
}

const getPaperMaterial = (wS, wT) => {
    const map = new THREE.TextureLoader().load('../textures/paperBackground.jpg');
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(wS, wT);
    const material = new THREE.MeshToonMaterial({ map });
    const fourTone = new THREE.TextureLoader().load('../textures/fourTone.jpg')
    fourTone.minFilter = THREE.NearestFilter
    fourTone.magFilter = THREE.NearestFilter
    material.gradientMap = fourTone
    return material;
};

const loadDAE = async (path, scale, rotationY) => {
    const paperMaterial = getPaperMaterial(5, 5);
    let object = new THREE.Object3D();
    try {
        const result = await new THREE.ColladaLoader().loadAsync(path);
        object = result.scene;
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = paperMaterial;
                child.castShadow = true;
            }
        });
        if (scale) object.scale.set(scale, scale, scale);
        if (rotationY) object.rotation.y = rotationY;
        return object;
    } catch (err){
        console.error(err);
    }
};

const loadOBJ = async (path, scale, rotationY, rotationX) => {
    const paperMaterial = getPaperMaterial(5, 5);
    let object = new THREE.Object3D();
    try {
        const result = await new THREE.OBJLoader().loadAsync(path);
        object = result;
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = paperMaterial;
                child.castShadow = true;
            }
        });
        if (scale) object.scale.set(scale, scale, scale);
        if (rotationY) object.rotation.y = rotationY;
        if (rotationX) object.rotation.x = rotationX;
        return object;
    } catch (err){
        console.error(err);
    }
};

const fetchModels = async () => {
    // Trees
    treesType0.push(await loadDAE('../models/trees/Tree_Type0_05.dae'));
    treesType0.push(await loadDAE('../models/trees/Tree_Type0_06.dae'));
    treesType0.push(await loadDAE('../models/trees/Tree_Type5_02.dae'));
    // Road rocks
    roadRocks.push(await loadOBJ('../models/rocks/road_rock_01.obj', 0.005));
    roadRocks.push(await loadOBJ('../models/rocks/road_rock_02.obj', 0.6, null, Math.PI));
    // Structures
    structures.push(await loadOBJ('../models/structures/house_01.obj', 0.2, -Math.PI/2));
    structures.push(await loadOBJ('../models/structures/house_02.obj', 0.3, Math.PI/3));
    structures.push(await loadOBJ('../models/structures/house_03.obj', 0.08, -Math.PI/2));
    structures.push(await loadOBJ('../models/structures/house_04.obj', 0.2, -Math.PI/2));
    structures.push(await loadOBJ('../models/structures/house_05.obj', 0.12, -Math.PI/2));
    structures.push(await loadOBJ('../models/structures/house_06.obj', 0.1, -Math.PI/2));
    structures.push(...structures, ...structures);
    structures.push(await loadOBJ('../models/structures/destroyed_house_01.obj', 0.2, -Math.PI/2));
    structures.push(await loadOBJ('../models/structures/church_01.obj', 0.2, -Math.PI/2));
    structures.push(await loadOBJ('../models/structures/silo_01.obj', 0.1, -Math.PI/2));
    
};

const createTile = (type, x, y, activeRoads) => {
    const tile = new THREE.Object3D();
    const hexagon = createHexagon(x, y);
    let content;
    switch (type) {
        case TILE.EMPTY:
            content = new THREE.Object3D();;
            break;
        case TILE.FOREST0:
            content = createForest0Tile();
            break;
        case TILE.CIVILIZATION:
            content = createCivilizationTile(activeRoads);
            break;
        default:
            break;
    }
    tile.add(hexagon);
    tile.add(content);
    tile.position.set(x, 0, y)
    scene.add(tile);
}

const createHexagon = () => {
    // Get material
    const paperMaterial = getPaperMaterial(3, 4);

    // Create hexagon
    const hexagonPoints = [
        new THREE.Vector3(0, HEXAGON_RADIUS, 0),
        new THREE.Vector3(HEXAGON_RADIUS*0.866, HEXAGON_RADIUS*0.5, 0),
        new THREE.Vector3(HEXAGON_RADIUS*0.866, -HEXAGON_RADIUS*0.5, 0),
        new THREE.Vector3(0, -HEXAGON_RADIUS, 0),
        new THREE.Vector3(-HEXAGON_RADIUS*0.866, -HEXAGON_RADIUS*0.5, 0),
        new THREE.Vector3(-HEXAGON_RADIUS*0.866, HEXAGON_RADIUS*0.5, 0),
    ];
    const hexagonShape = new THREE.Shape(hexagonPoints);
    const hexagonGeometry = new THREE.ShapeGeometry(hexagonShape);
    const hexagonMesh = new THREE.Mesh(hexagonGeometry, paperMaterial);
    hexagonMesh.receiveShadow = true;  
    hexagonMesh.rotateX(THREE.Math.degToRad(-90));

    // Create outline for hexagon
    const outlinePoints = [];
    hexagonPoints.forEach((coords) => outlinePoints.push(...Object.values(coords)));
    outlinePoints.push(...Object.values(hexagonPoints[0]));
    const outlineGeometry = new THREE.LineGeometry();
    outlineGeometry.setPositions(outlinePoints);
    const lineMaterial = new THREE.LineMaterial({
        color: 0x555555,
        linewidth: 4
    });
    lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
    const outline = new THREE.Line2(outlineGeometry, lineMaterial);
    hexagonMesh.add(outline);

    // Add hexagon to scene
    return hexagonMesh;
}  

const createTree = (type, X, Y) => {
    let treeMesh;
    switch (type) {
        case TILE.FOREST0:
            treeMesh = treesType0[Math.floor(Math.random() * treesType0.length)].clone();
            break;
        default:
            break;
    }
    treeMesh.position.set(X, 0, Y);
    return treeMesh;
}

const createForest0Tile = () => {
    const forest0 = new THREE.Object3D();
    for (let lowerX = -HEXAGON_RADIUS + 0; lowerX < HEXAGON_RADIUS; lowerX+=2) {
        for (let lowerY = -HEXAGON_RADIUS + 0; lowerY < HEXAGON_RADIUS; lowerY+=2) {
            const x = Math.random() * 2 + lowerX;
            const y = Math.random() * 2 + lowerY;
            const radius = Math.hypot(x, y);
            if (radius < HEXAGON_RADIUS - 0.1) {
                const tree = createTree(TILE.FOREST0, x, y);
                forest0.add(tree);
            }
        }
    }
    return forest0;
}

const createStructure = (X, Y, rotation) => {
    const structureMesh = structures[Math.floor(Math.random() * structures.length)].clone();
    structureMesh.position.set(X, 0, Y);
    structureMesh.rotation.y = rotation;
    return structureMesh;
}

const createRoadRock = (X, Y) => {
    const rockMesh = roadRocks[0].clone();
    rockMesh.position.set(X, -0.05, Y);
    rockMesh.rotation.y = Math.random() * 2 * Math.PI;
    return rockMesh;
};

const createCivilizationTile = (activeRoads = []) => {
    const civilization = new THREE.Object3D();
    const structureRadius = HEXAGON_RADIUS - 5;
    const structureParams = [
        [-structureRadius, 0, 0],
        [-structureRadius*0.5, -structureRadius*0.866, 5*Math.PI/3],
        [structureRadius*0.5, -structureRadius*0.866, 4*Math.PI/3],
        [structureRadius, 0, Math.PI],
        [structureRadius*0.5, structureRadius*0.866, 2*Math.PI/3],
        [-structureRadius*0.5, structureRadius*0.866, Math.PI/3],
    ];
    structureParams.forEach((params, i) => {
        if (!activeRoads.includes(i)) {
            const structure = createStructure(...params);
            civilization.add(structure);
        }
    });
    const treesRadius = HEXAGON_RADIUS - 2;
    const treesAreaRadius = 2;
    const treesPoints = [
        [0, treesRadius],
        [treesRadius*0.866, treesRadius*0.5],
        [treesRadius*0.866, -treesRadius*0.5],
        [0, -treesRadius],
        [-treesRadius*0.866, -treesRadius*0.5],
        [-treesRadius*0.866, treesRadius*0.5],
    ];
    treesPoints.forEach(([origin_x, origin_y]) => {
        for (let lowerX = origin_x - treesAreaRadius; lowerX < origin_x + treesAreaRadius; lowerX+=2) {
            for (let lowerY = origin_y - treesAreaRadius; lowerY < origin_y + treesAreaRadius; lowerY+=2) {
                if (occursWithProbability(0.6)) {
                    const x = Math.random() + lowerX;
                    const y = Math.random() + lowerY;
                    const tree = createTree(TILE.FOREST0, x, y);
                    civilization.add(tree);
                }
            }
        }
    });
    const pointInRoad = [
        (x, y, roadWidth) => x < 0 && (distanceToRect(0, 1, x, y) < roadWidth || (occursWithProbability(0.1) && distanceToRect(0, 1, x, y) < roadWidth * 1.25)),
        (x, y, roadWidth) => y < 0 && (distanceToRect(Math.tan(Math.PI/3), -1, x, y) < roadWidth || (occursWithProbability(0.1) && distanceToRect(Math.tan(Math.PI/3), -1, x, y) < roadWidth * 1.25)),
        (x, y, roadWidth) => y < 0 && (distanceToRect(-Math.tan(Math.PI/3), -1, x, y) < roadWidth || (occursWithProbability(0.1) && distanceToRect(-Math.tan(Math.PI/3), -1, x, y) < roadWidth * 1.25)),
        (x, y, roadWidth) => x > 0 && (distanceToRect(0, 1, x, y) < roadWidth || (occursWithProbability(0.1) && distanceToRect(0, 1, x, y) < roadWidth * 1.25)),
        (x, y, roadWidth) => y > 0 && (distanceToRect(Math.tan(Math.PI/3), -1, x, y) < roadWidth || (occursWithProbability(0.1) && distanceToRect(Math.tan(Math.PI/3), -1, x, y) < roadWidth * 1.25)),
        (x, y, roadWidth) => y > 0 && (distanceToRect(-Math.tan(Math.PI/3), -1, x, y) < roadWidth || (occursWithProbability(0.1) && distanceToRect(-Math.tan(Math.PI/3), -1, x, y) < roadWidth * 1.25)),
    ];
    const belongsToRoad = (x, y) => {
        // Belongs to the center of the hexagon
        const roadWidth = HEXAGON_RADIUS / 7;
        const radius = Math.hypot(x, y);
        if (radius > HEXAGON_APOTHEM) return false;
        if (radius < roadWidth * 1.25) return true;
        // Blongs to one of the 6 possible roads
        return activeRoads.some((road) => pointInRoad[road](x, y, roadWidth));
    };
    for (let lowerX = -HEXAGON_APOTHEM; lowerX < HEXAGON_APOTHEM; lowerX+=0.25) {
        for (let lowerY = -HEXAGON_APOTHEM; lowerY < HEXAGON_APOTHEM; lowerY+=0.25) {
            if (occursWithProbability(0.8)) {
                const x = Math.random() * 0.2 + lowerX;
                const y = Math.random() * 0.2 + lowerY;
                if (belongsToRoad(x, y)) {
                    const roadRock = createRoadRock(x, y);
                    civilization.add(roadRock);
                }
            }
        }
    }
    return civilization;
}

const createScene = async () => {
    // Configurar la escena de Three.js
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true, alpha: true } );
    renderer.setSize(canvas.width, canvas.height);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 80, 100);
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Agregar una directional light para poder visualizar los objetos y posicionarla
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0);
    directionalLight.position.set(-1.5, 2, 2);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    // Ambient light
    // const ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    // scene.add(ambientLight);

    // Añadir background a la excena 0xfef5dc
    const paperBackground = new THREE.TextureLoader().load('../textures/paperBackground.jpg');
    paperBackground.wrapS = THREE.RepeatWrapping;
    paperBackground.wrapT = THREE.RepeatWrapping;
    paperBackground.repeat.set( 4, 4 );
    scene.background = paperBackground;

    // Efecto de delineado de elementos
    effect = new THREE.OutlineEffect( renderer );

    await fetchModels();

    // 1
    createTile(TILE.FOREST0, -3*HEXAGON_RADIUS*0.866, -9*HEXAGON_RADIUS*0.5);
    createTile(TILE.FOREST0, -HEXAGON_RADIUS*0.866, -9*HEXAGON_RADIUS*0.5);
    createTile(TILE.FOREST0, HEXAGON_RADIUS*0.866, -9*HEXAGON_RADIUS*0.5);
    createTile(TILE.FOREST0, 3*HEXAGON_RADIUS*0.866, -9*HEXAGON_RADIUS*0.5);
    // 2
    createTile(TILE.FOREST0, -4*HEXAGON_RADIUS*0.866, -6*HEXAGON_RADIUS*0.5);
    createTile(TILE.CIVILIZATION, -2*HEXAGON_RADIUS*0.866, -6*HEXAGON_RADIUS*0.5, [3]);
    createTile(TILE.CIVILIZATION, 0, -6*HEXAGON_RADIUS*0.5, [0, 4]);
    createTile(TILE.FOREST0, 2*HEXAGON_RADIUS*0.866, -6*HEXAGON_RADIUS*0.5);
    createTile(TILE.FOREST0, 4*HEXAGON_RADIUS*0.866, -6*HEXAGON_RADIUS*0.5);
    // 3
    createTile(TILE.FOREST0, -5*HEXAGON_RADIUS*0.866, -3*HEXAGON_RADIUS*0.5);
    createTile(TILE.FOREST0, -3*HEXAGON_RADIUS*0.866, -3*HEXAGON_RADIUS*0.5);
    createTile(TILE.FOREST0, -HEXAGON_RADIUS*0.866, -3*HEXAGON_RADIUS*0.5);
    createTile(TILE.CIVILIZATION, HEXAGON_RADIUS*0.866, -3*HEXAGON_RADIUS*0.5, [1, 3, 5]);
    createTile(TILE.CIVILIZATION, 3*HEXAGON_RADIUS*0.866, -3*HEXAGON_RADIUS*0.5, [0, 4]);
    createTile(TILE.FOREST0, 5*HEXAGON_RADIUS*0.866, -3*HEXAGON_RADIUS*0.5);
    // 4
    createTile(TILE.FOREST0, -6*HEXAGON_RADIUS*0.866, 0);
    createTile(TILE.CIVILIZATION, -4*HEXAGON_RADIUS*0.866, 0, [3]);
    createTile(TILE.CIVILIZATION, -2*HEXAGON_RADIUS*0.866, 0, [0, 3, 5]);
    createTile(TILE.CIVILIZATION, 0, 0, [0, 2, 4]);
    createTile(TILE.FOREST0, 2*HEXAGON_RADIUS*0.866, 0);
    createTile(TILE.CIVILIZATION, 4*HEXAGON_RADIUS*0.866, 0, [1, 5]);
    createTile(TILE.FOREST0, 6*HEXAGON_RADIUS*0.866, 0);
    // 5
    createTile(TILE.FOREST0, -5*HEXAGON_RADIUS*0.866, 3*HEXAGON_RADIUS*0.5);
    createTile(TILE.CIVILIZATION, -3*HEXAGON_RADIUS*0.866, 3*HEXAGON_RADIUS*0.5, [2, 4]);
    createTile(TILE.FOREST0, -HEXAGON_RADIUS*0.866, 3*HEXAGON_RADIUS*0.5);
    createTile(TILE.CIVILIZATION, HEXAGON_RADIUS*0.866, 3*HEXAGON_RADIUS*0.5, [1, 3]);
    createTile(TILE.CIVILIZATION, 3*HEXAGON_RADIUS*0.866, 3*HEXAGON_RADIUS*0.5, [0, 2, 5]);
    createTile(TILE.FOREST0, 5*HEXAGON_RADIUS*0.866, 3*HEXAGON_RADIUS*0.5);
    // 6
    createTile(TILE.FOREST0, -4*HEXAGON_RADIUS*0.866, 6*HEXAGON_RADIUS*0.5);
    createTile(TILE.CIVILIZATION, -2*HEXAGON_RADIUS*0.866, 6*HEXAGON_RADIUS*0.5, [1, 3]);
    createTile(TILE.CIVILIZATION, 0, 6*HEXAGON_RADIUS*0.5, [0, 3]);
    createTile(TILE.CIVILIZATION, 2*HEXAGON_RADIUS*0.866, 6*HEXAGON_RADIUS*0.5, [0, 2]);
    createTile(TILE.FOREST0, 4*HEXAGON_RADIUS*0.866, 6*HEXAGON_RADIUS*0.5);
    // 7
    createTile(TILE.FOREST0, -3*HEXAGON_RADIUS*0.866, 9*HEXAGON_RADIUS*0.5);
    createTile(TILE.FOREST0, -HEXAGON_RADIUS*0.866, 9*HEXAGON_RADIUS*0.5);
    createTile(TILE.FOREST0, HEXAGON_RADIUS*0.866, 9*HEXAGON_RADIUS*0.5);
    createTile(TILE.FOREST0, 3*HEXAGON_RADIUS*0.866, 9*HEXAGON_RADIUS*0.5);
}

main();