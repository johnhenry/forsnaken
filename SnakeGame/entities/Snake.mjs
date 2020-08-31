const Snake = class {
  // #x
  // #y
  // #name
  // #velocity
  // #speed
  // #horizontal
  // #cells
  // #maxCells
  // #color
  // #brains
  // #enabled
  // #INITIAL
  constructor({
    x,
    y,
    velocity,
    horizontal = false,
    maxCells = 2,
    brains,
    color,
    name = "",
  }) {
    this._private_INITIAL = { x, y, velocity, horizontal, maxCells };
    this._private_x = x;
    this._private_y = y;
    this._private_name = name;
    this._private_velocity = velocity;
    this._private_speed = Math.abs(this.velocity);
    this._private_horizontal = horizontal;
    this._private_cells = [];
    this._private_maxCells = maxCells;
    this._private_color = color;
    for (let i = 0; i < this._private_maxCells; i++) {
      if (horizontal) {
        this._private_cells.push({ x: x - i, y });
      } else {
        this._private_cells.push({ x, y: y - i });
      }
    }
    this._private_brains = brains;
    this.boundUpdateState = this.updateState.bind(this);
    this.enabled = true;
  }
  reset() {
    const { x, y, velocity, horizontal, maxCells } = this._private_INITIAL;
    this._private_x = x;
    this._private_y = y;
    this._private_velocity = velocity;
    this._private_speed = Math.abs(this.velocity);
    this._private_horizontal = horizontal;
    this._private_cells = [];
    this._private_maxCells = maxCells;
    if (!this.enabled) {
      this.enabled = true;
    }
  }
  get name() {
    return this._private_name;
  }
  get enabled() {
    return this._private_enabled;
  }
  set enabled(detail) {
    this._private_enabled = !!detail;
    if (detail) {
      for (const brain of this._private_brains) {
        brain.addEventListener("thought", this.boundUpdateState);
      }
    } else {
      for (const brain of this._private_brains) {
        brain.removeEventListener("thought", this.boundUpdateState);
      }
    }
  }
  get color() {
    return this._private_color;
  }
  get horizontal() {
    return this._private_horizontal;
  }
  get velocity() {
    return this._private_velocity;
  }
  get head() {
    return this._private_cells[0];
  }
  get tail() {
    return this._private_cells.slice(1);
  }
  get cells() {
    return this._private_cells;
  }
  get x() {
    return this._private_x;
  }
  get y() {
    return this._private_y;
  }
  get direction() {
    if (this._private_velocity > 0) {
      if (this._private_horizontal) {
        return "right";
      }
      return "down";
    } else {
      if (this._private_horizontal) {
        return "left";
      }
      return "up";
    }
  }
  grow(size = 1) {
    this._private_maxCells += size;
  }
  move({ width, height }) {
    // move snake by it's velocity
    if (this._private_horizontal) {
      this._private_x += this._private_velocity;
    } else {
      this._private_y += this._private_velocity;
    }
    // wrap snake position horizontally on edge of screen
    if (this._private_x < 0) {
      this._private_x = width - this._private_speed;
    } else if (this._private_x >= width) {
      this._private_x = 0;
    }
    // wrap snake position vertically on edge of screen
    if (this._private_y < 0) {
      this._private_y = height - this._private_speed;
    } else if (this._private_y >= height) {
      this._private_y = 0;
    }
    // keep track of where snake has been. front of the array is always the head
    this._private_cells.unshift({ x: this.x, y: this.y });
    // remove cells as we move away from them
    if (this._private_cells.length > this._private_maxCells) {
      this._private_cells.pop();
    }
  }
  updateState({ detail: { which } }) {
    // prevent snake from backtracking on itself by checking that it's
    // not already moving on the same axis (pressing left while moving
    // left won't do anything, and pressing right while moving left
    // shouldn't let you collide with your own body)

    switch (which) {
      case "left":
        if (!this._private_horizontal) {
          this._private_horizontal = true;
          if (this._private_velocity > 0) {
            this._private_velocity *= -1;
          }
        }
        break;
      case "up":
        if (this._private_horizontal) {
          this._private_horizontal = false;
          if (this._private_velocity > 0) {
            this._private_velocity *= -1;
          }
        }
        break;
      case "right":
        if (!this._private_horizontal) {
          this._private_horizontal = true;
          if (this._private_velocity < 0) {
            this._private_velocity *= -1;
          }
        }
        break;
      case "down":
        if (this._private_horizontal) {
          this._private_horizontal = false;
          if (this._private_velocity < 0) {
            this._private_velocity *= -1;
          }
        }
        break;
      case "clockwise":
        switch (this.direction) {
          case "up":
            this._private_horizontal = true;
            this._private_velocity *= -1;
            break;
          case "right":
            this._private_horizontal = false;
            break;
          case "down":
            this._private_horizontal = true;
            this._private_velocity *= -1;
            break;
          case "left":
            this._private_horizontal = false;
            break;
          default:
        }
        break;
      case "counterclockwise":
        switch (this.direction) {
          case "up":
            this._private_horizontal = true;
            break;
          case "left":
            this._private_horizontal = false;
            this._private_velocity *= -1;
            break;
          case "down":
            this._private_horizontal = true;
            break;
          case "right":
            this._private_horizontal = false;
            this._private_velocity *= -1;
            break;
          default:
        }
        break;
    }
  }
};
export default Snake;
