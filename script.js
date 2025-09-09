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
        this.enemySpawnRate = 1000;
        
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
            if (e.key === ' ' && this.gameOver) this.startGame();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    loop() {
        if (this.gameOver) return this.showGameOver();
        
        // Очистка
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Спавн врагов
        if (Date.now() - this.lastEnemySpawn > this.enemySpawnRate) {
            this.spawnEnemy();
            this.lastEnemySpawn = Date.now();
        }
        
        // Обновление
        this.player.update();
        this.player.draw();
        
        this.updateEnemies();
        this.updateParticles();
        this.checkCollisions();
        
        requestAnimationFrame(() => this.loop());
    }
    
    spawnEnemy() {
        const x = Math.random() * (this.canvas.width - 40);
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
        // Проходим по всем врагам и проверяем столкновения с пулями
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            for (let j = this.player.bullets.length - 1; j >= 0; j--) {
                const enemy = this.enemies[i];
                const bullet = this.player.bullets[j];
                
                if (bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    
                    // Создаем взрыв
                    this.createExplosion(enemy.x + 20, enemy.y + 20);
                    
                    // Удаляем врага и пулю
                    this.enemies.splice(i, 1);
                    this.player.bullets.splice(j, 1);
                    
                    // Добавляем очки
                    this.score += 10;
                    this.updateScore();
                    
                    break; // Выходим из внутреннего цикла
                }
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
        if (this.health <= 0) this.gameOver = true;
    }
    
    showGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'red';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
}
