
// Starts with Icosahedron
function getSphere1(divisions, radius = 1){
  // console.log("getSphere called");
  var ico = getIcosahedron();
  // console.log("Icosahedron made");
  var subdivision = subdivideSides(divisions, ico.vertices, ico.faces);
  // console.log("Icosahedron split");
  var sphereVertices = projectToSphere(subdivision.vertices, radius);
  // console.log("Projected to sphere");
  return{'vertices' : sphereVertices, 'faces' : subdivision.faces, 'radius':radius};
  // return{'vertices' : subdivision.vertices, 'faces' : subdivision.faces};
}

// Starts with Tetrahedron
function getSphere2(divisions, radius = 1){
  // console.log("getSphere called");
  var pyramid = getPyramid();
  // console.log("Pyramid made");
  var subdivision = subdivideSides(divisions, pyramid.vertices, pyramid.faces);
  // console.log("Pyramid split");
  var sphereVertices = projectToSphere(subdivision.vertices, radius);
  // console.log("Projected to sphere");
  return{'vertices' : sphereVertices, 'faces' : subdivision.faces};
  // return{'vertices' : subdivision.vertices, 'faces' : subdivision.faces};
}

function getIcosahedron(){
  var t = (1.0 + Math.sqrt(5.0))*0.5;

  var vertices = [
		new THREE.Vector3(-1,  t,  0), new THREE.Vector3(1, t, 0), new THREE.Vector3(-1, -t,  0), new THREE.Vector3( 1, -t,  0),
		new THREE.Vector3( 0, -1,  t), new THREE.Vector3(0, 1, t), new THREE.Vector3( 0, -1, -t), new THREE.Vector3( 0,  1, -t),
		new THREE.Vector3( t,  0, -1), new THREE.Vector3(t, 0, 1), new THREE.Vector3(-t,  0, -1), new THREE.Vector3(-t,  0,  1)
	];

  var faces = [
		new THREE.Face3(0, 11,  5), new THREE.Face3(0,  5,  1), new THREE.Face3( 0,  1,  7), new THREE.Face3( 0,  7, 10), new THREE.Face3(0, 10, 11),
		new THREE.Face3(1,  5,  9), new THREE.Face3(5, 11,  4), new THREE.Face3(11, 10,  2), new THREE.Face3(10,  7,  6), new THREE.Face3(7,  1,  8),
		new THREE.Face3(3,  9,  4), new THREE.Face3(3,  4,  2), new THREE.Face3( 3,  2,  6), new THREE.Face3( 3,  6,  8), new THREE.Face3(3,  8,  9),
		new THREE.Face3(4,  9,  5), new THREE.Face3(2,  4, 11), new THREE.Face3( 6,  2, 10), new THREE.Face3( 8,  6,  7), new THREE.Face3(9,  8,  1)
	];

  for(f in faces){ f.color = new THREE.Color(0x666666); }

  return{'vertices' : vertices, 'faces' : faces};
}

function getPyramid(){
  var vertices = [
    new THREE.Vector3(  1,  1,  1), new THREE.Vector3( -1, -1,  1),
    new THREE.Vector3( -1,  1, -1), new THREE.Vector3(  1, -1, -1)
  ];

  var faces = [
    new THREE.Face3(0,1,2), new THREE.Face3(1,3,2),
    new THREE.Face3(0,3,1), new THREE.Face3(2,3,0)
  ];

  for(f in faces){ f.color = new THREE.Color(0x666666); }

  return{'vertices' : vertices, 'faces' : faces};
}

function getTriangle(){
  var vertices = [
    new THREE.Vector3(0,0,0), new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,1)
  ];
  var faces = [
    new THREE.Face3(0,1,2)
  ];

  for(f in faces){ f.color = new THREE.Color(0x666666); }

  return{'vertices' : vertices, 'faces' : faces};
}

function subdivideSides(divisions, vertices, faces){
  var newVertices = [];
  var newFaces = [];

  // Function based off function from COSC 77, Wojciech Jarosz, Dartmouth College, 2018
  var edges = {};
  function getOrInsertEdge(a, b, centroid){
    var edgekey;
    if (a < b){
      edgekey = a + ":" + b;
    } else {
      edgekey = b + ":" + a;
    }

    // console.log(edgekey);

    if (edgekey in edges){
      // console.log("in");
      // console.log(edges[edgekey])
      return edges[edgekey];
    } else {
      // console.log("not");
      var idx = newVertices.length;
      newVertices.push(centroid);
      edges[edgekey] = idx;
      // console.log(idx);
      return idx;
    }
  }

  // Limits divisions
  if(divisions <= 0){
    return{'vertices' : vertices, 'faces' : faces};
  }

  // Otherwise...
  // Copy old vertices
  for(var i = 0; i < vertices.length; i++){
    newVertices.push(vertices[i].clone());
  }

  // Insert centroid of each old edge
  for(var i = 0; i < faces.length; i++){
    var v0 = faces[i].a;
    var v1 = faces[i].b;
    var v2 = faces[i].c;
    var c01 = getOrInsertEdge(v0, v1, (new THREE.Vector3(0,0,0)).lerpVectors(vertices[v0], vertices[v1], .5));
    var c12 = getOrInsertEdge(v1, v2, (new THREE.Vector3(0,0,0)).lerpVectors(vertices[v1], vertices[v2], .5));
    var c20 = getOrInsertEdge(v2, v0, (new THREE.Vector3(0,0,0)).lerpVectors(vertices[v2], vertices[v0], .5));

    // console.log(v0, v1, v2, c01, c12, c20);

    newFaces.push(new THREE.Face3(v0, c01, c20));
    newFaces.push(new THREE.Face3(v1, c12, c01));
    newFaces.push(new THREE.Face3(v2, c20, c12));
    newFaces.push(new THREE.Face3(c01, c12, c20));
  }

  var nextDivision = subdivideSides(divisions - 1, newVertices, newFaces);
  return{'vertices' : nextDivision.vertices, 'faces' : nextDivision.faces};
}

// Projects vertices onto a sphere
function projectToSphere(vertices, radius = 1){
  var sphereVertices = [];
  for(var i = 0; i < vertices.length; i++){
    sphereVertices.push(vertices[i].normalize().multiplyScalar(radius));
  }
  return sphereVertices;
}
