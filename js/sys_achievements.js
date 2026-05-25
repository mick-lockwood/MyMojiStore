// ==========================================
// SYSTEM: ACHIEVEMENTS & MILESTONES
// ==========================================

const achievementDatabase = [
    // Wealth
    { id: "ach_money_1", name: "Piggy Bank", desc: "Accumulate $100.00", reward: 25.00 },
    { id: "ach_money_2", name: "High Roller", desc: "Accumulate $1,000.00", reward: 100.00 },
    { id: "ach_money_3", name: "Mojionaire", desc: "Accumulate $10,000.00", reward: 500.00 },
    { id: "ach_money_4", name: "Stonks", desc: "Accumulate $100,000.00", reward: 5000.00 }, // NEW
    
    // Collection
    { id: "ach_coll_1", name: "Getting Started", desc: "Collect 10 unique MyMojis", reward: 20.00 },
    { id: "ach_coll_2", name: "Halfway There", desc: "Collect 72 unique MyMojis", reward: 150.00 },
    { id: "ach_coll_4", name: "The 100 Club", desc: "Collect 100 unique MyMojis", reward: 300.00 }, // NEW
    { id: "ach_coll_3", name: "Gotta Catch 'Em All", desc: "Collect all MyMojis!", reward: 1000.00 },
    
    // Player Levels (NEW CATEGORY)
    { id: "ach_lvl_1", name: "Novice Collector", desc: "Reach Level 5", reward: 50.00 },
    { id: "ach_lvl_2", name: "Adept Collector", desc: "Reach Level 10", reward: 150.00 },
    { id: "ach_lvl_3", name: "Master Collector", desc: "Reach Level 25", reward: 500.00 },
    { id: "ach_lvl_4", name: "Grandmaster", desc: "Reach Level 50", reward: 2500.00 },
    
    // Packs Opened & Hoarding
    { id: "ach_pack_1", name: "Cardboard Crack", desc: "Open 5 Packs", reward: 10.00 },
    { id: "ach_pack_2", name: "Pack Ripper", desc: "Open 50 Packs", reward: 50.00 },
    { id: "ach_pack_3", name: "Whale Status", desc: "Open 250 Packs", reward: 200.00 },
    { id: "ach_hoarder_1", name: "Saving for a Rainy Day", desc: "Hold 10 unopened packs at once", reward: 50.00 }, // NEW
    { id: "ach_hoarder_2", name: "Diamond Hands", desc: "Hold 50 unopened packs at once", reward: 300.00 }, // NEW
    
    // Trading
    { id: "ach_trade_1", name: "Art of the Deal", desc: "Complete 1 NPC Trade", reward: 15.00 },
    { id: "ach_trade_2", name: "Hustler", desc: "Complete 10 NPC Trades", reward: 50.00 },
    { id: "ach_trade_3", name: "Wolf of Moji Street", desc: "Complete 50 NPC Trades", reward: 250.00 },
    { id: "ach_trade_4", name: "Market Maker", desc: "Complete 100 NPC Trades", reward: 1000.00 }, // NEW
    
    // Rarities
    { id: "ach_rare", name: "Ooo, Shiny!", desc: "Pull your first Rare card", reward: 20.00 },
    { id: "ach_epic", name: "Epic Gamer Moment", desc: "Pull your first Epic card", reward: 50.00 },
    { id: "ach_leg", name: "Legendary Luck", desc: "Pull your first Legendary card", reward: 100.00 },
    { id: "ach_glitch", name: "Wait, Is That Legal?", desc: "Pull a Glitch rarity card", reward: 500.00 },
    
    // Categories (NEW CATEGORY)
    { id: "ach_cat_food", name: "Foodie", desc: "Collect your first Food card", reward: 25.00 },
    { id: "ach_cat_cosmic", name: "Astronomer", desc: "Collect your first Cosmic card", reward: 25.00 },
    { id: "ach_cat_meme", name: "Meme Lord", desc: "Collect your first Meme card", reward: 25.00 },
    { id: "ach_cat_spooky", name: "Ghost Hunter", desc: "Collect your first Spooky card", reward: 25.00 },
    
    // Specific Chase Cards (NEW CATEGORY)
    { id: "ach_card_grail", name: "You Chose... Wisely", desc: "Collect The Holy Grail", reward: 1000.00 },
    { id: "ach_card_matrix", name: "The Red Pill", desc: "Collect the Matrix Code", reward: 2500.00 },
    
    // Banking & Debt (NEW CATEGORY)
    { id: "ach_debt_1", name: "In the Red", desc: "Owe the Bank over $100", reward: 50.00 }, // Ironically pays them for going into debt!
    { id: "ach_debt_2", name: "Swimming in Debt", desc: "Owe the Bank over $1,000", reward: 250.00 },
    { id: "ach_debt_3", name: "Too Big To Fail", desc: "Owe the Bank over $5,000", reward: 1000.00 },

    // Milestones & Bailouts
    { id: "ach_rename", name: "Rebranding", desc: "Rename your store", reward: 25.00 },
    { id: "ach_binder", name: "Organized", desc: "Purchase the Pro Binder", reward: 25.00 },
    { id: "ach_palette", name: "Interior Designer", desc: "Buy your first Color Palette", reward: 25.00 },
    { id: "ach_bailout_1", name: "Rock Bottom", desc: "Receive the $20 Bailout", reward: 5.00 },
    { id: "ach_bailout_2", name: "Frequent Flyer", desc: "Receive 5 Bailouts", reward: 50.00 }, // NEW
    { id: "ach_bailout_3", name: "Systemic Risk", desc: "Receive 20 Bailouts", reward: 200.00 } // NEW
];

function showAchievementBanner(scene, ach) {
    let banner = scene.add.container(512, -100).setDepth(2000); 
    
    let bg = scene.add.rectangle(0, 0, 360, 90, 0x2c3e50, 0.95).setStrokeStyle(3, 0xf1c40f);
    let title = scene.add.text(0, -25, "🏆 ACHIEVEMENT UNLOCKED!", { fontSize: '14px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
    let name = scene.add.text(0, 0, ach.name, { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    let rewardTxt = scene.add.text(0, 25, `REWARD: $${ach.reward.toFixed(2)}`, { fontSize: '16px', color: '#2ecc71', fontStyle: 'bold' }).setOrigin(0.5);
    
    banner.add([bg, title, name, rewardTxt]);
    
    scene.tweens.add({ targets: banner, y: 100, ease: 'Back.easeOut', duration: 600, yoyo: true, hold: 4000, onComplete: () => banner.destroy() });
    
    // SOUND EFFECT
    scene.sound.play('achievement_notification', { volume: 1.0 });
}

function checkAchievements(scene) {
    let newlyUnlocked = [];
    let uniqueCount = myMojiDatabase.filter(m => playerInventory[m.id] > 0).length;
    let totalPacksHeld = Object.values(playerPacks).reduce((a, b) => a + b, 0);

    achievementDatabase.forEach(ach => {
        if (playerAchievements.includes(ach.id)) return; 

        let unlocked = false;
        switch(ach.id) {
            // Wealth
            case "ach_money_1": if (playerMoney >= 100) unlocked = true; break;
            case "ach_money_2": if (playerMoney >= 1000) unlocked = true; break;
            case "ach_money_3": if (playerMoney >= 10000) unlocked = true; break;
            case "ach_money_4": if (playerMoney >= 100000) unlocked = true; break;
            
            // Collection
            case "ach_coll_1": if (uniqueCount >= 10) unlocked = true; break;
            case "ach_coll_2": if (uniqueCount >= 72) unlocked = true; break;
            case "ach_coll_4": if (uniqueCount >= 100) unlocked = true; break;
            case "ach_coll_3": if (uniqueCount >= myMojiDatabase.length) unlocked = true; break;
            
            // Player Levels
            case "ach_lvl_1": if (playerLevel >= 5) unlocked = true; break;
            case "ach_lvl_2": if (playerLevel >= 10) unlocked = true; break;
            case "ach_lvl_3": if (playerLevel >= 25) unlocked = true; break;
            case "ach_lvl_4": if (playerLevel >= 50) unlocked = true; break;
            
            // Packs
            case "ach_pack_1": if (gameStats.packsOpened >= 5) unlocked = true; break;
            case "ach_pack_2": if (gameStats.packsOpened >= 50) unlocked = true; break;
            case "ach_pack_3": if (gameStats.packsOpened >= 250) unlocked = true; break;
            case "ach_hoarder_1": if (totalPacksHeld >= 10) unlocked = true; break;
            case "ach_hoarder_2": if (totalPacksHeld >= 50) unlocked = true; break;
            
            // Trading
            case "ach_trade_1": if (gameStats.npcTrades >= 1) unlocked = true; break;
            case "ach_trade_2": if (gameStats.npcTrades >= 10) unlocked = true; break;
            case "ach_trade_3": if (gameStats.npcTrades >= 50) unlocked = true; break;
            case "ach_trade_4": if (gameStats.npcTrades >= 100) unlocked = true; break;
            
            // Milestones & Bailouts
            case "ach_rename": if (hasRenamed) unlocked = true; break;
            case "ach_bailout_1": if (gameStats.bailouts >= 1) unlocked = true; break;
            case "ach_bailout_2": if (gameStats.bailouts >= 5) unlocked = true; break;
            case "ach_bailout_3": if (gameStats.bailouts >= 20) unlocked = true; break;
            case "ach_binder": if (playerUnlocks.binder) unlocked = true; break;
            case "ach_palette": if (playerUnlocks.colors.length > 3) unlocked = true; break; 
            
            // Banking & Debt
            case "ach_debt_1": if (typeof playerDebt !== 'undefined' && playerDebt >= 100) unlocked = true; break;
            case "ach_debt_2": if (typeof playerDebt !== 'undefined' && playerDebt >= 1000) unlocked = true; break;
            case "ach_debt_3": if (typeof playerDebt !== 'undefined' && playerDebt >= 5000) unlocked = true; break;

            // Rarities
            case "ach_rare": if (myMojiDatabase.some(m => m.rarity === 'Rare' && playerInventory[m.id] > 0)) unlocked = true; break;
            case "ach_epic": if (myMojiDatabase.some(m => m.rarity === 'Epic' && playerInventory[m.id] > 0)) unlocked = true; break;
            case "ach_leg": if (myMojiDatabase.some(m => m.rarity === 'Legendary' && playerInventory[m.id] > 0)) unlocked = true; break;
            case "ach_glitch": if (myMojiDatabase.some(m => m.rarity === 'Glitch' && playerInventory[m.id] > 0)) unlocked = true; break;
            
            // Categories
            case "ach_cat_food": if (myMojiDatabase.some(m => m.category === 'Food' && playerInventory[m.id] > 0)) unlocked = true; break;
            case "ach_cat_cosmic": if (myMojiDatabase.some(m => m.category === 'Cosmic' && playerInventory[m.id] > 0)) unlocked = true; break;
            case "ach_cat_meme": if (myMojiDatabase.some(m => m.category === 'Meme' && playerInventory[m.id] > 0)) unlocked = true; break;
            case "ach_cat_spooky": if (myMojiDatabase.some(m => m.category === 'Spooky' && playerInventory[m.id] > 0)) unlocked = true; break;
            
            // Specific Chase Cards
            case "ach_card_grail": if (playerInventory["m_141"] > 0) unlocked = true; break;
            case "ach_card_matrix": if (playerInventory["m_148"] > 0) unlocked = true; break;
        }

        if (unlocked) {
            playerAchievements.push(ach.id);
            playerMoney += ach.reward;
            newlyUnlocked.push(ach);
        }
    });

    if (newlyUnlocked.length > 0) {
        if (scene.moneyText) scene.moneyText.setText('$' + playerMoney.toFixed(2));
        saveGame();
        newlyUnlocked.forEach((ach, index) => {
            scene.time.delayedCall(index * 2000, () => showAchievementBanner(scene, ach));
        });
    }
}

// --- ACHIEVEMENT UI OVERLAY ---

function createAchievementsOverlay(scene) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(400); // High depth to cover everything
    
    const bg = scene.add.rectangle(0, 0, 800, 600, 0x1a1a1a).setStrokeStyle(4, 0xf1c40f).setInteractive();
    const title = scene.add.text(0, -260, 'ACHIEVEMENTS', { fontFamily: 'Impact', fontSize: '32px', color: '#f1c40f' }).setOrigin(0.5);
    const closeTxt = scene.add.text(360, -260, '✖', { fontSize: '28px', color: '#ffffff' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);

    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    overlay.listContainer = scene.add.container(0, 0);
    overlay.add([bg, title, closeTxt, overlay.listContainer]);

    overlay.currentPage = 0;
    return overlay;
}

function renderAchievementsView(scene, overlay) {
    overlay.listContainer.removeAll(true);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(achievementDatabase.length / itemsPerPage);

    // --- Pagination Controls ---
    let prevColor = overlay.currentPage > 0 ? 0x3498db : 0x7f8c8d;
    let nextColor = overlay.currentPage < totalPages - 1 ? 0x3498db : 0x7f8c8d;

    let prevBtn = createButton(scene, -150, 240, 100, 40, prevColor, 0x000000, '◀ PREV', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
        if (overlay.currentPage > 0) {
            overlay.currentPage--;
            renderAchievementsView(scene, overlay);
        }
    });

    let pageTxt = scene.add.text(0, 240, `PAGE ${overlay.currentPage + 1} / ${totalPages}`, { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);

    let nextBtn = createButton(scene, 150, 240, 100, 40, nextColor, 0x000000, 'NEXT ▶', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
        if (overlay.currentPage < totalPages - 1) {
            overlay.currentPage++;
            renderAchievementsView(scene, overlay);
        }
    });

    overlay.listContainer.add([prevBtn, pageTxt, nextBtn]);

    // --- Draw the Achievement List ---
    let startY = -155; // PUSHED DOWN (was -180)
    let startIndex = overlay.currentPage * itemsPerPage;
    let endIndex = Math.min(startIndex + itemsPerPage, achievementDatabase.length);

    let unlockedCount = playerAchievements.length;
    
    // PUSHED UP (was -210)
    let trackerTxt = scene.add.text(0, -225, `UNLOCKED: ${unlockedCount} / ${achievementDatabase.length}`, { fontSize: '18px', color: '#2ecc71', fontStyle: 'bold' }).setOrigin(0.5);
    overlay.listContainer.add(trackerTxt);

    for (let i = startIndex; i < endIndex; i++) {
        let ach = achievementDatabase[i];
        let isUnlocked = playerAchievements.includes(ach.id);

        let itemCont = scene.add.container(0, startY);
        
        let itemBgColor = isUnlocked ? 0x27ae60 : 0x2c3e50;
        let itemBg = scene.add.rectangle(0, 0, 700, 70, itemBgColor).setStrokeStyle(2, 0xffffff);
        itemBg.setAlpha(isUnlocked ? 0.9 : 0.6);

        let iconTxt = scene.add.text(-310, 0, isUnlocked ? '🏆' : '🔒', { fontSize: '32px' }).setOrigin(0.5);
        let nameTxt = scene.add.text(-260, -15, ach.name, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5);
        
        // Hide the description if they haven't unlocked it yet (adds mystery!), or show it to guide them
        let descText = isUnlocked ? ach.desc : "???"; 
        
        let descObj = scene.add.text(-260, 15, descText, { fontSize: '16px', color: isUnlocked ? '#ecf0f1' : '#bdc3c7' }).setOrigin(0, 0.5);
        let rewardTxt = scene.add.text(320, 0, `Reward:\n$${ach.reward.toFixed(2)}`, { fontSize: '16px', color: isUnlocked ? '#fce883' : '#7f8c8d', fontStyle: 'bold', align: 'right' }).setOrigin(1, 0.5);

        itemCont.add([itemBg, iconTxt, nameTxt, descObj, rewardTxt]);
        overlay.listContainer.add(itemCont);
        startY += 80;
    }
}
