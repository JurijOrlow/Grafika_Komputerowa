var gl;
var shaderProgram;
var uPMatrix;
var vertexPositionBuffer;
var vertexColorBuffer;
function MatrixMul(a,b) //Mnożenie macierzy
{
  let c = [
  0,0,0,0,
  0,0,0,0,
  0,0,0,0,
  0,0,0,0
  ]
  for(let i=0;i<4;i++)
  {
    for(let j=0;j<4;j++)
    {
      c[i*4+j] = 0.0;
      for(let k=0;k<4;k++)
      {
        c[i*4+j]+= a[i*4+k] * b[k*4+j];
      }
    }
  }
  return c;
}
function CreateIdentytyMatrix()
{
  return [
  1,0,0,0, //Macierz jednostkowa
  0,1,0,0,
  0,0,1,0,
  0,0,0,1
  ];
}
function CreateTranslationMatrix(tx,ty,tz)
{
  return  [
  1,0,0,0,
  0,1,0,0,
  0,0,1,0,
  tx,ty,tz,1
  ];
}
function CreateScaleMatrix(sx,sy,sz)
{
  return [
  sx,0,0,0,
  0,sy,0,0,
  0,0,sz,0,
  0,0,0,1
  ];
}
function CreateRotationZMatrix(angleZ)
{
  return [
  +Math.cos(angleZ*Math.PI/180.0),+Math.sin(angleZ*Math.PI/180.0),0,0,
  -Math.sin(angleZ*Math.PI/180.0),+Math.cos(angleZ*Math.PI/180.0),0,0,
  0,0,1,0,
  0,0,0,1
  ];
}
function CreateRotationYMatrix(angleY)
{
  return [
  +Math.cos(angleY*Math.PI/180.0),0,-Math.sin(angleY*Math.PI/180.0),0,
  0,1,0,0,
  +Math.sin(angleY*Math.PI/180.0),0,+Math.cos(angleY*Math.PI/180.0),0,
  0,0,0,1
  ];
}
function CreateRotationXMatrix(angleX)
{
  return [
  1,0,0,0,
  0,+Math.cos(angleX*Math.PI/180.0),+Math.sin(angleX*Math.PI/180.0),0,
  0,-Math.sin(angleX*Math.PI/180.0),+Math.cos(angleX*Math.PI/180.0),0,
  0,0,0,1
  ];
}
function CreatePointCloud(sx,ex,sy,ey,sz,ez,svx,evx,svy,evy,svz,evz,sa,ea,n)
{
  let vertexPos   = [];
  let vertexVelocity = []; 
  let vertexColor = [];
  let vertexAge = [];
  for(let i=0;i<n;i++)
  {
    //Position randomization
    let px = sx + Math.random()*(ex-sx);
    let py = sy + Math.random()*(ey-sy);
    let pz = sz + Math.random()*(ez-sz);
    //Velocity randomization
    let vx = svx + Math.random()*(evx-svx);
    let vy = svy + Math.random()*(evy-svy);
    let vz = svz + Math.random()*(evz-svz);
    
    let age = sa + Math.random()*(ea-sa);
    
    vertexPos.push(...[px,py,pz]);
    vertexVelocity.push(...[vx,vy,vz]);
    vertexColor.push(...[1.0,1.0,1.0]);
    
    vertexAge.push(age);
  }
  return [vertexPos,vertexVelocity,vertexColor,vertexAge];
}
//Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
let vertexPosition; //3 punkty po 3 składowe - X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 - 1 trójkąt
let vertexPosition2;
let vertexVelocity;
let vertexColor;
let vertexAge;
let vertexNormal;
let vertexCoord;
let indexes;

let sx = -1.0; //Położenie cząsteczek
let ex =  0.0;
let sy = -1.1;
let ey =  -1.0;
let sz = -2.1;
let ez =  -2.0;
let svx = -0.2; //Predkości cząsteczek
let evx =  0.2;
let svy = 0.0;
let evy =  2.0;
let svz = -1.0;
let evz =  1.0;
let sa = 0.2; //Czas życia nowych cząsteczek
let ea = 4;

function updatePointCloud(vertexPosition,vertexVelocity,vertexColor,vertexAge,n,dt, sx,ex,sy,ey,sz,ez,svx,evx,svy,evy,svz,evz,sa,ea)
{
  for(let i=0;i<n;i++)
  {
    vertexPosition[i*3+0] = vertexPosition[i*3+0] + vertexVelocity[i*3+0]*dt;
    vertexPosition[i*3+1] = vertexPosition[i*3+1] + vertexVelocity[i*3+1]*dt;
    vertexPosition[i*3+2] = vertexPosition[i*3+2] + vertexVelocity[i*3+2]*dt;
    
    vertexColor[i*3+0] = 1.0;
    vertexColor[i*3+1] = vertexAge[i]/ea;
    vertexColor[i*3+2] = 0.0;
    
    vertexAge[i] = vertexAge[i] - dt;
    if(vertexAge[i]<0)
    {
      vertexPosition[i*3+0] = sx + Math.random()*(ex-sx);
      vertexPosition[i*3+1] = sy + Math.random()*(ey-sy);
      vertexPosition[i*3+2] = sz + Math.random()*(ez-sz);
      //Velocity randomization
      vertexVelocity[i*3+0] = svx + Math.random()*(evx-svx);
      vertexVelocity[i*3+1] = svy + Math.random()*(evy-svy);
      vertexVelocity[i*3+2] = svz + Math.random()*(evz-svz);
      
      vertexAge[i] = sa + Math.random()*(ea-sa);
    }    
  }
  return [vertexPosition,vertexVelocity,vertexColor,vertexAge];
}

async function LoadObj(filename)
  {
  
    let rawVertexPosition = [0,0,0]; //Dodana 0 pozycja która nie będzie uzywana
    let rawVertexNormal = [0,0,0];//Dodana 0 pozycja która nie będzie uzywana
    let rawVertexCoords = [0,0];//Dodana 0 pozycja która nie będzie uzywana
  
    //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
    let vertexPosition = []; //Każdy punkt 3 składowe - X1,Y1,Z1
    let vertexNormal = [];
    let vertexCoord = [];
    let indexes = [];
  
  
    let aa = new Map();
    for await (let line of makeTextFileLineIterator(filename)) {
      const lineArray = line.split(' ');
      switch(lineArray[0]) {
        case "v": { //Wierzcholki
          const x = parseFloat(lineArray[1]);
          const y = parseFloat(lineArray[2]);
          const z = parseFloat(lineArray[3]);
          rawVertexPosition.push(...[x,y,z]);
          break;
        };
        case "vn": { //Wektory normalne
          const xn = parseFloat(lineArray[1]);
          const yn = parseFloat(lineArray[2]);
          const zn = parseFloat(lineArray[3]);
          rawVertexNormal.push(...[xn,yn,zn]);
          break;
        }
        case "vt": { //Współrzędne tekstury
          const u = parseFloat(lineArray[1]);
          const v = parseFloat(lineArray[2]);
          rawVertexCoords.push(...[u,v]);
          break;
        }
        case "f": { //Indeksy trójkątów
          const i0 = lineArray[1];
          const i1 = lineArray[2];
          const i2 = lineArray[3];
          for(let ii of [i0,i1,i2]) {
            if(!aa.has(ii)) { //Ten indeks nie był jeszcze przemapowany
              //console.log(ii);
              const iia = ii.split('/');
              const indexVertexPosition = parseInt(iia[0]);//Indeks w tablicy położeń wierzchołków
              const indexVertexCoord = parseInt(iia[1]); //Indeks w tablicy wspołrzędnych tekstur
              const indexVertexNormal = parseInt(iia[2]); //Indeks w tablicy wektorów normalnych
              const index = vertexPosition.length/3;
              //console.log(index);
              //Skopiuj wartości
              vertexPosition.push(rawVertexPosition[indexVertexPosition*3+0]); //Skopiowanie położenia X
              vertexPosition.push(rawVertexPosition[indexVertexPosition*3+1]); //Skopiowanie położenia Y
              vertexPosition.push(rawVertexPosition[indexVertexPosition*3+2]); //Skopiowanie położenia Z
  
              vertexNormal.push(rawVertexNormal[indexVertexNormal*3+0]); //Skopiowanie składowej X wektora normalnego
              vertexNormal.push(rawVertexNormal[indexVertexNormal*3+1]); //Skopiowanie składowej Y wektora normalnego
              vertexNormal.push(rawVertexNormal[indexVertexNormal*3+2]); //Skopiowanie składowej Z wektora normalnego
  
              vertexCoord.push(rawVertexCoords[indexVertexCoord*2+0]); //Skopiowanie składowej U wspołrzędnej tekstury
              vertexCoord.push(rawVertexCoords[indexVertexCoord*2+1]); //Skopiowanie składowej V wspołrzędnej tekstury
              aa.set(ii,index);
            }
            //console.log(aa.get(ii));
            indexes.push(aa.get(ii)) //Dodaj jego wynikowy indeks do tablicy indeksów
          }
          //rawVertexCoords.push(...[u,v]);
          break;
        }
      }
    }
  
    console.log(`Wczytano ${rawVertexPosition.length/3-1} wierzchołków`);
    console.log(`Wczytano ${rawVertexNormal.length/3-1} wektorów normalnych`);
    console.log(`Wczytano ${rawVertexCoords.length/2-1} współrzędnych tekstury`);
  
    console.log(`W efekcie mapowania stworzono ${vertexPosition.length/3} wierzchołków`);
    console.log(`W efekcie mapowania stworzono ${indexes.length} indeksów`);
   
    //console.log(indexes);
    //console.log(vertexPosition);
    return [indexes, vertexPosition, vertexNormal, vertexCoord];
  }

function startGL() 
{
  //alert("StartGL");
  let canvas = document.getElementById("canvas3D"); //wyszukanie obiektu w strukturze strony 
  gl = canvas.getContext("experimental-webgl"); //pobranie kontekstu OpenGL'u z obiektu canvas
  gl.viewportWidth = canvas.width; //przypisanie wybranej przez nas rozdzielczości do systemu OpenGL
  gl.viewportHeight = canvas.height;
  
    //Kod shaderów
  const vertextShaderSource = ` //Znak akcentu z przycisku tyldy - na lewo od przycisku 1 na klawiaturze
    precision highp float;
    attribute vec3 aVertexPosition; 
    attribute vec3 aVertexColor;
    uniform mat4 uMMatrix;
    uniform mat4 uVMatrix;
    uniform mat4 uPMatrix;
    varying vec3 vPos;
    varying vec3 vColor;
    void main(void) {
      vPos = vec3(uMMatrix * vec4(aVertexPosition, 1.0));
      gl_Position = uPMatrix * uVMatrix * vec4(vPos,1.0); //Dokonanie transformacji położenia punktów z przestrzeni 3D do przestrzeni obrazu (2D)
      vColor = aVertexColor;
      gl_PointSize = 0.5;
    }
  `;
  const fragmentShaderSource = `
    precision highp float;
    varying vec3 vPos;
    varying vec3 vColor;
    void main(void) {
      gl_FragColor = vec4(vColor,1.0);
    }
  `;
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); //Stworzenie obiektu shadera 
  let vertexShader   = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource); //Podpięcie źródła kodu shader
  gl.shaderSource(vertexShader, vertextShaderSource);
  gl.compileShader(fragmentShader); //Kompilacja kodu shader
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) { //Sprawdzenie ewentualnych błedów kompilacji
    alert(gl.getShaderInfoLog(fragmentShader));
    return null;
  }
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader));
    return null;
  }
  
  shaderProgram = gl.createProgram(); //Stworzenie obiektu programu 
  gl.attachShader(shaderProgram, vertexShader); //Podpięcie obu shaderów do naszego programu wykonywanego na karcie graficznej
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) alert("Could not initialise shaders");  //Sprawdzenie ewentualnych błedów
  
  //[vertexPosition, vertexColor, vertexCoords, vertexNormal] = CreateShpere(0,0,0,2, 6, 12); 
  [vertexPosition, vertexVelocity, vertexColor, vertexAge] = CreatePointCloud(sx,ex,sy,ey,sz,ez,svx,evx,svy,evy,svz,evz,sa,ea,50000);
  //[indexes, vertexPosition2, vertexNormal, vertexCoord] = await LoadObj('fireplace.obj');

  
  //console.log(vertexCoords);
  vertexPositionBuffer = gl.createBuffer(); //Stworzenie tablicy w pamieci karty graficznej
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3; //zdefiniowanie liczby współrzednych per wierzchołek
  vertexPositionBuffer.numItems = vertexPosition.length/9; //Zdefinoiowanie liczby punktów w naszym buforze
  
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 3;
  vertexColorBuffer.numItems = vertexColor.length/9;
  
  console.log(vertexPosition);
  
  //Macierze opisujące położenie wirtualnej kamery w przestrzenie 3D
  let aspect = gl.viewportWidth/gl.viewportHeight;
  let fov = 45.0 * Math.PI / 180.0; //Określenie pola widzenia kamery
  let zFar = 100.0; //Ustalenie zakresów renderowania sceny 3D (od obiektu najbliższego zNear do najdalszego zFar)
  let zNear = 0.1;
  uPMatrix = [
   1.0/(aspect*Math.tan(fov/2)),0                           ,0                         ,0                            ,
   0                         ,1.0/(Math.tan(fov/2))         ,0                         ,0                            ,
   0                         ,0                           ,-(zFar+zNear)/(zFar-zNear)  , -1,
   0                         ,0                           ,-(2*zFar*zNear)/(zFar-zNear) ,0.0,
  ];
  Tick();
} 
//let angle = 45.0; //Macierz transformacji świata - określenie położenia kamery 
var angleZ = 0.0;
var angleY = 0.0;
var angleX = 0.0;
var KameraPositionX =  0.0;
var KameraPositionY =  0.0;
var KameraPositionZ = -8.0;
var CloudPositionX = 0.0;
var CloudPositionY = 0.0;
var CloudPositionZ = 0.0;

function Tick()
{ 
  [vertexPosition, vertexVelocity, vertexColor, vertexAge] = updatePointCloud(vertexPosition,vertexVelocity,vertexColor,vertexAge,50000,0.01, sx,ex,sy,ey,sz,ez,svx,evx,svy,evy,svz,evz,sa,ea);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);
  let uMMatrix0 = CreateIdentytyMatrix(); 
  let uMMatrix1 = CreateIdentytyMatrix();
  let uMMatrix2 = CreateIdentytyMatrix();
  
  let uVMatrix = CreateIdentytyMatrix();
  
  uVMatrix = MatrixMul(uVMatrix,CreateRotationXMatrix(angleX));
  uVMatrix = MatrixMul(uVMatrix,CreateRotationYMatrix(angleY));
  uVMatrix = MatrixMul(uVMatrix,CreateRotationZMatrix(angleZ));
  uVMatrix = MatrixMul(uVMatrix,CreateTranslationMatrix(KameraPositionX,KameraPositionY,KameraPositionZ));
  uMMatrix1 = MatrixMul(uMMatrix1,CreateTranslationMatrix(CloudPositionX,CloudPositionY,CloudPositionZ));  
  
  //alert(uPMatrix);
  
  //Render Scene
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); 
  gl.clearColor(0.1725, 0.1725, 0.1725, 1.0); //Wyczyszczenie obrazu kolorem czerwonym
  gl.clearDepth(1.0);             //Wyczyścienie bufora głebi najdalszym planem
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(shaderProgram)   //Użycie przygotowanego programu shaderowego
  
  gl.enable(gl.DEPTH_TEST);           // Włączenie testu głębi - obiekty bliższe mają przykrywać obiekty dalsze
  gl.depthFunc(gl.LEQUAL);            // 
  
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uPMatrix"), false, new Float32Array(uPMatrix)); //Wgranie macierzy kamery do pamięci karty graficznej
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uVMatrix"), false, new Float32Array(uVMatrix));  
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix1));
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexPosition"));  //Przekazanie położenia
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexPosition"), vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexColor"));  //Przekazywanie wektorów colorów
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexColor"), vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.drawArrays(gl.POINTS, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania
  
  setTimeout(Tick,5);
}
function handlekeydown(e)
{
 // Q W E A S D
 if(e.keyCode==87) angleX=angleX+1.0; //W
 if(e.keyCode==83) angleX=angleX-1.0; //S
 if(e.keyCode==68) angleY=angleY+1.0;
 if(e.keyCode==65) angleY=angleY-1.0;
 if(e.keyCode==81) angleZ=angleZ+1.0;
 if(e.keyCode==69) angleZ=angleZ-1.0;
 //alert(e.keyCode);
 //alert(angleX);
 
 //U I O J K L
 if(e.keyCode==76) KameraPositionX=KameraPositionX+0.1;
 if(e.keyCode==74) KameraPositionX=KameraPositionX-0.1;
 if(e.keyCode==73) KameraPositionY=KameraPositionY+0.1;
 if(e.keyCode==75) KameraPositionY=KameraPositionY-0.1;
 if(e.keyCode==85) KameraPositionZ=KameraPositionZ+0.1;
 if(e.keyCode==79) KameraPositionZ=KameraPositionZ-0.1;
}