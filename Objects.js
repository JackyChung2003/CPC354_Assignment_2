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

// Add these to your variable declarations
const cylinderMaterial = {
  ambient: vec4(0.5, 0.5, 0.5, 1.0),
  diffuse: vec4(0.5, 0.5, 0.5, 1.0),
  specular: vec4(0.5, 0.5, 0.5, 1.0),
};

const cubeMaterial = {
  ambient: vec4(0.5, 0.5, 0.5, 1.0),
  diffuse: vec4(0.5, 0.5, 0.5, 1.0),
  specular: vec4(0.5, 0.5, 0.5, 1.0),
};

const sphereMaterial = {
  ambient: vec4(0.5, 0.5, 0.5, 1.0),
  diffuse: vec4(0.5, 0.5, 0.5, 1.0),
  specular: vec4(0.5, 0.5, 0.5, 1.0),
};

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

  // Tab functionality
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and panes
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      // Add active class to clicked button and corresponding pane
      button.classList.add("active");
      document
        .getElementById(`${button.dataset.tab}-tab`)
        .classList.add("active");
    });
  });
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

  // Cylinder lighting controls
  const cylinderAmbient = document.getElementById("cylinder-ambient");
  const cylinderDiffuse = document.getElementById("cylinder-diffuse");
  const cylinderSpecular = document.getElementById("cylinder-specular");
  const textCylinderAmbient = document.getElementById("text-cylinder-ambient");
  const textCylinderDiffuse = document.getElementById("text-cylinder-diffuse");
  const textCylinderSpecular = document.getElementById(
    "text-cylinder-specular"
  );

  cylinderAmbient.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCylinderAmbient.innerHTML = value.toFixed(1);
    cylinderMaterial.ambient = vec4(value, value, value, 1.0);
    debouncedRecompute();
  });

  cylinderDiffuse.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCylinderDiffuse.innerHTML = value.toFixed(1);
    cylinderMaterial.diffuse = vec4(value, value, value, 1.0);
    debouncedRecompute();
  });

  cylinderSpecular.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCylinderSpecular.innerHTML = value.toFixed(1);
    cylinderMaterial.specular = vec4(value, value, value, 1.0);
    debouncedRecompute();
  });

  // Cube lighting controls
  const cubeAmbient = document.getElementById("cube-ambient");
  const cubeDiffuse = document.getElementById("cube-diffuse");
  const cubeSpecular = document.getElementById("cube-specular");
  const textCubeAmbient = document.getElementById("text-cube-ambient");
  const textCubeDiffuse = document.getElementById("text-cube-diffuse");
  const textCubeSpecular = document.getElementById("text-cube-specular");

  cubeAmbient.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCubeAmbient.innerHTML = value.toFixed(1);
    cubeMaterial.ambient = vec4(value, value, value, 1.0);
    debouncedRecompute();
  });

  cubeDiffuse.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCubeDiffuse.innerHTML = value.toFixed(1);
    cubeMaterial.diffuse = vec4(value, value, value, 1.0);
    debouncedRecompute();
  });

  cubeSpecular.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCubeSpecular.innerHTML = value.toFixed(1);
    cubeMaterial.specular = vec4(value, value, value, 1.0);
    debouncedRecompute();
  });

  // Sphere lighting controls
  const sphereAmbient = document.getElementById("sphere-ambient");
  const sphereDiffuse = document.getElementById("sphere-diffuse");
  const sphereSpecular = document.getElementById("sphere-specular");
  const textSphereAmbient = document.getElementById("text-sphere-ambient");
  const textSphereDiffuse = document.getElementById("text-sphere-diffuse");
  const textSphereSpecular = document.getElementById("text-sphere-specular");

  sphereAmbient.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textSphereAmbient.innerHTML = value.toFixed(1);
    sphereMaterial.ambient = vec4(value, value, value, 1.0);
    debouncedRecompute();
  });

  sphereDiffuse.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textSphereDiffuse.innerHTML = value.toFixed(1);
    sphereMaterial.diffuse = vec4(value, value, value, 1.0);
    debouncedRecompute();
  });

  sphereSpecular.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textSphereSpecular.innerHTML = value.toFixed(1);
    sphereMaterial.specular = vec4(value, value, value, 1.0);
    debouncedRecompute();
  });

  // Add debounce function to prevent too many recomputes
  const debouncedRecompute = debounce(() => {
    recompute();
  }, 16); // ~60fps

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
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

  animUpdate();
}

// Update the animation frame
function animUpdate() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawCylinder();
  drawCube();
  drawSphere();
  drawWall();
  window.requestAnimationFrame(animUpdate);
}

// Draw functions for Cylinder, Cube, and Sphere
function drawCylinder() {
  if (cylinderFlag) cylinderTheta[cylinderAxis] += 1;

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

  // Update material products
  const ambientProduct = mult(lightAmbient, cylinderMaterial.ambient);
  const diffuseProduct = mult(lightDiffuse, cylinderMaterial.diffuse);
  const specularProduct = mult(lightSpecular, cylinderMaterial.specular);

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

  gl.drawArrays(gl.TRIANGLES, 0, cylinderV);
}

function drawCube() {
  if (cubeFlag) cubeTheta[cubeAxis] += 1;

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
  if (sphereFlag) sphereTheta[sphereAxis] += 1;

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

/*-----------------------------------------------------------------------------------*/
