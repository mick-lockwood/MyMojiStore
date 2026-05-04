// ==========================================
// SYSTEM: ACHIEVEMENTS & MILESTONES
// ==========================================

const achievementDatabase = [
    // Wealth
    { id: "ach_money_1", name: "Piggy Bank", desc: "Accumulate $100.00", reward: 25.00 },
    { id: "ach_money_2", name: "High Roller", desc: "Accumulate $1,000.00", reward: 100.00 },
    { id: "ach_money_3", name: "Mojionaire", desc: "Accumulate $10,000.00", reward: 500.00 },
    
    // Collection
    { id: "ach_coll_1", name: "Getting Started", desc: "Collect 10 unique MyMojis", reward: 20.00 },
    { id: "ach_coll_2", name: "Halfway There", desc: "Collect 72 unique MyMojis", reward: 150.00 },
    { id: "ach_coll_3", name: "Gotta Catch 'Em All", desc: "Collect all MyMojis!", reward: 1000.00 },
    
    // Packs Opened
    { id: "ach_pack_1", name: "Cardboard Crack", desc: "Open 5 Packs", reward: 10.00 },
    { id: "ach_pack_2", name: "Pack Ripper", desc: "Open 50 Packs", reward: 50.00 },
    { id: "ach_pack_3", name: "Whale Status", desc: "Open 250 Packs", reward: 200.00 },
    
    // Trading
    { id: "ach_trade_1", name: "Art of the Deal", desc: "Complete 1 NPC Trade", reward: 15.00 },
    { id: "ach_trade_2", name: "Hustler", desc: "Complete 10 NPC Trades", reward: 50.00 },
    { id: "ach_trade_3", name: "Wolf of Moji Street", desc: "Complete 50 NPC Trades", reward: 250.00 },
    
    // Rarities
    { id: "ach_rare", name: "Ooo, Shiny!", desc: "Pull your first Rare card", reward: 20.00 },
    { id: "ach_epic", name: "Epic Gamer Moment", desc: "Pull your first Epic card", reward: 50.00 },
    { id: "ach_leg", name: "Legendary Luck", desc: "Pull your first Legendary card", reward: 100.00 },
    { id: "ach_glitch", name: "Wait, Is That Legal?", desc: "Pull a Glitch rarity card", reward: 500.00 },
    
    // Milestones
    { id: "ach_rename", name: "Rebranding", desc: "Rename your store", reward: 25.00 },
    { id: "ach_bailout", name: "Rock Bottom", desc: "Receive the $20 Bailout", reward: 5.00 },
    { id: "ach_binder", name: "Organized", desc: "Purchase the Pro Binder", reward: 25.00 },
    { id: "ach_palette", name: "Interior Designer", desc: "Buy your first Color Palette", reward: 25.00 }
];

function showAchievementBanner(scene, ach) {
    let banner = scene.add.container(512, -100).setDepth(2000); 
    
    let bg = scene.add.rectangle(0, 0, 360, 90, 0x2c3e50, 0.95).setStrokeStyle(3, 0xf1c40f);
    let title = scene.add.text(0, -25, "🏆 ACHIEVEMENT UNLOCKED!", { fontSize: '14px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
    let name = scene.add.text(0, 0, ach.name, { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    let rewardTxt = scene.add.text(0, 25, `REWARD: $${ach.reward.toFixed(2)}`, { fontSize: '16px', color: '#2ecc71', fontStyle: 'bold' }).setOrigin(0.5);
    
    banner.add([bg, title, name, rewardTxt]);
    
    scene.tweens.add({ targets: banner, y: 100, ease: 'Back.easeOut', duration: 600, yoyo: true, hold: 4000, onComplete: () => banner.destroy() });
}

function checkAchievements(scene) {
    let newlyUnlocked = [];
    let uniqueCount = myMojiDatabase.filter(m => playerInventory[m.id] > 0).length;

    achievementDatabase.forEach(ach => {
        if (playerAchievements.includes(ach.id)) return; 

        let unlocked = false;
        switch(ach.id) {
            case "ach_money_1": if (playerMoney >= 100) unlocked = true; break;
            case "ach_money_2": if (playerMoney >= 1000) unlocked = true; break;
            case "ach_money_3": if (playerMoney >= 10000) unlocked = true; break;
            case "ach_coll_1": if (uniqueCount >= 10) unlocked = true; break;
            case "ach_coll_2": if (uniqueCount >= 72) unlocked = true; break;
            case "ach_coll_3": if (uniqueCount >= myMojiDatabase.length) unlocked = true; break;
            case "ach_pack_1": if (gameStats.packsOpened >= 5) unlocked = true; break;
            case "ach_pack_2": if (gameStats.packsOpened >= 50) unlocked = true; break;
            case "ach_pack_3": if (gameStats.packsOpened >= 250) unlocked = true; break;
            case "ach_trade_1": if (gameStats.npcTrades >= 1) unlocked = true; break;
            case "ach_trade_2": if (gameStats.npcTrades >= 10) unlocked = true; break;
            case "ach_trade_3": if (gameStats.npcTrades >= 50) unlocked = true; break;
            case "ach_rename": if (hasRenamed) unlocked = true; break;
            case "ach_bailout": if (gameStats.bailouts >= 1) unlocked = true; break;
            case "ach_binder": if (playerUnlocks.binder) unlocked = true; break;
            case "ach_palette": if (playerUnlocks.colors.length > 3) unlocked = true; break; 
            case "ach_rare": if (myMojiDatabase.some(m => m.rarity === 'Rare' && playerInventory[m.id] > 0)) unlocked = true; break;
            case "ach_epic": if (myMojiDatabase.some(m => m.rarity === 'Epic' && playerInventory[m.id] > 0)) unlocked = true; break;
            case "ach_leg": if (myMojiDatabase.some(m => m.rarity === 'Legendary' && playerInventory[m.id] > 0)) unlocked = true; break;
            case "ach_glitch": if (myMojiDatabase.some(m => m.rarity === 'Glitch' && playerInventory[m.id] > 0)) unlocked = true; break;
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
