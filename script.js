let currentTombstone = null;
const tombstones = {};
let tombstoneIdCounter = 0;

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragIndicator = null;

document.addEventListener('DOMContentLoaded', () => {
    dragIndicator = document.getElementById('dragIndicator');
    
    // Generate 3D clouds in the small A-Frame section
    generate3DClouds();
    
    // Load existing tombstones
    load2DTombstones();
    
    // Setup drag and drop for 2D
    setup2DDragAndDrop();
});

function generate3DClouds() {
    const cloudsContainer = document.getElementById('clouds-3d');
    
    // Create floating 3D clouds
    for (let i = 0; i < 6; i++) {
        const cloudGroup = document.createElement('a-entity');
        const x = (Math.random() - 0.5) * 80;
        const y = -5 + Math.random() * 10;
        const z = -20 - Math.random() * 40;
        const scale = 0.8 + Math.random() * 1.2;
        
        // Create cloud from multiple blocks
        const cloudBlocks = [
            {x: 0, y: 0, z: 0}, {x: 2, y: 0, z: 0}, {x: -2, y: 0, z: 0},
            {x: 0, y: 0, z: 2}, {x: 0, y: 0, z: -2}, {x: 4, y: 0, z: 0}, {x: -4, y: 0, z: 0},
            {x: 2, y: 0, z: 2}, {x: -2, y: 0, z: -2}, {x: 0, y: 2, z: 0},
            {x: 2, y: 2, z: 0}, {x: -2, y: 2, z: 0}, {x: 0, y: 2, z: 2}
        ];
        
        cloudBlocks.forEach(block => {
            if (Math.random() > 0.15) {
                const cloudBlock = document.createElement('a-box');
                cloudBlock.setAttribute('position', `${x + block.x * scale} ${y + block.y * scale} ${z + block.z * scale}`);
                cloudBlock.setAttribute('width', scale * 3);
                cloudBlock.setAttribute('height', scale * 2.5);
                cloudBlock.setAttribute('depth', scale * 3);
                cloudBlock.setAttribute('color', '#FFFFFF');
                cloudBlock.setAttribute('opacity', 0.7 + Math.random() * 0.2);
                cloudGroup.appendChild(cloudBlock);
            }
        });
        
        // Animate cloud movement
        const speed = 80000 + Math.random() * 40000;
        cloudGroup.setAttribute('animation', {
            property: 'position',
            to: `${x + 120} ${y} ${z}`,
            dur: speed,
            loop: true,
            easing: 'linear'
        });
        
        cloudsContainer.appendChild(cloudGroup);
    }
}

function setup2DDragAndDrop() {
    const cemetery = document.querySelector('.cemetery-2d');
    
    cemetery.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (isDragging) {
                cancelDrag();
            } else {
                closeModal();
            }
        }
    });
}

function handleMouseDown(e) {
    // Don't start drag if clicking on modal or existing tombstone
    if (e.target.closest('.modal') || e.target.closest('.tombstone-2d')) {
        return;
    }
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    dragIndicator.style.left = dragStartX + 'px';
    dragIndicator.style.top = dragStartY + 'px';
    dragIndicator.style.width = '0px';
    dragIndicator.style.height = '0px';
    dragIndicator.classList.add('active');
    
    e.preventDefault();
}

function handleMouseMove(e) {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const width = Math.abs(currentX - dragStartX);
    const height = Math.abs(currentY - dragStartY);
    
    const left = Math.min(currentX, dragStartX);
    const top = Math.min(currentY, dragStartY);
    
    dragIndicator.style.left = left + 'px';
    dragIndicator.style.top = top + 'px';
    dragIndicator.style.width = width + 'px';
    dragIndicator.style.height = height + 'px';
}

function handleMouseUp(e) {
    if (!isDragging) return;
    
    const width = Math.abs(e.clientX - dragStartX);
    const height = Math.abs(e.clientY - dragStartY);
    
    if (width > 30 && height > 40) {
        const centerX = (e.clientX + dragStartX) / 2;
        const centerY = (e.clientY + dragStartY) / 2;
        
        create2DTombstone(centerX, centerY, width, height);
    }
    
    cancelDrag();
}

function cancelDrag() {
    isDragging = false;
    dragIndicator.classList.remove('active');
}

function create2DTombstone(screenX, screenY, width, height) {
    const cemetery = document.querySelector('.cemetery-2d');
    const rect = cemetery.getBoundingClientRect();
    
    // Convert screen coordinates to relative position within cemetery
    const relativeX = ((screenX - rect.left) / rect.width) * 100;
    const relativeY = ((screenY - rect.top) / rect.height) * 100;
    
    // Don't place tombstones too high up (in the sky area)
    if (relativeY < 50) return;
    
    const id = `tomb_${tombstoneIdCounter++}`;
    const tombstonesContainer = document.getElementById('tombstonesContainer');
    
    // Scale based on position (perspective effect)
    const depthFactor = (relativeY - 50) / 50; // 0 at middle, 1 at bottom
    const scale = 0.6 + (depthFactor * 0.8); // Scale from 0.6 to 1.4
    
    // Create tombstone element
    const tombstone = document.createElement('div');
    tombstone.className = 'tombstone-2d';
    tombstone.id = id;
    tombstone.style.left = relativeX + '%';
    tombstone.style.top = relativeY + '%';
    tombstone.style.transform = `translate(-50%, -100%) scale(${scale})`;
    
    // Constrain size based on drag
    const stoneWidth = Math.min(Math.max(width * 0.3, 60), 120);
    const stoneHeight = Math.min(Math.max(height * 0.3, 80), 150);
    
    // Create tombstone parts
    const stoneBase = document.createElement('div');
    stoneBase.className = 'stone-base';
    stoneBase.style.width = stoneWidth + 'px';
    stoneBase.style.height = Math.floor(stoneHeight * 0.3) + 'px';
    
    const stoneBody = document.createElement('div');
    stoneBody.className = 'stone-body';
    stoneBody.style.width = stoneWidth + 'px';
    stoneBody.style.height = Math.floor(stoneHeight * 0.7) + 'px';
    
    const epitaph = document.createElement('div');
    epitaph.className = 'epitaph';
    epitaph.textContent = 'Click to inscribe...';
    
    const dates = document.createElement('div');
    dates.className = 'dates';
    dates.textContent = '????-????';
    
    stoneBody.appendChild(epitaph);
    stoneBody.appendChild(dates);
    tombstone.appendChild(stoneBase);
    tombstone.appendChild(stoneBody);
    tombstonesContainer.appendChild(tombstone);
    
    // Add click handler
    tombstone.addEventListener('click', () => openInscriptionModal(tombstone));
    
    // Store tombstone data
    tombstones[id] = {
        x: relativeX,
        y: relativeY,
        width: stoneWidth,
        height: stoneHeight,
        scale: scale,
        inscription: null
    };
    
    save2DTombstones();
    animateTombstoneAppearance(tombstone);
}

function animateTombstoneAppearance(tombstone) {
    tombstone.style.opacity = '0';
    tombstone.style.transform = tombstone.style.transform + ' translateY(20px)';
    
    setTimeout(() => {
        tombstone.style.transition = 'all 0.6s ease-out';
        tombstone.style.opacity = '1';
        tombstone.style.transform = tombstone.style.transform.replace('translateY(20px)', 'translateY(0px)');
    }, 10);
}

function openInscriptionModal(tombstone) {
    currentTombstone = tombstone;
    const modal = document.getElementById('inscriptionModal');
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('inscriptionModal');
    modal.classList.remove('active');
    document.getElementById('inscriptionForm').reset();
    currentTombstone = null;
}

document.getElementById('inscriptionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('nameInput').value;
    const birthYear = document.getElementById('birthYear').value || '????';
    const deathYear = document.getElementById('deathYear').value || '????';
    const epitaph = document.getElementById('epitaphInput').value;
    
    const inscription = {
        name,
        birthYear,
        deathYear,
        epitaph,
        timestamp: Date.now()
    };
    
    const id = currentTombstone.id;
    if (tombstones[id]) {
        tombstones[id].inscription = inscription;
    }
    
    update2DTombstone(currentTombstone, inscription);
    save2DTombstones();
    closeModal();
    
    create2DFlowerBurst(currentTombstone);
});

function update2DTombstone(tombstone, inscription) {
    const epitaphElement = tombstone.querySelector('.epitaph');
    const datesElement = tombstone.querySelector('.dates');
    
    epitaphElement.innerHTML = `${inscription.name}<br>${inscription.epitaph}`;
    datesElement.textContent = `${inscription.birthYear}-${inscription.deathYear}`;
}

function create2DFlowerBurst(tombstone) {
    const rect = tombstone.getBoundingClientRect();
    const cemetery = document.querySelector('.cemetery-2d');
    
    for (let i = 0; i < 6; i++) {
        const flower = document.createElement('div');
        flower.className = 'flower flower-' + ['yellow', 'pink', 'purple', 'blue'][Math.floor(Math.random() * 4)];
        flower.style.position = 'absolute';
        flower.style.left = (rect.left + rect.width / 2) + 'px';
        flower.style.top = (rect.top + rect.height) + 'px';
        flower.style.transform = 'translate(-50%, -50%) scale(0)';
        flower.style.zIndex = '20';
        
        document.body.appendChild(flower);
        
        const angle = (Math.PI * 2 * i) / 6;
        const distance = 30 + Math.random() * 20;
        const finalX = (rect.left + rect.width / 2) + Math.cos(angle) * distance;
        const finalY = (rect.top + rect.height) + Math.sin(angle) * distance;
        
        setTimeout(() => {
            flower.style.transition = 'all 0.8s ease-out';
            flower.style.left = finalX + 'px';
            flower.style.top = finalY + 'px';
            flower.style.transform = 'translate(-50%, -50%) scale(1)';
            flower.style.opacity = '1';
        }, i * 100);
        
        setTimeout(() => {
            flower.style.transition = 'all 1s ease-in';
            flower.style.opacity = '0';
            flower.style.transform = 'translate(-50%, -50%) scale(0)';
            
            setTimeout(() => {
                flower.remove();
            }, 1000);
        }, 2000 + i * 100);
    }
}

function save2DTombstones() {
    localStorage.setItem('garden_2d_tombstones', JSON.stringify(tombstones));
}

function load2DTombstones() {
    const saved = localStorage.getItem('garden_2d_tombstones');
    if (saved) {
        const loaded = JSON.parse(saved);
        Object.assign(tombstones, loaded);
        
        Object.entries(loaded).forEach(([id, data]) => {
            const tombstonesContainer = document.getElementById('tombstonesContainer');
            
            const tombstone = document.createElement('div');
            tombstone.className = 'tombstone-2d';
            tombstone.id = id;
            tombstone.style.left = data.x + '%';
            tombstone.style.top = data.y + '%';
            tombstone.style.transform = `translate(-50%, -100%) scale(${data.scale})`;
            
            // Create tombstone parts
            const stoneBase = document.createElement('div');
            stoneBase.className = 'stone-base';
            stoneBase.style.width = data.width + 'px';
            stoneBase.style.height = Math.floor(data.height * 0.3) + 'px';
            
            const stoneBody = document.createElement('div');
            stoneBody.className = 'stone-body';
            stoneBody.style.width = data.width + 'px';
            stoneBody.style.height = Math.floor(data.height * 0.7) + 'px';
            
            const epitaph = document.createElement('div');
            epitaph.className = 'epitaph';
            
            const dates = document.createElement('div');
            dates.className = 'dates';
            
            if (data.inscription) {
                epitaph.innerHTML = `${data.inscription.name}<br>${data.inscription.epitaph}`;
                dates.textContent = `${data.inscription.birthYear}-${data.inscription.deathYear}`;
            } else {
                epitaph.textContent = 'Click to inscribe...';
                dates.textContent = '????-????';
            }
            
            stoneBody.appendChild(epitaph);
            stoneBody.appendChild(dates);
            tombstone.appendChild(stoneBase);
            tombstone.appendChild(stoneBody);
            tombstonesContainer.appendChild(tombstone);
            
            // Add click handler
            tombstone.addEventListener('click', () => openInscriptionModal(tombstone));
            
            const idNum = parseInt(id.split('_')[1]);
            if (idNum >= tombstoneIdCounter) {
                tombstoneIdCounter = idNum + 1;
            }
        });
    }
}