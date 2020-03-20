;(function () {
    var requestAnimFrame = (function(){
        return window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    // Create the canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = 512;
    canvas.height = 480;
    document.body.appendChild(canvas);
    
    // Stats
    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = "absolute";
    stats.domElement.style.left = "0px";
    stats.domElement.style.top = "0px";
    document.body.appendChild(stats.domElement);

    // The main game loop
    var lastTime;
    function main() {
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;

        stats.begin();
        update(dt);
        render();
        stats.end();
        
        lastTime = now;
        requestAnimFrame(main);
    }

    var terrainPattern;
    function init() {
        //terrainPattern = ctx.createPattern(resources.get("img/terrain.png"), "repeat");
        Stars.initialize(canvas);        
        document.getElementById("play-again").addEventListener("click", function() {
            reset();
        });

        reset();
        lastTime = Date.now();
        main();
    }

    resources.load([
        "img/sprites.png",
        "img/terrain.png",
        "img/enemy_bullet.png"
    ]);
    resources.onReady(init);

    // Game state
    var player = {
        pos: [0, 0],
        sprite: new Sprite("img/sprites.png", [0, 0], [39, 39], 16, [0, 1]) 
    };

    var bullets = [];
    var enemyBullets = [];
    var enemies = [];
    var explosions = [];

    var lastFire = Date.now();
    var gameTime = 0;
    var isGameOver;
    var terrainPattern;

    // The score
    var score = 0;
    var scoreEl = document.getElementById("score");

    // Speed in pixels per second
    var playerSpeed = 200;
    var bulletSpeed = 500;
    var enemyBulletSpeed = 120;
    var enemySpeed = 100;

    // Update game objects
    function update(dt) {
        gameTime += dt;

        handleInput(dt);
        updateEntities(dt);
        Stars.update(dt);
        
        // It gets harder over time by adding enemies using
        // this equation: 1 - 0,998 ^ gameTime
        if (Math.random() < 1 - Math.pow(0.998, gameTime)) {
            enemies.push(pool.getEnemy(canvas));
        }

        checkCollisions();

        scoreEl.innerHTML = score;
    }

    function handleInput(dt) {
        Stars.setDy(0);
        if (input.isDown("DOWN") || input.isDown("s")) {
            player.pos[1] += playerSpeed * dt;
            Stars.setDy(-0.25);
        }

        if (input.isDown("UP") || input.isDown("w")) {
            player.pos[1] -= playerSpeed * dt;
            Stars.setDy(0.25);
        }

        if (input.isDown("LEFT") || input.isDown("a")) {
            player.pos[0] -= playerSpeed * dt;
        }

        if (input.isDown("RIGHT") || input.isDown("d")) {
            player.pos[0] += playerSpeed * dt;
        }

        if (input.isDown("SPACE") &&
            !isGameOver &&
            Date.now() - lastFire > 100
           ) {
            var x = player.pos[0] + player.sprite.size[0] / 2;
            var y = player.pos[1] + player.sprite.size[1] / 2;

            var tempBullets = pool.getBullets(x, y);
            bullets.push(tempBullets[0], tempBullets[1], tempBullets[2]);

            lastFire = Date.now();
        }
    }

    function updateEntities(dt) {
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

            if (bullet.pos[1] < 0 || bullet.pos[1] > canvas.height ||
                bullet.pos[0] > canvas.width) {
                pool.removeBullet(bullets, i);
                i--;
            }
        }

        // Update all the enemies
        for (i=0; i<enemies.length; i++) {
            enemies[i].pos[0] -= enemySpeed * dt;
            enemies[i].sprite.update(dt);

            // Remove if offscreen
            if (enemies[i].pos[0] + enemies[i].sprite.size[0] < 0) {
                pool.removeEnemy(enemies, i);
                i--;
            }
            
            // Fire a enemy bullet
            var r = Math.random();
            if (r < 1/600) {
                r = Math.PI * 2 * r * 600;
                var x = enemies[i].pos[0];
                var y = enemies[i].pos[1];
                r = calculateFireAngle([x,y], player.pos);
                enemyBullets.push(pool.getEnemyBullet([x,y], r, enemyBulletSpeed));
            }
        }
        
        // Update all the enemy bullets
        for (i = 0; i < enemyBullets.length; i++) {
            enemyBullets[i].pos[0] -= enemyBullets[i].speed[0] * dt;
            enemyBullets[i].pos[1] -= enemyBullets[i].speed[1] * dt;
            enemyBullets[i].sprite.update(dt);
            
            // Remove if offscreen
            if (enemyBullets[i].pos[0] + enemyBullets[i].sprite.size[0] < 0 ||
                enemyBullets[i].pos[0] - enemyBullets[i].sprite.size[0] > canvas.width ||
                enemyBullets[i].pos[1] + enemyBullets[i].sprite.size[1] < 0 ||
                enemyBullets[i].pos[1] - enemyBullets[i].sprite.size[1] > canvas.height)
            {
                pool.removeEnemyBullet(enemyBullets, i);
                i--;
            }
        }

        // Update all the explosions
        for (i = 0; i<explosions.length; i++) {
            explosions[i].sprite.update(dt);

            // Remove if animation is done
            if (explosions[i].sprite.done) {
                pool.removeExplosion(explosions, i);
                i--;
            }
        }
    }

    function calculateFireAngle(enemyPos, playerPos) {
        return Math.atan2(enemyPos[1]-playerPos[1], enemyPos[0]-playerPos[0]);
    }
    
    function collides(x, y, r, b, x2, y2, r2, b2) {
        return !(r <= x2 || x > r2 || b <= y2 || y > b2);
    }

    function boxCollides(pos, size, pos2, size2, offset) {
        if (!offset) offset = [0, 0];
        var offset = [Math.floor(offset[0]/2), Math.floor(offset[1]/2)];
        return collides(pos[0], pos[1],
                        pos[0] + size[0], pos[1] + size[1],
                        pos2[0] + offset[0], pos2[1] + offset[1],
                        pos2[0] + size2[0] - offset[0], pos2[1] + size2[1] - offset[1]);
    }

    function checkCollisions() {
        checkPlayerBounds();

        // Run collision detection for all enemies and player bullets
        for (var i=0; i<enemies.length; i++) {
            var pos = enemies[i].pos;
            var size = enemies[i].sprite.size;

            for (var j=0; j<bullets.length; j++) {
                var pos2 = bullets[j].pos;
                var size2 = bullets[j].sprite.size;

                if (boxCollides(pos, size, pos2, size2)) {
                    // Remove the enemy   
                    pool.removeEnemy(enemies, i);
                    i--;

                    // Add score
                    score += 25;

                    // Add an explosion
                    explosions.push(pool.getExplosion(pos));

                    // Remove the bullet and stop this iteration
                    pool.removeBullet(bullets, j);
                    break;
                }
            }

            // Check if player collides with an enemy
            if (boxCollides(pos, size, player.pos, player.sprite.size, [15, 10])) {
                if (!isGameOver) {
                    explosions.push(pool.getExplosion(player.pos));
                    gameOver();
                }
            }
        }
        
        // Run collision detection for all enemy bullets against player
        for (i=0; i<enemyBullets.length; i++) {
            var pos = enemyBullets[i].pos;
            var size = enemyBullets[i].sprite.size;
            
            if (boxCollides(pos, size, player.pos, player.sprite.size, [15, 10])) {
                if (!isGameOver) {
                    explosions.push(pool.getExplosion(player.pos));
                    gameOver();
                }
            }
        }
    }

    function checkPlayerBounds() {
        // Check bounds
        if (player.pos[0] < 0) {
            player.pos[0] = 0;
        } else if (player.pos[0] > canvas.width - player.sprite.size[0]) {
            player.pos[0] = canvas.width - player.sprite.size[0];
        }

        if (player.pos[1] < 0) {
            player.pos[1] = 0;
        } else if (player.pos[1] > canvas.height - player.sprite.size[1]) {
            player.pos[1] = canvas.height - player.sprite.size[1];
        }
    }

    // Draw everything
    function render() {
        //ctx.fillStyle = terrainPattern;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        Stars.draw();

        // Render the player if the fame isn't over
        if (!isGameOver) {
            renderEntity(player);
        }

        renderEntities(bullets);
        renderEntities(enemies);
        renderEntities(enemyBullets);
        renderEntities(explosions);
    }

    function renderEntities(list) {
        for (var i=0; i<list.length; i++) {
            renderEntity(list[i]);
        }
    }

    function renderEntity(entity) {
        ctx.save();
        ctx.translate(entity.pos[0], entity.pos[1]);
        entity.sprite.render(ctx);
        ctx.restore();
    }

    // Game over
    function gameOver() {
        document.getElementById("game-over").style.display = "block";
        document.getElementById("game-over-overlay").style.display = "block";
        isGameOver = true;
    }

    // Reset game to original state
    function reset() {
        document.getElementById("game-over").style.display = "none";
        document.getElementById("game-over-overlay").style.display = "none";
        isGameOver = false;
        gameTime = 0;
        score = 0;

        enemies = [];
        bullets = [];
        enemyBullets = [];

        player.pos = [50, canvas.height / 2];
    }
})();