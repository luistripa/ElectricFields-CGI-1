attribute vec4 vPosition;
attribute float vCharge;

uniform float table_width;
uniform float table_height;

varying float polarity;

void main() {
    polarity = vCharge;
    gl_Position = vPosition / vec4(table_width/2.0, table_height/2.0, 1.0, 1.0);
    gl_PointSize = 30.0;

}
