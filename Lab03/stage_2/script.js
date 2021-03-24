var gl;
var shaderProgram;
var uPMatrix;
var vertexPositionBuffer;
var vertexColorBuffer;
function startGL()
{
  alert("StartGL");
  let canvas = document.getElementById("canvas3D"); //wyszukanie obiektu
  gl = canvas.getContext("experimental-webgl"); //pobranie kontekstu OpenGL z obiektu
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

//Tworzenie shaderów
  const vertexShaderSource = `
    precision highp float;
    attribute vec3 aVertexPosition; //przechowuje info o pozycji wierzcholka
    attribute vec3 aVertexColor; //przechowuje info o kolorze wierzcholka
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    varying vec3 vColor;
    void main(void)
    {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); //transformacja położenia punktów z przestrzeni 3D do przestrzeni 2D
      vColor = aVertexColor;
    }
  `;

  const fragmentShaderSource = `
    precision highp float; //wysoka precyzja liczb zmiennoprzecinkowych
    varying vec3 vColor;
    void main(void)
    {
      gl_FragColor = vec4(vColor, 1.0); //ustalenie stałego koloru wszystkich punktów sceny
    }
  `;
                
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); //Stworzenie obiektu shadera
  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource); //podpięcie źródła kodu shadera
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(fragmentShader); //kompilacja shaderów
  gl.compileShader(vertexShader);

  if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) //sprawdzenie błędów kompilacji
  {
    alert(gl.getShaderInfoLog(fragmentShader));
    return null;
  }
  if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
  {
    alert(gl.getShaderInfoLog(vertexShader));
    return null;
  }

  shaderProgram = gl.createProgram(); //stworzenie obiektu programu
  gl.attachShader(shaderProgram, vertexShader); //podpięcie shaderów do programu wykonywanego na GPU
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) alert("Could not initialize shaders"); //sprawdzenie błędów kompilacji

  //Położenie wierzchołków
  let vertexPosition = [
  //Top
    -1.0, +1.0, -1.0,  -1.0, +1.0, +1.0,  +1.0, +1.0, +1.0, //3 punkty po 3 składowe - X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 - 1 trójkąt
    -1.0, +1.0, -1.0,  +1.0, +1.0, +1.0,  +1.0, +1.0, -1.0,
  //Left
    -1.0, -1.0, +1.0,  -1.0, +1.0, +1.0,  -1.0, -1.0, -1.0,
    -1.0, -1.0, -1.0,  -1.0, +1.0, +1.0,  -1.0, +1.0, -1.0,
  //Right
    +1.0, +1.0, +1.0,  +1.0, -1.0, +1.0,  +1.0, -1.0, -1.0,
    +1.0, +1.0, +1.0,  +1.0, -1.0, -1.0,  +1.0, +1.0, -1.0,
  //Front
    +1.0, -1.0, +1.0,  +1.0, +1.0, +1.0,  -1.0, -1.0, +1.0,
    -1.0, +1.0, +1.0,  -1.0, -1.0, +1.0,  +1.0, +1.0, +1.0,
  //Back
    +1.0, +1.0, -1.0,  +1.0, -1.0, -1.0,  -1.0, -1.0, -1.0,
    +1.0, +1.0, -1.0,  -1.0, -1.0, -1.0,  -1.0, +1.0, -1.0,
  //Bottom
    -1.0, -1.0, +1.0,  -1.0, -1.0, -1.0,  +1.0, -1.0, +1.0,
    +1.0, -1.0, +1.0,  -1.0, -1.0, -1.0,  +1.0, -1.0, -1.0
  ]

  //Wgranie danych do GPU
  vertexPositionBuffer = gl.createBuffer(); //stworzenie bufora tablicy w pamięci GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW); //do bufora tablicy wrzucamy tablicę wierzchołków, która służć będzie do rysowania statycznego obiektu
  vertexPositionBuffer.itemSize = 3; //zdefiniowanie liczby współrzędnych na wierzchołek, 3D więc 3
  vertexPositionBuffer.numItems = 12; //zdefiniowanie liczby punktów w buforze

  //Opis sceny 3D, kolor każdego z wierzchołków
  let vertexColor = [
  //Top
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, //3 punkty po 3 składowe - R1,G1,B1, R2,G2,B2, R3,G3,B3 - 1 trójkąt
    1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,
  //Left
    0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 0.0,
    0.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0,
  //Right
    1.0, 1.0, 1.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0,
    0.0, 0.0, 1.0,  1.0, 0.0, 1.0,  0.0, 1.0, 1.0,
  //Front
    1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0,
    1.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 1.0,
  //Back
    0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 1.0, 1.0,
    1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  0.0, 0.0, 1.0,
  //Bottom
    0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,
    0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,
  ]

  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 3;
  vertexColorBuffer.numItems = 12;
           
  //Kamera
  let aspect = gl.viewportWidth/gl.viewportHeight;
  let fov = 45.0 * Math.PI / 180; //określenie pola widzenia
  let zFar = 100.0; //określenie zakresów renderowania sceny 3D
  let zNear = 0.1;

  uPMatrix = [
    1.0/(aspect*Math.tan(fov/2)),   0,                      0,  0,
    0,                              1.0/(Math.tan(fov/2)),  0,                              0, 
    0,                              0,                      -(zFar+zNear)/(zFar-zNear),     -1,
    0,                              0,                      -(2*zFar*zNear)/(zFar-zNear),   0
  ]; //macierz projekcji
  Tick();
}

//macierz transformacji świata - położenie kamery
let angleX = 0.0;
let maxAngleX = 35.0;
let angleY = 10.0;
let angleZ = 10.0;
let farZ = -5;

function Tick()
{
  if(angleX < maxAngleX)
  {
    angleX = angleX+1;
  }
  
  angleY = angleY+2;
  angleZ = angleZ+3;

  let uMVMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]

  let rotateX = [
    1, 0, 0, 0, //macierz rotacji
    0, Math.cos(angleX*Math.PI/180.0), -Math.sin(angleX*Math.PI/180.0), 0,
    0, Math.sin(angleX*Math.PI/180.0), Math.cos(angleX*Math.PI/180.0), 0,
    0, 0, 0, 1 //położenie kamery
  ];

  let rotateY = [
    Math.cos(angleX*Math.PI/180.0), 0, Math.sin(angleX*Math.PI/180.0), 0, //macierz rotacji
    0, 1, 0, 0,
    -Math.sin(angleX*Math.PI/180.0), 0, Math.cos(angleX*Math.PI/180.0), 0,
    0, 0, 0, 1 //położenie kamery
  ];

  let rotateZ = [
    Math.cos(angleZ*Math.PI/180.0),  -Math.sin(angleZ*Math.PI/180.0), 0,  0, //macierz rotacji
    Math.sin(angleZ*Math.PI/180.0),  Math.cos(angleZ*Math.PI/180.0),  0,  0,
    0,0,1,0,
    0,0,0,1 //położenie kamery
  ];

  let translateZ = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, farZ, 1
  ]

  uMVMatrix = matrixMul(uMVMatrix, rotateY);
  uMVMatrix = matrixMul(uMVMatrix, rotateZ);
  uMVMatrix = matrixMul(uMVMatrix, translateZ);

  //Render sceny
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clearColor(1.0, 0.0, 0.0, 1.0); //wyczyszczenie obrazu kolorem czerwonym
  gl.clearDepth(1.0); //wyczyszczenie bufora głębi najdalszym planem
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(shaderProgram); //użycie przygotowanego programu shaderów

  gl.enable(gl.DEPTH_TEST); //włączenie testu głębi - obiekty bliżej przykrywają obiekty dalej
  gl.depthFunc(gl.LEQUAL);

  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uPMatrix"), false, new Float32Array(uPMatrix)); //Wgranie macierzy kamery do pamięci karty graficznej
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMVMatrix"), false, new Float32Array(uMVMatrix));

  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexPosition"));  //
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexPosition"), vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexColor"));  //Przekazanie kolorów
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexColor"), vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania
  setTimeout(Tick, 10);
}

function matrixMul(mat1, mat2)
{
  finalMatrix = [
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0
  ]

  for(let i = 0; i < 4; i ++)
  {
    for(let j = 0; j < 4; j++)
    {
      finalMatrix[i*4+j] = 0.0;
      for(let k = 0; k < 4; k++)
      {
        finalMatrix[i*4+j] += mat1[i*4+k] * mat2[k*4+j];
      }
    }
  }
  return finalMatrix;
}

