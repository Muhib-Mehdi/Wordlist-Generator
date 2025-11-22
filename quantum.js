// ============================================
// Quantum Mechanics Implementation
// ============================================

'use strict';

class QuantumState {
    constructor(theta = 90, phi = 0, phase = 0) {
        this.theta = theta * Math.PI / 180; // Polar angle
        this.phi = phi * Math.PI / 180;     // Azimuthal angle
        this.phase = phase * Math.PI / 180;  // Phase angle
        this.updateAmplitudes();
    }

    updateAmplitudes() {
        // Quantum state: |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
        const cosHalfTheta = Math.cos(this.theta / 2);
        const sinHalfTheta = Math.sin(this.theta / 2);
        
        this.alpha = cosHalfTheta; // |0⟩ amplitude
        this.beta = sinHalfTheta * Math.cos(this.phi); // Real part of |1⟩ amplitude
        this.betaImag = sinHalfTheta * Math.sin(this.phi); // Imaginary part
        
        // Apply phase (for visualization, we use the magnitude)
        // Note: In full quantum mechanics, phase would be e^(i*phase), but for visualization we use the real components
        this.prob0 = Math.pow(this.alpha, 2);
        this.prob1 = Math.pow(sinHalfTheta, 2);
        
        // Normalize
        const norm = Math.sqrt(this.prob0 + this.prob1);
        this.prob0 = this.prob0 / norm;
        this.prob1 = this.prob1 / norm;
    }

    setTheta(theta) {
        this.theta = theta * Math.PI / 180;
        this.updateAmplitudes();
    }

    setPhi(phi) {
        this.phi = phi * Math.PI / 180;
        this.updateAmplitudes();
    }

    setPhase(phase) {
        this.phase = phase * Math.PI / 180;
        this.updateAmplitudes();
    }

    setAmplitudes(alpha, beta) {
        // Normalize
        const norm = Math.sqrt(alpha * alpha + beta * beta);
        this.alpha = alpha / norm;
        this.beta = beta / norm;
        
        // Calculate theta and phi from amplitudes
        this.theta = 2 * Math.acos(this.alpha);
        this.phi = Math.atan2(this.betaImag || 0, this.beta);
        this.prob0 = this.alpha * this.alpha;
        this.prob1 = this.beta * this.beta;
    }

    measure() {
        // Quantum measurement with probability
        const random = Math.random();
        return random < this.prob0 ? 0 : 1;
    }

    getStateName() {
        if (Math.abs(this.theta - Math.PI/2) < 0.1 && Math.abs(this.phi) < 0.1) {
            return '|+⟩';
        } else if (Math.abs(this.theta - Math.PI/2) < 0.1 && Math.abs(this.phi - Math.PI) < 0.1) {
            return '|-⟩';
        } else if (Math.abs(this.theta) < 0.1) {
            return '|0⟩';
        } else if (Math.abs(this.theta - Math.PI) < 0.1) {
            return '|1⟩';
        }
        return '|ψ⟩';
    }
}

// ============================================
// Quantum Coinflip
// ============================================

let quantumState = new QuantumState(90, 0, 0);
let isFlipping = false;

const quantumCoin = document.getElementById('quantumCoin');
const resultDisplay = document.getElementById('resultDisplay');
const prob0Display = document.getElementById('prob0');
const prob1Display = document.getElementById('prob1');

function updateProbabilityDisplay() {
    const prob0Percent = (quantumState.prob0 * 100).toFixed(1);
    const prob1Percent = (quantumState.prob1 * 100).toFixed(1);
    prob0Display.textContent = prob0Percent + '%';
    prob1Display.textContent = prob1Percent + '%';
}

function flipQuantumCoin() {
    if (isFlipping) return;
    
    isFlipping = true;
    quantumCoin.classList.add('flipping');
    quantumCoin.classList.add('superposition');
    if (resultDisplay) resultDisplay.textContent = 'Measuring...';
    
    // Step 1: Show initial state
    updateComputationStep(1, {
        label: 'Initial Quantum State',
        formula: '|ψ⟩ = α|0⟩ + β|1⟩',
        values: `α = ${quantumState.alpha.toFixed(4)}, β = ${quantumState.beta.toFixed(4)}`
    });
    
    // Step 2: Show base probabilities
    updateComputationStep(2, {
        label: 'Base Probabilities',
        formula: 'P(|0⟩) = |α|², P(|1⟩) = |β|²',
        values: `P(|0⟩) = ${quantumState.prob0.toFixed(4)}, P(|1⟩) = ${quantumState.prob1.toFixed(4)}`
    });
    
    // Add quantum effects
    const entanglement = parseFloat(entanglementSlider?.value || 0) / 100;
    const decoherence = parseFloat(decoherenceSlider?.value || 0) / 100;
    const fidelity = parseFloat(fidelitySlider?.value || 100) / 100;
    
    // Generate random values for display
    const random1 = Math.random();
    const random2 = Math.random();
    
    // Quantum noise from entanglement
    const quantumNoise = (random1 - 0.5) * entanglement * 0.1;
    
    // Decoherence effect (reduces coherence over time)
    const decoherenceEffect = decoherence * 0.05;
    
    // Fidelity effect (how well the state is preserved)
    const fidelityEffect = fidelity;
    
    // Temporarily adjust probabilities with quantum effects
    let adjustedProb0 = quantumState.prob0 + quantumNoise - decoherenceEffect;
    adjustedProb0 = adjustedProb0 * fidelityEffect + (1 - fidelityEffect) * 0.5; // Mix with maximally mixed state
    adjustedProb0 = Math.max(0, Math.min(1, adjustedProb0));
    const adjustedProb1 = 1 - adjustedProb0;
    
    // Step 3: Show quantum effects
    setTimeout(() => {
        updateComputationStep(3, {
            label: 'Quantum Effects Applied',
            formula: "P' = P + ε - δ, adjusted by fidelity F",
            values: `ε = ${quantumNoise.toFixed(4)}, δ = ${decoherenceEffect.toFixed(4)}, F = ${fidelity.toFixed(4)}<br>P'(|0⟩) = ${adjustedProb0.toFixed(4)}, P'(|1⟩) = ${adjustedProb1.toFixed(4)}`
        });
    }, 500);
    
    setTimeout(() => {
        // Step 4: Show measurement
        const measurementRandom = random2;
        const result = measurementRandom < adjustedProb0 ? 0 : 1;
        
        updateComputationStep(4, {
            label: 'Quantum Measurement',
            formula: 'r < P(|0⟩) → |0⟩, else → |1⟩',
            values: `Random value r = ${measurementRandom.toFixed(4)}<br>${measurementRandom.toFixed(4)} ${measurementRandom < adjustedProb0 ? '<' : '≥'} ${adjustedProb0.toFixed(4)} → ${result === 0 ? '|0⟩ (Heads)' : '|1⟩ (Tails)'}`
        });
        
        quantumCoin.classList.remove('flipping');
        quantumCoin.classList.remove('superposition');
        
        if (result === 0) {
            quantumCoin.classList.add('result-heads');
            quantumCoin.classList.remove('result-tails');
            if (resultDisplay) {
                resultDisplay.textContent = 'Result: |0⟩ (Heads)';
                resultDisplay.style.color = '#00eaff';
            }
        } else {
            quantumCoin.classList.add('result-tails');
            quantumCoin.classList.remove('result-heads');
            if (resultDisplay) {
                resultDisplay.textContent = 'Result: |1⟩ (Tails)';
                resultDisplay.style.color = '#00eaff';
            }
        }
        
        isFlipping = false;
        
        // Update Bloch sphere
        updateBlochSphere();
    }, 2000);
}

// Update computation display
function updateComputationStep(stepNumber, data) {
    const computationContent = document.getElementById('computationContent');
    if (!computationContent) return;
    
    const stepElement = computationContent.querySelector(`.computation-step:nth-child(${stepNumber})`);
    if (!stepElement) return;
    
    const stepDetails = stepElement.querySelector('.step-details');
    if (stepDetails) {
        stepDetails.innerHTML = `
            <div class="step-label">${data.label}</div>
            <div class="step-formula">${data.formula}</div>
            <div class="step-values">${data.values}</div>
        `;
    }
    
    // Add animation
    stepElement.classList.add('step-active');
    setTimeout(() => {
        stepElement.classList.remove('step-active');
    }, 500);
}

// Make coin clickable - this is the only way to flip
if (quantumCoin) {
    quantumCoin.style.cursor = 'pointer';
    quantumCoin.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!isFlipping) {
            flipQuantumCoin();
        }
    });
    
    // Add hover effect
    quantumCoin.addEventListener('mouseenter', () => {
        if (!isFlipping) {
            quantumCoin.style.transform = 'scale(1.08)';
        }
    });
    quantumCoin.addEventListener('mouseleave', () => {
        if (!isFlipping) {
            quantumCoin.style.transform = 'scale(1)';
        }
    });
}

// ============================================
// Parameter Controls
// ============================================

const thetaSlider = document.getElementById('theta');
const phiSlider = document.getElementById('phi');
const alphaInput = document.getElementById('alpha');
const betaInput = document.getElementById('beta');
const phaseSlider = document.getElementById('phase');
const entanglementSlider = document.getElementById('entanglement');
const decoherenceSlider = document.getElementById('decoherence');
const coherenceSlider = document.getElementById('coherence');
const fidelitySlider = document.getElementById('fidelity');
const resetButton = document.getElementById('resetButton');

const thetaValue = document.getElementById('thetaValue');
const phiValue = document.getElementById('phiValue');
const alphaValue = document.getElementById('alphaValue');
const betaValue = document.getElementById('betaValue');
const phaseValue = document.getElementById('phaseValue');
const entanglementValue = document.getElementById('entanglementValue');
const decoherenceValue = document.getElementById('decoherenceValue');
const coherenceValue = document.getElementById('coherenceValue');
const fidelityValue = document.getElementById('fidelityValue');
const expectationZ = document.getElementById('expectationZ');
const entropy = document.getElementById('entropy');
const purity = document.getElementById('purity');
const overlap = document.getElementById('overlap');

function updateFromSliders() {
    const theta = parseFloat(thetaSlider.value);
    const phi = parseFloat(phiSlider.value);
    const phase = parseFloat(phaseSlider.value);
    
    quantumState.setTheta(theta);
    quantumState.setPhi(phi);
    quantumState.setPhase(phase);
    
    // Update amplitude inputs
    alphaInput.value = quantumState.alpha.toFixed(3);
    betaInput.value = quantumState.beta.toFixed(3);
    
    updateAllDisplays();
    updateBlochSphere();
}

function updateFromAmplitudes() {
    const alpha = parseFloat(alphaInput.value);
    const beta = parseFloat(betaInput.value);
    
    if (!isNaN(alpha) && !isNaN(beta) && alpha >= 0 && beta >= 0) {
        quantumState.setAmplitudes(alpha, beta);
        
        // Update sliders
        const theta = quantumState.theta * 180 / Math.PI;
        const phi = quantumState.phi * 180 / Math.PI;
        
        thetaSlider.value = theta;
        phiSlider.value = phi;
        
        updateAllDisplays();
        updateBlochSphere();
    }
}

function calculateQuantumMetrics() {
    // Expectation value of Z operator: ⟨Z⟩ = |α|² - |β|²
    const expectationZValue = quantumState.prob0 - quantumState.prob1;
    
    // Von Neumann Entropy: S = -Tr(ρ log ρ) = -p₀ log₂(p₀) - p₁ log₂(p₁)
    let entropyValue = 0;
    if (quantumState.prob0 > 0) {
        entropyValue -= quantumState.prob0 * Math.log2(quantumState.prob0);
    }
    if (quantumState.prob1 > 0) {
        entropyValue -= quantumState.prob1 * Math.log2(quantumState.prob1);
    }
    
    // Purity: Tr(ρ²) = |α|⁴ + |β|⁴ + 2|α|²|β|²
    const purityValue = Math.pow(quantumState.prob0, 2) + Math.pow(quantumState.prob1, 2) + 
                        2 * quantumState.prob0 * quantumState.prob1;
    
    // Quantum Overlap (fidelity with itself, normalized)
    const overlapValue = Math.sqrt(quantumState.prob0 * quantumState.prob0 + 
                                   quantumState.prob1 * quantumState.prob1);
    
    return {
        expectationZ: expectationZValue,
        entropy: entropyValue,
        purity: purityValue,
        overlap: overlapValue
    };
}

function updateAllDisplays() {
    if (thetaValue) thetaValue.textContent = parseFloat(thetaSlider.value).toFixed(0) + '°';
    if (phiValue) phiValue.textContent = parseFloat(phiSlider.value).toFixed(0) + '°';
    if (alphaValue) alphaValue.textContent = quantumState.alpha.toFixed(3);
    if (betaValue) betaValue.textContent = quantumState.beta.toFixed(3);
    if (phaseValue) phaseValue.textContent = parseFloat(phaseSlider.value).toFixed(0) + '°';
    if (entanglementValue) entanglementValue.textContent = parseFloat(entanglementSlider.value) + '%';
    if (decoherenceValue) decoherenceValue.textContent = parseFloat(decoherenceSlider.value) + '%';
    if (coherenceValue) coherenceValue.textContent = parseFloat(coherenceSlider.value);
    if (fidelityValue) fidelityValue.textContent = parseFloat(fidelitySlider.value) + '%';
    
    updateProbabilityDisplay();
    
    // Update quantum metrics
    const metrics = calculateQuantumMetrics();
    if (expectationZ) expectationZ.textContent = metrics.expectationZ.toFixed(3);
    if (entropy) entropy.textContent = metrics.entropy.toFixed(3);
    if (purity) purity.textContent = metrics.purity.toFixed(3);
    if (overlap) overlap.textContent = metrics.overlap.toFixed(3);
    
    // Update state name
    const stateNameEl = document.getElementById('blochState');
    if (stateNameEl) {
        stateNameEl.textContent = quantumState.getStateName();
    }
}

function resetToDefault() {
    thetaSlider.value = 90;
    phiSlider.value = 0;
    alphaInput.value = 0.707;
    betaInput.value = 0.707;
    phaseSlider.value = 0;
    entanglementSlider.value = 0;
    if (decoherenceSlider) decoherenceSlider.value = 0;
    if (coherenceSlider) coherenceSlider.value = 100;
    if (fidelitySlider) fidelitySlider.value = 100;
    
    quantumState = new QuantumState(90, 0, 0);
    updateAllDisplays();
    updateBlochSphere();
}

// Event listeners
if (thetaSlider) {
    thetaSlider.addEventListener('input', updateFromSliders);
    phiSlider.addEventListener('input', updateFromSliders);
    phaseSlider.addEventListener('input', updateFromSliders);
    entanglementSlider.addEventListener('input', updateAllDisplays);
    if (decoherenceSlider) decoherenceSlider.addEventListener('input', updateAllDisplays);
    if (coherenceSlider) coherenceSlider.addEventListener('input', updateAllDisplays);
    if (fidelitySlider) fidelitySlider.addEventListener('input', updateAllDisplays);
}

if (alphaInput) {
    alphaInput.addEventListener('input', updateFromAmplitudes);
    betaInput.addEventListener('input', updateFromAmplitudes);
}

if (resetButton) {
    resetButton.addEventListener('click', resetToDefault);
}

// Initialize displays
updateAllDisplays();

// Initialize computation display
function initializeComputationDisplay() {
    const computationContent = document.getElementById('computationContent');
    if (computationContent) {
        // Set initial state
        updateComputationStep(1, {
            label: 'Initial Quantum State',
            formula: '|ψ⟩ = α|0⟩ + β|1⟩',
            values: `α = ${quantumState.alpha.toFixed(4)}, β = ${quantumState.beta.toFixed(4)}`
        });
        
        updateComputationStep(2, {
            label: 'Base Probabilities',
            formula: 'P(|0⟩) = |α|², P(|1⟩) = |β|²',
            values: `P(|0⟩) = ${quantumState.prob0.toFixed(4)}, P(|1⟩) = ${quantumState.prob1.toFixed(4)}`
        });
        
        updateComputationStep(3, {
            label: 'Quantum Effects',
            formula: "P' = P + ε - δ, adjusted by fidelity F",
            values: 'Ready to apply quantum effects...'
        });
        
        updateComputationStep(4, {
            label: 'Measurement',
            formula: 'r < P(|0⟩) → |0⟩, else → |1⟩',
            values: 'Ready to measure...'
        });
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComputationDisplay);
} else {
    initializeComputationDisplay();
}

// ============================================
// Bloch Sphere 3D Visualization
// ============================================

let scene, camera, renderer, controls;
let sphere, stateVector, axesHelper;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

function initBlochSphere() {
    const container = document.getElementById('blochContainer');
    const canvas = document.getElementById('blochCanvas');
    
    if (!container || !canvas) {
        console.log('Bloch sphere container or canvas not found');
        return;
    }
    
    if (scene) {
        console.log('Bloch sphere already initialized');
        return;
    }
    
    // Check if THREE is available
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded');
        return;
    }
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b0f);
    
    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0x00eaff, 0.4);
    scene.add(ambientLight);
    
    // Add directional light for technical look
    const directionalLight = new THREE.DirectionalLight(0x00eaff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Add point light for highlights
    const pointLight = new THREE.PointLight(0x00ffff, 0.8, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);
    
    // Camera setup - ensure proper aspect ratio for sphere
    const width = container.clientWidth || 400;
    const height = (container.clientHeight - 100) || 300;
    
    if (width === 0 || height === 0) {
        console.log('Container has zero dimensions, retrying...');
        setTimeout(initBlochSphere, 200);
        return;
    }
    
    // Use a fixed aspect ratio or ensure the container maintains square-ish dimensions
    const aspect = width / height;
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    
    // Position camera to show sphere properly (not too close, not too far)
    // Use a distance that maintains sphere appearance
    const distance = 4;
    camera.position.set(distance, distance, distance);
    camera.lookAt(0, 0, 0);
    
    // Store initial camera distance for reference
    camera.userData.initialDistance = distance;
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });
    // Ensure square rendering area for proper sphere display
    const renderSize = Math.min(width, height);
    renderer.setSize(renderSize, renderSize);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0b0b0f, 1);
    
    // Adjust camera to match square aspect ratio for perfect sphere
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    
    // Basic camera controls (simplified version)
    // We'll use mouse interaction for rotation instead of OrbitControls
    controls = null; // We handle rotation manually
    
    // Create Bloch sphere
    createBlochSphere();
    
    // Mouse interaction
    setupMouseInteraction();
    
    // Animation loop
    animate();
    
    // Handle resize - maintain square aspect ratio for sphere
    const resizeHandler = () => {
        if (!container || !camera || !renderer) return;
        const newWidth = container.clientWidth || 400;
        const newHeight = (container.clientHeight - 100) || 300;
        if (newWidth > 0 && newHeight > 0) {
            // Use square aspect ratio to maintain sphere shape
            const renderSize = Math.min(newWidth, newHeight);
            camera.aspect = 1; // Always square for perfect sphere
            camera.updateProjectionMatrix();
            renderer.setSize(renderSize, renderSize);
            
            // Center the canvas if container is not square
            if (newWidth !== newHeight) {
                canvas.style.margin = '0 auto';
                canvas.style.display = 'block';
            }
        }
    };
    
    window.addEventListener('resize', resizeHandler);
    
    console.log('Bloch sphere initialized successfully');
}

function createBlochSphere() {
    // Main sphere (wireframe) - more visible and technical
    const sphereGeometry = new THREE.SphereGeometry(1, 48, 48);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x00eaff,
        wireframe: true,
        opacity: 0.7,
        transparent: true
    });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    
    // Add inner glow sphere for depth
    const innerSphereGeometry = new THREE.SphereGeometry(0.98, 32, 32);
    const innerSphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x00eaff,
        opacity: 0.15,
        transparent: true,
        side: THREE.BackSide
    });
    const innerSphere = new THREE.Mesh(innerSphereGeometry, innerSphereMaterial);
    scene.add(innerSphere);
    
    // Add outer rim for technical look
    const outerRimGeometry = new THREE.SphereGeometry(1.02, 32, 32);
    const outerRimMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        opacity: 0.3,
        transparent: true
    });
    const outerRim = new THREE.Mesh(outerRimGeometry, outerRimMaterial);
    scene.add(outerRim);
    
    // Axes - more technical and visible
    const axesLength = 1.3;
    
    // X axis (red) - thicker and brighter
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-axesLength, 0, 0),
        new THREE.Vector3(axesLength, 0, 0)
    ]);
    const xAxis = new THREE.Line(xAxisGeometry, new THREE.LineBasicMaterial({ 
        color: 0xff4444,
        linewidth: 3
    }));
    scene.add(xAxis);
    
    // Add arrow head for X axis
    const xArrowGeometry = new THREE.ConeGeometry(0.05, 0.15, 8);
    const xArrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    const xArrow = new THREE.Mesh(xArrowGeometry, xArrowMaterial);
    xArrow.position.set(axesLength, 0, 0);
    xArrow.rotation.z = -Math.PI / 2;
    scene.add(xArrow);
    
    // Y axis (green) - thicker and brighter
    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -axesLength, 0),
        new THREE.Vector3(0, axesLength, 0)
    ]);
    const yAxis = new THREE.Line(yAxisGeometry, new THREE.LineBasicMaterial({ 
        color: 0x44ff44,
        linewidth: 3
    }));
    scene.add(yAxis);
    
    // Add arrow head for Y axis
    const yArrowGeometry = new THREE.ConeGeometry(0.05, 0.15, 8);
    const yArrowMaterial = new THREE.MeshBasicMaterial({ color: 0x44ff44 });
    const yArrow = new THREE.Mesh(yArrowGeometry, yArrowMaterial);
    yArrow.position.set(0, axesLength, 0);
    scene.add(yArrow);
    
    // Z axis (blue) - thicker and brighter
    const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -axesLength),
        new THREE.Vector3(0, 0, axesLength)
    ]);
    const zAxis = new THREE.Line(zAxisGeometry, new THREE.LineBasicMaterial({ 
        color: 0x4444ff,
        linewidth: 3
    }));
    scene.add(zAxis);
    
    // Add arrow head for Z axis
    const zArrowGeometry = new THREE.ConeGeometry(0.05, 0.15, 8);
    const zArrowMaterial = new THREE.MeshBasicMaterial({ color: 0x4444ff });
    const zArrow = new THREE.Mesh(zArrowGeometry, zArrowMaterial);
    zArrow.position.set(0, 0, axesLength);
    zArrow.rotation.x = Math.PI / 2;
    scene.add(zArrow);
    
    // Labels
    addAxisLabels();
    
    // State vector (will be updated)
    updateStateVector();
    
    // Grid circles (equator, meridians)
    addGridCircles();
}

function addAxisLabels() {
    // Simple text representation using sprites or geometry
    // For simplicity, we'll use small spheres as markers
    const labelMaterial = new THREE.MeshBasicMaterial({ color: 0x00eaff });
    const labelGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    
    // X labels
    const xPos = new THREE.Mesh(labelGeometry, labelMaterial);
    xPos.position.set(1.3, 0, 0);
    scene.add(xPos);
    
    const xNeg = new THREE.Mesh(labelGeometry, labelMaterial);
    xNeg.position.set(-1.3, 0, 0);
    scene.add(xNeg);
    
    // Y labels
    const yPos = new THREE.Mesh(labelGeometry, labelMaterial);
    yPos.position.set(0, 1.3, 0);
    scene.add(yPos);
    
    const yNeg = new THREE.Mesh(labelGeometry, labelMaterial);
    yNeg.position.set(0, -1.3, 0);
    scene.add(yNeg);
    
    // Z labels
    const zPos = new THREE.Mesh(labelGeometry, labelMaterial);
    zPos.position.set(0, 0, 1.3);
    scene.add(zPos);
    
    const zNeg = new THREE.Mesh(labelGeometry, labelMaterial);
    zNeg.position.set(0, 0, -1.3);
    scene.add(zNeg);
}

function addGridCircles() {
    const circleMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00eaff, 
        opacity: 0.4, 
        transparent: true 
    });
    
    // Equator (XY plane) - more visible
    const equatorPoints = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        equatorPoints.push(new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0));
    }
    const equatorGeometry = new THREE.BufferGeometry().setFromPoints(equatorPoints);
    const equator = new THREE.Line(equatorGeometry, circleMaterial);
    scene.add(equator);
    
    // Add meridians for technical grid look
    for (let i = 0; i < 8; i++) {
        const meridianPoints = [];
        const phi = (i / 8) * Math.PI * 2;
        for (let j = 0; j <= 32; j++) {
            const theta = (j / 32) * Math.PI;
            const x = Math.sin(theta) * Math.cos(phi);
            const y = Math.sin(theta) * Math.sin(phi);
            const z = Math.cos(theta);
            meridianPoints.push(new THREE.Vector3(x, y, z));
        }
        const meridianGeometry = new THREE.BufferGeometry().setFromPoints(meridianPoints);
        const meridian = new THREE.Line(meridianGeometry, circleMaterial);
        scene.add(meridian);
    }
    
    // Add latitude circles for more technical appearance
    for (let i = 1; i < 4; i++) {
        const latPoints = [];
        const latAngle = (i / 4) * Math.PI;
        const radius = Math.sin(latAngle);
        const z = Math.cos(latAngle);
        for (let j = 0; j <= 64; j++) {
            const phi = (j / 64) * Math.PI * 2;
            latPoints.push(new THREE.Vector3(radius * Math.cos(phi), radius * Math.sin(phi), z));
        }
        const latGeometry = new THREE.BufferGeometry().setFromPoints(latPoints);
        const latCircle = new THREE.Line(latGeometry, circleMaterial);
        scene.add(latCircle);
        
        // Add symmetric circle below equator
        if (i < 3) {
            const latPoints2 = [];
            for (let j = 0; j <= 64; j++) {
                const phi = (j / 64) * Math.PI * 2;
                latPoints2.push(new THREE.Vector3(radius * Math.cos(phi), radius * Math.sin(phi), -z));
            }
            const latGeometry2 = new THREE.BufferGeometry().setFromPoints(latPoints2);
            const latCircle2 = new THREE.Line(latGeometry2, circleMaterial);
            scene.add(latCircle2);
        }
    }
}

function updateStateVector() {
    if (!scene) return;
    
    // Remove old state vector and all associated elements
    if (stateVector) {
        scene.remove(stateVector);
        if (stateVector.point) scene.remove(stateVector.point);
        if (stateVector.halo) scene.remove(stateVector.halo);
        if (stateVector.outerHalo) scene.remove(stateVector.outerHalo);
        if (stateVector.baseRing) scene.remove(stateVector.baseRing);
        if (stateVector.projXY) scene.remove(stateVector.projXY);
        if (stateVector.xMarker) scene.remove(stateVector.xMarker);
        if (stateVector.yMarker) scene.remove(stateVector.yMarker);
        if (stateVector.zMarker) scene.remove(stateVector.zMarker);
    }
    
    // Calculate state vector position on Bloch sphere
    // x = sin(θ)cos(φ), y = sin(θ)sin(φ), z = cos(θ)
    const x = Math.sin(quantumState.theta) * Math.cos(quantumState.phi);
    const y = Math.sin(quantumState.theta) * Math.sin(quantumState.phi);
    const z = Math.cos(quantumState.theta);
    
    // Create state vector line - thicker and more technical
    const vectorGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z)
    ]);
    const vectorMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ffff, 
        linewidth: 4 
    });
    stateVector = new THREE.Line(vectorGeometry, vectorMaterial);
    scene.add(stateVector);
    
    // Add base indicator ring
    const baseRingGeometry = new THREE.RingGeometry(0.15, 0.18, 16);
    const baseRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        side: THREE.DoubleSide,
        opacity: 0.6,
        transparent: true
    });
    const baseRing = new THREE.Mesh(baseRingGeometry, baseRingMaterial);
    baseRing.rotation.x = Math.PI / 2;
    scene.add(baseRing);
    stateVector.baseRing = baseRing;
    
    // Add glowing point at the end with multiple halos for technical look
    const pointGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const pointMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 2
    });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);
    point.position.set(x, y, z);
    scene.add(point);
    
    // Add inner halo
    const haloGeometry = new THREE.SphereGeometry(0.18, 16, 16);
    const haloMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        opacity: 0.4,
        transparent: true,
        side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.position.set(x, y, z);
    scene.add(halo);
    
    // Add outer halo for more technical appearance
    const outerHaloGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const outerHaloMaterial = new THREE.MeshBasicMaterial({
        color: 0x00eaff,
        opacity: 0.2,
        transparent: true,
        side: THREE.BackSide,
        wireframe: true
    });
    const outerHalo = new THREE.Mesh(outerHaloGeometry, outerHaloMaterial);
    outerHalo.position.set(x, y, z);
    scene.add(outerHalo);
    
    // Store references for updates
    stateVector.point = point;
    stateVector.halo = halo;
    stateVector.outerHalo = outerHalo;
    
    // Add projection lines to axes for technical visualization
    // Projection to XY plane
    const projXYGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(x, y, 0)
    ]);
    const projXYMaterial = new THREE.LineBasicMaterial({
        color: 0x00eaff,
        opacity: 0.3,
        transparent: true,
        linewidth: 1
    });
    const projXY = new THREE.Line(projXYGeometry, projXYMaterial);
    scene.add(projXY);
    stateVector.projXY = projXY;
    
    // Add coordinate markers at axes intersections
    const coordMarkerGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const coordMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    // X coordinate marker
    const xMarker = new THREE.Mesh(coordMarkerGeometry, coordMarkerMaterial);
    xMarker.position.set(x, 0, 0);
    scene.add(xMarker);
    stateVector.xMarker = xMarker;
    
    // Y coordinate marker
    const yMarker = new THREE.Mesh(coordMarkerGeometry, coordMarkerMaterial);
    yMarker.position.set(0, y, 0);
    scene.add(yMarker);
    stateVector.yMarker = yMarker;
    
    // Z coordinate marker
    const zMarker = new THREE.Mesh(coordMarkerGeometry, coordMarkerMaterial);
    zMarker.position.set(0, 0, z);
    scene.add(zMarker);
    stateVector.zMarker = zMarker;
}

function updateBlochSphere() {
    if (scene && stateVector) {
        updateStateVector();
    }
}

function setupMouseInteraction() {
    const canvas = document.getElementById('blochCanvas');
    if (!canvas) return;
    
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        // Convert mouse movement to theta and phi changes
        const sensitivity = 2;
        const newPhi = quantumState.phi + (deltaX * sensitivity * Math.PI / 180);
        const newTheta = quantumState.theta + (deltaY * sensitivity * Math.PI / 180);
        
        // Clamp theta to [0, π]
        const clampedTheta = Math.max(0, Math.min(Math.PI, newTheta));
        
        quantumState.phi = newPhi;
        quantumState.theta = clampedTheta;
        quantumState.updateAmplitudes();
        
        // Update sliders and inputs
        thetaSlider.value = (clampedTheta * 180 / Math.PI).toFixed(0);
        phiSlider.value = ((newPhi * 180 / Math.PI) % 360).toFixed(0);
        alphaInput.value = quantumState.alpha.toFixed(3);
        betaInput.value = quantumState.beta.toFixed(3);
        
        updateAllDisplays();
        updateBlochSphere();
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    // Optional: Add subtle rotation animation
    if (sphere && !isDragging) {
        sphere.rotation.y += 0.002;
    }
    
    // Animate the state vector point glow
    if (stateVector && stateVector.point) {
        const time = Date.now() * 0.001;
        stateVector.point.material.emissiveIntensity = 1.5 + Math.sin(time * 2) * 0.5;
        if (stateVector.halo) {
            stateVector.halo.material.opacity = 0.2 + Math.sin(time * 2) * 0.1;
        }
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Initialize Bloch sphere when quantum page becomes active
function checkAndInitBlochSphere() {
    const quantumPage = document.getElementById('quantumPage');
    if (quantumPage && quantumPage.classList.contains('active') && !scene) {
        // Try multiple times with increasing delays to ensure container is ready
        let attempts = 0;
        const tryInit = () => {
            attempts++;
            const container = document.getElementById('blochContainer');
            if (container && container.clientWidth > 0 && container.clientHeight > 0) {
                initBlochSphere();
            } else if (attempts < 10) {
                setTimeout(tryInit, 100);
            }
        };
        setTimeout(tryInit, 300);
    }
}

// Check on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInitBlochSphere);
} else {
    checkAndInitBlochSphere();
}

// Also initialize when page becomes active
const quantumPageEl = document.getElementById('quantumPage');
if (quantumPageEl) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                checkAndInitBlochSphere();
            }
        });
    });
    observer.observe(quantumPageEl, { attributes: true });
}

// Also check when explore button is clicked
const exploreBtn = document.getElementById('exploreButton');
if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
        setTimeout(checkAndInitBlochSphere, 600);
    });
}

