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

// 1. Load the Base Frames
    this.load.image('frame_Common', 'assets/frames/frame_common.png');
    this.load.image('frame_Rare', 'assets/frames/frame_rare.png');
    this.load.image('frame_Epic', 'assets/frames/frame_epic.png');
    this.load.image('frame_Legendary', 'assets/frames/frame_legendary.png');
    this.load.image('frame_Glitch', 'assets/frames/frame_glitch.png');
    
    // Load the Card Back
    this.load.image('card_back', 'assets/frames/card_back.png');

    // 2. Auto-Load all Character Art using the Database!
    myMojiDatabase.forEach(moji => {
        // This dynamically loads 'assets/art/m_001.png' and assigns it the key 'm_001'
        this.load.image(moji.id, `assets/art/${moji.id}.png`); 
    });
    // 3. NEW: Auto-Load Category Icons!
    // This finds every unique category in your database and loads it
    let uniqueCategories = [...new Set(myMojiDatabase.map(m => m.category))];
    uniqueCategories.forEach(cat => {
        this.load.image(`category_${cat}`, `assets/icons/category_${cat}.png`); 
    });
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
    const storeIconBtn = scene.add.text(920, 40, '🛒', { fontSize: '44px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    storeIconBtn.on('pointerover', () => scene.tweens.add({ targets: storeIconBtn, scale: 1.2, duration: 100 }));
    storeIconBtn.on('pointerout', () => scene.tweens.add({ targets: storeIconBtn, scale: 1, duration: 100 }));
    storeIconBtn.on('pointerdown', () => { storeOverlay.currentView = 'shop'; renderStoreView(scene, storeOverlay); storeOverlay.setVisible(true); });

    const settingsBtn = scene.add.text(980, 40, '⚙️', { fontFamily: 'Arial, sans-serif', fontSize: '44px', color: '#000000' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    settingsBtn.on('pointerover', () => scene.tweens.add({ targets: settingsBtn, angle: 45, duration: 200 }));
    settingsBtn.on('pointerout', () => scene.tweens.add({ targets: settingsBtn, angle: 0, duration: 200 }));

    const phoneBtn = scene.add.text(860, 40, '📱', { fontSize: '40px', padding: { top: 10, bottom: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    scene.phoneNotification = scene.add.circle(880, 20, 10, 0xe74c3c).setVisible(unreadMessage);
    scene.tweens.add({ targets: scene.phoneNotification, scale: 1.3, yoyo: true, repeat: -1, duration: 400 });
    
    phoneBtn.on('pointerover', () => scene.tweens.add({ targets: phoneBtn, scale: 1.2, duration: 100 }));
    phoneBtn.on('pointerout', () => scene.tweens.add({ targets: phoneBtn, scale: 1, duration: 100 }));

    // NEW: Bank Button
    const bankBtn = scene.add.text(35, 40, '🏦', { fontSize: '40px', padding: { top: 10, bottom: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    bankBtn.on('pointerover', () => scene.tweens.add({ targets: bankBtn, scale: 1.2, duration: 100 }));
    bankBtn.on('pointerout', () => scene.tweens.add({ targets: bankBtn, scale: 1, duration: 100 }));

    // --- OVERLAYS ---
    const binderOverlay = createBinderOverlay(scene);
    scene.binderOverlay = binderOverlay; 
    
    scene.achievementsOverlay = createAchievementsOverlay(scene);

    const storeOverlay = createStoreOverlay(scene);
    scene.storeOverlay = storeOverlay;
    
    const inventoryOverlay = createInventoryOverlay(scene);

    const tradingOverlay = createTradingOverlay(scene);
    scene.tradingOverlay = tradingOverlay;
    
    const settingsOverlay = createSettingsOverlay(scene, binderOverlay, inventoryOverlay);
    scene.phoneOverlay = createPhoneOverlay(scene); 
    
    const bankOverlay = createBankOverlay(scene); // NEW: Bank Overlay created
    scene.bankOverlay = bankOverlay;

    scene.closeAllOverlays = () => {
        binderOverlay.setVisible(false);
        storeOverlay.setVisible(false);
        inventoryOverlay.setVisible(false);
        tradingOverlay.setVisible(false);
        settingsOverlay.setVisible(false);
        scene.phoneOverlay.setVisible(false);
        scene.bankOverlay.setVisible(false); // NEW: Closes the bank
        
        if (scene.achievementsOverlay) scene.achievementsOverlay.setVisible(false); 
        scene.events.emit('close_all_dropdowns');
    };

    storeIconBtn.on('pointerdown', () => { scene.closeAllOverlays(); storeOverlay.currentView = 'shop'; renderStoreView(scene, storeOverlay); storeOverlay.setVisible(true); });
    settingsBtn.on('pointerdown', () => { scene.closeAllOverlays(); settingsOverlay.renderPalettes(); settingsOverlay.setVisible(true); });
    phoneBtn.on('pointerdown', () => { 
        unreadMessage = false; 
        scene.phoneNotification.setVisible(false); 
        scene.closeAllOverlays(); 
        renderPhoneView(scene, scene.phoneOverlay); 
        scene.phoneOverlay.setVisible(true); 
    });
    bankBtn.on('pointerdown', () => { 
        scene.closeAllOverlays(); 
        renderBankView(scene, scene.bankOverlay); 
        scene.bankOverlay.setVisible(true); 
    });

    if (!currentTrade) scene.time.delayedCall(15000, () => generateTrade(scene));

    // --- MAIN HUD BUTTONS & DROP ZONES ---
    addShadow(160, 138, 240, 70, 12);
    
    let tradeBtn = createButton(scene, 160, 138, 240, 70, 0x8e44ad, 0x000000, 'TRADING HALL', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#ffffff' }, () => {
        scene.closeAllOverlays();
        renderTradingView(scene, scene.tradingOverlay);
        scene.tradingOverlay.setVisible(true);
    });

    addShadow(160, 710, 240, 70, 12);
    scene.sellZone = createButton(scene, 160, 710, 240, 70, 0xff7e8d, 0x000000, 'SELL ON\nMOJIMARKET', { fontFamily: 'Impact, sans-serif', fontSize: '20px', color: '#111111', align: 'center' }, () => {});

    addShadow(864, 138, 240, 70, 12);
    let binderColor = playerUnlocks.binder ? 0xffc87c : 0x7f8c8d; 
    scene.binderZone = createButton(scene, 864, 138, 240, 70, binderColor, 0x000000, 'BINDER', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }, () => { 
        if (playerUnlocks.binder) {
            scene.closeAllOverlays();
            renderBinderGrid(scene, binderOverlay); binderOverlay.setVisible(true); 
        } else {
            showFloatingText(scene, 864, 138, 'LOCKED! BUY IN STORE', '#e74c3c');
        }
    });

    addShadow(864, 710, 240, 70, 12);
    scene.invZone = createButton(scene, 864, 710, 240, 70, 0xda7aff, 0x000000, 'INVENTORY', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }, () => { 
        scene.closeAllOverlays();
        renderInventoryView(scene, inventoryOverlay); inventoryOverlay.setVisible(true); 
    });

    cardsOnTable.forEach(savedCard => {
        let mojiData = myMojiDatabase.find(m => m.id === savedCard.mojiId);
        if (mojiData) {
            createDraggableCard(scene, savedCard.x, savedCard.y, mojiData, savedCard.instanceId);
        }
    });

    // --- GLOBAL GAME LOOP TIMER ---
    let tickCounter = 0; // NEW: The bank interest counter properly defined here!

    scene.time.addEvent({
        delay: 1000,
        callback: () => {
            checkBailout(scene);
            checkAchievements(scene);

            // --- BANK INTEREST TICK ---
            tickCounter++;
            if (tickCounter >= 60) {
                tickCounter = 0;
                if (playerDebt > 0) {
                    playerDebt *= 1.01; // 1% compound interest
                    saveGame(); 
                    
                    if (scene.bankOverlay && scene.bankOverlay.visible) {
                        renderBankView(scene, scene.bankOverlay);
                    }
                }
            }

            if (currentTrade) {
                let secondsLeft = Math.max(0, Math.floor((tradeExpirationTime - Date.now()) / 1000));
                
                if (scene.activePhoneTimerText && scene.activePhoneTimerText.active) {
                    scene.activePhoneTimerText.setText(`⏳ ${secondsLeft}s`);
                }

                if (Date.now() > tradeExpirationTime) {
                    currentTrade = null;
                    unreadMessage = false;
                    if (scene.phoneNotification) scene.phoneNotification.setVisible(false);
                    saveGame();
                    
                    if (scene.phoneOverlay && scene.phoneOverlay.visible) {
                        if (typeof renderPhoneView === 'function') {
                            renderPhoneView(scene, scene.phoneOverlay);
                        }
                    }

                    scene.time.delayedCall(Phaser.Math.Between(30000, 60000), () => generateTrade(scene));
                }
            }
        },
        loop: true
    });
}

function showPackCloseup(scene, packKey) {
    const closeup = scene.add.container(512, 384).setDepth(200);
    const bg = scene.add.rectangle(0, 0, 1024, 768, 0x000000, 0).setInteractive(); 
    
    const packGraphic = scene.add.container(0, -60);
    packGraphic.add(createPackGraphic(scene, packKey));
    packGraphic.setScale(1.8); 

    const openBtn = createButton(scene, 0, 260, 200, 60, 0x2ecc71, 0xffffff, 'OPEN!', { fontFamily: 'Impact', fontSize: '32px', color: '#ffffff' }, () => {
        playerPacks[packKey] -= 1; 
        saveGame();

        scene.sound.play('pack_rip', { volume: 0.8 });
        
        let totalPacks = playerPacks.basic + playerPacks.premium + playerPacks.legendary;
        scene.packsText.setText('PACKS: ' + totalPacks);

        closeup.destroy();
        spawnBoosterPack(scene, packKey);
    });

    let tableBgColor = themeColors.active.table || 0x2c3e50; 
    let tableContrast = getContrastColor(tableBgColor);

    const closeTxt = scene.add.text(160, -250, '✖', { fontSize: '36px', color: tableContrast }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeTxt.on('pointerdown', () => closeup.destroy());

    closeup.add([bg, packGraphic, openBtn, closeTxt]);
}

function spawnBoosterPack(scene, packId) {
    gameStats.packsOpened++;
    gainXP(scene, 25);
    const packDef = packDatabase[packId];
    let pulledThisPack = {};
    
    let startX = 362; 
    let spacingX = 150; 
    let y = 450; 

    for (let i = 0; i < 3; i++) {
        let pulledMoji = pullCardWithWeights(packDef.weights, packDef.category);
        let isNewCard = (playerInventory[pulledMoji.id] === 0 && !pulledThisPack[pulledMoji.id]);
        pulledThisPack[pulledMoji.id] = true;
        
        let x = startX + (i * spacingX);
        createDraggableCard(scene, x, y, pulledMoji, null, isNewCard, true); 
    }
}

function pullCardWithWeights(weights, categoryFilter = "all") {
    let pool = myMojiDatabase;
    if (categoryFilter !== "all") {
        pool = myMojiDatabase.filter(m => m.category === categoryFilter);
    }

    let totalWeight = 0;
    for (let i = 0; i < pool.length; i++) {
        totalWeight += (weights[pool[i].rarity] || 0);
    }

    let randomNum = Math.random() * totalWeight;
    for (let i = 0; i < pool.length; i++) {
        let weight = (weights[pool[i].rarity] || 0);
        randomNum -= weight;
        if (randomNum <= 0) return pool[i];
    }
    return pool[0]; 
}

function createCardGraphic(scene, mojiData) {
    // 1. BASE LAYER: The Rarity Frame
    let frameKey = 'frame_' + mojiData.rarity; 
    const bgFrame = scene.add.image(0, 0, frameKey);
    bgFrame.setDisplaySize(220, 320); 
    
    // 2. MIDDLE LAYER: The Character Art
    // The Y: -20 pushes the art slightly above the center of the card. Change it if your art box is higher/lower!
    const charArt = scene.add.image(0, -52.5, mojiData.id);
    charArt.setDisplaySize(160, 140); 
    
    // 3. TOP LAYER: Dynamic Text
    let textColor = mojiData.rarity === 'Glitch' ? '#2ecc71' : '#1a1a1a'; 
    
    // --- TEXT POSITIONING ---
    // Nudge the second number (the Y value) up or down to align with your frame!
    
    // NAME: Currently at Y: -135 (Near the very top edge)
    let nameTxt = scene.add.text(0, -140, mojiData.name, { 
        fontSize: '18px', color: textColor, fontStyle: 'bold', align: 'center', wordWrap: { width: 180, useAdvancedWrap: true } 
    }).setOrigin(0.5);
    
    // RARITY: Currently at Y: 85 (Right below the character art)
    const rarityTxt = scene.add.text(0, 35, mojiData.rarity, { 
        fontFamily: 'Arial', fontSize: '16px', color: textColor, fontStyle: 'bold' 
    }).setOrigin(0.5);
    
    // VALUE: Currently at Y: 135 (Near the bottom edge, centered)
    let valTxt = scene.add.text(0, 93.75, '$' + mojiData.baseValue.toFixed(2), { 
        fontSize: '20px', color: textColor, fontStyle: 'bold' 
    }).setOrigin(0.5);

    // CATEGORY ICON: Bottom Left
    let catKey = 'category_' + mojiData.category;
    const catIcon = scene.add.image(-75, 135, catKey);
    catIcon.setDisplaySize(38, 38);
    
    // NUMBER (#001): Currently at X: 95, Y: 135 (Bottom right corner)
    let numStr = '#' + mojiData.id.split('_')[1];
    const numTxt = scene.add.text(85, 143.75, numStr, { 
        fontFamily: 'Arial', fontSize: '16px', color: textColor, fontStyle: 'bold' 
    }).setOrigin(1, 0.5);

    // Return the stacked layers in order (bottom to top)
    return [bgFrame, charArt, nameTxt, rarityTxt, valTxt, catIcon, numTxt];
}

function createCardBackGraphic(scene) {
    // Load the image key 'card_back' that you added to preload()
    const backImg = scene.add.image(0, 0, 'card_back');
    
    // Force the image to fit the standard card size
    backImg.setDisplaySize(220, 320); 
    
    // Return it as an array (so the rest of the game logic still works)
    return [backImg];
}

function addShimmerEffect(scene, card, rarity) {
    let epicColor = rarity === 'Glitch' ? 0x2ecc71 : 0xf1c40f; 

    let glowCont = scene.add.container(0, 0);
    card.addAt(glowCont, 0); 

    for (let i = 0; i < 5; i++) {
        let padding = i * 8; 
        let alpha = 0.3 - (i * 0.06); 
        let glowRing = scene.add.rectangle(0, 0, 220 + padding, 320 + padding, epicColor, alpha);
        glowRing.setBlendMode(Phaser.BlendModes.ADD);
        glowCont.add(glowRing);
    }

    scene.tweens.add({
        targets: glowCont,
        alpha: 0.3,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 1200,
        yoyo: true,
        repeat: -1
    });

    let sweepColor = rarity === 'Glitch' ? 0x2ecc71 : 0xffffff;
    
    let sweepCont = scene.add.container(-85, 0); 
    card.add(sweepCont); 

    let widestBar = scene.add.rectangle(0, 0, 50, 316, sweepColor, 0.02).setBlendMode(Phaser.BlendModes.ADD);
    let wideBar = scene.add.rectangle(0, 0, 30, 316, sweepColor, 0.05).setBlendMode(Phaser.BlendModes.ADD);
    let midBar  = scene.add.rectangle(0, 0, 15, 314, sweepColor, 0.05).setBlendMode(Phaser.BlendModes.ADD);
    let coreBar = scene.add.rectangle(0, 0, 8,  316, sweepColor, 0.05).setBlendMode(Phaser.BlendModes.ADD);

    sweepCont.add([widestBar, wideBar, midBar, coreBar]);

    scene.tweens.add({
        targets: sweepCont,
        x: 85, 
        duration: 2500,
        ease: 'Sine.easeInOut',
        yoyo: true, 
        repeat: -1
    });

    const spawnSparkle = () => {
        if (!card.active) return; 
        
        let sparkCount = Phaser.Math.Between(2, 4);
        for(let i = 0; i < sparkCount; i++) {
            let sx = Phaser.Math.Between(-100, 100);
            let sy = Phaser.Math.Between(-150, 150);
            let spark = scene.add.circle(sx, sy, Phaser.Math.Between(1, 4), epicColor);
            spark.setBlendMode(Phaser.BlendModes.ADD);
            card.add(spark);

            scene.tweens.add({
                targets: spark,
                y: sy - Phaser.Math.Between(30, 80), 
                x: sx + Phaser.Math.Between(-20, 20), 
                alpha: { from: 1, to: 0 },
                scale: { from: 1, to: 0 },
                duration: Phaser.Math.Between(600, 1200),
                onComplete: () => spark.destroy()
            });
        }
        
        scene.time.delayedCall(Phaser.Math.Between(100, 200), spawnSparkle);
    };
    
    spawnSparkle(); 
}

function createPackGraphic(scene, packId) {
    const packDef = packDatabase[packId];
    const bg = scene.add.rectangle(0, 0, 140, 200, packDef.color).setStrokeStyle(4, 0x1a1a1a);
    const strip = scene.add.rectangle(0, -70, 140, 30, 0x1a1a1a);
    const nameTxt = scene.add.text(0, 0, packDef.name.replace(' ', '\n'), { fontFamily: 'Arial', fontSize: '20px', color: '#ffffff', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
    return [bg, strip, nameTxt];
}

function createDraggableCard(scene, x, y, mojiData, existingInstanceId = null, isNew = false, startFaceDown = false) {
    const card = scene.add.container(x, y);
    card.setSize(220, 320);

    const attachNewBadge = () => {
        if (!isNew) return;
        let badgeX = -110, badgeY = -160;
        let starOutline = scene.add.star(badgeX, badgeY, 5, 22, 42, 0x1a1a1a).setAngle(-15);
        let starWhite = scene.add.star(badgeX, badgeY, 5, 18, 38, 0xffffff).setAngle(-15);
        let starRed = scene.add.star(badgeX, badgeY, 5, 14, 34, 0xe74c3c).setAngle(-15);
        let newTxt = scene.add.text(badgeX, badgeY, 'NEW', { fontFamily: 'Impact', fontSize: '16px', color: '#fce883', stroke: '#1a1a1a', strokeThickness: 3 }).setOrigin(0.5).setAngle(-15);
        card.add([starOutline, starWhite, starRed, newTxt]);
    };

    if (startFaceDown) {
        let backGraphics = createCardBackGraphic(scene);
        card.add(backGraphics);
        card.isFaceDown = true;
    } else {
        let faceGraphics = createCardGraphic(scene, mojiData);
        card.add(faceGraphics);
        attachNewBadge();
    }

    card.setInteractive();
    scene.input.setDraggable(card, !startFaceDown); 
    card.setDepth(10);

    card.instanceId = existingInstanceId || ('card_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
    
    if (!existingInstanceId) {
        cardsOnTable.push({ instanceId: card.instanceId, mojiId: mojiData.id, x: x, y: y });
        saveGame();
    }

    card.startX = x;
    card.startY = y;

    card.on('pointerdown', function () {
        if (card.isFaceDown) {
            card.isFaceDown = false;
            scene.children.bringToTop(card);
            card.setDepth(50); 
            
            let isEpic = mojiData.rarity === 'Legendary' || mojiData.rarity === 'Glitch';

            scene.tweens.add({
                targets: card,
                scaleX: 0,
                duration: 150,
                onComplete: () => {
                    card.removeAll(true); 
                    
                    let faceGraphics = createCardGraphic(scene, mojiData);
                    card.add(faceGraphics); 

                    const finishFlip = () => {
                        scene.tweens.add({
                            targets: card,
                            scaleX: 1,
                            duration: 150,
                            onComplete: () => {
                                attachNewBadge(); 
                                scene.input.setDraggable(card, true); 
                                card.setDepth(10);
                                
                                if (isEpic) addShimmerEffect(scene, card, mojiData.rarity);
                            }
                        });
                    };
                     
                    if (isEpic) {
                        scene.sound.play('epic_rumble', { volume: 1.0 });  
                        scene.cameras.main.shake(1500, 0.015);    
                        scene.time.delayedCall(1500, finishFlip); 
                        scene.sound.play('epic_reveal', { volume: 1.0 });
                    } else {
                        scene.sound.play('flip', { volume: 0.4 });
                        finishFlip(); 
                    }
                }
            });
        }
    });

    card.on('dragstart', function () { 
        if (card.isFaceDown) return;
        
        scene.children.bringToTop(this);
        
        this.setScale(1.05); 
        this.setDepth(50); 
        this.startX = this.x; 
        this.startY = this.y; 
    });
    
    card.on('drag', function (p, dragX, dragY) { 
        if (!card.isFaceDown) { this.x = dragX; this.y = dragY; } 
    });
    
    card.on('dragend', function () {
        if (card.isFaceDown) return;
        
        this.setScale(1); 
        this.setDepth(10); 
        let bounds = this.getBounds();
        let dropped = false;
        let isBouncing = false;
        
        if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, scene.binderZone.getBounds())) {
            if (playerUnlocks.binder) {
                playerInventory[mojiData.id] = Number(playerInventory[mojiData.id]) + 1; 
                showFloatingText(scene, this.x, this.y, 'SAVED!', '#9b59b6');
                gainXP(scene, 10);
                dropped = true;
            } else {
                showFloatingText(scene, this.x, this.y, 'BINDER LOCKED!', '#e74c3c');
                scene.tweens.add({ targets: this, x: this.startX, y: this.startY, duration: 200, ease: 'Back.easeOut' });
                isBouncing = true;
            }
        } 
        else if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, scene.invZone.getBounds())) {
            playerInventory[mojiData.id] = Number(playerInventory[mojiData.id]) + 1; 
            showFloatingText(scene, this.x, this.y, 'STASHED!', '#9b59b6');
            gainXP(scene, 5);
            dropped = true;
        }
        else if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, scene.sellZone.getBounds())) {
            playerMoney += Number(mojiData.baseValue); 
            scene.moneyText.setText('$' + playerMoney.toFixed(2));
            showFloatingText(scene, this.x, this.y, 'SOLD!', '#e74c3c');
            
            scene.sound.play('coin', { volume: 0.6 });
            
            dropped = true;
        }

        if (dropped) {
            cardsOnTable = cardsOnTable.filter(c => c.instanceId !== this.instanceId);
            saveGame(); 
            this.destroy(); 
        } else {
            let tableRecord = cardsOnTable.find(c => c.instanceId === this.instanceId);
            if (tableRecord) {
                tableRecord.x = isBouncing ? this.startX : this.x;
                tableRecord.y = isBouncing ? this.startY : this.y;
            }
            saveGame();
        }
    });
}
