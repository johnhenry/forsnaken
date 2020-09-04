export default (canvas) => (imagedata) => {
  console.log(imagedata);
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.putImageData(imagedata, 0, 0);
};
