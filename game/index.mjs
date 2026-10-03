// Everything, unregistered: the element classes, define() to register them
// (under their usual names or your own), and the brain toolkit. Import
// global.mjs instead to register them under their usual names.
export { ForsnakenGame, ForsnakenSnake, ForsnakenApple, ForsnakenWall, NAMES, define } from "./elements.mjs";
export { SnakeBrain, RandomBrain, GreedyBrain, defineSnakeBrain, board } from "./brains.mjs";
