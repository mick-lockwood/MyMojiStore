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

    // THE START BUTTON
    const startBtn = createButton(scene, 512, 520, 260, 80, 0x2ecc71, 0xffffff, "OPEN SHOP", { fontFamily: 'Impact', fontSize: '32px', color: '#ffffff' }, () => {
        
        // 1. Kick off the music and game loop!
        scene.playNextSong();
        if (scene.globalGameTimer) scene.globalGameTimer.paused = false;
        
        // 2. Start the trade phone timer
        if (!currentTrade) scene.time.delayedCall(15000, () => generateTrade(scene));

        // 3. Play a satisfying entrance sound
        scene.sound.play('epic_reveal', { volume: 0.6 });

        // 4. Fade out the startup screen smoothly
        scene.tweens.add({
            targets: startupCont,
            alpha: 0,
            scale: 1.05,
            duration: 600,
            ease: 'Power2',
            onComplete: () => startupCont.destroy()
        });
    });

    // Pulse the start button softly
    scene.tweens.add({
        targets: startBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    startupCont.add(startBtn);
}
