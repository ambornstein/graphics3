var gl;
var near = 1;
var far = -5;

let program;
let models;

var left = -3.0;
var right = 3.0;
var top = 3.0;
var bottom = -3.0;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

let transLoc;
let vPosition;

let lightPosition = vec4(1.0, 2.0, 1.0, 0.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );

let specularLoc;
let diffuseLoc;

let materialShininess = 20.0;

let modelViewMatrix, projectionMatrix;
let modelViewMatrixLoc, projectionMatrixLoc;

function main() {
    // Retrieve <canvas> element
    let canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas, undefined);

    //Check that the return value is not null.
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Set viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    //gl.enable(gl.DEPTH_TEST);

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    vPosition = gl.getAttribLocation(program, "vPosition");

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    transLoc = gl.getUniformLocation(program, "translationMatrix");



    eye = vec3(5,0, 1);
    modelViewMatrix = lookAt(eye, at, up);
    //projectionMatrix = ortho(left,right,bottom,top,near,far);
    projectionMatrix = perspective(90, 1, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(transLoc, false, flatten(mat4()));

    var ambientProduct = mult(lightAmbient, materialAmbient);

    diffuseLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularLoc = gl.getUniformLocation(program, "specularProduct");
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));



    // Get the stop sign
    let stopSign = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/stopsign.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/stopsign.mtl");

    // Get the lamp
    let lamp = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.mtl");

    // Get the car
    let car = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.mtl");

    // Get the street
    let street = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.mtl");

    // Get the bunny (you will not need this one until Part II)
    let bunny = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/bunny.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/bunny.mtl");
    models = [stopSign,lamp,car,street,bunny];
    wait();


}

// function draw() {
//     if (stopSign.objParsed) {
//
//     }
//     requestAnimationFrame(draw);
// }

function wait() {
    let loaded = true;
    models.forEach(function(md) {
        if (!md.objParsed || !md.mtlParsed)
            loaded = false});
    if (loaded) {
        console.log("Loaded!")
        clap()
    }
    else {
        requestAnimFrame(wait);
    }
}

function clap() {
    render(models[1]);
    //requestAnimFrame(clap);
}
function render(model) {
        let face = model.faces;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (let i = 0; i < face.length; i++ ) {
            //console.log(flatten(face[i].faceVertices));
            var vBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(face[i].faceVertices), gl.STATIC_DRAW);

            var vPosition = gl.getAttribLocation(program, "vPosition");
            gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            var vNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(face[i].faceNormals), gl.STATIC_DRAW);

            var vNormalPosition = gl.getAttribLocation(program, "vNormal");
            gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormalPosition);

            gl.uniform4fv(diffuseLoc, model.diffuseMap.get(face[i].material));
            gl.uniform4fv(specularLoc, model.specularMap.get(face[i].material));

            gl.drawArrays(gl.TRIANGLES, 0, face[i].faceVertices.length);
        }
}