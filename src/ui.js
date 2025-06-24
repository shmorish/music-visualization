class UIController {
    constructor() {
        this.visualizer = null;
        this.isVisualizerRunning = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeVisualizer();
    }

    initializeElements() {
        this.toggleButton = document.getElementById('toggle-visualizer');
        this.waveformTypeSelect = document.getElementById('waveform-type');
        this.colorPicker = document.getElementById('color-picker');
        this.urlInput = document.getElementById('youtube-url');
        this.loadButton = document.getElementById('load-video');
    }

    setupEventListeners() {
        this.toggleButton.addEventListener('click', () => this.toggleVisualizer());
        
        this.waveformTypeSelect.addEventListener('change', (e) => {
            if (this.visualizer) {
                this.visualizer.setVisualizationType(e.target.value);
            }
        });

        this.colorPicker.addEventListener('change', (e) => {
            if (this.visualizer) {
                this.visualizer.setColor(e.target.value);
            }
        });

        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadButton.click();
            }
        });

        window.addEventListener('resize', () => {
            if (this.visualizer) {
                this.visualizer.setupCanvas();
            }
        });
    }

    initializeVisualizer() {
        this.visualizer = new AudioVisualizer('visualizer-canvas');
        this.visualizer.setColor(this.colorPicker.value);
        this.visualizer.setVisualizationType(this.waveformTypeSelect.value);
    }

    toggleVisualizer() {
        if (!this.isVisualizerRunning) {
            this.startVisualizer();
        } else {
            this.stopVisualizer();
        }
    }

    startVisualizer() {
        if (youTubePlayer && youTubePlayer.isReady()) {
            const analyserNode = youTubePlayer.getAnalyserNode();
            if (analyserNode) {
                this.visualizer.setAnalyser(analyserNode);
                this.visualizer.start();
                this.isVisualizerRunning = true;
                this.updateVisualizerButton(true);
                this.startBeatAnimation();
                return;
            }
        }

        console.log('Audio analyser not available, starting demo mode');
        this.visualizer.startDemo();
        this.isVisualizerRunning = true;
        this.updateVisualizerButton(true, true);
        this.startBeatAnimation();
    }

    stopVisualizer() {
        this.visualizer.stop();
        this.isVisualizerRunning = false;
        this.updateVisualizerButton(false);
        this.stopBeatAnimation();
    }

    updateVisualizerButton(isRunning, isDemoMode = false) {
        const icon = this.toggleButton.querySelector('.material-icons');
        const text = document.querySelector('.control-text');
        
        if (isRunning) {
            icon.textContent = 'stop';
            text.textContent = isDemoMode ? 'Stop Visualization (Demo)' : 'Stop Visualization';
            this.toggleButton.style.background = '#f44336';
        } else {
            icon.textContent = 'graphic_eq';
            text.textContent = 'Start Visualization';
            this.toggleButton.style.background = 'var(--md-sys-color-primary)';
        }
    }

    startBeatAnimation() {
        const beatContainer = document.querySelector('.beat-visualization');
        if (beatContainer) {
            beatContainer.classList.add('beat-active');
        }
    }

    stopBeatAnimation() {
        const beatContainer = document.querySelector('.beat-visualization');
        if (beatContainer) {
            beatContainer.classList.remove('beat-active');
        }
    }

    showStatus(message, type = 'info') {
        const statusElement = document.createElement('div');
        statusElement.className = `status-message ${type}`;
        statusElement.textContent = message;
        
        document.body.appendChild(statusElement);
        
        setTimeout(() => {
            if (statusElement.parentNode) {
                statusElement.parentNode.removeChild(statusElement);
            }
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new UIController();
});