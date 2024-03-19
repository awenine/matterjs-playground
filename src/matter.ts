import { Engine, Bodies, Render, Composite, Runner, Constraint, MouseConstraint, Mouse, Body, Vector } from 'matter-js';

import chrisMusicPng from '../public/chris-music.png'
import viteLogo from '/vite.svg'

// create an engine
const engine = Engine.create();


// create a renderer
const render = Render.create({
    element: document.body,
    engine: engine,        
    options: {
      wireframes: false
  }
});

// create two boxes and a ground
const boxA = Bodies.rectangle(400, 200, 80, 80,
  {
    render:{
      sprite:{
        texture:chrisMusicPng,
        xScale:80/512,
        yScale:80/512
      }
    }
  } 
);
// const boxB = Bodies.rectangle(450, 50, 80, 80);
const otherBody = Bodies.circle(400,300,50, {isStatic:true})
const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

console.log("boxA: ",boxA);


const chainLinks = []
const chainConstraints = []
for (let i = 0; i < 12; i++) {
  chainLinks.push(Bodies.circle(((i+1)*50)+30,50,20))
  if (i>0 ){
chainConstraints.push(Constraint.create({
  bodyA: chainLinks[i-1],
  bodyB: chainLinks[i],
  stiffness:0.4,
    render:{
    visible: false
  }
}))
  }
  
}

// pin the first chain link in place
chainLinks[0].isStatic = true

const matterMouse = Mouse.create(document.body)

const mouseConstraint = MouseConstraint.create(engine,{
  mouse: matterMouse
})

setTimeout(() => {
  Body.setVelocity(boxA, Vector.create(0,-7))
  console.log('FIRE');
},6000)


// add all of the bodies to the world
Composite.add(engine.world, [ ground, ...chainLinks, ...chainConstraints, otherBody, mouseConstraint, boxA]);

// run the renderer
Render.run(render);

// create runner
const runner = Runner.create();

// run the engine
Runner.run(runner, engine);