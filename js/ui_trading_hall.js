function createTradingOverlay(scene) {
    let overlayBgColor = themeColors.active.trading || themeColors.active.store || 0x111111; 
    let bgContrast = getContrastColor(overlayBgColor);

    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(100); 

    // FIXED: Increased height to 740
    const bg = scene.add.rectangle(0, 0, 900, 740, overlayBgColor).setStrokeStyle(4, 0x9b59b6).setInteractive(); 
    overlay.bg = bg;

    // FIXED: Pushed Title and SubTitle up to make room
    const title = scene.add.text(0, -320, 'THE TRADING HALL', { fontFamily: 'Impact, sans-serif', fontSize: '36px', color: bgContrast, fontStyle: 'bold' }).setOrigin(0.5);
    overlay.titleTxt = title;

    const subTitle = scene.add.text(0, -280, 'Buy missing cards at a 500% markup. No refunds.', { fontFamily: 'Arial', fontSize: '18px', color: bgContrast }).setOrigin(0.5);
    subTitle.setAlpha(0.8); 
    overlay.subTitleTxt = subTitle;

    // FIXED: Pushed Close Button up to match Title
    const closeTxt = scene.add.text(410, -320, '✖', { fontSize: '28px', color: bgContrast }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    overlay.closeTxt = closeTxt;
    closeTxt.on('pointerdown', () => overlay.setVisible(false));
    
    overlay.add([bg, title, subTitle, closeTxt]);

    overlay.currentPage = 0; 
    overlay.contentContainer = scene.add.container(0, 0);
    overlay.add(overlay.contentContainer);

    return overlay;
}

function renderTradingView(scene, overlay) {
    overlay.contentContainer.removeAll(true);

    // Recalculate if theme changes
    let overlayBgColor = themeColors.active.trading || themeColors.active.store || 0x111111; 
    let bgContrast = getContrastColor(overlayBgColor);

    if (overlay.bg) overlay.bg.setFillStyle(overlayBgColor);
    if (overlay.titleTxt) overlay.titleTxt.setColor(bgContrast);
    if (overlay.subTitleTxt) overlay.subTitleTxt.setColor(bgContrast);
    if (overlay.closeTxt) overlay.closeTxt.setColor(bgContrast);

    // FIXED: Adjusted Row Spacing & Starting Heights
    let startX = -330; 
    let startY = -130;  
    let spacingX = 220;
    let spacingY = 285; 
    
    let missingCards = [];
    myMojiDatabase.forEach(moji => {
        if (!playerInventory[moji.id] || playerInventory[moji.id] === 0) {
            missingCards.push(moji);
        }
    });

    let itemsPerPage = 8;
    let totalPages = Math.ceil(missingCards.length / itemsPerPage);
    
    if (overlay.currentPage >= totalPages && totalPages > 0) {
        overlay.currentPage = totalPages - 1;
    }
    if (overlay.currentPage < 0) overlay.currentPage = 0;

    let startIndex = overlay.currentPage * itemsPerPage;
    let cardsToShow = missingCards.slice(startIndex, startIndex + itemsPerPage);

    cardsToShow.forEach((moji, index) => {
        let col = index % 4; 
        let row = Math.floor(index / 4); 
        
        let cardCont = scene.add.container(startX + (col * spacingX), startY + (row * spacingY));
        cardCont.setScale(0.6); 

        let graphics = createCardGraphic(scene, moji);
        cardCont.add(graphics);
        
        let blackMarketPrice = moji.baseValue * 5;

        // FIXED: Pushed much further down (195) to clear the card border
        let priceTxt = scene.add.text(0, 195, '$' + blackMarketPrice.toFixed(2), { fontSize: '28px', color: '#e74c3c', fontStyle: 'bold' }).setOrigin(0.5);
        
        // FIXED: Made the button physically larger (180x50) and pushed it further down (255)
        let buyBtn = createButton(scene, 0, 255, 180, 50, 0x9b59b6, null, 'BUY CARD', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }, () => {
            if (playerMoney >= blackMarketPrice) {
                playSound(scene, 'coin', { volume: 0.6 }); 
                playerMoney -= blackMarketPrice;
                scene.moneyText.setText('$' + playerMoney.toFixed(2));
                
                playerInventory[moji.id] = 1; 
                saveGame();
                
                scene.moneyText.setColor('#e74c3c'); 
                scene.time.delayedCall(300, () => {
                    let bannerColor = themeColors.active.banner || 0x1a1a1a;
                    scene.moneyText.setColor(getContrastColor(bannerColor));
                });

                renderTradingView(scene, overlay); 
            } else {
                buyBtn.list[1].setColor('#e74c3c');
                scene.time.delayedCall(300, () => buyBtn.list[1].setColor('#ffffff'));
            }
        });

        cardCont.add([priceTxt, buyBtn]);
        overlay.contentContainer.add(cardCont);
    });

    if (totalPages > 1) {
        // FIXED: Replaced 'createButton' with a text-only clickable object!
        if (overlay.currentPage > 0) {
            let prevTxt = scene.add.text(-200, 345, '◀ PREV', { fontSize: '22px', color: bgContrast, fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            // Add a snappy hover effect so it feels interactive
            prevTxt.on('pointerover', () => scene.tweens.add({ targets: prevTxt, scale: 1.2, duration: 100 }));
            prevTxt.on('pointerout', () => scene.tweens.add({ targets: prevTxt, scale: 1, duration: 100 }));
            
            prevTxt.on('pointerdown', () => {
                overlay.currentPage--;
                renderTradingView(scene, overlay);
            });
            overlay.contentContainer.add(prevTxt);
        }

        let pageTxt = scene.add.text(0, 345, `PAGE ${overlay.currentPage + 1} OF ${totalPages}`, { fontSize: '20px', color: bgContrast, fontStyle: 'bold' }).setOrigin(0.5);
        overlay.contentContainer.add(pageTxt);

        // FIXED: Replaced 'createButton' with a text-only clickable object!
        if (overlay.currentPage < totalPages - 1) {
            let nextTxt = scene.add.text(200, 345, 'NEXT ▶', { fontSize: '22px', color: bgContrast, fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            // Add a snappy hover effect so it feels interactive
            nextTxt.on('pointerover', () => scene.tweens.add({ targets: nextTxt, scale: 1.2, duration: 100 }));
            nextTxt.on('pointerout', () => scene.tweens.add({ targets: nextTxt, scale: 1, duration: 100 }));
            
            nextTxt.on('pointerdown', () => {
                overlay.currentPage++;
                renderTradingView(scene, overlay);
            });
            overlay.contentContainer.add(nextTxt);
        }
    }

    if (missingCards.length === 0) {
        let emptyTxt = scene.add.text(0, 0, "You own every card.\nThe Trading Hall has nothing for you.", { fontSize: '24px', color: bgContrast, fontStyle: 'italic', align: 'center' }).setOrigin(0.5);
        emptyTxt.setAlpha(0.7); 
        overlay.contentContainer.add(emptyTxt);
    }
}
