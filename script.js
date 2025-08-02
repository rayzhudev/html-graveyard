let currentGravestone = null;
const gravestones = {};
let gravestoneIdCounter = 0;

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragIndicator = null;
let scene = null;

document.addEventListener('DOMContentLoaded', () => {
    scene = document.querySelector('a-scene');
    dragIndicator = document.getElementById('dragIndicator');
    
    scene.addEventListener('loaded', () => {
        generateTerrain();
        generateTrees();
        generateFlowers();
        generateClouds();
        loadGravestones();
        setupDragAndDrop();
    });
});

function generateTerrain() {
    const terrain = document.getElementById('terrain');
    const gridSize = 50;
    const blockSize = 1;
    
    // Create layered terrain for depth
    for (let layer = 0; layer < 3; layer++) {
        const baseY = -layer * 2;
        const color = interpolateColor('#7CFC00', '#228B22', layer / 2);
        
        for (let x = -25; x < 25; x++) {
            for (let z = -25; z < 25; z++) {
                // Create height variation
                const noise = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
                const hillNoise = Math.sin(x * 0.05) * Math.sin(z * 0.05) * 4;
                const y = baseY + noise + hillNoise;
                
                // Skip some blocks randomly for variation
                if (Math.random() > 0.98) continue;
                
                const block = document.createElement('a-box');
                block.setAttribute('position', `${x} ${y} ${z}`);
                block.setAttribute('width', blockSize);
                block.setAttribute('height', blockSize);
                block.setAttribute('depth', blockSize);
                block.setAttribute('color', color);
                block.setAttribute('shadow', 'receive: true');
                
                terrain.appendChild(block);
            }
        }
    }
    
    // Add dirt blocks underneath
    for (let x = -25; x < 25; x++) {
        for (let z = -25; z < 25; z++) {
            for (let y = -10; y < -6; y++) {
                if (Math.random() > 0.3) {
                    const dirt = document.createElement('a-box');
                    dirt.setAttribute('position', `${x} ${y} ${z}`);
                    dirt.setAttribute('width', blockSize);
                    dirt.setAttribute('height', blockSize);
                    dirt.setAttribute('depth', blockSize);
                    dirt.setAttribute('color', '#8B4513');
                    
                    terrain.appendChild(dirt);
                }
            }
        }
    }
}

function generateTrees() {
    const trees = document.getElementById('trees');
    const treePositions = [
        {x: -15, z: -10}, {x: 10, z: -15}, {x: -8, z: 5},
        {x: 15, z: 10}, {x: -20, z: 0}, {x: 5, z: -20},
        {x: 0, z: 15}, {x: -12, z: -18}, {x: 18, z: -5}
    ];
    
    treePositions.forEach(pos => {
        const treeGroup = document.createElement('a-entity');
        const y = getTerrainHeight(pos.x, pos.z) + 1;
        
        // Trunk
        for (let i = 0; i < 4; i++) {
            const trunk = document.createElement('a-box');
            trunk.setAttribute('position', `${pos.x} ${y + i} ${pos.z}`);
            trunk.setAttribute('width', '1');
            trunk.setAttribute('height', '1');
            trunk.setAttribute('depth', '1');
            trunk.setAttribute('color', '#8B4513');
            treeGroup.appendChild(trunk);
        }
        
        // Leaves
        const leafPositions = [
            {x: 0, y: 4, z: 0}, {x: 1, y: 4, z: 0}, {x: -1, y: 4, z: 0},
            {x: 0, y: 4, z: 1}, {x: 0, y: 4, z: -1},
            {x: 0, y: 5, z: 0}, {x: 1, y: 5, z: 0}, {x: -1, y: 5, z: 0},
            {x: 0, y: 5, z: 1}, {x: 0, y: 5, z: -1},
            {x: 0, y: 6, z: 0}
        ];
        
        leafPositions.forEach(leaf => {
            const leafBlock = document.createElement('a-box');
            leafBlock.setAttribute('position', `${pos.x + leaf.x} ${y + leaf.y} ${pos.z + leaf.z}`);
            leafBlock.setAttribute('width', '1');
            leafBlock.setAttribute('height', '1');
            leafBlock.setAttribute('depth', '1');
            leafBlock.setAttribute('color', '#228B22');
            leafBlock.setAttribute('opacity', '0.9');
            treeGroup.appendChild(leafBlock);
        });
        
        trees.appendChild(treeGroup);
    });
}

function generateFlowers() {
    const flowers = document.getElementById('flowers');
    
    for (let i = 0; i < 30; i++) {
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        const y = getTerrainHeight(x, z) + 0.5;
        
        const flowerGroup = document.createElement('a-entity');
        
        // Stem
        const stem = document.createElement('a-box');
        stem.setAttribute('position', `${x} ${y} ${z}`);
        stem.setAttribute('width', '0.1');
        stem.setAttribute('height', '0.5');
        stem.setAttribute('depth', '0.1');
        stem.setAttribute('color', '#228B22');
        flowerGroup.appendChild(stem);
        
        // Flower head
        const flowerColors = ['#FFD700', '#FF69B4', '#DDA0DD', '#87CEEB', '#FFA500'];
        const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
        
        const petalPositions = [
            {x: 0.2, z: 0}, {x: -0.2, z: 0},
            {x: 0, z: 0.2}, {x: 0, z: -0.2}
        ];
        
        petalPositions.forEach(petal => {
            const petalBlock = document.createElement('a-box');
            petalBlock.setAttribute('position', `${x + petal.x} ${y + 0.5} ${z + petal.z}`);
            petalBlock.setAttribute('width', '0.3');
            petalBlock.setAttribute('height', '0.3');
            petalBlock.setAttribute('depth', '0.3');
            petalBlock.setAttribute('color', color);
            flowerGroup.appendChild(petalBlock);
        });
        
        flowers.appendChild(flowerGroup);
    }
}

function generateClouds() {
    const clouds = document.getElementById('clouds');
    
    for (let i = 0; i < 5; i++) {
        const cloudGroup = document.createElement('a-entity');
        const x = (Math.random() - 0.5) * 60;
        const y = 15 + Math.random() * 10;
        const z = (Math.random() - 0.5) * 60;
        
        // Create cloud from multiple white boxes
        const cloudBlocks = [
            {x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, {x: -1, y: 0, z: 0},
            {x: 0, y: 0, z: 1}, {x: 0, y: 0, z: -1},
            {x: 2, y: 0, z: 0}, {x: -2, y: 0, z: 0},
            {x: 1, y: 0, z: 1}, {x: -1, y: 0, z: -1}
        ];
        
        cloudBlocks.forEach(block => {
            if (Math.random() > 0.3) {
                const cloudBlock = document.createElement('a-box');
                cloudBlock.setAttribute('position', `${x + block.x * 2} ${y + block.y} ${z + block.z * 2}`);
                cloudBlock.setAttribute('width', '3');
                cloudBlock.setAttribute('height', '2');
                cloudBlock.setAttribute('depth', '3');
                cloudBlock.setAttribute('color', '#FFFFFF');
                cloudBlock.setAttribute('opacity', '0.8');
                cloudGroup.appendChild(cloudBlock);
            }
        });
        
        // Animate cloud movement
        cloudGroup.setAttribute('animation', {
            property: 'position',
            to: `${x + 100} ${y} ${z}`,
            dur: 120000,
            loop: true,
            easing: 'linear'
        });
        
        clouds.appendChild(cloudGroup);
    }
}

function getTerrainHeight(x, z) {
    const noise = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
    const hillNoise = Math.sin(x * 0.05) * Math.sin(z * 0.05) * 4;
    return noise + hillNoise;
}

function interpolateColor(color1, color2, factor) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function setupDragAndDrop() {
    document.addEventListener('mousedown', handleMouseDown);
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
    if (e.target.closest('.modal') || e.target.tagName === 'A-SCENE') {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        dragIndicator.style.left = dragStartX + 'px';
        dragIndicator.style.top = dragStartY + 'px';
        dragIndicator.style.width = '0px';
        dragIndicator.style.height = '0px';
        dragIndicator.classList.add('active');
    }
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
    
    if (width > 20 && height > 20) {
        const centerX = (e.clientX + dragStartX) / 2;
        const centerY = (e.clientY + dragStartY) / 2;
        
        createGravestone3D(centerX, centerY, width, height);
    }
    
    cancelDrag();
}

function cancelDrag() {
    isDragging = false;
    dragIndicator.classList.remove('active');
}

function createGravestone3D(screenX, screenY, width, height) {
    const camera = document.querySelector('a-camera');
    const cameraPos = camera.getAttribute('position');
    const cameraRot = camera.getAttribute('rotation');
    
    // Convert screen coordinates to 3D world coordinates
    const rect = scene.getBoundingClientRect();
    const x = ((screenX - rect.left) / rect.width) * 2 - 1;
    const y = -((screenY - rect.top) / rect.height) * 2 + 1;
    
    // Project to ground plane
    const worldX = x * 30;
    const worldZ = -y * 20 + 10;
    const worldY = getTerrainHeight(worldX, worldZ) + 1;
    
    const id = `grave_${gravestoneIdCounter++}`;
    const gravestonesContainer = document.getElementById('gravestones-3d');
    
    const gravestone = document.createElement('a-entity');
    gravestone.setAttribute('id', id);
    gravestone.setAttribute('class', 'gravestone-3d');
    gravestone.setAttribute('position', `${worldX} ${worldY} ${worldZ}`);
    
    // Scale based on drag size
    const scale = Math.min(width / 100, 2);
    const stoneHeight = Math.min(height / 50, 4);
    
    // Create tombstone from blocks
    const stoneColor = '#C0C0C0';
    
    // Base
    const base = document.createElement('a-box');
    base.setAttribute('position', '0 0 0');
    base.setAttribute('width', scale);
    base.setAttribute('height', '0.2');
    base.setAttribute('depth', '0.5');
    base.setAttribute('color', stoneColor);
    base.setAttribute('shadow', 'cast: true; receive: true');
    gravestone.appendChild(base);
    
    // Main stone
    const mainStone = document.createElement('a-box');
    mainStone.setAttribute('position', `0 ${stoneHeight/2 + 0.1} 0`);
    mainStone.setAttribute('width', scale * 0.8);
    mainStone.setAttribute('height', stoneHeight);
    mainStone.setAttribute('depth', '0.3');
    mainStone.setAttribute('color', stoneColor);
    mainStone.setAttribute('shadow', 'cast: true; receive: true');
    gravestone.appendChild(mainStone);
    
    // Top curved part (simplified with box)
    const topStone = document.createElement('a-box');
    topStone.setAttribute('position', `0 ${stoneHeight + 0.3} 0`);
    topStone.setAttribute('width', scale * 0.6);
    topStone.setAttribute('height', '0.4');
    topStone.setAttribute('depth', '0.3');
    topStone.setAttribute('color', stoneColor);
    topStone.setAttribute('shadow', 'cast: true; receive: true');
    gravestone.appendChild(topStone);
    
    // Text
    const text = document.createElement('a-text');
    text.setAttribute('value', 'Click to\ninscribe');
    text.setAttribute('position', `0 ${stoneHeight/2 + 0.1} 0.16`);
    text.setAttribute('align', 'center');
    text.setAttribute('color', '#333333');
    text.setAttribute('width', 4);
    text.setAttribute('wrap-count', 10);
    gravestone.appendChild(text);
    
    gravestonesContainer.appendChild(gravestone);
    
    // Add click handler
    gravestone.addEventListener('click', () => openInscriptionModal(gravestone));
    
    // Store gravestone data
    gravestones[id] = {
        x: worldX,
        y: worldY,
        z: worldZ,
        scale: scale,
        height: stoneHeight,
        inscription: null
    };
    
    saveGravestones();
    animateGravestoneAppearance(gravestone);
}

function animateGravestoneAppearance(gravestone) {
    const startY = gravestone.getAttribute('position').y - 2;
    gravestone.setAttribute('position', `${gravestone.getAttribute('position').x} ${startY} ${gravestone.getAttribute('position').z}`);
    gravestone.setAttribute('scale', '0 0 0');
    
    gravestone.setAttribute('animation__position', {
        property: 'position',
        to: `${gravestone.getAttribute('position').x} ${gravestone.getAttribute('position').y + 2} ${gravestone.getAttribute('position').z}`,
        dur: 500,
        easing: 'easeOutBack'
    });
    
    gravestone.setAttribute('animation__scale', {
        property: 'scale',
        to: '1 1 1',
        dur: 500,
        easing: 'easeOutBack'
    });
}

function openInscriptionModal(gravestone) {
    currentGravestone = gravestone;
    const modal = document.getElementById('inscriptionModal');
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('inscriptionModal');
    modal.classList.remove('active');
    document.getElementById('inscriptionForm').reset();
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
    
    const id = currentGravestone.getAttribute('id');
    if (gravestones[id]) {
        gravestones[id].inscription = inscription;
    }
    
    updateGravestone3D(currentGravestone, inscription);
    saveGravestones();
    closeModal();
    
    createFlowerBurst3D(currentGravestone);
});

function updateGravestone3D(gravestone, inscription) {
    const text = gravestone.querySelector('a-text');
    const textValue = `${inscription.name}\n${inscription.birthYear}-${inscription.deathYear}\n${inscription.epitaph}`;
    text.setAttribute('value', textValue);
    text.setAttribute('wrap-count', 15);
}

function createFlowerBurst3D(gravestone) {
    const pos = gravestone.getAttribute('position');
    const flowers = document.getElementById('flowers');
    
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 2;
        const x = parseFloat(pos.x) + Math.cos(angle) * distance;
        const z = parseFloat(pos.z) + Math.sin(angle) * distance;
        const y = getTerrainHeight(x, z) + 0.5;
        
        const flowerColors = ['#FFD700', '#FF69B4', '#DDA0DD', '#87CEEB', '#FFA500'];
        const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
        
        const flower = document.createElement('a-box');
        flower.setAttribute('position', `${x} ${y} ${z}`);
        flower.setAttribute('width', '0.3');
        flower.setAttribute('height', '0.3');
        flower.setAttribute('depth', '0.3');
        flower.setAttribute('color', color);
        flower.setAttribute('scale', '0 0 0');
        
        flower.setAttribute('animation__scale', {
            property: 'scale',
            to: '1 1 1',
            dur: 500,
            delay: i * 50,
            easing: 'easeOutBack'
        });
        
        flowers.appendChild(flower);
    }
}

function saveGravestones() {
    localStorage.setItem('minecraft_gravestones', JSON.stringify(gravestones));
}

function loadGravestones() {
    const saved = localStorage.getItem('minecraft_gravestones');
    if (saved) {
        const loaded = JSON.parse(saved);
        Object.assign(gravestones, loaded);
        
        Object.entries(loaded).forEach(([id, data]) => {
            const gravestonesContainer = document.getElementById('gravestones-3d');
            
            const gravestone = document.createElement('a-entity');
            gravestone.setAttribute('id', id);
            gravestone.setAttribute('class', 'gravestone-3d');
            gravestone.setAttribute('position', `${data.x} ${data.y} ${data.z}`);
            
            const stoneColor = '#C0C0C0';
            
            // Base
            const base = document.createElement('a-box');
            base.setAttribute('position', '0 0 0');
            base.setAttribute('width', data.scale);
            base.setAttribute('height', '0.2');
            base.setAttribute('depth', '0.5');
            base.setAttribute('color', stoneColor);
            base.setAttribute('shadow', 'cast: true; receive: true');
            gravestone.appendChild(base);
            
            // Main stone
            const mainStone = document.createElement('a-box');
            mainStone.setAttribute('position', `0 ${data.height/2 + 0.1} 0`);
            mainStone.setAttribute('width', data.scale * 0.8);
            mainStone.setAttribute('height', data.height);
            mainStone.setAttribute('depth', '0.3');
            mainStone.setAttribute('color', stoneColor);
            mainStone.setAttribute('shadow', 'cast: true; receive: true');
            gravestone.appendChild(mainStone);
            
            // Top stone
            const topStone = document.createElement('a-box');
            topStone.setAttribute('position', `0 ${data.height + 0.3} 0`);
            topStone.setAttribute('width', data.scale * 0.6);
            topStone.setAttribute('height', '0.4');
            topStone.setAttribute('depth', '0.3');
            topStone.setAttribute('color', stoneColor);
            topStone.setAttribute('shadow', 'cast: true; receive: true');
            gravestone.appendChild(topStone);
            
            // Text
            const text = document.createElement('a-text');
            if (data.inscription) {
                const textValue = `${data.inscription.name}\n${data.inscription.birthYear}-${data.inscription.deathYear}\n${data.inscription.epitaph}`;
                text.setAttribute('value', textValue);
            } else {
                text.setAttribute('value', 'Click to\ninscribe');
            }
            text.setAttribute('position', `0 ${data.height/2 + 0.1} 0.16`);
            text.setAttribute('align', 'center');
            text.setAttribute('color', '#333333');
            text.setAttribute('width', 4);
            text.setAttribute('wrap-count', 15);
            gravestone.appendChild(text);
            
            gravestonesContainer.appendChild(gravestone);
            
            gravestone.addEventListener('click', () => openInscriptionModal(gravestone));
            
            const idNum = parseInt(id.split('_')[1]);
            if (idNum >= gravestoneIdCounter) {
                gravestoneIdCounter = idNum + 1;
            }
        });
    }
}