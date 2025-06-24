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
                this.toggleButton.textContent = '波形表示を停止';
                this.toggleButton.style.backgroundColor = '#ff4444';
                return;
            }
        }

        console.log('Audio analyser not available, starting demo mode');
        this.visualizer.startDemo();
        this.isVisualizerRunning = true;
        this.toggleButton.textContent = '波形表示を停止 (デモモード)';
        this.toggleButton.style.backgroundColor = '#ff4444';
    }

    stopVisualizer() {
        this.visualizer.stop();
        this.isVisualizerRunning = false;
        this.toggleButton.textContent = '波形表示を開始';
        this.toggleButton.style.backgroundColor = '#4CAF50';
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