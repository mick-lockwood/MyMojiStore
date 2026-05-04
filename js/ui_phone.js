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
            acceptBtn = createButton(scene, -80, 190, 120, 40, 0x7f8c8d, null, 'NO SPARES', { fontSize: '14px', color: '#fff', fontStyle: 'bold'}, () => {});
        }
    } else {
        if (playerMoney >= currentTrade.price) {
            acceptBtn = createButton(scene, -80, 190, 120, 40, 0x27ae60, null, 'BUY IT', { fontSize: '16px', color: '#fff', fontStyle: 'bold'}, () => {
                playerMoney -= currentTrade.price;
                playerInventory[moji.id]++;
                scene.moneyText.setText('$' + playerMoney.toFixed(2));
                finalizeTrade(`BOUGHT ${moji.name}!`);
            });
        } else {
            acceptBtn = createButton(scene, -80, 190, 120, 40, 0x7f8c8d, null, 'TOO POOR', { fontSize: '16px', color: '#fff', fontStyle: 'bold'}, () => {});
        }
    }
    
    declineBtn = createButton(scene, 80, 190, 120, 40, 0xe74c3c, null, 'DECLINE', { fontSize: '16px', color: '#fff', fontStyle: 'bold'}, () => {
        finalizeTrade("OFFER DECLINED.");
    });
    
    overlay.msgContainer.add([bubble, msgTxt, cardG, acceptBtn, declineBtn]);
}
