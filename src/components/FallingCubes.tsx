import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Physics, useBox, type BoxProps } from '@react-three/cannon';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

interface CubeProps extends BoxProps {

}

const Cube: React.FC<CubeProps> = ({ ...props }) => {
    const [ref, api] = useBox(() => ({
        mass: 1,
        args: [0.5, 0.5, 0.5],
        material: {
            friction: 0.5,
            restitution: 0.7,
        },
        ...props,
    }));

    const [hovered, setHovered] = useState(false);

    return (
        <mesh
            ref={ref as React.RefObject<THREE.Mesh>}
            castShadow
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => {setHovered(false)}}
        >
            <boxGeometry attach="geometry" args={[1, 1, 1]} />
            <meshPhysicalMaterial
                attach="material"
                color={hovered ? 'white' : 'gray'}
                emissive={hovered ? 'orange' : 'black'}
                emissiveIntensity={hovered ? 2 : 0}
                metalness={0}
                roughness={0}
                clearcoat={0}
                transmission={1}
                clearcoatRoughness={0}
                thickness={1}
            />
            {hovered && (
                <pointLight
                    intensity={10}
                    distance={10}
                    decay={1}
                    color="orange"
                    castShadow
                />
            )}
        </mesh>
    );
};

const InvisibleFloor: React.FC = () => {
    const [ref] = useBox(() => ({
        type: 'Static',
        position: [0, -5, 0],
        args: [100, 0.1, 100],
        material: {
            friction: 0.5,
            restitution: 0.7,
        },
    }));

    return (
        <mesh ref={ref as React.RefObject<THREE.Mesh>} receiveShadow>
            <boxGeometry attach="geometry" args={[100, 0.1, 100]} />
            <meshPhysicalMaterial
                attach="material"
                color="white"
                metalness={0.5}
                roughness={0.5}
                clearcoat={1}
                clearcoatRoughness={0}
                transparent
                opacity={0.1}
            />
        </mesh>
    );
};

const Cubes: React.FC = () => {
    const cubeCount = 10;

    return (
        <>
            {Array.from({ length: cubeCount }, (_, index) => (
                <Cube key={index} position={[Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 3 - 5]} />
            ))}
        </>
    );
};

const FallingCubesScene: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
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
    }, []);

    return (
        <Canvas ref={canvasRef} style={{ background: 'transparent' }} shadows>
            <ambientLight intensity={0.5} />
            <spotLight
                position={[0, 10, 0]}
                angle={Math.PI / 4}
                penumbra={1}
                intensity={1}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />
            <Physics gravity={[0, -9.81, 0]}>
                <Cubes />
                <InvisibleFloor />
            </Physics>
            <EffectComposer>
                <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
            </EffectComposer>
        </Canvas>
    );
};

export default FallingCubesScene;