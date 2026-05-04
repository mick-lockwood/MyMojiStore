function createPhoneOverlay(scene) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(400);
    const bg = scene.add.rectangle(0, 0, 350, 600, 0x1a1a1a).setStrokeStyle(6, 0xecf0f1).setInteractive(); 
    const notch = scene.add.rectangle(0, -290, 120, 25, 0x000000, 1).setInteractive(); 
    
    const title = scene.add.text(0, -240, 'MESSAGES', { fontFamily: 'Impact', fontSize: '28px', color: '#ffffff' }).setOrigin(0.5);
    const closeBtn = createButton(scene, 0, 250, 200, 50, 0xe74c3c, null, 'PUT PHONE AWAY', { fontSize: '16px', color: '#fff', fontStyle: 'bold'}, () => overlay.setVisible(false));
    
    overlay.msgContainer = scene.add.container(0, 0);
    overlay.add([bg, notch, title, closeBtn, overlay.msgContainer]);
    return overlay;
}

function renderPhoneView(scene, overlay) {
    overlay.msgContainer.removeAll(true);
    
    if (!currentTrade) {
        let txt = scene.add.text(0, -20, "No new messages...\nCheck back later!", { fontSize: '20px', color: '#7f8c8d', align: 'center' }).setOrigin(0.5);
        overlay.msgContainer.add(txt);
        return;
    }

    let moji = myMojiDatabase.find(m => m.id === currentTrade.mojiId);
    let isBuy = currentTrade.type === 'buy'; 
    
    let bubble = scene.add.rectangle(0, -100, 310, 160, 0x34495e).setStrokeStyle(2, 0xffffff);
    
    let msg = isBuy 
        ? `Hey! I'm desperately looking for\n${moji.name}!\n\nI'll pay you $${currentTrade.price.toFixed(2)} for it.`
        : `Yo! I pulled an extra\n${moji.name}.\n\nWanna buy it for $${currentTrade.price.toFixed(2)}?`;
        
    let msgTxt = scene.add.text(0, -100, msg, { fontSize: '18px', color: '#ecf0f1', align: 'center', wordWrap: { width: 280 } }).setOrigin(0.5);

    // NEW: Calculate and show the remaining time
    let secondsLeft = Math.max(0, Math.floor((tradeExpirationTime - Date.now()) / 1000));
    let timeTxt = scene.add.text(140, -170, `⏳ ${secondsLeft}s`, { fontSize: '14px', color: '#e74c3c', fontStyle: 'bold' }).setOrigin(1, 0.5);
    
    // Optional: Make it pulse red if under 10 seconds!
    if (secondsLeft <= 10) {
        scene.tweens.add({ targets: timeTxt, scale: 1.2, alpha: 0.5, yoyo: true, repeat: -1, duration: 300 });
    }

    let cardG = scene.add.container(0, 70);
    cardG.add(createCardGraphic(scene, moji));
    cardG.setScale(0.4);
    
    let acceptBtn, declineBtn;
    
    const finalizeTrade = (messageText) => {
        showFloatingText(scene, 512, 384, messageText, '#9b59b6');
        currentTrade = null;
        saveGame();
        renderPhoneView(scene, overlay);
        scene.time.delayedCall(Phaser.Math.Between(30000, 60000), () => generateTrade(scene));
    };

    if (isBuy) {
        let owned = playerInventory[moji.id];
        let canFulfill = playerUnlocks.binder ? owned > 1 : owned > 0;
        
        if (canFulfill) {
            acceptBtn = createButton(scene, -80, 190, 120, 40, 0x27ae60, null, 'SELL IT', { fontSize: '16px', color: '#fff', fontStyle: 'bold'}, () => {
                playerInventory[moji.id]--;
                playerMoney += currentTrade.price;
                scene.moneyText.setText('$' + playerMoney.toFixed(2));
                finalizeTrade(`SOLD FOR $${currentTrade.price.toFixed(2)}!`);
            });
        } else {
            // Passed 'null' at the end so it's a completely dead, unclickable button
            acceptBtn = createButton(scene, -80, 190, 120, 40, 0x7f8c8d, null, 'NO SPARES', { fontSize: '14px', color: '#bdc3c7', fontStyle: 'bold'}, null);
        }
    } else {
        if (playerMoney >= currentTrade.price) {
            acceptBtn = createButton(scene, -80, 190, 120, 40, 0x27ae60, null, 'BUY IT', { fontSize: '16px', color: '#fff', fontStyle: 'bold'}, () => {
                
                // BULLETPROOF CHECK: Verify money at the exact moment of clicking
                if (playerMoney >= currentTrade.price) {
                    playerMoney -= currentTrade.price;
                    playerInventory[moji.id]++;
                    scene.moneyText.setText('$' + playerMoney.toFixed(2));
                    finalizeTrade(`BOUGHT ${moji.name}!`);
                } else {
                    alert("Wait! You don't have enough money for this right now!");
                    renderPhoneView(scene, overlay); // Refresh the UI to show the 'TOO POOR' button
                }
                
            });
        } else {
            // Passed 'null' at the end so it's completely unclickable
            acceptBtn = createButton(scene, -80, 190, 120, 40, 0x7f8c8d, null, 'TOO POOR', { fontSize: '16px', color: '#bdc3c7', fontStyle: 'bold'}, null);
        }
    }
    
    declineBtn = createButton(scene, 80, 190, 120, 40, 0xe74c3c, null, 'DECLINE', { fontSize: '16px', color: '#fff', fontStyle: 'bold'}, () => {
        finalizeTrade("OFFER DECLINED.");
    });
    
    overlay.msgContainer.add([bubble, msgTxt, timeTxt, cardG, acceptBtn, declineBtn]);
}
