const InvertedPromise = () =>{
  const out = {};
  out.promise = new Promise(function (resolve, reject) {
    out.resolve = resolve;
    out.reject = reject;
  });
  return out;
};

export default class {
  #brains
  #resolve
  #reject
  #boundUpdateState
  #cache
  #cached
  constructor({brains=[], cache=false}){
    this.#cache = cache;
    this.#brains = brains;
    this.#cached = [];
    this.#boundUpdateState = this.updateState.bind(this);
    // listen to keyboard events to move the snake
    for(const brain of this.#brains) {
      brain.addEventListener('signal', this.#boundUpdateState);
    }
  }
  disable(){
    for(const brain of this.#brains) {
      brain.removeEventListener('signal', this.#boundUpdateState);
    }
  }
  updateState({ which, error }){
    if (error) {
      if(this.#reject){
        this.#reject(error);
      }
    } else if (this.#resolve){
      this.#resolve(which);
    } else if(this.#cache) {
      this.#cached.push(which);
    }
    this.#resolve = undefined;
    this.#reject = undefined;
  }
  choose(callback=()=>{}, failure=()=>{}){
    if(this.#cached.length){
      const result = this.#cached.unshift();
      callback(result);
      return result;
    }
    const { promise, resolve, reject} = InvertedPromise();
    this.#resolve = (input)=>{
      callback(input);
      resolve(input);
    }
    this.#reject = (input) => {
      failure(input);
      reject(input);
    }
    return promise;
  }
}