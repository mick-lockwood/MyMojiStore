const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#2c3e50',
    parent: 'game-container',
    scene: { create: create }
};

const game = new Phaser.Game(config);

function create() {
    const scene = this; 
    scene.cameras.main.setBackgroundColor(themeColors.table);

    // Standard hard angled shadow for buttons
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

    // NEW: Calculate the best text color based on the banner background
    let bannerContrast = getContrastColor(themeColors.active.banner);

    scene.moneyText = scene.add.text(20, 10, '$' + playerMoney.toFixed(2), { fontFamily: 'Impact, sans-serif', fontSize: '36px', color: bannerContrast });
    let totalPacks = Object.values(playerPacks).reduce((a, b) => a + b, 0);
    scene.packsText = scene.add.text(20, 50, 'PACKS: ' + totalPacks, { fontFamily: 'Impact, sans-serif', fontSize: '20px', color: bannerContrast });

    scene.titleText = scene.add.text(512, 40, storeName, { fontFamily: 'Impact, sans-serif', fontSize: '48px', color: bannerContrast }).setOrigin(0.5);
    
    // Assign the banner background to a variable so the settings menu can change its color
    scene.headerBg = scene.add.rectangle(512, 40, 1024, 80, themeColors.active.banner); 

    scene.moneyText = scene.add.text(20, 10, '$' + playerMoney.toFixed(2), { fontFamily: 'Impact, sans-serif', fontSize: '36px', color: '#222222' });
    let totalPacks = Object.values(playerPacks).reduce((a, b) => a + b, 0);
    scene.packsText = scene.add.text(20, 50, 'PACKS: ' + totalPacks, { fontFamily: 'Impact, sans-serif', fontSize: '20px', color: '#222222' });

    // NEW: Editable Title Logic
    scene.titleText = scene.add.text(512, 40, storeName, { fontFamily: 'Impact, sans-serif', fontSize: '48px', color: '#222222' }).setOrigin(0.5);
    
    // Position the pencil dynamically based on how long the text is
    let updatePencilPos = () => { scene.pencilIcon.setX(512 + (scene.titleText.width / 2) + 25); };
    
    scene.pencilIcon = scene.add.text(0, 40, '✏️', { fontSize: '24px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    updatePencilPos(); // Initial placement

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
                let newName = prompt("Enter your new store name:", storeName);
                if (newName && newName.trim() !== "") {
                    if (cost > 0) {
                        playerMoney -= cost;
                        scene.moneyText.setText('$' + playerMoney.toFixed(2));
                    }
                    storeName = newName.trim();
                    hasRenamed = true;
                    scene.titleText.setText(storeName);
                    updatePencilPos(); // Move the pencil to fit the new text width!
                    saveGame();
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
    phoneBtn.on('pointerdown', () => { 
        unreadMessage = false; 
        scene.phoneNotification.setVisible(false); 
        renderPhoneView(scene, scene.phoneOverlay); 
        scene.phoneOverlay.setVisible(true); 
    });

    // --- OVERLAYS ---
    const binderOverlay = createBinderOverlay(scene);
    scene.binderOverlay = binderOverlay; 
    
    const storeOverlay = createStoreOverlay(scene);
    const inventoryOverlay = createInventoryOverlay(scene);
    const settingsOverlay = createSettingsOverlay(scene, binderOverlay, inventoryOverlay);
    
    scene.phoneOverlay = createPhoneOverlay(scene); 

    settingsBtn.on('pointerdown', () => { settingsOverlay.renderPalettes(); settingsOverlay.setVisible(true); });

    if (!currentTrade) scene.time.delayedCall(15000, () => generateTrade(scene));

    // --- MAIN HUD BUTTONS & DROP ZONES ---
    
    // 1. TRADING STASH
    addShadow(160, 138, 240, 70, 12);
    let tradeBtn = createButton(scene, 160, 138, 240, 70, 0x57bcf2, 0x000000, 'TRADING STASH', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }, null);

    // "Coming Soon" Badge attached to the Trading Stash button
    let badgeBg = scene.add.rectangle(90, -25, 110, 26, 0xe74c3c).setStrokeStyle(2, 0xffffff);
    let badgeTxt = scene.add.text(90, -25, 'COMING SOON', { fontFamily: 'Arial', fontSize: '12px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    
    // Give it a playful tilt!
    badgeBg.setAngle(12);
    badgeTxt.setAngle(12);
    
    tradeBtn.add([badgeBg, badgeTxt]);

    // 2. SELL ON MOJIMARKET
    addShadow(160, 710, 240, 70, 12);
    scene.sellZone = createButton(scene, 160, 710, 240, 70, 0xff7e8d, 0x000000, 'SELL ON\nMOJIMARKET', { fontFamily: 'Impact, sans-serif', fontSize: '20px', color: '#111111', align: 'center' }, () => {});

    addShadow(864, 138, 240, 70, 12);
    let binderColor = playerUnlocks.binder ? 0xffc87c : 0x7f8c8d; 
    scene.binderZone = createButton(scene, 864, 138, 240, 70, binderColor, 0x000000, 'BINDER', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }, () => { 
        if (playerUnlocks.binder) {
            renderBinderGrid(scene, binderOverlay); binderOverlay.setVisible(true); 
        } else {
            showFloatingText(scene, 864, 138, 'LOCKED! BUY IN STORE', '#e74c3c');
        }
    });

    addShadow(864, 710, 240, 70, 12);
    scene.invZone = createButton(scene, 864, 710, 240, 70, 0xda7aff, 0x000000, 'INVENTORY', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }, () => { 
        renderInventoryView(scene, inventoryOverlay); inventoryOverlay.setVisible(true); 
    });

    cardsOnTable.forEach(savedCard => {
        let mojiData = myMojiDatabase.find(m => m.id === savedCard.mojiId);
        if (mojiData) {
            createDraggableCard(scene, savedCard.x, savedCard.y, mojiData, savedCard.instanceId);
        }
    });

    // The Global Watcher! 
    // This runs in the background every 1 second and checks if the player is soft-locked.
    scene.time.addEvent({
        delay: 1000,
        callback: () => checkBailout(scene),
        loop: true
    });
}

function spawnBoosterPack(scene, packId) {
    const packDef = packDatabase[packId];
    for (let i = 0; i < 3; i++) {
        // Pass the category filter to the pull logic!
        let pulledMoji = pullCardWithWeights(packDef.weights, packDef.category);
        let randX = Phaser.Math.Between(150, 874); 
        let randY = Phaser.Math.Between(340, 510);
        createDraggableCard(scene, randX, randY, pulledMoji);
    }
}

function pullCardWithWeights(weights, categoryFilter = "all") {
    // 1. Filter the database if a specific category is required
    let pool = myMojiDatabase;
    if (categoryFilter !== "all") {
        pool = myMojiDatabase.filter(m => m.category === categoryFilter);
    }

    // 2. Sum up the weights of the remaining cards
    let totalWeight = 0;
    for (let i = 0; i < pool.length; i++) {
        totalWeight += (weights[pool[i].rarity] || 0);
    }

    // 3. Roll the dice
    let randomNum = Math.random() * totalWeight;
    for (let i = 0; i < pool.length; i++) {
        let weight = (weights[pool[i].rarity] || 0);
        randomNum -= weight;
        if (randomNum <= 0) return pool[i];
    }
    return pool[0]; 
}

function createCardGraphic(scene, mojiData) {
    let bgColor = 0xffffff; // Common default
    if (mojiData.rarity === 'Rare') bgColor = 0xd0ebff;      // Pastel Blue
    if (mojiData.rarity === 'Epic') bgColor = 0xe8d0ff;      // Pastel Purple
    if (mojiData.rarity === 'Legendary') bgColor = 0xfff0b3; // Pastel Gold
    if (mojiData.rarity === 'Glitch') bgColor = 0x111111;    // Dark Mode

    let isGlitch = mojiData.rarity === "Glitch";
    let strokeColor = isGlitch ? 0xff00ff : 0x1a1a1a; 
    let textColor = isGlitch ? '#00ffff' : '#000000'; 
    let valColor = isGlitch ? '#ff00ff' : '#27ae60';

    const bg = scene.add.rectangle(0, 0, 220, 320, bgColor).setStrokeStyle(6, strokeColor);
    const imgBox = scene.add.rectangle(0, -40, 180, 160, 0xe0e0e0).setStrokeStyle(3, 0xcccccc);
    const nameTxt = scene.add.text(0, -140, mojiData.name, { fontFamily: 'Arial', fontSize: '20px', color: textColor, fontStyle: 'bold' }).setOrigin(0.5);
    const rarityTxt = scene.add.text(0, 70, mojiData.rarity, { fontFamily: 'Arial', fontSize: '16px', color: '#7f8c8d' }).setOrigin(0.5);
    const valTxt = scene.add.text(0, 110, '$' + mojiData.baseValue.toFixed(2), { fontFamily: 'Arial', fontSize: '24px', color: valColor, fontStyle: 'bold' }).setOrigin(0.5);
    
    let numStr = '#' + mojiData.id.split('_')[1];
    const numTxt = scene.add.text(95, 140, numStr, { fontFamily: 'Arial', fontSize: '22px', color: '#7f8c8d', fontStyle: 'bold' }).setOrigin(1, 0.5);

    return [bg, imgBox, nameTxt, rarityTxt, valTxt, numTxt];
}

function createPackGraphic(scene, packId) {
    const packDef = packDatabase[packId];
    const bg = scene.add.rectangle(0, 0, 140, 200, packDef.color).setStrokeStyle(4, 0x1a1a1a);
    const strip = scene.add.rectangle(0, -70, 140, 30, 0x1a1a1a);
    const nameTxt = scene.add.text(0, 0, packDef.name.replace(' ', '\n'), { fontFamily: 'Arial', fontSize: '20px', color: '#ffffff', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
    return [bg, strip, nameTxt];
}

function createDraggableCard(scene, x, y, mojiData, existingInstanceId = null) {
    const card = scene.add.container(x, y);
    card.add(createCardGraphic(scene, mojiData));
    card.setSize(220, 320);
    card.setInteractive();
    scene.input.setDraggable(card);
    card.setDepth(10); 

    card.instanceId = existingInstanceId || ('card_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
    
    if (!existingInstanceId) {
        cardsOnTable.push({ instanceId: card.instanceId, mojiId: mojiData.id, x: x, y: y });
        saveGame();
    }

    card.startX = x;
    card.startY = y;

    card.on('drag', function (p, dragX, dragY) { this.x = dragX; this.y = dragY; });
    
    card.on('dragstart', function () { 
        this.setScale(1.05); 
        this.setDepth(50); 
        this.startX = this.x; 
        this.startY = this.y; 
    });
    
    card.on('dragend', function () {
        this.setScale(1); 
        this.setDepth(10); 
        let bounds = this.getBounds();
        let dropped = false;
        let isBouncing = false;
        
        if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, scene.binderZone.getBounds())) {
            if (playerUnlocks.binder) {
                playerInventory[mojiData.id] = Number(playerInventory[mojiData.id]) + 1; 
                showFloatingText(scene, this.x, this.y, 'SAVED!', '#9b59b6');
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
            dropped = true;
        }
        else if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, scene.sellZone.getBounds())) {
            playerMoney += Number(mojiData.baseValue); 
            scene.moneyText.setText('$' + playerMoney.toFixed(2));
            showFloatingText(scene, this.x, this.y, 'SOLD!', '#e74c3c');
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
