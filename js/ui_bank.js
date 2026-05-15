function createBankOverlay(scene) {
    const overlay = scene.add.container(512, 384).setVisible(false).setDepth(250); 
    
    // Dark, sleek bank background
    const bg = scene.add.rectangle(0, 0, 600, 500, 0x1a252f).setStrokeStyle(4, 0xf1c40f).setInteractive(); 
    
    const title = scene.add.text(0, -210, '🏦 FIRST MOJI BANK', { fontFamily: 'Impact, sans-serif', fontSize: '32px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
    
    const closeTxt = scene.add.text(260, -210, '✖', { fontSize: '28px', color: '#ffffff' }).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeTxt.on('pointerdown', () => overlay.setVisible(false));
    
    overlay.add([bg, title, closeTxt]);
    
    overlay.contentContainer = scene.add.container(0, 0);
    overlay.add(overlay.contentContainer);

    return overlay;
}

function renderBankView(scene, overlay) {
    overlay.contentContainer.removeAll(true);

    let debtColor = playerDebt > 0 ? '#e74c3c' : '#2ecc71';
    let debtTxt = scene.add.text(0, -150, `CURRENT DEBT: $${playerDebt.toFixed(2)}`, { fontSize: '28px', color: debtColor, fontStyle: 'bold' }).setOrigin(0.5);
    
    let warningTxt = scene.add.text(0, -110, "Warning: Outstanding debt compounds by 1% every minute.", { fontSize: '14px', color: '#bdc3c7', align: 'center', fontStyle: 'italic' }).setOrigin(0.5);
    
    overlay.contentContainer.add([debtTxt, warningTxt]);

    // --- TAKE A LOAN SECTION ---
    let loanTitle = scene.add.text(0, -50, "TAKE A LOAN (20% Upfront Interest)", { fontSize: '18px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
    overlay.contentContainer.add(loanTitle);

    const takeLoan = (amount) => {
        playerMoney += amount;
        playerDebt += (amount * 1.20); // 20% interest instantly applied
        scene.moneyText.setText('$' + playerMoney.toFixed(2));
        playSound(scene, 'coin', { volume: 0.8 });
        saveGame();
        renderBankView(scene, overlay);
    };

    let loan50 = createButton(scene, -150, -5, 130, 40, 0x2980b9, null, 'BORROW $50', { fontSize: '14px', color: '#fff', fontStyle: 'bold'}, () => takeLoan(50));
    let loan100 = createButton(scene, 0, -5, 130, 40, 0x2980b9, null, 'BORROW $100', { fontSize: '14px', color: '#fff', fontStyle: 'bold'}, () => takeLoan(100));
    let loan500 = createButton(scene, 150, -5, 130, 40, 0x2980b9, null, 'BORROW $500', { fontSize: '14px', color: '#fff', fontStyle: 'bold'}, () => takeLoan(500));
    let loan1000 = createButton(scene, -75, 45, 130, 40, 0x2980b9, null, 'BORROW $1,000', { fontSize: '14px', color: '#fff', fontStyle: 'bold'}, () => takeLoan(1000));
    let loan5000 = createButton(scene, 75, 45, 130, 40, 0x2980b9, null, 'BORROW $5,000', { fontSize: '14px', color: '#fff', fontStyle: 'bold'}, () => takeLoan(5000));

    overlay.contentContainer.add([loan50, loan100, loan500, loan1000, loan5000]);

    // --- REPAY LOAN SECTION ---
    let repayTitle = scene.add.text(0, 120, "REPAY LOAN", { fontSize: '18px', color: '#2ecc71', fontStyle: 'bold' }).setOrigin(0.5);
    overlay.contentContainer.add(repayTitle);

    const repayLoan = (amount) => {
        if (playerDebt <= 0) return;
        let actualPayment = Math.min(amount, playerDebt, playerMoney);
        
        if (actualPayment > 0) {
            playerMoney -= actualPayment;
            playerDebt -= actualPayment;
            scene.moneyText.setText('$' + playerMoney.toFixed(2));
            playSound(scene, 'coin', { volume: 0.8 });
            saveGame();
            renderBankView(scene, overlay);
        } else {
            alert("Not enough funds to make a payment!");
        }
    };

    let repay50 = createButton(scene, -150, 170, 130, 40, 0x27ae60, null, 'PAY $50', { fontSize: '14px', color: '#fff', fontStyle: 'bold'}, () => repayLoan(50));
    let repay500 = createButton(scene, 0, 170, 130, 40, 0x27ae60, null, 'PAY $500', { fontSize: '14px', color: '#fff', fontStyle: 'bold'}, () => repayLoan(500));
    let repayFull = createButton(scene, 150, 170, 130, 40, 0x27ae60, null, 'PAY IN FULL', { fontSize: '14px', color: '#fff', fontStyle: 'bold'}, () => repayLoan(playerDebt));

    // Disable repayment if no debt
    if (playerDebt <= 0) {
        [repay50, repay500, repayFull].forEach(btn => btn.setAlpha(0.5));
    }

    overlay.contentContainer.add([repay50, repay500, repayFull]);
}
