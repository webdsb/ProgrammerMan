class WorldMap {
    constructor() {
        this.canvas = document.getElementById('worldCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.levels = [];
        this.unlockedLevels = 1;
        this.completedLevels = [];
        this.totalScore = 0;
        
        this.initializeLevels();
        this.setupEventListeners();
        this.render();
    }
    
    initializeLevels() {
        // Create 11 levels for Circuit World
        for (let i = 1; i <= 11; i++) {
            this.levels.push({
                id: i,
                name: `Level ${i}`,
                x: 100 + ((i - 1) % 4) * 180,
                y: 100 + Math.floor((i - 1) / 4) * 150,
                unlocked: i === 1,
                completed: false
            });
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.levels.forEach(level => {
                if (this.isPointInLevel(x, y, level) && level.unlocked) {
                    this.startLevel(level.id);
                }
            });
        });
        
        document.getElementById('backToMapBtn').addEventListener('click', () => this.returnToMap());
        document.getElementById('backToMapBtn2').addEventListener('click', () => this.returnToMap());
        document.getElementById('backToMapBtn3').addEventListener('click', () => this.returnToMap());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        
        // Music toggle (will be set up when game starts)
        const musicBtn = document.getElementById('musicToggleBtn');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                if (typeof arcadeSound !== 'undefined') {
                    arcadeSound.toggleMute();
                    musicBtn.textContent = musicBtn.textContent.includes('ON') ? '🔇 Music OFF' : '🔊 Music ON';
                }
            });
        }
    }
    
    isPointInLevel(x, y, level) {
        const distance = Math.sqrt(Math.pow(x - level.x, 2) + Math.pow(y - level.y, 2));
        return distance < 30;
    }
    
    startLevel(levelId) {
        document.getElementById('worldMap').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        document.getElementById('currentLevel').textContent = levelId;
        
        this.currentGame = new Game(levelId, this);
    }
    
    returnToMap() {
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('levelComplete').classList.add('hidden');
        document.getElementById('worldMap').classList.remove('hidden');
        
        if (this.currentGame) {
            this.currentGame.stop();
            this.currentGame = null;
        }
        
        this.render();
    }
    
    nextLevel() {
        const currentLevel = parseInt(document.getElementById('currentLevel').textContent);
        if (currentLevel < this.levels.length) {
            this.startLevel(currentLevel + 1);
        } else {
            this.returnToMap();
        }
    }
    
    completeLevel(levelId, score) {
        const level = this.levels.find(l => l.id === levelId);
        if (level) {
            level.completed = true;
            this.totalScore += score;
            
            // Unlock next level
            if (levelId < this.levels.length) {
                this.levels[levelId].unlocked = true;
            }
        }
        
        document.getElementById('totalScore').textContent = this.totalScore;
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw circuit background pattern
        this.drawCircuitBackground();
        
        // Draw connection lines between levels
        this.drawConnections();
        
        // Draw levels
        this.levels.forEach(level => {
            this.drawLevel(level);
        });
    }
    
    drawCircuitBackground() {
        this.ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Draw grid lines
        for (let x = 0; x < this.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        // Draw circuit traces
        this.ctx.strokeStyle = 'rgba(0, 255, 65, 0.2)';
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(Math.random() * this.width, Math.random() * this.height);
            this.ctx.lineTo(Math.random() * this.width, Math.random() * this.height);
            this.ctx.lineTo(Math.random() * this.width, Math.random() * this.height);
            this.ctx.stroke();
        }
    }
    
    drawConnections() {
        this.ctx.strokeStyle = 'rgba(0, 255, 65, 0.5)';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < this.levels.length - 1; i++) {
            if (i % 4 !== 3) { // Don't draw line to next row
                const level1 = this.levels[i];
                const level2 = this.levels[i + 1];
                
                this.ctx.beginPath();
                this.ctx.moveTo(level1.x, level1.y);
                this.ctx.lineTo(level2.x, level2.y);
                this.ctx.stroke();
            }
        }
    }
    
    drawLevel(level) {
        // Draw level node
        if (level.completed) {
            this.ctx.fillStyle = '#00ff41';
            this.ctx.shadowColor = '#00ff41';
            this.ctx.shadowBlur = 10;
        } else if (level.unlocked) {
            this.ctx.fillStyle = '#4ecdc4';
            this.ctx.shadowColor = '#4ecdc4';
            this.ctx.shadowBlur = 5;
        } else {
            this.ctx.fillStyle = '#666';
            this.ctx.shadowBlur = 0;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(level.x, level.y, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        // Draw level number
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 16px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(level.id, level.x, level.y);
        
        // Draw lock icon for locked levels
        if (!level.unlocked) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Courier New';
            this.ctx.fillText('🔒', level.x, level.y);
        }
    }
}

class Game {
    constructor(levelId, worldMap) {
        this.levelId = levelId;
        this.worldMap = worldMap;
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.player = new Player(100, 300);
        this.viruses = [];
        this.platforms = [];
        this.goalDisc = null;
        this.lives = 3;
        this.score = 0;
        this.gameRunning = true;
        this.keys = {};
        this.cameraX = 0;
        
        this.initializeLevel(levelId);
        this.setupEventListeners();
        this.startGameMusic();
        this.gameLoop();
    }
    
    initializeLevel(levelId) {
        // Create Level 1 with minimal death pits - very beginner friendly
        this.platforms = [
            // Starting area
            new Platform(0, 380, 300, 20),
            
            // First gentle platform section (connected)
            new Platform(350, 320, 120, 15),
            new Platform(520, 280, 120, 15),
            new Platform(690, 380, 200, 20), // Safe landing
            
            // Middle platforming section (mostly connected)
            new Platform(940, 320, 100, 15),
            new Platform(1090, 280, 100, 15),
            new Platform(1240, 380, 200, 20), // Safe landing
            
            // Final section (no death pits - just platforms)
            new Platform(1490, 320, 120, 15),
            new Platform(1660, 380, 200, 20), // Goal area
        ];
        
        // Create even fewer viruses for Level 1
        this.viruses = [
            new Virus(380, 290),
            new Virus(550, 250),
            new Virus(750, 350),
            new Virus(970, 290),
            new Virus(1120, 250),
            new Virus(1520, 290),
        ];
        
        // Create goal disc at the end
        this.goalDisc = new GoalDisc(1740, 340);
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'ArrowUp') e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Update player
        this.player.update(this.keys, this.platforms);
        
        // Update camera to follow player
        this.updateCamera();
        
        // Update viruses
        this.viruses.forEach(virus => {
            virus.update(this.platforms);
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Check if player fell off the map (death pit)
        if (this.player.y > this.height + 100) {
            this.loseLife();
        }
        
        // Update UI
        document.getElementById('lives-count').textContent = this.lives;
        document.getElementById('score').textContent = this.score;
    }
    
    updateCamera() {
        // Follow player with camera
        const targetCameraX = this.player.x - this.width / 2;
        const levelWidth = 2000; // Total level width
        this.cameraX = Math.max(0, Math.min(targetCameraX, levelWidth - this.width));
    }
    
    checkCollisions() {
        // Check player-virus collisions
        this.viruses = this.viruses.filter(virus => {
            if (this.player.collidesWith(virus)) {
                if (this.player.velocityY > 0 && this.player.y < virus.y) {
                    // Player jumped on virus
                    this.score += 100;
                    this.player.bounce();
                    arcadeSound.playCollectSound();
                    return false; // Remove virus
                } else {
                    // Player hit virus from side
                    this.loseLife();
                    return true; // Keep virus
                }
            }
            return true;
        });
        
        // Check if player collected goal disc
        if (this.goalDisc && this.player.collidesWith(this.goalDisc)) {
            this.winLevel();
        }
    }
    
    loseLife() {
        this.lives--;
        this.player.reset(100, 300);
        this.cameraX = 0;
        
        // Play hurt sound
        arcadeSound.playHurtSound();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
        
        // Stop music and play hurt sound
        arcadeSound.stopCurrentTrack();
        arcadeSound.playHurtSound();
    }
    
    winLevel() {
        this.gameRunning = false;
        this.score += 500;
        document.getElementById('levelScore').textContent = this.score;
        document.getElementById('levelComplete').classList.remove('hidden');
        
        // Play level complete sound
        arcadeSound.playLevelCompleteSound();
        
        // Mark level as complete in world map
        this.worldMap.completeLevel(this.levelId, this.score);
    }
    
    stop() {
        this.gameRunning = false;
        if (typeof arcadeSound !== 'undefined') {
            arcadeSound.stopCurrentTrack();
        }
    }

    startGameMusic() {
        if (typeof arcadeSound !== 'undefined') {
            // Start action music for gameplay
            setTimeout(() => {
                arcadeSound.createActionMusic();
            }, 100); // Small delay to ensure audio context is ready
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        
        // Draw platforms
        this.platforms.forEach(platform => platform.draw(this.ctx));
        
        // Draw viruses
        this.viruses.forEach(virus => virus.draw(this.ctx));
        
        // Draw goal disc
        if (this.goalDisc) {
            this.goalDisc.draw(this.ctx);
        }
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Restore context
        this.ctx.restore();
        
        // Draw level progress indicator
        this.drawProgressIndicator();
    }
    
    drawProgressIndicator() {
        const progress = Math.min(this.player.x / 2000, 1);
        const barWidth = 200;
        const barHeight = 10;
        const barX = this.width - barWidth - 20;
        const barY = 20;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress
        this.ctx.fillStyle = '#00ff41';
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        // Border
        this.ctx.strokeStyle = '#00ff41';
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Goal', barX + barWidth/2, barY - 5);
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.update();
            this.render();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.velocityX = 0;
        this.velocityY = 0;
        this.acceleration = 0.15; // Much slower acceleration
        this.maxSpeed = 3; // Lower max speed
        this.friction = 0.92; // Higher friction for smoother stop
        this.airFriction = 0.95; // Less friction in air
        this.jumpPower = 7; // Much lower initial jump
        this.maxJumpVelocity = -8; // Cap jump velocity
        this.gravity = 0.25; // Much gentler gravity
        this.fallingGravity = 0.35; // Slightly higher gravity when falling
        this.onGround = false;
        this.startX = x;
        this.startY = y;
        this.jumpHeld = false;
        this.jumpHoldTime = 0;
        this.maxJumpHoldTime = 8;
        this.coyoteTime = 0;
    }
    
    update(keys, platforms) {
        // Horizontal movement with very smooth acceleration
        if (keys['ArrowLeft']) {
            this.velocityX -= this.acceleration;
            this.velocityX = Math.max(this.velocityX, -this.maxSpeed);
        } else if (keys['ArrowRight']) {
            this.velocityX += this.acceleration;
            this.velocityX = Math.min(this.velocityX, this.maxSpeed);
        } else {
            // Apply different friction based on whether on ground or in air
            const currentFriction = this.onGround ? this.friction : this.airFriction;
            this.velocityX *= currentFriction;
            if (Math.abs(this.velocityX) < 0.05) {
                this.velocityX = 0;
            }
        }
        
        // Variable jump height - hold jump longer for higher jump
        if (keys['ArrowUp'] && !this.jumpHeld && (this.onGround || this.coyoteTime > 0)) {
            this.velocityY = -this.jumpPower; // Negative for upward movement
            this.onGround = false;
            this.coyoteTime = 0;
            this.jumpHeld = true;
            this.jumpHoldTime = 0;
            // Play jump sound
            if (typeof arcadeSound !== 'undefined') {
                arcadeSound.playJumpSound();
            }
        }
        
        if (keys['ArrowUp'] && this.jumpHeld && this.jumpHoldTime < this.maxJumpHoldTime) {
            // Continue applying upward force while holding jump
            this.velocityY -= 0.3;
            this.jumpHoldTime++;
        } else if (!keys['ArrowUp']) {
            this.jumpHeld = false;
        }
        
        // Apply different gravity for jumping vs falling
        if (this.velocityY < 0) {
            // Less gravity when moving up (smoother jump arc)
            this.velocityY += this.gravity;
        } else {
            // More gravity when falling (faster descent)
            this.velocityY += this.fallingGravity;
        }
        
        // Cap jump velocity for smoother feel
        if (this.velocityY < this.maxJumpVelocity) {
            this.velocityY = this.maxJumpVelocity;
        }
        
        this.velocityY = Math.min(this.velocityY, 10); // Lower terminal velocity
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Update coyote time
        if (this.onGround) {
            this.coyoteTime = 6; // Slightly longer coyote time
        } else if (this.coyoteTime > 0) {
            this.coyoteTime--;
        }
        
        // Check platform collisions
        this.onGround = false;
        platforms.forEach(platform => {
            if (this.collidesWith(platform)) {
                // Landing on top of platform
                if (this.velocityY > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                    this.jumpHeld = false; // Reset jump when landing
                }
                // Hitting platform from below
                else if (this.velocityY < 0 && this.y > platform.y) {
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                }
            }
        });
        
        // Keep player in bounds (adjusted for longer level)
        this.x = Math.max(0, Math.min(this.x, 2000 - this.width));
    }
    
    bounce() {
        this.velocityY = -4; // Very gentle bounce
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        this.coyoteTime = 0;
        this.jumpHeld = false;
        this.jumpHoldTime = 0;
    }
    
    collidesWith(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    draw(ctx) {
        // Draw Prog - nerdy programmer
        ctx.fillStyle = '#8B4513'; // Brown hair
        ctx.fillRect(this.x + 5, this.y, 20, 8);
        
        ctx.fillStyle = '#FDBCB4'; // Skin color
        ctx.fillRect(this.x + 8, this.y + 8, 14, 10);
        
        // Glasses
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + 8, this.y + 10, 5, 5);
        ctx.strokeRect(this.x + 17, this.y + 10, 5, 5);
        ctx.beginPath();
        ctx.moveTo(this.x + 13, this.y + 12);
        ctx.lineTo(this.x + 17, this.y + 12);
        ctx.stroke();
        
        // Body
        ctx.fillStyle = '#4169E1'; // Blue shirt
        ctx.fillRect(this.x + 5, this.y + 18, 20, 15);
        
        // Pants
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 7, this.y + 33, 6, 7);
        ctx.fillRect(this.x + 17, this.y + 33, 6, 7);
    }
}

class Virus {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 35;
        this.velocityX = (Math.random() - 0.5) * 1.5; // Slower movement
        this.velocityY = 0;
        this.gravity = 0.3; // Gentler gravity
        this.onGround = false;
        this.directionChangeTimer = 0;
        this.currentPlatform = null;
        this.patrolDirection = 1;
    }
    
    update(platforms) {
        // Find which platform the virus is on
        this.currentPlatform = null;
        platforms.forEach(platform => {
            if (this.isOnPlatform(platform)) {
                this.currentPlatform = platform;
            }
        });
        
        // If on a platform, patrol back and forth
        if (this.currentPlatform && this.onGround) {
            this.patrolOnPlatform();
        } else {
            // Fall with gravity if not on platform
            this.velocityY += this.gravity;
            this.y += this.velocityY;
        }
        
        // Horizontal movement
        this.x += this.velocityX;
        
        // Check platform collisions
        this.onGround = false;
        platforms.forEach(platform => {
            if (this.collidesWith(platform)) {
                if (this.velocityY > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                }
            }
        });
        
        // Bounce off level boundaries
        if (this.x <= 0 || this.x >= 2000 - this.width) {
            this.velocityX *= -1;
            this.patrolDirection *= -1;
        }
    }
    
    isOnPlatform(platform) {
        return this.x + this.width > platform.x &&
               this.x < platform.x + platform.width &&
               Math.abs(this.y + this.height - platform.y) < 10;
    }
    
    patrolOnPlatform() {
        // Turn around at platform edges
        const platformLeft = this.currentPlatform.x;
        const platformRight = this.currentPlatform.x + this.currentPlatform.width;
        
        if (this.x <= platformLeft + 10) {
            this.velocityX = Math.abs(this.velocityX);
            this.patrolDirection = 1;
        } else if (this.x + this.width >= platformRight - 10) {
            this.velocityX = -Math.abs(this.velocityX);
            this.patrolDirection = -1;
        }
        
        // Random direction change occasionally
        this.directionChangeTimer++;
        if (this.directionChangeTimer > 120 && Math.random() < 0.01) {
            this.velocityX *= -1;
            this.patrolDirection *= -1;
            this.directionChangeTimer = 0;
        }
    }
    
    collidesWith(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    draw(ctx) {
        // Draw virus - spiky green circle
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Spikes
        ctx.fillStyle = '#00CC00';
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const spikeX = this.x + this.width/2 + Math.cos(angle) * 18;
            const spikeY = this.y + this.height/2 + Math.sin(angle) * 18;
            ctx.beginPath();
            ctx.arc(spikeX, spikeY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Evil eyes
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 12, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 25, this.y + 12, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    draw(ctx) {
        // Draw platform with circuit theme
        ctx.fillStyle = '#2a2a3e';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add circuit traces
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Add some circuit details
        if (this.width > 50) {
            ctx.beginPath();
            ctx.moveTo(this.x + 10, this.y + this.height/2);
            ctx.lineTo(this.x + this.width - 10, this.y + this.height/2);
            ctx.stroke();
        }
    }
}

class GoalDisc {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.glowAnimation = 0;
    }
    
    update() {
        this.glowAnimation += 0.1;
    }
    
    draw(ctx) {
        this.update();
        
        // Draw glowing effect
        const glowSize = 50 + Math.sin(this.glowAnimation) * 10;
        const gradient = ctx.createRadialGradient(
            this.x + this.width/2, this.y + this.height/2, 0,
            this.x + this.width/2, this.y + this.height/2, glowSize
        );
        gradient.addColorStop(0, 'rgba(0, 255, 65, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 65, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 65, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - 20, this.y - 20, this.width + 40, this.height + 40);
        
        // Draw disc
        ctx.fillStyle = '#00ff41';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw disc details
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#00ff41';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw center hole
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    collidesWith(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
}

// Start the world map when page loads
window.addEventListener('load', () => {
    new WorldMap();
});