function createTradingOverlay(scene) {
    let overlayBgColor = themeColors.active.store || 0x111111; 
    let bgContrast = getContrastColor(overlayBgColor);

    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(100); 

    // 1. TALLER BACKGROUND: Increased height to 680
    const bg = scene.add.rectangle(0, 0, 900, 680, overlayBgColor).setStrokeStyle(4, 0x9b59b6).setInteractive(); 
    overlay.bg = bg;

    // 2. SHIFTED HEADER UP: Moved title and subtitle up slightly
    const title = scene.add.text(0, -300, 'THE TRADING HALL', { fontFamily: 'Impact, sans-serif', fontSize: '36px', color: bgContrast, fontStyle: 'bold' }).setOrigin(0.5);
    overlay.titleTxt = title;

    const subTitle = scene.add.text(0, -260, 'Buy missing cards at a 500% markup. No refunds.', { fontFamily: 'Arial', fontSize: '18px', color: bgContrast }).setOrigin(0.5);
    subTitle.setAlpha(0.8); 
    overlay.subTitleTxt = subTitle;

    const closeTxt = scene.add.text(410, -300, '✖', { fontSize: '28px', color: bgContrast }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
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

    let overlayBgColor = themeColors.active.store || 0x111111; 
    let bgContrast = getContrastColor(overlayBgColor);

    if (overlay.titleTxt) overlay.titleTxt.setColor(bgContrast);
    if (overlay.subTitleTxt) overlay.subTitleTxt.setColor(bgContrast);
    if (overlay.closeTxt) overlay.closeTxt.setColor(bgContrast);

    // 3. PERFECTED GRID MATH
    let startX = -330; 
    let startY = -120;  
    let spacingX = 220;
    let spacingY = 255; 
    
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
        
        // 4. SCALED DOWN SLIGHTLY (0.6 instead of 0.65)
        cardCont.setScale(0.6); 

        let graphics = createCardGraphic(scene, moji);
        cardCont.add(graphics);
        
        let blackMarketPrice = moji.baseValue * 5;

        // 5. TUCKED CLOSER TO CARD (Y changed from 190 to 175)
        let priceTxt = scene.add.text(0, 175, '$' + blackMarketPrice.toFixed(2), { fontSize: '28px', color: '#e74c3c', fontStyle: 'bold' }).setOrigin(0.5);
        
        // 6. TUCKED CLOSER TO CARD (Y changed from 240 to 225)
        let buyBtn = createButton(scene, 0, 225, 140, 40, 0x9b59b6, null, 'BUY CARD', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
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
        // 7. PUSHED PAGINATION DOWN SLIGHTLY
        if (overlay.currentPage > 0) {
            let prevBtn = createButton(scene, -150, 300, 120, 40, 0x34495e, 0xffffff, '◀ PREV', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }, () => {
                overlay.currentPage--;
                renderTradingView(scene, overlay);
            });
            overlay.contentContainer.add(prevBtn);
        }

        let pageTxt = scene.add.text(0, 300, `PAGE ${overlay.currentPage + 1} OF ${totalPages}`, { fontSize: '20px', color: bgContrast, fontStyle: 'bold' }).setOrigin(0.5);
        overlay.contentContainer.add(pageTxt);

        if (overlay.currentPage < totalPages - 1) {
            let nextBtn = createButton(scene, 150, 300, 120, 40, 0x34495e, 0xffffff, 'NEXT ▶', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }, () => {
                overlay.currentPage++;
                renderTradingView(scene, overlay);
            });
            overlay.contentContainer.add(nextBtn);
        }
    }

    if (missingCards.length === 0) {
        let emptyTxt = scene.add.text(0, 0, "You own every card.\nThe Trading Hall has nothing for you.", { fontSize: '24px', color: bgContrast, fontStyle: 'italic', align: 'center' }).setOrigin(0.5);
        emptyTxt.setAlpha(0.7); 
        overlay.contentContainer.add(emptyTxt);
    }
}
