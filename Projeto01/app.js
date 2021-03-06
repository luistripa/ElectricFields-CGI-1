import * as UTILS from '../libs/utils.js';
import * as MV from '../libs/MV.js'

const MAX_CHARGES = 20;
const CHARGE = 0.000000000004;
const ANGULAR_VELOCITY = 0.01;

/** @type {WebGLRenderingContext} */
let gl;

// Program1 - Responsible for the drawing of the grid and electric field lines
// Program2 - Responsible for the drawing of the stylization of the charges. + for positive and - for negative
var program1, program2, canvas;

let aBuffer, bBuffer;

const table_width = 3.0;
let table_height;

const grid_spacing = 0.05;

let vertices = [];
let position = []; // Array that holds all the charges
let chargeValues = [];

let drawCharges = true; // Boolean value to indicate if the charge's stylization should be drawn.


function animate(time) {
    window.requestAnimationFrame(animate);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    rotate_charges();

    update_program1();
    gl.drawArrays(gl.LINES, 0, vertices.length);

    if(drawCharges){
        update_program2();
        gl.drawArrays(gl.POINTS, 0, position.length);
    }
}


function setup(shaders) {
    canvas = document.getElementById("gl-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    table_height = table_width / (canvas.width / canvas.height);

    gl = UTILS.setupWebGL(canvas);

    program1 = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);
    program2 = UTILS.buildProgramFromSources(gl, shaders["shader2.vert"], shaders["shader2.frag"]);

    // Grid spacing is added to avoid points at the edge of the canvas on the left side.
    for (let x = -table_width/2.0+grid_spacing/2; x < table_width/2.0+grid_spacing/2; x+=grid_spacing) {
        for (let y=-table_height/2.0+grid_spacing/2; y < table_height/2.0+grid_spacing/2; y+=grid_spacing) {
            // Adds "noise" to the points to avoid a perfect grid
            let randomX = x + (Math.random() - 0.5) / 20;
            let randomY = y + (Math.random() - 0.5) / 20;

            // We'll use the z coordintate to distinguish between fixed vertices and movable vertices
            vertices.push(MV.vec3(randomX, randomY, 1.0)); // Movable vertex
            vertices.push(MV.vec3(randomX, randomY, 0.0)); // Fixed vertex
        }
    }

    /*
    GRID DRAWING
    */
    aBuffer = gl.createBuffer();
    update_program1();
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(vertices), gl.STATIC_DRAW);
    
    update_table(program1); // Updates uniform values in program 1

    /*
    CHARGES DRAWING
    */
    bBuffer = gl.createBuffer();
    update_program2();

    update_table(program2); // Updates table_width and table_height in program 2

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);

    /*
    Resizes the canvas when the browser window is resized.
    */
    window.addEventListener("resize", function (event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        table_height = table_width / (canvas.width / canvas.height);
        
        update_table(program1);
        update_table(program2);
    
        gl.viewport(0, 0, canvas.width, canvas.height);
    });
    
    /*
    Adds a new charge when a click event is received.

    If normal click, draw a positive charge.
    If shift-click, draw a negative charge.
    */
    window.addEventListener("click", function(event) {
        // Start by getting x and y coordinates inside the canvas element
        const x = event.offsetX;
        const y = event.offsetY;
                
        // Map x and y values to the table coordinates
        const transformed_x = (x * table_width)/canvas.width - table_width/2
        const transformed_y = -(y * table_height)/canvas.height + table_height/2
        
        if (position.length < MAX_CHARGES) {
            // Push the new charge position into the charges array
            position.push(MV.vec2(transformed_x, transformed_y));
            if(event.shiftKey){
                chargeValues.push(-CHARGE);
            }
            else{
                chargeValues.push(CHARGE);
            }

            // Update charges array and replace them in the vertex shader
            update_charges();
        }
    });

    /*
    This event handler turns on/off the visualization of stylized charges.

    Press space to turn on/off
    */
    window.addEventListener("keydown", function(event){
        if(event.key == " "){
            drawCharges = !drawCharges;
        }
    });
}

/**
 * Sends the charges array and values to the vertex shaders.
 * 
 * This function sends:
 *     - the number of charges to the first program as a uniform int
 *     - the charges' position as a uniform array of 2D float vectors
 *     - the charge values as a uniform array of floats
 * 
 * Finally, it updates the bBuffer with the new charges' positions for the 2nd program (charge stylization)
 */
function update_charges() {
    gl.useProgram(program1);
    const numCharges = gl.getUniformLocation(program1, "numCharges");
    gl.uniform1i(numCharges, position.length);

    for (let i = 0; i < position.length; i++) {
        const uPosition = gl.getUniformLocation(program1, "uPosition["+i+"]");
        gl.uniform2fv(uPosition, MV.flatten(position[i]));
        const uChargeValue = gl.getUniformLocation(program1, "uChargeValue["+i+"]");
        gl.uniform1f(uChargeValue, chargeValues[i]);
    }
    
    let new_charges = new Float32Array(position.length*2 + chargeValues.length);
    new_charges.set(MV.flatten(position));
    new_charges.set(chargeValues, position.length*2);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, bBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new_charges, gl.STATIC_DRAW);
}

/*
Rotates all charges around the center of the canvas.
*/
function rotate_charges() {
    for(let i = 0; i < position.length; i++) {
        // Distance to center of canvas
        let distance = Math.sqrt(Math.pow(position[i][0], 2) + Math.pow(position[i][1], 2));

        // Converts the position of the charge to an angle in radians (relative to center (0, 0))
        let alpha = Math.atan2(position[i][1], position[i][0]);

        if(chargeValues[i] > 0){  // Positive charges rotate counter-clockwise
            alpha += ANGULAR_VELOCITY;
        }
        else { // Negative charges rotate clockwise
            alpha -= ANGULAR_VELOCITY;
        }

        // Generate the new position for the charge
        position[i] = MV.vec2(Math.cos(alpha) * distance, Math.sin(alpha) * distance);
    }
    update_charges();
}

/*
Updates table_width and table_height in the given program.
*/
function update_table(program){
    gl.useProgram(program);
    let t_width_position = gl.getUniformLocation(program, "table_width");
    let t_height_position = gl.getUniformLocation(program, "table_height");
    gl.uniform1f(t_width_position, table_width);
    gl.uniform1f(t_height_position, table_height);
}

/**
 * Updates the attribute positions of program 1.
 */
function update_program1(){
    gl.useProgram(program1);
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    let vPosition = gl.getAttribLocation(program1, 'vPosition');
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0); // 3 floats... remember we use the last coord to distinguish between fixed and movable.
    gl.enableVertexAttribArray(vPosition);
}

/*
Updates the attribute positions of program 2.
*/
function update_program2(){
    gl.useProgram(program2);
    gl.bindBuffer(gl.ARRAY_BUFFER, bBuffer);
    
    let vPosition = gl.getAttribLocation(program2, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    let vCharge = gl.getAttribLocation(program2, "vCharge");
    gl.vertexAttribPointer(vCharge, 1, gl.FLOAT, false, 0, position.length*2*4);
    gl.enableVertexAttribArray(vCharge);
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag", "shader2.vert", "shader2.frag"]).then(s => setup(s));
