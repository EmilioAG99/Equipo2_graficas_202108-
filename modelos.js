import * as THREE from "./libs/three.js/r131/three.module.js"

import { OrbitControls } from '../libs/three.js/r131/controls/OrbitControls.js';
import { OBJLoader } from '../libs/three.js/r131/loaders/OBJLoader.js';
import { MTLLoader } from '../libs/three.js/r131/loaders/MTLLoader.js';

let renderer = null, scene = null, camera = null; //Elementos generales de la escena
let orbitControls = null;
let modelsURL = [["./models/arbol/arbol.obj","./models/arbol/arbol.mtl", "arbol"],
["./models/casa1/casa.obj", "./models/casa1/casa.mtl", "casa1"],
["./models/puente/puente.obj", "./models/puente/puente.mtl", "puente"],
["./models/tienda/HOUSE.obj", "./models/tienda/HOUSE.mtl", "tienda"],
["./models/cosechas/calabazas/calabaza.obj", "./models/cosechas/calabazas/calabaza.mtl", "calabaza"],
["./models/cosechas/molino/molino.obj", "./models/cosechas/molino/molino.mtl", "molino"],
["./models/cosechas/trigo/trigo.obj", "./models/cosechas/trigo/trigo.mtl", "trigo"],
["./models/pato_hule/pato.obj", "./models/pato_hule/pato.mtl", "pato"],
["./models/serpiente/serpiente.obj", "./models/serpiente/serpiente.mtl", "serpiente"],
["./models/lobo/lobo.obj","./models/lobo/lobo.mtl","lobo"],
["./models/castillo/castillo.obj", "./models/castillo/castillo.mtl", "castillo"],
["./models/dragon/dragon.obj","./models/dragon/dragon.mtl","dragon"],
["./models/aldeano/aldeano.obj","./models/aldeano/aldeano.mtl","aldeano"], 
["./models/caballero/Caballero.obj","./models/caballero/Caballero.mtl","caballero"],
["./models/duende/duende.obj","./models/duende/duende.mtl","duende"],
["./models/lagartija/lagartija.obj","./models/lagartija/lagartija.mtl","lagartija"],
["./models/torre/torre.obj","./models/torre/torre.mtl","torre"],
["./models/piramide/piramide.obj","./models/piramide/piramide.mtl","piramide"],
["./models/hechizero/hechizero.obj", "./models/hechizero/hechizero.mtl", "hechizero"]];
let models = {};
//obj, luego mtl y finalmente nombre

function main() {
    cargarModelos();
    const canvas = document.getElementById("canvas");
    setTimeout(function(){createScene(canvas);update();}, 14500);
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
    tienda.scale.set(10,10,10)
    tienda.position.x = -240
    tienda.position.y = -4
    tienda.position.z = 0
    grupoModelosPrueba.add(tienda)

    let calabaza = models["calabaza"].clone()
    calabaza.scale.set(2,2,2)
    calabaza.position.x = -275
    calabaza.position.y = -4
    calabaza.position.z = 0
    grupoModelosPrueba.add(calabaza)
    
    let molino = models["molino"].clone()
    molino.scale.set(1,1,1)
    molino.position.x = -320
    molino.position.y = -4
    molino.position.z = 0
    grupoModelosPrueba.add(molino)

    let trigo = models["trigo"].clone()
    trigo.scale.set(0.7,.7,.7)
    trigo.position.x = -365
    trigo.position.y = -4
    trigo.position.z = 0
    grupoModelosPrueba.add(trigo)

    let pato = models["pato"].clone()
    pato.scale.set(.003,.003,.003)
    pato.position.x = -380
    pato.position.y = -4
    pato.position.z = -2
    grupoModelosPrueba.add(pato)

    let serpiente = models["serpiente"].clone()
    serpiente.scale.set(0.5,0.5,0.5)
    serpiente.position.x = -415
    serpiente.position.y = -4
    serpiente.position.z = 0
    serpiente.rotateX(-Math.PI/2)
    grupoModelosPrueba.add(serpiente)

    let lobo = models["lobo"].clone()
    lobo.scale.set(.1,.1,.1)
    lobo.position.x = -450
    lobo.position.y = -4
    lobo.position.z = -2
    lobo.rotateX (-Math.PI/2 ) 
    grupoModelosPrueba.add(lobo)

    let castillo = models["castillo"].clone()
    castillo.scale.set(.3,.3,.3)
    castillo.position.x = 100
    castillo.position.y = -4
    castillo.position.z = 0 
    grupoModelosPrueba.add(castillo)

    let dragon = models["dragon"].clone()
    dragon.scale.set(.05,.05,.05)
    dragon.position.x = 240
    dragon.position.y = 5
    dragon.position.z = 0 
    dragon.rotateY(Math.PI/2 )
    grupoModelosPrueba.add(dragon)

    let aldeano = models["aldeano"].clone()
    aldeano.scale.set(5,5,5)
    aldeano.position.x = 30
    aldeano.position.y = -4
    aldeano.position.z = 0 
    grupoModelosPrueba.add(aldeano)

    let caballero = models["caballero"].clone()
    caballero.scale.set(7,7,7)
    caballero.position.x = 180
    caballero.position.y = -4
    caballero.position.z = 0 
    grupoModelosPrueba.add(caballero)

    let duende = models["duende"].clone()
    duende.scale.set(0.08,0.08,0.08)
    duende.position.x = 275
    duende.position.y = -4
    duende.position.z = 0 
    grupoModelosPrueba.add(duende)

    let lagartija = models["lagartija"].clone()
    lagartija.scale.set(2,2,2)
    lagartija.position.x = 325
    lagartija.position.y = -4
    lagartija.position.z = 0 
    grupoModelosPrueba.add(lagartija)

    let torre = models["torre"].clone()
    torre.scale.set(6,6,6)
    torre.position.x = 410
    torre.position.y = -8
    torre.position.z = 0 
    grupoModelosPrueba.add(torre)

    let piramide = models["piramide"].clone()
    piramide.scale.set(0.05,0.05,0.05)
    piramide.position.x = 500
    piramide.position.y = -4
    piramide.position.z = 0 
    grupoModelosPrueba.add(piramide)

    let hechizero = models["hechizero"].clone()
    hechizero.scale.set(3,3,3)
    hechizero.position.x = 550
    hechizero.position.y = -4
    hechizero.position.z = 0 
    grupoModelosPrueba.add(hechizero)

    scene.add(grupoModelosPrueba)
}

window.onload = () => main();