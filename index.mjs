import './warning.js';

import KeyBrain from './keyBrain.mjs';
export { wasd, antiWasd, arrows, antiArrows } from './keyboardConfigs.mjs';
import GamePadBrain, { xbox, antiXbox } from './gamePadBrain.mjs';
import RandomBrain from './randomBrain.mjs';

import renderFactory from './renderFactory.mjs';
import gameFactory from './gameFactory.mjs';
import createAnimationLoop from './createAnimationLoop.mjs'
import context, {width, height} from './context.mjs';

const zoom = 8; // Must be a divisor of width and length; there exists n, m s.t. n * zoom === length && m * zoom = width;
const gameWidth = width/zoom;
const gameHeight = height/zoom;
const appleNum = Math.ceil(0.01 * gameWidth * gameHeight);
const render = renderFactory(context, width, height, zoom);
const playerConfig = [
  {x: 0,                 y: 0,                velocity:+1,  horizontal:true,    brains: [new GamePadBrain(0, xbox), new KeyBrain({...arrows})],           color:'#4e9a06' },
  {x: 0,                 y: gameHeight - 1,   velocity:-1,  horizontal:false,   brains: [new GamePadBrain(0, antiXbox), new KeyBrain({...antiArrows})],   color:'#8ae232'},
  {x: gameWidth - 1,     y: 0,                velocity:+1,  horizontal:false,   brains: [new GamePadBrain(1, xbox), new KeyBrain({...wasd})],             color:'#c4a000'  },
  {x: gameWidth - 1,     y: gameHeight - 1,   velocity:-1,  horizontal:true,    brains: [new GamePadBrain(1, antiXbox), new KeyBrain({...antiWasd})],     color:'#fce94f'},
  {x: Math.floor(gameWidth/2),     y: Math.ceil(gameHeight/2),   velocity:Math.random() < 0.5 ? 1 : -1,  horizontal: Math.random() < 0.5 ? true : false,    brains: [new RandomBrain({'clockwise':1,'counterclockwise':1, '':2}, 500)],     color:'white'},

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
