var gl;
            function startGL()
            {
                alert("StartGL");
                let canvas = document.getElementById("canvas3D"); //wyszukanie obiektu
                gl = canvas.getContext("experimental-webgl"); //pobranie kontekstu OpenGL z obiektu
                gl.viewportWidth = canvas.width;
                gl.viewportHeight = canvas.height;

                //Tworzenie shaderów
                const vertexShaderSource = `
                    attribute vec3 aVertexPosition;
                    uniform mat4 uMVMatrix;
                    uniform mat4 uPMatrix;
                    void main(void)
                    {
                        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); //transformacja położenia punktów z przestrzeni 3D do przestrzeni 2D
                    }
                `;

                const fragmentShaderSource = `
                    void main(void)
                    {
                        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); //ustalenie stałego koloru wszystkich punktów sceny
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

                let shaderProgram = gl.createProgram(); //stworzenie obiektu programu
                gl.attachShader(shaderProgram, vertexShader); //podpięcie shaderów do programu wykonywanego na GPU
                gl.attachShader(shaderProgram, fragmentShader);
                gl.linkProgram(shaderProgram);

                if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) alert("Could not initialize shaders"); //sprawdzenie błędów kompilacji

                //Położenie wierzchołków
                let vertexPosition = [
                    //pion
                    -1.0, +1.0, 0.0,   -0.5, +1.0, 0.0,    -0.5, -1.0, 0.0, //1
                    -1.0, +1.0, 0.0,   -1.0, -1.0, 0.0,   -0.5, -1.0, 0.0, //2
                    //gorna kreska
                    -0.5, 0.25, 0.0,    +0.25, +1.0, 0.0,   -0.5, -0.25, 0.0, //3
                    +0.25, +1.0, 0.0,   -0.5, -0.25, 0.0,   +0.25, +0.5, 0.0, //4
                    //dolna kreska
                    -0.5, -0.25, 0.0,   -0.25, 0.0, 0.0,    +0.25, -1.0, 0.0, //5
                    +0.25, -1.0, 0.0,   -0.25, 0.0, 0.0,    +0.25, -0.5, 0.0 //6
                ]

                //Wgranie danych do GPU
                let vertexPositionBuffer = gl.createBuffer(); //stworzenie bufora tablicy w pamięci GPU
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW); //do bufora tablicy wrzucamy tablicę wierzchołków, która służć będzie do rysowania statycznego obiektu
                vertexPositionBuffer.itemSize = 3; //zdefiniowanie liczby współrzędnych na wierzchołek, 3D więc 3
                vertexPositionBuffer.numItems = 12; //zdefiniowanie liczby punktów w buforze
            
                //Kamera
                let aspect = gl.viewportWidth/gl.viewportHeight;
                let fov = 45.0 * Math.PI / 180; //określenie pola widzenia
                let zFar = 100.0; //określenie zakresów renderowania sceny 3D
                let zNear = 0.1;

                let uPMatrix = [
                    1.0/(aspect*Math.tan(fov/2)),   0,                      0,  0,
                    0,                              1.0/(Math.tan(fov/2)),  0,                              0, 
                    0,                              0,                      -(zFar+zNear)/(zFar-zNear),     -1,
                    0,                              0,                      -(2*zFar*zNear)/(zFar-zNear),   0
                ]; //macierz projekcji

                let angle = 45.0; //macierz transformacji świata - położenie kamery
                let uMVMatrix = [
                    Math.cos(angle*Math.PI/180.0),  -Math.sin(angle*Math.PI/180.0), Math.sin(angle*Math.PI/180.0),  0, //macierz rotacji
                    Math.sin(angle*Math.PI/180.0),  Math.cos(angle*Math.PI/180.0),  Math.cos(angle*Math.PI/180.0),  0,
                    0,0,1,0,
                    0,0,-10,1 //położenie kamery
                ];

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

                gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania
            }