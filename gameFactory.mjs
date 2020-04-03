import collisions from './collisions.mjs';
import collide2d from './collide2d.mjs';
import Apple from './apple.mjs';
import Snake from './snake.mjs';
import DrawEvent from './DrawEvent.mjs';
import ScoreEvent from './ScoreEvent.mjs';
import DeathEvent from './DeathEvent.mjs';
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
      yield [new ScoreEvent(snake, apple.value)];
    }

    // check for collision between each snake's head and each other snake
    for (const [head, part] of collisions(collide2d, snakes.map(({head})=>head), snakes.map(({cells})=>cells).flat())){
      const snake = snakes.filter(({ enabled })=>enabled).find((snake=>collide2d(head, snake.head)));
      const otherSnake = snakes.filter(({ enabled })=>enabled).flat().find((snake=>snake.head===part));
      if(otherSnake){
        if(Math.random() < 0.5){
          if(snake.enabled){
            snake.disable(); // destory old snake (remove listeners)
            yield [new DeathEvent(snake)];
          }
        } else {
          if(otherSnake.enabled){
            otherSnake.disable(); // destory old snake (remove listeners)
            yield [new DeathEvent(otherSnake)];
          }
        }           
      } else {
        if(snake.enabled){
          snake.disable(); // destory old snake (remove listeners)
          yield [new DeathEvent(snake)];
        }
      }
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
    yield [new DrawEvent(...apples, ...snakes)];
  }
}