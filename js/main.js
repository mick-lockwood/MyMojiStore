// --- DATABASE: BOOSTER PACKS ---
const packDatabase = {
    "basic": { name: "Basic Pack", cost: 5.00, color: 0x2ecc71, weights: { "Common": 75, "Rare": 20, "Epic": 4, "Legendary": 1 } },
    "premium": { name: "Premium Pack", cost: 20.00, color: 0x9b59b6, weights: { "Common": 30, "Rare": 40, "Epic": 20, "Legendary": 10 } },
    "legendary": { name: "Legendary Pack", cost: 100.00, color: 0xf1c40f, weights: { "Common": 0, "Rare": 20, "Epic": 40, "Legendary": 40 } }
};

// --- GLOBAL STATE & LOCAL STORAGE ---
let playerMoney = 50.00;
let playerPacks = { "basic": 0, "premium": 0, "legendary": 0 };
let playerInventory = {};
let shoppingCart = { "basic": 0, "premium": 0, "legendary": 0 }; 
let themeColors = { 
    table: '#f4f4f4', binder: 0x1a1a1a, inventory: 0x1a1a1a,
    active: { table: 0xf4f4f4, binder: 0x1a1a1a, inv: 0x1a1a1a }
};

// The first 3 colors (Black, White, Grey) are unlocked by default
let playerUnlocks = { 
    binder: false, 
    colorThemes: false, 
    colors: [0x1a1a1a, 0xf4f4f4, 0x7f8c8d] 
};  

myMojiDatabase.forEach(moji => playerInventory[moji.id] = 0);

// Database for Store Upgrades
const upgradeDatabase = {
    "binder": { name: "Pro Binder", cost: 150.00 },
    "colorThemes": { name: "Color Palettes", cost: 75.00 }
};

function loadGame() {
    let savedData = localStorage.getItem('myMojiSave');
    if (savedData) {
        let parsedData = JSON.parse(savedData);
        playerMoney = parsedData.money !== undefined ? Number(parsedData.money) : 50;
        if (parsedData.packs) playerPacks = { ...playerPacks, ...parsedData.packs };
        for (let id in parsedData.inventory) {
            if (playerInventory[id] !== undefined) playerInventory[id] = Number(parsedData.inventory[id]);
        }
        
        // Load Unlocks (Store Upgrades & Individual Colors)
        if (parsedData.unlocks) {
            if (parsedData.unlocks.binder !== undefined) playerUnlocks.binder = parsedData.unlocks.binder;
            if (parsedData.unlocks.colorThemes !== undefined) playerUnlocks.colorThemes = parsedData.unlocks.colorThemes; 
            if (parsedData.unlocks.colors) playerUnlocks.colors = parsedData.unlocks.colors;
        }

        // Load Equipped Themes
        if (parsedData.themes) {
            themeColors = parsedData.themes;
            // Self-healing: if an old save doesn't have the 'active' tracker, build it
            if (!themeColors.active) {
                themeColors.active = { table: 0xf4f4f4, binder: 0x1a1a1a, inv: 0x1a1a1a };
            }
        }
    }
}

function saveGame() {
    localStorage.setItem('myMojiSave', JSON.stringify({
        money: playerMoney,
        packs: playerPacks,
        inventory: playerInventory,
        unlocks: playerUnlocks, // Saves the store upgrades and purchased color arrays
        themes: themeColors     // Saves the active checkmarks and applied UI colors
    }));
}

loadGame();

// --- PHASER ENGINE SETUP ---
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#2c3e50',
    parent: 'game-container',
    scene: { create: create }
};

const game = new Phaser.Game(config);

// NEW HELPER: Reusable Rounded Button with Hover & Click Animations
function createButton(scene, x, y, width, height, fillColor, strokeColor, textStr, textStyle, onClick) {
    const container = scene.add.container(x, y);
    container.setSize(width, height);
    
    // Draw rounded background
    const bg = scene.add.graphics();
    bg.fillStyle(fillColor, 1);
    bg.fillRoundedRect(-width/2, -height/2, width, height, 12); // 12px radius
    
    if (strokeColor !== null) {
        bg.lineStyle(4, strokeColor, 1);
        bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);
    }
    
    const txt = scene.add.text(0, 0, textStr, textStyle).setOrigin(0.5);
    container.add([bg, txt]);
    
    if (onClick) {
        container.setInteractive({ useHandCursor: true });
        
        // Hover Scale Up
        container.on('pointerover', () => scene.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 }));
        
        // Hover Scale Down
        container.on('pointerout', () => scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 }));
        
        // Click Bounce
        container.on('pointerdown', () => {
            scene.tweens.add({ targets: container, scaleX: 0.95, scaleY: 0.95, duration: 50, yoyo: true });
            onClick();
        });
    }
    return container;
}

function create() {
    const scene = this; 
    scene.cameras.main.setBackgroundColor(themeColors.table);

    // UPDATED: Shadow helper now supports rounded corners for our new buttons
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
    addShadow(512, 40, 1024, 80); 
    scene.add.rectangle(512, 40, 1024, 80, 0xfce883); 

    scene.moneyText = scene.add.text(20, 10, '$' + playerMoney.toFixed(2), { fontFamily: 'Impact, sans-serif', fontSize: '36px', color: '#222222' });
    let totalPacks = playerPacks.basic + playerPacks.premium + playerPacks.legendary;
    scene.packsText = scene.add.text(20, 50, 'PACKS: ' + totalPacks, { fontFamily: 'Impact, sans-serif', fontSize: '20px', color: '#222222' });

    scene.add.text(512, 40, 'MyMoji Store', { fontFamily: 'Impact, sans-serif', fontSize: '48px', color: '#222222' }).setOrigin(0.5);

    // Header Icons (Added hover tweens)
    const storeIconBtn = scene.add.text(920, 40, '🛒', { fontSize: '44px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    storeIconBtn.on('pointerover', () => scene.tweens.add({ targets: storeIconBtn, scale: 1.2, duration: 100 }));
    storeIconBtn.on('pointerout', () => scene.tweens.add({ targets: storeIconBtn, scale: 1, duration: 100 }));
    storeIconBtn.on('pointerdown', () => { storeOverlay.currentView = 'shop'; renderStoreView(scene, storeOverlay); storeOverlay.setVisible(true); 
    });

    const settingsBtn = scene.add.text(980, 40, '⚙️', { fontFamily: 'Arial, sans-serif', fontSize: '44px', color: '#000000' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    settingsBtn.on('pointerover', () => scene.tweens.add({ targets: settingsBtn, angle: 45, duration: 200 }));
    settingsBtn.on('pointerout', () => scene.tweens.add({ targets: settingsBtn, angle: 0, duration: 200 }));

    // --- OVERLAYS ---
    const binderOverlay = createBinderOverlay(scene);
    
    // NEW: Attach the binder to the scene so the Store can access it!
    scene.binderOverlay = binderOverlay; 
    
    const storeOverlay = createStoreOverlay(scene);
    const inventoryOverlay = createInventoryOverlay(scene);
    const settingsOverlay = createSettingsOverlay(scene, binderOverlay, inventoryOverlay);

    settingsBtn.on('pointerdown', () => { 
        settingsOverlay.renderPalettes(); 
        settingsOverlay.setVisible(true); 
    });

    /// --- BOTTOM BUTTONS / DROP ZONES ---
    
    // 1. TRADING STASH (Deactivated)
    addShadow(160, 620, 240, 70, 12);
    createButton(scene, 160, 620, 240, 70, 0x57bcf2, 0x000000, 'TRADING STASH', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }, null);

    // 2. SELL ON MOJIMARKET
    addShadow(160, 710, 240, 70, 12);
    scene.sellZone = createButton(scene, 160, 710, 240, 70, 0xff7e8d, 0x000000, 'SELL ON\nMOJIMARKET', { fontFamily: 'Impact, sans-serif', fontSize: '20px', color: '#111111', align: 'center' }, () => {});

    // 3. BINDER (Locked vs Unlocked state)
    addShadow(864, 620, 240, 70, 12);
    let binderColor = playerUnlocks.binder ? 0xffc87c : 0x7f8c8d; // Grey if locked
    scene.binderZone = createButton(scene, 864, 620, 240, 70, binderColor, 0x000000, 'BINDER', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }, () => { 
        if (playerUnlocks.binder) {
            renderBinderGrid(scene, binderOverlay); binderOverlay.setVisible(true); 
        } else {
            showFloatingText(scene, 864, 620, 'LOCKED! BUY IN STORE', '#e74c3c');
        }
    });

    // 4. INVENTORY (Saved to scene.invZone so cards can be dropped here!)
    addShadow(864, 710, 240, 70, 12);
    scene.invZone = createButton(scene, 864, 710, 240, 70, 0xda7aff, 0x000000, 'INVENTORY', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }, () => { 
        renderInventoryView(scene, inventoryOverlay); inventoryOverlay.setVisible(true); 
    });
}

function createSettingsOverlay(scene, binderOverlay, inventoryOverlay) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(300);
    
    const bg = scene.add.rectangle(0, 0, 600, 420, 0xffffff).setStrokeStyle(4, 0x000000).setInteractive();
    overlay.add(bg); 
    
    const title = scene.add.text(0, -170, 'SETTINGS', { fontFamily: 'Impact', fontSize: '32px', color: '#000' }).setOrigin(0.5);
    const closeTxt = scene.add.text(270, -170, '✖', { fontSize: '28px', color: '#000' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    const resetBtn = createButton(scene, 0, 160, 200, 40, 0xe74c3c, 0x000000, 'DELETE SAVE FILE', { fontFamily: 'Arial', fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
        if (confirm("Delete save and start over?")) { localStorage.removeItem('myMojiSave'); location.reload(); }
    });

    const instrBtn = createButton(scene, 0, 100, 200, 40, 0x3498db, 0x000000, 'HOW TO PLAY', { fontFamily: 'Arial', fontSize: '18px', color: '#fff', fontStyle: 'bold' }, () => {
        alert("HOW TO PLAY:\n\n1. Buy packs from the Store.\n2. Open packs in your Inventory.\n3. Drag cards to the Binder to save them, or to the Market to sell them for cash.\n4. Collect all 108 MyMojis!");
    });

    overlay.paletteContainer = scene.add.container(0, 0);
    overlay.add([title, closeTxt, resetBtn, instrBtn, overlay.paletteContainer]);

    // Standard colors (first 3 are free/unlocked by default)
    const stdColors = [0x1a1a1a, 0xf4f4f4, 0x7f8c8d, 0xc0392b, 0x2980b9, 0x27ae60, 0x8e44ad, 0xd35400];
    const vipColors = [0xf1c40f, 0xbdc3c7, 0xcd7f32, 0xff00ff];
    const allColors = [...stdColors, ...vipColors];

    overlay.renderPalettes = () => {
        overlay.paletteContainer.removeAll(true);
        
        // MASTER LOCK: Hide palettes if not purchased from the store!
        if (!playerUnlocks.colorThemes) {
            let lockBg = scene.add.rectangle(0, -30, 400, 80, 0xf4f4f4).setStrokeStyle(2, 0x000);
            let lockTxt = scene.add.text(0, -30, "🎨 COLOR THEMES LOCKED\nPurchase in the Store's UNLOCKS tab!", { fontSize: '18px', color: '#7f8c8d', align: 'center', fontStyle: 'bold' }).setOrigin(0.5);
            overlay.paletteContainer.add([lockBg, lockTxt]);
            return; 
        }

        let allStdUnlocked = stdColors.every(c => playerUnlocks.colors.includes(c));

        const drawRow = (y, label, type) => {
            let labelTxt = scene.add.text(-270, y, label, { fontFamily: 'Arial', fontSize: '18px', color: '#000', fontStyle: 'bold' }).setOrigin(0, 0.5);
            overlay.paletteContainer.add(labelTxt);

            let startX = -110;
            let spacing = 35;

            allColors.forEach((color, index) => {
                let isVip = index >= stdColors.length;
                let isUnlocked = playerUnlocks.colors.includes(color);
                let isActive = themeColors.active && themeColors.active[type] === color; 
                
                let swatch = scene.add.rectangle(startX + (index * spacing), y, 30, 30, color).setInteractive({ useHandCursor: true });
                swatch.setStrokeStyle(isActive ? 4 : 2, isActive ? 0x2ecc71 : 0x000000);

                if (!isUnlocked) {
                    let lockTxt = scene.add.text(startX + (index * spacing), y, isVip ? 'VIP' : '🔒', { fontSize: isVip ? '11px' : '14px', color: isVip ? '#f1c40f' : '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
                    overlay.paletteContainer.add([swatch, lockTxt]);

                    swatch.on('pointerdown', () => {
                        if (isVip && !allStdUnlocked) {
                            alert("You must unlock all standard colors before buying VIP palettes!");
                            return;
                        }
                        
                        let cost = isVip ? 75 : 50;
                        if (confirm(`This color costs $${cost}. Would you like to purchase it?`)) {
                            if (playerMoney >= cost) {
                                playerMoney -= cost;
                                scene.moneyText.setText('$' + playerMoney.toFixed(2));
                                playerUnlocks.colors.push(color);
                                saveGame(); // Save immediately after purchasing
                                overlay.renderPalettes(); 
                            } else {
                                alert("Not enough money!");
                            }
                        }
                    });

                } else {
                    if (isActive) {
                        let checkColor = (color === 0xf4f4f4 || color === 0xbdc3c7 || color === 0xf1c40f) ? '#000000' : '#ffffff';
                        let checkTxt = scene.add.text(startX + (index * spacing), y, '✔', { fontSize: '18px', color: checkColor, fontStyle: 'bold' }).setOrigin(0.5);
                        overlay.paletteContainer.add([swatch, checkTxt]);
                    } else {
                        overlay.paletteContainer.add(swatch);
                    }
                    
                    swatch.on('pointerover', () => scene.tweens.add({ targets: swatch, scale: 1.2, duration: 100 }));
                    swatch.on('pointerout', () => scene.tweens.add({ targets: swatch, scale: 1, duration: 100 }));
                    
                    swatch.on('pointerdown', () => {
                        if (!themeColors.active) themeColors.active = {};
                        themeColors.active[type] = color; 
                        
                        if (type === 'table') { 
                            themeColors.table = '#' + color.toString(16).padStart(6, '0'); 
                            scene.cameras.main.setBackgroundColor(themeColors.table); 
                        }
                        if (type === 'binder') { 
                            themeColors.binder = color; 
                            binderOverlay.bg.setFillStyle(color); 
                        }
                        if (type === 'inv') { 
                            themeColors.inventory = color; 
                            inventoryOverlay.bg.setFillStyle(color); 
                        }
                        saveGame(); // Save immediately when equipping a color
                        overlay.renderPalettes(); 
                    });
                }
            });
        };

        drawRow(-90, "Table Color", 'table');
        drawRow(-30, "Binder Color", 'binder');
        drawRow(30, "Inventory Color", 'inv');
    };

    overlay.renderPalettes(); 
    return overlay;
}

// --- CORE MECHANICS ---

// NEW: Visual feedback for dropping cards
function showFloatingText(scene, x, y, message, colorHex) {
    let txt = scene.add.text(x, y, message, { 
        fontFamily: 'Arial', fontSize: '22px', color: colorHex, fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 
    }).setOrigin(0.5).setDepth(200);

    scene.tweens.add({
        targets: txt,
        y: y - 60,
        alpha: 0,
        duration: 1200,
        onComplete: () => txt.destroy()
    });
}

function spawnBoosterPack(scene, packId) {
    const packDef = packDatabase[packId];
    const spacing = 260; 
    let startX = 252;    
    
    for (let i = 0; i < 3; i++) {
        let pulledMoji = pullCardWithWeights(packDef.weights);
        createDraggableCard(scene, startX + (i * spacing), 350, pulledMoji);
    }
}

function pullCardWithWeights(weights) {
    let totalWeight = 0;
    for (let i = 0; i < myMojiDatabase.length; i++) totalWeight += weights[myMojiDatabase[i].rarity];
    let randomNum = Math.random() * totalWeight;
    for (let i = 0; i < myMojiDatabase.length; i++) {
        randomNum -= weights[myMojiDatabase[i].rarity];
        if (randomNum <= 0) return myMojiDatabase[i];
    }
    return myMojiDatabase[0]; 
}

function createCardGraphic(scene, mojiData) {
    const bg = scene.add.rectangle(0, 0, 220, 320, 0xffffff).setStrokeStyle(6, 0x1a1a1a);
    const imgBox = scene.add.rectangle(0, -40, 180, 160, 0xe0e0e0).setStrokeStyle(3, 0xcccccc);
    const nameTxt = scene.add.text(0, -140, mojiData.name, { fontFamily: 'Arial', fontSize: '20px', color: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
    const rarityTxt = scene.add.text(0, 70, mojiData.rarity, { fontFamily: 'Arial', fontSize: '16px', color: '#7f8c8d' }).setOrigin(0.5);
    const valTxt = scene.add.text(0, 110, '$' + mojiData.baseValue.toFixed(2), { fontFamily: 'Arial', fontSize: '24px', color: '#27ae60', fontStyle: 'bold' }).setOrigin(0.5);
    
    // INCREASED SIZE: Bumped from 14px to 22px so it's readable in the binder!
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

function createDraggableCard(scene, x, y, mojiData) {
    const card = scene.add.container(x, y);
    card.add(createCardGraphic(scene, mojiData));
    card.setSize(220, 320);
    card.setInteractive();
    scene.input.setDraggable(card);
    card.setDepth(10); 

    card.on('drag', function (p, dragX, dragY) { this.x = dragX; this.y = dragY; });
    card.on('dragstart', function () { this.setScale(1.05); this.setDepth(50); });
    
    card.on('dragend', function () {
        this.setScale(1); 
        this.setDepth(10); 
        let bounds = this.getBounds();
        
        // NEW: Checks if dropped on Binder OR Inventory!
        if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, scene.binderZone.getBounds()) || 
            Phaser.Geom.Intersects.RectangleToRectangle(bounds, scene.invZone.getBounds())) {
            
            playerInventory[mojiData.id] = Number(playerInventory[mojiData.id]) + 1; 
            saveGame(); 
            showFloatingText(scene, this.x, this.y, 'SAVED!', '#9b59b6');
            this.destroy(); 
        } 
        else if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, scene.sellZone.getBounds())) {
            playerMoney += Number(mojiData.baseValue); 
            scene.moneyText.setText('$' + playerMoney.toFixed(2));
            saveGame(); 
            showFloatingText(scene, this.x, this.y, 'SOLD!', '#e74c3c');
            this.destroy(); 
        }
    });
}

// --- STORE UI & LOGIC ---

function createStoreOverlay(scene) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(100); 
    const bg = scene.add.rectangle(0, 0, 900, 650, 0x1a1a1a).setStrokeStyle(4, 0xecf0f1).setInteractive(); 
    const title = scene.add.text(0, -290, 'MOJI STORE', { fontFamily: 'Impact, sans-serif', fontSize: '32px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    
    const closeTxt = scene.add.text(410, -290, '✖', { fontSize: '28px', color: '#ffffff' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    overlay.add([bg, title, closeTxt]);

    overlay.currentView = 'shop'; 
    overlay.currentStoreTab = 'packs'; // NEW: Track shop tabs
    overlay.contentContainer = scene.add.container(0, 0);
    overlay.add(overlay.contentContainer);

    return overlay;
}

function renderStoreView(scene, overlay) {
    overlay.contentContainer.removeAll(true);

    let totalItems = 0;
    let totalCost = 0;
    for (let k in shoppingCart) {
        totalItems += shoppingCart[k];
        totalCost += shoppingCart[k] * packDatabase[k].cost;
    }

    if (overlay.currentView === 'shop') {
        let viewCartBtn = createButton(scene, -300, -290, 200, 40, 0x7f8c8d, 0xffffff, `🛒 CART (${totalItems}) - $${totalCost.toFixed(2)}`, { fontSize: '14px', color: '#fff', fontStyle: 'bold' }, () => {
            overlay.currentView = 'cart';
            renderStoreView(scene, overlay);
        });
        overlay.contentContainer.add(viewCartBtn);

        // NEW: Store Tabs
        let packsColor = overlay.currentStoreTab === 'packs' ? '#ffffff' : '#7f8c8d';
        let unlocksColor = overlay.currentStoreTab === 'unlocks' ? '#ffffff' : '#7f8c8d';

        let packsTab = scene.add.text(-100, -230, 'PACKS', { fontSize: '24px', fontStyle: 'bold', color: packsColor }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
        packsTab.on('pointerdown', () => { overlay.currentStoreTab = 'packs'; renderStoreView(scene, overlay); });

        let unlocksTab = scene.add.text(100, -230, 'UNLOCKS', { fontSize: '24px', fontStyle: 'bold', color: unlocksColor }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
        unlocksTab.on('pointerdown', () => { overlay.currentStoreTab = 'unlocks'; renderStoreView(scene, overlay); });

        overlay.contentContainer.add([packsTab, unlocksTab]);

        if (overlay.currentStoreTab === 'packs') {
            let packKeys = Object.keys(packDatabase);
            let startX = -250;
            packKeys.forEach((key, index) => {
                let def = packDatabase[key];
                let packCont = scene.add.container(startX + (index * 250), -50);
                packCont.add(createPackGraphic(scene, key));

                let priceTxt = scene.add.text(0, 130, '$' + def.cost.toFixed(2), { fontSize: '24px', color: '#2ecc71', fontStyle: 'bold' }).setOrigin(0.5);
                let addBtn = createButton(scene, 0, 180, 140, 40, 0x3498db, null, '+ ADD TO CART', { fontSize: '14px', color: '#fff', fontStyle: 'bold' }, () => {
                    shoppingCart[key] += 1;
                    renderStoreView(scene, overlay); 
                });

                packCont.add([priceTxt, addBtn]);
                overlay.contentContainer.add(packCont);
            });
        } 
        else if (overlay.currentStoreTab === 'unlocks') {
            let upgStartX = -150;
            let upgIndex = 0;
            let hasUnlocks = false;
            
            for (let key in upgradeDatabase) {
                if (!playerUnlocks[key]) {
                    hasUnlocks = true;
                    let def = upgradeDatabase[key];
                    let upgCont = scene.add.container(upgStartX + (upgIndex * 300), 20);
                    
                    let bg = scene.add.rectangle(0, 0, 250, 100, 0x34495e).setStrokeStyle(4, 0x1a1a1a);
                    let nameTxt = scene.add.text(0, -20, def.name, { fontSize: '22px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
                    
                    let buyBtn = createButton(scene, 0, 25, 180, 36, 0xf39c12, 0xffffff, `BUY FOR $${def.cost.toFixed(2)}`, { fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
                        if (playerMoney >= def.cost) {
                            playerMoney -= def.cost;
                            scene.moneyText.setText('$' + playerMoney.toFixed(2));
                            playerUnlocks[key] = true;
                            saveGame();
                            
                            if (key === 'binder') {
                                scene.binderZone.destroy();
                                scene.binderZone = createButton(scene, 864, 620, 240, 70, 0xffc87c, 0x000000, 'BINDER', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }, () => { 
                                    renderBinderGrid(scene, scene.binderOverlay); scene.binderOverlay.setVisible(true); 
                                });
                            }
                            renderStoreView(scene, overlay); 
                        } else {
                            buyBtn.list[1].setColor('#e74c3c');
                            scene.time.delayedCall(300, () => buyBtn.list[1].setColor('#ffffff'));
                        }
                    });
                    
                    upgCont.add([bg, nameTxt, buyBtn]);
                    overlay.contentContainer.add(upgCont);
                    upgIndex++;
                }
            }

            // Direct players to the Settings Menu for Colors
            let colorInfoTxt = scene.add.text(0, 160, "Looking for Color Themes?\nOpen the Settings Menu (⚙) to unlock palettes!", { fontSize: '20px', color: '#7f8c8d', align: 'center', fontStyle: 'bold' }).setOrigin(0.5);
            overlay.contentContainer.add(colorInfoTxt);

            if (!hasUnlocks) {
                let emptyTxt = scene.add.text(0, 20, "All store upgrades purchased!", { fontSize: '24px', color: '#7f8c8d' }).setOrigin(0.5);
                overlay.contentContainer.add(emptyTxt);
            }
        }
    } 
    // --- CART VIEW ---
    else if (overlay.currentView === 'cart') {
        let backBtn = createButton(scene, -320, -290, 140, 40, 0x7f8c8d, 0xffffff, '◀ BACK TO SHOP', { fontSize: '14px', color: '#fff', fontStyle: 'bold' }, () => {
            overlay.currentView = 'shop';
            renderStoreView(scene, overlay);
        });
        overlay.contentContainer.add(backBtn);

        let cartListBg = scene.add.rectangle(0, -30, 700, 350, 0x2c3e50).setStrokeStyle(2, 0xffffff);
        overlay.contentContainer.add(cartListBg);

        let startY = -150;
        let hasItems = false;

        for (let key in shoppingCart) {
            if (shoppingCart[key] > 0) {
                hasItems = true;
                let def = packDatabase[key];
                let itemCont = scene.add.container(0, startY);

                let nameTxt = scene.add.text(-330, 0, def.name, { fontSize: '22px', color: '#fff', fontStyle: 'bold' }).setOrigin(0, 0.5);
                let costTxt = scene.add.text(-30, 0, '$' + (def.cost * shoppingCart[key]).toFixed(2), { fontSize: '22px', color: '#2ecc71', fontStyle: 'bold' }).setOrigin(1, 0.5);

                let minusBtn = createButton(scene, 80, 0, 40, 40, 0xe74c3c, null, '-', { fontSize: '24px', color: '#fff', fontStyle: 'bold' }, () => {
                    shoppingCart[key] -= 1;
                    renderStoreView(scene, overlay);
                });

                let countTxt = scene.add.text(140, 0, shoppingCart[key].toString(), { fontSize: '22px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);

                let plusBtn = createButton(scene, 200, 0, 40, 40, 0x3498db, null, '+', { fontSize: '24px', color: '#fff', fontStyle: 'bold' }, () => {
                    shoppingCart[key] += 1;
                    renderStoreView(scene, overlay);
                });

                itemCont.add([nameTxt, costTxt, minusBtn, countTxt, plusBtn]);
                overlay.contentContainer.add(itemCont);
                startY += 60; 
            }
        }

        if (!hasItems) {
            let emptyTxt = scene.add.text(0, -30, "Your cart is empty.", { fontSize: '24px', color: '#7f8c8d' }).setOrigin(0.5);
            overlay.contentContainer.add(emptyTxt);
        }

        const cartBg = scene.add.rectangle(0, 250, 800, 80, 0x1a1a1a).setStrokeStyle(2, 0xffffff);
        let cartTotalText = scene.add.text(-380, 250, 'TOTAL: $' + totalCost.toFixed(2), { fontSize: '28px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0, 0.5);

        const clearBtn = createButton(scene, 200, 250, 100, 40, 0xe74c3c, null, 'CLEAR', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
            shoppingCart = { "basic": 0, "premium": 0, "legendary": 0 };
            renderStoreView(scene, overlay);
        });

        const buyBtn = createButton(scene, 320, 250, 120, 50, 0x27ae60, null, 'CHECKOUT', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }, () => {
            if (totalCost > 0 && playerMoney >= totalCost) {
                playerMoney -= totalCost;
                scene.moneyText.setText('$' + playerMoney.toFixed(2));
                for (let k in shoppingCart) playerPacks[k] += shoppingCart[k];
                shoppingCart = { "basic": 0, "premium": 0, "legendary": 0 };
                
                saveGame();
                scene.moneyText.setColor('#f1c40f'); 
                scene.time.delayedCall(300, () => scene.moneyText.setColor('#222222'));

                let newTotalPacks = playerPacks.basic + playerPacks.premium + playerPacks.legendary;
                scene.packsText.setText('PACKS: ' + newTotalPacks);

                overlay.currentView = 'shop';
                renderStoreView(scene, overlay);

            } else if (totalCost > playerMoney) {
                cartTotalText.setColor('#e74c3c'); 
                scene.time.delayedCall(300, () => cartTotalText.setColor('#f1c40f'));
            }
        });

        overlay.contentContainer.add([cartBg, cartTotalText, clearBtn, buyBtn]);
    }
}

function calculateCartTotal() {
    let total = 0;
    for (let key in shoppingCart) total += (shoppingCart[key] * packDatabase[key].cost);
    return total;
}

function updateStoreCart(scene, overlay) {
    overlay.cartTotalText.setText(`TOTAL: $${calculateCartTotal().toFixed(2)}`);
    let summary = [];
    for (let key in shoppingCart) {
        if (shoppingCart[key] > 0) summary.push(`${shoppingCart[key]}x ${packDatabase[key].name}`);
    }
    overlay.cartItemsText.setText(summary.length > 0 ? summary.join(' | ') : 'Cart is empty');
}

// --- PACK INVENTORY UI & LOGIC ---

function createInventoryOverlay(scene) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(100); 
    overlay.bg = scene.add.rectangle(0, 0, 900, 650, themeColors.inventory).setStrokeStyle(4, 0xecf0f1).setInteractive(); 
    
    const closeTxt = scene.add.text(410, -290, '✖', { fontSize: '28px', color: '#ffffff' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    overlay.currentTab = 'packs';
    overlay.currentPage = 0; // NEW: Pagination State

    overlay.add([overlay.bg, closeTxt]);

    // Tabs
    const packsTab = scene.add.text(-100, -280, 'MY PACKS', { fontSize: '24px', fontStyle: 'bold', color: '#fff' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    let dblLabel = playerUnlocks.binder ? 'DOUBLES' : 'CARDS';
    const doublesTab = scene.add.text(100, -280, dblLabel, { fontSize: '24px', fontStyle: 'bold', color: '#7f8c8d' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    overlay.doublesTab = doublesTab; // Save reference so we can update i
    
    packsTab.on('pointerdown', () => { 
        overlay.currentTab = 'packs'; 
        overlay.currentPage = 0; // Reset to page 1 on tab switch
        packsTab.setColor('#fff'); 
        doublesTab.setColor('#7f8c8d'); 
        renderInventoryView(scene, overlay); 
    });
    
    doublesTab.on('pointerdown', () => { 
        overlay.currentTab = 'doubles'; 
        overlay.currentPage = 0; // Reset to page 1 on tab switch
        doublesTab.setColor('#fff'); 
        packsTab.setColor('#7f8c8d'); 
        renderInventoryView(scene, overlay); 
    });

    // NEW: Pagination Buttons
    overlay.prevBtn = scene.add.text(-400, 0, '◀', { fontSize: '48px', color: '#ffffff' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    overlay.nextBtn = scene.add.text(400, 0, '▶', { fontSize: '48px', color: '#ffffff' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    
    overlay.prevBtn.on('pointerdown', () => {
        if (overlay.currentPage > 0) { overlay.currentPage--; renderInventoryView(scene, overlay); }
    });
    
    overlay.nextBtn.on('pointerdown', () => {
        overlay.currentPage++; renderInventoryView(scene, overlay);
    });

    overlay.add([packsTab, doublesTab, overlay.prevBtn, overlay.nextBtn]);
    overlay.gridContainer = scene.add.container(0, 0); 
    overlay.add(overlay.gridContainer);
    
    return overlay;
}

function renderInventoryView(scene, overlay) {
    overlay.gridContainer.removeAll(true);

    // Keep tab text updated
    overlay.doublesTab.setText(playerUnlocks.binder ? 'DOUBLES' : 'CARDS');
    
    if (overlay.currentTab === 'packs') {
        let activePacks = Object.keys(playerPacks).filter(key => playerPacks[key] > 0);
        let itemsPerPage = 6; 
        let maxPage = Math.ceil(activePacks.length / itemsPerPage) - 1;
        if (maxPage < 0) maxPage = 0;
        if (overlay.currentPage > maxPage) overlay.currentPage = maxPage;

        overlay.prevBtn.setVisible(overlay.currentPage > 0);
        overlay.nextBtn.setVisible(overlay.currentPage < maxPage);

        let startIndex = overlay.currentPage * itemsPerPage;
        let displayPacks = activePacks.slice(startIndex, startIndex + itemsPerPage);

        if (displayPacks.length === 0) {
            let emptyTxt = scene.add.text(0, 0, "No packs available.", { fontSize: '24px', color: '#7f8c8d' }).setOrigin(0.5);
            overlay.gridContainer.add(emptyTxt);
        } else {
            let startX = -250, startY = -30;
            displayPacks.forEach((key, index) => {
                let col = index % 3;
                let row = Math.floor(index / 3);
                let count = playerPacks[key];

                let x = startX + (col * 250);
                let y = startY + (row * 260);

                let packCont = scene.add.container(x, y);
                packCont.add(createPackGraphic(scene, key));
                
                let badgeBg = scene.add.circle(60, -90, 30, 0xe74c3c);
                let badgeTxt = scene.add.text(60, -90, 'x' + count, { fontSize: '24px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
                
                let viewBtn = createButton(scene, 0, 130, 140, 40, 0x27ae60, null, 'VIEW PACK', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
                    overlay.setVisible(false); 
                    showPackCloseup(scene, key);
                });
                
                packCont.add([badgeBg, badgeTxt, viewBtn]);
                overlay.gridContainer.add(packCont);
            });
        }
    } 
    else if (overlay.currentTab === 'doubles') {
        // CHANGED: Show if owned > 0 (instead of > 1)
        let doubles = myMojiDatabase.filter(moji => Number(playerInventory[moji.id]) > 0);

        let itemsPerPage = 10; 
        let maxPage = Math.ceil(doubles.length / itemsPerPage) - 1;
        if (maxPage < 0) maxPage = 0;
        if (overlay.currentPage > maxPage) overlay.currentPage = maxPage;

        overlay.prevBtn.setVisible(overlay.currentPage > 0);
        overlay.nextBtn.setVisible(overlay.currentPage < maxPage);

        let startIndex = overlay.currentPage * itemsPerPage;
        let displayDoubles = doubles.slice(startIndex, startIndex + itemsPerPage);

        if (displayDoubles.length === 0) {
            let emptyTxt = scene.add.text(0, 0, "You don't have any cards yet.", { fontSize: '24px', color: '#7f8c8d' }).setOrigin(0.5);
            overlay.gridContainer.add(emptyTxt);
        } else {
            let startX = -320, startY = -90, spacingX = 160, spacingY = 240;
            displayDoubles.forEach((moji, index) => {
                let col = index % 5;
                let row = Math.floor(index / 5);
                let owned = Number(playerInventory[moji.id]);

                let x = startX + (col * spacingX);
                let y = startY + (row * spacingY);

                let miniCard = scene.add.container(x, y);
                miniCard.add(createCardGraphic(scene, moji));
                miniCard.setScale(0.45); 
                
                let badgeBg = scene.add.circle(80, -130, 40, 0xe74c3c);
                // CHANGED: Display total owned, not owned - 1
                let badgeTxt = scene.add.text(80, -130, 'x' + owned, { fontSize: '40px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
                miniCard.add([badgeBg, badgeTxt]);

                miniCard.setSize(220, 320); 
                miniCard.setInteractive({ cursor: 'pointer' });
                miniCard.on('pointerdown', () => {
                    playerInventory[moji.id] = Number(playerInventory[moji.id]) - 1; 
                    saveGame();
                    createDraggableCard(scene, 512, 384, moji); 
                    renderInventoryView(scene, overlay); 
                });

                overlay.gridContainer.add(miniCard);
            });
        }
    }
}

function showPackCloseup(scene, packKey) {
    const closeup = scene.add.container(512, 384).setDepth(200);
    const bg = scene.add.rectangle(0, 0, 1024, 768, 0x000000, 0).setInteractive(); 
    
    const packGraphic = scene.add.container(0, -60);
    packGraphic.add(createPackGraphic(scene, packKey));
    packGraphic.setScale(1.8); 

    // NEW ROUNDED BUTTON
    const openBtn = createButton(scene, 0, 260, 200, 60, 0x2ecc71, 0xffffff, 'OPEN!', { fontFamily: 'Impact', fontSize: '32px', color: '#ffffff' }, () => {
        playerPacks[packKey] -= 1; 
        saveGame();
        
        let totalPacks = playerPacks.basic + playerPacks.premium + playerPacks.legendary;
        scene.packsText.setText('PACKS: ' + totalPacks);

        closeup.destroy();
        spawnBoosterPack(scene, packKey);
    });

    const closeTxt = scene.add.text(450, -320, '✖', { fontSize: '36px', color: '#000000' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeTxt.on('pointerdown', () => closeup.destroy());

    closeup.add([bg, packGraphic, openBtn, closeTxt]);
}

// NEW HELPER: Creates a reusable dropdown menu
function createDropdown(scene, parentContainer, x, y, width, prefix, options, defaultVal, onChange) {
    const container = scene.add.container(x, y);
    parentContainer.add(container);

    // Main Button
    const mainBg = scene.add.rectangle(0, 0, width, 30, 0x34495e).setStrokeStyle(2, 0xffffff).setInteractive();
    const defaultOpt = options.find(o => o.val === defaultVal);
    const mainTxt = scene.add.text(0, 0, prefix + (defaultOpt ? defaultOpt.label : ''), { fontFamily: 'Arial', fontSize: '12px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    container.add([mainBg, mainTxt]);

    // Hidden List Container
    const listContainer = scene.add.container(0, 15);
    listContainer.setVisible(false);
    container.add(listContainer);

    const itemHeight = 26;
    const listHeight = options.length * itemHeight;
    const listBg = scene.add.rectangle(0, listHeight / 2, width, listHeight, 0x1a1a1a).setStrokeStyle(2, 0xaaaaaa);
    listContainer.add(listBg);

    // Generate List Items
    options.forEach((opt, i) => {
        let itemBg = scene.add.rectangle(0, (itemHeight/2) + (i * itemHeight), width, itemHeight, 0x2c3e50).setInteractive();
        let itemTxt = scene.add.text(0, (itemHeight/2) + (i * itemHeight), opt.label, { fontFamily: 'Arial', fontSize: '13px', color: '#dddddd' }).setOrigin(0.5);

        itemBg.on('pointerover', () => { itemBg.setFillStyle(0x3498db); itemTxt.setColor('#ffffff'); });
        itemBg.on('pointerout', () => { itemBg.setFillStyle(0x2c3e50); itemTxt.setColor('#dddddd'); });
        
        itemBg.on('pointerdown', (pointer, localX, localY, event) => {
            mainTxt.setText(prefix + opt.label);
            listContainer.setVisible(false);
            onChange(opt.val);
            event.stopPropagation(); // Prevents click from passing through
        });
        listContainer.add([itemBg, itemTxt]);
    });

    // Toggle Menu Visibility
    mainBg.on('pointerdown', (pointer, localX, localY, event) => {
        let isVis = listContainer.visible;
        scene.events.emit('close_all_dropdowns'); // Close other open menus
        if (!isVis) {
            listContainer.setVisible(true);
            parentContainer.bringToTop(container); // Ensure it renders over other UI
        }
        event.stopPropagation(); 
    });

    // Listen for global close command
    scene.events.on('close_all_dropdowns', () => listContainer.setVisible(false));

    return container;
}

function createBinderOverlay(scene) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(100); 
    overlay.bg = scene.add.rectangle(0, 0, 940, 680, themeColors.binder).setStrokeStyle(4, 0xecf0f1).setInteractive(); 
    
    // Close dropdowns if the user clicks the background
    overlay.bg.on('pointerdown', () => scene.events.emit('close_all_dropdowns'));

    const spine = scene.add.rectangle(0, 0, 40, 680, 0x000000, 0.3);
    const closeTxt = scene.add.text(430, -315, '✖', { fontSize: '28px', color: '#ffffff' }).setInteractive().setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));
    
    overlay.currentSpread = 0; 
    overlay.sortBy = 'num_asc'; 
    overlay.filterBy = 'all';    

    overlay.add([overlay.bg, spine, closeTxt]);

    // ADD CARDS HERE (So UI renders on top of them)
    overlay.gridContainer = scene.add.container(0, 0); 
    overlay.add(overlay.gridContainer);

    // ADD UI HERE
    overlay.uiContainer = scene.add.container(0, 0);
    overlay.add(overlay.uiContainer);

    // 1. Sort & Order Dropdown
    const sortOptions = [
        { label: 'Number ⬆', val: 'num_asc' }, { label: 'Number ⬇', val: 'num_desc' },
        { label: 'Name (A-Z)', val: 'name_asc' }, { label: 'Name (Z-A)', val: 'name_desc' },
        { label: 'Rarity (Low)', val: 'rarity_asc' }, { label: 'Rarity (High)', val: 'rarity_desc' },
        { label: 'Value (Low)', val: 'val_asc' }, { label: 'Value (High)', val: 'val_desc' },
        { label: 'Category (A-Z)', val: 'cat_asc' }, { label: 'Category (Z-A)', val: 'cat_desc' }
    ];
    
    // ADJUSTED X (-355) and Y (-285) to align with left sleeve column
    createDropdown(scene, overlay.uiContainer, -355, -295, 150, 'SORT: ', sortOptions, 'num_asc', (newVal) => {
        overlay.sortBy = newVal;
        overlay.currentSpread = 0; 
        renderBinderGrid(scene, overlay);
    });

    // 2. Filter Dropdown
    const filterOptions = [
        { label: 'All Cards', val: 'all' },
        { label: 'Owned Only', val: 'owned' },
        { label: 'Missing Only', val: 'missing' },
        { label: 'Rarity: Common', val: 'rarity_Common' },
        { label: 'Rarity: Rare', val: 'rarity_Rare' },
        { label: 'Rarity: Epic', val: 'rarity_Epic' },
        { label: 'Rarity: Legendary', val: 'rarity_Legendary' },
        { label: 'Faces', val: 'cat_Faces' },
        { label: 'Animals', val: 'cat_Animals' },
        { label: 'Food', val: 'cat_Food' },
        { label: 'Cosmic', val: 'cat_Cosmic' },
        { label: 'Magic', val: 'cat_Magic' },
        { label: 'Sports', val: 'cat_Sports' },
        { label: 'Music', val: 'cat_Music' },
        { label: 'Objects', val: 'cat_Objects' },
        { label: 'Spooky', val: 'cat_Spooky' },
        { label: 'Memes', val: 'cat_Memes' }
    ];

    // ADJUSTED X (-195) and Y (-285) to stay beside the Sort button
    createDropdown(scene, overlay.uiContainer, -195, -295, 150, 'FILTER: ', filterOptions, 'all', (newVal) => {
        overlay.filterBy = newVal;
        overlay.currentSpread = 0; 
        renderBinderGrid(scene, overlay);
    });
    
    // Pagination Buttons
    overlay.prevBtn = scene.add.text(-440, 0, '◀', { fontSize: '48px', color: '#ffffff' }).setInteractive().setOrigin(0.5);
    overlay.nextBtn = scene.add.text(440, 0, '▶', { fontSize: '48px', color: '#ffffff' }).setInteractive().setOrigin(0.5);
    
    overlay.prevBtn.on('pointerdown', () => {
        if (overlay.currentSpread > 0) { overlay.currentSpread--; renderBinderGrid(scene, overlay); }
    });
    
    overlay.nextBtn.on('pointerdown', () => {
        overlay.currentSpread++; renderBinderGrid(scene, overlay);
    });

    overlay.uiContainer.add([overlay.prevBtn, overlay.nextBtn]);

    return overlay;
}

function renderBinderGrid(scene, overlay) {
    overlay.gridContainer.removeAll(true);
    
    // 1. FILTER LOGIC
    let filteredDb = myMojiDatabase.filter(moji => {
        let owned = Number(playerInventory[moji.id]);
        if (overlay.filterBy === 'owned') return owned > 0;
        if (overlay.filterBy === 'missing') return owned === 0;
        if (overlay.filterBy.startsWith('rarity_')) return moji.rarity === overlay.filterBy.split('_')[1];
        if (overlay.filterBy.startsWith('cat_')) return moji.category === overlay.filterBy.split('_')[1];
        return true; // 'all' fallback
    });

    // 2. SORT LOGIC
    filteredDb.sort((a, b) => {
        let valA, valB;
        let [sortType, sortDir] = overlay.sortBy.split('_');
        let isAsc = sortDir === 'asc';
        
        if (sortType === 'num') {
            valA = parseInt(a.id.split('_')[1]);
            valB = parseInt(b.id.split('_')[1]);
        } else if (sortType === 'name') {
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
        } else if (sortType === 'cat') {
            valA = a.category.toLowerCase();
            valB = b.category.toLowerCase();
        } else if (sortType === 'rarity') {
            const weights = { "Common": 1, "Rare": 2, "Epic": 3, "Legendary": 4 };
            valA = weights[a.rarity];
            valB = weights[b.rarity];
        } else if (sortType === 'val') {
            valA = a.baseValue;
            valB = b.baseValue;
        }

        if (valA < valB) return isAsc ? -1 : 1;
        if (valA > valB) return isAsc ? 1 : -1;
        return 0;
    });

    let maxSpread = Math.ceil(filteredDb.length / 18) - 1;
    if (maxSpread < 0) maxSpread = 0; // Prevent errors if filter returns 0 results
    
    // Safety check if a filter drastically reduces page count
    if (overlay.currentSpread > maxSpread) overlay.currentSpread = maxSpread;

    overlay.prevBtn.setVisible(overlay.currentSpread > 0);
    overlay.nextBtn.setVisible(overlay.currentSpread < maxSpread);
    
    let startIndex = overlay.currentSpread * 18;
    let endIndex = Math.min(startIndex + 18, filteredDb.length);

    // If filter returns nothing, show a message
    if (filteredDb.length === 0) {
        let emptyTxt = scene.add.text(0, 0, "No cards match this filter.", { fontSize: '24px', color: '#7f8c8d' }).setOrigin(0.5);
        overlay.gridContainer.add(emptyTxt);
        return;
    }

    for (let i = startIndex; i < endIndex; i++) {
        let moji = filteredDb[i]; 
        let spreadIndex = i - startIndex; 
        let page = spreadIndex < 9 ? 0 : 1; 
        let localIndex = spreadIndex % 9;
        let col = localIndex % 3;
        let row = Math.floor(localIndex / 3);

        let startX = page === 0 ? -375 : 95;
        // ADJUSTED: Shifted from -200 down to -180 to clear the new dropdowns
        let startY = -180; 
        let spacingX = 140;
        let spacingY = 200;

        let x = startX + (col * spacingX);
        let y = startY + (row * spacingY);

        let owned = Number(playerInventory[moji.id]);

        let sleeve = scene.add.rectangle(x, y, 110, 160, 0x000000, 0.4).setStrokeStyle(2, 0x555555);
        overlay.gridContainer.add(sleeve);

        let miniCard = scene.add.container(x, y);
        let graphics = createCardGraphic(scene, moji);
        miniCard.add(graphics);
        miniCard.setScale(0.45); 

        if (owned === 0) {
            graphics.forEach(g => { if(g.setTint) g.setTint(0x222222); g.setAlpha(0.5); });
            let qMark = scene.add.text(0, 0, '?', { fontSize: '80px', color: '#444444', fontStyle: 'bold' }).setOrigin(0.5);
            miniCard.add(qMark);
        } else {
            miniCard.setSize(220, 320); 
            miniCard.setInteractive({ cursor: 'pointer' });
            miniCard.on('pointerdown', () => {
                scene.events.emit('close_all_dropdowns'); // Clean up menus on grab
                playerInventory[moji.id] = Number(playerInventory[moji.id]) - 1; 
                saveGame();
                createDraggableCard(scene, 512, 384, moji); 
                renderBinderGrid(scene, overlay); 
            });
        }
        overlay.gridContainer.add(miniCard);
    }
}
