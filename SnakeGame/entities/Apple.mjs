// get random whole numbers in a specific range
// @see https://stackoverflow.com/a/1527820/2124254
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const Apple = class {
  // #hp
  // #value
  // #xrange
  // #yrange
  constructor({ xrange, yrange, avoid = [], hp = Infinity }) {
    this._private_xrange = xrange;
    this._private_yrange = yrange;
    this._private_hp = hp;
    this.spawn(...avoid);
  }
  spawn(...avoid) {
    this._private_value = 2;
    do {
      this.x = getRandomInt(...this._private_xrange);
      this.y = getRandomInt(...this._private_yrange);
    } while (avoid.find(({ x, y }) => x === this.x && y === this.y));
  }
  get value() {
    return this._private_value;
  }
  get color() {
    return "#ff0000";
  }
  get cells() {
    return [this];
  }
  get alive() {
    return this._private_hp > 0;
  }
  damage(damage) {
    this._private_hp -= damage;
  }
};
export default Apple;
