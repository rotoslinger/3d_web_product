import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Post Processing
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SAOPass } from 'three/addons/postprocessing/SAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

let camera, scene, renderer ;
var geometry, material, mesh, all_models;

//ssao
let composer, renderPass, saoPass,container, stats;

init();
animate();

function init() {

    // Camera
    camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 0.001, 1000 );
    camera.position.set(.3, .3, -.3);

    // Renderer
    renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.setPixelRatio( window.devicePixelRatio );	
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(.2,.2,.2);

    document.body.appendChild(renderer.domElement);

    // Scene
    scene = new THREE.Scene();

    // Lights
    const hemi_light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add( hemi_light );

    var dir_light = new THREE.SpotLight( 0xffffff, 2.0 );
    dir_light.position.set( 1, 1, 1);
    dir_light.castShadow = true;
    dir_light.shadow.mapSize.set(2048,2048);
    dir_light.shadow.intensity = 1;
    scene.add(dir_light);
    
    ///// Debug Geom /////
    material = new THREE.MeshPhongMaterial();
    geometry = new THREE.BoxGeometry( 0.01, 0.01, 0.01 );
    mesh = new THREE.Mesh( geometry, material );
    // scene.add( mesh );
    //////////////////////


    new RGBELoader()
        .setPath( 'tex/equirectangular/' )
        .load( 'studio_small.hdr', function ( texture ) {

            texture.mapping = THREE.EquirectangularReflectionMapping;

        // GLTF Loader
        new GLTFLoader()
            .setPath( 'models/gltf/' )
            .load( 'iphone.glb', function ( gltf ) {
                gltf.scene.traverse( function ( child ) {
                    if ( child.isMesh){
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material.side = THREE.FrontSide;
                    }
                    all_models = gltf.scene

                    scene.add( gltf.scene );

                });

            } );
            // scene.background = texture;
            scene.environment = texture;
            scene.environmentIntensity = 1;
            scene.backgroundBlurriness = .5;
            render();


        } );



    // controls
    const controls = new OrbitControls( camera, renderer.domElement );

    /////////////// ssao pass ////////////////
    composer = new EffectComposer( renderer );
    renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );
    saoPass = new SAOPass( scene, camera );
    composer.addPass( saoPass );
    const outputPass = new OutputPass();
    composer.addPass( outputPass );

    saoPass.params.saoIntensity = .15;
    saoPass.params.saoScale = 70;
    saoPass.params.saoKernelRadius = 100;
    saoPass.params.saoBlurRadius = 5;
    saoPass.enabled = true;
    ////////////////////////////////////////////
    window.addEventListener( 'resize', onWindowResize );

}
function onWindowResize() {

camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();

renderer.setSize( window.innerWidth, window.innerHeight );

}


function animate() {

    requestAnimationFrame( animate );

    // rotational debug:
    // all_models.rotation.y += 0.004;
    // });
    renderer.render( scene, camera );


    render();

}
function render() {

    composer.render();

    }
