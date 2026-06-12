// ==========================================
// SYSTEM: MOJIMARKET ECONOMY
// ==========================================

function createMarketOverlay(scene) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(300);
    
    const bg = scene.add.rectangle(0, 0, 800, 600, 0x1a1a1a).setStrokeStyle(4, 0xff7e8d).setInteractive();
    const title = scene.add.text(0, -260, 'MOJIMARKET', { fontFamily: 'Impact', fontSize: '32px', color: '#ff7e8d' }).setOrigin(0.5);
    const closeTxt = scene.add.text(360, -260, '✖', { fontSize: '28px', color: '#ffffff' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);

    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    overlay.trendBanner = scene.add.text(0, -210, '', { fontFamily: 'Arial', fontSize: '18px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
    overlay.listContainer = scene.add.container(0, 0);

    overlay.add([bg, title, closeTxt, overlay.trendBanner, overlay.listContainer]);
    return overlay;
}

function renderMarketView(scene, overlay) {
    overlay.listContainer.removeAll(true);

    // Render Market Trend Banner
    if (marketTrend.multi > 1.0) {
        overlay.trendBanner.setText(`🔥 TRENDING: ${marketTrend.category} cards are selling for +${Math.round((marketTrend.multi-1)*100)}% 🔥`).setColor('#2ecc71');
    } else if (marketTrend.multi < 1.0) {
        overlay.trendBanner.setText(`📉 CRASH: ${marketTrend.category} cards dropped by ${Math.round((1-marketTrend.multi)*100)}% 📉`).setColor('#e74c3c');
    } else {
        overlay.trendBanner.setText("⚖️ Market is currently stable ⚖️").setColor('#bdc3c7');
    }

    if (activeListings.length === 0) {
        let emptyTxt = scene.add.text(0, 0, "No active listings.\nDrag a card onto the MojiMarket button to list it!", { fontFamily: 'Arial', fontSize: '20px', color: '#7f8c8d', align: 'center' }).setOrigin(0.5);
        overlay.listContainer.add(emptyTxt);
        return;
    }

    let startY = -140;
    activeListings.forEach((listing, i) => {
        let mojiData = myMojiDatabase.find(m => m.id === listing.mojiId);
        if (!mojiData) return;

        let itemBgColor = listing.sold ? 0x27ae60 : 0x2c3e50;
        let itemBg = scene.add.rectangle(0, startY + (i * 70), 700, 60, itemBgColor).setStrokeStyle(2, 0xffffff);

        let iconTxt = scene.add.text(-310, startY + (i * 70), mojiData.emoji || '📦', { fontSize: '28px' }).setOrigin(0.5);
        let nameTxt = scene.add.text(-270, startY + (i * 70) - 10, mojiData.name, { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5);
        let priceTxt = scene.add.text(-270, startY + (i * 70) + 12, `Listed for: $${listing.price.toFixed(2)}`, { fontSize: '14px', color: '#f1c40f' }).setOrigin(0, 0.5);

        let statusStr = listing.sold ? "SOLD!" : "Waiting for buyer...";
        let statusTxt = scene.add.text(100, startY + (i * 70), statusStr, { fontSize: '16px', color: '#fff', fontStyle: 'italic' }).setOrigin(0.5);

        overlay.listContainer.add([itemBg, iconTxt, nameTxt, priceTxt, statusTxt]);

        if (listing.sold) {
            let collectBtn = createButton(scene, 270, startY + (i * 70), 120, 36, 0xf1c40f, 0x000, "COLLECT", { fontSize: '14px', color: '#000', fontStyle: 'bold' }, () => {
                playerMoney += listing.price;
                scene.moneyText.setText('$' + playerMoney.toFixed(2));
                playSound(scene, 'coin', { volume: 0.8 });
                activeListings = activeListings.filter(l => l.id !== listing.id);
                saveGame();
                renderMarketView(scene, overlay);
            });
            overlay.listContainer.add(collectBtn);
        } else {
            let cancelBtn = createButton(scene, 270, startY + (i * 70), 120, 36, 0xe74c3c, 0x000, "CANCEL", { fontSize: '14px', color: '#fff', fontStyle: 'bold' }, () => {
                playerInventory[mojiData.id]++; // Return to inventory
                activeListings = activeListings.filter(l => l.id !== listing.id);
                saveGame();
                renderMarketView(scene, overlay);
            });
            overlay.listContainer.add(cancelBtn);
        }
    });
}

function showPricingPopup(scene, physicalCardInstanceId, mojiData) {
    const popupCont = scene.add.container(0, 0).setDepth(10000); 
    const dimBg = scene.add.rectangle(0, 0, 1024, 768, 0x000000, 0.85).setOrigin(0, 0).setInteractive();
    const box = scene.add.rectangle(512, 384, 500, 380, 0x2c3e50).setStrokeStyle(4, 0xff7e8d);
    
    const title = scene.add.text(512, 230, "LIST ON MARKET", { fontFamily: 'Impact', fontSize: '32px', color: '#ff7e8d' }).setOrigin(0.5);
    
    // Calculate actual market value
    let marketVal = mojiData.baseValue;
    if (marketTrend.category === mojiData.category) marketVal *= marketTrend.multi;

    const baseTxt = scene.add.text(512, 280, `${mojiData.name} (Base: $${mojiData.baseValue.toFixed(2)})`, { fontFamily: 'Arial', fontSize: '18px', color: '#bdc3c7' }).setOrigin(0.5);
    const mktTxt = scene.add.text(512, 310, `Current Market Value: $${marketVal.toFixed(2)}`, { fontFamily: 'Arial', fontSize: '22px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);

    let selectedPrice = marketVal;
    let priceDisplay = scene.add.text(512, 380, `$${selectedPrice.toFixed(2)}`, { fontFamily: 'Impact', fontSize: '48px', color: '#2ecc71' }).setOrigin(0.5);

    const updatePriceDisplay = () => {
        priceDisplay.setText(`$${selectedPrice.toFixed(2)}`);
    };

    // Quick set buttons
    let btnMinus20 = createButton(scene, 320, 450, 80, 40, 0x34495e, 0xfff, "-20%", { fontSize: '16px', color: '#fff' }, () => { selectedPrice = marketVal * 0.8; updatePriceDisplay(); });
    let btnMinus10 = createButton(scene, 410, 450, 80, 40, 0x34495e, 0xfff, "-10%", { fontSize: '16px', color: '#fff' }, () => { selectedPrice = marketVal * 0.9; updatePriceDisplay(); });
    let btnMkt = createButton(scene, 512, 450, 90, 40, 0xf1c40f, 0x000, "MARKET", { fontSize: '16px', color: '#000', fontStyle: 'bold' }, () => { selectedPrice = marketVal; updatePriceDisplay(); });
    let btnPlus10 = createButton(scene, 614, 450, 80, 40, 0x34495e, 0xfff, "+10%", { fontSize: '16px', color: '#fff' }, () => { selectedPrice = marketVal * 1.1; updatePriceDisplay(); });
    let btnPlus20 = createButton(scene, 704, 450, 80, 40, 0x34495e, 0xfff, "+20%", { fontSize: '16px', color: '#fff' }, () => { selectedPrice = marketVal * 1.2; updatePriceDisplay(); });

    const cancelBtn = createButton(scene, 380, 520, 160, 50, 0xe74c3c, 0xffffff, "CANCEL", { fontFamily: 'Impact', fontSize: '20px', color: '#ffffff' }, () => {
        popupCont.destroy();
    });

    const listBtn = createButton(scene, 644, 520, 160, 50, 0x2ecc71, 0xffffff, "LIST ITEM", { fontFamily: 'Impact', fontSize: '20px', color: '#ffffff' }, () => {
        // Destroy the physical card from the table
        let physicalCard = scene.children.list.find(c => c.instanceId === physicalCardInstanceId);
        if (physicalCard) physicalCard.destroy();
        cardsOnTable = cardsOnTable.filter(c => c.instanceId !== physicalCardInstanceId);

        // Add to active market listings
        activeListings.push({ id: 'list_' + Date.now(), mojiId: mojiData.id, price: selectedPrice, sold: false });
        saveGame();
        
        showFloatingText(scene, 512, 384, "LISTED ON MARKET!", "#2ecc71");
        popupCont.destroy();
    });

    popupCont.add([dimBg, box, title, baseTxt, mktTxt, priceDisplay, btnMinus20, btnMinus10, btnMkt, btnPlus10, btnPlus20, cancelBtn, listBtn]);
    scene.add.existing(popupCont);
}
