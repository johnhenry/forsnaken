import collide from './collisions/collide.mjs';
import collideArray from './collisions/collideArrays.mjs';
import Apple from './entities/Apple.mjs';
import Snake from './entities/Snake.mjs';
import DrawEvent from './events/DrawEvent.mjs';
import ScoreEvent from './events/ScoreEvent.mjs';
import DeathEvent from './events/DeathEvent.mjs';
export default function *({ appleNum=1, width=400, height=400 }, ...players){
  const snakes = players.map(config=>new Snake(config));
  const apples = [];
  for(let i = 0; i < appleNum; i++){
    apples.push(new Apple({xrange:[0, width], yrange:[0, height] }));
  }
  while(true){
    // check for collision between each snake's head and each apple
    for (const [head, apple] of collideArray(snakes.map(({head})=>head), apples)){
      // if collision happens (snake eats apple)
      const snake = snakes.find((snake=>collide(head, snake.head)));
      snake.grow(apple.value)
      apple.spawn(...snakes.map(({cells}) =>cells ).flat());
      // grow snake
      // shanke screen based on snake direction
      yield [new ScoreEvent(snake, apple.value)];
    }

    // check for collision between each snake's head and each other snake
    for (const [head, part] of collideArray(snakes.map(({head})=>head), snakes.map(({cells})=>cells).flat())){
      const snake = snakes.filter(({ enabled })=>enabled).find((snake=>collide(head, snake.head)));
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
        snakes[index] = new Snake(players[index]); // create new snake
      }
    }
    // revive any dead snakes
    for(const index in snakes){
      if(!snakes[index].enabled){
        snakes[index] = new Snake(players[index]); // create new snake
      }
    }
    // move each snake
    for(const snake of snakes){
      snake.move({width, height})
    }
    yield [new DrawEvent(...apples, ...snakes)];
  }
}