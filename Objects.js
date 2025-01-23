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
var lightPos = vec4(2.0, 2.0, 2.0, 1.0); // Move light to a more visible position
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.5, 0.5, 1.0, 1.0);
var materialDiffuse = vec4(0.0, 0.9, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);

// Add these to your variable declarations
const cylinderMaterial = {
  ambient: vec4(0.2, 0.2, 0.2, 1.0), // Dark gray ambient
  diffuse: vec4(0.8, 0.2, 0.2, 1.0), // Red diffuse
  specular: vec4(1.0, 1.0, 1.0, 1.0), // White specular
  shininess: 100.0,
};

const cubeMaterial = {
  ambient: vec4(0.2, 0.2, 0.2, 1.0), // Dark gray ambient
  diffuse: vec4(0.2, 0.8, 0.2, 1.0), // Green diffuse
  specular: vec4(1.0, 1.0, 1.0, 1.0), // White specular
  shininess: 100.0,
};

const sphereMaterial = {
  ambient: vec4(0.2, 0.2, 0.2, 1.0), // Dark gray ambient
  diffuse: vec4(0.2, 0.2, 0.8, 1.0), // Blue diffuse
  specular: vec4(1.0, 1.0, 1.0, 1.0), // White specular
  shininess: 100.0,
};

// Add these variables at the top with other declarations
var eye = vec3(0.0, 0.0, 5.0); // Moved back to z=5
var at = vec3(0.0, 0.0, 0.0); // Looking at center
var up = vec3(0.0, 1.0, 0.0); // Up vector

// Add to variable declarations section
var isPointLightOn = true;
var isPointLight = true; // true for point light, false for directional
var spotLightEnabled = false;
var spotDirection = vec4(0.0, -1.0, 0.0, 0.0);
var spotCutoff = 30.0;
var spotPenumbra = 5.0;
var spotLightPos = vec4(0.0, 1.0, 0.0, 1.0); // w = 1 for positional light
var lightIntensity = 1.0;

// Add to variable declarations
var isLightSourceVisible = true;
var lightSourcePoints = [];
var lightSourceNormals = [];
var spotLightConePoints = [];
var spotLightConeNormals = [];

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

  // Create light source geometries
  createLightSourceGeometries();

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

  // Cylinder shininess control
  const cylinderShininess = document.getElementById("cylinder-shininess");
  const textCylinderShininess = document.getElementById(
    "text-cylinder-shininess"
  );

  cylinderShininess.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCylinderShininess.innerHTML = value.toFixed(1);
    cylinderMaterial.shininess = value;
    debouncedRecompute();
  });

  // Cube shininess control
  const cubeShininess = document.getElementById("cube-shininess");
  const textCubeShininess = document.getElementById("text-cube-shininess");

  cubeShininess.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCubeShininess.innerHTML = value.toFixed(1);
    cubeMaterial.shininess = value;
    debouncedRecompute();
  });

  // Sphere shininess control
  const sphereShininess = document.getElementById("sphere-shininess");
  const textSphereShininess = document.getElementById("text-sphere-shininess");

  sphereShininess.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textSphereShininess.innerHTML = value.toFixed(1);
    sphereMaterial.shininess = value;
    debouncedRecompute();
  });

  // Point Light Controls
  const pointLightType = document.getElementById("point-light-type");
  const directionalLightType = document.getElementById(
    "directional-light-type"
  );
  const pointLightX = document.getElementById("point-light-x");
  const pointLightY = document.getElementById("point-light-y");
  const pointLightZ = document.getElementById("point-light-z");
  const textPointLightX = document.getElementById("text-point-light-x");
  const textPointLightY = document.getElementById("text-point-light-y");
  const textPointLightZ = document.getElementById("text-point-light-z");

  // Light type radio buttons
  pointLightType.addEventListener("change", () => {
    isPointLight = true;
    lightPos[3] = 1.0; // w = 1 for point light
    render();
  });

  directionalLightType.addEventListener("change", () => {
    isPointLight = false;
    lightPos[3] = 0.0; // w = 0 for directional light
    render();
  });

  // Point Light position X
  pointLightX.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textPointLightX.innerHTML = value.toFixed(1);
    lightPos[0] = value;
    render();
  });

  // Point Light position Y
  pointLightY.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textPointLightY.innerHTML = value.toFixed(1);
    lightPos[1] = value;
    render();
  });

  // Point Light position Z
  pointLightZ.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textPointLightZ.innerHTML = value.toFixed(1);
    lightPos[2] = value;
    render();
  });

  // Spot Light Position Controls
  const spotLightPosX = document.getElementById("spot-light-pos-x");
  const spotLightPosY = document.getElementById("spot-light-pos-y");
  const spotLightPosZ = document.getElementById("spot-light-pos-z");
  const textSpotLightPosX = document.getElementById("text-spot-light-pos-x");
  const textSpotLightPosY = document.getElementById("text-spot-light-pos-y");
  const textSpotLightPosZ = document.getElementById("text-spot-light-pos-z");

  // Spot Light position X
  spotLightPosX.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textSpotLightPosX.innerHTML = value.toFixed(1);
    spotLightPos[0] = value;
    updateSpotLightDirection();
    render();
  });

  // Spot Light position Y
  spotLightPosY.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textSpotLightPosY.innerHTML = value.toFixed(1);
    spotLightPos[1] = value;
    updateSpotLightDirection();
    render();
  });

  // Spot Light position Z
  spotLightPosZ.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textSpotLightPosZ.innerHTML = value.toFixed(1);
    spotLightPos[2] = value;
    updateSpotLightDirection();
    render();
  });

  // Spot Light Controls
  const spotLightDirX = document.getElementById("spot-light-dir-x");
  const spotLightDirY = document.getElementById("spot-light-dir-y");
  const spotLightDirZ = document.getElementById("spot-light-dir-z");
  const spotLightCutoff = document.getElementById("spot-light-cutoff");
  const spotLightPenumbra = document.getElementById("spot-light-penumbra");
  const textSpotLightDirX = document.getElementById("text-spot-light-dir-x");
  const textSpotLightDirY = document.getElementById("text-spot-light-dir-y");
  const textSpotLightDirZ = document.getElementById("text-spot-light-dir-z");
  const textSpotLightCutoff = document.getElementById("text-spot-light-cutoff");
  const textSpotLightPenumbra = document.getElementById(
    "text-spot-light-penumbra"
  );

  // Spot Light direction X
  spotLightDirX.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textSpotLightDirX.innerHTML = value.toFixed(1);
    spotDirection[0] = value;
    render();
  });

  // Spot Light direction Y
  spotLightDirY.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textSpotLightDirY.innerHTML = value.toFixed(1);
    spotDirection[1] = value;
    render();
  });

  // Spot Light direction Z
  spotLightDirZ.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textSpotLightDirZ.innerHTML = value.toFixed(1);
    spotDirection[2] = value;
    render();
  });

  // Spot Light cutoff angle
  spotLightCutoff.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textSpotLightCutoff.innerHTML = value.toFixed(0);
    spotCutoff = value;
    render();
  });

  // Penumbra (smooth edges)
  spotLightPenumbra.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textSpotLightPenumbra.innerHTML = value.toFixed(0);
    spotPenumbra = value;
    render();
  });

  // Add tab switching functionality
  const lightTabBtns = document.querySelectorAll(".light-tabs .tab-btn");
  const lightTabPanes = document.querySelectorAll(".light-content .tab-pane");

  lightTabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons and panes
      lightTabBtns.forEach((b) => b.classList.remove("active"));
      lightTabPanes.forEach((p) => p.classList.remove("active"));

      // Add active class to clicked button and corresponding pane
      btn.classList.add("active");
      const tabId = btn.getAttribute("data-tab") + "-tab";
      document.getElementById(tabId).classList.add("active");

      // Update light type based on selected tab
      if (btn.getAttribute("data-tab") === "spot-light") {
        spotLightEnabled = true;
        isPointLight = true; // Spot light is always positional
        lightPos[3] = 1.0;
      } else {
        spotLightEnabled = false;
      }
      render();
    });
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

  // Light Color Controls
  const lightAmbientColor = document.getElementById("light-ambient-color");
  const lightDiffuseColor = document.getElementById("light-diffuse-color");
  const lightSpecularColor = document.getElementById("light-specular-color");
  const lightIntensitySlider = document.getElementById("light-intensity");

  const textLightAmbient = document.getElementById("text-light-ambient");
  const textLightDiffuse = document.getElementById("text-light-diffuse");
  const textLightSpecular = document.getElementById("text-light-specular");
  const textLightIntensity = document.getElementById("text-light-intensity");

  // Ambient color
  lightAmbientColor.addEventListener("input", (e) => {
    lightAmbient = hexToRGB(e.target.value);
    textLightAmbient.innerHTML = rgbToString(lightAmbient);
    updateLightProducts();
    render();
  });

  // Diffuse color
  lightDiffuseColor.addEventListener("input", (e) => {
    lightDiffuse = hexToRGB(e.target.value);
    textLightDiffuse.innerHTML = rgbToString(lightDiffuse);
    updateLightProducts();
    render();
  });

  // Specular color
  lightSpecularColor.addEventListener("input", (e) => {
    lightSpecular = hexToRGB(e.target.value);
    textLightSpecular.innerHTML = rgbToString(lightSpecular);
    updateLightProducts();
    render();
  });

  // Light intensity
  lightIntensitySlider.addEventListener("input", (e) => {
    lightIntensity = parseFloat(e.target.value);
    textLightIntensity.innerHTML = lightIntensity.toFixed(1);
    updateLightProducts();
    render();
  });

  // Light source visibility toggle
  const lightSourceVisible = document.getElementById("light-source-visible");

  lightSourceVisible.addEventListener("change", () => {
    isLightSourceVisible = lightSourceVisible.checked;
    render();
  });

  // Camera Position Controls
  const cameraEyeX = document.getElementById("camera-eye-x");
  const cameraEyeY = document.getElementById("camera-eye-y");
  const cameraEyeZ = document.getElementById("camera-eye-z");
  const textCameraEyeX = document.getElementById("text-camera-eye-x");
  const textCameraEyeY = document.getElementById("text-camera-eye-y");
  const textCameraEyeZ = document.getElementById("text-camera-eye-z");

  // Look At Point Controls
  const cameraAtX = document.getElementById("camera-at-x");
  const cameraAtY = document.getElementById("camera-at-y");
  const cameraAtZ = document.getElementById("camera-at-z");
  const textCameraAtX = document.getElementById("text-camera-at-x");
  const textCameraAtY = document.getElementById("text-camera-at-y");
  const textCameraAtZ = document.getElementById("text-camera-at-z");

  // Camera Position Event Listeners
  cameraEyeX.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCameraEyeX.innerHTML = value.toFixed(1);
    eye[0] = value;
    render();
  });

  cameraEyeY.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCameraEyeY.innerHTML = value.toFixed(1);
    eye[1] = value;
    render();
  });

  cameraEyeZ.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCameraEyeZ.innerHTML = value.toFixed(1);
    eye[2] = value;
    render();
  });

  // Look At Point Event Listeners
  cameraAtX.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCameraAtX.innerHTML = value.toFixed(1);
    at[0] = value;
    render();
  });

  cameraAtY.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCameraAtY.innerHTML = value.toFixed(1);
    at[1] = value;
    render();
  });

  cameraAtZ.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    textCameraAtZ.innerHTML = value.toFixed(1);
    at[2] = value;
    render();
  });
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

  // Wider perspective with adjusted near and far planes
  projectionMatrix = perspective(
    45, // field of view in degrees
    canvas.width / canvas.height, // aspect ratio
    0.1, // near plane
    50.0
  ); // far plane (increased)
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  // Calculate view matrix from camera parameters
  const viewMatrix = lookAt(eye, at, up);

  // Update light position
  updateLightPosition();

  // Draw objects with updated materials
  drawCylinder(viewMatrix);
  drawCube(viewMatrix);
  drawSphere(viewMatrix);
  drawWall(viewMatrix);

  // Draw light source
  if (isLightSourceVisible) {
    drawLightSource(lightPos, spotLightEnabled, viewMatrix);
  }

  // Request next frame if animation is active
  if (cylinderFlag || cubeFlag || sphereFlag) {
    requestAnimationFrame(render);
  }
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
function drawCylinder(viewMatrix) {
  if (cylinderFlag) cylinderTheta[cylinderAxis] += 2.0;

  let modelMatrix = mat4();
  modelMatrix = mult(modelMatrix, translate(-2, 0, 0));
  modelMatrix = mult(modelMatrix, rotate(cylinderTheta[X_AXIS], [1, 0, 0]));
  modelMatrix = mult(modelMatrix, rotate(cylinderTheta[Y_AXIS], [0, 1, 0]));
  modelMatrix = mult(modelMatrix, rotate(cylinderTheta[Z_AXIS], [0, 0, 1]));

  // Combine with view matrix
  modelViewMatrix = mult(viewMatrix, modelMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  // Update normal matrix
  nMatrix = normalMatrix(modelViewMatrix);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  // Set material properties
  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(mult(lightAmbient, cylinderMaterial.ambient))
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(mult(lightDiffuse, cylinderMaterial.diffuse))
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(mult(lightSpecular, cylinderMaterial.specular))
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "shininess"),
    cylinderMaterial.shininess
  );

  gl.drawArrays(gl.TRIANGLES, 0, cylinderV);
}

function drawCube(viewMatrix) {
  if (cubeFlag) cubeTheta[cubeAxis] += 1.0;

  let modelMatrix = mat4();
  modelMatrix = mult(modelMatrix, translate(0, 0, 0));
  modelMatrix = mult(modelMatrix, rotate(cubeTheta[X_AXIS], [1, 0, 0]));
  modelMatrix = mult(modelMatrix, rotate(cubeTheta[Y_AXIS], [0, 1, 0]));
  modelMatrix = mult(modelMatrix, rotate(cubeTheta[Z_AXIS], [0, 0, 1]));

  modelViewMatrix = mult(viewMatrix, modelMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  nMatrix = normalMatrix(modelViewMatrix);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  // Use cube-specific material properties
  const ambientProduct = mult(lightAmbient, cubeMaterial.ambient);
  const diffuseProduct = mult(lightDiffuse, cubeMaterial.diffuse);
  const specularProduct = mult(lightSpecular, cubeMaterial.specular);

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
  gl.uniform1f(
    gl.getUniformLocation(program, "shininess"),
    cubeMaterial.shininess
  );

  gl.drawArrays(gl.TRIANGLES, cylinderV, cubeV);
}

function drawSphere(viewMatrix) {
  if (sphereFlag) sphereTheta[sphereAxis] += 1.0;

  let modelMatrix = mat4();
  modelMatrix = mult(modelMatrix, translate(2, 0, 0));
  modelMatrix = mult(modelMatrix, rotate(sphereTheta[X_AXIS], [1, 0, 0]));
  modelMatrix = mult(modelMatrix, rotate(sphereTheta[Y_AXIS], [0, 1, 0]));
  modelMatrix = mult(modelMatrix, rotate(sphereTheta[Z_AXIS], [0, 0, 1]));

  modelViewMatrix = mult(viewMatrix, modelMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  nMatrix = normalMatrix(modelViewMatrix);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  // Use sphere-specific material properties
  const ambientProduct = mult(lightAmbient, sphereMaterial.ambient);
  const diffuseProduct = mult(lightDiffuse, sphereMaterial.diffuse);
  const specularProduct = mult(lightSpecular, sphereMaterial.specular);

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
  gl.uniform1f(
    gl.getUniformLocation(program, "shininess"),
    sphereMaterial.shininess
  );

  gl.drawArrays(gl.TRIANGLES, cylinderV + cubeV, sphereV);
}

function drawWall(viewMatrix) {
  let modelMatrix = mat4();
  modelMatrix = mult(modelMatrix, translate(0, 0, -2));
  modelMatrix = mult(modelMatrix, scale(8, 4.5, 0.01));

  modelViewMatrix = mult(viewMatrix, modelMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  nMatrix = normalMatrix(modelViewMatrix);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  // Use default material for wall
  const ambientProduct = mult(lightAmbient, materialAmbient);
  const diffuseProduct = mult(lightDiffuse, materialDiffuse);
  const specularProduct = mult(lightSpecular, materialSpecular);

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

  gl.drawArrays(gl.TRIANGLES, cylinderV + cubeV + sphereV, wallV);
}

// Concatenate the corresponding shape's values
function concatData(point, normal) {
  pointsArray = pointsArray.concat(point);
  normalsArray = normalsArray.concat(normal);
}

// Add helper function to update spot light direction
function updateSpotLightDirection() {
  // Normalize the direction vector
  const dirLen = Math.sqrt(
    spotDirection[0] * spotDirection[0] +
      spotDirection[1] * spotDirection[1] +
      spotDirection[2] * spotDirection[2]
  );

  if (dirLen > 0) {
    spotDirection[0] /= dirLen;
    spotDirection[1] /= dirLen;
    spotDirection[2] /= dirLen;
  }
}

// Add helper function to convert hex to RGB
function hexToRGB(hex) {
  const r = parseInt(hex.substr(1, 2), 16) / 255;
  const g = parseInt(hex.substr(3, 2), 16) / 255;
  const b = parseInt(hex.substr(5, 2), 16) / 255;
  return vec4(r, g, b, 1.0);
}

// Add helper function to convert RGB to string
function rgbToString(color) {
  return `RGB(${Math.round(color[0] * 255)},${Math.round(
    color[1] * 255
  )},${Math.round(color[2] * 255)})`;
}

// Add helper function to update light products
function updateLightProducts() {
  // Scale light components by intensity
  const scaledAmbient = scale(lightIntensity, lightAmbient);
  const scaledDiffuse = scale(lightIntensity, lightDiffuse);
  const scaledSpecular = scale(lightIntensity, lightSpecular);

  // Calculate products for cylinder
  let cylinderAmbientProduct = mult(scaledAmbient, cylinderMaterial.ambient);
  let cylinderDiffuseProduct = mult(scaledDiffuse, cylinderMaterial.diffuse);
  let cylinderSpecularProduct = mult(scaledSpecular, cylinderMaterial.specular);

  // Calculate products for cube
  let cubeAmbientProduct = mult(scaledAmbient, cubeMaterial.ambient);
  let cubeDiffuseProduct = mult(scaledDiffuse, cubeMaterial.diffuse);
  let cubeSpecularProduct = mult(scaledSpecular, cubeMaterial.specular);

  // Calculate products for sphere
  let sphereAmbientProduct = mult(scaledAmbient, sphereMaterial.ambient);
  let sphereDiffuseProduct = mult(scaledDiffuse, sphereMaterial.diffuse);
  let sphereSpecularProduct = mult(scaledSpecular, sphereMaterial.specular);

  // Send to shader
  gl.uniform4fv(
    gl.getUniformLocation(program, "cylinderAmbientProduct"),
    flatten(cylinderAmbientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "cylinderDiffuseProduct"),
    flatten(cylinderDiffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "cylinderSpecularProduct"),
    flatten(cylinderSpecularProduct)
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "cylinderShininess"),
    cylinderMaterial.shininess
  );

  gl.uniform4fv(
    gl.getUniformLocation(program, "cubeAmbientProduct"),
    flatten(cubeAmbientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "cubeDiffuseProduct"),
    flatten(cubeDiffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "cubeSpecularProduct"),
    flatten(cubeSpecularProduct)
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "cubeShininess"),
    cubeMaterial.shininess
  );

  gl.uniform4fv(
    gl.getUniformLocation(program, "sphereAmbientProduct"),
    flatten(sphereAmbientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "sphereDiffuseProduct"),
    flatten(sphereDiffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "sphereSpecularProduct"),
    flatten(sphereSpecularProduct)
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "sphereShininess"),
    sphereMaterial.shininess
  );
}

// Add function to create light source geometries
function createLightSourceGeometries() {
  // Create sphere for point light
  const radius = 0.1;
  const latitudeBands = 10;
  const longitudeBands = 10;

  for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
    const theta = (latNumber * Math.PI) / latitudeBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
      const phi = (longNumber * 2 * Math.PI) / longitudeBands;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      lightSourcePoints.push(vec4(x * radius, y * radius, z * radius, 1.0));
      lightSourceNormals.push(vec3(x, y, z));
    }
  }

  // Create cone for spot light
  const height = 0.3;
  const baseRadius = 0.1;
  const segments = 16;

  // Cone base center
  const baseCenter = vec4(0.0, 0.0, 0.0, 1.0);
  // Cone tip
  const tip = vec4(0.0, height, 0.0, 1.0);

  for (let i = 0; i < segments; i++) {
    const angle1 = (i / segments) * 2 * Math.PI;
    const angle2 = ((i + 1) / segments) * 2 * Math.PI;

    const p1 = vec4(
      baseRadius * Math.cos(angle1),
      0.0,
      baseRadius * Math.sin(angle1),
      1.0
    );
    const p2 = vec4(
      baseRadius * Math.cos(angle2),
      0.0,
      baseRadius * Math.sin(angle2),
      1.0
    );

    // Calculate normals
    const v1 = subtract(p1, tip);
    const v2 = subtract(p2, tip);
    const normal = normalize(cross(v1, v2));

    // Add triangles for cone surface
    spotLightConePoints.push(tip);
    spotLightConePoints.push(p1);
    spotLightConePoints.push(p2);

    spotLightConeNormals.push(normal);
    spotLightConeNormals.push(normal);
    spotLightConeNormals.push(normal);

    // Add triangles for base
    spotLightConePoints.push(baseCenter);
    spotLightConePoints.push(p1);
    spotLightConePoints.push(p2);

    spotLightConeNormals.push(vec3(0.0, -1.0, 0.0));
    spotLightConeNormals.push(vec3(0.0, -1.0, 0.0));
    spotLightConeNormals.push(vec3(0.0, -1.0, 0.0));
  }
}

// Update drawLightSource function
function drawLightSource(position, isSpotLight, viewMatrix) {
  if (!isLightSourceVisible) return;

  let modelMatrix = mat4();
  modelMatrix = mult(
    modelMatrix,
    translate(position[0], position[1], position[2])
  );
  modelMatrix = mult(modelMatrix, scale(0.1, 0.1, 0.1));

  modelViewMatrix = mult(viewMatrix, modelMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  nMatrix = normalMatrix(modelViewMatrix);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  // Use emissive material for light source
  const lightMaterial = {
    ambient: vec4(1.0, 1.0, 1.0, 1.0),
    diffuse: vec4(1.0, 1.0, 1.0, 1.0),
    specular: vec4(1.0, 1.0, 1.0, 1.0),
    shininess: 100.0,
  };

  const ambientProduct = mult(lightAmbient, lightMaterial.ambient);
  const diffuseProduct = mult(lightDiffuse, lightMaterial.diffuse);
  const specularProduct = mult(lightSpecular, lightMaterial.specular);

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
  gl.uniform1f(
    gl.getUniformLocation(program, "shininess"),
    lightMaterial.shininess
  );

  // Draw appropriate geometry
  if (isSpotLight) {
    gl.drawArrays(gl.TRIANGLES, 0, spotLightConePoints.length);
  } else {
    gl.drawArrays(gl.TRIANGLES, 0, lightSourcePoints.length);
  }
}

// Add this function to update light position
function updateLightPosition() {
  gl.uniform4fv(
    gl.getUniformLocation(program, "lightPosition"),
    flatten(lightPos)
  );
}

/*-----------------------------------------------------------------------------------*/
