export default (...funcs) => (...inputs) => {
  for(const func of funcs){
    func(...inputs);
  }
}