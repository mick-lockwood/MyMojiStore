// ==========================================
// SYSTEM: MOJIMARKET ECONOMY
// ==========================================

function createMarketOverlay(scene) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(300);
    
    const bg = scene.add.rectangle(0, 0, 800, 600, 0x1a1a1a).setStrokeStyle(4, 0xff7e8d).setInteractive();
    const title = scene.add.text(0, -260, 'MOJIMARKET', { fontFamily: 'Impact', fontSize: '32px', color: '#ff7e8d' }).setOrigin(0.5);
    const closeTxt = scene.add.text(360, -260, '✖', { fontSize: '28px', color: '#ffffff' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);

    closeTxt.on('pointerdown', () => {
        overlay.setVisible(false);
        overlay.currentPage = 0; // Reset to page 1 when closed
    });

    overlay.trendContainer = scene.add.container(0, 0);
    overlay.listContainer = scene.add.container(0, 0);
    overlay.pageContainer = scene.add.container(0, 0); // Holds the Prev/Next buttons

    overlay.currentPage = 0; // Track the current page

    overlay.add([bg, title, closeTxt, overlay.trendContainer, overlay.listContainer, overlay.pageContainer]);
    return overlay;
}

function renderMarketView(scene, overlay) {
    overlay.trendContainer.removeAll(true);
    overlay.listContainer.removeAll(true);
    overlay.pageContainer.removeAll(true);

    // --- Render Multiple Market Trends ---
    if (marketTrends.length === 0) {
        overlay.trendContainer.add(scene.add.text(0, -210, "⚖️ Market is currently stable ⚖️", { fontFamily: 'Arial', fontSize: '18px', color: '#bdc3c7' }).setOrigin(0.5));
    } else {
        marketTrends.forEach((trend, idx) => {
            let txt = '';
            let color = '';
            let percent = Math.round(Math.abs(1 - trend.multi) * 100);
            
            if (trend.multi > 1.0) {
                txt = `🔥 ${trend.category} prices UP +${percent}%! 🔥`;
                color = '#2ecc71';
            } else {
                txt = `📉 ${trend.category} prices DOWN -${percent}%! 📉`;
                color = '#e74c3c';
            }
            
            // Stack them vertically
            let trendTxt = scene.add.text(0, -225 + (idx * 22), txt, { fontFamily: 'Arial', fontSize: '16px', color: color, fontStyle: 'bold' }).setOrigin(0.5);
            overlay.trendContainer.add(trendTxt);
        });
    }

    if (activeListings.length === 0) {
        let emptyTxt = scene.add.text(0, 0, "No active listings.\nDrag a card onto the MojiMarket button to list it!", { fontFamily: 'Arial', fontSize: '20px', color: '#7f8c8d', align: 'center' }).setOrigin(0.5);
        overlay.listContainer.add(emptyTxt);
        return;
    }

    // --- PAGINATION LOGIC ---
    const itemsPerPage = 5; 
    const totalPages = Math.ceil(activeListings.length / itemsPerPage);
    
    // Safety check if they cancel the last item on a page
    if (overlay.currentPage >= totalPages) {
        overlay.currentPage = Math.max(0, totalPages - 1);
    }

    let startIndex = overlay.currentPage * itemsPerPage;
    let endIndex = Math.min(startIndex + itemsPerPage, activeListings.length);
    let currentView = activeListings.slice(startIndex, endIndex); // Grab just the 5 items for this page!

    // --- DRAW PAGINATION BUTTONS ---
    if (totalPages > 1) {
        let prevColor = overlay.currentPage > 0 ? 0x3498db : 0x7f8c8d;
        let nextColor = overlay.currentPage < totalPages - 1 ? 0x3498db : 0x7f8c8d;

        let prevBtn = createButton(scene, -150, 240, 100, 40, prevColor, 0x000000, '◀ PREV', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
            if (overlay.currentPage > 0) {
                overlay.currentPage--;
                renderMarketView(scene, overlay);
            }
        });

        let pageTxt = scene.add.text(0, 240, `PAGE ${overlay.currentPage + 1} / ${totalPages}`, { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);

        let nextBtn = createButton(scene, 150, 240, 100, 40, nextColor, 0x000000, 'NEXT ▶', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
            if (overlay.currentPage < totalPages - 1) {
                overlay.currentPage++;
                renderMarketView(scene, overlay);
            }
        });

        overlay.pageContainer.add([prevBtn, pageTxt, nextBtn]);
    }

    // --- DRAW LIST ITEMS ---
    let startY = -120;
    let spacingY = 65; // Tighter spacing to fit 5 cleanly

    currentView.forEach((listing, i) => {
        let mojiData = myMojiDatabase.find(m => m.id === listing.mojiId);
        if (!mojiData) return;

        let itemBgColor = listing.sold ? 0x27ae60 : 0x2c3e50;
        let itemBg = scene.add.rectangle(0, startY + (i * spacingY), 700, 55, itemBgColor).setStrokeStyle(2, 0xffffff);

        let iconTxt = scene.add.text(-310, startY + (i * spacingY), mojiData.emoji || '📦', { fontSize: '28px' }).setOrigin(0.5);
        let nameTxt = scene.add.text(-270, startY + (i * spacingY) - 10, mojiData.name, { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5);
        let priceTxt = scene.add.text(-270, startY + (i * spacingY) + 12, `Listed for: $${listing.price.toFixed(2)}`, { fontSize: '14px', color: '#f1c40f' }).setOrigin(0, 0.5);

        let statusStr = listing.sold ? "SOLD!" : "Waiting for buyer...";
        let statusTxt = scene.add.text(100, startY + (i * spacingY), statusStr, { fontSize: '16px', color: '#fff', fontStyle: 'italic' }).setOrigin(0.5);

        overlay.listContainer.add([itemBg, iconTxt, nameTxt, priceTxt, statusTxt]);

        if (listing.sold) {
            let collectBtn = createButton(scene, 270, startY + (i * spacingY), 120, 36, 0xf1c40f, 0x000, "COLLECT", { fontSize: '14px', color: '#000', fontStyle: 'bold' }, () => {
                playerMoney += listing.price;
                scene.moneyText.setText('$' + playerMoney.toFixed(2));
                playSound(scene, 'coin', { volume: 0.8 });
                activeListings = activeListings.filter(l => l.id !== listing.id);
                saveGame();
                renderMarketView(scene, overlay);
            });
            overlay.listContainer.add(collectBtn);
        } else {
            let cancelBtn = createButton(scene, 270, startY + (i * spacingY), 120, 36, 0xe74c3c, 0x000, "CANCEL", { fontSize: '14px', color: '#fff', fontStyle: 'bold' }, () => {
                playerInventory[mojiData.id]++; 
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
    const box = scene.add.rectangle(512, 384, 550, 420, 0x2c3e50).setStrokeStyle(4, 0xff7e8d);
    
    const title = scene.add.text(512, 210, "LIST ON MARKET", { fontFamily: 'Impact', fontSize: '32px', color: '#ff7e8d' }).setOrigin(0.5);
    
    // Detect if this specific card is currently trending!
    let activeTrend = marketTrends.find(t => t.category === mojiData.category);
    let marketVal = mojiData.baseValue;
    
    let trendStr = "Market Stable";
    let trendColor = "#bdc3c7";

    if (activeTrend) {
        marketVal *= activeTrend.multi;
        let percent = Math.round(Math.abs(1 - activeTrend.multi) * 100);
        if (activeTrend.multi > 1.0) {
            trendStr = `🔥 High Demand: +${percent}% 🔥`;
            trendColor = "#2ecc71";
        } else {
            trendStr = `📉 Market Slump: -${percent}% 📉`;
            trendColor = "#e74c3c";
        }
    }

    const baseTxt = scene.add.text(512, 260, `${mojiData.name} (Base: $${mojiData.baseValue.toFixed(2)})`, { fontFamily: 'Arial', fontSize: '18px', color: '#ecf0f1' }).setOrigin(0.5);
    const trendDisplay = scene.add.text(512, 285, trendStr, { fontFamily: 'Arial', fontSize: '16px', color: trendColor, fontStyle: 'bold' }).setOrigin(0.5);
    const mktTxt = scene.add.text(512, 315, `Current Market Value: $${marketVal.toFixed(2)}`, { fontFamily: 'Arial', fontSize: '22px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);

    let selectedPrice = marketVal;
    let priceDisplay = scene.add.text(512, 390, `$${selectedPrice.toFixed(2)}`, { fontFamily: 'Impact', fontSize: '56px', color: '#2ecc71' }).setOrigin(0.5);

    const updatePriceDisplay = () => {
        // Prevent negative prices
        if (selectedPrice < 0) selectedPrice = 0;
        priceDisplay.setText(`$${selectedPrice.toFixed(2)}`);
    };

    // --- PRICING BUTTONS ---
    let btnMinus20 = createButton(scene, 280, 460, 70, 40, 0x34495e, 0xfff, "-20%", { fontSize: '16px', color: '#fff' }, () => { selectedPrice *= 0.8; updatePriceDisplay(); });
    let btnMinus10 = createButton(scene, 360, 460, 70, 40, 0x34495e, 0xfff, "-10%", { fontSize: '16px', color: '#fff' }, () => { selectedPrice *= 0.9; updatePriceDisplay(); });
    let btnMkt = createButton(scene, 445, 460, 80, 40, 0xf1c40f, 0x000, "RESET", { fontSize: '14px', color: '#000', fontStyle: 'bold' }, () => { selectedPrice = marketVal; updatePriceDisplay(); });
    let btnPlus10 = createButton(scene, 530, 460, 70, 40, 0x34495e, 0xfff, "+10%", { fontSize: '16px', color: '#fff' }, () => { selectedPrice *= 1.1; updatePriceDisplay(); });
    let btnPlus20 = createButton(scene, 610, 460, 70, 40, 0x34495e, 0xfff, "+20%", { fontSize: '16px', color: '#fff' }, () => { selectedPrice *= 1.2; updatePriceDisplay(); });
    
    // CUSTOM PRICE BUTTON
    let customBtn = createButton(scene, 710, 460, 110, 40, 0x9b59b6, 0xfff, "CUSTOM ✏️", { fontSize: '14px', color: '#fff', fontStyle: 'bold' }, () => { 
        let input = prompt("Enter a custom sale price:", selectedPrice.toFixed(2));
        let num = parseFloat(input);
        if (!isNaN(num) && num > 0) {
            selectedPrice = num;
            updatePriceDisplay();
        } else if (input !== null) {
            alert("Invalid price!");
        }
    });

    // --- ACTION BUTTONS ---
    const cancelBtn = createButton(scene, 400, 540, 160, 50, 0xe74c3c, 0xffffff, "CANCEL", { fontFamily: 'Impact', fontSize: '20px', color: '#ffffff' }, () => {
        popupCont.destroy();
    });

    const listBtn = createButton(scene, 624, 540, 160, 50, 0x2ecc71, 0xffffff, "LIST ITEM", { fontFamily: 'Impact', fontSize: '20px', color: '#ffffff' }, () => {
        let physicalCard = scene.children.list.find(c => c.instanceId === physicalCardInstanceId);
        if (physicalCard) physicalCard.destroy();
        cardsOnTable = cardsOnTable.filter(c => c.instanceId !== physicalCardInstanceId);

        activeListings.push({ id: 'list_' + Date.now(), mojiId: mojiData.id, price: selectedPrice, sold: false });
        saveGame();
        
        showFloatingText(scene, 512, 384, "LISTED ON MARKET!", "#2ecc71");
        popupCont.destroy();
    });

    popupCont.add([dimBg, box, title, baseTxt, trendDisplay, mktTxt, priceDisplay, btnMinus20, btnMinus10, btnMkt, btnPlus10, btnPlus20, customBtn, cancelBtn, listBtn]);
    scene.add.existing(popupCont);
}
