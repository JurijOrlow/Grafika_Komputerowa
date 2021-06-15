var gl;
    var shaderProgram;
    var uPMatrix;
    var vertexPositionBuffer;
    var vertexColorBuffer;
    var vertexCoordsBuffer;
    var vertexNormalBuffer;
    var indexBuffer;
    
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
    
    function MatrixTransposeInverse(m)
    {
      let r = [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ];
      r[0] = m[5]*m[10]*m[15] - m[5]*m[14]*m[11] - m[6]*m[9]*m[15] + m[6]*m[13]*m[11] + m[7]*m[9]*m[14] - m[7]*m[13]*m[10];
      r[1] = -m[1]*m[10]*m[15] + m[1]*m[14]*m[11] + m[2]*m[9]*m[15] - m[2]*m[13]*m[11] - m[3]*m[9]*m[14] + m[3]*m[13]*m[10];
      r[2] = m[1]*m[6]*m[15] - m[1]*m[14]*m[7] - m[2]*m[5]*m[15] + m[2]*m[13]*m[7] + m[3]*m[5]*m[14] - m[3]*m[13]*m[6];
      r[3] = -m[1]*m[6]*m[11] + m[1]*m[10]*m[7] + m[2]*m[5]*m[11] - m[2]*m[9]*m[7] - m[3]*m[5]*m[10] + m[3]*m[9]*m[6];
    
      r[4] = -m[4]*m[10]*m[15] + m[4]*m[14]*m[11] + m[6]*m[8]*m[15] - m[6]*m[12]*m[11] - m[7]*m[8]*m[14] + m[7]*m[12]*m[10];
      r[5] = m[0]*m[10]*m[15] - m[0]*m[14]*m[11] - m[2]*m[8]*m[15] + m[2]*m[12]*m[11] + m[3]*m[8]*m[14] - m[3]*m[12]*m[10];
      r[6] = -m[0]*m[6]*m[15] + m[0]*m[14]*m[7] + m[2]*m[4]*m[15] - m[2]*m[12]*m[7] - m[3]*m[4]*m[14] + m[3]*m[12]*m[6];
      r[7] = m[0]*m[6]*m[11] - m[0]*m[10]*m[7] - m[2]*m[4]*m[11] + m[2]*m[8]*m[7] + m[3]*m[4]*m[10] - m[3]*m[8]*m[6];
    
      r[8] = m[4]*m[9]*m[15] - m[4]*m[13]*m[11] - m[5]*m[8]*m[15] + m[5]*m[12]*m[11] + m[7]*m[8]*m[13] - m[7]*m[12]*m[9];
      r[9] = -m[0]*m[9]*m[15] + m[0]*m[13]*m[11] + m[1]*m[8]*m[15] - m[1]*m[12]*m[11] - m[3]*m[8]*m[13] + m[3]*m[12]*m[9];
      r[10] = m[0]*m[5]*m[15] - m[0]*m[13]*m[7] - m[1]*m[4]*m[15] + m[1]*m[12]*m[7] + m[3]*m[4]*m[13] - m[3]*m[12]*m[5];
      r[11] = -m[0]*m[5]*m[11] + m[0]*m[9]*m[7] + m[1]*m[4]*m[11] - m[1]*m[8]*m[7] - m[3]*m[4]*m[9] + m[3]*m[8]*m[5];
    
      r[12] = -m[4]*m[9]*m[14] + m[4]*m[13]*m[10] + m[5]*m[8]*m[14] - m[5]*m[12]*m[10] - m[6]*m[8]*m[13] + m[6]*m[12]*m[9];
      r[13] = m[0]*m[9]*m[14] - m[0]*m[13]*m[10] - m[1]*m[8]*m[14] + m[1]*m[12]*m[10] + m[2]*m[8]*m[13] - m[2]*m[12]*m[9];
      r[14] = -m[0]*m[5]*m[14] + m[0]*m[13]*m[6] + m[1]*m[4]*m[14] - m[1]*m[12]*m[6] - m[2]*m[4]*m[13] + m[2]*m[12]*m[5];
      r[15] = m[0]*m[5]*m[10] - m[0]*m[9]*m[6] - m[1]*m[4]*m[10] + m[1]*m[8]*m[6] + m[2]*m[4]*m[9] - m[2]*m[8]*m[5];
    
      var det = m[0]*r[0] + m[1]*r[4] + m[2]*r[8] + m[3]*r[12];
      for (var i = 0; i < 16; i++) r[i] /= det;
      
      let rt = [ r[0], r[4], r[8], r[12],
                 r[1], r[5], r[9], r[13],
                 r[2], r[6], r[10], r[14],
                 r[3], r[7], r[11], r[15]
                 ];
      
      return rt;
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
    
    function createRect(mx,my,mz,dax,day,daz,dbx,dby,dbz)
    {
      p1x = mx;             p1y = my;             p1z = mz;
      p2x = mx + dax;       p2y = my + day;       p2z = mz + daz;
      p3x = mx + dbx;       p3y = my + dby;       p3z = mz + dbz;
      p4x = mx + dax + dbx; p4y = my + day + dby; p4z = mz + daz + dbz;
      
      let vertexPosition = [p1x,p1y,p1z, p2x,p2y,p2z, p4x,p4y,p4z,  //Pierwszy trójkąt
                            p1x,p1y,p1z, p4x,p4y,p4z, p3x,p3y,p3z]; //Drugi trójkąt
                            
      return vertexPosition;
    }
    
    function createNormal(p1x,p1y,p1z,p2x,p2y,p2z,p3x,p3y,p3z) //Wyznaczenie wektora normalnego dla trójkąta
    {
      let v1x = p2x - p1x;
      let v1y = p2y - p1y;
      let v1z = p2z - p1z;
      
      let v2x = p3x - p1x;
      let v2y = p3y - p1y;
      let v2z = p3z - p1z;
      
      let v3x =  v1y*v2z - v1z*v2y;
      let v3y =  v1z*v2x - v1x*v2z;
      let v3z =  v1x*v2y - v1y*v2x;
      
      vl = Math.sqrt(v3x*v3x+v3y*v3y+v3z*v3z); //Obliczenie długości wektora
       
      v3x/=vl; //Normalizacja na zakreś -1 1
      v3y/=vl;
      v3z/=vl;
      
      let vertexNormal = [v3x,v3y,v3z, v3x,v3y,v3z, v3x,v3y,v3z];
      return vertexNormal;
    }
    
  
    
    function Block1(x,y,z,dx,dy,dz)
  {
    //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
    let vertexPosition = []; //Każdy punkt 3 składowe - X1,Y1,Z1
    let vertexNormal = [];
    let indexes = [];
    vertexPosition.push(...[0,0,0]);  
    vertexPosition.push(...[	-1.000000, -1.000000, 1.000000	]);
    vertexPosition.push(...[	-1.000000, 1.000000, 1.000000	]);
    vertexPosition.push(...[	-1.000000, -1.000000, -1.000000	]);
    vertexPosition.push(...[	-1.000000, 1.000000, -1.000000	]);
    vertexPosition.push(...[	1.000000, -1.000000, 1.000000	]);
    vertexPosition.push(...[	1.000000, 1.000000, 1.000000	]);
    vertexPosition.push(...[	1.000000, -1.000000, -1.000000	]);
    vertexPosition.push(...[	1.000000, 1.000000, -1.000000	]);
    vertexPosition.push(...[	2.702142, 1.000000, -1.000000	]);
    vertexPosition.push(...[	2.702142, -1.000000, -1.000000	]);
    vertexPosition.push(...[	2.702142, -1.000000, 1.000000	]);
    vertexPosition.push(...[	2.702142, 1.000000, 1.000000	]);
    vertexPosition.push(...[	-1.000000, -1.000000, 0.000000	]);
    vertexPosition.push(...[	-1.000000, 2.664999, 0.000000	]);
    vertexPosition.push(...[	1.000000, -1.000000, 0.000000	]);
    vertexPosition.push(...[	1.000000, 2.664999, 0.000000	]);
    vertexPosition.push(...[	2.702142, -1.000000, 0.000000	]);
    vertexPosition.push(...[	2.702142, 2.664999, 0.000000	]);

    indexes.push(...[13, 4, 3]);
    indexes.push(...[4, 7, 3]);
    indexes.push(...[6, 18, 16]);
    indexes.push(...[6, 1, 5]);
    indexes.push(...[15, 1, 13]);
    indexes.push(...[14, 6, 16]);
    indexes.push(...[17, 12, 11]);
    indexes.push(...[8, 10, 7]);
    indexes.push(...[5, 12, 6]);
    indexes.push(...[7, 17, 15]);
    indexes.push(...[15, 11, 5]);
    indexes.push(...[9, 17, 10]);
    indexes.push(...[4, 16, 8]);
    indexes.push(...[7, 13, 3]);
    indexes.push(...[16, 9, 8]);
    indexes.push(...[2, 13, 1]);
    indexes.push(...[13, 14, 4]);
    indexes.push(...[4, 8, 7]);
    indexes.push(...[6, 12, 18]);
    indexes.push(...[6, 2, 1]);
    indexes.push(...[15, 5, 1]);
    indexes.push(...[14, 2, 6]);
    indexes.push(...[17, 18, 12]);
    indexes.push(...[8, 9, 10]);
    indexes.push(...[5, 11, 12]);
    indexes.push(...[7, 10, 17]);
    indexes.push(...[15, 17, 11]);
    indexes.push(...[9, 18, 17]);
    indexes.push(...[4, 14, 16]);
    indexes.push(...[7, 15, 13]);
    indexes.push(...[16, 18, 9]);
    indexes.push(...[2, 14, 13]);

  
  
    return [indexes, vertexPosition, vertexNormal];
  }
    
  
  function Block2(x,y,z,dx,dy,dz)
  {
    //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
    let vertexPosition = []; //Każdy punkt 3 składowe - X1,Y1,Z1
    let vertexNormal = [];
    let indexes = [];
  
  vertexPosition.push(...[0,0,0]);    
  
vertexPosition.push(...[	-1.000000, -1.000000, 1.000000	]);
vertexPosition.push(...[	-1.000000, 1.000000, 1.000000	]);
vertexPosition.push(...[	-1.000000, -1.000000, -1.000000	]);
vertexPosition.push(...[	-1.000000, 1.000000, -1.000000	]);
vertexPosition.push(...[	1.000000, -1.000000, 1.000000	]);
vertexPosition.push(...[	1.000000, 1.000000, 1.000000	]);
vertexPosition.push(...[	1.000000, -1.000000, -1.000000	]);
vertexPosition.push(...[	1.000000, 1.000000, -1.000000	]);
vertexPosition.push(...[	2.702142, 1.000000, -1.000000	]);
vertexPosition.push(...[	2.702142, -1.000000, -1.000000	]);
vertexPosition.push(...[	2.702142, -1.000000, 1.000000	]);
vertexPosition.push(...[	2.702142, 1.000000, 1.000000	]);
vertexPosition.push(...[	-1.000000, -1.000000, 0.000000	]);
vertexPosition.push(...[	-1.000000, 2.664999, 0.000000	]);
vertexPosition.push(...[	1.000000, -1.000000, 0.000000	]);
vertexPosition.push(...[	1.000000, 2.664999, 0.000000	]);
vertexPosition.push(...[	2.702142, -1.000000, 0.000000	]);
vertexPosition.push(...[	2.702142, 2.664999, 0.000000	]);
vertexPosition.push(...[	-1.000000, 1.000000, -4.098550	]);
vertexPosition.push(...[	-1.000000, -1.000000, -4.098550	]);
vertexPosition.push(...[	1.000000, -1.000000, -4.098550	]);
vertexPosition.push(...[	1.000000, 1.000000, -4.098550	]);
vertexPosition.push(...[	2.702142, 1.000000, -4.098550	]);
vertexPosition.push(...[	2.702142, -1.000000, -4.098550	]);
vertexPosition.push(...[	1.000000, -1.000000, -2.549275	]);
vertexPosition.push(...[	2.702142, -1.000000, -2.549275	]);
vertexPosition.push(...[	1.000000, 1.561925, -2.549275	]);
vertexPosition.push(...[	-1.000000, 1.561925, -2.549275	]);
vertexPosition.push(...[	-1.000000, -1.000000, -2.549275	]);
vertexPosition.push(...[	2.702142, 1.561925, -2.549275	]);

indexes.push(...[13, 4, 3]);
indexes.push(...[27, 19, 28]);
indexes.push(...[6, 18, 16]);
indexes.push(...[6, 1, 5]);
indexes.push(...[15, 1, 13]);
indexes.push(...[14, 6, 16]);
indexes.push(...[17, 12, 11]);
indexes.push(...[25, 24, 26]);
indexes.push(...[5, 12, 6]);
indexes.push(...[7, 17, 15]);
indexes.push(...[15, 11, 5]);
indexes.push(...[9, 17, 10]);
indexes.push(...[4, 16, 8]);
indexes.push(...[7, 13, 3]);
indexes.push(...[16, 9, 8]);
indexes.push(...[2, 13, 1]);
indexes.push(...[19, 21, 20]);
indexes.push(...[22, 24, 21]);
indexes.push(...[29, 19, 20]);
indexes.push(...[26, 23, 30]);
indexes.push(...[30, 22, 27]);
indexes.push(...[29, 21, 25]);
indexes.push(...[3, 25, 7]);
indexes.push(...[9, 27, 8]);
indexes.push(...[9, 26, 30]);
indexes.push(...[4, 29, 3]);
indexes.push(...[7, 26, 10]);
indexes.push(...[8, 28, 4]);
indexes.push(...[13, 14, 4]);
indexes.push(...[27, 22, 19]);
indexes.push(...[6, 12, 18]);
indexes.push(...[6, 2, 1]);
indexes.push(...[15, 5, 1]);
indexes.push(...[14, 2, 6]);
indexes.push(...[17, 18, 12]);
indexes.push(...[25, 21, 24]);
indexes.push(...[5, 11, 12]);
indexes.push(...[7, 10, 17]);
indexes.push(...[15, 17, 11]);
indexes.push(...[9, 18, 17]);
indexes.push(...[4, 14, 16]);
indexes.push(...[7, 15, 13]);
indexes.push(...[16, 18, 9]);
indexes.push(...[2, 14, 13]);
indexes.push(...[19, 22, 21]);
indexes.push(...[22, 23, 24]);
indexes.push(...[29, 28, 19]);
indexes.push(...[26, 24, 23]);
indexes.push(...[30, 23, 22]);
indexes.push(...[29, 20, 21]);
indexes.push(...[3, 29, 25]);
indexes.push(...[9, 30, 27]);
indexes.push(...[9, 10, 26]);
indexes.push(...[4, 28, 29]);
indexes.push(...[7, 25, 26]);
indexes.push(...[8, 27, 28]);
 
  
  
    return [indexes, vertexPosition, vertexNormal];
  }
  function Block3(x,y,z,dx,dy,dz)
  {
    //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
    let vertexPosition = []; //Każdy punkt 3 składowe - X1,Y1,Z1
    let vertexNormal = [];
    let indexes = [];

vertexPosition.push(...[ 0,0,0]);     
vertexPosition.push(...[	-1.874726, -1.874726, 1.874726	]);
vertexPosition.push(...[	-1.874726, 1.874726, 1.874726	]);
vertexPosition.push(...[	-1.874726, -1.874726, -1.874726	]);
vertexPosition.push(...[	-1.874726, 1.874726, -1.874726	]);
vertexPosition.push(...[	1.874726, -1.874726, 1.874726	]);
vertexPosition.push(...[	1.874726, 1.874726, 1.874726	]);
vertexPosition.push(...[	1.874726, -1.874726, -1.874726	]);
vertexPosition.push(...[	1.874726, 1.874726, -1.874726	]);
vertexPosition.push(...[	-5.972878, -1.874726, -1.874726	]);
vertexPosition.push(...[	-5.972878, -1.874726, 1.874726	]);
vertexPosition.push(...[	-5.972878, 1.874726, 1.874726	]);
vertexPosition.push(...[	-5.972878, 1.874726, -1.874726	]);
vertexPosition.push(...[	-4.582897, -1.874726, -1.874726	]);
vertexPosition.push(...[	-4.582897, 1.874726, -1.874726	]);
vertexPosition.push(...[	-4.582897, 1.874726, 1.874726	]);
vertexPosition.push(...[	-4.582897, -1.874726, 1.874726	]);
vertexPosition.push(...[	-1.874726, -1.874726, 0.000000	]);
vertexPosition.push(...[	-1.874726, 5.143594, 0.000000	]);
vertexPosition.push(...[	1.874726, -1.874726, 0.000000	]);
vertexPosition.push(...[	1.874726, 5.143594, 0.000000	]);
vertexPosition.push(...[	-5.972878, -1.874726, 0.000000	]);
vertexPosition.push(...[	-5.972878, 1.874726, 0.000000	]);
vertexPosition.push(...[	-4.582897, -1.874726, 0.000000	]);
vertexPosition.push(...[	-4.582897, 5.143594, 0.000000	]);
vertexPosition.push(...[	-5.972878, 11.302814, 0.000000	]);
vertexPosition.push(...[	-5.972878, 11.302814, -1.874726	]);
vertexPosition.push(...[	-4.582897, 11.302814, -1.874726	]);
vertexPosition.push(...[	-4.582897, 11.302814, 0.000000	]);
vertexPosition.push(...[	-1.874726, 3.509160, -0.937363	]);
vertexPosition.push(...[	1.874726, -1.874726, -0.937363	]);
vertexPosition.push(...[	-5.972878, 1.874726, -0.937363	]);
vertexPosition.push(...[	-4.582897, -1.874726, -0.937363	]);
vertexPosition.push(...[	-1.874726, -1.874726, -0.937363	]);
vertexPosition.push(...[	1.874726, 3.509160, -0.937363	]);
vertexPosition.push(...[	-5.972878, -1.874726, -0.937363	]);
vertexPosition.push(...[	-4.582897, 3.509160, -0.937363	]);
vertexPosition.push(...[	-5.972878, 11.921526, -0.937363	]);
vertexPosition.push(...[	-4.582897, 11.921527, -0.937363	]);
vertexPosition.push(...[	-5.277887, -1.874726, -1.874726	]);
vertexPosition.push(...[	-5.277887, 1.874726, 1.874726	]);
vertexPosition.push(...[	-5.277887, 1.874726, -1.874726	]);
vertexPosition.push(...[	-5.277887, -1.874726, 1.874726	]);
vertexPosition.push(...[	-5.277887, -1.874726, 0.000000	]);
vertexPosition.push(...[	-5.277887, 3.509160, 0.000000	]);
vertexPosition.push(...[	-5.277887, 11.422007, -1.874726	]);
vertexPosition.push(...[	-5.277887, 11.422007, 0.000000	]);
vertexPosition.push(...[	-5.277887, 13.319047, -0.937363	]);
vertexPosition.push(...[	-5.277887, -1.874726, -0.937363	]);


indexes.push(...[39, 12, 41]);
indexes.push(...[4, 7, 3]);
indexes.push(...[19, 6, 5]);
indexes.push(...[6, 1, 5]);
indexes.push(...[19, 1, 17]);
indexes.push(...[18, 6, 20]);
indexes.push(...[31, 9, 35]);
indexes.push(...[40, 10, 42]);
indexes.push(...[31, 25, 37]);
indexes.push(...[42, 21, 43]);
indexes.push(...[1, 23, 17]);
indexes.push(...[29, 14, 36]);
indexes.push(...[2, 16, 1]);
indexes.push(...[3, 14, 4]);
indexes.push(...[18, 15, 2]);
indexes.push(...[17, 32, 33]);
indexes.push(...[43, 35, 48]);
indexes.push(...[40, 22, 11]);
indexes.push(...[11, 21, 10]);
indexes.push(...[29, 20, 34]);
indexes.push(...[30, 17, 33]);
indexes.push(...[34, 19, 30]);
indexes.push(...[45, 37, 47]);
indexes.push(...[41, 26, 45]);
indexes.push(...[24, 46, 44]);
indexes.push(...[36, 27, 38]);
indexes.push(...[24, 38, 28]);
indexes.push(...[46, 37, 25]);
indexes.push(...[8, 30, 7]);
indexes.push(...[7, 33, 3]);
indexes.push(...[4, 34, 8]);
indexes.push(...[48, 9, 39]);
indexes.push(...[33, 13, 3]);
indexes.push(...[18, 36, 24]);
indexes.push(...[31, 26, 12]);
indexes.push(...[22, 35, 21]);
indexes.push(...[32, 39, 13]);
indexes.push(...[38, 46, 28]);
indexes.push(...[44, 25, 22]);
indexes.push(...[41, 27, 14]);
indexes.push(...[38, 45, 47]);
indexes.push(...[15, 44, 40]);
indexes.push(...[23, 48, 32]);
indexes.push(...[16, 43, 23]);
indexes.push(...[15, 42, 16]);
indexes.push(...[13, 41, 14]);
indexes.push(...[39, 9, 12]);
indexes.push(...[4, 8, 7]);
indexes.push(...[19, 20, 6]);
indexes.push(...[6, 2, 1]);
indexes.push(...[19, 5, 1]);
indexes.push(...[18, 2, 6]);
indexes.push(...[31, 12, 9]);
indexes.push(...[40, 11, 10]);
indexes.push(...[31, 22, 25]);
indexes.push(...[42, 10, 21]);
indexes.push(...[1, 16, 23]);
indexes.push(...[29, 4, 14]);
indexes.push(...[2, 15, 16]);
indexes.push(...[3, 13, 14]);
indexes.push(...[18, 24, 15]);
indexes.push(...[17, 23, 32]);
indexes.push(...[43, 21, 35]);
indexes.push(...[40, 44, 22]);
indexes.push(...[11, 22, 21]);
indexes.push(...[29, 18, 20]);
indexes.push(...[30, 19, 17]);
indexes.push(...[34, 20, 19]);
indexes.push(...[45, 26, 37]);
indexes.push(...[41, 12, 26]);
indexes.push(...[24, 28, 46]);
indexes.push(...[36, 14, 27]);
indexes.push(...[24, 36, 38]);
indexes.push(...[46, 47, 37]);
indexes.push(...[8, 34, 30]);
indexes.push(...[7, 30, 33]);
indexes.push(...[4, 29, 34]);
indexes.push(...[48, 35, 9]);
indexes.push(...[33, 32, 13]);
indexes.push(...[18, 29, 36]);
indexes.push(...[31, 37, 26]);
indexes.push(...[22, 31, 35]);
indexes.push(...[32, 48, 39]);
indexes.push(...[38, 47, 46]);
indexes.push(...[44, 46, 25]);
indexes.push(...[41, 45, 27]);
indexes.push(...[38, 27, 45]);
indexes.push(...[15, 24, 44]);
indexes.push(...[23, 43, 48]);
indexes.push(...[16, 42, 43]);
indexes.push(...[15, 40, 42]);
indexes.push(...[13, 39, 41]);

  

  return [indexes, vertexPosition, vertexNormal];
  }  
    function startGL() 
    {
     // alert("StartGL");
      let canvas = document.getElementById("canvas3D"); //wyszukanie obiektu w strukturze strony 
      gl = canvas.getContext("experimental-webgl"); //pobranie kontekstu OpenGL'u z obiektu canvas
      gl.viewportWidth = canvas.width; //przypisanie wybranej przez nas rozdzielczości do systemu OpenGL
      gl.viewportHeight = canvas.height;
      
        //Kod shaderów
      const vertextShaderSource = ` //Znak akcentu z przycisku tyldy - na lewo od przycisku 1 na klawiaturze
        precision highp float;
        attribute vec3 aVertexPosition; 
        //attribute vec3 aVertexNormal;
        uniform mat4 uMMatrix;
        uniform mat4 uInvMMatrix;
        uniform mat4 uVMatrix;
        uniform mat4 uPMatrix;
        varying vec3 vPos;
        //varying vec3 vNormal;
        uniform float uNormalMul;
        void main(void) {
          vPos = vec3(uMMatrix * vec4(aVertexPosition, 1.0));
          gl_Position = uPMatrix * uVMatrix * vec4(vPos,1.0); //Dokonanie transformacji położenia punktów z przestrzeni 3D do przestrzeni obrazu (2D)
          //vNormal = normalize(mat3(uInvMMatrix) * uNormalMul*aVertexNormal); //Obrot wektorow normalnych
        }
      `;
      const fragmentShaderSource = `
        precision highp float;
        varying vec3 vPos;
        //varying vec3 vNormal;
        uniform sampler2D uSampler;
        uniform vec3 uLightPosition;
        uniform vec3 uColor;
        void main(void) {
          //vec3 lightDirection = normalize(uLightPosition - vPos);
          //float brightness = max(dot(vNormal,lightDirection), 0.0);
          //gl_FragColor = vec4(vColor,1.0); //Ustalenie stałego koloru wszystkich punktów sceny
          //gl_FragColor = texture2D(uSampler,vTexUV)*vec4(vColor,1.0); //Odczytanie punktu tekstury i przypisanie go jako koloru danego punktu renderowaniej figury
          //gl_FragColor = vec4((vNormal+vec3(1.0,1.0,1.0))/2.0,1.0); 
          //gl_FragColor = clamp(texture2D(uSampler,vTexUV) * vec4(brightness,brightness,brightness,1.0),0.0,1.0);
          //gl_FragColor = clamp(vec4(uColor,1.0) * vec4(brightness,brightness,brightness,1.0),0.0,1.0);
          gl_FragColor = clamp(vec4(uColor,1.0) ,0.0,1.0);
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
      
      //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
      let vertexPosition; //3 punkty po 3 składowe - X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 - 1 trójkąt
      let vertexNormal;
      let indexes;
  
      let vertexPosition2; //3 punkty po 3 składowe - X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 - 1 trójkąt
      let vertexNormal2;
      let indexes2;

      let vertexPosition3; //3 punkty po 3 składowe - X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 - 1 trójkąt
      let vertexNormal3;
      let indexes3;
      
      [indexes, vertexPosition, vertexNormal] = Block1();
      [indexes2, vertexPosition2, vertexNormal2] = Block2();
      [indexes3, vertexPosition3, vertexNormal3] = Block3();
      
      vertexPositionBuffer = gl.createBuffer(); //Stworzenie tablicy w pamieci karty graficznej
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW);
      vertexPositionBuffer.itemSize = 3; //zdefiniowanie liczby współrzednych per wierzchołek
      vertexPositionBuffer.numItems = vertexPosition.length/9; //Zdefinoiowanie liczby trójkątów w naszym buforze
      
      vertexNormalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormal), gl.STATIC_DRAW);
      vertexNormalBuffer.itemSize = 3;
      vertexNormalBuffer.numItems = vertexNormal.length/9;
      
      indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
      indexBuffer.numItems = indexes.length;
  
      vertexPositionBuffer2 = gl.createBuffer(); //Stworzenie tablicy w pamieci karty graficznej
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer2);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition2), gl.STATIC_DRAW);
      vertexPositionBuffer2.itemSize = 3; //zdefiniowanie liczby współrzednych per wierzchołek
      vertexPositionBuffer2.numItems = vertexPosition2.length/9; //Zdefinoiowanie liczby trójkątów w naszym buforze
      
      vertexNormalBuffer2 = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer2);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormal2), gl.STATIC_DRAW);
      vertexNormalBuffer2.itemSize = 3;
      vertexNormalBuffer2.numItems = vertexNormal2.length/9;
      
      indexBuffer2 = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer2);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes2), gl.STATIC_DRAW);
      indexBuffer2.numItems = indexes2.length;

      vertexPositionBuffer3 = gl.createBuffer(); //Stworzenie tablicy w pamieci karty graficznej
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer3);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition3), gl.STATIC_DRAW);
      vertexPositionBuffer3.itemSize = 3; //zdefiniowanie liczby współrzednych per wierzchołek
      vertexPositionBuffer3.numItems = vertexPosition3.length/9; //Zdefinoiowanie liczby trójkątów w naszym buforze
      
      vertexNormalBuffer3 = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer3);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormal3), gl.STATIC_DRAW);
      vertexNormalBuffer3.itemSize = 3;
      vertexNormalBuffer3.numItems = vertexNormal3.length/9;
      
      indexBuffer3 = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer3);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes3), gl.STATIC_DRAW);
      indexBuffer3.numItems = indexes3.length;
    
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
    var KameraPositionZ = -50.0;
    
    var Object1PositionX = -30.0;
    var Object1PositionY = -5.0;
    var Object1PositionZ = -2.0;
  
    var Object1AngleZ = 0.0;
  
    var Object2PositionX = 20.0;
    var Object2PositionY = -5.0;
    var Object2PositionZ = 15.0;
    
    var Object2AngleZ = 0.0;
  
    var Object3PositionX = -15.0;
    var Object3PositionY = -5.0;
    var Object3PositionZ = 5.0;
    
    var Object3AngleZ = 0.0;
  
    var Object4PositionX = 10.0;
    var Object4PositionY = -5.0;
    var Object4PositionZ = -8.0;
    
    var Object4AngleZ = 0.0;
  
    var Object5PositionX = -8.0;
    var Object5PositionY = -5.0;
    var Object5PositionZ = 10.0;
    
    var Object5AngleZ = 0.0;
  
    var Object6PositionX = 0.0;
    var Object6PositionY = -5.0;
    var Object6PositionZ = 9.0;
    
    var Object6AngleZ = 0.0;
  
    var Object7PositionX = 12.0;
    var Object7PositionY = -5.0;
    var Object7PositionZ = 15.0;
    
    var Object7AngleZ = 0.0;

    var Object8PositionX = -5.0;
    var Object8PositionY = -5.0;
    var Object8PositionZ = -10.0;
    
    var Object8AngleZ = 0.0;
    
    var LightSize = 0.1;
    var Object1Sizedx = 1.2;
    var Object1Sizedy = 1.2;
    var Object1Sizedz = 1.2;
  
    var Object2Sizedx = 1.0;
    var Object2Sizedy = 1.0;
    var Object2Sizedz = 1.0;
  
    var Object3Sizedx = 1.0;
    var Object3Sizedy = 1.0;
    var Object3Sizedz = 1.0;
  
    var Object4Sizedx = 1.4;
    var Object4Sizedy = 1.4;
    var Object4Sizedz = 1.4;
  
    var Object5Sizedx = 1.0;
    var Object5Sizedy = 1.0;
    var Object5Sizedz = 1.0;
  
    var Object6Sizedx = 1.0;
    var Object6Sizedy = 1.0;
    var Object6Sizedz = 1.0;
  
    var Object7Sizedx = 1.0;
    var Object7Sizedy = 1.0;
    var Object7Sizedz = 1.0;

    var Object8Sizedx = 1.3;
    var Object8Sizedy = 1.3;
    var Object8Sizedz = 1.3;
    
    var LightPositionX = 0;
    var LightPositionY = 0;
    var LightPositionZ = 3;
    
    
    function Tick()
    { 
      let uMMatrix0 = CreateIdentytyMatrix(); 
      let uMMatrix1 = CreateIdentytyMatrix();
      let uMMatrix2 = CreateIdentytyMatrix();
      let uMMatrix3 = CreateIdentytyMatrix();
      let uMMatrix4 = CreateIdentytyMatrix();
      let uMMatrix5 = CreateIdentytyMatrix();
      let uMMatrix6 = CreateIdentytyMatrix();
      let uMMatrix7 = CreateIdentytyMatrix();
      let uMMatrix8 = CreateIdentytyMatrix();
  
      
      let uVMatrix = CreateIdentytyMatrix();
      
      
      uVMatrix = MatrixMul(uVMatrix,CreateRotationXMatrix(angleX));
      uVMatrix = MatrixMul(uVMatrix,CreateRotationYMatrix(angleY));
      uVMatrix = MatrixMul(uVMatrix,CreateRotationZMatrix(angleZ));
      uVMatrix = MatrixMul(uVMatrix,CreateTranslationMatrix(0,0,KameraPositionZ));
  
      uMMatrix1 = MatrixMul(uMMatrix1,CreateScaleMatrix(Object1Sizedx,Object1Sizedy,Object1Sizedz));
      uMMatrix1 = MatrixMul(uMMatrix1,CreateTranslationMatrix(Object1Sizedx,0.0,0.0)); 
      uMMatrix1 = MatrixMul(uMMatrix1,CreateRotationZMatrix(Object1AngleZ));
      uMMatrix1 = MatrixMul(uMMatrix1,CreateTranslationMatrix(Object1PositionX,Object1PositionY,Object1PositionZ));  
  
      uMMatrix2 = MatrixMul(uMMatrix2,CreateScaleMatrix(Object2Sizedx,Object2Sizedy,Object2Sizedz));
      uMMatrix2 = MatrixMul(uMMatrix2,CreateTranslationMatrix(Object2Sizedx,0.0,0.0)); 
      uMMatrix2 = MatrixMul(uMMatrix2,CreateRotationZMatrix(Object2AngleZ));
      uMMatrix2 = MatrixMul(uMMatrix2,CreateTranslationMatrix(Object2PositionX,Object2PositionY,Object2PositionZ));  
  
      uMMatrix3 = MatrixMul(uMMatrix3,CreateScaleMatrix(Object3Sizedx,Object3Sizedy,Object3Sizedz));
      uMMatrix3 = MatrixMul(uMMatrix3,CreateTranslationMatrix(Object3Sizedx,0.0,0.0)); 
      uMMatrix3 = MatrixMul(uMMatrix3,CreateRotationZMatrix(Object3AngleZ));
      uMMatrix3 = MatrixMul(uMMatrix3,CreateTranslationMatrix(Object3PositionX,Object3PositionY,Object3PositionZ)); 
  
      uMMatrix4 = MatrixMul(uMMatrix4,CreateScaleMatrix(Object4Sizedx,Object4Sizedy,Object4Sizedz));
      uMMatrix4 = MatrixMul(uMMatrix4,CreateTranslationMatrix(Object4Sizedx,0.0,0.0)); 
      uMMatrix4 = MatrixMul(uMMatrix4,CreateRotationZMatrix(Object4AngleZ));
      uMMatrix4 = MatrixMul(uMMatrix4,CreateTranslationMatrix(Object4PositionX,Object4PositionY,Object4PositionZ)); 
  
      uMMatrix5 = MatrixMul(uMMatrix5,CreateScaleMatrix(Object5Sizedx,Object5Sizedy,Object5Sizedz));
      uMMatrix5 = MatrixMul(uMMatrix5,CreateTranslationMatrix(Object5Sizedx,0.0,0.0)); 
      uMMatrix5 = MatrixMul(uMMatrix5,CreateRotationZMatrix(Object5AngleZ));
      uMMatrix5 = MatrixMul(uMMatrix5,CreateTranslationMatrix(Object5PositionX,Object5PositionY,Object5PositionZ)); 
  
      uMMatrix6 = MatrixMul(uMMatrix6,CreateScaleMatrix(Object6Sizedx,Object6Sizedy,Object6Sizedz));
      uMMatrix6 = MatrixMul(uMMatrix6,CreateTranslationMatrix(Object6Sizedx,0.0,0.0)); 
      uMMatrix6 = MatrixMul(uMMatrix6,CreateRotationZMatrix(Object6AngleZ));
      uMMatrix6 = MatrixMul(uMMatrix6,CreateTranslationMatrix(Object6PositionX,Object6PositionY,Object6PositionZ)); 

      uMMatrix7 = MatrixMul(uMMatrix7,CreateScaleMatrix(Object7Sizedx,Object7Sizedy,Object7Sizedz));
      uMMatrix7 = MatrixMul(uMMatrix7,CreateTranslationMatrix(Object7Sizedx,0.0,0.0)); 
      uMMatrix7 = MatrixMul(uMMatrix7,CreateRotationZMatrix(Object7AngleZ));
      uMMatrix7 = MatrixMul(uMMatrix7,CreateTranslationMatrix(Object7PositionX,Object7PositionY,Object7PositionZ)); 

      uMMatrix8 = MatrixMul(uMMatrix8,CreateScaleMatrix(Object8Sizedx,Object8Sizedy,Object8Sizedz));
      uMMatrix8 = MatrixMul(uMMatrix8,CreateTranslationMatrix(Object8Sizedx,0.0,0.0)); 
      uMMatrix8 = MatrixMul(uMMatrix8,CreateRotationZMatrix(Object8AngleZ));
      uMMatrix8 = MatrixMul(uMMatrix8,CreateTranslationMatrix(Object8PositionX,Object8PositionY,Object8PositionZ)); 
  
      uMMatrix0 = MatrixMul(uMMatrix0,CreateScaleMatrix(LightSize,LightSize,LightSize));
      uMMatrix0 = MatrixMul(uMMatrix0,CreateTranslationMatrix(LightPositionX,LightPositionY,LightPositionZ));
      
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
      gl.uniform1f(gl.getUniformLocation(shaderProgram, "uNormalMul"),1.0);
      gl.uniform3f(gl.getUniformLocation(shaderProgram, "uLightPosition"),LightPositionX,LightPositionY,LightPositionZ);

      //Dom 1
      gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexPosition"));  //Przekazanie położenia
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
      gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexPosition"), vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
     
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix1));
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrix1)));
     gl.uniform3f(gl.getUniformLocation(shaderProgram, "uColor"),0.5,0.5,0.2);  
     gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix2));
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrix2)));
     gl.uniform3f(gl.getUniformLocation(shaderProgram, "uColor"),0.5,0.5,0.2);  
     gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix5));
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrix5)));
     gl.uniform3f(gl.getUniformLocation(shaderProgram, "uColor"),0.5,0.5,0.2);  
     gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  
  
      //Dom 2
      gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uPMatrix"), false, new Float32Array(uPMatrix)); //Wgranie macierzy kamery do pamięci karty graficznej
      gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uVMatrix"), false, new Float32Array(uVMatrix));
      gl.uniform1f(gl.getUniformLocation(shaderProgram, "uNormalMul"),1.0);
      gl.uniform3f(gl.getUniformLocation(shaderProgram, "uLightPosition"),LightPositionX,LightPositionY,LightPositionZ);
      
      gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexPosition"));  //Przekazanie położenia
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer2);
      gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexPosition"), vertexPositionBuffer2.itemSize, gl.FLOAT, false, 0, 0);
  
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer2);
  
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix3));
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrix3)));
     gl.uniform3f(gl.getUniformLocation(shaderProgram, "uColor"),0.4,0.4,0.5);  
     gl.drawElements(gl.TRIANGLES, indexBuffer2.numItems, gl.UNSIGNED_SHORT, 0);
  
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix4));
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrix4)));
     gl.uniform3f(gl.getUniformLocation(shaderProgram, "uColor"),0.4,0.4,0.5);  
     gl.drawElements(gl.TRIANGLES, indexBuffer2.numItems, gl.UNSIGNED_SHORT, 0);
  
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix6));
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrix6)));
     gl.uniform3f(gl.getUniformLocation(shaderProgram, "uColor"),0.4,0.4,0.5);  
     gl.drawElements(gl.TRIANGLES, indexBuffer2.numItems, gl.UNSIGNED_SHORT, 0);
      
    //Dom 3
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uPMatrix"), false, new Float32Array(uPMatrix)); //Wgranie macierzy kamery do pamięci karty graficznej
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uVMatrix"), false, new Float32Array(uVMatrix));
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "uNormalMul"),1.0);
    gl.uniform3f(gl.getUniformLocation(shaderProgram, "uLightPosition"),LightPositionX,LightPositionY,LightPositionZ);

    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexPosition"));  //Przekazanie położenia
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer3);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexPosition"), vertexPositionBuffer3.itemSize, gl.FLOAT, false, 0, 0);
  
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer3);

     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix7));
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrix7)));
     gl.uniform3f(gl.getUniformLocation(shaderProgram, "uColor"),0.5,0.3,0.0);  
     gl.drawElements(gl.TRIANGLES, indexBuffer3.numItems, gl.UNSIGNED_SHORT, 0);

     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix8));
     gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrix8)));
     gl.uniform3f(gl.getUniformLocation(shaderProgram, "uColor"),0.5,0.3,0.0);  
     gl.drawElements(gl.TRIANGLES, indexBuffer3.numItems, gl.UNSIGNED_SHORT, 0);

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
     if(e.keyCode==76) LightPositionX=LightPositionX+0.1;
     if(e.keyCode==74) LightPositionX=LightPositionX-0.1;
     if(e.keyCode==73) LightPositionY=LightPositionY+0.1;
     if(e.keyCode==75) LightPositionY=LightPositionY-0.1;
     if(e.keyCode==85) LightPositionZ=LightPositionZ+0.1;
     if(e.keyCode==79) LightPositionZ=LightPositionZ-0.1;
     
     //Z X
     if(e.keyCode==88) Object1AngleZ=Object1AngleZ-0.1;
     if(e.keyCode==90) Object1AngleZ=Object1AngleZ+0.1;
     
     //C V
     if(e.keyCode==67) Object2AngleZ=Object2AngleZ-0.1;
     if(e.keyCode==86) Object2AngleZ=Object2AngleZ+0.1;
     
     //B N
     if(e.keyCode==66) Object3AngleZ=Object3AngleZ-0.1;
     if(e.keyCode==78) Object3AngleZ=Object3AngleZ+0.1;
    }