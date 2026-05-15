const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#2c3e50',
    parent: 'game-container',
    scene: { preload: preload, create: create } 
};

const game = new Phaser.Game(config);

function preload() {
    this.load.audio('click', 'assets/click.mp3');
    this.load.audio('pack_rip', 'assets/pack_rip.mp3');
    this.load.audio('coin', 'assets/coin.mp3');
    this.load.audio('flip', 'assets/card_flip.mp3');
    this.load.audio('epic_rumble', 'assets/rumble_01.mp3');
    this.load.audio('epic_reveal', 'assets/epic_reveal.mp3');
    this.load.audio('phone_notification', 'assets/phone_notification.mp3');
    this.load.audio('achievement_notification', 'assets/achievement_notification.mp3');
    
    // --- BACKGROUND MUSIC FILES ---
    this.load.audio('bg_music_01', 'assets/bg_music_01.mp3');
    this.load.audio('bg_music_02', 'assets/bg_music_02.mp3');
    this.load.audio('bg_music_03', 'assets/bg_music_03.mp3');
    this.load.audio('bg_music_04', 'assets/bg_music_04.mp3');
    this.load.audio('bg_music_05', 'assets/bg_music_05.mp3');
    this.load.audio('bg_music_06', 'assets/bg_music_06.mp3');
    this.load.audio('bg_music_07', 'assets/bg_music_07.mp3');
    this.load.audio('bg_music_08', 'assets/bg_music_08.mp3');
    this.load.audio('bg_music_09', 'assets/bg_music_09.mp3');
    this.load.audio('bg_music_10', 'assets/bg_music_10.mp3');
    this.load.audio('bg_music_11', 'assets/bg_music_11.mp3');
    this.load.audio('bg_music_12', 'assets/bg_music_12.mp3');
    this.load.audio('bg_music_13', 'assets/bg_music_13.mp3');
    this.load.audio('bg_music_14', 'assets/bg_music_14.mp3');
    this.load.audio('bg_music_15', 'assets/bg_music_15.mp3');
    this.load.audio('bg_music_16', 'assets/bg_music_16.mp3');
    this.load.audio('bg_music_17', 'assets/bg_music_17.mp3');
}

function create() {
    const scene = this; 
    scene.cameras.main.setBackgroundColor(themeColors.table);
    
    // --- BACKGROUND MUSIC PLAYLIST ---
    scene.playlist = [
        'bg_music_01', 'bg_music_02', 'bg_music_03', 'bg_music_04',
        'bg_music_05', 'bg_music_06', 'bg_music_07', 'bg_music_08',
        'bg_music_09', 'bg_music_10', 'bg_music_11', 'bg_music_12',
        'bg_music_13', 'bg_music_14', 'bg_music_15', 'bg_music_16', 'bg_music_17'
    ]; 
    scene.currentTrackIndex = 0;

    // Shuffle once at the very beginning
    Phaser.Utils.Array.Shuffle(scene.playlist); 

    scene.playNextSong = () => {
        if (scene.bgmTrack) {
            scene.bgmTrack.stop();
            scene.bgmTrack.destroy();
        }

        let nextSongKey = scene.playlist[scene.currentTrackIndex];

        if (!scene.cache.audio.exists(nextSongKey)) {
            console.warn(`Playlist skipped missing track: ${nextSongKey}`);
            scene.currentTrackIndex++;
            if (scene.currentTrackIndex >= scene.playlist.length) {
                scene.currentTrackIndex = 0;
            }
            if (scene.playlist.every(key => !scene.cache.audio.exists(key))) return; 
            
            scene.playNextSong();
            return;
        }

        scene.bgmTrack = scene.sound.add(nextSongKey, { 
            volume: (typeof audioSettings !== 'undefined' && audioSettings.muted) ? 0 : (typeof audioSettings !== 'undefined' ? audioSettings.bgm : 0.3)
        });

        scene.bgmTrack.once('complete', () => {
            scene.currentTrackIndex++;
            if (scene.currentTrackIndex >= scene.playlist.length) {
                scene.currentTrackIndex = 0; 
                Phaser.Utils.Array.Shuffle(scene.playlist); 
            }
            scene.playNextSong();
        });

        scene.bgmTrack.play();
    };

    scene.playNextSong();

    // ----------------------------------

    const addShadow = (x, y, w, h, radius = 0) => {
        if (radius === 0) {
            scene.add.rectangle(x + 6, y + 6, w + 8, h + 8, 0x000000, 0.05); 
            scene.add.rectangle(x + 5, y + 5, w + 4, h + 4, 0x000000, 0.10); 
            scene.add.rectangle(x + 4, y + 4, w, h, 0x000000, 0.15);         
        } else {
            const sg = scene.add.graphics();
            const drawS = (ox, oy, dw, dh, alpha) => {
                sg.fillStyle(0x000000, alpha);
                sg.fillRoundedRect(x + ox - dw/2, y + oy - dh/2, dw, dh, radius);
            };
            drawS(6, 6, w + 8, h + 8, 0.05);
            drawS(5, 5, w + 4, h + 4, 0.10);
            drawS(4, 4, w, h, 0.15);
        }
    };

    // --- TOP UI HEADER ---
    
    for (let i = 1; i <= 8; i++) {
        scene.add.rectangle(512, 40 + (i * 3), 1024, 80, 0x000000, 0.15 - (i * 0.015));
    }
    
    scene.headerBg = scene.add.rectangle(512, 40, 1024, 80, themeColors.active.banner); 
    let bannerContrast = getContrastColor(themeColors.active.banner);

    // FIXED: Moved money and packs to X: 80 to make room for bank button
    scene.moneyText = scene.add.text(80, 10, '$' + playerMoney.toFixed(2), { fontFamily: 'Impact, sans-serif', fontSize: '36px', color: bannerContrast });
    let totalPacks = Object.values(playerPacks).reduce((a, b) => a + b, 0);
    scene.packsText = scene.add.text(80, 50, 'PACKS: ' + totalPacks, { fontFamily: 'Impact, sans-serif', fontSize: '20px', color: bannerContrast });

    scene.titleText = scene.add.text(512, 40, storeName, { fontFamily: 'Impact, sans-serif', fontSize: '48px', color: bannerContrast }).setOrigin(0.5);

    // --- XP BAR & LEVEL UI ---
    scene.xpBarBg = scene.add.rectangle(0, 74, 1024, 6, 0x000000, 0.4).setOrigin(0, 0);
    scene.xpBarFill = scene.add.rectangle(0, 74, 0, 6, 0x3498db).setOrigin(0, 0); 
    scene.levelText = scene.add.text(512, 90, 'LVL ' + playerLevel, { fontFamily: 'Impact, sans-serif', fontSize: '14px', color: bannerContrast }).setOrigin(0.5);

    scene.updateXPBar = () => {
        scene.levelText.setText('LVL ' + playerLevel);
        let needed = getXPForNextLevel();
        let percent = playerXP / needed;
        
        scene.tweens.add({
            targets: scene.xpBarFill,
            width: 1024 * percent,
            duration: 500,
            ease: 'Power2.easeOut'
        });
    };
    
    scene.updateXPBar();
    
    let updatePencilPos = () => { scene.pencilIcon.setX(512 + (scene.titleText.width / 2) + 25); };
    
    scene.pencilIcon = scene.add.text(0, 40, '✏️', { fontSize: '24px', padding: { top: 10, bottom: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    updatePencilPos(); 

    scene.pencilIcon.on('pointerover', () => scene.tweens.add({ targets: scene.pencilIcon, scale: 1.2, duration: 100 }));
    scene.pencilIcon.on('pointerout', () => scene.tweens.add({ targets: scene.pencilIcon, scale: 1, duration: 100 }));
    
    scene.pencilIcon.on('pointerdown', () => {
        let cost = hasRenamed ? 50 : 0;
        let proceed = true;
        
        if (hasRenamed) {
            proceed = confirm("Rebranding your store costs $50.00. Do you want to proceed?");
        }
        
        if (proceed) {
            if (playerMoney >= cost) {
                let promptMsg = hasRenamed 
                    ? "Enter your new store name:" 
                    : "Enter your new store name:\n\n(NOTE: Your first rebrand is FREE! Future name changes will cost $50.00)";
                
                let newName = prompt(promptMsg, storeName);
                
                if (newName && newName.trim() !== "") {
                    if (cost > 0) {
                        playerMoney -= cost;
                        scene.moneyText.setText('$' + playerMoney.toFixed(2));
                    }
                    storeName = newName.trim();
                    hasRenamed = true;
                    scene.titleText.setText(storeName);
                    updatePencilPos(); 
                    saveGame();
                    checkBailout(scene); 
                }
            } else {
                alert("You don't have enough money to rebrand right now!");
            }
        }
    });

    // Header Icons
    const
