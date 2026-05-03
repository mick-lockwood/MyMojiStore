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

function create() {
    const scene = this; 
    scene.cameras.main.setBackgroundColor(themeColors.table);

    // HELPER: Simple Drop Shadow
    const addShadow = (x, y, w, h, radius = 0) => scene.add.rectangle(x+6, y+6, w, h, 0x000000, 0.4);

    // --- TOP UI HEADER ---
    addShadow(512, 40, 1024, 80); // Banner Shadow
    scene.add.rectangle(512, 40, 1024, 80, 0xfce883); // Yellow Banner

    scene.moneyText = scene.add.text(20, 10, '$' + playerMoney.toFixed(2), { fontFamily: 'Impact, sans-serif', fontSize: '36px', color: '#222222' });
    let totalPacks = playerPacks.basic + playerPacks.premium + playerPacks.legendary;
    scene.packsText = scene.add.text(20, 50, 'PACKS: ' + totalPacks, { fontFamily: 'Impact, sans-serif', fontSize: '20px', color: '#222222' });

    scene.add.text(512, 40, 'MyMoji Store', { fontFamily: 'Impact, sans-serif', fontSize: '48px', color: '#222222' }).setOrigin(0.5);

    // Settings Button
    const settingsBtn = scene.add.text(980, 40, '⚙️', { fontSize: '36px' }).setOrigin(0.5).setInteractive();

    // --- OVERLAYS ---
    const binderOverlay = createBinderOverlay(scene);
    const storeOverlay = createStoreOverlay(scene);
    const inventoryOverlay = createInventoryOverlay(scene);
    const settingsOverlay = createSettingsOverlay(scene, binderOverlay, inventoryOverlay);

    settingsBtn.on('pointerdown', () => settingsOverlay.setVisible(true));

    // --- BOTTOM BUTTONS / DROP ZONES ---
    // 1. TRADING STASH
    addShadow(160, 620, 240, 70);
    const storeBtn = scene.add.rectangle(160, 620, 240, 70, 0x57bcf2).setInteractive().setStrokeStyle(4, 0x000000);
    scene.add.text(160, 620, 'TRADING STASH', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }).setOrigin(0.5);
    storeBtn.on('pointerdown', () => { updateStoreCart(scene, storeOverlay); storeOverlay.setVisible(true); });

    // 2. SELL ON MOJIMARKET
    addShadow(160, 710, 240, 70);
    scene.sellZone = scene.add.rectangle(160, 710, 240, 70, 0xff7e8d).setInteractive().setStrokeStyle(4, 0x000000);
    scene.add.text(160, 710, 'SELL ON\nMOJIMARKET', { fontFamily: 'Impact, sans-serif', fontSize: '20px', color: '#111111', align: 'center' }).setOrigin(0.5);

    // 3. BINDER
    addShadow(864, 620, 240, 70);
    scene.binderZone = scene.add.rectangle(864, 620, 240, 70, 0xffc87c).setInteractive().setStrokeStyle(4, 0x000000);
    scene.add.text(864, 620, 'BINDER', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }).setOrigin(0.5);
    scene.binderZone.on('pointerdown', () => { renderBinderGrid(scene, binderOverlay); binderOverlay.setVisible(true); });

    // 4. INVENTORY
    addShadow(864, 710, 240, 70);
    const packInvBtn = scene.add.rectangle(864, 710, 240, 70, 0xda7aff).setInteractive().setStrokeStyle(4, 0x000000);
    scene.add.text(864, 710, 'INVENTORY', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }).setOrigin(0.5);
    packInvBtn.on('pointerdown', () => { renderInventoryView(scene, inventoryOverlay); inventoryOverlay.setVisible(true); });
}

function createSettingsOverlay(scene, binderOverlay, inventoryOverlay) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(300);
    const bg = scene.add.rectangle(0, 0, 500, 350, 0xffffff).setStrokeStyle(4, 0x000000).setInteractive();
    
    const title = scene.add.text(0, -130, 'SETTINGS', { fontFamily: 'Impact', fontSize: '32px', color: '#000' }).setOrigin(0.5);
    const closeTxt = scene.add.text(220, -140, '✖', { fontSize: '28px', color: '#000' }).setInteractive().setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    // Reset Button
    const resetBtn = scene.add.text(0, 130, 'DELETE SAVE FILE', { fontFamily: 'Arial', fontSize: '18px', color: '#e74c3c', fontStyle: 'bold' }).setInteractive().setOrigin(0.5);
    resetBtn.on('pointerdown', () => {
        if (confirm("Delete save and start over?")) { localStorage.removeItem('myMojiSave'); location.reload(); }
    });

    const createColorBtn = (y, label, type, colors) => {
        scene.add.text(-180, y, label, { fontFamily: 'Arial', fontSize: '20px', color: '#000', fontStyle: 'bold' }).setOrigin(0, 0.5);
        let btn = scene.add.rectangle(120, y, 140, 40, colors[0]).setStrokeStyle(2, 0x000).setInteractive();
        btn.colorIndex = 0;
        btn.on('pointerdown', () => {
            btn.colorIndex = (btn.colorIndex + 1) % colors.length;
            let newColor = colors[btn.colorIndex];
            btn.setFillStyle(newColor);
            
            if (type === 'table') { themeColors.table = '#' + newColor.toString(16).padStart(6, '0'); scene.cameras.main.setBackgroundColor(themeColors.table); }
            if (type === 'binder') { themeColors.binder = newColor; binderOverlay.bg.setFillStyle(newColor); }
            if (type === 'inv') { themeColors.inventory = newColor; inventoryOverlay.bg.setFillStyle(newColor); }
        });
        overlay.add(btn);
    };

    createColorBtn(-50, "Table Color", 'table', [0xf4f4f4, 0x34495e, 0x27ae60, 0xbdc3c7]);
    createColorBtn(10, "Binder Color", 'binder', [0x1a1a1a, 0x2c3e50, 0x8e44ad, 0xc0392b]);
    createColorBtn(70, "Inventory Color", 'inv', [0x1a1a1a, 0x2980b9, 0xd35400, 0x16a085]);

    overlay.add([bg, title, closeTxt, resetBtn]);
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
    return [bg, imgBox, nameTxt, rarityTxt, valTxt];
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

// NEW: Pack Close-up cinematic flow
function showPackCloseup(scene, packKey) {
    const closeup = scene.add.container(512, 384).setDepth(200);
    const bg = scene.add.rectangle(0, 0, 1024, 768, 0x000000, 0.85).setInteractive(); // Blocks clicks
    
    const packGraphic = scene.add.container(0, -60);
    packGraphic.add(createPackGraphic(scene, packKey));
    packGraphic.setScale(2.5); // Cinematic zoom

    const openBtn = scene.add.rectangle(0, 260, 200, 60, 0x2ecc71).setStrokeStyle(4, 0xffffff).setInteractive();
    const openTxt = scene.add.text(0, 260, 'OPEN!', { fontFamily: 'Impact', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);

    openBtn.on('pointerdown', () => {
        playerPacks[packKey] -= 1; 
        saveGame();
        
        // Update home screen UI
        let totalPacks = playerPacks.basic + playerPacks.premium + playerPacks.legendary;
        scene.packsText.setText('PACKS: ' + totalPacks);

        closeup.destroy();
        spawnBoosterPack(scene, packKey);
    });

    // Optional close button in case they change their mind
    const closeTxt = scene.add.text(450, -320, '✖', { fontSize: '36px', color: '#ffffff' }).setInteractive().setOrigin(0.5);
    closeTxt.on('pointerdown', () => closeup.destroy());

    closeup.add([bg, packGraphic, openBtn, openTxt, closeTxt]);
}

function createBinderOverlay(scene) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(100); 
    // We attach bg to the overlay object so Settings can change its color
    overlay.bg = scene.add.rectangle(0, 0, 940, 680, themeColors.binder).setStrokeStyle(4, 0xecf0f1).setInteractive(); 
    
    // 2-Page Visual Divider
    const spine = scene.add.rectangle(0, 0, 40, 680, 0x000000, 0.3);
    const closeTxt = scene.add.text(430, -300, '✖', { fontSize: '28px', color: '#ffffff' }).setInteractive().setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));
    
    overlay.add([overlay.bg, spine, closeTxt]);
    overlay.gridContainer = scene.add.container(0, 0); 
    overlay.add(overlay.gridContainer);

    return overlay;
}

function renderBinderGrid(scene, overlay) {
    overlay.gridContainer.removeAll(true);
    
    // We have 12 cards in myMojiDatabase. A 2-page spread holds 18 (9 per side).
    myMojiDatabase.forEach((moji, index) => {
        let page = index < 9 ? 0 : 1; // 0 = Left Page, 1 = Right Page
        let localIndex = index % 9;
        let col = localIndex % 3;
        let row = Math.floor(localIndex / 3);

        // Calculate positions for 2 pages
        let startX = page === 0 ? -320 : 130;
        let startY = -220;
        let spacingX = 140;
        let spacingY = 200;

        let x = startX + (col * spacingX);
        let y = startY + (row * spacingY);

        let owned = Number(playerInventory[moji.id]);

        // Draw Sleeve Background
        let sleeve = scene.add.rectangle(x, y, 110, 160, 0x000000, 0.4).setStrokeStyle(2, 0x555555);
        overlay.gridContainer.add(sleeve);

        // Create Card Graphic
        let miniCard = scene.add.container(x, y);
        let graphics = createCardGraphic(scene, moji);
        miniCard.add(graphics);
        miniCard.setScale(0.45); 

        if (owned === 0) {
            // Placeholder Styling
            graphics.forEach(g => { if(g.setTint) g.setTint(0x222222); g.setAlpha(0.5); });
            let qMark = scene.add.text(0, 0, '?', { fontSize: '80px', color: '#444444', fontStyle: 'bold' }).setOrigin(0.5);
            miniCard.add(qMark);
        } else {
            // Real Card (Draggable from binder)
            miniCard.setSize(220, 320); 
            miniCard.setInteractive({ cursor: 'pointer' });
            miniCard.on('pointerdown', () => {
                playerInventory[moji.id] = Number(playerInventory[moji.id]) - 1; 
                saveGame();
                createDraggableCard(scene, 512, 384, moji); 
                renderBinderGrid(scene, overlay); 
            });
        }
        overlay.gridContainer.add(miniCard);
    });
}
