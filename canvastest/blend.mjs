/* global twgl */
import vertextShader from "./vertext-shader.mjs";
import { multiply } from "./blend-modes.mjs";
const setRectangle = (context, x, y, width, height) => {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    context.STATIC_DRAW
  );
};
const updateTextureFromCanvas = (context, tex, canvas, textureUnit) => {
  context.activeTexture(context.TEXTURE0 + textureUnit);
  context.bindTexture(context.TEXTURE_2D, tex);
  context.texImage2D(
    context.TEXTURE_2D,
    0,
    context.RGBA,
    context.RGBA,
    context.UNSIGNED_BYTE,
    canvas
  );
};
const setupTexture = (context, canvas, textureUnit, program, uniformName) => {
  const tex = context.createTexture();

  updateTextureFromCanvas(context, tex, canvas, textureUnit);

  // Set the parameters so we can render any size image.
  context.texParameteri(
    context.TEXTURE_2D,
    context.TEXTURE_WRAP_S,
    context.CLAMP_TO_EDGE
  );
  context.texParameteri(
    context.TEXTURE_2D,
    context.TEXTURE_WRAP_T,
    context.CLAMP_TO_EDGE
  );
  context.texParameteri(
    context.TEXTURE_2D,
    context.TEXTURE_MIN_FILTER,
    context.NEAREST
  );
  context.texParameteri(
    context.TEXTURE_2D,
    context.TEXTURE_MAG_FILTER,
    context.NEAREST
  );

  const location = context.getUniformLocation(program, uniformName);
  context.uniform1i(location, textureUnit);
};
export default (
  canvas1,
  canvas2,
  mode = multiply,
  vertext = vertextShader,
  width = canvas1.width,
  height = canvas1.height
) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const gl = canvas.getContext("webgl");

  // setup GLSL program
  const program = twgl.createProgramFromSources(gl, [vertext, mode]);
  gl.useProgram(program);

  // look up where the vertex data needs to go.
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

  // provide texture coordinates for the rectangle.
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
    ]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  // lookup uniforms
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

  // set the resolution
  gl.uniform2f(resolutionLocation, canvas1.width, canvas1.height);

  // Create a buffer for the position of the rectangle corners.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Set a rectangle the same size as the image.
  setRectangle(gl, 0, 0, canvas.width, canvas.height);

  setupTexture(gl, canvas1, 0, program, "u_canvas0");
  setupTexture(gl, canvas2, 1, program, "u_canvas1");

  // Draw the rectangle.
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  return canvas;
};
