  (function () {
      var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
              window.setTimeout(callback, 1000 / 60);
          };
      window.requestAnimationFrame = requestAnimationFrame;

  // Terrain stuff.
  var background = document.getElementById("screen"),
      bgCtx = background.getContext("2d"),
      width = window.innerWidth,
      height = document.body.offsetHeight;

  (height < 400) ? height = 400 : height;
  //height = (height < 400) ? 400 : height;  // same shit

  background.width = width;
  background.height = height;

  function Terrain(options) {
      options = options || {};
      this.terrain = document.createElement("canvas");
      this.terCtx = this.terrain.getContext("2d");
      this.scrollDelay = options.scrollDelay || 90;
      this.lastScroll = new Date().getTime();

      this.terrain.width = width;
      this.terrain.height = height;
      this.fillStyle = options.fillStyle || "#191D4C";
      this.mHeight = options.mHeight || height;
      
      this.zIndex = options.zIndex | 0;

      // generate
      this.points = [];

      var displacement = options.displacement || 140,
          power = Math.pow(2, Math.ceil(Math.log(width) / (Math.log(2))));

      // set the start height and end height for the terrain
      this.points[0] = this.mHeight;//(this.mHeight - (Math.random() * this.mHeight / 2)) - displacement;
      this.points[power] = this.points[0];

      // create the rest of the points
      for (var i = 1; i < power; i *= 2) {
          for (var j = (power / i) / 2; j < power; j += power / i) {
              this.points[j] = ((this.points[j - (power / i) / 2] + this.points[j + (power / i) / 2]) / 2) + Math.floor(Math.random() * -displacement + displacement);
          }
          displacement *= 0.6;
      }

      document.body.appendChild(this.terrain);
  }

  Terrain.prototype.update = function () {
      // draw the terrain
      this.terCtx.clearRect(0, 0, width, height);
      this.terCtx.fillStyle = this.fillStyle;
      
      if (new Date().getTime() > this.lastScroll + this.scrollDelay) {
          this.lastScroll = new Date().getTime();
          
          var speedo = (speed / SPEED_LIMIT * 8) | 0;
          speedo -= (this.zIndex/2) | 0;
        this.points.push(this.points.shift());
        for (var q=0; q<speedo; q++) {
            this.points.push(this.points.shift());
        }
      }

      var offsetY = -mouseY / (10 + this.zIndex*2);
      
      this.terCtx.beginPath();
      for (var i = 0; i <= width; i++) {
          if (i === 0) {
              this.terCtx.moveTo(0, this.points[0] + offsetY);
          } else if (this.points[i] !== undefined) {
              this.terCtx.lineTo(i, this.points[i] + offsetY);
          }
      }

      this.terCtx.lineTo(width, this.terrain.height);
      this.terCtx.lineTo(0, this.terrain.height);
      this.terCtx.lineTo(0, this.points[0] + offsetY);
      this.terCtx.fill();
  }


  // Second canvas used for the stars
  bgCtx.fillStyle = '#05004c';
  bgCtx.fillRect(0, 0, width, height);

  // stars
  function Star(options) {
      this.size = Math.random() * 2;
      this.speed = Math.random() * .05;
      this.x = options.x;
      this.y = options.y;
  }

  Star.prototype.reset = function () {
      this.size = Math.random() * 2;
      this.speed = Math.random() * .05;
      this.x = width;
      this.y = Math.random() * height;
  }

  Star.prototype.update = function () {
      this.x -= this.speed * speed;
      if (this.x < 0) {
          this.reset();
      } else {
          bgCtx.fillRect(this.x, this.y, this.size, this.size);
      }
  }

  function ShootingStar() {
      this.reset();
  }

  ShootingStar.prototype.reset = function () {
      this.x = Math.random() * width;
      this.y = 0;
      this.len = (Math.random() * 80) + 10;
      this.speed = (Math.random() * 10) + 6;
      this.size = (Math.random() * 1) + 0.1;
      // this is used so the shooting stars arent constant
      this.waitTime = new Date().getTime() + (Math.random() * 3000) + 500;
      this.active = false;
  }

  ShootingStar.prototype.update = function () {
      if (this.active) {
          this.x -= this.speed;
          this.y += this.speed;
          if (this.x < 0 || this.y >= height) {
              this.reset();
          } else {
              bgCtx.lineWidth = this.size;
              bgCtx.beginPath();
              bgCtx.moveTo(this.x, this.y);
              bgCtx.lineTo(this.x + this.len, this.y - this.len);
              bgCtx.stroke();
          }
      } else {
          if (this.waitTime < new Date().getTime()) {
              this.active = true;
          }
      }
  }
  
    resources.load([
        "img/sprites.png"
    ]);
    resources.onReady(animate);
      
    var player = {
        pos: [width/2, height/2],
        sprite: new Sprite("img/sprites.png", [0, 0], [39, 39], 16, [0, 1]) 
    };
      
    var bullets = [], entities = [], mouseX = 0, mouseY = 0, speed = 1, SPEED_LIMIT = 30, playerSpeed = 350, bulletSpeed = 500;
    var now, lastTime = Date.now(), lastFire = Date.now();

  // init the stars
  for (var i = 0; i < height*4; i++) {
      entities.push(new Star({
          x: Math.random() * width,
          y: Math.random() * height
      }));
  }

  // Add 2 shooting stars that just cycle.
    entities.push(new ShootingStar());
    entities.push(new ShootingStar());
    entities.push(new Terrain({mHeight : (height/2)-120, zIndex: 12}));
    entities.push(new Terrain({displacement : 120, scrollDelay : 50, fillStyle : "rgb(17,20,40)", mHeight : (height/2)-60 , zIndex: 7}));
    entities.push(new Terrain({displacement : 100, scrollDelay : 20, fillStyle : "rgb(10,10,5)", mHeight : height/2, zIndex: 0}));

    // Add player canvas
      var playerCanvas = document.createElement("canvas"), playerCtx = playerCanvas.getContext("2d");
      playerCanvas.width = width;
      playerCanvas.height = height;
      document.body.appendChild(playerCanvas);
      
    //animate background
    function animate() {
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;
        
        mouseX = player.pos[0];
        mouseY = player.pos[1];
        
        
        bgCtx.fillStyle = '#110E19';
        bgCtx.fillRect(0, 0, width, height);
        bgCtx.fillStyle = '#ffffff';
        bgCtx.strokeStyle = '#ffffff';

        var entLen = entities.length;
        speed = (mouseX / width * SPEED_LIMIT) | 0;

        while (entLen--) {
            entities[entLen].update();
        }
        
        updatePlayer(dt);
        lastTime = now;
        
        playerCtx.clearRect(0, 0, width, height);
        playerCtx.fillStyle = "#fff";
        playerCtx.font = "16px Arial, sans";
        playerCtx.textAlign = "center";
        playerCtx.fillText("ARROW KEYS to move, SPACE to fire weapons", width/2, 50);
        
        renderEntity(player, playerCtx);
        renderEntities(bullets, playerCtx);
        
        
        requestAnimationFrame(animate);
    }
      
    function updatePlayer(dt) {
        handleInput(dt);
        
        // Update the player sprite animation
        player.sprite.update(dt);

        // Update all the bullets
        for (var i=0; i<bullets.length; i++) {
            var bullet = bullets[i];

            switch(bullet.dir) {
                case "up": 
                    bullet.pos[1] -= bulletSpeed * dt;
                    break;
                case "down":
                    bullet.pos[1] += bulletSpeed * dt;
                    break;
                default:
                    bullet.pos[0] += bulletSpeed * dt;
            }

            if (bullet.pos[1] < 0 || bullet.pos[1] > height ||
                bullet.pos[0] > width) {
                pool.removeBullet(bullets, i);
                i--;
            }
        }
    }
      
    function renderEntities(list, ctx) {
        for (var i=0; i<list.length; i++) {
            renderEntity(list[i], ctx);
        }
    }

    function renderEntity(entity, ctx) {
        ctx.save();
        ctx.translate(entity.pos[0], entity.pos[1]);
        entity.sprite.render(ctx);
        ctx.restore();
    }
      
    function handleInput(dt) {
        if (input.isDown("DOWN") || input.isDown("s")) {
            player.pos[1] += playerSpeed * dt;
        }

        if (input.isDown("UP") || input.isDown("w")) {
            player.pos[1] -= playerSpeed * dt;
        }

        if (input.isDown("LEFT") || input.isDown("a")) {
            player.pos[0] -= playerSpeed * dt;
        }

        if (input.isDown("RIGHT") || input.isDown("d")) {
            player.pos[0] += playerSpeed * dt;
        }

        if (input.isDown("SPACE") &&
                Date.now() - lastFire > 100
                ) {
            var x = player.pos[0] + player.sprite.size[0] / 2;
            var y = player.pos[1] + player.sprite.size[1] / 2;

            var tempBullets = pool.getBullets(x, y);
            bullets.push(tempBullets[0], tempBullets[1], tempBullets[2]);

            lastFire = Date.now();
        }
    }
      
    function getPosition(event) {
        var x = event.x;
        var y = event.y;

        var canvas = document.getElementById("screen");

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        mouseX = x;
        mouseY = y;
    }

    //window.addEventListener("mousemove", getPosition, false);
})();