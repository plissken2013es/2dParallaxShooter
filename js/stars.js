var Stars = {
    Defaults: {
        dx:         -2,
        dy:         0,
        maxspeed:   10,
        layers: [
            { percent:  30, size: { min: 0.4, max: 1.0 }, speed: { min:   1, max:   2 }, colors: ['#111', '#111', '#811'] }, // 1 in 3 get a tint of red
            { percent:  25, size: { min: 0.6, max: 1.2 }, speed: { min:   2, max:   4 }, colors: ['#333', '#333', '#833'] }, // 1 in 3 get a tint of red
            { percent:  15, size: { min: 0.8, max: 1.4 }, speed: { min:   4, max:   8 }, colors: ['#555', '#555', '#855'] }, // 1 in 3 get a tint of red
            { percent:  15, size: { min: 1.0, max: 1.6 }, speed: { min:   8, max:  16 }, colors: ['#777'] },
            { percent:   8, size: { min: 1.2, max: 1.8 }, speed: { min:  16, max:  32 }, colors: ['#999'] },
            { percent:   4, size: { min: 1.4, max: 2.0 }, speed: { min:  32, max:  64 }, colors: ['#BBB'] },
            { percent:   2, size: { min: 1.6, max: 2.2 }, speed: { min:  64, max: 128 }, colors: ['#DDD'] },
            { percent:   1, size: { min: 1.8, max: 2.4 }, speed: { min: 128, max: 256 }, colors: ['#FFF'] }
        ]
    },
    
    initialize: function(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.initLayers(this.Defaults.layers);
        this.initStars();
    },
    
    initLayers: function(layers) {
        var n, sum = 0, l;
        for (n = 0; n < layers.length; n++) {
            l = layers[n];
            l.min = sum;
            l.max = sum + l.percent;
            sum = l.max;
        }
        
        this.layers = layers;
    },
    
    initStars: function() {
        var n, layer, count = this.canvas.height / 2;
        this.stars = [];
        for (n = 0; n < count; n++) {
            layer = this.randomLayer();
            this.stars.push({
                layer:  layer,
                color:  this.randomChoice(layer.colors),
                speed:  this.random(layer.speed.min, layer.speed.max),
                size:   this.random(layer.size.min, layer.size.max),
                x:      this.random(0, this.canvas.width),
                y:      this.random(0, this.canvas.height)
            });
        }
    },
    
    update: function(dt) {
        var star, n, max = this.stars.length;
        for (n = 0; n < max; n++) {
            star = this.stars[n];
            star.x += this.Defaults.dx * star.speed * dt;
            star.y += this.Defaults.dy * star.speed * dt;
            if ((star.x < 0) || (star.y <0) || (star.x > this.canvas.width) || (star.y > this.canvas.height)) {
                this.repositionStar(star);
            }
        }
    },
    
    setDy: function(dy) {
        this.Defaults.dy = dy;
    },
    
    draw: function() {
        var star, n;
        for (n = 0; n < this.stars.length; n++) {
            star = this.stars[n];
            this.ctx.fillStyle = star.color;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, 2*Math.PI, true);
            this.ctx.fill();
            this.ctx.closePath();
        }
    },
    
    repositionStar: function(star) {
        var horizontal = (this.Defaults.dy == 0);
        var vertical = (this.Defaults.dx == 0);
        var width = this.canvas.width;
        var height = this.canvas.height;
        if (horizontal || (!horizontal && !vertical && this.randomBool())) {
            star.x = (this.Defaults.dx > 0) ? 0 : width;
            star.y = this.random(0, height);
        } else {
            star.x = this.random(0, width);
            star.y = (this.Defaults.dy > 0) ? 0 : height;
        }
    },
    
    randomLayer: function() {
        var i, n = this.random(1, 100);
        for (i = 0; i < this.layers.length; i++) {
            if (n <= this.layers[i].max) {
                return this.layers[i];
            }
        }
    },
    
    randomChoice: function(choices) {
        return choices[Math.round(this.random(0, choices.length-1))];
    },
    
    randomBool: function() {
        return this.randomChoice([true, false]);
    },
            
    random: function(min, max) {
        return (min + (Math.random() * (max - min)));
    }
};