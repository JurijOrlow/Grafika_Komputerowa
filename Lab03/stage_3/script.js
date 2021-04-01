var gl;
var shaderProgram;
var uPMatrix;
var vertexPositionBuffer;
var vertexColorBuffer;
let uMVMatrix = null;
let angleX = 0.0;
let angleY = 0.0;
let angleZ = 0.0;

function startGL()
{
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
  //podloga
    +8, +0, +0,   +8, +0, -10,   -2, +0, +0,
    -2, +0, +0,   +8, +0, -10,   -2, +0, -10,
  //ściana 1
    -1, +0, +0,   -1, +3, +0,   -1, +0, -6,
    -1, +3, +0,   -1, +0, -6,   -1, +3, -6,
  //ściana 2
    +1, +0, -4,   +1, +0, +0,   +1, +3, +0,
    +1, +0, -4,   +1, +3, +0,   +1, +3, -4,
  //ściana 3
    +1, +0, -4,   +8, +0, -4,   +8, +3, -4,
    +1, +0, -4,   +8, +3, -4,   +1, +3, -4,
  //ściana 4
    -1, +0, -6,   +6, +0, -6,   +6, +3, -6,
    -1, +0, -6,   +6, +3, -6,   -1, +3, -6,
  //ściana 5
    +6, +0, -6,   +6, +0, -10,   +6, +3, -10,
    +6, +0, -6,   +6, +3, -10,   +6, +3, -6,
  //ściana 6
    +8, +0, -4,   +8, +0, -10,   +8, +3, -10,
    +8, +0, -4,   +8, +3, -10,   +8, +3, -4,
  //sufit
    +8, +3, +0,   +8, +3, -10,   -2, +3, +0,
    -2, +3, +0,   +8, +3, -10,   -2, +3, -10,
  ]

  //Wgranie danych do GPU
  vertexPositionBuffer = gl.createBuffer(); //stworzenie bufora tablicy w pamięci GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW); //do bufora tablicy wrzucamy tablicę wierzchołków, która służć będzie do rysowania statycznego obiektu
  vertexPositionBuffer.itemSize = 3; //zdefiniowanie liczby współrzędnych na wierzchołek, 3D więc 3
  vertexPositionBuffer.numItems = 100; //zdefiniowanie liczby punktów w buforze

  //Opis sceny 3D, kolor każdego z wierzchołków
  let vertexColor = [
  //podloga
    0.5700, 0.5700, 0.5700,   0.5700, 0.5700, 0.5700,   0.5700, 0.5700, 0.5700,
    0.5700, 0.5700, 0.5700,   0.5700, 0.5700, 0.5700,   0.5700, 0.5700, 0.5700,
  //sciany
    0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,
    0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,
    0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,
    0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,
    0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,
    0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,
    0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,
    0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,
    0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,
    0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,
    0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,
    0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,   0.5851, 0.6100, 0.3111,
  //sufit
  ]

  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 3;
  vertexColorBuffer.numItems = 12;
           
  //Kamera
  let aspect = gl.viewportWidth/gl.viewportHeight;
  let fov = 45.0 * Math.PI / 180; //określenie pola widzenia
  let zFar = 400.0; //określenie zakresów renderowania sceny 3D
  let zNear = 0.1;

  uPMatrix = [
    1.0/(aspect*Math.tan(fov/2)),   0,                      0,  0,
    0,                              1.0/(Math.tan(fov/2)),  0,                              0, 
    0,                              0,                      -(zFar+zNear)/(zFar-zNear),     -1,
    0,                              0,                      -(2*zFar*zNear)/(zFar-zNear),   0
  ]; //macierz projekcji

  uMVMatrix = [
    1,0,0,0, //Macierz jednostkowa
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
  ];
    
  let uMVRotZ = [
    +Math.cos(angleZ*Math.PI/180.0),+Math.sin(angleZ*Math.PI/180.0),0,0,
    -Math.sin(angleZ*Math.PI/180.0),+Math.cos(angleZ*Math.PI/180.0),0,0,
    0,0,1,0,
    0,0,0,1
  ];
    
  let uMVRotY = [
    +Math.cos(angleY*Math.PI/180.0),0,-Math.sin(angleY*Math.PI/180.0),0,
    0,1,0,0,
    +Math.sin(angleY*Math.PI/180.0),0,+Math.cos(angleY*Math.PI/180.0),0,
    0,0,0,1
  ];
    
  let uMVRotX = [
    1,0,0,0,
    0,+Math.cos(angleX*Math.PI/180.0),+Math.sin(angleX*Math.PI/180.0),0,
    0,-Math.sin(angleX*Math.PI/180.0),+Math.cos(angleX*Math.PI/180.0),0,
    0,0,0,1
  ];
    
  let uMVTranslateZ = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,tz,1
  ];
  
  uMVMatrix = matrixMul(uMVMatrix,uMVRotX);
  uMVMatrix = matrixMul(uMVMatrix,uMVRotY);
  uMVMatrix = matrixMul(uMVMatrix,uMVRotZ);
  uMVMatrix = matrixMul(uMVMatrix,uMVTranslateZ);

  Tick();
}

function Tick()
{
  //Render sceny
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clearColor(0.1725, 0.1725, 0.1725, 1.0); //wyczyszczenie obrazu kolorem czerwonym
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

function pressedKey(e)
{
  //alert(e.keyCode);
  if(e.keyCode==68) {
    angleY=angleY+1.0;
    const stepAngle = 1;
    let rotationYAxis = [
    +Math.cos(stepAngle*Math.PI/180.0),0,-Math.sin(stepAngle*Math.PI/180.0),0,
    0,1,0,0,
    +Math.sin(stepAngle*Math.PI/180.0),0,+Math.cos(stepAngle*Math.PI/180.0),0,
    0,0,0,1
    ];
    uMVMatrix = MatrixMul(uMVMatrix,rotationYAxis);
  } //D
  
  if(e.keyCode==65) {
    angleY=angleY-1.0;
    const stepAngle = -1;
    let rotationYAxis = [
    +Math.cos(stepAngle*Math.PI/180.0),0,-Math.sin(stepAngle*Math.PI/180.0),0,
    0,1,0,0,
    +Math.sin(stepAngle*Math.PI/180.0),0,+Math.cos(stepAngle*Math.PI/180.0),0,
    0,0,0,1
    ];
    uMVMatrix = MatrixMul(uMVMatrix,rotationYAxis);
  } //A

  if(e.keyCode==87)
 {
    angleX=angleX+1.0;
    //Ekstrakcja głownych kierunków zgodnie z bierzącą macierzą rotacji 
    let xAxis = [uMVMatrix[0],uMVMatrix[4],uMVMatrix[ 8]];
    let yAxis = [uMVMatrix[1],uMVMatrix[5],uMVMatrix[ 9]];
    let zAxis = [uMVMatrix[2],uMVMatrix[6],uMVMatrix[10]];
    //Dopasowanie rozmiaru kroku
    let stepSize = 0.01;
    zAxis = [stepSize*zAxis[0],stepSize*zAxis[1],stepSize*zAxis[2]];
    //Macierz 
    const translationZAxis = [
    1.0,0.0,0.0,0.0,
    0.0,1.0,0.0,0.0,
    0.0,0.0,1.0,0.0,
    zAxis[0],zAxis[1],zAxis[2],1.0
    ];

    uMVMatrix = MatrixMul(uMVMatrix,translationZAxis);
 } //W
}