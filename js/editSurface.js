
function initIntervalRoughness(sphereVertices){
  var values = [];
  for (var i = 0; i < sphereVertices.length; i++){
    if(Math.random() < 0.5){
      values.push(-1);
    } else {
      values.push(1);
    }
  }
  return values;
}

function initSpectrumRoughness(sphereVertices){
  var values = [];
  for(var i = 0; i < sphereVertices.length; i++){
    values.push(Math.random() * 2 - 1);
  }
  return values;
}

function initWorleyNoisePoints(numPoints = 300){
  var randPoints = [];

  for(var i = 0; i < numPoints; i++){
    var x, y, z;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      z = Math.random() * 2 - 1;
    } while(x*x + y*y + z*z > 1);
    randPoints.push((new THREE.Vector3(x, y, z)).normalize());
  }
  return randPoints;
}

function initWorleyNoise1(sphereVertices, randPoints = []){
  var radius = sphereVertices[0].length();
  if(randPoints.length == 0){
    randPoints = initWorleyNoisePoints();
  }
  values = [];
  for (var i = 0; i < sphereVertices.length; i++){
    var minDist = 2 * radius;
    for(var j = 0; j < randPoints.length; j++){
      var pointDist = sphereVertices[i].clone().normalize().distanceTo(randPoints[j]);
      minDist = Math.min(minDist, pointDist);
    }
    values.push(minDist);
  }
  return values;
}

function initWorleyNoise2(sphereVertices, randPoints = []){
  var radius = sphereVertices[0].length();
  if(randPoints.length == 0){
    randPoints = initWorleyNoisePoints();
  }
  values = [];
  for (var i = 0; i < sphereVertices.length; i++){
    var minDist1 = 2 * radius;
    var minDist2 = 2 * radius;
    for(var j = 0; j < randPoints.length; j++){
      var pointDist = sphereVertices[i].clone().normalize().distanceTo(randPoints[j]);
      if (minDist1 > pointDist){
        minDist2 = minDist1;
        minDist1 = pointDist;
      } else if (minDist2 > pointDist){
        minDist2 = pointDist;
      }
    }
    values.push(minDist2 - minDist1);
  }
  return values;
}

function initWorleyNoise(sphereVertices, randPoints = null, dimension = 1){
  if (! randPoints){
    randPoints = initWorleyNoisePoints();
  }
  values = [];
  for(var i = 0; i < sphereVertices.length; i++){
    var pointDist = new Array(dimension + 1);
    pointDist.fill(2);
    for(var j = 0; j < randPoints.length; j++){
      var currDist = sphereVertices[i].distanceTo(randPoints[j]);
      var k = pointDist.length - 2;
      while(k >= 0 && currDist < pointDist[k]){
        pointDist[k+1] = pointDist[k];
        pointDist[k] = currDist;
        k--;
      }
    }
    var total = 0;
    for(var l = dimension - 1; l >= 0; l--){
      total += pointDist * Math.pow(-1, l + 1);
    }
    values.push(total);
  }
  return values;
}

function initPerlinNoiseVectors(gridSize){
  function monteCarlo(){
    var x,y,z,len;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      z = Math.random() * 2 - 1;
      len = Math.sqrt(x*x + y*y + z*z);
    } while ( len > 1);
    return {'x' : x/len, 'y' : y/len, 'z' : z/len};
  }

  var grid = [];
  for (var i = 0; i < gridSize; i++){
    grid.push([]);
    for (var j = 0; j < gridSize; j++){
      grid[i].push([]);
      for (var k = 0; k < gridSize; k++){
        grid[i][j]
        grid[i][j].push(monteCarlo());
      }
    }
  }
  console.log('Made Vectors');
  console.log(grid);
  return grid;
}

function initPerlinNoise(sphereVertices, vectorGrid = []){
  function dot(v1, v2){
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }
  function distVec(v1x, v1y, v1z, v2x, v2y, v2z){
    return {'x' : v2x - v1x, 'y' : v2y - v1y, 'z' : v2z - v1z};
  }
  function smoothstepLerp(a, b, alpha){
    var w;
    if (alpha < 0){ w = a; }
    else if (alpha > 1){ w = b; }
    else { w = 3 * alpha * alpha - 2 * alpha * alpha * alpha; }
    return a * (1 - w) + b * w;
  }

  if (vectorGrid.length < 2){
    vectorGrid = initPerlinNoiseVectors(5);
  }

  var cells = vectorGrid.length - 1;
  var radius = sphereVertices[0].length();
  var scalars = [];

  for (var i = 0; i < sphereVertices.length; i++){
    var x = ((sphereVertices[i].x / radius) + 1)/2 * cells;
    var y = ((sphereVertices[i].y / radius) + 1)/2 * cells;
    var z = ((sphereVertices[i].z / radius) + 1)/2 * cells;

    var x0 = Math.floor(x);
    var x1 = (x0 + 1) % cells;
    var y0 = Math.floor(y);
    var y1 = (y0 + 1) % cells;
    var z0 = Math.floor(z);
    var z1 = (z0 + 1) % cells;

    var sx = x - x0;
    var sy = y - y0;
    var sz = z - z0;

    var n000 = dot(distVec(sx, sy, sz, 0, 0, 0), vectorGrid[x0][y0][z0]);
    var n001 = dot(distVec(sx, sy, sz, 0, 0, 1), vectorGrid[x0][y0][z1]);
    var n010 = dot(distVec(sx, sy, sz, 0, 1, 0), vectorGrid[x0][y1][z0]);
    var n011 = dot(distVec(sx, sy, sz, 0, 1, 1), vectorGrid[x0][y1][z1]);
    var n100 = dot(distVec(sx, sy, sz, 1, 0, 0), vectorGrid[x1][y0][z0]);
    var n101 = dot(distVec(sx, sy, sz, 1, 0, 1), vectorGrid[x1][y0][z1]);
    var n110 = dot(distVec(sx, sy, sz, 1, 1, 0), vectorGrid[x1][y1][z0]);
    var n111 = dot(distVec(sx, sy, sz, 1, 1, 1), vectorGrid[x1][y1][z1]);

    var n00 = smoothstepLerp(n000, n001, sz);
    var n01 = smoothstepLerp(n010, n011, sz);
    var n10 = smoothstepLerp(n100, n101, sz);
    var n11 = smoothstepLerp(n110, n111, sz);

    var n0 = smoothstepLerp(n00, n01, sy);
    var n1 = smoothstepLerp(n10, n11, sy);

    var n = smoothstepLerp(n0, n1, sx);

    scalars.push(n);
  }
  return scalars;
}

function applyTexture(planetVertices, values, intensity){
  var newVertices = [];
  var minHeight = 100;
  var maxHeight = 0;
  for (var i = 0; i < planetVertices.length; i++){
    var v = planetVertices[i].multiplyScalar(1 + values[i]*intensity);
    minHeight = Math.min(v.length(), minHeight);
    maxHeight = Math.max(v.length(), maxHeight);
    newVertices.push(v);
  }
  return {'vertices' : newVertices, 'min' : minHeight, 'max' : maxHeight};
}

function removeTexture(panetVertices, values, intensity){
  var newVertices = [];
  for(var i = 0; i < planetVertices.length; i++){
    newVertices.push(planetVertices[i].clone().multiplyScalar(1/(1 + values[i]*intensity)));
  }
  return newVertices;
}
