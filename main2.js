var canvas = document.getElementById("screen"),
    ctx = canvas.getContext("2d"),
    width = 512,
    height = 200;

canvas.width = width;
canvas.height = height;

/* 
 * width and height are the overall width and height we have to work with, displace is
 * the maximum deviation value. This stops the terrain from going out of bounds if we choose
 * a seed portion is added so we can seed the start and end section with values for scrolling
 */

function terrain(width, height, displace, roughness, seed) {
    var points = [],
    // Gives us a power of 2 based on our width
    power = Math.pow(2, Math.ceil(Math.log(width) / (Math.log(2)))),
    seed = seed || {
        s: height / 2 + (Math.random() * displace * 2) - displace,
        e: height / 2 + (Math.random() * displace * 2) - displace
    };

    // Set the initial left point
    if(seed.s === 0){
        seed.s = height / 2 + (Math.random() * displace * 2) - displace;
    }
    points[0] = seed.s;
    
    // set the initial right point
    if(seed.e === 0){
        seed.e = height / 2 + (Math.random() * displace * 2) - displace
    }
    points[power] = seed.e;
    
    displace *= roughness;

    // Increase the number of segments
    for (var i = 1; i < power; i *= 2) {
        // Iterate through each segment calculating the center point
        for (var j = (power / i) / 2; j < power; j += power / i) {
            points[j] = ((points[j - (power / i) / 2] + points[j + (power / i) / 2]) / 2);
            points[j] += (Math.random() * displace * 2) - displace
        }
        // reduce our random range
        displace *= roughness;
    }
    return points;
}

// get the points
var terPoints = terrain(width, height, height / 4, 0.6),
    terPoints2 = terrain(width, height, height / 4, 0.6, {s : terPoints[terPoints.length-1], e : 0});

var offset = 0;

function scrollTerrain() {
    ctx.clearRect(0, 0, width, height);
    offset -= 3;
    
    // draw the first half
    ctx.fillStyle = "#999";
    ctx.beginPath();
    ctx.moveTo(offset, terPoints[0]);
    for (var t = 0; t < terPoints.length; t++) {
        ctx.lineTo(t + offset, terPoints[t]);
    }

    for (t = 0; t < terPoints2.length; t++) {
        ctx.lineTo(width+offset + t, terPoints2[t]);
    }
    
    // finish creating the rect so we can fill it
    ctx.lineTo(width + offset+t, canvas.height);
    ctx.lineTo(offset, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    /* 
    * if the number of our points on the 2nd array is less than or equal to our screen width     
    * we reset the offset to 0, copy terpoints2 to terpoints, 
    * and gen a new set of points for terpoints 2
    */
    if(terPoints2.length-1 + width + offset <= width) {
        terPoints = terPoints2;
        terPoints2 = terrain(width, height, height / 4, 0.6, {s : terPoints[terPoints.length-1], e : 0});
        offset = 0;
    }
    
    requestAnimationFrame(scrollTerrain);
}

scrollTerrain();