function createBinderOverlay(scene) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(100); 
    overlay.bg = scene.add.rectangle(0, 0, 940, 680, themeColors.binder).setStrokeStyle(4, 0xecf0f1).setInteractive(); 
    
    overlay.bg.on('pointerdown', () => scene.events.emit('close_all_dropdowns'));

    const spine = scene.add.rectangle(0, 0, 40, 680, 0x000000, 0.3);
    const closeTxt = scene.add.text(430, -315, '✖', { fontSize: '28px', color: '#ffffff' }).setInteractive().setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));
    
    overlay.currentSpread = 0; 
    overlay.sortBy = 'num_asc'; 
    overlay.filterBy = 'all';    

    overlay.add([overlay.bg, spine, closeTxt]);

    overlay.gridContainer = scene.add.container(0, 0); 
    overlay.add(overlay.gridContainer);

    overlay.uiContainer = scene.add.container(0, 0);
    overlay.add(overlay.uiContainer);

    const sortOptions = [
        { label: 'Number ⬆', val: 'num_asc' }, { label: 'Number ⬇', val: 'num_desc' },
        { label: 'Name (A-Z)', val: 'name_asc' }, { label: 'Name (Z-A)', val: 'name_desc' },
        { label: 'Rarity (Low)', val: 'rarity_asc' }, { label: 'Rarity (High)', val: 'rarity_desc' },
        { label: 'Value (Low)', val: 'val_asc' }, { label: 'Value (High)', val: 'val_desc' },
        { label: 'Category (A-Z)', val: 'cat_asc' }, { label: 'Category (Z-A)', val: 'cat_desc' }
    ];
    
    createDropdown(scene, overlay.uiContainer, -355, -295, 150, 'SORT: ', sortOptions, 'num_asc', (newVal) => {
        overlay.sortBy = newVal;
        overlay.currentSpread = 0; 
        renderBinderGrid(scene, overlay);
    });

    const filterOptions = [
        { label: 'All Cards', val: 'all' }, { label: 'Owned Only', val: 'owned' }, { label: 'Missing Only', val: 'missing' },
        { label: 'Rarity: Common', val: 'rarity_Common' }, { label: 'Rarity: Rare', val: 'rarity_Rare' }, { label: 'Rarity: Epic', val: 'rarity_Epic' }, { label: 'Rarity: Legendary', val: 'rarity_Legendary' },
        { label: 'Faces', val: 'cat_Faces' }, { label: 'Animals', val: 'cat_Animals' }, { label: 'Food', val: 'cat_Food' }, { label: 'Cosmic', val: 'cat_Cosmic' }, { label: 'Magic', val: 'cat_Magic' }, { label: 'Sports', val: 'cat_Sports' }, { label: 'Music', val: 'cat_Music' }, { label: 'Objects', val: 'cat_Objects' }, { label: 'Spooky', val: 'cat_Spooky' }, { label: 'Memes', val: 'cat_Memes' }
    ];

    createDropdown(scene, overlay.uiContainer, -195, -295, 150, 'FILTER: ', filterOptions, 'all', (newVal) => {
        overlay.filterBy = newVal;
        overlay.currentSpread = 0; 
        renderBinderGrid(scene, overlay);
    });
    
    overlay.prevBtn = scene.add.text(-440, 0, '◀', { fontSize: '48px', color: '#ffffff' }).setInteractive().setOrigin(0.5);
    overlay.nextBtn = scene.add.text(440, 0, '▶', { fontSize: '48px', color: '#ffffff' }).setInteractive().setOrigin(0.5);
    
    overlay.prevBtn.on('pointerdown', () => {
        if (overlay.currentSpread > 0) { overlay.currentSpread--; renderBinderGrid(scene, overlay); }
    });
    
    overlay.nextBtn.on('pointerdown', () => {
        overlay.currentSpread++; renderBinderGrid(scene, overlay);
    });

    overlay.uiContainer.add([overlay.prevBtn, overlay.nextBtn]);

    return overlay;
}

function renderBinderGrid(scene, overlay) {
    overlay.gridContainer.removeAll(true);
    
    let filteredDb = myMojiDatabase.filter(moji => {
        let owned = Number(playerInventory[moji.id]);
        if (overlay.filterBy === 'owned') return owned > 0;
        if (overlay.filterBy === 'missing') return owned === 0;
        if (overlay.filterBy.startsWith('rarity_')) return moji.rarity === overlay.filterBy.split('_')[1];
        if (overlay.filterBy.startsWith('cat_')) return moji.category === overlay.filterBy.split('_')[1];
        return true; 
    });

    filteredDb.sort((a, b) => {
        let valA, valB;
        let [sortType, sortDir] = overlay.sortBy.split('_');
        let isAsc = sortDir === 'asc';
        
        if (sortType === 'num') {
            valA = parseInt(a.id.split('_')[1]);
            valB = parseInt(b.id.split('_')[1]);
        } else if (sortType === 'name') {
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
        } else if (sortType === 'cat') {
            valA = a.category.toLowerCase();
            valB = b.category.toLowerCase();
        } else if (sortType === 'rarity') {
            const weights = { "Common": 1, "Rare": 2, "Epic": 3, "Legendary": 4 };
            valA = weights[a.rarity];
            valB = weights[b.rarity];
        } else if (sortType === 'val') {
            valA = a.baseValue;
            valB = b.baseValue;
        }

        if (valA < valB) return isAsc ? -1 : 1;
        if (valA > valB) return isAsc ? 1 : -1;
        return 0;
    });

    let maxSpread = Math.ceil(filteredDb.length / 18) - 1;
    if (maxSpread < 0) maxSpread = 0; 
    
    if (overlay.currentSpread > maxSpread) overlay.currentSpread = maxSpread;

    overlay.prevBtn.setVisible(overlay.currentSpread > 0);
    overlay.nextBtn.setVisible(overlay.currentSpread < maxSpread);
    
    let startIndex = overlay.currentSpread * 18;
    let endIndex = Math.min(startIndex + 18, filteredDb.length);

    if (filteredDb.length === 0) {
        let emptyTxt = scene.add.text(0, 0, "No cards match this filter.", { fontSize: '24px', color: '#7f8c8d' }).setOrigin(0.5);
        overlay.gridContainer.add(emptyTxt);
        return;
    }

    for (let i = startIndex; i < endIndex; i++) {
        let moji = filteredDb[i]; 
        let spreadIndex = i - startIndex; 
        let page = spreadIndex < 9 ? 0 : 1; 
        let localIndex = spreadIndex % 9;
        let col = localIndex % 3;
        let row = Math.floor(localIndex / 3);

        let startX = page === 0 ? -375 : 95;
        let startY = -180; 
        let spacingX = 140;
        let spacingY = 200;

        let x = startX + (col * spacingX);
        let y = startY + (row * spacingY);

        let owned = Number(playerInventory[moji.id]);

        let sleeve = scene.add.rectangle(x, y, 110, 160, 0x000000, 0.4).setStrokeStyle(2, 0x555555);
        overlay.gridContainer.add(sleeve);

        let miniCard = scene.add.container(x, y);
        let graphics = createCardGraphic(scene, moji);
        miniCard.add(graphics);
        miniCard.setScale(0.45); 

        if (owned === 0) {
            graphics.forEach(g => { if(g.setTint) g.setTint(0x222222); g.setAlpha(0.5); });
            let qMark = scene.add.text(0, 0, '?', { fontSize: '80px', color: '#444444', fontStyle: 'bold' }).setOrigin(0.5);
            miniCard.add(qMark);
        } else {
            miniCard.setSize(220, 320); 
            miniCard.setInteractive({ cursor: 'pointer' });
            
            miniCard.on('pointerdown', () => {
                scene.events.emit('close_all_dropdowns'); 
                playerInventory[moji.id] = Number(playerInventory[moji.id]) - 1; 
                saveGame();
                
                let randX = Phaser.Math.Between(150, 874); 
                let randY = Phaser.Math.Between(340, 510);
                createDraggableCard(scene, randX, randY, moji); 
                
                renderBinderGrid(scene, overlay); 
            });
        }
        overlay.gridContainer.add(miniCard);
    }
}
