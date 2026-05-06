function createSettingsOverlay(scene, binderOverlay, inventoryOverlay) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(300);
    
    // 1. INCREASED HEIGHT: From 560 to 640 to comfortably fit a 6th row!
    const bg = scene.add.rectangle(0, 0, 600, 640, 0xffffff).setStrokeStyle(4, 0x000000).setInteractive();
    overlay.add(bg); 
    
    // 2. SHIFTED HEADER UP: Adjusted Y coords to -280 to match taller background
    const title = scene.add.text(0, -280, 'SETTINGS', { fontFamily: 'Impact', fontSize: '32px', color: '#000' }).setOrigin(0.5);
    const closeTxt = scene.add.text(270, -280, '✖', { fontSize: '28px', color: '#000' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    // 3. SHIFTED BUTTONS DOWN: Moved to Y 220
    const instrBtn = createButton(scene, -110, 220, 180, 40, 0x3498db, 0x000000, 'HOW TO PLAY', { fontFamily: 'Arial', fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
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

    const achBtn = createButton(scene, 110, 220, 180, 40, 0xf1c40f, 0x000000, '🏆 ACHIEVEMENTS', { fontFamily: 'Arial', fontSize: '16px', color: '#000', fontStyle: 'bold' }, () => {
        overlay.setVisible(false); 
        renderAchievementsView(scene, scene.achievementsOverlay); 
        scene.achievementsOverlay.setVisible(true); 
    });
    
    // SHIFTED DOWN: Moved to Y 280
    const resetBtn = createButton(scene, 0, 280, 200, 40, 0xe74c3c, 0x000000, 'DELETE SAVE FILE', { fontFamily: 'Arial', fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
        if (confirm("Delete save and start over?")) { localStorage.removeItem('myMojiSave'); location.reload(); }
    });

    // --- AUDIO CONTROLS ---
    
    // Helper to format the button text nicely (e.g., "BGM: 30%")
    const getVolText = (label, val) => `${label}: ${Math.round(val * 100)}%`;

    // 1. Background Music Button (Cycles 0%, 30%, 60%, 100%)
    let bgmBtn = createButton(scene, -110, 160, 180, 40, 0x27ae60, 0x000000, getVolText('MUSIC', audioSettings.bgm), { fontFamily: 'Arial', fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
        audioSettings.bgm += 0.3;
        if (audioSettings.bgm > 1.0) audioSettings.bgm = 0; // Loop back to 0
        
        // Instantly update the playing track!
        if (scene.bgmTrack && !audioSettings.muted) {
            scene.bgmTrack.setVolume(audioSettings.bgm);
        }
        
        bgmBtn.list[1].setText(getVolText('MUSIC', audioSettings.bgm));
        saveGame();
    });

    // 2. Sound Effects Button (Cycles 0%, 50%, 100%)
    let sfxBtn = createButton(scene, 110, 160, 180, 40, 0x2980b9, 0x000000, getVolText('SFX', audioSettings.sfx), { fontFamily: 'Arial', fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
        audioSettings.sfx += 0.5;
        if (audioSettings.sfx > 1.0) audioSettings.sfx = 0; // Loop back to 0
        
        playSound(scene, 'coin', { volume: 1.0 }); // Play a test sound!
        
        sfxBtn.list[1].setText(getVolText('SFX', audioSettings.sfx));
        saveGame();
    });

    // 3. Master Mute Button
    let muteColor = audioSettings.muted ? 0xe74c3c : 0x7f8c8d;
    let muteText = audioSettings.muted ? '🔇 MUTED' : '🔊 AUDIO ON';
    
    let muteBtn = createButton(scene, 0, 100, 200, 40, muteColor, 0x000000, muteText, { fontFamily: 'Arial', fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
        audioSettings.muted = !audioSettings.muted;
        
        // Update the BGM instantly
        if (scene.bgmTrack) {
            scene.bgmTrack.setVolume(audioSettings.muted ? 0 : audioSettings.bgm);
        }
        
        // Update button visuals
        muteBtn.list[0].setFillStyle(audioSettings.muted ? 0xe74c3c : 0x7f8c8d);
        muteBtn.list[1].setText(audioSettings.muted ? '🔇 MUTED' : '🔊 AUDIO ON');
        saveGame();
    });

    overlay.paletteContainer = scene.add.container(0, 0);
    
    overlay.add([bg, title, closeTxt, resetBtn, instrBtn, achBtn, overlay.paletteContainer]);

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
                    if (isVip) lockTxt.setStroke('#000000', 3);

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
                        if (type === 'store') {
                            themeColors.store = color;
                            
                            if (scene.storeOverlay && scene.storeOverlay.bg) {
                                scene.storeOverlay.bg.setFillStyle(color);
                            }
                            
                            if (scene.storeOverlay && scene.storeOverlay.visible) {
                                renderStoreView(scene, scene.storeOverlay);
                            }
                        }
                        
                        // 4. NEW: Trading Hall Logic added!
                        if (type === 'trading') {
                            themeColors.trading = color;
                            
                            if (scene.tradingOverlay && scene.tradingOverlay.bg) {
                                scene.tradingOverlay.bg.setFillStyle(color);
                            }
                            
                            if (scene.tradingOverlay && scene.tradingOverlay.visible) {
                                renderTradingView(scene, scene.tradingOverlay);
                            }
                        }
                        
                        saveGame(); 
                        overlay.renderPalettes(); 
                    });
                }
            });
        };

        drawRow(-160, "Table", 'table');
        drawRow(-100, "Banner", 'banner');
        drawRow(-40, "Binder", 'binder');
        drawRow(20, "Inventory", 'inv');
        drawRow(80, "Store", 'store');
        drawRow(140, "Trading Hall", 'trading');
    };

    overlay.renderPalettes(); 
    return overlay;
}
