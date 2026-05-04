function createSettingsOverlay(scene, binderOverlay, inventoryOverlay) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(300);
    
    // INCREASED HEIGHT: From 500 to 560 to comfortably fit a 5th row for the Store!
    const bg = scene.add.rectangle(0, 0, 600, 560, 0xffffff).setStrokeStyle(4, 0x000000).setInteractive();
    overlay.add(bg); 
    
    // Adjusted Y coords to match taller background
    const title = scene.add.text(0, -240, 'SETTINGS', { fontFamily: 'Impact', fontSize: '32px', color: '#000' }).setOrigin(0.5);
    const closeTxt = scene.add.text(270, -240, '✖', { fontSize: '28px', color: '#000' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    const instrBtn = createButton(scene, 0, 160, 200, 40, 0x3498db, 0x000000, 'HOW TO PLAY', { fontFamily: 'Arial', fontSize: '18px', color: '#fff', fontStyle: 'bold' }, () => {
        alert(
            "HOW TO PLAY:\n\n" +
            "1. Buy packs from the Store.\n" +
            "2. Open packs in your Inventory.\n" +
            "3. Drag cards to the Binder to save them, or to the Market to sell them for cash.\n" +
            "4. Collect all 149 MyMojis!\n\n" +
            "💡 PRO TIPS:\n" +
            "- Check your Phone (📱) for special, high-paying NPC trade offers!\n" +
            "- Need cash fast? Use the 'Quick Sell' buttons in your Inventory to liquidate duplicate cards for 50% value.\n" +
            "- Bankrupt? Don't panic! If you have absolutely 0 cards, 0 packs, and can't afford a new pack, the MyMoji Foundation will automatically grant you a $20 bailout so you can keep playing!"
        );
    });
    
    const resetBtn = createButton(scene, 0, 220, 200, 40, 0xe74c3c, 0x000000, 'DELETE SAVE FILE', { fontFamily: 'Arial', fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
        if (confirm("Delete save and start over?")) { localStorage.removeItem('myMojiSave'); location.reload(); }
    });

    overlay.paletteContainer = scene.add.container(0, 0);
    overlay.add([title, closeTxt, resetBtn, instrBtn, overlay.paletteContainer]);

    const stdColors = [0x1a1a1a, 0xfce883, 0xf4f4f4, 0x7f8c8d, 0xc0392b, 0x2980b9, 0x27ae60, 0x8e44ad];
    const vipColors = [0xd35400, 0xf1c40f, 0xbdc3c7, 0xff00ff];
    const allColors = [...stdColors, ...vipColors];

    overlay.renderPalettes = () => {
        overlay.paletteContainer.removeAll(true);
        
        if (!playerUnlocks.colorThemes) {
            let lockBg = scene.add.rectangle(0, -30, 400, 80, 0xf4f4f4).setStrokeStyle(2, 0x000);
            let lockTxt = scene.add.text(0, -30, "🎨 COLOR THEMES LOCKED\nPurchase in the Store's UNLOCKS tab!", { fontSize: '18px', color: '#7f8c8d', align: 'center', fontStyle: 'bold' }).setOrigin(0.5);
            overlay.paletteContainer.add([lockBg, lockTxt]);
            return; 
        }

        let allStdUnlocked = stdColors.every(c => playerUnlocks.colors.includes(c));

        const drawRow = (y, label, type) => {
            let labelTxt = scene.add.text(-270, y, label, { fontFamily: 'Arial', fontSize: '18px', color: '#000', fontStyle: 'bold' }).setOrigin(0, 0.5);
            overlay.paletteContainer.add(labelTxt);

            let startX = -110;
            let spacing = 35;

            allColors.forEach((color, index) => {
                let isVip = index >= stdColors.length;
                let isUnlocked = playerUnlocks.colors.includes(color) || color === 0xfce883; 
                let isActive = themeColors.active && themeColors.active[type] === color; 
                
                let swatch = scene.add.rectangle(startX + (index * spacing), y, 30, 30, color).setInteractive({ useHandCursor: true });
                swatch.setStrokeStyle(isActive ? 4 : 2, isActive ? 0x2ecc71 : 0x000000);

                if (!isUnlocked) {
                    let lockTxt = scene.add.text(startX + (index * spacing), y, isVip ? 'VIP' : '🔒', { fontSize: isVip ? '11px' : '14px', color: isVip ? '#f1c40f' : '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
                    overlay.paletteContainer.add([swatch, lockTxt]);

                    swatch.on('pointerdown', () => {
                        if (isVip && !allStdUnlocked) {
                            alert("You must unlock all standard colors before buying VIP palettes!");
                            return;
                        }
                        
                        let cost = isVip ? 75 : 50;
                        if (confirm(`This color costs $${cost}. Would you like to purchase it?`)) {
                            if (playerMoney >= cost) {
                                playerMoney -= cost;
                                scene.moneyText.setText('$' + playerMoney.toFixed(2));
                                playerUnlocks.colors.push(color);
                                saveGame(); 
                                overlay.renderPalettes(); 
                            } else {
                                alert("Not enough money!");
                            }
                        }
                    });

                } else {
                    if (isActive) {
                        // NEW: Utilizing the helper function to automatically determine checkmark color!
                        let checkColor = getContrastColor(color);
                        let checkTxt = scene.add.text(startX + (index * spacing), y, '✔', { fontSize: '18px', color: checkColor, fontStyle: 'bold' }).setOrigin(0.5);
                        overlay.paletteContainer.add([swatch, checkTxt]);
                    } else {
                        overlay.paletteContainer.add(swatch);
                    }
                    
                    swatch.on('pointerover', () => scene.tweens.add({ targets: swatch, scale: 1.2, duration: 100 }));
                    swatch.on('pointerout', () => scene.tweens.add({ targets: swatch, scale: 1, duration: 100 }));
                    
                    swatch.on('pointerdown', () => {
                        if (!themeColors.active) themeColors.active = {};
                        themeColors.active[type] = color; 
                        
                        if (type === 'table') { 
                            themeColors.table = '#' + color.toString(16).padStart(6, '0'); 
                            scene.cameras.main.setBackgroundColor(themeColors.table); 
                        }
                        if (type === 'banner') { 
                            themeColors.banner = color; 
                            scene.headerBg.setFillStyle(color); 
                            
                            let contrastTxt = getContrastColor(color);
                            scene.moneyText.setColor(contrastTxt);
                            scene.packsText.setColor(contrastTxt);
                            scene.titleText.setColor(contrastTxt);
                        }
                        if (type === 'binder') { 
                            themeColors.binder = color; 
                            binderOverlay.bg.setFillStyle(color); 
                            
                            if (scene.binderOverlay && scene.binderOverlay.visible) {
                                renderBinderGrid(scene, scene.binderOverlay);
                            }
                        }
                        if (type === 'inv') { 
                            themeColors.inventory = color; 
                            inventoryOverlay.bg.setFillStyle(color); 

                            if (scene.inventoryOverlay && scene.inventoryOverlay.visible) {
                                renderInventoryView(scene, scene.inventoryOverlay);
                            }
                        }
                        // NEW: Update Store logic (Assuming your storeOverlay has a `.bg` property like binder/inv do)
                        if (type === 'store') {
                            themeColors.store = color;
                            // If you need it to immediately refresh while open, you can call renderStoreView here
                            // but usually settings overlays cover the screen, so it applies on next open.
                        }
                        
                        saveGame(); 
                        overlay.renderPalettes(); 
                    });
                }
            });
        };

        // NEW: Draw the 5 rows!
        drawRow(-160, "Table Color", 'table');
        drawRow(-100, "Banner Color", 'banner');
        drawRow(-40, "Binder Color", 'binder');
        drawRow(20, "Inventory Color", 'inv');
        drawRow(80, "Store Color", 'store');
    };

    overlay.renderPalettes(); 
    return overlay;
}
