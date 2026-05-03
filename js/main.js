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
let themeColors = { table: '#f4f4f4', binder: 0x1a1a1a, inventory: 0x1a1a1a };
        
myMojiDatabase.forEach(moji => playerInventory[moji.id] = 0);

function loadGame() {
    let savedData = localStorage.getItem('myMojiSave');
    if (savedData) {
        let parsedData = JSON.parse(savedData);
        playerMoney = parsedData.money !== undefined ? Number(parsedData.money) : 50;
        if (parsedData.packs) playerPacks = { ...playerPacks, ...parsedData.packs };
        for (let id in parsedData.inventory) {
            if (playerInventory[id] !== undefined) playerInventory[id] = Number(parsedData.inventory[id]);
        }
    }
}

function saveGame() {
    localStorage.setItem('myMojiSave', JSON.stringify({
        money: playerMoney,
        packs: playerPacks,
        inventory: playerInventory
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
    storeIconBtn.on('pointerdown', () => { updateStoreCart(scene, storeOverlay); storeOverlay.setVisible(true); });

    const settingsBtn = scene.add.text(980, 40, '⚙', { fontFamily: 'Arial, sans-serif', fontSize: '44px', color: '#000000' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    settingsBtn.on('pointerover', () => scene.tweens.add({ targets: settingsBtn, angle: 45, duration: 200 }));
    settingsBtn.on('pointerout', () => scene.tweens.add({ targets: settingsBtn, angle: 0, duration: 200 }));

    // --- OVERLAYS ---
    const binderOverlay = createBinderOverlay(scene);
    const storeOverlay = createStoreOverlay(scene);
    const inventoryOverlay = createInventoryOverlay(scene);
    const settingsOverlay = createSettingsOverlay(scene, binderOverlay, inventoryOverlay);

    settingsBtn.on('pointerdown', () => settingsOverlay.setVisible(true));

    // --- BOTTOM BUTTONS / DROP ZONES ---
    
    // 1. TRADING STASH (Deactivated - No onClick passed)
    addShadow(160, 620, 240, 70, 12);
    createButton(scene, 160, 620, 240, 70, 0x57bcf2, 0x000000, 'TRADING STASH', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }, null);

    // 2. SELL ON MOJIMARKET (Drop zone, but gets the hover effects!)
    addShadow(160, 710, 240, 70, 12);
    scene.sellZone = createButton(scene, 160, 710, 240, 70, 0xff7e8d, 0x000000, 'SELL ON\nMOJIMARKET', { fontFamily: 'Impact, sans-serif', fontSize: '20px', color: '#111111', align: 'center' }, () => {
        // Drop zone, empty click func just to enable the bounce animation
    });

    // 3. BINDER (Drop zone AND clickable button)
    addShadow(864, 620, 240, 70, 12);
    scene.binderZone = createButton(scene, 864, 620, 240, 70, 0xffc87c, 0x000000, 'BINDER', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }, () => { 
        renderBinderGrid(scene, binderOverlay); binderOverlay.setVisible(true); 
    });

    // 4. INVENTORY
    addShadow(864, 710, 240, 70, 12);
    createButton(scene, 864, 710, 240, 70, 0xda7aff, 0x000000, 'INVENTORY', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }, () => { 
        renderInventoryView(scene, inventoryOverlay); inventoryOverlay.setVisible(true); 
    });
}

function createSettingsOverlay(scene, binderOverlay, inventoryOverlay) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(300);
    
    // WIDENED BACKGROUND: Expanded width from 500 to 600 to fit the color swatches
    const bg = scene.add.rectangle(0, 0, 600, 420, 0xffffff).setStrokeStyle(4, 0x000000).setInteractive();
    overlay.add(bg); 
    
    const title = scene.add.text(0, -170, 'SETTINGS', { fontFamily: 'Impact', fontSize: '32px', color: '#000' }).setOrigin(0.5);
    // Adjusted close button X coordinate to account for wider background
    const closeTxt = scene.add.text(270, -170, '✖', { fontSize: '28px', color: '#000' }).setInteractive().setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    const resetBtn = scene.add.text(0, 160, 'DELETE SAVE FILE', { fontFamily: 'Arial', fontSize: '18px', color: '#e74c3c', fontStyle: 'bold' }).setInteractive().setOrigin(0.5);
    resetBtn.on('pointerdown', () => {
        if (confirm("Delete save and start over?")) { localStorage.removeItem('myMojiSave'); location.reload(); }
    });

    const instrBtn = scene.add.rectangle(0, 100, 200, 40, 0x3498db).setStrokeStyle(2, 0x000).setInteractive();
    const instrTxt = scene.add.text(0, 100, 'HOW TO PLAY', { fontFamily: 'Arial', fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    
    instrBtn.on('pointerdown', () => {
        alert("HOW TO PLAY:\n\n1. Buy packs from the Store.\n2. Open packs in your Inventory.\n3. Drag cards to the Binder to save them, or to the Market to sell them for cash.\n4. Collect all 100 MyMojis!");
    });

    overlay.add([title, closeTxt, resetBtn, instrBtn, instrTxt]);

    // NEW: Function to create a row of color swatches instead of one cycling button
    const createColorPalette = (y, label, type, colors) => {
        let labelTxt = scene.add.text(-270, y, label, { fontFamily: 'Arial', fontSize: '18px', color: '#000', fontStyle: 'bold' }).setOrigin(0, 0.5);
        overlay.add(labelTxt);

        let startX = -120;
        let spacing = 40;

        colors.forEach((color, index) => {
            // Draw the individual color swatch
            let swatch = scene.add.rectangle(startX + (index * spacing), y, 30, 30, color).setStrokeStyle(2, 0x000).setInteractive();
            
            swatch.on('pointerdown', () => {
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
            });
            
            overlay.add(swatch);
        });
    };

    // Expanded color arrays!
    const tableColors = [0xf4f4f4, 0xbdc3c7, 0x34495e, 0x27ae60, 0x2980b9, 0x8e44ad, 0xc0392b, 0xf39c12, 0xffa07a];
    const menuColors = [0x1a1a1a, 0x2c3e50, 0x8e44ad, 0xc0392b, 0x27ae60, 0xd35400, 0x2980b9, 0x16a085, 0x7f8c8d];

    createColorPalette(-90, "Table Color", 'table', tableColors);
    createColorPalette(-30, "Binder Color", 'binder', menuColors);
    createColorPalette(30, "Inventory Color", 'inv', menuColors);

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
        
        if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, scene.binderZone.getBounds())) {
            // FIX: Enforce numbers to prevent local storage string bugs
            playerInventory[mojiData.id] = Number(playerInventory[mojiData.id]) + 1; 
            saveGame(); 
            showFloatingText(scene, this.x, this.y, 'SAVED!', '#9b59b6');
            this.destroy(); 
        } 
        else if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, scene.sellZone.getBounds())) {
            playerMoney += Number(mojiData.baseValue); 
            scene.moneyText.setText('Bank: $' + playerMoney.toFixed(2));
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
    
    // Updated Close Button: Just the X text, made interactive
    const closeTxt = scene.add.text(410, -290, '✖', { fontSize: '28px', color: '#ffffff' }).setInteractive().setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    // Notice that closeBtn is NO LONGER in this array!
    overlay.add([bg, title, closeTxt]);

    let packKeys = Object.keys(packDatabase);
    let startX = -250;
    
    packKeys.forEach((key, index) => {
        let def = packDatabase[key];
        let packCont = scene.add.container(startX + (index * 250), -50);
        packCont.add(createPackGraphic(scene, key));
        
        let priceTxt = scene.add.text(0, 130, '$' + def.cost.toFixed(2), { fontSize: '24px', color: '#2ecc71', fontStyle: 'bold' }).setOrigin(0.5);
        let addBtn = scene.add.rectangle(0, 180, 140, 40, 0x3498db).setInteractive();
        let addTxt = scene.add.text(0, 180, '+ ADD TO CART', { fontSize: '14px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        
        addBtn.on('pointerdown', () => {
            shoppingCart[key] += 1;
            updateStoreCart(scene, overlay);
        });
        
        packCont.add([priceTxt, addBtn, addTxt]);
        overlay.add(packCont);
    });

    const cartBg = scene.add.rectangle(0, 250, 800, 80, 0x2c3e50).setStrokeStyle(2, 0xffffff);
    overlay.cartTotalText = scene.add.text(-380, 250, 'TOTAL: $0.00', { fontSize: '24px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0, 0.5);
    overlay.cartItemsText = scene.add.text(0, 250, 'Items: 0', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
    
    const clearBtn = scene.add.rectangle(200, 250, 100, 40, 0xe74c3c).setInteractive();
    const clearTxt = scene.add.text(200, 250, 'CLEAR', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    clearBtn.on('pointerdown', () => {
        shoppingCart = { "basic": 0, "premium": 0, "legendary": 0 };
        updateStoreCart(scene, overlay);
    });

    const buyBtn = scene.add.rectangle(320, 250, 120, 50, 0x27ae60).setInteractive();
    const buyTxt = scene.add.text(320, 250, 'CHECKOUT', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    
    buyBtn.on('pointerdown', () => {
        let cost = calculateCartTotal();
        if (cost > 0 && playerMoney >= cost) {
            playerMoney -= cost;
            scene.moneyText.setText('$' + playerMoney.toFixed(2));
            for (let key in shoppingCart) playerPacks[key] += shoppingCart[key];
            shoppingCart = { "basic": 0, "premium": 0, "legendary": 0 };
            updateStoreCart(scene, overlay);
            saveGame();
            scene.moneyText.setColor('#f1c40f'); 
            scene.time.delayedCall(300, () => scene.moneyText.setColor('#222222')); 
        } else if (cost > playerMoney) {
            overlay.cartTotalText.setColor('#e74c3c'); 
            scene.time.delayedCall(300, () => overlay.cartTotalText.setColor('#f1c40f'));
        }
    });

    overlay.add([cartBg, overlay.cartTotalText, overlay.cartItemsText, clearBtn, clearTxt, buyBtn, buyTxt]);
    return overlay;
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
    
    const closeTxt = scene.add.text(410, -290, '✖', { fontSize: '28px', color: '#ffffff' }).setInteractive().setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    overlay.currentTab = 'packs';
    overlay.add([overlay.bg, closeTxt]);

    // Tabs
    const packsTab = scene.add.text(-100, -280, 'MY PACKS', { fontSize: '24px', fontStyle: 'bold', color: '#fff' }).setInteractive().setOrigin(0.5);
    const doublesTab = scene.add.text(100, -280, 'DOUBLES', { fontSize: '24px', fontStyle: 'bold', color: '#7f8c8d' }).setInteractive().setOrigin(0.5);

    packsTab.on('pointerdown', () => { overlay.currentTab = 'packs'; packsTab.setColor('#fff'); doublesTab.setColor('#7f8c8d'); renderInventoryView(scene, overlay); });
    doublesTab.on('pointerdown', () => { overlay.currentTab = 'doubles'; doublesTab.setColor('#fff'); packsTab.setColor('#7f8c8d'); renderInventoryView(scene, overlay); });

    overlay.add([packsTab, doublesTab]);
    overlay.gridContainer = scene.add.container(0, 0); 
    overlay.add(overlay.gridContainer);
    
    return overlay;
}

function renderInventoryView(scene, overlay) {
    overlay.gridContainer.removeAll(true);
    
    if (overlay.currentTab === 'packs') {
        let startX = -250;
        let packKeys = Object.keys(playerPacks);
        let index = 0;

        packKeys.forEach((key) => {
            let count = playerPacks[key];
            if (count > 0) {
                let packCont = scene.add.container(startX + (index * 250), -30);
                packCont.add(createPackGraphic(scene, key));
                
                let badgeBg = scene.add.circle(60, -90, 30, 0xe74c3c);
                let badgeTxt = scene.add.text(60, -90, 'x' + count, { fontSize: '24px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
                
                let viewBtn = scene.add.rectangle(0, 130, 140, 40, 0x27ae60).setInteractive();
                let viewTxt = scene.add.text(0, 130, 'VIEW PACK', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
                
                viewBtn.on('pointerdown', () => {
                    overlay.setVisible(false); 
                    showPackCloseup(scene, key);
                });
                
                packCont.add([badgeBg, badgeTxt, viewBtn, viewTxt]);
                overlay.gridContainer.add(packCont);
                index++;
            }
        });

        if (index === 0) {
            let emptyTxt = scene.add.text(0, 0, "No packs available.", { fontSize: '24px', color: '#7f8c8d' }).setOrigin(0.5);
            overlay.gridContainer.add(emptyTxt);
        }
    } 
    else if (overlay.currentTab === 'doubles') {
        let startX = -320, startY = -120, col = 0, spacingX = 160, spacingY = 220;
        let hasDoubles = false;

        myMojiDatabase.forEach(moji => {
            let owned = Number(playerInventory[moji.id]);
            if (owned > 1) {
                hasDoubles = true;
                let miniCard = scene.add.container(startX + (col * spacingX), startY);
                miniCard.add(createCardGraphic(scene, moji));
                miniCard.setScale(0.45); 
                
                let badgeBg = scene.add.circle(80, -130, 40, 0xe74c3c);
                let badgeTxt = scene.add.text(80, -130, 'x' + (owned - 1), { fontSize: '40px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
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
                col++;
                if (col > 4) { col = 0; startY += spacingY; }
            }
        });

        if (!hasDoubles) {
            let emptyTxt = scene.add.text(0, 0, "You don't have any duplicate cards.", { fontSize: '24px', color: '#7f8c8d' }).setOrigin(0.5);
            overlay.gridContainer.add(emptyTxt);
        }
    }
}

function showPackCloseup(scene, packKey) {
    const closeup = scene.add.container(512, 384).setDepth(200);
    
    // Alpha set to 0 (invisible), but still interactive to block clicks on the table
    const bg = scene.add.rectangle(0, 0, 1024, 768, 0x000000, 0).setInteractive(); 
    
    const packGraphic = scene.add.container(0, -60);
    packGraphic.add(createPackGraphic(scene, packKey));
    
    // REDUCED SCALE: Changed from 2.5 to 1.8 for a better fit
    packGraphic.setScale(1.8); 

    const openBtn = scene.add.rectangle(0, 260, 200, 60, 0x2ecc71).setStrokeStyle(4, 0xffffff).setInteractive();
    const openTxt = scene.add.text(0, 260, 'OPEN!', { fontFamily: 'Impact', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);

    openBtn.on('pointerdown', () => {
        playerPacks[packKey] -= 1; 
        saveGame();
        
        let totalPacks = playerPacks.basic + playerPacks.premium + playerPacks.legendary;
        scene.packsText.setText('PACKS: ' + totalPacks);

        closeup.destroy();
        spawnBoosterPack(scene, packKey);
    });

    const closeTxt = scene.add.text(450, -320, '✖', { fontSize: '36px', color: '#000000' }).setInteractive().setOrigin(0.5);
    closeTxt.on('pointerdown', () => closeup.destroy());

    closeup.add([bg, packGraphic, openBtn, openTxt, closeTxt]);
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
    
    createDropdown(scene, overlay.uiContainer, -345, -315, 150, 'SORT: ', sortOptions, 'num_asc', (newVal) => {
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

    createDropdown(scene, overlay.uiContainer, -185, -315, 150, 'FILTER: ', filterOptions, 'all', (newVal) => {
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
        // We will update maxSpread dynamically inside renderBinderGrid
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
