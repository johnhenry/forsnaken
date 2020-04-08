export default (...renderers) => (events) => {
  for(const renderer of renderers){
    renderer(events);
  }
}