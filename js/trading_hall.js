function createTradingOverlay(scene) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(100); 
    
    // Dark, shady background for the Black Market
    const bg = scene.add.rectangle(0, 0, 900, 650, 0x111111).setStrokeStyle(4, 0x9b59b6).setInteractive(); 

    const title = scene.add.text(0, -290, 'THE TRADING HALL', { fontFamily: 'Impact, sans-serif', fontSize: '36px', color: '#9b59b6', fontStyle: 'bold' }).setOrigin(0.5);
    const subTitle = scene.add.text(0, -250, 'Buy missing cards at a 500% markup. No refunds.', { fontFamily: 'Arial', fontSize: '18px', color: '#7f8c8d' }).setOrigin(0.5);

    const closeTxt = scene.add.text(410, -290, '✖', { fontSize: '28px', color: '#9b59b6' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));
    
    overlay.add([bg, title, subTitle, closeTxt]);

    overlay.contentContainer = scene.add.container(0, 0);
    overlay.add(overlay.contentContainer);

    return overlay;
}

function renderTradingView(scene, overlay) {
    overlay.contentContainer.removeAll(true);

    let startX = -330; 
    let startY = -120; 
    let spacingX = 220;
    let spacingY = 250; 
    
    let index = 0;
    let hasMissingCards = false;

    // Loop through the entire database to find cards the player DOES NOT own
    myMojiDatabase.forEach(moji => {
        if (!playerInventory[moji.id] || playerInventory[moji.id] === 0) {
            hasMissingCards = true;
            
            // Only show the first 8 missing cards to fit on the screen (keeps it a rotating stock!)
            if (index >= 8) return; 

            let col = index % 4; 
            let row = Math.floor(index / 4); 
            
            let cardCont = scene.add.container(startX + (col * spacingX), startY + (row * spacingY));
            cardCont.setScale(0.65); 

            // Create the card graphic
            let graphics = createCardGraphic(scene, moji);
            cardCont.add(graphics);
            
            // The Black Market Price (5x the normal value!)
            let blackMarketPrice = moji.baseValue * 5;

            let priceTxt = scene.add.text(0, 190, '$' + blackMarketPrice.toFixed(2), { fontSize: '28px', color: '#e74c3c', fontStyle: 'bold' }).setOrigin(0.5);
            
            let buyBtn = createButton(scene, 0, 240, 140, 40, 0x9b59b6, null, 'BUY CARD', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
                if (playerMoney >= blackMarketPrice) {
                    // Take money, give card
                    playerMoney -= blackMarketPrice;
                    scene.moneyText.setText('$' + playerMoney.toFixed(2));
                    
                    playerInventory[moji.id] = 1; 
                    saveGame();
                    
                    // Flash money red to show the hit
                    scene.moneyText.setColor('#e74c3c'); 
                    scene.time.delayedCall(300, () => {
                        let bannerColor = themeColors.active.banner || 0x1a1a1a;
                        scene.moneyText.setColor(getContrastColor(bannerColor));
                    });

                    // Re-render to remove the card from the shop
                    renderTradingView(scene, overlay); 
                } else {
                    // Flash button red if they are too broke
                    buyBtn.list[1].setColor('#e74c3c');
                    scene.time.delayedCall(300, () => buyBtn.list[1].setColor('#ffffff'));
                }
            });

            cardCont.add([priceTxt, buyBtn]);
            overlay.contentContainer.add(cardCont);
            
            index++;
        }
    });

    if (!hasMissingCards) {
        let emptyTxt = scene.add.text(0, 0, "You own every card. The Black Market has nothing for you.", { fontSize: '24px', color: '#7f8c8d', fontStyle: 'italic' }).setOrigin(0.5);
        overlay.contentContainer.add(emptyTxt);
    }
}
