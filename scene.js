import * as THREE from 'three';
export var camera, scene, renderer ;

export function setup_scene(camera, scene, renderer) {

        // Camera
        camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 0.001, 1000 );
        camera.position.set(.3, .3, -.3);

        // Renderer
        renderer = new THREE.WebGLRenderer({antialias : true});
        renderer.setPixelRatio( window.devicePixelRatio );	
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setClearColor(0xFEFEFE);

        document.body.appendChild(renderer.domElement);

        // Scene
        scene = new THREE.Scene();

        // return camera, scene, renderer;
    }
