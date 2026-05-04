// --- DATABASE: BOOSTER PACKS ---
const packDatabase = {
    "basic": { name: "Basic Pack", cost: 5.00, color: 0x2ecc71, category: "all", weights: { "Common": 8000, "Rare": 1800, "Epic": 180, "Legendary": 19, "Glitch": 1 } },
    "premium": { name: "Premium Pack", cost: 25.00, color: 0x9b59b6, category: "all", weights: { "Common": 4000, "Rare": 4500, "Epic": 1200, "Legendary": 280, "Glitch": 20 } },
    "legendary": { name: "Legendary Pack", cost: 150.00, color: 0xf1c40f, category: "all", weights: { "Common": 0, "Rare": 3000, "Epic": 5000, "Legendary": 1800, "Glitch": 200 } },
    
    // NEW: Category Packs (Slightly more expensive, but guarantees the category)
    "faces": { name: "Faces Pack", cost: 12.00, color: 0xe67e22, category: "Faces", weights: { "Common": 7500, "Rare": 2000, "Epic": 450, "Legendary": 48, "Glitch": 2 } },
    "food": { name: "Food Pack", cost: 12.00, color: 0xe74c3c, category: "Food", weights: { "Common": 7500, "Rare": 2000, "Epic": 450, "Legendary": 48, "Glitch": 2 } },
    "animals": { name: "Animals Pack", cost: 12.00, color: 0x3498db, category: "Animals", weights: { "Common": 7500, "Rare": 2000, "Epic": 450, "Legendary": 48, "Glitch": 2 } }
};

// --- DATABASE: UPGRADES ---
const upgradeDatabase = { 
    "binder": { name: "Pro Binder", cost: 150.00 }, 
    "colorThemes": { name: "Color Palettes", cost: 75.00 } 
};
