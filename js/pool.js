;(function() {
    var enemiesPool = [];
    var bulletsPoolF = [];
    var bulletsPoolU = [];
    var bulletsPoolD = [];
    var enemyBulletsPool = [];
    var explosionsPool = [];
    
    window.pool = {
        getEnemy: function(canvas) {
            var enemy;
            
            if (enemiesPool.length == 0) {
                return {
                    pos: [canvas.width,
                          Math.random() * (canvas.height - 39)],
                    sprite: new Sprite("img/sprites.png", [0, 78], [80, 39], 6, [0, 1, 2, 3, 2, 1])
                };   
            } else {
                var enemy = enemiesPool.pop();
                enemy.pos = [canvas.width,
                          Math.random() * (canvas.height - 39)];
                return enemy;
            }
        },
        removeEnemy: function(enemies, i) {
            enemiesPool.push(enemies[i]);
            enemies.splice(i, 1);
        },
        getBullets: function(x, y) {
            var bullet;
            var bullets = [];
            if (bulletsPoolF.length == 0) {            
                bullets.push({ 
                    pos: [x, y],
                    dir: "forward",
                    sprite: new Sprite("img/sprites.png", [0, 39], [18, 8])
                       });
            } else {
                var bullet = bulletsPoolF.pop();
                bullet.pos = [x, y];
                bullets.push(bullet);
            }
            
            if (bulletsPoolU.length == 0) {            
                bullets.push({ 
                    pos: [x, y],
                    dir: "up",
                    sprite: new Sprite("img/sprites.png", [0, 50], [9, 5])
                });
            } else {
                var bullet = bulletsPoolU.pop();
                bullet.pos = [x, y];
                bullets.push(bullet);
            }
            
            if (bulletsPoolD.length == 0) {            
                bullets.push({ 
                    pos: [x, y],
                    dir: "down",
                    sprite: new Sprite("img/sprites.png", [0, 60], [9, 5])
                });
            } else {
                var bullet = bulletsPoolD.pop();
                bullet.pos = [x, y];
                bullets.push(bullet);
            }
            
            return bullets;
        },
        removeBullet: function(bullets, i) {
            switch (bullets[i].dir) {
                case "forward":
                    bulletsPoolF.push(bullets[i]);
                    bullets.splice(i, 1);
                    break;
                case "up":
                    bulletsPoolU.push(bullets[i]);
                    bullets.splice(i, 1);
                    break;
                case "down":
                    bulletsPoolD.push(bullets[i]);
                    bullets.splice(i, 1);
                    break;
            }
        },
        getEnemyBullet: function(pos, r, enemyBulletSpeed) {
            if (enemyBulletsPool.length == 0) {
                return {
                    pos: pos,
                    speed: [Math.floor(enemyBulletSpeed * Math.cos(r)), Math.floor(enemyBulletSpeed * Math.sin(r))],
                    sprite: new Sprite("img/enemy_bullet.png",
                                       [0, 0],
                                       [18, 18],
                                       4,
                                       [0, 1, 2, 3],
                                       null,
                                       false)
                };
            } else {
                var b = enemyBulletsPool.pop();
                b.pos = pos;
                b.speed = [Math.floor(enemyBulletSpeed * Math.cos(r)), Math.floor(enemyBulletSpeed * Math.sin(r))];
                return b;
            }
        },
        removeEnemyBullet: function(enemyBullets, i) {
            enemyBulletsPool.push(enemyBullets[i]);
            enemyBullets.splice(i, 1);
        },
        getExplosion: function(pos) {
            if (explosionsPool.length == 0) {
                return {
                    pos: pos,
                    sprite: new Sprite("img/sprites.png",
                                       [0, 117],
                                       [39, 39],
                                       16,
                                       [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                       null,
                                       true)
                };
            } else {
                var explosion = explosionsPool.pop();
                explosion.sprite.reset();
                explosion.pos = pos;
                return explosion;
            }
        },
        removeExplosion: function(explosions, i) {
            explosionsPool.push(explosions[i]);
            explosions.splice(i, 1);
        }
    };
})();