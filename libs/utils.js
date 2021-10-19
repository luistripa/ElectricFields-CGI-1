
/***
 * WebGL utility functions inspired by code from Google and Edward Angel's book materials
 * @author: Fernando Birra
 */

/**
 * Creates the HTLM for a failure message
 * @param {string} canvasContainerId id of container of th
 *        canvas.
 * @return {string} The html.
 */
var makeFailHTML = function(msg) {
  return '' +
    '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
    '<td align="center">' +
    '<div style="display: table-cell; vertical-align: middle;">' +
    '<div style="">' + msg + '</div>' +
    '</div>' +
    '</td></tr></table>';
};

/**
 * Mesasge for getting a webgl browser
 * @type {string}
 */
var GET_A_WEBGL_BROWSER = '' +
  'This page requires a browser that supports WebGL.<br/>' +
  '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

/**
 * Mesasge for need better hardware
 * @type {string}
 */
var OTHER_PROBLEM = '' +
  "It doesn't appear your computer can support WebGL.<br/>" +
  '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';

/**
 * Creates a webgl context. If creation fails it will
 * change the contents of the container of the <canvas>
 * tag to an error message with the correct links for WebGL.
 * @param {Element} canvas. The canvas element to create a
 *     context from.
 * @param {WebGLContextCreationAttirbutes} opt_attribs Any
 *     creation attributes you want to pass in.
 * @return {WebGLRenderingContext} The created context.
 */
export var setupWebGL = function(canvas, opt_attribs) {
  function showLink(str) {
    var container = canvas.parentNode;
    if (container) {
      container.innerHTML = makeFailHTML(str);
    }
  };

  if (!window.WebGLRenderingContext) {
    showLink(GET_A_WEBGL_BROWSER);
    return null;
  }

  var context = create3DContext(canvas, opt_attribs);
  if (!context) {
    showLink(OTHER_PROBLEM);
  }
  return context;
};

/**
 * Creates a webgl context.
 * @param {!Canvas} canvas The canvas tag to get context
 *     from. If one is not passed in one will be created.
 * @return {!WebGLContext} The created context.
 */
var create3DContext = function(canvas, opt_attribs) {
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  var context = null;
  for (var ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], opt_attribs);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  return context;
}


/**
 * 
 * @param {string} url 
 * @returns 
 */
async function loadTextFile(url) {
  const response = await fetch(url);
  return await response.text();
}

/**
 * 
 * @param {*} urls : Array
 * @returns {*} array with all the shaders' sources
 */
 export async function loadShadersFromURLS(urls, prefix="shaders") {
    const res = await Promise.all(
      urls.map(url => loadTextFile(prefix + "/" + url))
    );

    let dict = {};

    for(let i in urls)
      dict[urls[i]] = res[i];

    return dict;
}

/**
 * 
 * @param {*} ids : Array 
 * @returns {*} array with all the shaders' sources
 */
export function loadShadersFromScripts(ids) 
{
  const res = ids.map(id => document.getElementById(id).textContent);
  let dict = {};

  for(let i in ids)
    dict[ids[i]] = res[i];

  return dict;  
}

/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {string} vShaderSrc 
 * @param {string} fShaderSrc 
 * @returns {WebGLProgram}
 */
export function buildProgramFromSources(gl, vShaderSrc, fShaderSrc) 
{
  function getShader(gl, shaderSrc, type) {
      var shader = gl.createShader(type);
      if (!shaderSrc) {
          alert("Could not find shader source");
      }
      gl.shaderSource(shader, shaderSrc);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(shader));
          return null;
      }
      return shader;
  }
  var vertexShader = getShader(gl, vShaderSrc, gl.VERTEX_SHADER),
      fragmentShader = getShader(gl, fShaderSrc, gl.FRAGMENT_SHADER),
      program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
      return null;
  }

  
  return program;
};

/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {string} vShaderElem 
 * @param {string} fShaderElem 
 * @returns {WebGLProgram}
 */
export function buildProgramFromScripts(gl, vShaderElem, fShaderElem) 
{
  function getShader(gl, shaderElem, type) {
      var shader = gl.createShader(type);
      var shaderSrc = document.getElementById(shaderElem).text;
      if (!shaderSrc) {
          alert("Could not find shader source");
      }
      gl.shaderSource(shader, shaderSrc);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(shader));
          return null;
      }
      return shader;
  }
  var vertexShader = getShader(gl, vShaderElem, gl.VERTEX_SHADER),
      fragmentShader = getShader(gl, fShaderElem, gl.FRAGMENT_SHADER),
      program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
      return null;
  }

  
  return program;
};