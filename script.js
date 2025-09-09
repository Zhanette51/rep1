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
        this.victory = false; // Добавляем флаг победы
        this.firstKill = false; // Флаг первого убийства
        
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
        this.victory = false;
        this.firstKill = false; // Сбрасываем флаг первого убийства
        this.enemies = [];
        this.particles = [];
        this.player = new Player(this);
        this.updateScore();
        this.gameLoop();
    }
    
    // ... остальные методы без изменений до checkCollisions ...
    
    checkCollisions() {
        // Создаем временные массивы для удаления
        const enemiesToRemove = [];
        const bulletsToRemove = [];
        
        // Проверяем столкновения
        for (let i = 0; i < this.enemies.length; i++) {
            for (let j = 0; j < this.player.bullets.length; j++) {
                const enemy = this.enemies[i];
                const bullet = this.player.bullets[j];
                
                if (bullet && enemy &&
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    
                    // Помечаем для удаления
                    enemiesToRemove.push(i);
                    bulletsToRemove.push(j);
                    this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    this.score += 10;
                    
                    // Проверяем первое убийство
                    if (!this.firstKill) {
                        this.firstKill = true;
                        this.victory = true;
                        this.showVictory();
                    }
                }
            }
        }
        
        // Удаляем отмеченных врагов и пули (в обратном порядке)
        for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
            this.enemies.splice(enemiesToRemove[i], 1);
        }
        
        for (let i = bulletsToRemove.length - 1; i >= 0; i--) {
            this.player.bullets.splice(bulletsToRemove[i], 1);
        }
        
        this.updateScore();
    }
    
    // Добавляем метод для показа победы
    showVictory() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ТЫ ВЫИГРАЛ!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Игра перезапустится через 5 секунд...', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        // Перезапуск через 5 секунд
        setTimeout(() => {
            this.startGame();
        }, 5000);
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
    
    gameLoop() {
        if (this.gameOver) {
            this.showGameOver();
            return;
        }
        
        if (this.victory) {
            return; // Не обновляем игру если показана победа
        }
        
        // Очистка экрана
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем звезды
        this.drawStars();
        
        // Спавн врагов только если нет победы
        if (Date.now() - this.lastEnemySpawn > this.enemySpawnRate && !this.victory) {
            this.spawnEnemy();
            this.lastEnemySpawn = Date.now();
        }
        
        // Обновление игры
        this.player.update();
        this.player.draw();
        
        this.updateEnemies();
        this.updateParticles();
        this.checkCollisions();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Остальные классы (Player, Enemy, Particle) остаются без изменений
