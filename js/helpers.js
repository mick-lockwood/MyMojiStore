function getContrastColor(hexColor) {
    let r, g, b;
    // Handle both string ('#ffffff') and number (0xffffff) formats
    if (typeof hexColor === 'string') {
        let hex = hexColor.replace('#', '');
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else {
        r = (hexColor >> 16) & 0xff;
        g = (hexColor >> 8) & 0xff;
        b = hexColor & 0xff;
    }
    // Calculate relative luminance
    let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#111111' : '#ffffff';
}
function createButton(scene, x, y, width, height, fillColor, strokeColor, textStr, textStyle, onClick) {
    const container = scene.add.container(x, y);
    container.setSize(width, height);
    
    const bg = scene.add.graphics();
    bg.fillStyle(fillColor, 1);
    bg.fillRoundedRect(-width/2, -height/2, width, height, 12); 
    
    if (strokeColor !== null) {
        bg.lineStyle(4, strokeColor, 1);
        bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);
    }
    
    const txt = scene.add.text(0, 0, textStr, textStyle).setOrigin(0.5);
    container.add([bg, txt]);
    
    if (onClick) {
        container.setInteractive({ useHandCursor: true });
        container.on('pointerover', () => scene.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 }));
        container.on('pointerout', () => scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 }));
        container.on('pointerdown', () => {
            scene.tweens.add({ targets: container, scaleX: 0.95, scaleY: 0.95, duration: 50, yoyo: true });
            onClick();
        });
    }
    return container;
}

function createDropdown(scene, parentContainer, x, y, width, prefix, options, defaultVal, onChange) {
    const container = scene.add.container(x, y);
    parentContainer.add(container);

    const mainBg = scene.add.rectangle(0, 0, width, 30, 0x34495e).setStrokeStyle(2, 0xffffff).setInteractive();
    const defaultOpt = options.find(o => o.val === defaultVal);
    const mainTxt = scene.add.text(0, 0, prefix + (defaultOpt ? defaultOpt.label : ''), { fontFamily: 'Arial', fontSize: '12px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    container.add([mainBg, mainTxt]);

    const listContainer = scene.add.container(0, 15);
    listContainer.setVisible(false);
    container.add(listContainer);

    const itemHeight = 26;
    const listHeight = options.length * itemHeight;
    const listBg = scene.add.rectangle(0, listHeight / 2, width, listHeight, 0x1a1a1a).setStrokeStyle(2, 0xaaaaaa);
    listContainer.add(listBg);

    options.forEach((opt, i) => {
        let itemBg = scene.add.rectangle(0, (itemHeight/2) + (i * itemHeight), width, itemHeight, 0x2c3e50).setInteractive();
        let itemTxt = scene.add.text(0, (itemHeight/2) + (i * itemHeight), opt.label, { fontFamily: 'Arial', fontSize: '13px', color: '#dddddd' }).setOrigin(0.5);

        itemBg.on('pointerover', () => { itemBg.setFillStyle(0x3498db); itemTxt.setColor('#ffffff'); });
        itemBg.on('pointerout', () => { itemBg.setFillStyle(0x2c3e50); itemTxt.setColor('#dddddd'); });
        
        itemBg.on('pointerdown', (pointer, localX, localY, event) => {
            mainTxt.setText(prefix + opt.label);
            listContainer.setVisible(false);
            onChange(opt.val);
            event.stopPropagation(); 
        });
        listContainer.add([itemBg, itemTxt]);
    });

    mainBg.on('pointerdown', (pointer, localX, localY, event) => {
        let isVis = listContainer.visible;
        scene.events.emit('close_all_dropdowns'); 
        if (!isVis) {
            listContainer.setVisible(true);
            parentContainer.bringToTop(container); 
        }
        event.stopPropagation(); 
    });

    scene.events.on('close_all_dropdowns', () => listContainer.setVisible(false));
    return container;
}

function showFloatingText(scene, x, y, message, colorHex) {
    let txt = scene.add.text(x, y, message, { 
        fontFamily: 'Arial', fontSize: '22px', color: colorHex, fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 
    }).setOrigin(0.5).setDepth(200);

    scene.tweens.add({
        targets: txt,
        y: y - 60,
        alpha: 0,
        duration: 1200,
        onComplete: () => txt.destroy()
    });
}
