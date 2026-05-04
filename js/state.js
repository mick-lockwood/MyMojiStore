// --- GLOBAL STATE & LOCAL STORAGE ---
let playerMoney = 50.00;
let playerPacks = { "basic": 0, "premium": 0, "legendary": 0 };
let playerInventory = {};
let shoppingCart = { "basic": 0, "premium": 0, "legendary": 0 }; 
let cardsOnTable = []; 

// NPC Trade & Phone State
let currentTrade = null;
let unreadMessage = false;

let themeColors = { 
    table: '#f4f4f4', binder: 0x1a1a1a, inventory: 0x1a1a1a,
    active: { table: 0xf4f4f4, binder: 0x1a1a1a, inv: 0x1a1a1a }
};

let playerUnlocks = { binder: false, colorThemes: false, colors: [0x1a1a1a, 0xf4f4f4, 0x7f8c8d] };  

// Initialize empty inventory for all cards
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
        if (parsedData.themes) { themeColors = parsedData.themes; if (!themeColors.active) themeColors.active = { table: 0xf4f4f4, binder: 0x1a1a1a, inv: 0x1a1a1a }; }
        if (parsedData.tableCards) cardsOnTable = parsedData.tableCards;
        
        // Load Phone state
        if (parsedData.trade) currentTrade = parsedData.trade;
        if (parsedData.unread !== undefined) unreadMessage = parsedData.unread;
    }
}

function saveGame() {
    localStorage.setItem('myMojiSave', JSON.stringify({
        money: playerMoney, packs: playerPacks, inventory: playerInventory, unlocks: playerUnlocks, themes: themeColors, tableCards: cardsOnTable,
        trade: currentTrade, unread: unreadMessage
    }));
}

// Automatically load game on script execution
loadGame();

// --- ECONOMY STATE HELPERS ---

function checkBailout(scene) {
    let totalCards = Object.values(playerInventory).reduce((a, b) => a + b, 0) + cardsOnTable.length;
    let totalPacks = playerPacks.basic + playerPacks.premium + playerPacks.legendary;
    
    if (playerMoney < 5.00 && totalPacks === 0 && totalCards === 0) {
        playerMoney += 20.00;
        scene.moneyText.setText('$' + playerMoney.toFixed(2));
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
