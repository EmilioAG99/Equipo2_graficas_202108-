import * as THREE from "./libs/three.js/r131/three.module.js"

import { OrbitControls } from '../libs/three.js/r131/controls/OrbitControls.js';
import { OBJLoader } from '../libs/three.js/r131/loaders/OBJLoader.js';
import { MTLLoader } from '../libs/three.js/r131/loaders/MTLLoader.js';

let renderer = null, scene = null, camera = null; //Elementos generales de la escena
let orbitControls = null;
let modelsURL = [["./models/arbol/uploads_files_2812132_OBJ_JA19_TsugaDiversifolia_2.obj","./models/arbol/uploads_files_2812132_OBJ_JA19_TsugaDiversifolia_2.mtl", "arbol"],
["./models/casa1/House1ExportVersion.obj", "./models/casa1/House1ExportVersion.mtl", "casa1"],
["./models/puente/Old stone bridgeOBJ.obj", "./models/puente/Old stone bridgeOBJ.mtl", "puente"],
["./models/tienda/HOUSE.obj", "./models/tienda/HOUSE.mtl", "tienda"],
["./models/cosechas/calabazas/uploads_files_2116284_pumpkin.obj", "./models/cosechas/calabazas/uploads_files_2116284_pumpkin.mtl", "calabaza"],
["./models/cosechas/molino/windmill.obj", "./models/cosechas/molino/windmill.mtl", "molino"],
["./models/cosechas/trigo/wheat_cg_OBJ.obj", "./models/cosechas/trigo/wheat_cg_OBJ.mtl", "trigo"],
["./models/pato_hule/uploads_files_2662102_duck.obj", "./models/pato_hule/uploads_files_2662102_duck.mtl", "pato"],
["./models/serpiente/13104_Scarlet_Snake_v1_l3.obj", "./models/serpiente/13104_Scarlet_Snake_v1_l3.mtl", "serpiente"],
["", "", ""]];
let models = {};
//obj, luego mtl y finalmente nombre

function main() {
    cargarModelos();
    const canvas = document.getElementById("canvas");
    setTimeout(function(){createScene(canvas);update();}, 8500);
}

function animate(){

}

function update(){
    requestAnimationFrame(function() { update();});
    //Hace el rendering de la imagen
    renderer.render( scene, camera );
    animate();
    //Actualizacion de orbitControl para manejo de la escena
    orbitControls.update()
}

function onError ( err ){ console.error( err ); };

function onProgress( xhr ) {
    if ( xhr.lengthComputable ) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( xhr.target.responseURL, Math.round( percentComplete, 2 ) + '% downloaded' );
    }
}

async function cargarModelos(){
    for(var modelo of modelsURL){
        try{
            let model = {obj: modelo[0], mtl: modelo[1]}
            const mtlLoader = new MTLLoader();
            const materials = await mtlLoader.loadAsync(model.mtl, onProgress, onError);
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            models[modelo[2]] = await objLoader.loadAsync(model.obj, onProgress, onError);
        }
        catch(error){
            onError(error)
        }
    }
    console.log(models) 
}

function createScene(canvas){
    renderer = new THREE.WebGL1Renderer({canvas: canvas, antialias: true});
    renderer.setSize(canvas.width, canvas.height);
    scene = new THREE.Scene();

    const sceneBackground = new THREE.TextureLoader().load("./images/abijora.jpg")
    scene.background = sceneBackground

    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
    camera.position.set(0,0,100)
    scene.add(camera);

    const light = new THREE.DirectionalLight( 0xffffff, 1.0);

    light.position.set(-.5, 15, 25);
    light.target.position.set(0,0,-4);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

    orbitControls = new OrbitControls(camera, renderer.domElement)

    let grupoModelosPrueba = new THREE.Object3D;
    
    
    let arbol = models["arbol"].clone()
    arbol.scale.set(0.1,0.1,0.1)
    arbol.position.x = 0
    arbol.position.y = -4
    arbol.position.z = 0
    grupoModelosPrueba.add(arbol)
    
    let casa = models["casa1"].clone()
    casa.scale.set(5,5,5)
    casa.position.x = -50
    casa.position.y = -4
    casa.position.z = 0
    grupoModelosPrueba.add(casa)

    let puente = models["puente"].clone()
    puente.scale.set(4,4,4)
    puente.position.x = -160
    puente.position.y = -4
    puente.position.z = 0
    grupoModelosPrueba.add(puente)

    let tienda = models["tienda"].clone()
    tienda.scale.set(9,9,9)
    tienda.position.x = -240
    tienda.position.y = -4
    tienda.position.z = 0
    grupoModelosPrueba.add(tienda)

    let calabaza = models["calabaza"].clone()
    calabaza.scale.set(2,2,2)
    calabaza.position.x = -295
    calabaza.position.y = -4
    calabaza.position.z = 0
    grupoModelosPrueba.add(calabaza)
    
    let molino = models["molino"].clone()
    molino.scale.set(0.5,0.5,0.5)
    molino.position.x = -320
    molino.position.y = 0
    molino.position.z = 0
    grupoModelosPrueba.add(molino)

    let trigo = models["trigo"].clone()
    trigo.scale.set(1,1,1)
    trigo.position.x = -350
    trigo.position.y = -10
    trigo.position.z = 0
    grupoModelosPrueba.add(trigo)

    let pato = models["pato"].clone()
    pato.scale.set(.01,.01,.01)
    pato.position.x = -380
    pato.position.y = -10
    pato.position.z = -2
    grupoModelosPrueba.add(pato)

    let serpiente = models["serpiente"].clone()
    serpiente.scale.set(1,1,1)
    serpiente.position.x = -415
    serpiente.position.y = 0
    serpiente.position.z = 0
    grupoModelosPrueba.add(serpiente)

    let lobo = models["lobo"].clone()
    lobo.scale.set(1,1,1)
    lobo.position.x = -450
    lobo.position.y = -10
    lobo.position.z = -2
    lobo.rotateX (-Math.PI/2 ) 
    grupoModelosPrueba.add(lobo))

    scene.add(grupoModelosPrueba)
}

window.onload = () => main();