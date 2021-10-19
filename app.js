import * as UTILS from './libs/utils.js';
import * as MV from './libs/MV.js'

const MAX_CHARGES = 20;

/** @type {WebGLRenderingContext} */
let gl;

var program, canvas;

const table_width = 3.0;
let table_height;

let vertices = [];
let position = []; // Array que guarda as cargas elétricas

const grid_spacing = 0.05;

function animate(time)
{
    window.requestAnimationFrame(animate);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.LINES, 0, vertices.length);
}

function setup(shaders)
{
    canvas = document.getElementById("gl-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    table_height = table_width / (canvas.width / canvas.height);

    gl = UTILS.setupWebGL(canvas);

    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    gl.useProgram(program);

    for (let x = -table_width/2.0+grid_spacing/2; x < table_width/2.0+grid_spacing/2; x+=grid_spacing) {
        for (let y=-table_height/2.0+grid_spacing/2; y < table_height/2.0+grid_spacing/2; y+=grid_spacing) {
            vertices.push(MV.vec3(x, y, 1.0));
            vertices.push(MV.vec3(x, y, 0.0));
        }
    }

    let aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(vertices), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    const t_width_position = gl.getUniformLocation(program, "table_width");
    const t_height_position = gl.getUniformLocation(program, "table_height");

    gl.uniform1f(t_width_position, table_width/2.0);
    gl.uniform1f(t_height_position, table_height/2.0);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);

    window.addEventListener("resize", function (event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        table_height = table_width / (canvas.width / canvas.height);
        
        const t_width_position = gl.getUniformLocation(program, "table_width");
        const t_height_position = gl.getUniformLocation(program, "table_height");
    
        gl.uniform1f(t_width_position, table_width/2.0);
        gl.uniform1f(t_height_position, table_height/2.0);
    
        gl.viewport(0, 0, canvas.width, canvas.height);
    })
    
    window.addEventListener("click", function(event) {
        // Start by getting x and y coordinates inside the canvas element
        const x = event.offsetX;
        const y = event.offsetY;
                
        // Map x and y values to the table coordinates
        const transformed_x = (x * table_width)/canvas.width - table_width/2
        const transformed_y = -(y * table_height)/canvas.height + table_height/2
        
        if (position.length < MAX_CHARGES) {
            // Push the new vertex to the vertex array
            position.push(MV.vec2(transformed_x, transformed_y));
        
            // Update charges array and replace them in the vertex shader
            update_charges();
        }
    });
}

/**
 * Sends the vertex array to the vertex shader as uniform variables.
 */
function update_charges() {
    const numCharges = gl.getUniformLocation(program, "numCharges");
    gl.uniform1i(numCharges, position.length);

    for (let i=0; i<MAX_CHARGES && i<position.length; i++) {
        const uPosition = gl.getUniformLocation(program, "uPosition["+i+"]");
        gl.uniform2fv(uPosition, MV.flatten(position[i]));
    }
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(s => setup(s));
