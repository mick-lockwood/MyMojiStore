function createStoreOverlay(scene) {
    // NEW: Calculate contrast for the Store's base elements
    let storeBgColor = themeColors.active.store || 0x1a1a1a; 
    let bgContrast = getContrastColor(storeBgColor);

    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(100); 
    const bg = scene.add.rectangle(0, 0, 900, 650, storeBgColor).setStrokeStyle(4, 0xecf0f1).setInteractive(); 
    const title = scene.add.text(0, -290, 'MOJIMART', { fontFamily: 'Impact, sans-serif', fontSize: '32px', color: bgContrast, fontStyle: 'bold' }).setOrigin(0.5);
    
    const closeTxt = scene.add.text(410, -290, '✖', { fontSize: '28px', color: bgContrast }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    overlay.add([bg, title, closeTxt]);

    overlay.currentView = 'shop'; 
    overlay.currentStoreTab = 'packs';
    overlay.contentContainer = scene.add.container(0, 0);
    overlay.add(overlay.contentContainer);

    return overlay;
}

function renderStoreView(scene, overlay) {
    overlay.contentContainer.removeAll(true);

    // NEW: Calculate contrast for the Store's inner tabs
    let storeBgColor = themeColors.active.store || 0x1a1a1a; 
    let bgContrast = getContrastColor(storeBgColor);

    let totalItems = 0;
    let totalCost = 0;
    for (let k in shoppingCart) {
        totalItems += shoppingCart[k];
        totalCost += shoppingCart[k] * packDatabase[k].cost;
    }

    if (overlay.currentView === 'shop') {
        let viewCartBtn = createButton(scene, -300, -290, 200, 40, 0x7f8c8d, 0xffffff, `🛒 CART (${totalItems}) - $${totalCost.toFixed(2)}`, { fontSize: '14px', color: '#fff', fontStyle: 'bold' }, () => {
            overlay.currentView = 'cart';
            renderStoreView(scene, overlay);
        });
        overlay.contentContainer.add(viewCartBtn);

        // CHANGED: Using bgContrast instead of hardcoded white
        let packsColor = overlay.currentStoreTab === 'packs' ? bgContrast : '#7f8c8d';
        let unlocksColor = overlay.currentStoreTab === 'unlocks' ? bgContrast : '#7f8c8d';

        let packsTab = scene.add.text(-100, -230, 'PACKS', { fontSize: '24px', fontStyle: 'bold', color: packsColor }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
        packsTab.on('pointerdown', () => { overlay.currentStoreTab = 'packs'; renderStoreView(scene, overlay); });

        let unlocksTab = scene.add.text(100, -230, 'UNLOCKS', { fontSize: '24px', fontStyle: 'bold', color: unlocksColor }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
        unlocksTab.on('pointerdown', () => { overlay.currentStoreTab = 'unlocks'; renderStoreView(scene, overlay); });

        overlay.contentContainer.add([packsTab, unlocksTab]);

        if (overlay.currentStoreTab === 'packs') {
            let packKeys = Object.keys(packDatabase);
            
            let startX = -330; 
            let startY = -120; 
            let spacingX = 220;
            let spacingY = 240; 

            packKeys.forEach((key, index) => {
                let col = index % 4; 
                let row = Math.floor(index / 4); 
                
                let def = packDatabase[key];
                
                let packCont = scene.add.container(startX + (col * spacingX), startY + (row * spacingY));
                packCont.setScale(0.65); 

                packCont.add(createPackGraphic(scene, key));

                let priceTxt = scene.add.text(0, 130, '$' + def.cost.toFixed(2), { fontSize: '24px', color: '#2ecc71', fontStyle: 'bold' }).setOrigin(0.5);
                let addBtn = createButton(scene, 0, 180, 140, 40, 0x3498db, null, '+ ADD TO CART', { fontSize: '14px', color: '#fff', fontStyle: 'bold' }, () => {
                    shoppingCart[key] += 1;
                    renderStoreView(scene, overlay); 
                });

                packCont.add([priceTxt, addBtn]);
                overlay.contentContainer.add(packCont);
            });
        } 
        else if (overlay.currentStoreTab === 'unlocks') {
            let upgStartX = -150;
            let upgIndex = 0;
            let hasUnlocks = false;
            
            for (let key in upgradeDatabase) {
                if (!playerUnlocks[key]) {
                    hasUnlocks = true;
                    let def = upgradeDatabase[key];
                    let upgCont = scene.add.container(upgStartX + (upgIndex * 300), 20);
                    
                    let bg = scene.add.rectangle(0, 0, 250, 100);
                    let nameTxt = scene.add.text(0, -20, def.name, { fontSize: '22px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
                    
                    let buyBtn = createButton(scene, 0, 25, 180, 36, 0xf39c12, 0xffffff, `BUY FOR $${def.cost.toFixed(2)}`, { fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
                        if (playerMoney >= def.cost) {
                            playerMoney -= def.cost;
                            scene.moneyText.setText('$' + playerMoney.toFixed(2));
                            playerUnlocks[key] = true;
                            saveGame();
                            checkBailout(scene);
                            
                            if (key === 'binder') {
                                scene.binderZone.destroy();
                                scene.binderZone = createButton(scene, 864, 138, 240, 70, 0xffc87c, 0x000000, 'BINDER', { fontFamily: 'Impact, sans-serif', fontSize: '24px', color: '#111111' }, () => { 
                                    scene.closeAllOverlays(); 
                                    renderBinderGrid(scene, scene.binderOverlay); scene.binderOverlay.setVisible(true); 
                                });
                            }
                            
                            renderStoreView(scene, overlay); 
                        } else {
                            buyBtn.list[1].setColor('#e74c3c');
                            scene.time.delayedCall(300, () => buyBtn.list[1].setColor('#ffffff'));
                        }
                    });
                    
                    upgCont.add([bg, nameTxt, buyBtn]);
                    overlay.contentContainer.add(upgCont);
                    upgIndex++;
                }
            }

            let colorInfoTxt = scene.add.text(0, 160, "Looking for Color Themes?\nOpen the Settings Menu (⚙️) to unlock palettes!", { fontSize: '20px', color: '#7f8c8d', align: 'center', fontStyle: 'bold' }).setOrigin(0.5);
            overlay.contentContainer.add(colorInfoTxt);

            if (!hasUnlocks) {
                let emptyTxt = scene.add.text(0, 20, "All store upgrades purchased!", { fontSize: '24px', color: '#7f8c8d' }).setOrigin(0.5);
                overlay.contentContainer.add(emptyTxt);
            }
        }
    } 
    else if (overlay.currentView === 'cart') {
        let backBtn = createButton(scene, -320, -290, 140, 40, 0x7f8c8d, 0xffffff, '◀ BACK TO SHOP', { fontSize: '14px', color: '#fff', fontStyle: 'bold' }, () => {
            overlay.currentView = 'shop';
            renderStoreView(scene, overlay);
        });
        overlay.contentContainer.add(backBtn);

        let cartListBg = scene.add.rectangle(0, -30, 700, 350, 0x2c3e50).setStrokeStyle(2, 0xffffff);
        overlay.contentContainer.add(cartListBg);

        let startY = -150;
        let hasItems = false;

        for (let key in shoppingCart) {
            if (shoppingCart[key] > 0) {
                hasItems = true;
                let def = packDatabase[key];
                let itemCont = scene.add.container(0, startY);

                let nameTxt = scene.add.text(-330, 0, def.name, { fontSize: '22px', color: '#fff', fontStyle: 'bold' }).setOrigin(0, 0.5);
                let costTxt = scene.add.text(-30, 0, '$' + (def.cost * shoppingCart[key]).toFixed(2), { fontSize: '22px', color: '#2ecc71', fontStyle: 'bold' }).setOrigin(1, 0.5);

                let minusBtn = createButton(scene, 80, 0, 40, 40, 0xe74c3c, null, '-', { fontSize: '24px', color: '#fff', fontStyle: 'bold' }, () => {
                    shoppingCart[key] -= 1;
                    renderStoreView(scene, overlay);
                });

                let countTxt = scene.add.text(140, 0, shoppingCart[key].toString(), { fontSize: '22px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);

                let plusBtn = createButton(scene, 200, 0, 40, 40, 0x3498db, null, '+', { fontSize: '24px', color: '#fff', fontStyle: 'bold' }, () => {
                    shoppingCart[key] += 1;
                    renderStoreView(scene, overlay);
                });

                itemCont.add([nameTxt, costTxt, minusBtn, countTxt, plusBtn]);
                overlay.contentContainer.add(itemCont);
                startY += 60; 
            }
        }

        if (!hasItems) {
            let emptyTxt = scene.add.text(0, -30, "Your cart is empty.", { fontSize: '24px', color: '#7f8c8d' }).setOrigin(0.5);
            overlay.contentContainer.add(emptyTxt);
        }

        const cartBg = scene.add.rectangle(0, 250, 800, 80, 0x1a1a1a).setStrokeStyle(2, 0xffffff);
        let cartTotalText = scene.add.text(-380, 250, 'TOTAL: $' + totalCost.toFixed(2), { fontSize: '28px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0, 0.5);

        const clearBtn = createButton(scene, 200, 250, 100, 40, 0xe74c3c, null, 'CLEAR', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
            for (let key in shoppingCart) shoppingCart[key] = 0;
            renderStoreView(scene, overlay);
        });

        const buyBtn = createButton(scene, 320, 250, 120, 50, 0x27ae60, null, 'CHECKOUT', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }, () => {
            if (totalCost > 0 && playerMoney >= totalCost) {
                playerMoney -= totalCost;
                scene.moneyText.setText('$' + playerMoney.toFixed(2));
                
                for (let k in shoppingCart) {
                    playerPacks[k] += shoppingCart[k];
                    shoppingCart[k] = 0;
                }
                
                saveGame();
                scene.moneyText.setColor('#f1c40f'); 
                scene.time.delayedCall(300, () => scene.moneyText.setColor('#222222'));

                let newTotalPacks = Object.values(playerPacks).reduce((a, b) => a + b, 0);
                scene.packsText.setText('PACKS: ' + newTotalPacks);

                overlay.currentView = 'shop';
                renderStoreView(scene, overlay);
            } else if (totalCost > playerMoney) {
                cartTotalText.setColor('#e74c3c'); 
                scene.time.delayedCall(300, () => cartTotalText.setColor('#f1c40f'));
            }
        });
        
        overlay.contentContainer.add([cartBg, cartTotalText, clearBtn, buyBtn]);
    }
}
