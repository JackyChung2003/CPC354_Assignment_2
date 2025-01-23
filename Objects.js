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
var lightPos = vec4(0.0, 2.0, 0.0, 1.0);
var lightAmbient = vec4(ambient, ambient, ambient, 1.0);
var lightDiffuse = vec4(diffuse, diffuse, diffuse, 1.0);
var lightSpecular = vec4(specular, specular, specular, 1.0);

var materialAmbient = vec4(0.5, 0.5, 1.0, 1.0);
var materialDiffuse = vec4(0.0, 0.9, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);

// Add new UI element variables
var lightTypeSelect,
  ambientColorPicker,
  diffuseColorPicker,
  specularColorPicker;
var sliderLightX, sliderLightY, sliderLightZ;

// Add new variables for spot light
var currentLightType = "point"; // 'point', 'directional', or 'spot'
var spotDirection = vec3(0.0, -1.0, 0.0);
var spotCutoff = 45.0;

// Add variables for light states
var pointLightEnabled = true;
var spotLightEnabled = true;

// Add camera variables
var eye = vec3(0.0, 0.0, 5.0); // Camera position
var at = vec3(0.0, 0.0, 0.0); // Look at point
var up = vec3(0.0, 1.0, 0.0); // Up vector

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

  // Set initial values for spot light controls
  document.getElementById("slider-spot-x").value = "0.0";
  document.getElementById("text-spot-x").innerHTML = "0.0";
  document.getElementById("slider-spot-y").value = "2.0";
  document.getElementById("text-spot-y").innerHTML = "2.0";
  document.getElementById("slider-spot-z").value = "0.0";
  document.getElementById("text-spot-z").innerHTML = "0.0";

  document.getElementById("slider-spot-dir-x").value = "0.0";
  document.getElementById("text-spot-dir-x").innerHTML = "0.0";
  document.getElementById("slider-spot-dir-y").value = "-1.0";
  document.getElementById("text-spot-dir-y").innerHTML = "-1.0";
  document.getElementById("slider-spot-dir-z").value = "0.0";
  document.getElementById("text-spot-dir-z").innerHTML = "0.0";

  document.getElementById("slider-spot-angle").value = "45.0";
  document.getElementById("text-spot-angle").innerHTML = "45.0";

  // Add event listeners for light toggles
  document.getElementById("point-light-toggle").onchange = function () {
    pointLightEnabled = this.checked;
    render();
  };

  document.getElementById("spot-light-toggle").onchange = function () {
    spotLightEnabled = this.checked;
    render();
  };

  // Add camera control handlers
  document.getElementById("camera-pos-x").oninput = function () {
    eye[0] = parseFloat(this.value);
    document.getElementById("text-camera-pos-x").innerHTML = this.value;
    render();
  };

  document.getElementById("camera-pos-y").oninput = function () {
    eye[1] = parseFloat(this.value);
    document.getElementById("text-camera-pos-y").innerHTML = this.value;
    render();
  };

  document.getElementById("camera-pos-z").oninput = function () {
    eye[2] = parseFloat(this.value);
    document.getElementById("text-camera-pos-z").innerHTML = this.value;
    render();
  };

  document.getElementById("look-at-x").oninput = function () {
    at[0] = parseFloat(this.value);
    document.getElementById("text-look-at-x").innerHTML = this.value;
    render();
  };

  document.getElementById("look-at-y").oninput = function () {
    at[1] = parseFloat(this.value);
    document.getElementById("text-look-at-y").innerHTML = this.value;
    render();
  };

  document.getElementById("look-at-z").oninput = function () {
    at[2] = parseFloat(this.value);
    document.getElementById("text-look-at-z").innerHTML = this.value;
    render();
  };
};

// Retrieve all elements from HTML and store in the corresponding variables
function getUIElement() {
  canvas = document.getElementById("gl-canvas");

  // Get new lighting control elements
  lightTypeSelect = document.getElementById("light-type");
  ambientColorPicker = document.getElementById("ambient-color");
  diffuseColorPicker = document.getElementById("diffuse-color");
  specularColorPicker = document.getElementById("specular-color");

  sliderLightX = document.getElementById("slider-light-x");
  sliderLightY = document.getElementById("slider-light-y");
  sliderLightZ = document.getElementById("slider-light-z");

  // Add event listeners for light controls
  lightTypeSelect.onchange = function () {
    lightPos[3] = this.value === "directional" ? 0.0 : 1.0;
    render();
  };

  sliderLightX.oninput = function () {
    lightPos[0] = parseFloat(this.value);
    document.getElementById("text-light-x").innerHTML = this.value;
    render();
  };

  sliderLightY.oninput = function () {
    lightPos[1] = parseFloat(this.value);
    document.getElementById("text-light-y").innerHTML = this.value;
    render();
  };

  sliderLightZ.oninput = function () {
    lightPos[2] = parseFloat(this.value);
    document.getElementById("text-light-z").innerHTML = this.value;
    render();
  };

  // Color picker event handlers
  ambientColorPicker.oninput = function () {
    const color = hexToRgb(this.value);
    lightAmbient = vec4(color.r, color.g, color.b, 1.0);
    render();
  };

  diffuseColorPicker.oninput = function () {
    const color = hexToRgb(this.value);
    lightDiffuse = vec4(color.r, color.g, color.b, 1.0);
    render();
  };

  specularColorPicker.oninput = function () {
    const color = hexToRgb(this.value);
    lightSpecular = vec4(color.r, color.g, color.b, 1.0);
    render();
  };

  // Get spot light controls
  var spotLightControls = {
    position: {
      x: document.getElementById("slider-spot-x"),
      y: document.getElementById("slider-spot-y"),
      z: document.getElementById("slider-spot-z"),
    },
    direction: {
      x: document.getElementById("slider-spot-dir-x"),
      y: document.getElementById("slider-spot-dir-y"),
      z: document.getElementById("slider-spot-dir-z"),
    },
    angle: document.getElementById("slider-spot-angle"),
    colors: {
      ambient: document.getElementById("spot-ambient-color"),
      diffuse: document.getElementById("spot-diffuse-color"),
      specular: document.getElementById("spot-specular-color"),
    },
  };

  // Add spot light event listeners
  document.getElementById("slider-spot-x").oninput = function () {
    lightPos[0] = parseFloat(this.value);
    document.getElementById("text-spot-x").innerHTML = this.value;
    render();
  };

  document.getElementById("slider-spot-y").oninput = function () {
    lightPos[1] = parseFloat(this.value);
    document.getElementById("text-spot-y").innerHTML = this.value;
    render();
  };

  document.getElementById("slider-spot-z").oninput = function () {
    lightPos[2] = parseFloat(this.value);
    document.getElementById("text-spot-z").innerHTML = this.value;
    render();
  };

  document.getElementById("slider-spot-dir-x").oninput = function () {
    spotDirection[0] = parseFloat(this.value);
    document.getElementById("text-spot-dir-x").innerHTML = this.value;
    render();
  };

  document.getElementById("slider-spot-dir-y").oninput = function () {
    spotDirection[1] = parseFloat(this.value);
    document.getElementById("text-spot-dir-y").innerHTML = this.value;
    render();
  };

  document.getElementById("slider-spot-dir-z").oninput = function () {
    spotDirection[2] = parseFloat(this.value);
    document.getElementById("text-spot-dir-z").innerHTML = this.value;
    render();
  };

  document.getElementById("slider-spot-angle").oninput = function () {
    spotCutoff = parseFloat(this.value);
    document.getElementById("text-spot-angle").innerHTML = this.value;
    render();
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

  // Add uniform locations for spot light
  gl.uniform3fv(
    gl.getUniformLocation(program, "spotDirection"),
    flatten(spotDirection)
  );
  gl.uniform1f(gl.getUniformLocation(program, "spotCutoff"), spotCutoff);
  gl.uniform1i(gl.getUniformLocation(program, "lightType"), 0); // Default to point/directional
}

// Render the graphics for viewing
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Update view matrix using lookAt
  modelViewMatrix = lookAt(eye, at, up);

  // Update projection matrix
  projectionMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100.0);

  // Send matrices to shaders
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  // Calculate and update normal matrix
  nMatrix = normalMatrix(modelViewMatrix, true);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  ambientProduct = mult(lightAmbient, materialAmbient);
  diffuseProduct = mult(lightDiffuse, materialDiffuse);
  specularProduct = mult(lightSpecular, materialSpecular);
  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(specularProduct)
  );
  gl.uniform4fv(gl.getUniformLocation(program, "lightPos"), flatten(lightPos));
  gl.uniform1f(gl.getUniformLocation(program, "shininess"), shininess);

  // Update light uniforms
  gl.uniform1i(
    gl.getUniformLocation(program, "pointLightEnabled"),
    pointLightEnabled ? 1 : 0
  );
  gl.uniform1i(
    gl.getUniformLocation(program, "spotLightEnabled"),
    spotLightEnabled ? 1 : 0
  );

  // Point light uniforms
  gl.uniform4fv(
    gl.getUniformLocation(program, "pointLightPos"),
    flatten(lightPos)
  );

  // Spot light uniforms
  gl.uniform4fv(
    gl.getUniformLocation(program, "spotLightPos"),
    flatten(lightPos)
  );
  gl.uniform3fv(
    gl.getUniformLocation(program, "spotDirection"),
    flatten(spotDirection)
  );
  gl.uniform1f(gl.getUniformLocation(program, "spotCutoff"), spotCutoff);

  drawCylinder();
  drawCube();
  drawSphere();
  drawWall();
}

// Draw functions for Cylinder, Cube, and Sphere
function drawCylinder() {
  var mvMatrix = mult(modelViewMatrix, translate(-2, 0, 0));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvMatrix));

  var nMatrix = normalMatrix(mvMatrix, true);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  gl.drawArrays(gl.TRIANGLES, 0, cylinderV);
}

function drawCube() {
  var mvMatrix = mult(modelViewMatrix, translate(0, 0, 0));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvMatrix));

  var nMatrix = normalMatrix(mvMatrix, true);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  gl.drawArrays(gl.TRIANGLES, cylinderV, cubeV);
}

function drawSphere() {
  var mvMatrix = mult(modelViewMatrix, translate(2, 0, 0));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvMatrix));

  var nMatrix = normalMatrix(mvMatrix, true);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  gl.drawArrays(gl.TRIANGLES, cylinderV + cubeV, sphereV);
}

function drawWall() {
  var mvMatrix = mult(
    modelViewMatrix,
    mult(translate(0, 0, -2), scale(8, 4.5, 0.01))
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvMatrix));

  var nMatrix = normalMatrix(mvMatrix, true);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  gl.drawArrays(gl.TRIANGLES, cylinderV + cubeV + sphereV, wallV);
}

// Concatenate the corresponding shape's values
function concatData(point, normal) {
  pointsArray = pointsArray.concat(point);
  normalsArray = normalsArray.concat(normal);
}

// Add utility function for converting hex colors to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : null;
}

// Add tab switching function
function openTab(evt, tabName) {
  // Hide all tab content
  var tabContent = document.getElementsByClassName("tab-content");
  for (var i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }

  // Remove active class from all tab buttons
  var tabButtons = document.getElementsByClassName("tab-button");
  for (var i = 0; i < tabButtons.length; i++) {
    tabButtons[i].className = tabButtons[i].className.replace(" active", "");
  }

  // Show the selected tab content and mark button as active
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";

  // Don't change light states when switching tabs
  render();
}

// Helper function to calculate normal matrix
function normalMatrix(m, flag) {
  var m3 = mat3();

  // Extract the 3x3 portion of the modelView matrix
  m3[0][0] = m[0][0];
  m3[0][1] = m[0][1];
  m3[0][2] = m[0][2];
  m3[1][0] = m[1][0];
  m3[1][1] = m[1][1];
  m3[1][2] = m[1][2];
  m3[2][0] = m[2][0];
  m3[2][1] = m[2][1];
  m3[2][2] = m[2][2];

  if (flag) {
    // Compute inverse transpose
    return inverse3(transpose(m3));
  }
  return m3;
}

// Helper function to compute inverse of 3x3 matrix
function inverse3(m) {
  var a00 = m[0][0],
    a01 = m[0][1],
    a02 = m[0][2];
  var a10 = m[1][0],
    a11 = m[1][1],
    a12 = m[1][2];
  var a20 = m[2][0],
    a21 = m[2][1],
    a22 = m[2][2];

  var det =
    a00 * (a11 * a22 - a12 * a21) -
    a01 * (a10 * a22 - a12 * a20) +
    a02 * (a10 * a21 - a11 * a20);

  var result = mat3();

  result[0][0] = (a11 * a22 - a21 * a12) / det;
  result[0][1] = (a02 * a21 - a01 * a22) / det;
  result[0][2] = (a01 * a12 - a02 * a11) / det;
  result[1][0] = (a12 * a20 - a10 * a22) / det;
  result[1][1] = (a00 * a22 - a02 * a20) / det;
  result[1][2] = (a10 * a02 - a00 * a12) / det;
  result[2][0] = (a10 * a21 - a20 * a11) / det;
  result[2][1] = (a20 * a01 - a00 * a21) / det;
  result[2][2] = (a00 * a11 - a10 * a01) / det;

  return result;
}

/*-----------------------------------------------------------------------------------*/
