import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { EffectComposer } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/ShaderPass.js";

//renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three").appendChild(renderer.domElement);

//scene
const scene = new THREE.Scene();
//camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;
camera.position.y = 2.5;
camera.position.x = 0.5;

//resize listener
window.addEventListener("resize", function() {
    let width = window.innerWidth;
    let height = window.innerHeight;
renderer.setSize(width, height);
camera.aspect = width / height;
camera.updateProjectionMatrix();
  });

//postprocessing
let postEffect = {
  uniforms: {
    tDiffuse: { value: null },
    tImage: { value: new THREE.TextureLoader().load('https://assets.codepen.io/6547170/SST-Neuron-442x252.jpeg') },
    uTime: { value: 0 },
    resolution: {
      value: new THREE.Vector2( window.innerWidth,window.innerHeight),
    },
    uMouse: { value: new THREE.Vector2(-100, -100) },
  },
  vertexShader: `
  varying vec2 vUv;
  varying vec2 pos;
  void main() {
  vUv = uv;
  pos = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );
  }`,
  fragmentShader: `
    
    uniform sampler2D tDiffuse;
    uniform sampler2D tImage;
    uniform vec2 resolution;
    uniform vec2 uMouse;
    uniform float uTime;
    
    varying vec2 vUv;
    varying vec2 pos;

    #define AA 2.

    struct MetaBall{
      float r;
        vec2 pos;
        vec3 col;
    };

    vec4 BallSDF(MetaBall ball, vec2 uv){
        float dst = ball.r / length(uv - ball.pos);
        return vec4(ball.col * dst, dst);
    }

    vec3 renderMetaBall(vec2 uv){
    MetaBall  mb1, mb2, mb3, mb4, mouseMb;
        mb1.pos = vec2(-0.5,0.5);   mb1.r = 0.6; mb1.col = vec3(1., 0., 0.);

        mb2.pos = vec2(0.5,0.5);   mb2.r = 0.6; mb2.col = vec3(1., 0., 0.);

        mb3.pos = vec2(-0.5,-0.5);   mb3.r = 0.6; mb3.col = vec3(1., 0., 0.);

        mb4.pos = vec2(0.5,-0.5);   mb4.r = 0.6; mb4.col = vec3(1., 0., 0.);

        mouseMb.pos = vec2(vUv - uMouse); mouseMb.r = 0.1; mouseMb.col = vec3(1., 1., 1.);

        vec4 ball1 = BallSDF(mb1, uv);
        vec4 ball2 = BallSDF(mb2, uv);
        vec4 ball3 = BallSDF(mb3, uv);
        vec4 ball4 = BallSDF(mb4, uv);
        vec4 mouseBall = BallSDF(mouseMb, uv);


        float total = ball1.a + ball2.a + ball3.a + ball4.a + mouseBall.a;
        float threshold = total > 4.5 ? 1. : 0.;
        vec3 color = (ball1.rgb + ball2.rgb + ball3.rgb + ball4.rgb + mouseBall.rgb) / total;
        color *= threshold;
        return color;
    }

    void main()
    {
        vec3 col = renderMetaBall(pos);
        vec4 tex = texture2D(tImage,vUv);

        gl_FragColor = vec4(col,1.0) + tex;
    }
   `,
};
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const customPass = new ShaderPass(postEffect);
customPass.renderToScreen = true;
composer.addPass(customPass);

let mouse = new THREE.Vector2(-100, -100);         

//animation loop
function animate() {
  requestAnimationFrame(animate);
  composer.render();
  if (customPass) {
  customPass.uniforms.uTime.value += 0.01;
  customPass.uniforms.uMouse.value = mouse;

  } 
}
animate();

document.addEventListener("mousemove", (e) => {
  mouse.x = 1 - e.clientX / window.innerWidth;
  mouse.y = e.clientY / window.innerHeight;
});
