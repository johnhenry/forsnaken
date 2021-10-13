export default class extends EventTarget {
  // #values
  // #interval
  // #boundProcess
  constructor(weights, interval = 1000) {
    super();
    this._private_values = Object.entries(weights)
      .map(([value, weight]) => {
        const result = [];
        for (let i = 0; i < weight; i++) {
          result.push(value);
        }
        return result;
      })
      .flat();
    this._private_boundProcess = this.process.bind(this);
    this._private_interval = setInterval(() => {
      this._private_boundProcess();
    }, interval);
  }
  disable() {
    clearInterval(this._private_interval);
  }
  process() {
    const which =
      this._private_values[
        Math.floor(Math.random() * this._private_values.length)
      ];
    this.dispatchEvent(new CustomEvent("thought", { detail: { which } }));
  }
}
