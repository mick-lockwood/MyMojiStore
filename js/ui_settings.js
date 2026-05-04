function createSettingsOverlay(scene, binderOverlay, inventoryOverlay) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(300);
    
    const bg = scene.add.rectangle(0, 0, 600, 420, 0xffffff).setStrokeStyle(4, 0x000000).setInteractive();
    overlay.add(bg); 
    
    const title = scene.add.text(0, -170, 'SETTINGS', { fontFamily: 'Impact', fontSize: '32px', color: '#000' }).setOrigin(0.5);
    const closeTxt = scene.add.text(270, -170, '✖', { fontSize: '28px', color: '#000' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));

    const resetBtn = createButton(scene, 0, 160, 200, 40, 0xe74c3c, 0x000000, 'DELETE SAVE FILE', { fontFamily: 'Arial', fontSize: '16px', color: '#fff', fontStyle: 'bold' }, () => {
        if (confirm("Delete save and start over?")) { localStorage.removeItem('myMojiSave'); location.reload(); }
    });

    const instrBtn = createButton(scene, 0, 100, 200, 40, 0x3498db, 0x000000, 'HOW TO PLAY', { fontFamily: 'Arial', fontSize: '18px', color: '#fff', fontStyle: 'bold' }, () => {
        alert("HOW TO PLAY:\n\n1. Buy packs from the Store.\n2. Open packs in your Inventory.\n3. Drag cards to the Binder to save them, or to the Market to sell them for cash.\n4. Collect all 108 MyMojis!");
    });

    overlay.paletteContainer = scene.add.container(0, 0);
    overlay.add([title, closeTxt, resetBtn, instrBtn, overlay.paletteContainer]);

    const stdColors = [0x1a1a1a, 0xf4f4f4, 0x7f8c8d, 0xc0392b, 0x2980b9, 0x27ae60, 0x8e44ad, 0xd35400];
    const vipColors = [0xf1c40f, 0xbdc3c7, 0xcd7f32, 0xff00ff];
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
                let isUnlocked = playerUnlocks.colors.includes(color);
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
                        let checkColor = (color === 0xf4f4f4 || color === 0xbdc3c7 || color === 0xf1c40f) ? '#000000' : '#ffffff';
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
                        if (type === 'binder') { 
                            themeColors.binder = color; 
                            binderOverlay.bg.setFillStyle(color); 
                        }
                        if (type === 'inv') { 
                            themeColors.inventory = color; 
                            inventoryOverlay.bg.setFillStyle(color); 
                        }
                        saveGame(); 
                        overlay.renderPalettes(); 
                    });
                }
            });
        };

        drawRow(-90, "Table Color", 'table');
        drawRow(-30, "Binder Color", 'binder');
        drawRow(30, "Inventory Color", 'inv');
    };

    overlay.renderPalettes(); 
    return overlay;
}
