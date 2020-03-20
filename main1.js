/* 
* width and height are the overall width and height we have to work with, displace is
* the maximum deviation value. This stops the terrain from going out of bounds if we choose
*/
function terrain(width, height, displace, roughness) {
    var points = [],
    // Gives us a power of 2 based on our width
    power = Math.pow(2, Math.ceil(Math.log(width) / (Math.log(2))));
     
    // Set the initial left point
    points[0] = height/2 + (Math.random()*displace*2) - displace;
    // set the initial right point
    points[power] = height/2 + (Math.random()*displace*2) - displace;
    displace *= roughness;
     
    // Increase the number of segments
    for(var i = 1; i < power; i *=2){
        // Iterate through each segment calculating the center point
        for(var j = (power/i)/2; j < power; j+= power/i){
            points[j] = ((points[j - (power / i) / 2] + points[j + (power / i) / 2]) / 2);
            points[j] += (Math.random()*displace*2) - displace
        }
        // reduce our random range
        displace *= roughness;
    }    
    return points;
}

var canvas = document.getElementById("screen"),
    ctx = canvas.getContext("2d"),
    width = 512,
    height = 200;

canvas.width = width;
canvas.height = height;

// get the points
var terPoints = terrain(width, height, height / 4, 0.6);

// draw the points
ctx.fillStyle = "#999";
ctx.beginPath();
ctx.moveTo(0, terPoints[0]);
for (var t = 1; t < terPoints.length; t++) {
    ctx.lineTo(t, terPoints[t]);
}
// finish creating the rect so we can fill it
ctx.lineTo(canvas.width, canvas.height);
ctx.lineTo(0, canvas.height);
ctx.closePath();
ctx.fill();