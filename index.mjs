import './warning.js';

import KeyBrain, { arrows, wasd, antiArrows, antiWasd } from './keyBrain.mjs';
import GamePadBrain, { xbox, antiXbox } from './gamePadBrain.mjs';

import renderFactory from './renderFactory.mjs';
import gameFactory from './gameFactory.mjs';
import createAnimationLoop from './createAnimationLoop.mjs'
import context, {width, height} from './context.mjs';

const zoom = 8; // Must be a divisor of width and length; there exists n, m s.t. n * zoom === length && m * zoom = width;
const gameWidth = width/zoom;
const gameHeight = height/zoom;
const appleNum = Math.floor(0.01 * gameWidth * gameHeight);
const render = renderFactory(context, width, height, zoom);
const playerConfig = [
  {x: 0,                 y: 0,                velocity:+1,  horizontal:true,    brains: [new GamePadBrain(0, xbox), new KeyBrain({...arrows})],           color:'green' },
  {x: 0,                 y: gameHeight - 1,   velocity:-1,  horizontal:false,   brains: [new GamePadBrain(0, antiXbox), new KeyBrain({...antiArrows})],   color:'yellow'},
  {x: gameWidth - 1,     y: 0,                velocity:+1,  horizontal:false,   brains: [new GamePadBrain(1, xbox), new KeyBrain({...wasd})],             color:'blue'  },
  {x: gameWidth - 1,     y: gameHeight - 1,   velocity:-1,  horizontal:true,    brains: [new GamePadBrain(1, antiXbox), new KeyBrain({...antiWasd})],     color:'purple'},
];
const {pause, resume} = createAnimationLoop(
  gameFactory({appleNum, playerConfig, gameWidth, gameHeight}),
  render);

let running = resume();
window.document.addEventListener('keydown', ({which})=>{
  if(which === 32) { // 32 is space key
    if(running){
      running = pause();
    }else{
      running = resume();
    }
  }
});
