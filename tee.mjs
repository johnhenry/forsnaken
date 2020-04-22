export const tee = (...funcs) => (...inputs) => {
  for(const func of funcs){
    func(...inputs);
  }
}

export const asyncTee = (...funcs) => async (...inputs) => {
  for(const func of funcs){
    await func(...inputs);
  }
}