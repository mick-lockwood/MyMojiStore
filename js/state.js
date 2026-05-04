// --- GLOBAL STATE & LOCAL STORAGE ---
let playerMoney = 50.00;
let playerInventory = {};
let cardsOnTable = []; 
let playerAchievements = []; 
let gameStats = { packsOpened: 0, npcTrades: 0, bailouts: 0 };

// Auto-generate pack and cart trackers dynamically!
let playerPacks = {};
let shoppingCart = {};
if (typeof packDatabase !== 'undefined') {
    for (let key in packDatabase) {
        playerPacks[key] = 0;
        shoppingCart[key] = 0;
    }
}

// Store Customization State
let storeName = "MyMoji Store";
let hasRenamed = false; 

// NPC Trade & Phone State
let currentTrade = null;
let unreadMessage = false;
let tradeExpirationTime = 0;

let themeColors = { 
    table: '#f4f4f4', binder: 0x1a1a1a, inventory: 0x1a1a1a, banner: 0xfce883,
    active: { table: 0xf4f4f4, binder: 0x1a1a1a, inv: 0x1a1a1a, banner: 0xfce883 }
};

let playerUnlocks = { binder: false, colorThemes: false, colors: [0x1a1a1a, 0xf4f4f4, 0x7f8c8d] };  

if (typeof myMojiDatabase !== 'undefined') {
    myMojiDatabase.forEach(moji => playerInventory[moji.id] = 0);
}

function loadGame() {
    let savedData = localStorage.getItem('myMojiSave');
    if (savedData) {
        let parsedData = JSON.parse(savedData);
        playerMoney = parsedData.money !== undefined ? Number(parsedData.money) : 50;
        if (parsedData.packs) playerPacks = { ...playerPacks, ...parsedData.packs };
        for (let id in parsedData.inventory) if (playerInventory[id] !== undefined) playerInventory[id] = Number(parsedData.inventory[id]);
        if (parsedData.unlocks) {
            if (parsedData.unlocks.binder !== undefined) playerUnlocks.binder = parsedData.unlocks.binder;
            if (parsedData.unlocks.colorThemes !== undefined) playerUnlocks.colorThemes = parsedData.unlocks.colorThemes; 
            if (parsedData.unlocks.colors) playerUnlocks.colors = parsedData.unlocks.colors;
        }
        
        // Noad the store name and rename status
        if (parsedData.storeName) storeName = parsedData.storeName;
        if (parsedData.hasRenamed !== undefined) hasRenamed = parsedData.hasRenamed;

        if (parsedData.themes) { 
            themeColors = parsedData.themes; 
            if (!themeColors.active) themeColors.active = { table: 0xf4f4f4, binder: 0x1a1a1a, inv: 0x1a1a1a, banner: 0xfce883 }; 
            // Self-healing check for older save files that don't have the banner color yet
            if (!themeColors.banner) themeColors.banner = 0xfce883;
            if (!themeColors.active.banner) themeColors.active.banner = 0xfce883;
        }
        
        if (parsedData.tableCards) cardsOnTable = parsedData.tableCards;
        if (parsedData.trade) currentTrade = parsedData.trade;
        if (parsedData.unread !== undefined) unreadMessage = parsedData.unread;
        if (parsedData.achievements) playerAchievements = parsedData.achievements;
        if (parsedData.stats) gameStats = { ...gameStats, ...parsedData.stats };
    }
}

function saveGame() {
    localStorage.setItem('myMojiSave', JSON.stringify({
        money: playerMoney, packs: playerPacks, inventory: playerInventory, unlocks: playerUnlocks, themes: themeColors, tableCards: cardsOnTable,
        trade: currentTrade, unread: unreadMessage, storeName: storeName, hasRenamed: hasRenamed,
        achievements: playerAchievements, stats: gameStats 
    }));
}

loadGame();

// --- ECONOMY STATE HELPERS ---

function checkBailout(scene) {
    let totalCards = Object.values(playerInventory).reduce((a, b) => a + b, 0) + cardsOnTable.length;
    let totalPacks = Object.values(playerPacks).reduce((a, b) => a + b, 0);
    let cheapestPackCost = Math.min(...Object.values(packDatabase).map(p => p.cost));
    
    if (playerMoney < cheapestPackCost && totalPacks === 0 && totalCards === 0) {
        gameStats.bailouts++;
        playerMoney += 20.00;
        
        // Update the UI if the scene is available
        if (scene && scene.moneyText) {
            scene.moneyText.setText('$' + playerMoney.toFixed(2));
        }
        
        alert("BAILOUT! The MyMoji Foundation saw you were completely broke and deposited $20.00 into your account!");
        saveGame();
    }
}

function generateTrade(scene) {
    if (currentTrade) return; 
    
    let isBuy = Math.random() > 0.5; 
    let randomMoji = myMojiDatabase[Math.floor(Math.random() * myMojiDatabase.length)];
    
    let priceMultiplier = isBuy 
        ? (1.2 + Math.random() * 0.8) 
        : (0.4 + Math.random() * 0.5); 
        
    currentTrade = { type: isBuy ? 'buy' : 'sell', mojiId: randomMoji.id, price: Number((randomMoji.baseValue * priceMultiplier).toFixed(2)) };
    
    // NEW: Set the expiration for 2 minutes (120,000 milliseconds) from now
    tradeExpirationTime = Date.now() + 120000; 

    unreadMessage = true;
    if (scene.phoneNotification) scene.phoneNotification.setVisible(true);
    saveGame();
}

function processBulkSell(scene, overlay, rarityTarget) {
    let totalEarned = 0;
    let minOwned = playerUnlocks.binder ? 1 : 0;
    
    myMojiDatabase.forEach(moji => {
        if (rarityTarget === 'all' || moji.rarity === rarityTarget) {
            let owned = Number(playerInventory[moji.id]);
            if (owned > minOwned) {
                let amountToSell = owned - minOwned;
                totalEarned += amountToSell * (moji.baseValue * 0.5);
                playerInventory[moji.id] = minOwned;
            }
        }
    });

    if (totalEarned > 0) {
        playerMoney += totalEarned;
        scene.moneyText.setText('$' + playerMoney.toFixed(2));
        saveGame();
        alert(`Successfully liquidated cards for $${totalEarned.toFixed(2)}!`);
        if (typeof renderInventoryView === 'function') renderInventoryView(scene, overlay);
    } else {
        alert("You don't have any matching doubles to quick-sell!");
    }
}

function calculateCartTotal() {
    let total = 0;
    for (let key in shoppingCart) total += (shoppingCart[key] * packDatabase[key].cost);
    return total;
}
