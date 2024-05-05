import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from "@react-three/rapier";
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from '@react-three/postprocessing';
import { Preload } from '@react-three/drei';
import Cube from './Cube';

const Wall: React.FC<{ position: [number, number, number], size: [number, number, number] }> = ({ position, size }) => {
    return (
        <RigidBody type="fixed" position={position}>
            <mesh receiveShadow>
                <boxGeometry attach="geometry" args={size} />
                <meshPhysicalMaterial
                    attach="material"
                    color="white"
                    metalness={1}
                    roughness={0.5}
                    clearcoat={1}
                    clearcoatRoughness={0}
                    transparent
                    opacity={0.05}
                />
            </mesh>
        </RigidBody>
    );
};

const Cubes: React.FC = () => {
    const cubeCount = 20;
    function randomPos(): [number, number, number] {
        const posx = Math.random() * 28 - 14;
        const posy = Math.random() * 8 - 4;
        const posz = Math.random() * 28 - 14;
        return [posx, posy, posz];
    }

    return (
        <>
            {Array.from({ length: cubeCount }, (_, index) => (
                <Cube key={index} position={randomPos()} />
            ))}
        </>
    );
};

const FallingCubesScene: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useMemo(() => {
        const canvas = canvasRef.current;

        const handleContextLost = (event: Event) => {
            event.preventDefault();
            console.log('WebGL context lost. Waiting for restore.');
        };

        const handleContextRestored = () => {
            console.log('WebGL context restored.');
        };

        canvas?.addEventListener('webglcontextlost', handleContextLost);
        canvas?.addEventListener('webglcontextrestored', handleContextRestored);

        return () => {
            canvas?.removeEventListener('webglcontextlost', handleContextLost);
            canvas?.removeEventListener('webglcontextrestored', handleContextRestored);
        };
    }, [canvasRef.current]);

    return (
        <Canvas
            ref={canvasRef}
            shadows
            dpr={0.6}
        >
            <ambientLight intensity={0.5} />
            <Preload all />
            <Physics gravity={[0, -0.5, 0]}>
                <Cubes />
                <Wall position={[0, -5, 0]} size={[50, 0.1, 30]} />
                <Wall position={[0, 5, 0]} size={[50, 0.1, 30]} />
                <Wall position={[15, 0, 0]} size={[0.1, 10, 30]} />
                <Wall position={[-15, 0, 0]} size={[0.1, 10, 30]} />
                <Wall position={[0, 0, -15]} size={[50, 10, 0.1]} />
                <Wall position={[0, 0, 0]} size={[50, 10, 0.1]} />
            </Physics>

            <EffectComposer multisampling={0}>
                <DepthOfField
                    focusDistance={0}
                    focalLength={0.02}
                    bokehScale={2}
                    height={480}
                />
                <Bloom
                    luminanceThreshold={0}
                    luminanceSmoothing={0.9}
                    height={300}
                    opacity={3}
                />
                <Noise opacity={0.025} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </Canvas>
    );
};

export default FallingCubesScene;