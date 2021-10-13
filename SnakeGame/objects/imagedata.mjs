export default (width, height) =>
  (...objects) => {
    // Create an ImageData object
    const data = new Uint8ClampedArray(width * height * 4);
    // Create the image by looping over all of the pixels
    for (const { color, cells } of objects) {
      for (const { x, y } of cells) {
        // Get the pixel index
        const index = (x + y * width) * 4;
        // Set the pixel data
        const r = parseInt(color.substr(1, 2), 16);
        const g = parseInt(color.substr(3, 2), 16);
        const b = parseInt(color.substr(5, 2), 16);
        const a = parseInt(color.substr(7) || "FF", 16);
        data[index + 0] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = a;
      }
    }
    return new ImageData(data, width);
  };
