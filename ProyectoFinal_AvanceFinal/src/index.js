/**
 * PROYECTO FINAL: GRÁFICAS COMPUTACIONES
 * A01026567 - Andrés Barragán Salas
 * A01027304 - Luis Emilio Alcántara Guzman
 * A01027077 - Esteban Manrique de Lara Sirvent
 */

// Constantes
const WIDTH = 8, HEIGHT = 7; 
const HEXAGON_RADIUS = 10;
const HEXAGON_APOTHEM = HEXAGON_RADIUS / (2 * Math.tan(Math.PI / 6));

// Elementos de HTML 
const canvas = document.getElementById('webglcanvas');
const tooltip = document.getElementById('tooltip');
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('progress-bar');

// Variables globales
let tiles_info = [];
let camera, scene, renderer, controls, effect, raycaster, mouse;
let treesType0 = [];
let treesType1 = [];
let roadRocks = [];
let structures = [];
let hexagons = [];
let cropPlant, silo, scarecrow;
let goodCharacter, evilCharacter;
let editTileIndex;

// Tipos de tile
const TILE = {
    EMPTY: 'EMPTY',
    FOREST0: 'FOREST0',
    FOREST1: 'FOREST1',
    CIVILIZATION0: 'CIVILIZATION0',
    CIVILIZATION1: 'CIVILIZATION1',
    CROP: 'CROP'
};

// Tipos de personajes
const CHARACTER = {
    GOOD: 'GOOD',
    EVIL: 'EVIL'
};

// Información del mapa default
const defaultMap = [
    [{type: TILE.FOREST1, roads: []}, {type: TILE.FOREST1, roads: []}, {type: TILE.FOREST1, roads: []}, {type: TILE.FOREST1, roads: []}, {type: TILE.FOREST1, roads: []}, {type: TILE.FOREST0, roads: []}, {type: TILE.FOREST0, roads: []}, {type: TILE.FOREST0, roads: []}],
    [{type: TILE.FOREST1, roads: []}, {type: TILE.CIVILIZATION1, roads: [3]}, {type: TILE.CIVILIZATION1, roads: [0, 3]}, {type: TILE.CIVILIZATION1, roads: [0, 3]}, {type: TILE.CIVILIZATION1, roads: [0, 4]}, {type: TILE.FOREST0, roads: []}, {type: TILE.FOREST0, roads: []}, {type: TILE.CIVILIZATION0, roads: [5]}, {type: TILE.FOREST0, roads: []}],
    [{type: TILE.FOREST1, roads: []}, {type: TILE.FOREST1, roads: []}, {type: TILE.FOREST1, roads: []}, {type: TILE.FOREST1, roads: []}, {type: TILE.CIVILIZATION0, roads: [1, 3, 5]}, {type: TILE.CIVILIZATION0, roads: [0, 3, 4]}, {type: TILE.CIVILIZATION0, roads: [0, 2, 4]}, {type: TILE.FOREST0, roads: []}],
    [{type: TILE.FOREST1, roads: []}, {type: TILE.CIVILIZATION1, roads: [3, 5]}, {type: TILE.CIVILIZATION1, roads: [0, 3]}, {type: TILE.CIVILIZATION1, roads: [0, 3, 5]}, {type: TILE.CIVILIZATION0, roads: [0, 2, 4]}, {type: TILE.FOREST0, roads: []}, {type: TILE.CIVILIZATION0, roads: [1, 5]}, {type: TILE.CIVILIZATION0, roads: [1]}, {type: TILE.FOREST0, roads: []}],
    [{type: TILE.CIVILIZATION1, roads: [2]}, {type: TILE.FOREST1, roads: []}, {type: TILE.CIVILIZATION1, roads: [2, 4]}, {type: TILE.FOREST0, roads: []}, {type: TILE.CIVILIZATION0, roads: [1, 3]}, {type: TILE.CIVILIZATION0, roads: [0, 2, 5]}, {type: TILE.FOREST0, roads: []}, {type: TILE.FOREST0, roads: []}],
    [{type: TILE.FOREST1, roads: []}, {type: TILE.FOREST1, roads: []}, {type: TILE.CROP, roads: []}, {type: TILE.CIVILIZATION0, roads: [1, 3]}, {type: TILE.CIVILIZATION0, roads: [0, 3]}, {type: TILE.CIVILIZATION0, roads: [0, 2]}, {type: TILE.CROP, roads: []}, {type: TILE.CROP, roads: []}, {type: TILE.FOREST0, roads: []} ],
    [{type: TILE.FOREST1, roads: []}, {type: TILE.CROP, roads: []}, {type: TILE.CROP, roads: []}, {type: TILE.FOREST0, roads: []}, {type: TILE.CROP, roads: []}, {type: TILE.CROP, roads: []}, {type: TILE.CROP, roads: []}, {type: TILE.FOREST0, roads: []}]
];

// Helper functions
const occursWithProbability = (probability) => Math.random() < probability; // Returns a boolean with after evaluating a given probability
const distanceToRect = (A, B, x, y) => Math.abs((A*x+B*y)/Math.hypot(A, B)); // Distance between a point and a rect

const main = async () => {
    window.handleUpdate = handleUpdate;
    window.setDefaultMap = setDefaultMap;
    window.addEventListener('mousedown', onMouseDown, false);
    await createScene();
    update();
}

const update = () => {
    requestAnimationFrame(update);
    effect.render(scene, camera);
}

// Material utilizado en todasw los objetos de la escena
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

// Carga de archivos .dae
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
        // Se modifican las propiedades del objeto
        if (scale) object.scale.set(scale, scale, scale);
        if (rotationY) object.rotation.y = rotationY;
        return object;
    } catch (err){
        console.error(err);
    }
};

// Carga de archivos .obj
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
        // Se modifican las propiedades del objeto
        if (scale) object.scale.set(scale, scale, scale);
        if (rotationY) object.rotation.y = rotationY;
        if (rotationX) object.rotation.x = rotationX;
        return object;
    } catch (err){
        console.error(err);
    }
};

// Carga de todos los modelos al inicio del programa
const fetchModels = async () => {
    // Arboles
    treesType0.push(await loadDAE('../models/trees/Tree_Type0_05.dae'));
    treesType0.push(await loadDAE('../models/trees/Tree_Type0_06.dae'));
    treesType0.push(await loadDAE('../models/trees/Tree_Type5_02.dae'));
    treesType1.push(await loadDAE('../models/trees/Tree_Type1_02.dae'));
    treesType1.push(await loadDAE('../models/trees/Tree_Type1_03.dae'));
    treesType1.push(await loadDAE('../models/trees/Tree_Type1_04.dae'));
    progressBar.value = 30;
    // Rocas del camino
    roadRocks.push(await loadOBJ('../models/rocks/road_rock_01.obj', 0.005));
    roadRocks.push(await loadOBJ('../models/rocks/road_rock_02.obj', 0.6, null, Math.PI));
    progressBar.value = 45;
    // Estructuras
    structures.push(await loadOBJ('../models/structures/house_01.obj', 0.2, -Math.PI/2));
    structures.push(await loadOBJ('../models/structures/house_02.obj', 0.3, Math.PI/3));
    structures.push(await loadOBJ('../models/structures/house_03.obj', 0.08, -Math.PI/2));
    structures.push(await loadOBJ('../models/structures/house_04.obj', 0.2, -Math.PI/2));
    structures.push(await loadOBJ('../models/structures/house_05.obj', 0.12, -Math.PI/2));
    structures.push(await loadOBJ('../models/structures/house_06.obj', 0.1, -Math.PI/2));
    structures.push(...structures, ...structures);
    structures.push(await loadOBJ('../models/structures/destroyed_house_01.obj', 0.2, -Math.PI/2));
    structures.push(await loadOBJ('../models/structures/church_01.obj', 0.2, -Math.PI/2));
    progressBar.value = 75;
    // Sembradíos
    cropPlant = await loadOBJ('../models/crops/crop_plant_01.obj', 0.75);
    silo = await loadOBJ('../models/crops/silo_01.obj', 0.1, -Math.PI/2);
    scarecrow = await loadOBJ('../models/crops/scarecrow_01.obj', 0.3);
    progressBar.value = 90;
    // Personajes
    goodCharacter = await loadOBJ('../models/characters/good_character_01.obj', 0.005);
    evilCharacter = await loadOBJ('../models/characters/evil_character_01.obj', 0.05);
    progressBar.value = 100;
    // Mostrar contenido
    loadingScreen.classList.remove('active');  
};

// Creacion general de las tiles
const createTile = (type, x, y, activeRoads, xIndex, yIndex) => {
    const tile = new THREE.Object3D();
    const hexagon = createHexagon(xIndex, yIndex);
    // El contenido se genera dependiendo el tipo de tile
    let content;
    switch (type) {
        case TILE.EMPTY:
            content = new THREE.Object3D();;
            break;
        case TILE.FOREST0:
            content = createForestTile(TILE.FOREST0);
            break;
        case TILE.FOREST1:
            content = createForestTile(TILE.FOREST1);
            break;
        case TILE.CIVILIZATION0:
            content = createCivilizationTile(activeRoads, TILE.FOREST0);
            break;
        case TILE.CIVILIZATION1:
            content = createCivilizationTile(activeRoads, TILE.FOREST1);
            break;
        case TILE.CROP:
            content = createCropTile();
            break;
        default:
            break;
    }
    tile.add(hexagon);
    tile.add(content);
    tile.position.set(x, 0, y)
    scene.add(tile);
    return tile;
}

// Cambia el contenido de la tile cuando el usuario lo solicita
const updateTile = (xIndex, yIndex, type, activeRoads) => {
    // Obtener información del tile
    const tileInfo = tiles_info[yIndex][xIndex];
    // Remover el contenido anterior
    const tile = tileInfo.object;
    tile.children.pop();
    // Guardar la nueva información
    tileInfo.type = type;
    tileInfo.roads = activeRoads;
    // Agregar nuevo contenido
    let content;
    switch (type) {
        case TILE.EMPTY:
            content = new THREE.Object3D();;
            break;
        case TILE.FOREST0:
            content = createForestTile(TILE.FOREST0);
            break;
        case TILE.FOREST1:
            content = createForestTile(TILE.FOREST1);
            break;
        case TILE.CIVILIZATION0:
            content = createCivilizationTile(activeRoads, TILE.FOREST0);
            break;
        case TILE.CIVILIZATION1:
            content = createCivilizationTile(activeRoads, TILE.FOREST1);
            break;
        case TILE.CROP:
            content = createCropTile();
            break;
        default:
            break;
    }
    tile.add(content);
}

// Creación de hexagonos
const createHexagon = (xIndex, yIndex) => {
    // Obtener material
    const paperMaterial = getPaperMaterial(3, 4);

    // Crear la figura
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

    // Deliniado del hexagono
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
    hexagons.push(hexagonMesh);

    // Agregar el hexagono a la escena y añadir la información util
    hexagonMesh.userData = { xIndex, yIndex };
    return hexagonMesh;
}  

// Se genera un objeto de arbol
const createTree = (type, X, Y) => {
    let treeMesh;
    switch (type) {
        case TILE.FOREST0:
            treeMesh = treesType0[Math.floor(Math.random() * treesType0.length)].clone();
            break;
        case TILE.FOREST1:
            treeMesh = treesType1[Math.floor(Math.random() * treesType1.length)].clone();
            break;
        default:
            break;
    }
    treeMesh.position.set(X, 0, Y);
    return treeMesh;
}

// Creación de tile de bosques
const createForestTile = (forestType = TILE.FOREST0) => {
    const forest = new THREE.Object3D();
    // Se obtienen una distribución aleatoria de árboles
    for (let lowerX = -HEXAGON_RADIUS + 0; lowerX < HEXAGON_RADIUS; lowerX+=2) {
        for (let lowerY = -HEXAGON_RADIUS + 0; lowerY < HEXAGON_RADIUS; lowerY+=2) {
            const x = Math.random() * 2 + lowerX;
            const y = Math.random() * 2 + lowerY;
            const radius = Math.hypot(x, y);
            if (radius < HEXAGON_RADIUS - 0.1) {
                const tree = createTree(forestType, x, y);
                forest.add(tree);
            }
        }
    }
    return forest;
}


// Se genera un objeto de planta de sembradío
const createCropPlant = (X, Y) => {
    const plantMesh = cropPlant.clone();
    const height = Math.random() * 0.3 - 0.5;
    plantMesh.position.set(X, height, Y);
    return plantMesh;
}

// Creación de tile de sembradíos
const createCropTile = () => {
    const crop = new THREE.Object3D();
    // Se obtienen una distribución aleatoria de plantas
    for (let lowerX = -HEXAGON_APOTHEM; lowerX < HEXAGON_APOTHEM; lowerX+=1.5) {
        for (let lowerY = -HEXAGON_APOTHEM; lowerY < HEXAGON_APOTHEM; lowerY+=0.75) {
            const x = Math.random() * 0.3 + lowerX;
            const y = Math.random() * 0.3 + lowerY;
            const radius = Math.hypot(x, y);
            if (radius < HEXAGON_APOTHEM - 0.5) {
                const plant = createCropPlant(x, y);
                crop.add(plant);
            }
        }
    }
    // Se colocan (en algunos casos) silos o espantapajaros
    if (occursWithProbability(0.5)) {
        const rotation = Math.random() * 2 * Math.PI;
        if (occursWithProbability(0.3)) {
            const siloMesh = silo.clone();
            siloMesh.rotation.y = rotation;
            crop.add(siloMesh);
        } else {
            const scarecrowMesh = scarecrow.clone();
            scarecrowMesh.rotation.y = rotation;
            crop.add(scarecrowMesh);
        }
    }
    return crop;
}

// Se genera un objeto de estructura (casas, iglesia, casa destruida)
const createStructure = (X, Y, rotation) => {
    const structureMesh = structures[Math.floor(Math.random() * structures.length)].clone();
    structureMesh.position.set(X, 0, Y);
    structureMesh.rotation.y = rotation;
    return structureMesh;
}

// Se genera un objeto de roca de camino
const createRoadRock = (X, Y) => {
    const rockMesh = roadRocks[0].clone();
    rockMesh.position.set(X, -0.05, Y);
    rockMesh.rotation.y = Math.random() * 2 * Math.PI;
    return rockMesh;
};

// Se genera un objeto de personaje (malvado o bueno)
const createCharacter = (type, X, Y) => {
    const characterMesh = type === CHARACTER.GOOD ? goodCharacter.clone() : evilCharacter.clone();
    characterMesh.position.set(X, 0, Y);
    characterMesh.rotation.y = Math.random() * 2 * Math.PI;
    return characterMesh;
};

// Creación de tile de civilización
const createCivilizationTile = (activeRoads = [], forestType = TILE.FOREST0) => {
    const civilization = new THREE.Object3D();
    // Se obtienen las posiciones de las estructuras y se colocan
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
    // Se obtienen las posiciones de los árboles y se colocan
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
                    const tree = createTree(forestType, x, y);
                    civilization.add(tree);
                }
            }
        }
    });
    // Se colocan las rocas en el camino
    const pointInRoad = [
        (x, y, roadWidth) => x < 0 && (distanceToRect(0, 1, x, y) < roadWidth || (occursWithProbability(0.1) && distanceToRect(0, 1, x, y) < roadWidth * 1.25)),
        (x, y, roadWidth) => y < 0 && (distanceToRect(Math.tan(Math.PI/3), -1, x, y) < roadWidth || (occursWithProbability(0.1) && distanceToRect(Math.tan(Math.PI/3), -1, x, y) < roadWidth * 1.25)),
        (x, y, roadWidth) => y < 0 && (distanceToRect(-Math.tan(Math.PI/3), -1, x, y) < roadWidth || (occursWithProbability(0.1) && distanceToRect(-Math.tan(Math.PI/3), -1, x, y) < roadWidth * 1.25)),
        (x, y, roadWidth) => x > 0 && (distanceToRect(0, 1, x, y) < roadWidth || (occursWithProbability(0.1) && distanceToRect(0, 1, x, y) < roadWidth * 1.25)),
        (x, y, roadWidth) => y > 0 && (distanceToRect(Math.tan(Math.PI/3), -1, x, y) < roadWidth || (occursWithProbability(0.1) && distanceToRect(Math.tan(Math.PI/3), -1, x, y) < roadWidth * 1.25)),
        (x, y, roadWidth) => y > 0 && (distanceToRect(-Math.tan(Math.PI/3), -1, x, y) < roadWidth || (occursWithProbability(0.1) && distanceToRect(-Math.tan(Math.PI/3), -1, x, y) < roadWidth * 1.25)),
    ];
    const belongsToRoad = (x, y) => {
        // La roca pertenece al centro del camino
        const roadWidth = HEXAGON_RADIUS / 7;
        const radius = Math.hypot(x, y);
        if (radius > HEXAGON_APOTHEM) return false;
        if (radius < roadWidth * 1.25) return true;
        // La roca pertenece a uno de los 6 caminos posibles
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
    // Se coloca un numero random (0 a 3) de personajes buenos en el camino
    let goodCharacterCount = Math.floor(Math.random() * 4);
    while (goodCharacterCount > 0) {
        const xPos = Math.random() * 2 * HEXAGON_APOTHEM - HEXAGON_APOTHEM;
        const yPos = Math.random() * 2 * HEXAGON_APOTHEM - HEXAGON_APOTHEM;
        if (belongsToRoad(xPos, yPos)) {
            const character = createCharacter(CHARACTER.GOOD, xPos, yPos);
            civilization.add(character);
            goodCharacterCount--;
        }
    }
    // Se coloca (o no) un personaje malvado el el camino
    let evilCharacterCount = occursWithProbability(0.2) ? 1 : 0;
    while (evilCharacterCount > 0) {
        const xPos = Math.random() * 2 * HEXAGON_APOTHEM - HEXAGON_APOTHEM;
        const yPos = Math.random() * 2 * HEXAGON_APOTHEM - HEXAGON_APOTHEM;
        if (belongsToRoad(xPos, yPos)) {
            const character = createCharacter(CHARACTER.EVIL, xPos, yPos);
            civilization.add(character);
            evilCharacterCount--;
        }
    }
    return civilization;
}

// Evento de clicks en los hexagonos
const onMouseDown = (event) => {
    // Esconder el menu
    if (event.target.id === 'webglcanvas') {
        tooltip.classList.remove('active');   
    } else {
        return;
    }
    // Resetear click pasados
    hexagons.forEach((hexagon) => {
        const hexagonLines = hexagon.children[0];
        hexagonLines.material.color.set( 0x555555 );
    });
    // Actualizar el raycaster para seleccionar el hexagono
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);
	// Obtener los elementos con los que existe una intersección
	const intersects = raycaster.intersectObjects(hexagons);
	for ( var i = 0; i < intersects.length; i++ ) {
        // Cambiar el color del delineado a rojo
        const hexagon = intersects[i].object;
        const hexagonLines = hexagon.children[0];
		hexagonLines.material.color.set( 0xff0000 );
        // Obtener sus indices para realizar un posible cambio
        editTileIndex = hexagon.userData;
        tooltip.classList.add('active');
	}
}

// Actualizar los tiles con el form de html
const handleUpdate = (form) => {
    // Esconder el form
    tooltip.classList.remove('active');
    // Obtener valores del form
    const type = form.tiles.value;
    const activeRoads = [];
    for (let i = 0; i < 6; i++) {
        const name = 'road' + i;
        if (form[name].checked) {
            activeRoads.push(i);
        }
    }
    const { xIndex, yIndex } = editTileIndex;
    // Actualizar la tile
    updateTile(xIndex, yIndex, type, activeRoads);
};

// Colocar el mapa por default
const setDefaultMap = () => {
    defaultMap.forEach((row, yIndex) => {
        row.forEach((tile, xIndex) => {
            const { type, roads } = tile;
            updateTile(xIndex, yIndex, type, roads);
        });
    });
}

// Generar la escena
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
    
    // Añadir raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Efecto de delineado de elementos
    effect = new THREE.OutlineEffect( renderer );

    // Esperar a que todos los modelos carguen 
    await fetchModels();

    // Llenar la estructura de información con tiles vacios
    for (let y = -(Math.floor(HEIGHT/2)*3); y <= (Math.floor(HEIGHT/2)*3); y+=3) {
        let row_info = [];
        const { initialX, finalX } = y % 2 === 0 ? { initialX: -WIDTH, finalX: WIDTH } : { initialX: -(WIDTH - 1), finalX: WIDTH - 1 };
        for (let x = initialX; x <= finalX; x+=2) {
            row_info.push({ type: TILE.EMPTY, x: x*HEXAGON_RADIUS*0.866, y: y*HEXAGON_RADIUS*0.5, roads: [], object: null })
        }
        tiles_info.push(row_info);
    }

    // Presentar los tiles en la escena
    tiles_info.forEach((row, yIndex) => {
        row.forEach((tile, xIndex) => {
            const { type, x, y, roads } = tile;
            const newTile = createTile(type, x, y, roads, xIndex, yIndex);
            tile.object = newTile;
        });
    });
}

main();