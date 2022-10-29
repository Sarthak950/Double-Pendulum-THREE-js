import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui'
 
/*
links related

research paper :-
https://www.myphysicslab.com/pendulum/double-pendulum-en.html

coding train link :-
https://www.youtube.com/watch?v=uWzPe_S-RVE&t=358s

*/  

// variables
var blob_properties = new function(){
  
  this.gravity = 0.1
  
  this.theta1 = Math.PI/2
  this.theta2 = Math.PI/4

  this.m1 = 1
  this.m2 = 1
  
  this.l1 = 19   
  this.l2 = 19*2

  this.theta_1_a =  0  
  this.theta_2_a = 0 

  this.theta_1_v = 0
  this.theta_2_v = 0
  
  this.trail_length = 6000
}




//resize manager 
window.addEventListener('resize', () => {
  //update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  //update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


//double click 
window.addEventListener('dblclick',()=>{
  
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
  
  if(!fullscreenElement) {
    if(canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if(canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  } else {
    if(document.exitFullscreen) {
      document.exitFullscreen();
    } else if(document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }  
  
})

//add event listnere for space bar
var ear = new function(){
  this.play = false
}
// let space = false
window.addEventListener ('keydown', (event) => {
  if (event.code === 'Space') {
    // space = !space
    ear.play = !ear.play
  }  
})

//scene 
const scene = new THREE.Scene()

//camera 
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
)

scene.add(camera)
// camera.position.x = 3
// camera.position.y = 5
camera.position.z = 100

//renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);


//objects
const anchor_geometry = new THREE.SphereGeometry(0.5, 32);
const anchor_material = new THREE.MeshBasicMaterial({ color: 0xffffff });
const anchor = new THREE.Mesh(anchor_geometry, anchor_material);
scene.add(anchor);

//blob
const blob_geometry = new THREE.SphereGeometry(2, 32);
const blob_material = new THREE.MeshBasicMaterial({ color: 0x72FFFF });
const blob_1 = new THREE.Mesh(blob_geometry, blob_material);
const blob_2 = new THREE.Mesh(blob_geometry, blob_material);
scene.add(blob_1,blob_2);
blob_1.position.x =  ( blob_properties.l1 + anchor.position.x ) * Math.sin(blob_properties.theta1)
blob_1.position.y = -( blob_properties.l1 - anchor.position.y )* Math.cos(blob_properties.theta1)
blob_2.position.x =  ( blob_properties.l1 + anchor.position.x )*Math.sin(blob_properties.theta1) + blob_properties.l2*Math.sin(blob_properties.theta2)
blob_2.position.y = -( blob_properties.l1 - anchor.position.y ) *Math.cos(blob_properties.theta1) - blob_properties.l2*Math.cos(blob_properties.theta2)

  
  /*
  
  draw the lines

*/


//trail dots 
const trail_geometry = new THREE.SphereGeometry(0.1, 32);
const trail_material = new THREE.MeshBasicMaterial({ color: 0xffFFFF });
const trail = []
for (let i = 0; i < blob_properties.trail_length; i++) {
  trail[i] = new THREE.Mesh(trail_geometry, trail_material);
  scene.add(trail[i]);
}



//clock
const clock = new THREE.Clock(); 
//controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableRotate = false;



let i = 0;
//physics handlerer functin
function Handel_physics() {
  
  if ( i == blob_properties.trail_length) {
    i = 0
  }
  //updating the position of the blobs
  blob_1.position.x =  ( blob_properties.l1 + anchor.position.x ) * Math.sin(blob_properties.theta1)
  blob_1.position.y = -( blob_properties.l1 - anchor.position.y )* Math.cos(blob_properties.theta1)
  blob_2.position.x =  ( blob_properties.l1 + anchor.position.x )*Math.sin(blob_properties.theta1) + blob_properties.l2*Math.sin(blob_properties.theta2)
  blob_2.position.y = -( blob_properties.l1 - anchor.position.y ) *Math.cos(blob_properties.theta1) - blob_properties.l2*Math.cos(blob_properties.theta2)

  //calculatin values
  let num1 = -blob_properties.gravity * (2 * blob_properties.m1 + blob_properties.m2) * Math.sin(blob_properties.theta1);
  let num2 = -blob_properties.m2 * blob_properties.gravity * Math.sin(blob_properties.theta1 - 2 * blob_properties.theta2);
  let num3 = -2 * Math.sin(blob_properties.theta1 - blob_properties.theta2) * blob_properties.m2;
  let num4 = blob_properties.theta_2_v * blob_properties.theta_2_v * blob_properties.l2 + blob_properties.theta_1_v * blob_properties.theta_1_v * blob_properties.l1 * Math.cos(blob_properties.theta1 - blob_properties.theta2);
  let den = blob_properties.l1 * (2 * blob_properties.m1 + blob_properties.m2 - blob_properties.m2 * Math.cos(2 * blob_properties.theta1 - 2 * blob_properties.theta2));
  blob_properties.theta_1_a = (num1 + num2 + num3 * num4) / den;

  num1 = 2 * Math.sin(blob_properties.theta1 - blob_properties.theta2);
  num2 = blob_properties.theta_1_v * blob_properties.theta_1_v * blob_properties.l1 * (blob_properties.m1 + blob_properties.m2);
  num3 = blob_properties.gravity * (blob_properties.m1 + blob_properties.m2) * Math.cos(blob_properties.theta1);
  num4 = blob_properties.theta_2_v * blob_properties.theta_2_v * blob_properties.l2 * blob_properties.m2 * Math.cos(blob_properties.theta1 - blob_properties.theta2);
  den = blob_properties.l2 * (2 * blob_properties.m1 + blob_properties.m2 - blob_properties.m2 * Math.cos(2 * blob_properties.theta1 - 2 * blob_properties.theta2));
  blob_properties.theta_2_a = (num1 * (num2 + num3 + num4)) / den;
  
  blob_properties.theta_1_v += blob_properties.theta_1_a
  blob_properties.theta_2_v += blob_properties.theta_2_a

  blob_properties.theta1 += blob_properties.theta_1_v 
  blob_properties.theta2 += blob_properties.theta_2_v

  blob_properties.theta_1_v *= 0.9999
  blob_properties.theta_2_v *= 0.9999 
   
  if (i < blob_properties.trail_length) {
    trail[i].position.x = blob_2.position.x
    trail[i].position.y = blob_2.position.y
    i++
  }


}

//handel position update
function update_position() {
  blob_1.position.x =  ( blob_properties.l1 + anchor.position.x ) * Math.sin(blob_properties.theta1)
  blob_1.position.y = -( blob_properties.l1 - anchor.position.y )* Math.cos(blob_properties.theta1)
  blob_2.position.x =  ( blob_properties.l1 + anchor.position.x )*Math.sin(blob_properties.theta1) + blob_properties.l2*Math.sin(blob_properties.theta2)
  blob_2.position.y = -( blob_properties.l1 - anchor.position.y ) *Math.cos(blob_properties.theta1) - blob_properties.l2*Math.cos(blob_properties.theta2)

} 

//add gui for thetha1 and thetha 2
const gui = new dat.GUI();
gui.add(blob_properties, 'theta1', -Math.PI, Math.PI, 0.001);
gui.add(blob_properties, 'theta2', -Math.PI, Math.PI, 0.001);

gui.add(blob_properties, 'm1', 0, 10, 0.01);
gui.add(blob_properties, 'm2', 0, 10, 0.01);

gui.add(blob_properties, 'l1', 0, 50, 0.05);
gui.add(blob_properties, 'l2', 0, 50, 0.05);

gui.add(blob_properties, 'gravity', -0.5, 1, 0.00001);

gui.add(blob_properties, 'trail_length', 0, 10000, 100);

//add gui for camera distance
gui.add(camera.position, 'z', 0.2, 500, 1);

gui.add(ear, 'play', 0, 1); 
 
//animation 
function animate() {   

  
  requestAnimationFrame(animate); 
  // const elapsedTime = clock.getElapsedTime();
  
  //update controls
  controls.update();
  
  if(ear.play == true){
    Handel_physics();
  }else{
    update_position();
  }

  renderer.render(scene, camera);
} 
  
  
  animate(); 