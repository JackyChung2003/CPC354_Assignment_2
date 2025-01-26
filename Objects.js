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
var texCoordsArray = [];

// Variables for lighting control
var ambientProduct, diffuseProduct, specularProduct;
var ambient = 0.5,
  diffuse = 0.5,
  specular = 0.5;
var lightPos = vec4(0.0, 2.0, 0.0, 0.0);
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

// Modify these camera parameters
var near = 0.1;
var far = 100.0;
var fovy = 40.0; // Decreased field of view for slight zoom effect
var aspect = 800 / 600;

// Move camera closer but still maintain good view of all objects
var eye = vec3(0.0, 0.0, 8.0); // Changed from 10.0 to 8.0 to zoom in
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

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
var lightSourceObj;
var lightSourcePoints = [];
var lightSourceNormals = [];
var lightSourceV;

// Add these variables at the top with other declarations
var compassCanvas;
var compassCtx;

// Add at the top with other variable declarations
var smoothShading = true;

// Add to variable declarations
var texCoordBuffer;
var vTexCoord;
var texture;
var useTexture = false;
var textures = {
  cylinder: null,
  cube: null,
  sphere: null,
  wall: null,
};

var useTextures = {
  cylinder: false,
  cube: false,
  sphere: false,
  wall: false,
};

var textureToggle;
var textureUpload;

// Add at the top with other variable declarations
var ambientProductLoc,
  diffuseProductLoc,
  specularProductLoc,
  shininessLoc,
  materialAmbientLoc;

// Add to variable declarations
var toonShading = false;
var toonLevels = 4; // Initial value matching the HTML slider
var toonShadingLoc, toonLevelsLoc; // Add uniform locations

// Add to variable declarations at the top
var globalAmbientLoc;
var globalAmbient = vec4(0.2, 0.2, 0.2, 1.0); // Initial ambient color
var lightPosLoc; // Add this variable declaration

// Add to variable declarations
var lightType = "directional"; // Initialize as directional to match default UI

// Add to variable declarations at the top
var pointLightIntensity = 1.0;
var spotLightIntensity = 1.0;
var pointLightIntensityLoc;
var spotLightIntensityLoc;

/*-----------------------------------------------------------------------------------*/
// WebGL Utilities
/*-----------------------------------------------------------------------------------*/

window.onload = function init() {
  // Initialize objects with corrected scaling
  cylinderObj = cylinder(72, 3, true);
  cylinderObj.Rotate(45, [1, 1, 0]);
  cylinderObj.Scale(1.2, 1.2, 1.2);
  concatData(cylinderObj);

  cubeObj = cube();
  cubeObj.Rotate(45, [1, 1, 0]);
  cubeObj.Scale(1, 1, 1); // Cube remains 1x1x1
  concatData(cubeObj);

  sphereObj = sphere(4); // Increased subdivision for smoother sphere
  sphereObj.Rotate(45, [0, 1, 0]);
  sphereObj.Scale(0.8, 0.8, 0.8); // Proper scaling for a smaller sphere
  concatData(sphereObj);

  wallObj = wall();
  concatData(wallObj);

  cylinderV = cylinderObj.Point.length;
  cubeV = cubeObj.Point.length;
  sphereV = sphereObj.Point.length;
  wallV = wallObj.Point.length;
  totalV = pointsArray.length;

  // Initialize light source sphere
  lightSourceObj = lightSphere(0.1); // Small glowing sphere
  lightSourcePoints = lightSourceObj.Point;
  lightSourceNormals = lightSourceObj.Normal;
  lightSourceV = lightSourcePoints.length;

  // Add light source points and normals to the buffers
  pointsArray = pointsArray.concat(lightSourcePoints);
  normalsArray = normalsArray.concat(lightSourceNormals);

  // Initialize compass
  setupCompass();

  // WebGL setup
  getUIElement();
  configWebGL();
  setupShaderLocations();

  // Initialize material controls for each object
  initializeMaterialControls();
  initializeTextureControls();

  // Initialize light type to match the default dropdown selection
  const lightTypeSelect = document.getElementById("light-type");
  lightType = lightTypeSelect.value; // Should be "directional" by default
  lightPos[3] = lightType === "directional" ? 0.0 : 1.0;
  gl.uniform4fv(lightPosLoc, flatten(lightPos));

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

  // Add shading toggle handler
  document.getElementById("shading-toggle").onchange = function () {
    smoothShading = this.checked;
    document.getElementById("shading-mode-text").innerHTML = smoothShading
      ? "Smooth"
      : "Flat";
    console.log("Shading mode changed to:", smoothShading ? "Smooth" : "Flat");
    render();
  };

  // Initialize texture controls for each object
  initializeTextureControls();

  // Set initial object and update UI
  currentObject = "cylinder";
  updateMaterialControls("cylinder", materials.cylinder);
  render();

  // Initialize toon shader controls
  document.getElementById("toon-levels").value = toonLevels;
  document.getElementById("text-toon-levels").innerHTML = toonLevels;
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
    lightType = this.value;
    lightPos[3] = lightType === "directional" ? 0.0 : 1.0;
    gl.uniform4fv(lightPosLoc, flatten(lightPos));
    render();
  };

  sliderLightX.oninput = function () {
    lightPos[0] = parseFloat(this.value);
    document.getElementById("text-light-x").innerHTML = this.value;
    updateCompass();
    render();
  };

  sliderLightY.oninput = function () {
    lightPos[1] = parseFloat(this.value);
    document.getElementById("text-light-y").innerHTML = this.value;
    updateCompass();
    render();
  };

  sliderLightZ.oninput = function () {
    lightPos[2] = parseFloat(this.value);
    document.getElementById("text-light-z").innerHTML = this.value;
    updateCompass();
    render();
  };

  // Update global ambient color handler
  ambientColorPicker.oninput = function () {
    const color = hexToRgb(this.value);
    globalAmbient = vec4(color.r, color.g, color.b, 1.0);
    gl.uniform4fv(globalAmbientLoc, flatten(globalAmbient));
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

  // Add toon shading controls
  document.getElementById("toon-toggle").onchange = function () {
    toonShading = this.checked;
    gl.uniform1i(toonShadingLoc, toonShading);
    render();
  };

  document.getElementById("toon-levels").oninput = function () {
    toonLevels = parseInt(this.value);
    document.getElementById("text-toon-levels").innerHTML = this.value;
    gl.useProgram(program);
    gl.uniform1i(toonLevelsLoc, toonLevels);
    render();
  };

  // Add point light intensity control
  document.getElementById("point-light-intensity").oninput = function () {
    pointLightIntensity = parseFloat(this.value);
    document.getElementById("text-point-light-intensity").innerHTML =
      this.value;
    gl.uniform1f(pointLightIntensityLoc, pointLightIntensity);
    render();
  };

  // Add spot light intensity control
  document.getElementById("spot-light-intensity").oninput = function () {
    spotLightIntensity = parseFloat(this.value);
    document.getElementById("text-spot-light-intensity").innerHTML = this.value;
    gl.uniform1f(spotLightIntensityLoc, spotLightIntensity);
    render();
  };
}

// Configure WebGL Settings
function configWebGL() {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
    return;
  }

  // Enable derivatives extension
  gl.getExtension("OES_standard_derivatives");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  try {
    // Initialize only the phong shader program
    program = initShaders(gl, "phong-vertex-shader", "phong-fragment-shader");

    if (!program) {
      throw new Error("Failed to initialize shaders");
    }

    // Use the program immediately after creation
    gl.useProgram(program);

    // Create vertex buffer
    pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    // Create normal buffer
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    // Setup shader locations
    setupShaderLocations();

    // Create and setup texture coordinate buffer
    texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    // Get texture coordinate attribute location
    vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    if (vTexCoord !== -1) {
      // Only setup if attribute exists
      gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vTexCoord);
    }

    // Setup texture unit
    gl.activeTexture(gl.TEXTURE0);

    // Get uniform locations
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
    toonShadingLoc = gl.getUniformLocation(program, "toonShading");
    toonLevelsLoc = gl.getUniformLocation(program, "toonLevels");

    // Get light intensity uniform locations
    pointLightIntensityLoc = gl.getUniformLocation(
      program,
      "pointLightIntensity"
    );
    spotLightIntensityLoc = gl.getUniformLocation(
      program,
      "spotLightIntensity"
    );
  } catch (error) {
    console.error("WebGL initialization error:", error);
    alert("Failed to initialize WebGL: " + error.message);
  }
}

// Render the graphics for viewing
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Update view and projection matrices
  modelViewMatrix = lookAt(eye, at, up);
  projectionMatrix = perspective(fovy, aspect, near, far);

  // Send matrices to shaders
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  // Set shading mode
  gl.uniform1i(gl.getUniformLocation(program, "flatShading"), !smoothShading);

  // Update material uniforms for current object
  if (materials[currentObject]) {
    updateMaterialUniforms(materials[currentObject]);
  }

  // Update light uniforms
  gl.uniform4fv(
    gl.getUniformLocation(program, "pointLightPos"),
    flatten(lightPos)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "spotLightPos"),
    flatten(lightPos)
  );
  gl.uniform3fv(
    gl.getUniformLocation(program, "spotDirection"),
    flatten(spotDirection)
  );
  gl.uniform1f(gl.getUniformLocation(program, "spotCutoff"), spotCutoff);

  gl.uniform1i(
    gl.getUniformLocation(program, "pointLightEnabled"),
    pointLightEnabled ? 1 : 0
  );
  gl.uniform1i(
    gl.getUniformLocation(program, "spotLightEnabled"),
    spotLightEnabled ? 1 : 0
  );

  // Update toon shading uniforms
  gl.uniform1i(toonShadingLoc, toonShading);
  gl.uniform1i(toonLevelsLoc, toonLevels);

  // Update global ambient uniform
  gl.uniform4fv(globalAmbientLoc, flatten(globalAmbient));

  // Update light position with correct w component
  gl.uniform4fv(lightPosLoc, flatten(lightPos));

  // Update light intensity uniforms
  gl.uniform1f(pointLightIntensityLoc, pointLightIntensity);
  gl.uniform1f(spotLightIntensityLoc, spotLightIntensity);

  drawCylinder();
  drawCube();
  drawSphere();
  drawWall();

  // Add light source rendering
  renderLightSource();

  requestAnimationFrame(render);
}

// Draw functions for Cylinder, Cube, and Sphere
function drawCylinder() {
  updateMaterialUniforms(materials.cylinder);

  // Set texture state for cylinder
  gl.activeTexture(gl.TEXTURE0);
  if (useTextures.cylinder && textures.cylinder) {
    gl.bindTexture(gl.TEXTURE_2D, textures.cylinder);
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), true);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
    gl.uniform2fv(
      gl.getUniformLocation(program, "vTexCoord"),
      flatten(texCoordsArray)
    );
  } else {
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), false);
  }

  var mvMatrix = mult(modelViewMatrix, translate(-2, 0, 0));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvMatrix));

  gl.drawArrays(gl.TRIANGLES, 0, cylinderV);
}

function drawCube() {
  updateMaterialUniforms(materials.cube);

  // Set texture state for cube
  gl.activeTexture(gl.TEXTURE0);
  if (useTextures.cube && textures.cube) {
    gl.bindTexture(gl.TEXTURE_2D, textures.cube);
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), true);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
  } else {
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), false);
  }

  var mvMatrix = mult(modelViewMatrix, translate(0, 0, 0));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvMatrix));

  gl.drawArrays(gl.TRIANGLES, cylinderV, cubeV);
}

function drawSphere() {
  updateMaterialUniforms(materials.sphere);

  // Set texture state for sphere
  gl.activeTexture(gl.TEXTURE0);
  if (useTextures.sphere && textures.sphere) {
    gl.bindTexture(gl.TEXTURE_2D, textures.sphere);
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), true);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
  } else {
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), false);
  }

  var mvMatrix = mult(modelViewMatrix, translate(2, 0, 0));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvMatrix));

  gl.drawArrays(gl.TRIANGLES, cylinderV + cubeV, sphereV);
}

function drawWall() {
  updateMaterialUniforms(materials.wall);

  // Set texture state for wall
  gl.activeTexture(gl.TEXTURE0);
  if (useTextures.wall && textures.wall) {
    gl.bindTexture(gl.TEXTURE_2D, textures.wall);
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), true);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
  } else {
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), false);
  }

  // Force smooth shading for wall
  gl.uniform1i(gl.getUniformLocation(program, "flatShading"), false);

  var mvMatrix = mult(
    modelViewMatrix,
    mult(translate(0, 0, -2), scale(8, 4.5, 0.01))
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvMatrix));

  gl.drawArrays(gl.TRIANGLES, cylinderV + cubeV + sphereV, wallV);
}

// Concatenate the corresponding shape's values
function concatData(shape) {
  pointsArray = pointsArray.concat(shape.Point);
  normalsArray = normalsArray.concat(shape.Normal);
  texCoordsArray = texCoordsArray.concat(shape.TexCoord || []);
}

// Add utility function for converting hex colors to RGB
function hexToRgb(hex) {
  // Remove the # if present
  hex = hex.replace(/^#/, "");

  // Parse the hex values
  var r = parseInt(hex.substring(0, 2), 16) / 255;
  var g = parseInt(hex.substring(2, 4), 16) / 255;
  var b = parseInt(hex.substring(4, 6), 16) / 255;

  return { r: r, g: g, b: b };
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

function updateMaterialUniforms(mat) {
  if (!mat) return;

  // Calculate products with coefficients
  var ambientProduct = scale4(mat.ambientCoef, mat.ambient);
  var diffuseProduct = mult(lightDiffuse, scale4(mat.diffuseCoef, mat.diffuse));
  var specularProduct = mult(
    lightSpecular,
    scale4(mat.specularCoef, mat.specular)
  );

  gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
  gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
  gl.uniform4fv(specularProductLoc, flatten(specularProduct));
  gl.uniform1f(shininessLoc, mat.shininess);
  gl.uniform4fv(materialAmbientLoc, flatten(mat.ambient));

  // Update normal matrix
  nMatrix = normalMatrix(modelViewMatrix, true);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));
}

// Helper function to scale vec4
function scale4(s, v) {
  return vec4(s * v[0], s * v[1], s * v[2], v[3]);
}

function updateMaterialControls(objName, mat) {
  if (!mat || !objName) return;

  // Update color inputs
  document.getElementById(`${objName}-ambient-color`).value = rgbToHex(
    mat.ambient
  );
  document.getElementById(`${objName}-diffuse-color`).value = rgbToHex(
    mat.diffuse
  );
  document.getElementById(`${objName}-specular-color`).value = rgbToHex(
    mat.specular
  );

  // Update coefficient sliders
  document.getElementById(`${objName}-ambient-coef`).value = mat.ambientCoef;
  document.getElementById(`${objName}-diffuse-coef`).value = mat.diffuseCoef;
  document.getElementById(`${objName}-specular-coef`).value = mat.specularCoef;
  document.getElementById(`${objName}-shininess`).value = mat.shininess;

  // Update coefficient text displays
  document.getElementById(`${objName}-text-ambient-coef`).innerHTML =
    mat.ambientCoef;
  document.getElementById(`${objName}-text-diffuse-coef`).innerHTML =
    mat.diffuseCoef;
  document.getElementById(`${objName}-text-specular-coef`).innerHTML =
    mat.specularCoef;
  document.getElementById(`${objName}-text-shininess`).innerHTML =
    mat.shininess;
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
  toonShadingLoc = gl.getUniformLocation(program, "toonShading");
  toonLevelsLoc = gl.getUniformLocation(program, "toonLevels");

  // Get material uniform locations
  ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
  diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
  specularProductLoc = gl.getUniformLocation(program, "specularProduct");
  shininessLoc = gl.getUniformLocation(program, "shininess");
  materialAmbientLoc = gl.getUniformLocation(program, "materialAmbient");
  globalAmbientLoc = gl.getUniformLocation(program, "globalAmbient");
  lightPosLoc = gl.getUniformLocation(program, "lightPos");

  // Get light intensity uniform locations
  pointLightIntensityLoc = gl.getUniformLocation(
    program,
    "pointLightIntensity"
  );
  spotLightIntensityLoc = gl.getUniformLocation(program, "spotLightIntensity");

  // Re-bind buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  // Setup texture coordinates
  vTexCoord = gl.getAttribLocation(program, "vTexCoord");
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vTexCoord);

  // Set initial values
  gl.uniform1i(toonShadingLoc, toonShading);
  gl.uniform1i(toonLevelsLoc, toonLevels);
}

// Add this function to render the light source
function renderLightSource() {
  if (!pointLightEnabled) return;

  // Save current material
  var currentMat = materials[currentObject];

  // Create an emissive material for the light source
  var lightMaterial = {
    ambient: vec4(1.0, 1.0, 1.0, 1.0),
    diffuse: vec4(1.0, 1.0, 1.0, 1.0),
    specular: vec4(1.0, 1.0, 1.0, 1.0),
    shininess: 100.0,
    ambientCoef: 1.0,
    diffuseCoef: 1.0,
    specularCoef: 1.0,
  };

  // Update uniforms with light material
  updateMaterialUniforms(lightMaterial);

  // Create model view matrix for light source
  var lightModelView = mult(
    modelViewMatrix,
    translate(lightPos[0], lightPos[1], lightPos[2])
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(lightModelView));

  // Update normal matrix
  var nMatrix = normalMatrix(lightModelView, true);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));

  // Draw light source
  gl.drawArrays(gl.TRIANGLES, totalV, lightSourceV);

  // Restore original material
  updateMaterialUniforms(currentMat);
}

function initShaders(gl, vertexShaderId, fragmentShaderId) {
  try {
    const vertShdr = compileShader(gl, vertexShaderId, gl.VERTEX_SHADER);
    const fragShdr = compileShader(gl, fragmentShaderId, gl.FRAGMENT_SHADER);

    if (!vertShdr || !fragShdr) {
      throw new Error("Shader compilation failed");
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertShdr);
    gl.attachShader(program, fragShdr);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(
        "Shader program failed to link: " + gl.getProgramInfoLog(program)
      );
    }

    return program;
  } catch (error) {
    console.error("Shader initialization error:", error);
    return null;
  }
}

function compileShader(gl, shaderId, shaderType) {
  const shaderScript = document.getElementById(shaderId);
  if (!shaderScript) {
    throw new Error(`Shader script not found: ${shaderId}`);
  }

  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderScript.text);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation error: ${error}`);
  }

  return shader;
}

// Add these new functions for compass handling
function setupCompass() {
  compassCanvas = document.getElementById("direction-compass");
  compassCtx = compassCanvas.getContext("2d");
  updateCompass();
}

function updateCompass() {
  const centerX = compassCanvas.width / 2;
  const centerY = compassCanvas.height / 2;
  const radius = compassCanvas.width / 2 - 20; // Leave some padding

  // Clear the canvas
  compassCtx.clearRect(0, 0, compassCanvas.width, compassCanvas.height);

  // Draw the compass circle
  compassCtx.beginPath();
  compassCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  compassCtx.strokeStyle = "#4a4e69";
  compassCtx.lineWidth = 2;
  compassCtx.stroke();

  // Draw cardinal directions
  compassCtx.font = "14px Arial";
  compassCtx.fillStyle = "#4a4e69";
  compassCtx.textAlign = "center";
  compassCtx.textBaseline = "middle";

  compassCtx.fillText("Front", centerX, centerY + radius + 15);
  compassCtx.fillText("Back", centerX, centerY - radius - 15);
  compassCtx.fillText("Right", centerX + radius + 15, centerY);
  compassCtx.fillText("Left", centerX - radius - 15, centerY);

  // Draw the direction arrow
  const arrowLength = radius - 10;

  // For directional light, we want to show where the light is coming FROM
  // So we'll invert the direction to show where it's coming from
  let lightDir = normalize(vec3(-lightPos[0], -lightPos[1], -lightPos[2]));

  // Project the 3D direction onto the 2D compass
  // Using x and z coordinates for the compass plane
  let compassX = lightDir[0] * arrowLength; // Removed negative sign
  let compassY = lightDir[2] * arrowLength; // Removed negative sign

  // Draw the arrow
  compassCtx.beginPath();
  compassCtx.moveTo(centerX, centerY);
  compassCtx.lineTo(centerX + compassX, centerY + compassY);

  // Draw arrow head
  const headLength = 10;
  const angle = Math.atan2(compassY, compassX);
  compassCtx.lineTo(
    centerX + compassX - headLength * Math.cos(angle - Math.PI / 6),
    centerY + compassY - headLength * Math.sin(angle - Math.PI / 6)
  );
  compassCtx.moveTo(centerX + compassX, centerY + compassY);
  compassCtx.lineTo(
    centerX + compassX - headLength * Math.cos(angle + Math.PI / 6),
    centerY + compassY - headLength * Math.sin(angle + Math.PI / 6)
  );

  compassCtx.strokeStyle = "#00b4d8";
  compassCtx.lineWidth = 3;
  compassCtx.stroke();

  // Draw center dot
  compassCtx.beginPath();
  compassCtx.arc(centerX, centerY, 3, 0, Math.PI * 2);
  compassCtx.fillStyle = "#4a4e69";
  compassCtx.fill();

  // Add text to indicate this shows light direction
  compassCtx.font = "12px Arial";
  compassCtx.fillStyle = "#4a4e69";
  compassCtx.fillText("Light Direction", centerX, centerY - radius - 30);
}

// If you have camera controls, you might want to update their default values too:
function setupCameraControls() {
  document.getElementById("camera-distance").value = "8.0"; // Update default value
  document.getElementById("camera-distance").oninput = function () {
    let distance = parseFloat(this.value);
    eye = vec3(0.0, 0.0, distance);
    render();
  };

  document.getElementById("camera-fov").value = "40.0"; // Update default value
  document.getElementById("camera-fov").oninput = function () {
    fovy = parseFloat(this.value);
    render();
  };
}

// Add texture configuration function
function configureTexture(image, objectType) {
  // Create and bind new texture
  textures[objectType] = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[objectType]);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Generate mipmap if power of 2
  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // Enable texture for this object
  useTextures[objectType] = true;
  const toggle = document.getElementById(`${objectType}-texture-toggle`);
  if (toggle) {
    toggle.checked = true;
  }
}

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

// Update object selection to handle textures
function selectObject(objName) {
  currentObject = objName;

  // Hide all texture controls first
  Object.values(textureControls).forEach((controls) => {
    controls.container.classList.remove("active");
  });

  // Show texture controls for selected object
  textureControls[objName].container.classList.add("active");

  // Update material controls
  updateMaterialControls(objName, materials[objName]);

  render();
}

function openObjectTab(evt, objectId) {
  // Hide all object content
  var objectContent = document.getElementsByClassName("object-content");
  for (var i = 0; i < objectContent.length; i++) {
    objectContent[i].classList.remove("active");
  }

  // Remove active class from all tabs
  var objectTabs = document.getElementsByClassName("object-tab");
  for (var i = 0; i < objectTabs.length; i++) {
    objectTabs[i].classList.remove("active");
  }

  // Show the selected object content and mark tab as active
  document.getElementById(objectId).classList.add("active");
  evt.currentTarget.classList.add("active");

  // Update current object
  currentObject = objectId.split("-")[0];

  // Update UI with current object's values
  updateMaterialControls(currentObject, materials[currentObject]);

  render();
}

function initializeMaterialControls() {
  ["cylinder", "cube", "sphere", "wall"].forEach((obj) => {
    // Initialize ambient color control
    document.getElementById(`${obj}-ambient-color`).oninput = function () {
      const color = hexToRgb(this.value);
      materials[obj].ambient = vec4(color.r, color.g, color.b, 1.0);
      if (obj === currentObject) {
        updateMaterialUniforms(materials[obj]);
      }
      render();
    };

    // Initialize ambient coefficient control
    document.getElementById(`${obj}-ambient-coef`).oninput = function () {
      materials[obj].ambientCoef = parseFloat(this.value);
      document.getElementById(`${obj}-text-ambient-coef`).innerHTML =
        this.value;
      if (obj === currentObject) {
        updateMaterialUniforms(materials[obj]);
      }
      render();
    };

    // Initialize diffuse color control
    document.getElementById(`${obj}-diffuse-color`).oninput = function () {
      const color = hexToRgb(this.value);
      materials[obj].diffuse = vec4(color.r, color.g, color.b, 1.0);
      if (obj === currentObject) {
        updateMaterialUniforms(materials[obj]);
      }
      render();
    };

    // Initialize diffuse coefficient control
    document.getElementById(`${obj}-diffuse-coef`).oninput = function () {
      materials[obj].diffuseCoef = parseFloat(this.value);
      document.getElementById(`${obj}-text-diffuse-coef`).innerHTML =
        this.value;
      if (obj === currentObject) {
        updateMaterialUniforms(materials[obj]);
      }
      render();
    };

    // Initialize specular color control
    document.getElementById(`${obj}-specular-color`).oninput = function () {
      const color = hexToRgb(this.value);
      materials[obj].specular = vec4(color.r, color.g, color.b, 1.0);
      if (obj === currentObject) {
        updateMaterialUniforms(materials[obj]);
      }
      render();
    };

    // Initialize specular coefficient control
    document.getElementById(`${obj}-specular-coef`).oninput = function () {
      materials[obj].specularCoef = parseFloat(this.value);
      document.getElementById(`${obj}-text-specular-coef`).innerHTML =
        this.value;
      if (obj === currentObject) {
        updateMaterialUniforms(materials[obj]);
      }
      render();
    };

    // Initialize shininess control
    document.getElementById(`${obj}-shininess`).oninput = function () {
      materials[obj].shininess = parseFloat(this.value);
      document.getElementById(`${obj}-text-shininess`).innerHTML = this.value;
      if (obj === currentObject) {
        updateMaterialUniforms(materials[obj]);
      }
      render();
    };
  });
}

function initializeTextureControls() {
  ["cylinder", "cube", "sphere", "wall"].forEach((obj) => {
    const textureToggle = document.getElementById(`${obj}-texture-toggle`);
    const textureUpload = document.getElementById(`${obj}-texture-upload`);

    if (textureToggle && textureUpload) {
      textureToggle.onchange = function () {
        useTextures[obj] = this.checked;
        if (obj === currentObject) {
          if (this.checked && textures[obj]) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textures[obj]);
            gl.uniform1i(gl.getUniformLocation(program, "useTexture"), true);
            gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
          } else {
            gl.uniform1i(gl.getUniformLocation(program, "useTexture"), false);
          }
        }
        render();
      };

      textureUpload.onchange = function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
          const img = new Image();
          img.onload = function () {
            configureTexture(img, obj);
            if (obj === currentObject) {
              gl.activeTexture(gl.TEXTURE0);
              gl.bindTexture(gl.TEXTURE_2D, textures[obj]);
              gl.uniform1i(gl.getUniformLocation(program, "useTexture"), true);
              gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
            }
            render();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      };
    }
  });
}

function openLightTab(evt, lightId) {
  // Hide all light content
  var lightContent = document.getElementsByClassName("light-content");
  for (var i = 0; i < lightContent.length; i++) {
    lightContent[i].classList.remove("active");
  }

  // Remove active class from all light tabs
  var lightTabs =
    evt.currentTarget.parentElement.getElementsByClassName("light-tab");
  for (var i = 0; i < lightTabs.length; i++) {
    lightTabs[i].classList.remove("active");
  }

  // Show the selected light content and mark tab as active
  document.getElementById(lightId).classList.add("active");
  evt.currentTarget.classList.add("active");
}

/*-----------------------------------------------------------------------------------*/
