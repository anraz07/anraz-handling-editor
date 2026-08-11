const attributesMeta = {
    // Engine & Drive
    fInitialDragCoeff: { tab: 'engine', min: 0.1, max: 30.0, step: 0.05, desc: 'Aerodynamic resistance multiplier' },
    fDownforceModifier: { tab: 'engine', min: 0.0, max: 100.0, step: 0.1, desc: 'Downforce grip multiplier' },
    fPercentSubmerged: { tab: 'engine', min: 10, max: 120, step: 1, desc: 'Percentage submerged in water before floating' },
    fDriveBiasFront: { tab: 'engine', min: 0.0, max: 1.0, step: 0.05, desc: 'Drive distribution (0.0 = RWD, 0.5 = AWD, 1.0 = FWD)' },
    fInitialDriveForce: { tab: 'engine', min: 0.05, max: 3.0, step: 0.01, desc: 'Power output capability of the engine' },
    fDriveInertia: { tab: 'engine', min: 0.1, max: 3.0, step: 0.05, desc: 'Resistance of engine rpm acceleration' },
    fClutchChangeRateScaleUpShift: { tab: 'engine', min: 0.5, max: 10.0, step: 0.1, desc: 'Clutch release speed during upshifts' },
    fClutchChangeRateScaleDownShift: { tab: 'engine', min: 0.5, max: 10.0, step: 0.1, desc: 'Clutch release speed during downshifts' },
    fInitialDriveMaxFlatVel: { tab: 'engine', min: 10.0, max: 600.0, step: 1.0, desc: 'Theoretical flat velocity capability in km/h' },
    nInitialDriveGears: { tab: 'engine', min: 1, max: 10, step: 1, desc: 'Number of forward transmission gears' },
    
    // Brakes & Steering
    fBrakeForce: { tab: 'brakes', min: 0.05, max: 5.0, step: 0.02, desc: 'Maximum braking force capability' },
    fBrakeBiasFront: { tab: 'brakes', min: 0.0, max: 1.0, step: 0.05, desc: 'Braking bias (0.0 = rear-only, 1.0 = front-only)' },
    fHandBrakeForce: { tab: 'brakes', min: 0.1, max: 15.0, step: 0.1, desc: 'Handbrake lock-up capability' },
    fSteeringLock: { tab: 'brakes', min: 10.0, max: 75.0, step: 0.5, desc: 'Steering turn angle limit in degrees' },
    
    // Traction & Tires
    fTractionCurveMax: { tab: 'traction', min: 0.5, max: 5.5, step: 0.01, desc: 'Maximum cornering/grip capability' },
    fTractionCurveMin: { tab: 'traction', min: 0.5, max: 5.0, step: 0.01, desc: 'Minimum grip capability during slip' },
    fTractionCurveLateral: { tab: 'traction', min: 2.0, max: 40.0, step: 0.1, desc: 'Resistance to sliding sideways' },
    fTractionSpringDeltaMax: { tab: 'traction', min: 0.01, max: 0.8, step: 0.01, desc: 'Traction spring response range' },
    fTractionBiasFront: { tab: 'traction', min: 0.0, max: 1.0, step: 0.05, desc: 'Traction bias (0.5 = balanced)' },
    fTractionLossMult: { tab: 'traction', min: 0.05, max: 3.0, step: 0.02, desc: 'Multiplier for traction loss during slides' },
    
    // Suspension & Chassis
    fMass: { tab: 'suspension', min: 100, max: 15000, step: 10, desc: 'Vehicle weight in kilograms' },
    fSuspensionForce: { tab: 'suspension', min: 0.5, max: 10.0, step: 0.05, desc: 'Stiffness of the suspension springs' },
    fSuspensionCompDamp: { tab: 'suspension', min: 0.01, max: 5.0, step: 0.02, desc: 'Dampening force when suspension compresses' },
    fSuspensionReboundDamp: { tab: 'suspension', min: 0.01, max: 6.0, step: 0.02, desc: 'Dampening force when suspension rebounds' },
    fSuspensionUpperLimit: { tab: 'suspension', min: 0.01, max: 1.0, step: 0.01, desc: 'Maximum suspension compression travel limit' },
    fSuspensionLowerLimit: { tab: 'suspension', min: -1.0, max: -0.01, step: 0.01, desc: 'Maximum suspension extension travel limit' },
    fSuspensionBiasFront: { tab: 'suspension', min: 0.0, max: 1.0, step: 0.05, desc: 'Suspension force balance (0.5 = centered)' },
    fAntiRollBarForce: { tab: 'suspension', min: 0.0, max: 10.0, step: 0.05, desc: 'Stabilizing anti-roll stiffness' },
    fAntiRollBarBiasFront: { tab: 'suspension', min: 0.0, max: 1.0, step: 0.05, desc: 'Anti-roll balance distribution' },
    fRollCentreHeightFront: { tab: 'suspension', min: -1.0, max: 1.0, step: 0.02, desc: 'Front body roll pivot height' },
    fRollCentreHeightRear: { tab: 'suspension', min: -1.0, max: 1.0, step: 0.02, desc: 'Rear body roll pivot height' },
    vecCentreOfMassOffset_x: { tab: 'suspension', min: -5.0, max: 5.0, step: 0.01, desc: 'Center of mass X offset (Left/Right)' },
    vecCentreOfMassOffset_y: { tab: 'suspension', min: -5.0, max: 5.0, step: 0.01, desc: 'Center of mass Y offset (Front/Back)' },
    vecCentreOfMassOffset_z: { tab: 'suspension', min: -5.0, max: 5.0, step: 0.01, desc: 'Center of mass Z offset (Up/Down)' },
    vecInertiaMultiplier_x: { tab: 'suspension', min: 0.1, max: 10.0, step: 0.05, desc: 'Rotational inertia resistance X (Pitch)' },
    vecInertiaMultiplier_y: { tab: 'suspension', min: 0.1, max: 10.0, step: 0.05, desc: 'Rotational inertia resistance Y (Roll)' },
    vecInertiaMultiplier_z: { tab: 'suspension', min: 0.1, max: 10.0, step: 0.05, desc: 'Rotational inertia resistance Z (Yaw)' },

    // Damage & Misc
    fCollisionDamageMult: { tab: 'damage', min: 0.0, max: 10.0, step: 0.05, desc: 'Collision body damage multiplier' },
    fDeformationDamageMult: { tab: 'damage', min: 0.0, max: 10.0, step: 0.05, desc: 'Deformation damage multiplier' },
    fEngineDamageMult: { tab: 'damage', min: 0.0, max: 10.0, step: 0.05, desc: 'Engine damage multiplier' },
    fPetrolTankVolume: { tab: 'damage', min: 0.0, max: 300.0, step: 1.0, desc: 'Fuel tank capacity in liters' },
    fOilVolume: { tab: 'damage', min: 0.0, max: 50.0, step: 0.1, desc: 'Engine oil capacity in liters' },
    fSeatOffsetDistX: { tab: 'damage', min: -3.0, max: 3.0, step: 0.01, desc: 'Seat X offset relative to chassis' },
    fSeatOffsetDistY: { tab: 'damage', min: -3.0, max: 3.0, step: 0.01, desc: 'Seat Y offset relative to chassis' },
    fSeatOffsetDistZ: { tab: 'damage', min: -3.0, max: 3.0, step: 0.01, desc: 'Seat Z offset relative to chassis' },
    nMonetaryValue: { tab: 'damage', min: 0, max: 10000000, step: 100, desc: 'Financial/sale value of the vehicle' },
    strModelFlags: { tab: 'damage', type: 'hex', desc: 'Model flags (hexadecimal)' },
    strHandlingFlags: { tab: 'damage', type: 'hex', desc: 'Handling flags (hexadecimal)' },
    strDamageFlags: { tab: 'damage', type: 'hex', desc: 'Damage flags (hexadecimal)' }
};

let currentHandling = {};
let stockHandling = {};
let currentModel = '';

function toHexString(val) {
    if (val === undefined || val === null) return '0x00000000';
    return '0x' + (val >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

// Listen for message events from client
window.addEventListener('message', function(event) {
    const data = event.data;

    // Direct clipboard handler
    if (data.type === 'copy') {
        const textarea = document.getElementById('clipboard-helper');
        textarea.value = data.text;
        textarea.select();
        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            console.error('Could not copy handling data: ', err);
        }
        fetch(`https://${GetParentResourceName()}/copied`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({ success: success })
        });
        return;
    }

    if (data.action === 'open') {
        currentModel = data.model;
        currentHandling = data.handling;
        stockHandling = data.stock;
        
        document.getElementById('vehicle-label').textContent = `${data.label.toUpperCase()} (${currentModel.toUpperCase()})`;
        
        // Build cards
        buildEditorGrids();
        
        // Display container
        document.getElementById('editor-container').style.display = 'flex';
    }
});

function buildEditorGrids() {
    // Clear all grids
    document.getElementById('grid-engine').innerHTML = '';
    document.getElementById('grid-brakes').innerHTML = '';
    document.getElementById('grid-traction').innerHTML = '';
    document.getElementById('grid-suspension').innerHTML = '';
    document.getElementById('grid-damage').innerHTML = '';

    for (const [attrName, meta] of Object.entries(attributesMeta)) {
        const currentVal = currentHandling[attrName] !== undefined ? currentHandling[attrName] : stockHandling[attrName];
        const stockVal = stockHandling[attrName];
        
        const card = document.createElement('div');
        card.className = 'tuning-card';
        
        if (meta.type === 'hex') {
            card.innerHTML = `
                <div class="card-info">
                    <div class="attr-meta">
                        <h3>${attrName}</h3>
                        <div class="attr-desc">${meta.desc}</div>
                    </div>
                    <div class="value-inputs">
                        <span class="default-tag">Stock: ${toHexString(stockVal)}</span>
                        <input type="text" class="value-box" style="width: 140px;" id="num-${attrName}" value="${toHexString(currentVal)}">
                    </div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="card-info">
                    <div class="attr-meta">
                        <h3>${attrName}</h3>
                        <div class="attr-desc">${meta.desc}</div>
                    </div>
                    <div class="value-inputs">
                        <span class="default-tag">Stock: ${stockVal.toFixed(4)}</span>
                        <input type="number" step="${meta.step}" class="value-box" id="num-${attrName}" value="${currentVal.toFixed(4)}">
                    </div>
                </div>
                <div class="control-row">
                    <div class="slider-container">
                        <input type="range" min="${meta.min}" max="${meta.max}" step="${meta.step}" id="slide-${attrName}" value="${currentVal}">
                    </div>
                </div>
            `;
        }

        // Append to appropriate grid
        const grid = document.getElementById(`grid-${meta.tab}`);
        if (grid) {
            grid.appendChild(card);
        }

        // Event listeners
        if (meta.type === 'hex') {
            const hexbox = card.querySelector(`#num-${attrName}`);
            hexbox.addEventListener('change', (e) => {
                let text = e.target.value.trim();
                if (!text.startsWith('0x')) {
                    text = '0x' + text;
                }
                let intVal = parseInt(text, 16);
                if (isNaN(intVal)) intVal = stockVal;
                e.target.value = toHexString(intVal);
                updateClientValue(attrName, intVal);
            });
        } else {
            const slider = card.querySelector(`#slide-${attrName}`);
            const numbox = card.querySelector(`#num-${attrName}`);

            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                numbox.value = val.toFixed(4);
                updateClientValue(attrName, val);
            });

            numbox.addEventListener('change', (e) => {
                let val = parseFloat(e.target.value);
                if (isNaN(val)) val = stockVal;
                // Clamp value within bounds
                val = Math.max(meta.min, Math.min(meta.max, val));
                e.target.value = val.toFixed(4);
                slider.value = val;
                updateClientValue(attrName, val);
            });
        }
    }
}

// Update client side value live (temporary)
function updateClientValue(attribute, value) {
    currentHandling[attribute] = value;
    fetch(`https://${GetParentResourceName()}/applyValue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ attribute: attribute, value: value })
    });
}

// Tab navigation handler
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(`tab-${tabId}`).classList.add('active');
    });
});

// Close UI Handler
document.getElementById('close-btn').addEventListener('click', () => {
    document.getElementById('editor-container').style.display = 'none';
    fetch(`https://${GetParentResourceName()}/closeUI`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({})
    });
});

// Save to Database
document.getElementById('save-btn').addEventListener('click', () => {
    fetch(`https://${GetParentResourceName()}/saveTuning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ model: currentModel, handling: currentHandling })
    });
});

// Revert to Stock
document.getElementById('reset-btn').addEventListener('click', () => {
    currentHandling = JSON.parse(JSON.stringify(stockHandling));
    
    // Update UI elements
    for (const attrName of Object.keys(attributesMeta)) {
        const stockVal = stockHandling[attrName];
        const slider = document.getElementById(`slide-${attrName}`);
        const numbox = document.getElementById(`num-${attrName}`);
        
        if (slider) slider.value = stockVal;
        if (numbox) {
            if (attributesMeta[attrName].type === 'hex') {
                numbox.value = toHexString(stockVal);
            } else {
                numbox.value = stockVal.toFixed(4);
            }
        }
        updateClientValue(attrName, stockVal);
    }
    
    fetch(`https://${GetParentResourceName()}/resetStock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ model: currentModel })
    });
});

// Copy XML/Lua from Editor
document.getElementById('copy-btn').addEventListener('click', () => {
    fetch(`https://${GetParentResourceName()}/triggerClipboardCopy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ model: currentModel, handling: currentHandling })
    });
});

// Dragging Logic for the Window
let isDragging = false;
let startX, startY;
let initialX, initialY;

const header = document.querySelector('.editor-header');
const container = document.getElementById('editor-container');

header.addEventListener('mousedown', (e) => {
    // Prevent dragging if clicking on input boxes, buttons, or child controls
    if (e.target.tagName === 'BUTTON' || e.target.closest('.icon-btn') || e.target.closest('.header-info span') || e.target.closest('h1')) {
        return;
    }
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = container.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    // Position absolute and update top/left values
    container.style.position = 'absolute';
    container.style.margin = '0';
    container.style.left = `${initialX + dx}px`;
    container.style.top = `${initialY + dy}px`;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Import XML Dialog Elements
const importBtn = document.getElementById('import-btn');
const importModal = document.getElementById('import-modal');
const importModalClose = document.getElementById('import-modal-close');
const importCancelBtn = document.getElementById('import-cancel-btn');
const importSubmitBtn = document.getElementById('import-submit-btn');
const importTextarea = document.getElementById('import-xml-textarea');
const importErrorMsg = document.getElementById('import-error-msg');

// Open Modal
importBtn.addEventListener('click', () => {
    importTextarea.value = '';
    importErrorMsg.style.display = 'none';
    importModal.classList.add('active');
    importTextarea.focus();
});

// Close Modal functions
function closeImportModal() {
    importModal.classList.remove('active');
}

importModalClose.addEventListener('click', closeImportModal);
importCancelBtn.addEventListener('click', closeImportModal);

// Close Modal when clicking outside the container
importModal.addEventListener('click', (e) => {
    if (e.target === importModal) {
        closeImportModal();
    }
});

// Submit / Parse XML
importSubmitBtn.addEventListener('click', () => {
    const pastedText = importTextarea.value;
    if (!pastedText || pastedText.trim() === '') {
        closeImportModal();
        return;
    }

    importErrorMsg.style.display = 'none';

    // Wrap elements inside a root node to ensure valid XML structure even for snippets
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(`<HandlingData>${pastedText}</HandlingData>`, 'text/xml');

    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
        importErrorMsg.style.display = 'block';
        return;
    }

    let count = 0;

    for (const [attrName, meta] of Object.entries(attributesMeta)) {
        let parsedValue = null;

        // Special handling for split vector components (e.g. vecCentreOfMassOffset_x)
        const vectorMatch = attrName.match(/^(vec\w+)_(x|y|z)$/);
        if (vectorMatch) {
            const baseName = vectorMatch[1];
            const component = vectorMatch[2];
            const vecEl = xmlDoc.querySelector(baseName);
            if (vecEl) {
                const compVal = vecEl.getAttribute(component);
                if (compVal !== null) {
                    parsedValue = parseFloat(compVal);
                }
            }
        } else {
            const el = xmlDoc.querySelector(attrName);
            if (el) {
                const valAttr = el.getAttribute('value');
                if (valAttr !== null) {
                    if (meta.type === 'hex') {
                        parsedValue = parseInt(valAttr.replace(/^0x/i, ''), 16);
                    } else {
                        parsedValue = parseFloat(valAttr);
                    }
                } else {
                    const text = el.textContent.trim();
                    if (text !== '') {
                        if (meta.type === 'hex') {
                            parsedValue = parseInt(text.replace(/^0x/i, ''), 16);
                        } else {
                            parsedValue = parseFloat(text);
                        }
                    }
                }
            }
        }

        if (parsedValue !== null && !isNaN(parsedValue)) {
            // Update local value cache
            currentHandling[attrName] = parsedValue;

            // Update UI elements
            const slider = document.getElementById(`slide-${attrName}`);
            const numbox = document.getElementById(`num-${attrName}`);

            if (slider && meta.type !== 'hex') {
                slider.value = parsedValue;
            }
            if (numbox) {
                if (meta.type === 'hex') {
                    numbox.value = toHexString(parsedValue);
                } else {
                    numbox.value = parsedValue.toFixed(4);
                }
            }

            // Instantly apply live modification in-game
            updateClientValue(attrName, parsedValue);
            count++;
        }
    }

    if (count > 0) {
        closeImportModal();
        fetch(`https://${GetParentResourceName()}/xmlImported`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({ count: count })
        });
    } else {
        importErrorMsg.textContent = "No matching handling attributes found in the pasted XML.";
        importErrorMsg.style.display = 'block';
    }
});
