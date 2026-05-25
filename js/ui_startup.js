// ==========================================
// STARTUP SCREEN UI & DAILY REWARDS
// ==========================================

function createStartupScreen(scene) {
    const startupCont = scene.add.container(0, 0).setDepth(9999);
    
    // Deep dark background that blocks all clicks beneath it
    const bg = scene.add.rectangle(0, 0, 1024, 768, 0x1a252f).setOrigin(0, 0).setInteractive();
    startupCont.add(bg);

    // Decorative floating card backs in the background
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
            targets: cardCont,
            y: cy - Phaser.Math.Between(40, 80),
            angle: cardCont.angle + Phaser.Math.Between(-10, 10),
            duration: Phaser.Math.Between(3000, 5000),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // Shadow overlay to push the cards deeper into the background
    const overlayBg = scene.add.rectangle(0, 0, 1024, 768, 0x000000, 0.2).setOrigin(0, 0);
    startupCont.add(overlayBg);

    // --- DYNAMIC TITLE LOGIC ---
    let words = storeName.toUpperCase().split(" ");
    let word1 = words[0];
    let word2 = words.slice(1).join(" ");
    
    let titleY = word2 === "" ? 280 : 230;

    const title1 = scene.add.text(512, titleY, word1, { 
        fontFamily: 'Impact', fontSize: '110px', color: '#f1c40f', stroke: '#1a1a1a', strokeThickness: 12, shadow: { offsetX: 6, offsetY: 6, color: '#000', fill: true } 
    }).setOrigin(0.5);
    startupCont.add(title1);

    if (word2 !== "") {
        const title2 = scene.add.text(512, 330, word2, { 
            fontFamily: 'Impact', fontSize: '60px', color: '#ffffff', letterSpacing: 8, stroke: '#1a1a1a', strokeThickness: 8 
        }).setOrigin(0.5);
        startupCont.add(title2);
    }

    // Version and Credits
    const verTxt = scene.add.text(20, 730, "v1.0.0", { fontFamily: 'Arial', fontSize: '16px', color: '#bdc3c7', fontStyle: 'bold' });
    const credTxt = scene.add.text(1004, 730, "© MyMoji Foundation", { fontFamily: 'Arial', fontSize: '16px', color: '#bdc3c7', fontStyle: 'bold' }).setOrigin(1, 0);
    startupCont.add([verTxt, credTxt]);

    // --- SAVE FILE DETECTION & START BUTTONS ---
    let hasSave = localStorage.getItem('myMojiSave') !== null;
    let btnY = 500;

    const startGame = () => {
        scene.playNextSong();
        if (scene.globalGameTimer) scene.globalGameTimer.paused = false;
        if (!currentTrade) scene.time.delayedCall(15000, () => generateTrade(scene));
        scene.sound.play('epic_reveal', { volume: 0.6 });

        scene.tweens.add({
            targets: startupCont, alpha: 0, scale: 1.05, duration: 600, ease: 'Power2',
            onComplete: () => startupCont.destroy()
        });
    };

    if (hasSave) {
        let contLabel = `CONTINUE: ${storeName.toUpperCase()}`;
        const contBtn = createButton(scene, 512, btnY, 320, 60, 0x2ecc71, 0xffffff, contLabel, { fontFamily: 'Impact', fontSize: '24px', color: '#ffffff' }, startGame);
        
        const newBtn = createButton(scene, 512, btnY + 80, 320, 50, 0xe74c3c, 0xffffff, "START NEW GAME", { fontFamily: 'Impact', fontSize: '20px', color: '#ffffff' }, () => {
            if (confirm("WARNING: This will permanently delete your current store, cards, and money! Are you sure?")) {
                localStorage.removeItem('myMojiSave');
                location.reload(); 
            }
        });

        scene.tweens.add({ targets: contBtn, scaleX: 1.05, scaleY: 1.05, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        startupCont.add([contBtn, newBtn]);

    } else {
        const startBtn = createButton(scene, 512, 520, 260, 80, 0x2ecc71, 0xffffff, "OPEN SHOP", { fontFamily: 'Impact', fontSize: '32px', color: '#ffffff' }, startGame);
        scene.tweens.add({ targets: startBtn, scaleX: 1.05, scaleY: 1.05, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        startupCont.add(startBtn);
    }

    // --- TRIGGER DAILY REWARD CHECK ---
    checkDailyReward(scene, startupCont);
}

// --- DAILY REWARD LOGIC ---
function checkDailyReward(scene, startupCont) {
    if (!lastLoginDate) lastLoginDate = "";

    const NOW = new Date();
    const TODAY_STR = NOW.toDateString(); // Formats like "Mon May 25 2026"
    
    const YESTERDAY = new Date(NOW);
    YESTERDAY.setDate(YESTERDAY.getDate() - 1);
    const YESTERDAY_STR = YESTERDAY.toDateString();

    if (lastLoginDate !== TODAY_STR) {
        // It's a new day! Check the streak.
        if (lastLoginDate === YESTERDAY_STR) {
            loginStreak++;
        } else {
            loginStreak = 1; // Streak broken, reset to 1
        }

        lastLoginDate = TODAY_STR;

        // Determine Reward Tier
        let rewardPack = 'basic';
        if (loginStreak >= 3 && loginStreak <= 4) rewardPack = 'premium';
        if (loginStreak >= 5) rewardPack = 'legendary';

        // Grant the Pack directly to the database
        playerPacks[rewardPack] = (playerPacks[rewardPack] || 0) + 1;
        
        // Save the new date, streak, and free pack instantly
        saveGame(); 

        // Draw the visual popup
        showDailyRewardPopup(scene, startupCont, loginStreak, rewardPack);
    }
}

function showDailyRewardPopup(scene, parentCont, streak, packType) {
    const popupCont = scene.add.container(0, 0).setDepth(10000); 
    
    // Dim the main menu behind the popup
    const dimBg = scene.add.rectangle(0, 0, 1024, 768, 0x000000, 0.8).setOrigin(0, 0).setInteractive();

    const box = scene.add.rectangle(512, 384, 500, 420, 0x2c3e50).setStrokeStyle(4, 0xf1c40f);
    
    const title = scene.add.text(512, 210, "DAILY LOGIN REWARD!", { fontFamily: 'Impact', fontSize: '36px', color: '#f1c40f' }).setOrigin(0.5);
    
    let fireEmoji = streak >= 5 ? '🔥🔥🔥' : '🔥';
    const streakTxt = scene.add.text(512, 260, `${fireEmoji} ${streak} Day Streak! ${fireEmoji}`, { fontFamily: 'Arial', fontSize: '24px', color: '#e74c3c', fontStyle: 'bold' }).setOrigin(0.5);

    let packName = packDatabase[packType] ? packDatabase[packType].name : "Booster Pack";
    const descTxt = scene.add.text(512, 320, `You received a free ${packName}!`, { fontFamily: 'Arial', fontSize: '20px', color: '#ecf0f1' }).setOrigin(0.5);

    // Render the pack graphic dynamically based on the reward tier
    let packGraphic = scene.add.container(512, 420);
    packGraphic.add(createPackGraphic(scene, packType));

    const claimBtn = createButton(scene, 512, 550, 200, 50, 0x2ecc71, 0xffffff, "CLAIM", { fontFamily: 'Impact', fontSize: '24px', color: '#ffffff' }, () => {
        scene.sound.play('coin', { volume: 0.6 });
        
        // Ensure the top HUD updates immediately so the player sees the pack counter rise
        if (scene.packsText) {
            let totalPacks = Object.values(playerPacks).reduce((a, b) => a + b, 0);
            scene.packsText.setText('PACKS: ' + totalPacks);
        }

        scene.tweens.add({
            targets: popupCont, alpha: 0, duration: 300,
            onComplete: () => popupCont.destroy()
        });
    });

    popupCont.add([dimBg, box, title, streakTxt, descTxt, packGraphic, claimBtn]);

    // Spring-loaded pop-in animation
    popupCont.setScale(0.8);
    popupCont.setAlpha(0);
    scene.tweens.add({ targets: popupCont, scale: 1, alpha: 1, duration: 400, ease: 'Back.easeOut' });

    parentCont.add(popupCont);
}
