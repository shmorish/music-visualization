import React, { useRef, useEffect, useCallback } from 'react';
import { Box, styled } from '@mui/material';
import { VisualizationConfig, VisualizationData } from '@/types/audio';

interface WaveformCanvasProps {
  isActive: boolean;
  config: VisualizationConfig;
  audioData?: VisualizationData;
  width?: number;
  height?: number;
}

const Canvas = styled('canvas')({
  width: '100%',
  height: '100%',
  borderRadius: 8,
  background: '#000',
  display: 'block',
});

const Container = styled(Box)({
  background: 'rgba(0, 0, 0, 0.3)',
  borderRadius: 16,
  padding: 24,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  zIndex: 2,
});

const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  isActive,
  config,
  audioData,
  width = 400,
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>();

  const drawWaveform = useCallback((
    ctx: CanvasRenderingContext2D,
    data: Uint8Array,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.lineWidth = 2;
    ctx.strokeStyle = config.color;
    ctx.beginPath();

    const sliceWidth = canvasWidth / data.length;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0;
      const y = v * canvasHeight / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvasWidth, canvasHeight / 2);
    ctx.stroke();

    // Draw center line
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight / 2);
    ctx.lineTo(canvasWidth, canvasHeight / 2);
    ctx.stroke();
  }, [config.color]);

  const drawFrequency = useCallback((
    ctx: CanvasRenderingContext2D,
    data: Uint8Array,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const barWidth = canvasWidth / data.length;
    let x = 0;

    ctx.fillStyle = config.color;

    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * canvasHeight;
      ctx.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
      x += barWidth;
    }
  }, [config.color]);

  const generateDemoData = useCallback((): Uint8Array => {
    const bufferLength = 1024;
    const data = new Uint8Array(bufferLength);
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < bufferLength; i++) {
      if (config.type === 'waveform') {
        const wave1 = Math.sin(time * 2 + i * 0.02) * 30;
        const wave2 = Math.sin(time * 3 + i * 0.01) * 20;
        const wave3 = Math.sin(time * 5 + i * 0.005) * 10;
        data[i] = 128 + wave1 + wave2 + wave3;
      } else {
        const frequency = Math.sin(time + i * 0.1) * 127 + 128;
        data[i] = Math.max(0, Math.min(255, frequency));
      }
    }
    
    return data;
  }, [config.type]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    let dataToUse: Uint8Array;
    
    if (audioData && isActive) {
      dataToUse = config.type === 'waveform' ? audioData.timeData : audioData.frequencyData;
    } else {
      dataToUse = generateDemoData();
    }

    if (config.type === 'waveform') {
      drawWaveform(ctx, dataToUse, rect.width, rect.height);
    } else {
      drawFrequency(ctx, dataToUse, rect.width, rect.height);
    }

    if (isActive || !audioData) {
      animationIdRef.current = requestAnimationFrame(draw);
    }
  }, [isActive, config, audioData, drawWaveform, drawFrequency, generateDemoData]);

  useEffect(() => {
    if (isActive || !audioData) {
      draw();
    } else if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isActive, draw, audioData]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        draw();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  return (
    <Container>
      <Canvas
        ref={canvasRef}
        width={width}
        height={height}
      />
    </Container>
  );
};

export default WaveformCanvas;