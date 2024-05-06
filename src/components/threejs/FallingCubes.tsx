import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from "@react-three/rapier";
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from '@react-three/postprocessing';
import { Preload } from '@react-three/drei';
import Cube from './Cube';
import type { CubeRef } from './Cube';


const Wall: React.FC<{ position: [number, number, number], size: [number, number, number] }> = ({ position, size }) => {
    return (
        <RigidBody type="fixed" position={position} ccd={true} restitution={0.4}>
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
        const posz = -10;
        return [posx, posy, posz];
    }
    function randomRotation(): [number, number, number] {
        const rotx = Math.random() * 2 * Math.PI;
        const roty = Math.random() * 2 * Math.PI;
        const rotz = Math.random() * 2 * Math.PI;
        return [rotx, roty, rotz];
    }
    const prevScrollPos = useRef(0);
    const cubeRefs = useRef<React.RefObject<CubeRef>[]>(
        Array.from({ length: cubeCount }, () => React.createRef<CubeRef>())
    );
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.scrollY;
            const scrollThreshold = 1; // Adjust this value as needed

            if (Math.abs(currentScrollPos - prevScrollPos.current) > scrollThreshold) {
                if (debounceTimeoutRef.current) {
                    clearTimeout(debounceTimeoutRef.current);
                }
                cubeRefs.current.forEach((cubeRef) => {
                    cubeRef.current?.triggerHoverEffect();
                });

                debounceTimeoutRef.current = setTimeout(() => {
                    cubeRefs.current.forEach((cubeRef) => {
                        cubeRef.current?.removeHoverEffect();
                    });
                }, 200);

                prevScrollPos.current = currentScrollPos;
            }
        };

        const initialScrollPos = window.scrollY;

        if (initialScrollPos > 0) {
            cubeRefs.current.forEach((cubeRef) => {
                cubeRef.current?.triggerHoverEffect();
            });

            debounceTimeoutRef.current = setTimeout(() => {
                cubeRefs.current.forEach((cubeRef) => {
                    cubeRef.current?.removeHoverEffect();
                });
            }, 200);
        }

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            cubeRefs.current.forEach((cubeRef) => {
                cubeRef.current?.removeHoverEffect();
            });
        };
    }, []);

    return (
        <>
            {Array.from({ length: cubeCount }, (_, index) => (
                <Cube key={index} position={randomPos()} ref={cubeRefs.current[index]} rotation={randomRotation()} />
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
            dpr={0.8}
        >
            <ambientLight intensity={0.5} />
            <Preload all />
            <Physics gravity={[0, -0.5, 0]}>

                <Wall position={[0, -5, 0]} size={[30, 0.1, 30]} />
                <Wall position={[0, 5, 0]} size={[30, 0.1, 30]} />
                <Wall position={[15, 0, 0]} size={[0.1, 10, 30]} />
                <Wall position={[-15, 0, 0]} size={[0.1, 10, 30]} />
                <Wall position={[0, 0, -15]} size={[30, 10, 0.1]} />
                <Wall position={[5, 0, 0]} size={[60, 10, 0.1]} />
                <Cubes />
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