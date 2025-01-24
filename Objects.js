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
  specular = 0.5;
var lightPos = vec4(0.0, 2.0, 0.0, 1.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.5, 0.0, 0.0, 1.0);
var materialDiffuse = vec4(1.0, 0.0, 0.0, 1.0);
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

// Add material properties for each object
var materials = {
  cylinder: {
    ambient: vec4(0.5, 0.0, 0.0, 1.0), // Red-ish
    diffuse: vec4(1.0, 0.0, 0.0, 1.0),
    specular: vec4(1.0, 1.0, 1.0, 1.0),
    shininess: 30.0,
    ambientCoef: 0.5,
    diffuseCoef: 0.8,
    specularCoef: 0.5,
  },
  cube: {
    ambient: vec4(0.0, 0.5, 0.0, 1.0), // Green-ish
    diffuse: vec4(0.0, 1.0, 0.0, 1.0),
    specular: vec4(1.0, 1.0, 1.0, 1.0),
    shininess: 30.0,
    ambientCoef: 0.5,
    diffuseCoef: 0.8,
    specularCoef: 0.5,
  },
  sphere: {
    ambient: vec4(0.0, 0.0, 0.5, 1.0), // Blue-ish
    diffuse: vec4(0.0, 0.0, 1.0, 1.0),
    specular: vec4(1.0, 1.0, 1.0, 1.0),
    shininess: 30.0,
    ambientCoef: 0.5,
    diffuseCoef: 0.8,
    specularCoef: 0.5,
  },
  wall: {
    ambient: vec4(0.5, 0.5, 0.5, 1.0), // Gray
    diffuse: vec4(0.8, 0.8, 0.8, 1.0),
    specular: vec4(1.0, 1.0, 1.0, 1.0),
    shininess: 30.0,
    ambientCoef: 0.5,
    diffuseCoef: 0.8,
    specularCoef: 0.5,
  },
};

var currentObject = "cylinder";

// Add these variables at the top with other declarations
var currentShading = "phong";
var phongProgram, gouraudProgram;

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

  // Add material control handlers
  document.getElementById("object-select").onchange = function () {
    currentObject = this.value;
    updateMaterialControls();
  };

  document.getElementById("material-ambient-color").oninput = function () {
    const color = hexToRgb(this.value);
    materials[currentObject].ambient = vec4(color.r, color.g, color.b, 1.0);
    render();
  };

  document.getElementById("material-diffuse-color").oninput = function () {
    const color = hexToRgb(this.value);
    materials[currentObject].diffuse = vec4(color.r, color.g, color.b, 1.0);
    render();
  };

  document.getElementById("material-specular-color").oninput = function () {
    const color = hexToRgb(this.value);
    materials[currentObject].specular = vec4(color.r, color.g, color.b, 1.0);
    render();
  };

  document.getElementById("ambient-coef").oninput = function () {
    materials[currentObject].ambientCoef = parseFloat(this.value);
    document.getElementById("text-ambient-coef").innerHTML = this.value;
    render();
  };

  document.getElementById("diffuse-coef").oninput = function () {
    materials[currentObject].diffuseCoef = parseFloat(this.value);
    document.getElementById("text-diffuse-coef").innerHTML = this.value;
    render();
  };

  document.getElementById("specular-coef").oninput = function () {
    materials[currentObject].specularCoef = parseFloat(this.value);
    document.getElementById("text-specular-coef").innerHTML = this.value;
    render();
  };

  document.getElementById("material-shininess").oninput = function () {
    materials[currentObject].shininess = parseFloat(this.value);
    document.getElementById("text-material-shininess").innerHTML = this.value;
    render();
  };

  // Add shininess control handler
  document
    .getElementById("material-shininess")
    .addEventListener("input", function () {
      materials[currentObject].shininess = parseFloat(this.value);
      document.getElementById("text-material-shininess").innerHTML = this.value;
      render();
    });

  updateMaterialControls();
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

  // Add shading type selector handler
  document.getElementById("shading-type").onchange = function () {
    currentShading = this.value;
    program = currentShading === "phong" ? phongProgram : gouraudProgram;
    gl.useProgram(program);

    // Re-get all attribute and uniform locations
    setupShaderLocations();
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

  // Initialize both shader programs
  phongProgram = initShaders(
    gl,
    "phong-vertex-shader",
    "phong-fragment-shader"
  );
  gouraudProgram = initShaders(
    gl,
    "gouraud-vertex-shader",
    "gouraud-fragment-shader"
  );

  // Set initial program
  program = phongProgram;
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
  var mat = materials.cylinder;
  updateMaterialUniforms(mat);
  var mvMatrix = mult(modelViewMatrix, translate(-2, 0, 0));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvMatrix));

  var nMatrix = normalMatrix(mvMatrix, true);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  gl.drawArrays(gl.TRIANGLES, 0, cylinderV);
}

function drawCube() {
  var mat = materials.cube;
  updateMaterialUniforms(mat);
  var mvMatrix = mult(modelViewMatrix, translate(0, 0, 0));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvMatrix));

  var nMatrix = normalMatrix(mvMatrix, true);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  gl.drawArrays(gl.TRIANGLES, cylinderV, cubeV);
}

function drawSphere() {
  var mat = materials.sphere;
  updateMaterialUniforms(mat);
  var mvMatrix = mult(modelViewMatrix, translate(2, 0, 0));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvMatrix));

  var nMatrix = normalMatrix(mvMatrix, true);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  gl.drawArrays(gl.TRIANGLES, cylinderV + cubeV, sphereV);
}

function drawWall() {
  var mat = materials.wall;
  updateMaterialUniforms(mat);
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

function updateMaterialUniforms(material) {
  // Calculate lighting products
  var ambientProduct = vec4(
    material.ambient[0] * material.ambientCoef * lightAmbient[0],
    material.ambient[1] * material.ambientCoef * lightAmbient[1],
    material.ambient[2] * material.ambientCoef * lightAmbient[2],
    1.0
  );

  var diffuseProduct = vec4(
    material.diffuse[0] * material.diffuseCoef * lightDiffuse[0],
    material.diffuse[1] * material.diffuseCoef * lightDiffuse[1],
    material.diffuse[2] * material.diffuseCoef * lightDiffuse[2],
    1.0
  );

  var specularProduct = vec4(
    material.specular[0] * material.specularCoef * lightSpecular[0],
    material.specular[1] * material.specularCoef * lightSpecular[1],
    material.specular[2] * material.specularCoef * lightSpecular[2],
    1.0
  );

  // Send material properties to shader
  gl.uniform4fv(
    gl.getUniformLocation(program, "materialAmbient"),
    flatten(material.ambient)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "materialDiffuse"),
    flatten(material.diffuse)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "materialSpecular"),
    flatten(material.specular)
  );

  // Send lighting products to shader
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

  // Send coefficients and shininess
  gl.uniform1f(
    gl.getUniformLocation(program, "ambientCoef"),
    material.ambientCoef
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "diffuseCoef"),
    material.diffuseCoef
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "specularCoef"),
    material.specularCoef
  );
  gl.uniform1f(gl.getUniformLocation(program, "shininess"), material.shininess);
}

function updateMaterialControls() {
  const material = materials[currentObject];
  document.getElementById("material-ambient-color").value = rgbToHex(
    material.ambient
  );
  document.getElementById("material-diffuse-color").value = rgbToHex(
    material.diffuse
  );
  document.getElementById("material-specular-color").value = rgbToHex(
    material.specular
  );
  document.getElementById("ambient-coef").value = material.ambientCoef;
  document.getElementById("diffuse-coef").value = material.diffuseCoef;
  document.getElementById("specular-coef").value = material.specularCoef;
  document.getElementById("material-shininess").value = material.shininess;

  document.getElementById("text-ambient-coef").innerHTML = material.ambientCoef;
  document.getElementById("text-diffuse-coef").innerHTML = material.diffuseCoef;
  document.getElementById("text-specular-coef").innerHTML =
    material.specularCoef;
  document.getElementById("text-material-shininess").innerHTML =
    material.shininess;
}

// Helper function to convert RGB vector to hex
function rgbToHex(color) {
  const r = Math.round(color[0] * 255);
  const g = Math.round(color[1] * 255);
  const b = Math.round(color[2] * 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// Add new function to setup shader locations
function setupShaderLocations() {
  // Get attribute locations
  vPosition = gl.getAttribLocation(program, "vPosition");
  vNormal = gl.getAttribLocation(program, "vNormal");

  // Get uniform locations
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

  // Re-bind buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);
}

/*-----------------------------------------------------------------------------------*/
