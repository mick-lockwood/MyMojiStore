// ==========================================
// STARTUP SCREEN UI & DAILY REWARDS
// ==========================================

const streakRewards = [
    { day: 1, type: null },
    { day: 2, type: 'basic' },
    { day: 3, type: null },
    { day: 4, type: 'premium' },
    { day: 5, type: null },
    { day: 6, type: null },
    { day: 7, type: 'legendary' }
];

function createStartupScreen(scene) {
    const startupCont = scene.add.container(0, 0).setDepth(9999);
    
    const bg = scene.add.rectangle(0, 0, 1024, 768, 0x1a252f).setOrigin(0, 0).setInteractive();
    startupCont.add(bg);

    for(let i=0; i<6; i++) {
        let cx = 100 + (i * 160);
        let cy = Phaser.Math.Between(100, 600);
        let cardCont = scene.add.container(cx, cy);
        
        let backGraphic = createCardBackGraphic(scene); 
        cardCont.add(backGraphic);
        
        cardCont.setAngle(Phaser.Math.Between(-20, 20));
        cardCont.setScale(Phaser.Math.FloatBetween(0.6, 0.9));
        cardCont.setAlpha(0.3);
        
        startupCont.add(cardCont);

        scene.tweens.add({
            targets: cardCont, y: cy - Phaser.Math.Between(40, 80), angle: cardCont.angle + Phaser.Math.Between(-10, 10),
            duration: Phaser.Math.Between(3000, 5000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }

    const overlayBg = scene.add.rectangle(0, 0, 1024, 768, 0x000000, 0.3).setOrigin(0, 0);
    startupCont.add(overlayBg);

    // --- QUICK SETTINGS: SEPARATE MUSIC & SFX TOGGLES ---
    // Music Toggle
    let musicIcon = audioSettings.musicMuted ? '🔇' : '🎵';
    const musicToggle = scene.add.text(940, 40, musicIcon, { fontSize: '32px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    musicToggle.on('pointerdown', () => {
        audioSettings.musicMuted = !audioSettings.musicMuted;
        musicToggle.setText(audioSettings.musicMuted ? '🔇' : '🎵');
        
        // Update the actual track if it exists
        if (scene.bgmTrack) {
            scene.bgmTrack.setVolume(audioSettings.musicMuted ? 0 : audioSettings.bgm);
        }
        saveGame();
        scene.events.emit('sync_audio_ui'); 
    });
    
    // SFX Toggle
    let sfxIcon = audioSettings.sfxMuted ? '🔇' : '🔊';
    const sfxToggle = scene.add.text(990, 40, sfxIcon, { fontSize: '32px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    sfxToggle.on('pointerdown', () => {
        audioSettings.sfxMuted = !audioSettings.sfxMuted;
        sfxToggle.setText(audioSettings.sfxMuted ? '🔇' : '🔊');
        saveGame();
        scene.events.emit('sync_audio_ui');
    });

    startupCont.add([musicToggle, sfxToggle]);

    // --- STATIC TITLE LOGIC ---
    // FIXED: Now safely hardcoded to always display "MYMOJI STORE" here
    let words = "MYMOJI STORE".split(" ");
    let word1 = words[0];
    let word2 = words.slice(1).join(" ");
    
    let titleY = word2 === "" ? 220 : 180;

    const title1 = scene.add.text(512, titleY, word1, { 
        fontFamily: 'Impact', fontSize: '110px', color: '#f1c40f', stroke: '#1a1a1a', strokeThickness: 12, shadow: { offsetX: 6, offsetY: 6, color: '#000', fill: true } 
    }).setOrigin(0.5);
    startupCont.add(title1);

    const title2 = scene.add.text(512, titleY + 100, word2, { 
        fontFamily: 'Impact', fontSize: '60px', color: '#ffffff', letterSpacing: 8, stroke: '#1a1a1a', strokeThickness: 8 
    }).setOrigin(0.5);
    startupCont.add(title2);

    const verTxt = scene.add.text(20, 730, "v1.0.0", { fontFamily: 'Arial', fontSize: '16px', color: '#bdc3c7', fontStyle: 'bold' });
    const credTxt = scene.add.text(1004, 730, "© MyMoji Foundation", { fontFamily: 'Arial', fontSize: '16px', color: '#bdc3c7', fontStyle: 'bold' }).setOrigin(1, 0);
    startupCont.add([verTxt, credTxt]);

    // --- DAILY REWARD PROCESSING ---
    let earnedRewardToday = null;
    let isNewDay = false;

    if (!lastLoginDate) lastLoginDate = "";
    const NOW = new Date();
    const TODAY_STR = NOW.toDateString();
    
    const YESTERDAY = new Date(NOW);
    YESTERDAY.setDate(YESTERDAY.getDate() - 1);
    const YESTERDAY_STR = YESTERDAY.toDateString();

    if (lastLoginDate !== TODAY_STR) {
        isNewDay = true;
        if (lastLoginDate === YESTERDAY_STR) {
            loginStreak++;
        } else {
            loginStreak = 1; 
        }
        lastLoginDate = TODAY_STR;

        let cycleIndex = (loginStreak - 1) % 7;
        earnedRewardToday = streakRewards[cycleIndex].type;

        if (earnedRewardToday) {
            playerPacks[earnedRewardToday] = (playerPacks[earnedRewardToday] || 0) + 1;
        }
        saveGame(); 
    }

    // --- START BUTTONS ---
    let hasSave = localStorage.getItem('myMojiSave') !== null;
    let btnY = 440; 

    const startGame = () => {
        scene.playNextSong();
        if (scene.globalGameTimer) scene.globalGameTimer.paused = false;
        if (!currentTrade) scene.time.delayedCall(15000, () => generateTrade(scene));

        scene.tweens.add({ targets: startupCont, alpha: 0, scale: 1.05, duration: 600, ease: 'Power2', onComplete: () => startupCont.destroy() });
    };

    if (hasSave) {
        let contLabel = `CONTINUE: ${storeName.toUpperCase()}`; // Still respects your custom store name!
        const contBtn = createButton(scene, 512, btnY, 320, 60, 0x2ecc71, 0xffffff, contLabel, { fontFamily: 'Impact', fontSize: '24px', color: '#ffffff' }, startGame);
        
        const newBtn = createButton(scene, 512, btnY + 75, 320, 45, 0xe74c3c, 0xffffff, "START NEW GAME", { fontFamily: 'Impact', fontSize: '20px', color: '#ffffff' }, () => {
            if (confirm("WARNING: This will permanently delete your current store, cards, and money! Are you sure?")) {
                localStorage.removeItem('myMojiSave');
                location.reload(); 
            }
        });

        scene.tweens.add({ targets: contBtn, scaleX: 1.05, scaleY: 1.05, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        startupCont.add([contBtn, newBtn]);

    } else {
        const startBtn = createButton(scene, 512, btnY + 30, 260, 80, 0x2ecc71, 0xffffff, "OPEN SHOP", { fontFamily: 'Impact', fontSize: '32px', color: '#ffffff' }, startGame);
        scene.tweens.add({ targets: startBtn, scaleX: 1.05, scaleY: 1.05, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        startupCont.add(startBtn);
    }

    drawStreakTracker(scene, startupCont, loginStreak, earnedRewardToday, isNewDay);
}

function drawStreakTracker(scene, parentCont, currentStreak, earnedRewardToday, isNewDay) {
    const trackerCont = scene.add.container(512, 630);
    
    const title = scene.add.text(0, -55, "WEEKLY LOGIN STREAK", { fontFamily: 'Impact', fontSize: '22px', color: '#f1c40f', letterSpacing: 2 }).setOrigin(0.5);
    trackerCont.add(title);

    let cycleIndex = currentStreak > 0 ? (currentStreak - 1) % 7 : 0;
    
    let spacing = 80;
    let startX = -(spacing * 3); 
    let hasClickedRewardThisSession = false;

    for (let i = 0; i < 7; i++) {
        let rewardData = streakRewards[i];
        let boxX = startX + (i * spacing);
        
        let isToday = (i === cycleIndex);
        let isPast = (i < cycleIndex);
        
        let bgColor = isPast ? 0x27ae60 : (isToday ? 0xd35400 : 0x34495e);
        let box = scene.add.rectangle(boxX, 0, 70, 75, bgColor).setStrokeStyle(3, isToday ? 0xf1c40f : 0x1a1a1a);
        trackerCont.add(box);
        
        if (isToday) {
            scene.tweens.add({ targets: box, scale: 1.08, duration: 800, yoyo: true, repeat: -1 });
            
            if (earnedRewardToday && isNewDay) {
                let clickTxt = scene.add.text(boxX, -60, 'CLICK!', { fontFamily: 'Impact', fontSize: '16px', color: '#2ecc71' }).setOrigin(0.5);
                scene.tweens.add({ targets: clickTxt, y: -50, duration: 400, yoyo: true, repeat: -1 });
                trackerCont.add(clickTxt);

                let clickZone = scene.add.zone(boxX, 0, 70, 75).setInteractive({ useHandCursor: true });
                clickZone.on('pointerdown', () => {
                    if (!hasClickedRewardThisSession) {
                        hasClickedRewardThisSession = true;
                        clickTxt.destroy(); 
                        showDailyRewardPopup(scene, parentCont, currentStreak, earnedRewardToday);
                    }
                });
                trackerCont.add(clickZone);
            }
        }

        let dayTxt = scene.add.text(boxX, -22, `DAY ${i+1}`, { fontFamily: 'Arial', fontSize: '13px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        trackerCont.add(dayTxt);

        if (rewardData.type) {
            let packDef = packDatabase[rewardData.type];
            let packColor = packDef ? packDef.color : 0x9b59b6;
            
            let miniPack = scene.add.rectangle(boxX, 12, 30, 42, packColor).setStrokeStyle(2, 0x1a1a1a);
            let packInitial = scene.add.text(boxX, 12, rewardData.type.charAt(0).toUpperCase(), { fontFamily: 'Impact', fontSize: '16px', color: '#fff' }).setOrigin(0.5);
            trackerCont.add([miniPack, packInitial]);
        } else {
            let dash = scene.add.text(boxX, 10, '-', { fontSize: '24px', color: '#7f8c8d', fontStyle: 'bold' }).setOrigin(0.5);
            trackerCont.add(dash);
        }
        
        if (isPast || (isToday && !earnedRewardToday)) {
            let overlay = scene.add.rectangle(boxX, 0, 70, 75, 0x000000, 0.4);
            let check = scene.add.text(boxX, 10, '✔', { fontSize: '28px', color: '#2ecc71', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5);
            trackerCont.add([overlay, check]);
        }
    }

    parentCont.add(trackerCont);
}

function showDailyRewardPopup(scene, parentCont, streak, packType) {
    const popupCont = scene.add.container(0, 0).setDepth(10000); 
    
    const dimBg = scene.add.rectangle(0, 0, 1024, 768, 0x000000, 0.8).setOrigin(0, 0).setInteractive();
    const box = scene.add.rectangle(512, 384, 500, 420, 0x2c3e50).setStrokeStyle(4, 0xf1c40f);
    
    const title = scene.add.text(512, 210, "DAILY LOGIN REWARD!", { fontFamily: 'Impact', fontSize: '36px', color: '#f1c40f' }).setOrigin(0.5);
    
    let fireEmoji = streak >= 5 ? '🔥🔥🔥' : '🔥';
    const streakTxt = scene.add.text(512, 260, `${fireEmoji} ${streak} Day Streak! ${fireEmoji}`, { fontFamily: 'Arial', fontSize: '24px', color: '#e74c3c', fontStyle: 'bold' }).setOrigin(0.5);

    let packName = packDatabase[packType] ? packDatabase[packType].name : "Booster Pack";
    const descTxt = scene.add.text(512, 310, `You received a free ${packName}!`, { fontFamily: 'Arial', fontSize: '20px', color: '#ecf0f1' }).setOrigin(0.5);

    let packGraphic = scene.add.container(512, 400); 
    packGraphic.add(createPackGraphic(scene, packType));
    packGraphic.setScale(0.8); 

    const claimBtn = createButton(scene, 512, 540, 200, 50, 0x2ecc71, 0xffffff, "CLAIM", { fontFamily: 'Impact', fontSize: '24px', color: '#ffffff' }, () => {
        scene.sound.play('coin', { volume: 0.6 });
        
        if (scene.packsText) {
            let totalPacks = Object.values(playerPacks).reduce((a, b) => a + b, 0);
            scene.packsText.setText('PACKS: ' + totalPacks);
        }

        scene.tweens.add({ targets: popupCont, alpha: 0, duration: 300, onComplete: () => popupCont.destroy() });
    });

    popupCont.add([dimBg, box, title, streakTxt, descTxt, packGraphic, claimBtn]);

    popupCont.setScale(0.8);
    popupCont.setAlpha(0);
    scene.tweens.add({ targets: popupCont, scale: 1, alpha: 1, duration: 400, ease: 'Back.easeOut' });

    parentCont.add(popupCont);
}
