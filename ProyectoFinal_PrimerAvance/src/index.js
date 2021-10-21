const canvas = document.getElementById("webglcanvas");
const HEXAGON_RADIUS = 6;
let camera, scene, renderer, controls, effect;
let treesType0 = [];
let timestamp = 0;

const TILE = {
    EMPTY: 'EMPTY',
    FOREST: 'FOREST'
};

const TREE = {
    FOREST: 'FOREST'
};

const main = async () => {
    await createScene();
    update();
}

const update = () => {
    timestamp = Date.now() * 0.0001;
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

const loadDAE = async (path) => {
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
        return object;
    } catch (err){
        console.error(err);
    }
};

const fetchModels = async () => {
    treesType0.push(await loadDAE('../models/trees/Tree_Type0_05.dae'));
    treesType0.push(await loadDAE('../models/trees/Tree_Type0_06.dae'));
    treesType0.push(await loadDAE('../models/trees/Tree_Type5_02.dae'));
};

const createTile = (type, x, y) => {
    const tile = new THREE.Object3D();
    const hexagon = createHexagon(x, y);
    let content;
    switch (type) {
        case TILE.EMPTY:
            content = new THREE.Object3D();;
            break;
        case TILE.FOREST:
            content = createForest();
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
    hexagonMesh.rotation.x = -Math.PI/2;

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
        case TREE.FOREST:
            treeMesh = treesType0[Math.floor(Math.random() * treesType0.length)].clone();
            break;
        default:
            break;
    }
    treeMesh.position.set(X, 0, Y);
    return treeMesh;
}

const createForest = () => {
    const forest = new THREE.Object3D();
    for (let lowerX = -HEXAGON_RADIUS + 0; lowerX < HEXAGON_RADIUS; lowerX+=2) {
        for (let lowerY = -HEXAGON_RADIUS + 0; lowerY < HEXAGON_RADIUS; lowerY+=2) {
            const x = Math.random() * 2 + lowerX;
            const y = Math.random() * 2 + lowerY;
            const radius = Math.hypot(x, y);
            if (radius < HEXAGON_RADIUS - 0.1) {
                const tree = createTree(TREE.FOREST, x, y);
                forest.add(tree);
            }
        }
    }
    return forest;
}

const createScene = async () => {
    // Configurar la escena de Three.js
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true, alpha: true } );
    renderer.setSize(canvas.width, canvas.height);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 2, 15);
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

    createTile(TILE.FOREST, 0, 0);
    createTile(TILE.EMPTY, 2*HEXAGON_RADIUS*0.866, 0);
    createTile(TILE.EMPTY, -2*HEXAGON_RADIUS*0.866, 0);
    createTile(TILE.EMPTY, HEXAGON_RADIUS*0.866, 3*HEXAGON_RADIUS*0.5);
    createTile(TILE.EMPTY, HEXAGON_RADIUS*0.866, -3*HEXAGON_RADIUS*0.5);
    createTile(TILE.EMPTY, -HEXAGON_RADIUS*0.866, 3*HEXAGON_RADIUS*0.5);
    createTile(TILE.EMPTY, -HEXAGON_RADIUS*0.866, -3*HEXAGON_RADIUS*0.5);
}

main();