function createTradingOverlay(scene) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(100); 

    // Dark, shady background for the Black Market
    const bg = scene.add.rectangle(0, 0, 900, 650, 0x111111).setStrokeStyle(4, 0x9b59b6).setInteractive(); 

    const title = scene.add.text(0, -290, 'THE TRADING HALL', { fontFamily: 'Impact, sans-serif', fontSize: '36px', color: '#9b59b6', fontStyle: 'bold' }).setOrigin(0.5);
    const subTitle = scene.add.text(0, -250, 'Buy missing cards at a 500% markup. No refunds.', { fontFamily: 'Arial', fontSize: '18px', color: '#7f8c8d' }).setOrigin(0.5);

    const closeTxt = scene.add.text(410, -290, '✖', { fontSize: '28px', color: '#9b59b6' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));
    
    overlay.add([bg, title, subTitle, closeTxt]);

    // NEW: Add a page tracker directly to the overlay
    overlay.currentPage = 0; 

    overlay.contentContainer = scene.add.container(0, 0);
    overlay.add(overlay.contentContainer);

    return overlay;
}

function renderTradingView(scene, overlay) {
    overlay.contentContainer.removeAll(true);

    let startX = -330; 
    let startY = -140;  // Shifted the grid up slightly
    let spacingX = 220;
    let spacingY = 275; // Increased spacing to unhide the top row buttons!
    
    // 1. Gather ALL missing cards first
    let missingCards = [];
    myMojiDatabase.forEach(moji => {
        if (!playerInventory[moji.id] || playerInventory[moji.id] === 0) {
            missingCards.push(moji);
        }
    });

    // 2. Pagination Math
    let itemsPerPage = 8;
    let totalPages = Math.ceil(missingCards.length / itemsPerPage);
    
    // Safety check: If you buy the last card on a page, snap back to the previous page
    if (overlay.currentPage >= totalPages && totalPages > 0) {
        overlay.currentPage = totalPages - 1;
    }
    if (overlay.currentPage < 0) overlay.currentPage = 0;

    // Figure out which 8 cards belong on the current page
    let startIndex = overlay.currentPage * itemsPerPage;
    let cardsToShow = missingCards.slice(startIndex, startIndex + itemsPerPage);

    // 3. Render the Cards for this page
    cardsToShow.forEach((moji, index) => {
        let col = index % 4; 
        let row = Math.floor(index / 4); 
        
        let cardCont = scene.add.container(startX + (col * spacingX), startY + (row * spacingY));
        cardCont.setScale(0.65); 

        let graphics = createCardGraphic(scene, moji);
        cardCont.add(graphics);
        
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

                // Re-render to update the grid and pagination!
                renderTradingView(scene, overlay); 
            } else {
                // Flash button red if they are too broke
                buyBtn.list[1].setColor('#e74c3c');
                scene.time.delayedCall(300, () => buyBtn.list[1].setColor('#ffffff'));
            }
        });

        cardCont.add([priceTxt, buyBtn]);
        overlay.contentContainer.add(cardCont);
    });

    // 4. Render Pagination Controls (Only show if there is more than 1 page of missing cards)
    if (totalPages > 1) {
        // "PREV" Button
        if (overlay.currentPage > 0) {
            let prevBtn = createButton(scene, -150, 290, 120, 40, 0x34495e, 0xffffff, '◀ PREV', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }, () => {
                overlay.currentPage--;
                renderTradingView(scene, overlay);
            });
            overlay.contentContainer.add(prevBtn);
        }

        // Page Indicator
        let pageTxt = scene.add.text(0, 290, `PAGE ${overlay.currentPage + 1} OF ${totalPages}`, { fontSize: '20px', color: '#9b59b6', fontStyle: 'bold' }).setOrigin(0.5);
        overlay.contentContainer.add(pageTxt);

        // "NEXT" Button
        if (overlay.currentPage < totalPages - 1) {
            let nextBtn = createButton(scene, 150, 290, 120, 40, 0x34495e, 0xffffff, 'NEXT ▶', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }, () => {
                overlay.currentPage++;
                renderTradingView(scene, overlay);
            });
            overlay.contentContainer.add(nextBtn);
        }
    }

    // 5. Empty State
    if (missingCards.length === 0) {
        let emptyTxt = scene.add.text(0, 0, "You own every card.\nThe Trading Hall has nothing for you.", { fontSize: '24px', color: '#7f8c8d', fontStyle: 'italic', align: 'center' }).setOrigin(0.5);
        overlay.contentContainer.add(emptyTxt);
    }
}
