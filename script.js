class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.player = new Player(this);
        this.enemies = [];
        this.particles = [];
        this.score = 0;
        this.health = 100;
        this.gameOver = false;
        
        this.keys = {};
        this.lastEnemySpawn = 0;
        this.enemySpawnRate = 1000; // 1 секунда
        
        this.setupEventListeners();
        this.menu = document.getElementById('menu');
        this.startBtn = document.getElementById('startBtn');
        this.startBtn.addEventListener('click', () => this.startGame());
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    startGame() {
        this.menu.classList.add('hidden');
        this.score = 0;
        this.health = 100;
        this.gameOver = false;
        this.enemies = [];
        this.particles = [];
        this.player = new Player(this);
        this.updateScore();
        this.loop();
    }
    
    resize() {
        const width = Math.min(800, window.innerWidth - 40);
        const height = Math.min(600, window.innerHeight - 40);
        
        this.canvas.width = width;
        this.canvas.height = height;
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' && this.gameOver) {
                this.startGame();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    loop(timestamp) {
        if (this.gameOver) return this.showGameOver();
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Фон с звездами
        this.drawStars();
        
        // Спавн врагов
        if (timestamp - this.lastEnemySpawn > this.enemySpawnRate) {
            this.spawnEnemy();
            this.lastEnemySpawn = timestamp;
        }
        
        // Обновление и отрисовка объектов
        this.player.update();
        this.player.draw();
        
        this.updateEnemies();
        this.updateParticles();
        this.checkCollisions();
        
        requestAnimationFrame((ts) => this.loop(ts));
    }
    
    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = (Math.random() * this.canvas.height + timestamp * 0.1) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    spawnEnemy() {
        const x = Math.random() * (this.canvas.width - 50);
        this.enemies.push(new Enemy(this, x));
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].update();
            this.enemies[i].draw();
            
            if (this.enemies[i].y > this.canvas.height) {
                this.enemies.splice(i, 1);
                this.health -= 10;
                this.updateScore();
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            this.particles[i].draw();
            
            if (this.particles[i].alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.player.checkBulletCollision(this.enemies[i])) {
                this.createExplosion(this.enemies[i].x, this.enemies[i].y);
                this.enemies.splice(i, 1);
                this.score += 10;
                this.updateScore();
            }
        }
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(this, x, y));
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('health').textContent = this.health;
        
        if (this.health <= 0) {
            this.gameOver = true;
        }
    }
    
    showGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
}

class Player {
    constructor(game) {
        this.game = game;
        this.width = 50;
        this.height = 50;
        this.x = game.canvas.width / 2 - this.width / 2;
        this.y = game.canvas.height - this.height - 20;
        this.speed = 5;
        this.bullets = [];
        this.lastShot = 0;
        this.shotDelay = 300; // 0.3 секунды
    }
    
    update() {
        // Движение
        if (this.game.keys['ArrowLeft']) this.x = Math.max(0, this.x - this.speed);
        if (this.game.keys['ArrowRight']) this.x = Math.min(this.game.canvas.width - this.width, this.x + this.speed);
        
        // Стрельба
        const now = Date.now();
        if (this.game.keys[' '] && now - this.lastShot > this.shotDelay) {
            this.shoot();
            this.lastShot = now;
        }
        
        // Обновление пуль
        this.updateBullets();
    }
    
    shoot() {
        this.bullets.push({
            x: this.x + this.width / 2 - 2.5,
            y: this.y,
            width: 5,
            height: 15,
            speed: 10
        });
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= this.bullets[i].speed;
            
            if (this.bullets[i].y < 0) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    draw() {
        // Корабль игрока
        this.game.ctx.fillStyle = '#00f7ff';
        this.game.ctx.beginPath();
        this.game.ctx.moveTo(this.x + this.width / 2, this.y);
        this.game.ctx.lineTo(this.x, this.y + this.height);
        this.game.ctx.lineTo(this.x + this.width, this.y + this.height);
        this.game.ctx.closePath();
        this.game.ctx.fill();
        
        // Выхлоп
        for (let i = 0; i < 3; i++) {
            this.game.ctx.fillStyle = `rgba(255, 100, 0, ${Math.random() * 0.8})`;
            this.game.ctx.fillRect(
                this.x + this.width / 2 - 5,
                this.y + this.height + Math.random() * 10,
                10,
                15
            );
        }
        
        // Пули
        this.game.ctx.fillStyle = '#ff0000';
        this.bullets.forEach(bullet => {
            this.game.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }
    
    checkBulletCollision(enemy) {
        return this.bullets.some((bullet, bulletIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                this.bullets.splice(bulletIndex, 1);
                return true;
            }
            return false;
        });
    }
}

class Enemy {
    constructor(game, x) {
        this.game = game;
        this.width = 40;
        this.height = 40;
        this.x = x;
        this.y = -this.height;
        this.speed = 2 + Math.random() * 2;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    }
    
    update() {
        this.y += this.speed;
    }
    
    draw() {
        this.game.ctx.fillStyle = this.color;
        this.game.ctx.beginPath();
        this.game.ctx.moveTo(this.x + this.width / 2, this.y + this.height);
        this.game.ctx.lineTo(this.x, this.y);
        this.game.ctx.lineTo(this.x + this.width, this.y);
        this.game.ctx.closePath();
        this.game.ctx.fill();
    }
}

class Particle {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.alpha = 1;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.015;
        this.size -= 0.1;
    }
    
    draw() {
        this.game.ctx.save();
        this.game.ctx.globalAlpha = this.alpha;
        this.game.ctx.fillStyle = this.color;
        this.game.ctx.beginPath();
        this.game.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.game.ctx.fill();
        this.game.ctx.restore();
    }
}

// Запуск игры
const game = new Game();
