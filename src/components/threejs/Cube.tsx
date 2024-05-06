// Cube.tsx
import * as THREE from 'three';
import { Octahedron } from '@react-three/drei';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { RapierRigidBody, RigidBody } from '@react-three/rapier';

type CubeProps = {
    position: [number, number, number];
};

const Cube = React.forwardRef<{ triggerHoverEffect: () => void, removeHoverEffect: () => void }, CubeProps>((props, ref) => {
    const [hovered, setHovered] = useState(false);
    const lightRef = useRef<THREE.PointLight>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
    const RigidBodyRef = useRef<RapierRigidBody>(null);

    useImperativeHandle(ref, () => ({
        triggerHoverEffect: () => {
            setHovered(true);
        },
        removeHoverEffect: () => {
            setHovered(false);
        }
    }));

    useEffect(() => {
        if (hovered) {
            RigidBodyRef?.current?.applyImpulse({ x: 0, y: 1, z: 0 }, true);
            const fadeInColor = new THREE.Color('white');
            const fadeInEmissive = new THREE.Color('orange');
            const fadeInEmissiveIntensity = 2;
            const fadeInPower = 100;

            const fadeOutColor = new THREE.Color('white');
            const fadeOutEmissive = new THREE.Color('black');
            const fadeOutEmissiveIntensity = 0;
            const fadeOutPower = 0;

            let animationFrameId: number;
            let startTime: number;

            const animateMaterial = (currentTime: number) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / 200, 1);

                materialRef.current!.color.lerpColors(fadeOutColor, fadeInColor, progress);
                materialRef.current!.emissive.lerpColors(fadeOutEmissive, fadeInEmissive, progress);
                materialRef.current!.emissiveIntensity = THREE.MathUtils.lerp(fadeOutEmissiveIntensity, fadeInEmissiveIntensity, progress);

                lightRef.current!.intensity = THREE.MathUtils.lerp(0, 10, progress);
                lightRef.current!.power = THREE.MathUtils.lerp(fadeOutPower, fadeInPower, progress);

                if (progress < 1) {
                    animationFrameId = requestAnimationFrame(animateMaterial);
                }
            };

            startTime = performance.now();
            animationFrameId = requestAnimationFrame(animateMaterial);

            return () => {
                cancelAnimationFrame(animationFrameId);

                const fadeOutMaterial = (currentTime: number) => {
                    const elapsedTime = currentTime - startTime;
                    const progress = Math.min(elapsedTime / 1500, 1);

                    materialRef.current!.color.lerpColors(fadeInColor, fadeOutColor, progress);
                    materialRef.current!.emissive.lerpColors(fadeInEmissive, fadeOutEmissive, progress);
                    materialRef.current!.emissiveIntensity = THREE.MathUtils.lerp(fadeInEmissiveIntensity, fadeOutEmissiveIntensity, progress);

                    lightRef.current!.intensity = THREE.MathUtils.lerp(10, 0, progress);
                    lightRef.current!.power = THREE.MathUtils.lerp(fadeInPower, fadeOutPower, progress);

                    if (progress < 1) {
                        animationFrameId = requestAnimationFrame(fadeOutMaterial);
                    }
                };

                startTime = performance.now();
                animationFrameId = requestAnimationFrame(fadeOutMaterial);
            };
        }
    }, [hovered]);

    return (
        <RigidBody ref={RigidBodyRef} position={props.position} colliders={"hull"}>
            <Octahedron
                args={[1, 0]}
                castShadow
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshPhysicalMaterial
                    ref={materialRef}
                    color="white"
                    emissive="black"
                    emissiveIntensity={0}
                    metalness={0}
                    roughness={0}
                    clearcoat={1}
                    transmission={0.9}
                    reflectivity={0.9}
                    ior={1.5}
                    thickness={0.01}
                />
                <pointLight
                    ref={lightRef}
                    intensity={0}
                    distance={10}
                    decay={2}
                    color="orange"
                    power={0}
                />
            </Octahedron>
        </RigidBody>
    );
});

export default Cube;