let currentTombstone = null;
const tombstones = {};
let tombstoneIdCounter = 0;

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragIndicator = null;

document.addEventListener('DOMContentLoaded', () => {
    dragIndicator = document.getElementById('dragIndicator');

    // Disable VR functionality completely
    disableVRMode();

    // Generate 3D clouds in the small A-Frame section
    generate3DClouds();

    // Load existing tombstones
    load2DTombstones();

    // Setup drag and drop for 2D
    setup2DDragAndDrop();
});

function disableVRMode() {
    // Prevent any VR mode attempts
    if (typeof AFRAME !== 'undefined') {
        // Override VR mode functions
        AFRAME.utils.device.checkHeadsetConnected = () => false;
        AFRAME.utils.device.isMobile = () => false; // For VR purposes only

        // Wait for scene to load, then disable VR completely
        const scene = document.querySelector('a-scene');
        if (scene) {
            scene.addEventListener('loaded', () => {
                if (scene.renderer && scene.renderer.xr) {
                    scene.renderer.xr.enabled = false;
                }

                // Disable enter VR functionality
                scene.enterVR = () => { };
                scene.exitVR = () => { };

                // Remove any VR buttons that might appear
                const vrButton = document.querySelector('.a-enter-vr');
                if (vrButton) {
                    vrButton.style.display = 'none';
                }
            });

            // Prevent VR mode events
            scene.addEventListener('enter-vr', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            scene.addEventListener('exit-vr', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        }
    }

    // Prevent device orientation permission requests on mobile
    if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        // Override the permission request
        DeviceOrientationEvent.requestPermission = () => Promise.resolve('denied');
    }

    // Prevent device motion permission requests
    if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) {
        DeviceMotionEvent.requestPermission = () => Promise.resolve('denied');
    }
}

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
            { x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: -2, y: 0, z: 0 },
            { x: 0, y: 0, z: 2 }, { x: 0, y: 0, z: -2 }, { x: 4, y: 0, z: 0 }, { x: -4, y: 0, z: 0 },
            { x: 2, y: 0, z: 2 }, { x: -2, y: 0, z: -2 }, { x: 0, y: 2, z: 0 },
            { x: 2, y: 2, z: 0 }, { x: -2, y: 2, z: 0 }, { x: 0, y: 2, z: 2 }
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
    const perspectiveScale = 0.6 + (depthFactor * 0.8); // Scale from 0.6 to 1.4

    // Size based directly on drag box size (more responsive)
    const stoneWidth = Math.min(Math.max(width * 0.8, 80), 300);
    const stoneHeight = Math.min(Math.max(height * 0.8, 100), 400);

    // Create tombstone element
    const tombstone = document.createElement('div');
    tombstone.className = 'tombstone-2d';
    tombstone.id = id;
    tombstone.style.left = relativeX + '%';
    tombstone.style.top = relativeY + '%';
    tombstone.style.transform = `translate(-50%, -100%) scale(${perspectiveScale})`;

    // Create single tombstone element
    const tombstoneStone = document.createElement('div');
    tombstoneStone.className = 'tombstone-stone';
    tombstoneStone.style.width = stoneWidth + 'px';
    tombstoneStone.style.height = stoneHeight + 'px';

    const inscriptionText = document.createElement('div');
    inscriptionText.className = 'inscription-text';
    inscriptionText.textContent = 'Click to inscribe...';

    // Scale font size with tombstone size
    const fontSize = Math.min(Math.max(stoneWidth / 12, 8), 16);
    inscriptionText.style.fontSize = fontSize + 'px';

    tombstoneStone.appendChild(inscriptionText);
    tombstone.appendChild(tombstoneStone);
    tombstonesContainer.appendChild(tombstone);

    // Add click handler
    tombstone.addEventListener('click', () => openInscriptionModal(tombstone));

    // Add right-click handler to remove tombstone
    tombstone.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        removeTombstone(tombstone);
    });

    // Store tombstone data
    tombstones[id] = {
        x: relativeX,
        y: relativeY,
        width: stoneWidth,
        height: stoneHeight,
        scale: perspectiveScale,
        fontSize: fontSize,
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
    const textArea = document.getElementById('inscriptionText');

    // Pre-fill with existing inscription if it exists
    const id = tombstone.id;
    if (tombstones[id] && tombstones[id].inscription && tombstones[id].inscription.text) {
        textArea.value = tombstones[id].inscription.text;
    } else {
        textArea.value = '';
    }

    modal.classList.add('active');

    // Focus and select text for easy editing
    setTimeout(() => {
        textArea.focus();
        textArea.select();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('inscriptionModal');
    modal.classList.remove('active');
    document.getElementById('inscriptionForm').reset();
    currentTombstone = null;
}

document.getElementById('inscriptionForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const inscriptionText = document.getElementById('inscriptionText').value.trim();

    if (!inscriptionText) return;

    const inscription = {
        text: inscriptionText,
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

function formatInscriptionText(text) {
    // Clean up the text and format it nicely
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
}

function update2DTombstone(tombstone, inscription) {
    const inscriptionElement = tombstone.querySelector('.inscription-text');
    inscriptionElement.textContent = formatInscriptionText(inscription.text);
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

function removeTombstone(tombstone) {
    const id = tombstone.id;

    // Add removal animation
    tombstone.style.transition = 'all 0.5s ease-in';
    tombstone.style.opacity = '0';
    tombstone.style.transform = tombstone.style.transform + ' scale(0.8)';

    setTimeout(() => {
        // Remove from DOM
        tombstone.remove();

        // Remove from storage
        delete tombstones[id];
        save2DTombstones();
    }, 500);
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

            // Create single tombstone element
            const tombstoneStone = document.createElement('div');
            tombstoneStone.className = 'tombstone-stone';
            tombstoneStone.style.width = data.width + 'px';
            tombstoneStone.style.height = data.height + 'px';

            const inscriptionText = document.createElement('div');
            inscriptionText.className = 'inscription-text';

            // Set font size
            const fontSize = data.fontSize || Math.min(Math.max(data.width / 12, 8), 16);
            inscriptionText.style.fontSize = fontSize + 'px';

            if (data.inscription) {
                // Handle both old format and new format
                if (data.inscription.text) {
                    inscriptionText.textContent = formatInscriptionText(data.inscription.text);
                } else if (data.inscription.name || data.inscription.epitaph) {
                    // Convert old format to new format
                    const parts = [];
                    if (data.inscription.name) parts.push(data.inscription.name);
                    if (data.inscription.birthYear && data.inscription.deathYear) {
                        parts.push(`${data.inscription.birthYear}-${data.inscription.deathYear}`);
                    }
                    if (data.inscription.epitaph) parts.push(data.inscription.epitaph);
                    inscriptionText.textContent = formatInscriptionText(parts.join('\n'));
                }
            } else {
                inscriptionText.textContent = 'Click to inscribe...';
            }

            tombstoneStone.appendChild(inscriptionText);
            tombstone.appendChild(tombstoneStone);
            tombstonesContainer.appendChild(tombstone);

            // Add click handler
            tombstone.addEventListener('click', () => openInscriptionModal(tombstone));

            // Add right-click handler to remove tombstone
            tombstone.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                removeTombstone(tombstone);
            });

            const idNum = parseInt(id.split('_')[1]);
            if (idNum >= tombstoneIdCounter) {
                tombstoneIdCounter = idNum + 1;
            }
        });
    }
}