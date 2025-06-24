class YouTubeAudioPlayer {
    constructor() {
        this.player = null;
        this.audioContext = null;
        this.sourceNode = null;
        this.analyserNode = null;
        this.isVisualizerActive = false;
        
        this.initializeAudioContext();
    }

    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Web Audio API is not supported:', error);
        }
    }

    extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    loadVideo(url) {
        const videoId = this.extractVideoId(url);
        if (!videoId) {
            alert('有効なYouTube URLを入力してください');
            return;
        }

        if (this.player) {
            this.player.loadVideoById(videoId);
        } else {
            this.createPlayer(videoId);
        }
    }

    createPlayer(videoId) {
        this.player = new YT.Player('youtube-player', {
            height: '315',
            width: '560',
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'controls': 1,
                'rel': 0
            },
            events: {
                'onReady': this.onPlayerReady.bind(this),
                'onStateChange': this.onPlayerStateChange.bind(this)
            }
        });
    }

    onPlayerReady(event) {
        console.log('YouTube Player Ready');
        this.setupAudioConnection();
    }

    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            console.log('Video is playing');
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }
    }

    setupAudioConnection() {
        try {
            const iframe = document.querySelector('#youtube-player iframe');
            if (!iframe) {
                console.error('YouTube iframe not found');
                return;
            }

            const video = iframe.contentDocument?.querySelector('video') || 
                         iframe.contentWindow?.document?.querySelector('video');
            
            if (!video) {
                console.warn('直接的な音声アクセスができません。代替方法を使用します。');
                this.setupAlternativeAudioCapture();
                return;
            }

            this.sourceNode = this.audioContext.createMediaElementSource(video);
            this.analyserNode = this.audioContext.createAnalyser();
            
            this.analyserNode.fftSize = 2048;
            this.analyserNode.smoothingTimeConstant = 0.85;
            
            this.sourceNode.connect(this.analyserNode);
            this.analyserNode.connect(this.audioContext.destination);
            
            console.log('Audio connection established');
        } catch (error) {
            console.error('Audio setup failed:', error);
            this.setupAlternativeAudioCapture();
        }
    }

    setupAlternativeAudioCapture() {
        console.log('Setting up alternative audio capture method');
        
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        this.analyserNode.smoothingTimeConstant = 0.85;
        
        navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            } 
        }).then(stream => {
            this.sourceNode = this.audioContext.createMediaStreamSource(stream);
            this.sourceNode.connect(this.analyserNode);
            console.log('Microphone audio capture ready');
        }).catch(error => {
            console.error('Microphone access failed:', error);
            this.createDummyAnalyser();
        });
    }

    createDummyAnalyser() {
        console.log('Creating dummy analyser for demo');
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.analyserNode);
        oscillator.start();
    }

    getAnalyserNode() {
        return this.analyserNode;
    }

    isReady() {
        return this.analyserNode !== null;
    }
}

let youTubePlayer;

function onYouTubeIframeAPIReady() {
    console.log('YouTube IFrame API Ready');
    youTubePlayer = new YouTubeAudioPlayer();
    
    document.getElementById('load-video').addEventListener('click', () => {
        const url = document.getElementById('youtube-url').value;
        if (url) {
            youTubePlayer.loadVideo(url);
        }
    });
}