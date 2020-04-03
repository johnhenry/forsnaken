import collisions from './collisions.mjs';
import collide2d from './collide2d.mjs';
import Apple from './apple.mjs';
import Snake from './snake.mjs';
import AppleEatenEvent from './AppleEatenEvent.mjs';
export default function *({appleNum=1, playerConfig=[], gameWidth=400, gameHeight=400}){
  const snakes = playerConfig.map(config=>new Snake(config));
  const apples = [];
  for(let i = 0; i < appleNum; i++){
    apples.push(new Apple({xrange:[0, gameWidth], yrange:[0, gameHeight] }));
  }
  while(true){
    // check for collision between each snake's head and each apple
    for (const [head, apple] of collisions(collide2d, snakes.map(({head})=>head), apples)){
      // if collision happens (snake eats apple)
      const snake = snakes.find((snake=>collide2d(head, snake.head)));
      snake.grow(apple.value)
      apple.spawn(...snakes.map(({cells}) =>cells ).flat());
      // grow snake
      // shanke screen based on snake direction
      yield { events:[ new AppleEatenEvent(snake)]};
    }

    // check for collision between each snake's head and each other snake
    for (const [head, part] of collisions(collide2d, snakes.map(({head})=>head), snakes.map(({cells})=>cells).flat())){
      let snake = snakes.filter(_=>_).find((snake=>collide2d(head, snake.head)));
      const otherSnake = snakes.filter(_=>_).flat().find((snake=>snake.head===part));
      if(otherSnake){
        snake = Math.random() < 0.5 ? snake : otherSnake;              
      }
      snake.disable(); // destory old snake (remove listeners)
    }

    // revive any dead snakes
    for(const index in snakes){
      if(!snakes[index].enabled){
        snakes[index] = new Snake(playerConfig[index]); // create new snake
      }
    }
    // revive any dead snakes
    for(const index in snakes){
      if(!snakes[index].enabled){
        snakes[index] = new Snake(playerConfig[index]); // create new snake
      }
    }
    // move each snake
    for(const snake of snakes){
      snake.move({width: gameWidth, height: gameHeight})
    }
    yield { redraw:[...apples, ...snakes] };
  }
}