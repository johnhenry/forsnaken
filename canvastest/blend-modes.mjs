const blendMode = (operator) => `precision mediump float;
// our 2 canvases
uniform sampler2D u_canvas0;
uniform sampler2D u_canvas1;

// the texCoords passed in from the vertex shader.
// note: we're only using 1 set of texCoords which means
//   we're assuming the canvases are the same size.
varying vec2 v_texCoord;

void main() {
    // Look up a pixel from first canvas
    vec4 color1 = texture2D(u_canvas0, v_texCoord);

    // Look up a pixel from second canvas
    vec4 color2 = texture2D(u_canvas1, v_texCoord);

    // return the 2 colors multiplied
    gl_FragColor = color1 ${operator} color2;
}`;

export const add = blendMode("+");
export const subtract = blendMode("-");
export const multiply = blendMode("*");
