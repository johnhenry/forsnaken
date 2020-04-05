// ## Canvas
const canvas = document.getElementById('snake');

// ## Renderer Setup
const canvaswidth = canvas.width = 800;// already set in HTML to prevent flash
const canvasheight = canvas.height = 400;// already set in HTML to prevent flash
const zoom = 8;
// Number describing how much to zoom in when drawing. 
// Must be a divisor of width and length in order to draw game properly
// For example, with a zoom of 1, 1 unit in the game would be drawn over a 1x1 (1) pixel square 
//              with a zoom of 8, 1 unit in the game would be drawn over a 8x8 (64 pixel square 
if(canvaswidth % zoom || canvasheight % zoom){
  throw new Error('zoom must be a divisor of canvas width and height');
}

import rendererFactory from './SnakeGame/rendererFactories/canvas.mjs';
const renderer = rendererFactory(canvas, canvaswidth, canvasheight, zoom);

// ## Game Setup
// ### Game Properties 
const width = canvaswidth/zoom;
const height = canvasheight/zoom;
const appleNum = Math.ceil(0.01 * width * height);

// ### Game Players

// #### Brains
import KeyBrain from './brains/human/keyboard.mjs';
import GamePadBrain from './brains/human/gamepad.mjs';
import SwipeBrain from './brains/human/swipe.mjs';
import RandomBrain from './brains/ai/random.mjs';
import { wasd, antiWasd, arrows, antiArrows } from './brains/configurations/keyboard.mjs';
import { xbox, antiXbox } from './brains/configurations/gamepad.mjs';

// #### Players
const snakes = [];
// Human controled snakes
snakes[0] = {
  id: 'green',
  color: '#4e9a06',
  x: 0,
  y: 0, 
  velocity: +1,
  horizontal:true,
  brains: [
    new GamePadBrain(0, xbox),
    new KeyBrain(arrows),
    new SwipeBrain(30)
  ]
};
snakes[1] = {
  id: 'green',
  color: '#8ae232',
  x: 0,
  y: height - 2,
  velocity: -1,
  horizontal:false,
  brains: [
    new GamePadBrain(0, antiXbox),
    new KeyBrain(antiArrows),
    new SwipeBrain(30, ['down', 'up', 'right', 'left'])
  ]
};
snakes[2] = {
  id: 'yellow',
  color: '#c4a000',
  x: width - 1,
  y: 0,
  velocity: +1,
  horizontal:false,
  brains: [
    new GamePadBrain(1, xbox), 
    new KeyBrain(wasd)
  ]
};
snakes[3] = {
  id: 'yellow',
  color: '#fce94f',
  x: width - 1,
  y: height - 2,
  velocity: -1,
  horizontal:true,
  brains: [
    new GamePadBrain(1, antiXbox),
    new KeyBrain(antiWasd)
  ]
};
// Computer controlled snakes
snakes[4] = {
  id: 'white',
  color: '#ffffff',
  x: Math.floor(width/2),
  y: Math.ceil(height/2),
  velocity: Math.random() < 0.5 ? 1 : -1,
  horizontal: Math.random() < 0.5 ? true : false,
  brains: [
    new RandomBrain({ 'clockwise':1,'counterclockwise':1, '':2 })
  ]
};

// ### Game Instance
import SnakeGame from './SnakeGame/index.mjs';
const game = SnakeGame({ appleNum, width, height }, ...snakes);

// ## Run Game
// ### Game Run Properties 
const FPS = 12;
if(60 % FPS){
  throw new Error('FPS must be a divisor of 60: 60, 30, 20, 15, 12, 10, 6, 5, 4, 3, 2, 1');
}
let running = false;

import createAnimationLoop from './createAnimationLoop.mjs';
const { pause, resume } = createAnimationLoop(
  game,
  renderer,
  FPS,
  running);

// ### Epilepsy Pre-Warning and Start
import WARNING from './warning.mjs';
if (confirm(WARNING)){
  resume();
}

// ### Misc:
window.document.addEventListener('keydown', ({which})=>{
  if(which === 32) { // 32 is space key
    if(running){
      running = pause();
    }else{
      running = resume();
    }
  }
});
