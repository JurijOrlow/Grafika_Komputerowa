var gl;
var shaderProgram;
var uPMatrix;
var vertexPositionBuffer;
var vertexColorBuffer;
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
    attribute vec2 aVertexCoords;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    varying vec3 vColor;
    varying vec2 vTexUV;
    void main(void)
    {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); //transformacja położenia punktów z przestrzeni 3D do przestrzeni 2D
      vColor = aVertexColor;
      vTexUV = aVertexCoords;
    }
  `;

  const fragmentShaderSource = `
    precision highp float; //wysoka precyzja liczb zmiennoprzecinkowych
    varying vec3 vColor;
    varying vec2 vTexUV;
    uniform sampler2D uSampler;
    void main(void)
    {
      //gl_FragColor = vec4(vColor, 1.0); //ustalenie stałego koloru wszystkich punktów sceny
      gl_FragColor = texture2D(uSampler,vTexUV); //Odczytanie punktu tekstury i przypisanie go jako koloru danego punktu renderowaniej figury
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
    //slonce
      //dol
      1,2,0,   7,2,0,   7,8,0,
      1,2,0,   7,8,0,   1,8,0,
      //gora
      1,2,6,   7,2,6,   7,8,6,
      1,2,6,   7,8,6,   1,8,6,
      //0
      1,2,0,   7,2,0,   1,2,6,
      1,2,6,   7,2,6,   7,2,0,
      //1
      7,2,0,   7,8,0,   7,8,6,
      7,8,6,   7,2,6,   7,2,0,
      //2
      7,8,0,   1,8,0,   1,8,6,
      1,8,6,   7,8,6,   7,8,0,
      //3
      1,8,0,   1,2,0,   1,2,6,
      1,2,6,   1,8,6,   1,8,0,
    //merkury
      //dol
      8,4,0,   9,4,0,   9,5,0,
      8,4,0,   9,5,0,   8,5,0,
      //gora
      8,4,1,   9,4,1,   9,5,1,
      8,4,1,   9,5,1,   8,5,1,
      //0
      8,4,0,   9,4,0,   9,4,1,
      9,4,1,   8,4,1,   8,4,0,
      //1
      9,4,0,   9,5,0,   9,5,1,
      9,5,1,   9,4,1,   9,4,0,
      //2
      9,5,0,   8,5,0,   8,5,1,
      8,5,1,   9,5,1,   9,5,0,
      //3
      8,5,0,   8,4,0,   8,4,1,
      8,4,1,   8,5,1,   8,5,0,
    //wenus
      //dol
      10,5,0,   12,5,0,   12,7,0,
      10,5,0,   12,7,0,   10,7,0,
      //gora
      10,5,2,   12,5,2,   12,7,2,
      10,5,2,   12,7,2,   10,7,2,
      //0
      10,5,0,   12,5,0,   12,5,2,
      12,5,2,   10,5,2,   10,5,0,
      //1
      12,5,0,   12,7,0,   12,7,2,
      12,7,2,   12,5,2,   12,5,0,
      //2
      12,7,0,   10,7,0,   10,7,2,
      10,7,2,   12,7,2,   12,7,0,
      //3
      10,7,0,   10,5,0,   10,5,2,
      10,5,2,   10,7,2,   10,7,0,
    //ziemia
      //dol
      13,5,0,   15,5,0,   13,3,0,
      13,3,0,   15,3,0,   15,5,0,
      //gora
      13,5,2,   15,5,2,   13,3,2,
      13,3,2,   15,3,2,   15,5,2,
      //0
      13,3,0,   15,3,0,   15,3,2,
      15,3,2,   13,3,2,   13,3,0,
      //1
      15,3,0,   15,5,0,   15,5,2,
      15,5,2,   15,3,2,   15,3,0,
      //2
      15,5,0,   13,5,0,   13,5,2,
      13,5,2,   15,5,2,   15,5,0,
      //3
      13,5,0,   13,3,0,   13,3,2,
      13,3,2,   13,5,2,   13,5,0,
    //ksiezyc
      //dol
      13,2,0,   14,2,0,   13,1,0,
      13,1,0,   14,1,0,   14,2,0,
      //gora
      13,2,1,   14,2,1,   13,1,1,
      13,1,1,   14,1,1,   14,2,1,
      //0
      13,1,0,   14,1,0,   14,1,1,
      14,1,1,   13,1,1,   13,1,0,
      //1
      14,1,0,   14,2,0,   14,2,1,
      14,2,1,   14,1,1,   14,1,0,
      //2
      14,2,0,   13,2,0,   13,2,1,
      13,2,1,   14,2,1,   14,2,0,
      //3
      13,2,0,   13,1,0,   13,1,1,
      13,1,1,   13,2,1,   13,2,0,
    //mars
      //dol
      16,5,0,   17.5,5,0,   17.5,6.5,0,
      16,5,0,   16,6.5,0,   17.5,6.5,0,
      //gora
      16,5,1.5,   17.5,5,1.5,   17.5,6.5,1.5,
      16,5,1.5,   16,6.5,1.5,   17.5,6.5,1.5,
      //0
      16,5,0,   17.5,5,0,   17.5,5,1.5,
      17.5,5,1.5,   16,5,1.5,   16,5,0,
      //1
      17.5,5,0,   17.5,6.5,0,   17.5,6.5,1.5,
      17.5,6.5,1.5,   17.5,5,1.5,   17.5,5,0,
      //2
      17.5,6.5,0,   16,6.5,0,   16,6.5,1.5,
      16,6.5,1.5,   17.5,6.5,1.5,   17.5,6.5, 0,
      //3
      16,6.5,0,   16,5,0,   16,5,1.5,
      16,5,1.5,   16,6.5,1.5,   16,6.5,0,
    //jowisz
      //dol
      19,5,0,   23,5,0,   19,1,0,
      19,1,0,   23,1,0,   23,5,0,
      //gora
      19,5,4,   23,5,4,   19,1,4,
      19,1,4,   23,1,4,   23,5,4,
      //0
      19,1,0,   23,1,0,   23,1,4,
      23,1,4,   19,1,4,   19,1,0,
      //1
      23,1,0,   23,5,0,   23,5,4,
      23,5,4,   23,1,4,   23,1,0,
      //2
      23,5,0,   19,5,0,   19,5,4,
      19,5,4,   23,5,4,   23,5,0,
      //3
      19,5,0,   19,1,0,   19,1,4,
      19,1,4,   19,5,4,   19,5,0,
    //europa
      //dol
      20,7,0,   21,7,0,   20,6,0,
      20,6,0,   21,6,0,   21,7,0,
      //gora
      20,7,1,   21,7,1,   20,6,1,
      20,6,1,   21,6,1,   21,7,1,
      //0
      20,6,0,   21,6,0,   21,6,1,
      21,6,1,   20,6,1,   20,6,0,
      //1
      21,6,0,   21,7,0,   21,7,1,
      21,7,1,   21,6,1,   21,6,0,
      //2
      21,7,0,   20,7,0,   20,7,1,
      20,7,1,   21,7,1,   21,7,0,
      //3
      20,7,0,   20,6,0,   20,6,1,
      20,6,1,   20,7,1,   20,7,0,
    //saturn
      //dol
      25,6,0,   27,6,0,   27,8,0,
      25,6,0,   25,8,0,   27,8,0,
      //gora
      25,6,2,   27,6,2,   27,8,2,
      25,6,2,   25,8,2,   27,8,2,
      //0
      25,6,0,   27,6,0,   27,6,2,
      27,6,2,   25,6,2,   25,6,0,
      //1
      27,6,0,   27,8,0,   27,8,2,
      27,8,2,   27,6,2,   27,6,0,
      //2
      27,8,0,   25,8,0,   25,8,2,
      25,8,2,   27,8,2,   27,8,0,
      //3
      25,8,0,   25,6,0,   25,6,2,
      25,6,2,   25,8,2,   25,8,0,
    //pierscien
      24,9,1,   24.5,9,1,   24,5,1,
      24.5,9,1,   24,5,1,   24.5,5,1,
      24.5,9,1,   27.5,9,1,   24.5,8.5,1,
      24.5,8.5,1,   27.5,8.5,1,   27.5,9,1,
      27.5,9,1,   28,9,1,   27.5,5,1,
      28,9,1,   27.5,5,1,   28,5,1,
      24.5,5.5,1,   27.5,5.5,1,   24.5,5,1,
      24.5,5,1,   27.5,5,1,   27.5,5.5,1,
    //uranus xD
      //dol
      29,2,0,   32,2,0,   32,5,0,
      29,5,0,   29,2,0,   32,5,0,
      //gora
      29,2,3,   32,2,3,   32,5,3,
      29,5,3,   29,2,3,   32,5,3,
      //0
      29,2,0,   32,2,0,   32,2,3,
      32,2,3,   29,2,3,   29,2,0,
      //1
      32,2,0,   32,5,0,   32,5,3,
      32,5,3,   32,2,3,   32,2,0,
      //2
      32,5,0,   29,5,0,   29,5,3,
      29,5,3,   32,5,3,   32,5,0,
      //3
      29,5,0,   29,2,0,   29,2,3,
      29,2,3,   29,5,3,   29,5,0,
    //neptun
      //dol
      33,5,0,   35,5,0,   35,7,0,
      33,5,0,   35,7,0,   33,7,0,
      //gora
      33,5,2,   35,5,2,   35,7,2,
      33,5,2,   35,7,2,   33,7,2,
      //0
      33,5,0,   35,5,0,   35,5,2,
      35,5,2,   33,5,2,   33,5,0,
      //1
      35,5,0,   35,7,0,   35,7,2,
      35,7,2,   35,5,2,   35,5,0,
      //2
      35,7,0,   33,7,0,   33,7,2,
      33,7,2,   35,7,2,   35,7,0,
      //3
      33,7,0,   33,5,0,   33,5,2,
      33,5,2,   33,7,2,   33,7,0,
    ]
  

  //Wgranie danych do GPU
  vertexPositionBuffer = gl.createBuffer(); //stworzenie bufora tablicy w pamięci GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW); //do bufora tablicy wrzucamy tablicę wierzchołków, która służć będzie do rysowania statycznego obiektu
  vertexPositionBuffer.itemSize = 3; //zdefiniowanie liczby współrzędnych na wierzchołek, 3D więc 3
  vertexPositionBuffer.numItems = 500; //zdefiniowanie liczby punktów w buforze

  //Opis sceny 3D, kolor każdego z wierzchołków
  let vertexColor = [
    //Top
      1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, //3 punkty po 3 składowe - R1,G1,B1, R2,G2,B2, R3,G3,B3 - 1 trójkąt
      1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
    //Left
      0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
    //Right
      0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,
    //Front
      1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,
      1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,
    //Back
      1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,
      1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,
    //Bottom
      0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,
      0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,
    ]
  

  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 3;
  vertexColorBuffer.numItems = 500;

  let vertexCoords = [
    //slonce
      //dol
      0.0,0.5,   0.1,0.5,   0.1,0.0,
      0.0,0.5,   0.1,0.0,   0.0,0.0,
      //gora
      0.0,0.5,   0.1,0.5,   0.1,0.0,
      0.0,0.5,   0.1,0.0,   0.0,0.0,
      //0
      0.0,0.5,   0.1,0.5,   0.0,0.0,
      0.0,0.0,   0.1,0.0,   0.1,0.5,
      //1
      0.0,0.5,   0.1,0.5,   0.1,0.0,
      0.1,0.0,   0.0,0.0,   0.0,0.5,
      //2
      0.0,0.5,   0.1,0.5,   0.1,0.0,
      0.1,0.0,   0.0,0.0,   0.0,0.5,
      //3
      0.0,0.5,   0.1,0.5,   0.1,0.0,
      0.1,0.0,   0.0,0.0,   0.0,0.5,
    //merkury
      //dol
      0.1,0.5,   0.2,0.5,   0.2,0.0,
      0.1,0.5,   0.2,0.0,   0.1,0.0,
      //gora
      0.1,0.5,   0.2,0.5,   0.2,0.0,
      0.1,0.5,   0.2,0.0,   0.1,0.0,
      //0
      0.1,0.5,   0.2,0.5,   0.2,0.0,
      0.2,0.0,   0.1,0.0,   0.1,0.5,
      //1
      0.1,0.5,   0.2,0.5,   0.2,0.0,
      0.2,0.0,   0.1,0.0,   0.1,0.5,
      //2
      0.1,0.5,   0.2,0.5,   0.2,0.0,
      0.2,0.0,   0.1,0.0,   0.1,0.5,
      //3
      0.1,0.5,   0.2,0.5,   0.2,0.0,
      0.2,0.0,   0.1,0.0,   0.1,0.5,
    //wenus
      //dol
      0.2,0.5,   0.3,0.5,   0.3,0.0,
      0.2,0.5,   0.3,0.0,   0.2,0.0,
      //gora
      0.2,0.5,   0.3,0.5,   0.3,0.0,
      0.2,0.5,   0.3,0.0,   0.2,0.0,
      //0
      0.2,0.5,   0.3,0.5,   0.3,0.0,
      0.3,0.0,   0.2,0.0,   0.2,0.5,
      //1
      0.2,0.5,   0.3,0.5,   0.3,0.0,
      0.3,0.0,   0.2,0.0,   0.2,0.5,
      //2
      0.2,0.5,   0.3,0.5,   0.3,0.0,
      0.3,0.0,   0.2,0.0,   0.2,0.5,
      //3
      0.2,0.5,   0.3,0.5,   0.3,0.0,
      0.3,0.0,   0.2,0.0,   0.2,0.5,
    //ziemia
      //dol
      0.3,0.5,   0.4,0.5,   0.3,1.0,
      0.3,1.0,   0.4,1.0,   0.4,0.5,
      //gora
      0.3,0.5,   0.4,0.5,   0.3,1.0,
      0.3,1.0,   0.4,1.0,   0.4,0.5,
      //0
      0.3,0.5,   0.4,0.5,   0.4,0.0,
      0.4,0.0,   0.3,0.0,   0.3,0.5,
      //1
      0.3,0.5,   0.4,0.5,   0.4,0.0,
      0.4,0.0,   0.3,0.0,   0.3,0.5,
      //2
      0.3,0.5,   0.4,0.5,   0.4,0.0,
      0.4,0.0,   0.3,0.0,   0.3,0.5,
      //3
      0.3,0.5,   0.4,0.5,   0.4,0.0,
      0.4,0.0,   0.3,0.0,   0.3,0.5,
    //ksiezyc
      //dol
      0.4,0.0,   0.5,0.0,   0.4,0.5,
      0.4,0.5,   0.5,0.5,   0.5,0.0,
      //gora
      0.4,0.0,   0.5,0.0,   0.4,0.5,
      0.4,0.5,   0.5,0.5,   0.5,0.0,
      //0
      0.4,0.5,   0.5,0.5,   0.5,0.0,
      0.5,0.0,   0.4,0.0,   0.4,0.5,
      //1
      0.4,0.5,   0.5,0.5,   0.5,0.0,
      0.5,0.0,   0.4,0.0,   0.4,0.5,
      //2
      0.4,0.5,   0.5,0.5,   0.5,0.0,
      0.5,0.0,   0.4,0.0,   0.4,0.5,
      //3
      0.4,0.5,   0.5,0.5,   0.5,0.0,
      0.5,0.0,   0.4,0.0,   0.4,0.5,
    //mars
      //dol
      0.5,1.0,   0.6,1.0,   0.6,0.5,
      0.5,1.0,   0.6,0.5,   0.5,0.5,
      //gora
      0.5,1.0,   0.6,1.0,   0.6,0.5,
      0.5,1.0,   0.6,0.5,   0.5,0.5,
      //0
      0.5,0.5,   0.6,0.5,   0.6,0.0,
      0.6,0.0,   0.5,0.0,   0.5,0.5,
      //1
      0.5,0.5,   0.6,0.5,   0.6,0.0,
      0.6,0.0,   0.5,0.0,   0.5,0.5,
      //2
      0.5,0.5,   0.6,0.5,   0.6,0.0,
      0.6,0.0,   0.5,0.0,   0.5,0.5,
      //3
      0.5,0.5,   0.6,0.5,   0.6,0.0,
      0.6,0.0,   0.5,0.0,   0.5,0.5,
    //jowisz
      //dol
      0.6,0.0,   0.7,0.0,   0.6,0.5,
      0.6,0.5,   0.7,0.5,   0.7,0.0,
      //gora
      0.6,0.0,   0.7,0.0,   0.6,0.5,
      0.6,0.5,   0.7,0.5,   0.7,0.0,
      //0
      0.6,0.5,   0.7,0.5,   0.7,0.0,
      0.7,0.0,   0.6,0.0,   0.6,0.5,
      //1
      0.6,0.5,   0.7,0.5,   0.7,0.0,
      0.7,0.0,   0.6,0.0,   0.6,0.5,
      //2
      0.6,0.5,   0.7,0.5,   0.7,0.0,
      0.7,0.0,   0.6,0.0,   0.6,0.5,
      //3
      0.6,0.5,   0.7,0.5,   0.7,0.0,
      0.7,0.0,   0.6,0.0,   0.6,0.5,
    //europa
      //dol
      0.6,0.5,   0.7,0.5,   0.6,1.0,
      0.6,1.0,   0.7,1.0,   0.7,0.5,
      //gora
      0.6,0.5,   0.7,0.5,   0.6,1.0,
      0.6,1.0,   0.7,1.0,   0.7,0.5,
      //0
      0.6,1.0,   0.7,1.0,   0.7,0.5,
      0.7,0.5,   0.6,0.5,   0.6,1.0,
      //1
      0.6,1.0,   0.7,1.0,   0.7,0.5,
      0.7,0.5,   0.6,0.5,   0.6,1.0,
      //2
      0.6,1.0,   0.7,1.0,   0.7,0.5,
      0.7,0.5,   0.6,0.5,   0.6,1.0,
      //3
      0.6,1.0,   0.7,1.0,   0.7,0.5,
      0.7,0.5,   0.6,0.5,   0.6,1.0,
    //saturn
      //dol
      0.7,0.5,   0.8,0.5,   0.8,0.0,
      0.7,0.5,   0.8,0.0,   0.7,0.0,
      //gora
      0.7,0.5,   0.8,0.5,   0.8,0.0,
      0.7,0.5,   0.8,0.0,   0.7,0.0,
      //0
      0.7,0.5,   0.8,0.5,   0.8,0.0,
      0.8,0.0,   0.7,0.0,   0.7,0.5,
      //1
      0.7,0.5,   0.8,0.5,   0.8,0.0,
      0.8,0.0,   0.7,0.0,   0.7,0.5,
      //2
      0.7,0.5,   0.8,0.5,   0.8,0.0,
      0.8,0.0,   0.7,0.0,   0.7,0.5,
      //3
      0.7,0.5,   0.8,0.5,   0.8,0.0,
      0.8,0.0,   0.7,0.0,   0.7,0.5,
    //pierscien
      0.7,1.0,   0.8,1.0,   0.7,0.5,
      0.8,1.0,   0.7,0.5,   0.8,0.5,
      0.7,1.0,   0.7,0.5,   0.8,1.0,
      0.8,1.0,   0.8,0.5,   0.7,0.5,
      0.7,1.0,   0.8,1.0,   0.7,0.5,
      0.8,1.0,   0.7,0.5,   0.8,0.5,
      0.7,1.0,   0.7,0.5,   0.8,1.0,
      0.8,1.0,   0.8,0.5,   0.7,0.5,
    //uranus xD
      //dol
      0.8,0.5,   0.9,0.5,   0.9,0.0,
      0.8,0.0,   0.8,0.5,   0.9,0.0,
      //gora
      0.8,0.5,   0.9,0.5,   0.9,0.0,
      0.8,0.0,   0.8,0.5,   0.9,0.0,
      //0
      0.8,0.5,   0.9,0.5,   0.9,0.0,
      0.9,0.0,   0.8,0.0,   0.8,0.5,
      //1
      0.8,0.5,   0.9,0.5,   0.9,0.0,
      0.9,0.0,   0.8,0.0,   0.8,0.5,
      //2
      0.8,0.5,   0.9,0.5,   0.9,0.0,
      0.9,0.0,   0.8,0.0,   0.8,0.5,
      //3
      0.8,0.5,   0.9,0.5,   0.9,0.0,
      0.9,0.0,   0.8,0.0,   0.8,0.5,
    //neptun
      //dol
      0.9,0.5,   1.0,0.5,   1.0,0.0,
      0.9,0.5,   1.0,0.0,   0.9,0.0,
      //gora
      0.9,0.5,   1.0,0.5,   1.0,0.0,
      0.9,0.5,   1.0,0.0,   0.9,0.0,
      //0
      0.9,0.5,   1.0,0.5,   1.0,0.0,
      1.0,0.0,   0.9,0.0,   0.9,0.5,
      //1
      0.9,0.5,   1.0,0.5,   1.0,0.0,
      1.0,0.0,   0.9,0.0,   0.9,0.5,
      //2
      0.9,0.5,   1.0,0.5,   1.0,0.0,
      1.0,0.0,   0.9,0.0,   0.9,0.5,
      //3
      0.9,0.5,   1.0,0.5,   1.0,0.0,
      1.0,0.0,   0.9,0.0,   0.9,0.5,
    ]

  vertexCoordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexCoordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCoords), gl.STATIC_DRAW);
  vertexCoordsBuffer.itemSize = 2;
  vertexCoordsBuffer.numItems = 500;

  textureBuffer = gl.createTexture();
  var textureImg = new Image();
  textureImg.onload = function() { //Wykonanie kodu automatycznie po załadowaniu obrazka
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg); //Faktyczne załadowanie danych obrazu do pamieci karty graficznej
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Ustawienie parametrów próbkowania tekstury
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  textureImg.src="Tex.png"; //Nazwa obrazka
           
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
let angleY = 0.0;
let angleZ = 0.0;
let tx = -10.0;
let ty = -5.0;
let tz = -50;

function Tick()
{
  //angleX = angleX+0.2;
  //angleY = angleY+0.2;
  
  //angleY = angleY+2;
  //angleZ = angleZ+3;

  let uMVMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]

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
    tx,ty,tz,1
    ];

    uMVMatrix = matrixMul(uMVMatrix,uMVRotX);
    uMVMatrix = matrixMul(uMVMatrix,uMVRotY);
    uMVMatrix = matrixMul(uMVMatrix,uMVRotZ);
    uMVMatrix = matrixMul(uMVMatrix,uMVTranslateZ);

  //Render sceny
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clearColor(0.1725, 0.1725, 0.1725, 1.0); //wyczyszczenie obrazu kolorem czerwonym  gl.clearDepth(1.0); //wyczyszczenie bufora głębi najdalszym planem
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

  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexCoords"));  //Pass the geometry
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexCoordsBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexCoords"), vertexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

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
 if(e.keyCode==87) angleX=angleX+1.0; //W
 if(e.keyCode==83) angleX=angleX-1.0; //S
 if(e.keyCode==68) angleY=angleY+1.0;
 if(e.keyCode==65) angleY=angleY-1.0;
 if(e.keyCode==81) angleZ=angleZ+1.0;
 if(e.keyCode==69) angleZ=angleZ-1.0;
 if(e.keyCode==38) tz=tz+1.0;
 if(e.keyCode==40) tz=tz-1.0;
 if(e.keyCode==39) tx=tx-1.0;
 if(e.keyCode==37) tx=tx+1.0;
 //alert(e.keyCode);
 //alert(angleX);
}