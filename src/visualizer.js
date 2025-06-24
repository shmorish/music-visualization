class AudioVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.analyserNode = null;
        this.isRunning = false;
        this.animationId = null;
        
        this.bufferLength = 0;
        this.dataArray = null;
        this.frequencyArray = null;
        
        this.visualizationType = 'waveform';
        this.color = '#00ff00';
        
        this.setupCanvas();
    }

    setupCanvas() {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * devicePixelRatio;
        this.canvas.height = rect.height * devicePixelRatio;
        
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.width = rect.width;
        this.height = rect.height;
    }

    setAnalyser(analyserNode) {
        this.analyserNode = analyserNode;
        this.bufferLength = analyserNode.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.frequencyArray = new Uint8Array(this.bufferLength);
    }

    setVisualizationType(type) {
        this.visualizationType = type;
    }

    setColor(color) {
        this.color = color;
    }

    start() {
        if (!this.analyserNode) {
            console.error('Analyser node not set');
            return;
        }
        
        this.isRunning = true;
        this.draw();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.clearCanvas();
    }

    draw() {
        if (!this.isRunning) return;

        this.animationId = requestAnimationFrame(() => this.draw());

        if (this.visualizationType === 'waveform') {
            this.drawWaveform();
        } else if (this.visualizationType === 'frequency') {
            this.drawFrequency();
        }
    }

    drawWaveform() {
        this.analyserNode.getByteTimeDomainData(this.dataArray);

        this.clearCanvas();

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.color;
        this.ctx.beginPath();

        const sliceWidth = this.width / this.bufferLength;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = v * this.height / 2;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.stroke();

        this.drawCenterLine();
    }

    drawFrequency() {
        this.analyserNode.getByteFrequencyData(this.frequencyArray);

        this.clearCanvas();

        const barWidth = this.width / this.bufferLength;
        let x = 0;

        this.ctx.fillStyle = this.color;

        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = (this.frequencyArray[i] / 255) * this.height;

            this.ctx.fillRect(x, this.height - barHeight, barWidth, barHeight);

            x += barWidth;
        }
    }

    drawCenterLine() {
        this.ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height / 2);
        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.stroke();
    }

    clearCanvas() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    generateDemoWaveform() {
        if (!this.dataArray) {
            this.bufferLength = 1024;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.frequencyArray = new Uint8Array(this.bufferLength);
        }

        const time = Date.now() * 0.001;
        
        for (let i = 0; i < this.bufferLength; i++) {
            if (this.visualizationType === 'waveform') {
                const wave1 = Math.sin(time * 2 + i * 0.02) * 30;
                const wave2 = Math.sin(time * 3 + i * 0.01) * 20;
                const wave3 = Math.sin(time * 5 + i * 0.005) * 10;
                this.dataArray[i] = 128 + wave1 + wave2 + wave3;
            } else {
                const frequency = Math.sin(time + i * 0.1) * 127 + 128;
                this.frequencyArray[i] = Math.max(0, Math.min(255, frequency));
            }
        }

        if (this.visualizationType === 'waveform') {
            this.drawWaveform();
        } else {
            this.drawFrequency();
        }
    }

    startDemo() {
        this.isRunning = true;
        this.drawDemo();
    }

    drawDemo() {
        if (!this.isRunning) return;

        this.animationId = requestAnimationFrame(() => this.drawDemo());
        this.generateDemoWaveform();
    }
}