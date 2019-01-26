
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

function initWorleyNoisePoints1(sphereVertices, numPoints = 300){
  var randPoints = [];

  for (var i = 0; i < numPoints; i++){
    var randPoint = sphereVertices[Math.floor(Math.random() * sphereVertices.length)].clone().normalize();
    randPoints.push(randPoint);
  }
  return randPoints;
}

function initWorleyNoise1(sphereVertices, randPoints = []){
  var radius = sphereVertices[0].length();
  if(randPoints.length == 0){
    //randPoints = initWorleyNoisePoints1(sphereVertices);
    randPoints = initWorleyNoisePoints();
    // console.log('made up points');
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

function applyTexture(planetVertices, values, intensity){
  var newVertices = [];
  for (var i = 0; i < planetVertices.length; i++){
    newVertices.push(planetVertices[i].multiplyScalar(1 + values[i]*intensity));
  }
  return newVertices;
}

function removeTexture(panetVertices, values, intensity){
  var newVertices = [];
  for(var i = 0; i < planetVertices.length; i++){
    newVertices.push(planetVertices[i].clone().multiplyScalar(1/(1 + values[i]*intensity)));
  }
  return newVertices;
}
