import * as facemesh from '@tensorflow-models/facemesh'
import '@babel/polyfill'
import '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-converter'
import './style.scss'
import '@babel/polyfill'
const THREE = require('three')
import Tone from 'tone'
const CANNON = require('cannon')
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'



const webcamElement = document.getElementById('webcam')
const canvas = document.getElementById('canvas')
const instructions = document.getElementById('instructions')
let playing = false
let ready = false
function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator
    navigator.getUserMedia = navigator.getUserMedia ||
            navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
            navigatorAny.msGetUserMedia
    if (navigator.getUserMedia) {
      navigator.getUserMedia({ video: true },
        stream => {
          webcamElement.srcObject = stream
          webcamElement.addEventListener('loadeddata', () => resolve(), false)
        },
        error => reject())
    } else {
      reject()
    }
  })
}

setupWebcam()
let model
async function main() {
  // Load the MediaPipe facemesh model.
  if(!model){
   model = await facemesh.load();
}

  // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
  // array of detected faces from the MediaPipe graph.

  const predictions = await model.estimateFaces(webcamElement)

  if (predictions.length > 0) {
    /*
    `predictions` is an array of objects describing each detected face, for example:

    [
      {
        faceInViewConfidence: 1, // The probability of a face being present.
        boundingBox: { // The bounding box surrounding the face.
          topLeft: [232.28, 145.26],
          bottomRight: [449.75, 308.36],
        },
        mesh: [ // The 3D coordinates of each facial landmark.
          [92.07, 119.49, -17.54],
          [91.97, 102.52, -30.54],
          ...
        ],
        scaledMesh: [ // The 3D coordinates of each facial landmark, normalized.
          [322.32, 297.58, -17.54],
          [322.18, 263.95, -30.54]
        ],
        annotations: { // Semantic groupings of the `scaledMesh` coordinates.
          silhouette: [
            [326.19, 124.72, -3.82],
            [351.06, 126.30, -3.00],
            ...
          ],
          ...
        }
      }
    ]
    */

    for (let i = 0; i < predictions.length; i++) {
      const keypoints = predictions[i].scaledMesh;

      // Log facial keypoints.
      for (let i = 0; i < keypoints.length; i++) {
        const [x, y, z] = keypoints[i];

        // console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
        if(balls.length<= i){
        ballCreate(x,y,z)
      }
      if(balls.length>i){
        // console.log(balls[i])
      balls[i].position.x = x
        balls[i].position.y = y
          balls[i].position.z = z
    }

      }
    }
    main()
  }
}

main();

const scene = new THREE.Scene()

const light = new THREE.DirectionalLight( 0xffffff )
light.position.set( 40, 25, 10 )
light.castShadow = true
scene.add(light)
var aLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( aLight );

//console.log(scene.scene)

const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement )


const camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 3000 )
camera.position.z = -580.2638063136216
camera.position.y = 455.0810460637797
camera.position.x =  694.5254700530984



let  ballMeshes= []
let balls = []
let world, timeStep=1/60, ballBody, ballShape, ballMaterial, wallContactMaterial



let groundBody, groundShape ,wallMaterial

world = new CANNON.World()
world.gravity.set(0,-20,0)
world.broadphase = new CANNON.NaiveBroadphase()
world.solver.iterations = 10

wallMaterial = new CANNON.Material('wallMaterial')

ballMaterial = new CANNON.Material('ballMaterial')
wallContactMaterial = new CANNON.ContactMaterial(ballMaterial, wallMaterial)
wallContactMaterial.friction = 0
wallContactMaterial.restitution = 2








function ballCreate(x,y,z){
  const materialBall = new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 0.8,
    transparent: true } )

  const ballGeometry = new THREE.SphereGeometry(2, 32, 32)
  const ballMesh = new THREE.Mesh( ballGeometry, materialBall )
  ballMesh.name = 'ball'
  scene.add(ballMesh)
  ballMeshes.push(ballMesh)




  ballShape = new CANNON.Sphere(2)
  ballBody = new CANNON.Body({ mass: 0, material: ballMaterial })
  ballBody.addShape(ballShape)
  ballBody.linearDamping = 0
  world.addBody(ballBody)
  balls.push(ballBody)
  ballBody.position.set(x,y,z)
  ballBody.angularVelocity.y = 3
  ballBody.addEventListener('collide',function(e){


    if(playing){

      // sampler.triggerAttackRelease(drums[Math.floor(Math.random()*5)], 1)
      // eval(synthArr[Math.floor(Math.random()*4)])


    }
  })
}

var controls = new OrbitControls( camera, renderer.domElement );





var update = function() {
if(balls){
// console.log(camera)
}




  updatePhysics()
  // if(cannonDebugRenderer){
  //   //cannonDebugRenderer.update()
  // }
}
//const cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world )
function animate() {

  update()
  /* render scene and camera */
  renderer.render(scene,camera)
  requestAnimationFrame(animate)
}
function updatePhysics() {
  // Step the physics world
  world.step(timeStep)

  for(var j=0; j<balls.length; j++){
    // console.log('hiya')
    ballMeshes[j].position.copy(balls[j].position)
    ballMeshes[j].quaternion.copy(balls[j].quaternion)
  }
}


requestAnimationFrame(animate)
