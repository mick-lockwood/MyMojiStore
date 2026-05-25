// ==========================================
// STARTUP SCREEN UI
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

    // --- SAVE FILE DETECTION & BUTTONS ---
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
        // Continue Button
        let contLabel = `CONTINUE: ${storeName.toUpperCase()}`;
        const contBtn = createButton(scene, 512, btnY, 320, 60, 0x2ecc71, 0xffffff, contLabel, { fontFamily: 'Impact', fontSize: '24px', color: '#ffffff' }, startGame);
        
        // New Game Button
        const newBtn = createButton(scene, 512, btnY + 80, 320, 50, 0xe74c3c, 0xffffff, "START NEW GAME", { fontFamily: 'Impact', fontSize: '20px', color: '#ffffff' }, () => {
            if (confirm("WARNING: This will permanently delete your current store, cards, and money! Are you sure?")) {
                localStorage.removeItem('myMojiSave');
                location.reload(); // Reloads the page to generate a fresh state
            }
        });

        // Pulse the continue button
        scene.tweens.add({ targets: contBtn, scaleX: 1.05, scaleY: 1.05, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        startupCont.add([contBtn, newBtn]);

    } else {
        // First time playing button
        const startBtn = createButton(scene, 512, 520, 260, 80, 0x2ecc71, 0xffffff, "OPEN SHOP", { fontFamily: 'Impact', fontSize: '32px', color: '#ffffff' }, startGame);
        scene.tweens.add({ targets: startBtn, scaleX: 1.05, scaleY: 1.05, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        startupCont.add(startBtn);
    }

    startupCont.add(startBtn);
}
