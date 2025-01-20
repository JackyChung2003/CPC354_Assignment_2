/*-----------------------------------------------------------------------------------*/
// Variable Declaration
/*-----------------------------------------------------------------------------------*/

// Common variables
var canvas, gl, program;
var pBuffer, nBuffer, vPosition, vNormal;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var modelViewMatrix, projectionMatrix, nMatrix;

// Variables referencing HTML elements
// theta = [x, y, z]
const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;
var cylinderX,
  cylinderY,
  cylinderZ,
  cylinderAxis = X_AXIS,
  cylinderBtn;
var cubeX,
  cubeY,
  cubeZ,
  cubeAxis = X_AXIS,
  cubeBtn;
var sphereX,
  sphereY,
  sphereZ,
  sphereAxis = X_AXIS,
  sphereBtn;

var cylinderObj, cubeObj, sphereObj, wallObj;
var cylinderFlag = false,
  cubeFlag = false,
  sphereFlag = false;
var cylinderTheta = [0, 0, 0],
  cubeTheta = [0, 0, 0],
  sphereTheta = [0, 0, 0];
var pointsArray = [],
  normalsArray = [],
  cylinderV,
  cubeV,
  sphereV,
  wallV,
  totalV;

// Variables for lighting control
var ambientProduct, diffuseProduct, specularProduct;
var ambient = 0.5,
  diffuse = 0.5,
  specular = 0.5,
  shininess = 60;
var lightPos = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(ambient, ambient, ambient, 1.0);
var lightDiffuse = vec4(diffuse, diffuse, diffuse, 1.0);
var lightSpecular = vec4(specular, specular, specular, 1.0);

var materialAmbient = vec4(0.5, 0.5, 1.0, 1.0);
var materialDiffuse = vec4(0.0, 0.9, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);

// Add these variable declarations after line 20
var sliderAmbient, sliderDiffuse, sliderSpecular, sliderShininess;
var sliderLightX, sliderLightY, sliderLightZ;
var textAmbient, textDiffuse, textSpecular, textShininess;
var textLightX, textLightY, textLightZ;

// Add a speed variable at the top with other variables
var rotationSpeed = 0.5; // Adjust this value to change speed (smaller = slower, larger = faster)

// Add this variable at the top with other variables
var animationFrameId = null;

// Add these variables at the top with other variables
var cylinderColor, cubeColor, sphereColor;
var cylinderMaterial = vec4(1.0, 0.0, 0.0, 1.0); // Red for cylinder
var cubeMaterial = vec4(0.0, 1.0, 0.0, 1.0); // Green for cube
var sphereMaterial = vec4(0.0, 0.0, 1.0, 1.0); // Blue for sphere

/*-----------------------------------------------------------------------------------*/
// WebGL Utilities
/*-----------------------------------------------------------------------------------*/

window.onload = function init() {
  // Initialize objects with corrected scaling
  cylinderObj = cylinder(72, 3, true); // Adjusted height
  cylinderObj.Rotate(45, [1, 1, 0]);
  cylinderObj.Scale(1.2, 1.2, 1.2); // Scaled to proper cylinder dimensions
  concatData(cylinderObj.Point, cylinderObj.Normal);

  cubeObj = cube();
  cubeObj.Rotate(45, [1, 1, 0]);
  cubeObj.Scale(1, 1, 1); // Cube remains 1x1x1
  concatData(cubeObj.Point, cubeObj.Normal);

  sphereObj = sphere(4); // Increased subdivision for smoother sphere
  sphereObj.Rotate(45, [0, 1, 0]);
  sphereObj.Scale(0.8, 0.8, 0.8); // Proper scaling for a smaller sphere
  concatData(sphereObj.Point, sphereObj.Normal);

  wallObj = wall();
  concatData(wallObj.Point, wallObj.Normal);

  cylinderV = cylinderObj.Point.length;
  cubeV = cubeObj.Point.length;
  sphereV = sphereObj.Point.length;
  wallV = wallObj.Point.length;
  totalV = pointsArray.length;

  // WebGL setup
  getUIElement();
  configWebGL();
  render();
};

// Retrieve all elements from HTML and store in the corresponding variables
function getUIElement() {
  canvas = document.getElementById("gl-canvas");

  // Cylinder controls
  cylinderX = document.getElementById("cylinder-x");
  cylinderY = document.getElementById("cylinder-y");
  cylinderZ = document.getElementById("cylinder-z");
  cylinderBtn = document.getElementById("cylinder-btn");

  // Cube controls
  cubeX = document.getElementById("cube-x");
  cubeY = document.getElementById("cube-y");
  cubeZ = document.getElementById("cube-z");
  cubeBtn = document.getElementById("cube-btn");

  // Sphere controls
  sphereX = document.getElementById("sphere-x");
  sphereY = document.getElementById("sphere-y");
  sphereZ = document.getElementById("sphere-z");
  sphereBtn = document.getElementById("sphere-btn");

  // Event listeners for Cylinder
  cylinderX.onchange = () => {
    if (cylinderX.checked) cylinderAxis = X_AXIS;
  };
  cylinderY.onchange = () => {
    if (cylinderY.checked) cylinderAxis = Y_AXIS;
  };
  cylinderZ.onchange = () => {
    if (cylinderZ.checked) cylinderAxis = Z_AXIS;
  };
  cylinderBtn.onclick = () => {
    cylinderFlag = !cylinderFlag;
  };

  // Event listeners for Cube
  cubeX.onchange = () => {
    if (cubeX.checked) cubeAxis = X_AXIS;
  };
  cubeY.onchange = () => {
    if (cubeY.checked) cubeAxis = Y_AXIS;
  };
  cubeZ.onchange = () => {
    if (cubeZ.checked) cubeAxis = Z_AXIS;
  };
  cubeBtn.onclick = () => {
    cubeFlag = !cubeFlag;
  };

  // Event listeners for Sphere
  sphereX.onchange = () => {
    if (sphereX.checked) sphereAxis = X_AXIS;
  };
  sphereY.onchange = () => {
    if (sphereY.checked) sphereAxis = Y_AXIS;
  };
  sphereZ.onchange = () => {
    if (sphereZ.checked) sphereAxis = Z_AXIS;
  };
  sphereBtn.onclick = () => {
    sphereFlag = !sphereFlag;
  };

  // Add these to getUIElement() function after the sphere controls
  sliderAmbient = document.getElementById("slider-ambient");
  sliderDiffuse = document.getElementById("slider-diffuse");
  sliderSpecular = document.getElementById("slider-specular");
  sliderShininess = document.getElementById("slider-shininess");
  sliderLightX = document.getElementById("slider-light-x");
  sliderLightY = document.getElementById("slider-light-y");
  sliderLightZ = document.getElementById("slider-light-z");
  textAmbient = document.getElementById("text-ambient");
  textDiffuse = document.getElementById("text-diffuse");
  textSpecular = document.getElementById("text-specular");
  textShininess = document.getElementById("text-shininess");
  textLightX = document.getElementById("text-light-x");
  textLightY = document.getElementById("text-light-y");
  textLightZ = document.getElementById("text-light-z");

  // Add these event listeners after the sphere event listeners
  sliderAmbient.onchange = function (event) {
    ambient = event.target.value;
    textAmbient.innerHTML = ambient;
    lightAmbient = vec4(ambient, ambient, ambient, 1.0);
    recompute();
  };

  sliderDiffuse.onchange = function (event) {
    diffuse = event.target.value;
    textDiffuse.innerHTML = diffuse;
    lightDiffuse = vec4(diffuse, diffuse, diffuse, 1.0);
    recompute();
  };

  sliderSpecular.onchange = function (event) {
    specular = event.target.value;
    textSpecular.innerHTML = specular;
    lightSpecular = vec4(specular, specular, specular, 1.0);
    recompute();
  };

  sliderShininess.onchange = function (event) {
    shininess = event.target.value;
    textShininess.innerHTML = shininess;
    recompute();
  };

  sliderLightX.onchange = function (event) {
    lightPos[0] = event.target.value;
    textLightX.innerHTML = lightPos[0].toFixed(1);
    recompute();
  };

  sliderLightY.onchange = function (event) {
    lightPos[1] = event.target.value;
    textLightY.innerHTML = lightPos[1].toFixed(1);
    recompute();
  };

  sliderLightZ.onchange = function (event) {
    lightPos[2] = event.target.value;
    textLightZ.innerHTML = lightPos[2].toFixed(1);
    recompute();
  };

  // Add to your getUIElement() function
  var sliderSpeed = document.getElementById("slider-speed");
  var textSpeed = document.getElementById("text-speed");

  // Add both 'input' and 'change' event listeners for real-time updates
  sliderSpeed.oninput = function (event) {
    rotationSpeed = parseFloat(event.target.value);
    textSpeed.innerHTML = event.target.value;
  };

  sliderSpeed.onchange = function (event) {
    rotationSpeed = parseFloat(event.target.value);
    textSpeed.innerHTML = event.target.value;
  };

  // Color controls
  cylinderColor = document.getElementById("cylinder-color");
  cubeColor = document.getElementById("cube-color");
  sphereColor = document.getElementById("sphere-color");

  // Color change event listeners
  cylinderColor.onchange = function (event) {
    const color = hexToRGB(event.target.value);
    cylinderMaterial = vec4(color.r, color.g, color.b, 1.0);
    recompute();
  };

  cubeColor.onchange = function (event) {
    const color = hexToRGB(event.target.value);
    cubeMaterial = vec4(color.r, color.g, color.b, 1.0);
    recompute();
  };

  sphereColor.onchange = function (event) {
    const color = hexToRGB(event.target.value);
    sphereMaterial = vec4(color.r, color.g, color.b, 1.0);
    recompute();
  };
}

// Configure WebGL Settings
function configWebGL() {
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) alert("WebGL isn't available");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  pBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
}

// Render the graphics for viewing
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  projectionMatrix = ortho(-4, 4, -2.25, 2.25, -5, 5);
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  // Set up lighting uniforms
  gl.uniform4fv(gl.getUniformLocation(program, "lightPos"), flatten(lightPos));
  gl.uniform1f(gl.getUniformLocation(program, "shininess"), shininess);

  // Draw each object with its own material
  drawCylinder();
  drawCube();
  drawSphere();
}

// Update the animation frame
function animUpdate() {
  // Cancel any existing animation frame before requesting a new one
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawCylinder();
  drawCube();
  drawSphere();
  // drawWall();  // Comment this line out to test

  // Store the animation frame ID
  animationFrameId = requestAnimationFrame(animUpdate);
}

// Draw functions for Cylinder, Cube, and Sphere
function drawCylinder() {
  if (cylinderFlag) {
    cylinderTheta[cylinderAxis] += rotationSpeed;
  }

  // Set material for cylinder
  const cylinderAmbientProduct = mult(lightAmbient, cylinderMaterial);
  const cylinderDiffuseProduct = mult(lightDiffuse, cylinderMaterial);
  const cylinderSpecularProduct = mult(lightSpecular, materialSpecular);

  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(cylinderAmbientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(cylinderDiffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(cylinderSpecularProduct)
  );

  modelViewMatrix = mat4();
  modelViewMatrix = mult(modelViewMatrix, translate(-2, 0, 0));
  modelViewMatrix = mult(
    modelViewMatrix,
    rotate(cylinderTheta[X_AXIS], [1, 0, 0])
  );
  modelViewMatrix = mult(
    modelViewMatrix,
    rotate(cylinderTheta[Y_AXIS], [0, 1, 0])
  );
  modelViewMatrix = mult(
    modelViewMatrix,
    rotate(cylinderTheta[Z_AXIS], [0, 0, 1])
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  nMatrix = normalMatrix(modelViewMatrix);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  gl.drawArrays(gl.TRIANGLES, 0, cylinderV);
}

function drawCube() {
  if (cubeFlag) {
    cubeTheta[cubeAxis] += rotationSpeed;
  }

  // Set material for cube
  const cubeAmbientProduct = mult(lightAmbient, cubeMaterial);
  const cubeDiffuseProduct = mult(lightDiffuse, cubeMaterial);
  const cubeSpecularProduct = mult(lightSpecular, materialSpecular);

  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(cubeAmbientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(cubeDiffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(cubeSpecularProduct)
  );

  modelViewMatrix = mat4();
  modelViewMatrix = mult(modelViewMatrix, translate(0, 0, 0));
  modelViewMatrix = mult(modelViewMatrix, rotate(cubeTheta[X_AXIS], [1, 0, 0]));
  modelViewMatrix = mult(modelViewMatrix, rotate(cubeTheta[Y_AXIS], [0, 1, 0]));
  modelViewMatrix = mult(modelViewMatrix, rotate(cubeTheta[Z_AXIS], [0, 0, 1]));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  nMatrix = normalMatrix(modelViewMatrix);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  gl.drawArrays(gl.TRIANGLES, cylinderV, cubeV);
}

function drawSphere() {
  if (sphereFlag) {
    sphereTheta[sphereAxis] += rotationSpeed;
  }

  // Set material for sphere
  const sphereAmbientProduct = mult(lightAmbient, sphereMaterial);
  const sphereDiffuseProduct = mult(lightDiffuse, sphereMaterial);
  const sphereSpecularProduct = mult(lightSpecular, materialSpecular);

  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(sphereAmbientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(sphereDiffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(sphereSpecularProduct)
  );

  modelViewMatrix = mat4();
  modelViewMatrix = mult(modelViewMatrix, translate(2, 0, 0));
  modelViewMatrix = mult(
    modelViewMatrix,
    rotate(sphereTheta[X_AXIS], [1, 0, 0])
  );
  modelViewMatrix = mult(
    modelViewMatrix,
    rotate(sphereTheta[Y_AXIS], [0, 1, 0])
  );
  modelViewMatrix = mult(
    modelViewMatrix,
    rotate(sphereTheta[Z_AXIS], [0, 0, 1])
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  nMatrix = normalMatrix(modelViewMatrix);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  gl.drawArrays(gl.TRIANGLES, cylinderV + cubeV, sphereV);
}

function drawWall() {
  modelViewMatrix = mat4();
  modelViewMatrix = mult(modelViewMatrix, translate(0, 0, 0)); // Position wall at far Z boundary
  modelViewMatrix = mult(modelViewMatrix, scale(8, 4.5, 0.01)); // Adjust scale to fit scene
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  nMatrix = normalMatrix(modelViewMatrix);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  // Use the correct offset for wall vertices
  gl.drawArrays(gl.TRIANGLES, cylinderV + cubeV + sphereV, wallV);
}

// Concatenate the corresponding shape's values
function concatData(point, normal) {
  pointsArray = pointsArray.concat(point);
  normalsArray = normalsArray.concat(normal);
}

// Modify the recompute function
function recompute() {
  // Cancel any existing animation frame
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Store current rotation states
  const savedCylinderTheta = [...cylinderTheta];
  const savedCubeTheta = [...cubeTheta];
  const savedSphereTheta = [...sphereTheta];
  const savedRotationSpeed = rotationSpeed;

  // Reset arrays
  pointsArray = [];
  normalsArray = [];

  cylinderObj = cylinder(72, 3, true);
  cylinderObj.Rotate(45, [1, 1, 0]);
  cylinderObj.Scale(1.2, 1.2, 1.2);
  concatData(cylinderObj.Point, cylinderObj.Normal);

  cubeObj = cube();
  cubeObj.Rotate(45, [1, 1, 0]);
  cubeObj.Scale(1, 1, 1);
  concatData(cubeObj.Point, cubeObj.Normal);

  sphereObj = sphere(4);
  sphereObj.Rotate(45, [0, 1, 0]);
  sphereObj.Scale(0.8, 0.8, 0.8);
  concatData(sphereObj.Point, sphereObj.Normal);

  wallObj = wall();
  concatData(wallObj.Point, wallObj.Normal);

  cylinderV = cylinderObj.Point.length;
  cubeV = cubeObj.Point.length;
  sphereV = sphereObj.Point.length;
  wallV = wallObj.Point.length;
  totalV = pointsArray.length;

  // Restore rotation states
  cylinderTheta = [...savedCylinderTheta];
  cubeTheta = [...savedCubeTheta];
  sphereTheta = [...savedSphereTheta];
  rotationSpeed = savedRotationSpeed;

  configWebGL();
  render();

  // Restart animation
  animationFrameId = requestAnimationFrame(animUpdate);
}

// Add this helper function to convert hex colors to RGB
function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

/*-----------------------------------------------------------------------------------*/
