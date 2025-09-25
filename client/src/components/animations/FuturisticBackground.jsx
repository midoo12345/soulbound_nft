import React, { useEffect, useRef } from 'react';

// intensity: 'low' | 'normal' | 'high'
const FuturisticBackground = ({ intensity = 'normal', fps = 60 }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const isVisibleRef = useRef(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Responsive canvas setup
        const setCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
        };
        setCanvasSize();

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        ctx.scale(dpr, dpr);

        // Detail presets
        const presets = {
            low: { nodeCount: 28, streamCount: 10, gridSize: 120, linkDist: 120 },
            normal: { nodeCount: 44, streamCount: 16, gridSize: 100, linkDist: 150 },
            high: { nodeCount: 64, streamCount: 22, gridSize: 90, linkDist: 170 },
        };
        const p = presets[intensity] || presets.normal;

        // Neural network nodes
        const nodes = Array.from({ length: p.nodeCount }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            pulse: Math.random() * Math.PI * 2
        }));

        // Data streams
        const streams = Array.from({ length: p.streamCount }, () => ({
            x: Math.random() * window.innerWidth,
            y: -50,
            speed: Math.random() * 2 + 1,
            length: Math.random() * 100 + 50,
            opacity: Math.random() * 0.8 + 0.2
        }));

        let lastTime = 0;
        const frameInterval = 1000 / Math.max(10, Math.min(60, fps));

        const animate = (time) => {
            if (!isVisibleRef.current) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }
            if (time - lastTime < frameInterval) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }
            lastTime = time;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            
            // Holographic grid
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
            ctx.lineWidth = 0.5;
            const gridSize = p.gridSize;
            for (let x = 0; x < window.innerWidth; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, window.innerHeight);
                ctx.stroke();
            }
            for (let y = 0; y < window.innerHeight; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(window.innerWidth, y);
                ctx.stroke();
            }

            // Neural network connections
            nodes.forEach((node, i) => {
                nodes.forEach((otherNode, j) => {
                    if (i !== j) {
                        const dx = node.x - otherNode.x;
                        const dy = node.y - otherNode.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < p.linkDist) {
                            const opacity = (p.linkDist - distance) / p.linkDist * 0.28;
                            // Multi-hue link for more color
                            const hue = 180 + (i * 7 + j * 13) % 120; // 180-300 range
                            ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${opacity})`;
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(otherNode.x, otherNode.y);
                            ctx.stroke();
                        }
                    }
                });
            });

            // Animate nodes
            nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;
                node.pulse += 0.02;
                
                if (node.x < 0 || node.x > window.innerWidth) node.vx *= -1;
                if (node.y < 0 || node.y > window.innerHeight) node.vy *= -1;
                
                // Clamp pulseSize to a minimum positive value
                const pulseSize = Math.max(node.size + Math.sin(node.pulse) * 2, 0.1);
                const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseSize);
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.85)'); // blue
                gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.45)'); // cyan
                gradient.addColorStop(1, 'rgba(147, 51, 234, 0.22)'); // violet
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
                ctx.fill();
            });

            // Data streams
            streams.forEach(stream => {
                stream.y += stream.speed;
                if (stream.y > window.innerHeight + stream.length) {
                    stream.y = -stream.length;
                    stream.x = Math.random() * window.innerWidth;
                }

                const gradient = ctx.createLinearGradient(0, stream.y - stream.length, 0, stream.y);
                gradient.addColorStop(0, 'rgba(34, 211, 238, 0)');
                gradient.addColorStop(0.5, `rgba(34, 211, 238, ${stream.opacity})`);
                gradient.addColorStop(1, 'rgba(99, 102, 241, 0)'); // indigo
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(stream.x, stream.y - stream.length);
                ctx.lineTo(stream.x, stream.y);
                ctx.stroke();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        const handleResize = () => {
            setCanvasSize();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        const onVisibility = () => {
            isVisibleRef.current = document.visibilityState === 'visible';
        };
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none select-none z-0"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 0
            }}
        />
    );
};

export default FuturisticBackground; 