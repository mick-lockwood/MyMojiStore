function createInventoryOverlay(scene) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(100); 
    overlay.bg = scene.add.rectangle(0, 0, 900, 650, themeColors.inventory).setStrokeStyle(4, 0xecf0f1).setInteractive(); 
    
    const closeTxt = scene.add.text(410, -290, '✖', { fontSize: '28px', color: '#ffffff' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    overlay.closeTxt = closeTxt; 
    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    overlay.currentTab = 'packs';
    overlay.currentPage = 0;

    overlay.add([overlay.bg, closeTxt]);

    const packsTab = scene.add.text(-100, -250, 'MY PACKS', { fontSize: '24px', fontStyle: 'bold', color: '#fff' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    let dblLabel = playerUnlocks.binder ? 'DOUBLES' : 'CARDS';
    const doublesTab = scene.add.text(100, -250, dblLabel, { fontSize: '24px', fontStyle: 'bold', color: '#7f8c8d' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    
    overlay.packsTab = packsTab; 
    overlay.doublesTab = doublesTab; 
    
    packsTab.on('pointerdown', () => { 
        overlay.currentTab = 'packs'; 
        overlay.currentPage = 0; 
        renderInventoryView(scene, overlay); 
    });
    
    doublesTab.on('pointerdown', () => { 
        overlay.currentTab = 'doubles'; 
        overlay.currentPage = 0; 
        renderInventoryView(scene, overlay); 
    });

    // Pagination buttons (Used ONLY for Doubles now)
    overlay.prevBtn = scene.add.text(-400, 0, '◀', { fontSize: '48px', color: '#ffffff' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    overlay.nextBtn = scene.add.text(400, 0, '▶', { fontSize: '48px', color: '#ffffff' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    
    overlay.prevBtn.on('pointerdown', () => {
        if (overlay.currentPage > 0) { overlay.currentPage--; renderInventoryView(scene, overlay); }
    });
    overlay.nextBtn.on('pointerdown', () => {
        overlay.currentPage++; renderInventoryView(scene, overlay);
    });

    overlay.add([packsTab, doublesTab, overlay.prevBtn, overlay.nextBtn]);
    overlay.gridContainer = scene.add.container(0, 0); 
    overlay.add(overlay.gridContainer);
    
    return overlay;
}

function renderInventoryView(scene, overlay) {
    overlay.gridContainer.removeAll(true);

    let bgContrast = getContrastColor(themeColors.active.inv);

    let titleTxt = scene.add.text(0, -290, 'INVENTORY', { fontFamily: 'Impact', fontSize: '32px', color: bgContrast }).setOrigin(0.5);
    overlay.gridContainer.add(titleTxt);
    
    overlay.doublesTab.setText(playerUnlocks.binder ? 'DOUBLES' : 'CARDS');

    overlay.packsTab.setColor(bgContrast);
    overlay.doublesTab.setColor(bgContrast);
    
    overlay.packsTab.setAlpha(overlay.currentTab === 'packs' ? 1 : 0.5);
    overlay.doublesTab.setAlpha(overlay.currentTab === 'doubles' ? 1 : 0.5);
    
    overlay.closeTxt.setColor(bgContrast);
    overlay.prevBtn.setColor(bgContrast);
    overlay.nextBtn.setColor(bgContrast);
    
    if (overlay.currentTab === 'packs') {
        // HIDE PAGINATION FOR PACKS!
        overlay.prevBtn.setVisible(false);
        overlay.nextBtn.setVisible(false);

        let activePacks = Object.keys(playerPacks).filter(key => playerPacks[key] > 0);

        if (activePacks.length === 0) {
            let emptyTxt = scene.add.text(0, 0, "No packs available.", { fontSize: '24px', color: bgContrast, fontStyle: 'bold' }).setOrigin(0.5);
            overlay.gridContainer.add(emptyTxt);
        } else {
            // --- INVENTORY SCROLL MASK SETUP ---
            let maskGraphics = scene.make.graphics();
            maskGraphics.fillStyle(0xffffff);
            maskGraphics.fillRect(512 - 400, 384 - 210, 800, 500); 
            let mask = maskGraphics.createGeometryMask();

            let scrollContainer = scene.add.container(0, 0);
            scrollContainer.setMask(mask);
            overlay.gridContainer.add(scrollContainer);

            // Invisible hit zone to capture mouse wheel events
            let scrollZone = scene.add.rectangle(0, 40, 800, 500, 0x000000, 0).setInteractive();
            overlay.gridContainer.addAt(scrollZone, 1); 

            // FIXED: Shifted X further left, changed math for 4 columns!
            let startX = -300, startY = -60; 
            let totalRows = Math.ceil(activePacks.length / 4);

            activePacks.forEach((key, index) => {
                let col = index % 4; // Divide by 4!
                let row = Math.floor(index / 4); // Divide by 4!
                let count = playerPacks[key];

                let x = startX + (col * 200); // Tightened X spacing
                let y = startY + (row * 220); // Tightened Y spacing

                let packCont = scene.add.container(x, y);
                packCont.setScale(0.8); // NEW: Shrink everything down by 20%
                packCont.add(createPackGraphic(scene, key));
                
               let badgeTxt = scene.add.text(30, -150, 'x' + count, { fontSize: '24px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
                
                let viewBtn = createButton(scene, 0, 130, 100, 25, 0x27ae60, null, 'VIEW PACK', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
                    overlay.setVisible(false); 
                    showPackCloseup(scene, key);
                });
                
                packCont.add([badgeBg, badgeTxt, viewBtn]);
                scrollContainer.add(packCont); 
            });

            // FIXED: Updated maxScroll calculation to account for the tighter Y spacing
            let maxScroll = Math.max(0, (totalRows * 220) - 500 + 80); 
            
            scrollZone.on('wheel', (pointer, dx, dy, dz, event) => {
                scrollContainer.y -= dy * 0.5; 
                scrollContainer.y = Phaser.Math.Clamp(scrollContainer.y, -maxScroll, 0);
            });
        }
    } 
    else if (overlay.currentTab === 'doubles') {
        let actionPanel = scene.add.rectangle(0, -190, 840, 60, 0x000000, 0.3).setStrokeStyle(2, 0x555555);
        let qsTxt = scene.add.text(-400, -190, 'LIQUIDATE (50% VAL):', { fontSize: '14px', color: '#f39c12', fontStyle: 'bold' }).setOrigin(0, 0.5);

        const confirmBulkSell = (rarity) => {
            let label = rarity === 'all' ? "ALL DOUBLES" : rarity.toUpperCase() + "S";
            if (confirm(`WARNING: Are you sure you want to sell ${label} for 50% of their market value? This cannot be undone.`)) {
                processBulkSell(scene, overlay, rarity);
            }
        };

        let sellC = createButton(scene, -180, -190, 85, 36, 0x222222, 0xbdc3c7, 'COMMONS', { fontSize: '12px', color: '#bdc3c7', fontStyle: 'bold' }, () => confirmBulkSell('Common'));
        let sellR = createButton(scene, -85, -190, 85, 36, 0x222222, 0x3498db, 'RARES', { fontSize: '12px', color: '#3498db', fontStyle: 'bold' }, () => confirmBulkSell('Rare'));
        let sellE = createButton(scene, 10, -190, 85, 36, 0x222222, 0x9b59b6, 'EPICS', { fontSize: '12px', color: '#9b59b6', fontStyle: 'bold' }, () => confirmBulkSell('Epic'));
        let sellA = createButton(scene, 120, -190, 110, 36, 0x222222, 0xe74c3c, 'ALL DOUBLES', { fontSize: '12px', color: '#e74c3c', fontStyle: 'bold' }, () => confirmBulkSell('all'));

        overlay.clickMode = overlay.clickMode || 'extract';
        let modeColor = overlay.clickMode === 'extract' ? 0x27ae60 : 0xe74c3c;
        let modeTxt = overlay.clickMode === 'extract' ? 'CLICK: EXTRACT 🗂️' : 'CLICK: SELL 1x (50%) 💰';
        let modeBtn = createButton(scene, 320, -190, 170, 36, modeColor, 0xffffff, modeTxt, { fontSize: '12px', color: '#fff', fontStyle: 'bold' }, () => {
            overlay.clickMode = overlay.clickMode === 'extract' ? 'sell' : 'extract';
            renderInventoryView(scene, overlay);
        });

        overlay.gridContainer.add([actionPanel, qsTxt, sellC, sellR, sellE, sellA, modeBtn]);

        let minOwned = playerUnlocks.binder ? 1 : 0;
        let doubles = myMojiDatabase.filter(moji => Number(playerInventory[moji.id]) > minOwned);

        let itemsPerPage = 10; 
        let maxPage = Math.ceil(doubles.length / itemsPerPage) - 1;
        if (maxPage < 0) maxPage = 0;
        if (overlay.currentPage > maxPage) overlay.currentPage = maxPage;

        overlay.prevBtn.setVisible(overlay.currentPage > 0);
        overlay.nextBtn.setVisible(overlay.currentPage < maxPage);

        let startIndex = overlay.currentPage * itemsPerPage;
        let displayDoubles = doubles.slice(startIndex, startIndex + itemsPerPage);

        if (displayDoubles.length === 0) {
            let emptyMsg = playerUnlocks.binder ? "You don't have any duplicate cards." : "You don't have any cards yet.";
            let emptyTxt = scene.add.text(0, 0, emptyMsg, { fontSize: '24px', color: bgContrast, fontStyle: 'bold' }).setOrigin(0.5);
            overlay.gridContainer.add(emptyTxt);
        } else {
            let startX = -320, startY = -60, spacingX = 160, spacingY = 240;
            displayDoubles.forEach((moji, index) => {
                let col = index % 5;
                let row = Math.floor(index / 5);
                let owned = Number(playerInventory[moji.id]);

                let x = startX + (col * spacingX);
                let y = startY + (row * spacingY);

                let miniCard = scene.add.container(x, y);
                miniCard.add(createCardGraphic(scene, moji));
                miniCard.setScale(0.45); 
                
                let displayCount = playerUnlocks.binder ? (owned - 1) : owned;
                
                let badgeBg = scene.add.circle(80, -130, 40, 0xe74c3c);
                let badgeTxt = scene.add.text(80, -130, 'x' + displayCount, { fontSize: '40px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
                miniCard.add([badgeBg, badgeTxt]);

                miniCard.setSize(220, 320); 
                miniCard.setInteractive({ cursor: 'pointer' });
                
                miniCard.on('pointerdown', () => {
                    if (overlay.clickMode === 'extract') {
                        playerInventory[moji.id]--; 
                        saveGame();
                        let randX = Phaser.Math.Between(150, 874); 
                        let randY = Phaser.Math.Between(340, 510);
                        createDraggableCard(scene, randX, randY, moji); 
                    } else {
                        playerInventory[moji.id]--; 
                        let earned = moji.baseValue * 0.5;
                        playerMoney += earned;
                        scene.moneyText.setText('$' + playerMoney.toFixed(2));
                        saveGame();
                        let floatTxt = scene.add.text(x + 512, y + 384, '+$' + earned.toFixed(2), { fontSize: '24px', color: '#2ecc71', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setDepth(200);
                        scene.tweens.add({ targets: floatTxt, y: y + 340, alpha: 0, duration: 1000, onComplete: () => floatTxt.destroy() });
                    }
                    renderInventoryView(scene, overlay); 
                });

                overlay.gridContainer.add(miniCard);
            });
        }
    }
}
