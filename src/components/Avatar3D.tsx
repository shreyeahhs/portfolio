import { useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    const modelRef = useRef<THREE.Group>(null);
    const { viewport } = useThree();

    useFrame((state) => {
        if (modelRef.current) {
            // Create a target rotation based on mouse position
            // state.mouse.x/y range from -1 to 1
            const targetRotationY = state.mouse.x * (Math.PI / 4); // max 45 degrees
            const targetRotationX = -state.mouse.y * (Math.PI / 8); // max 22.5 degrees

            // Smoothly rotate the model towards the target
            modelRef.current.rotation.y = THREE.MathUtils.lerp(
                modelRef.current.rotation.y,
                targetRotationY,
                0.1
            );
            modelRef.current.rotation.x = THREE.MathUtils.lerp(
                modelRef.current.rotation.x,
                targetRotationX,
                0.1
            );
        }
    });

    return (
        <primitive
            ref={modelRef}
            object={scene}
            scale={2.5}
            position={[0, -2, 0]}
            rotation={[0, 0, 0]}
        />
    );
}

const Avatar3D = () => {
    return (
        <div className="w-full h-[300px] md:h-[450px] relative cursor-pointer">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <Suspense fallback={null}>
                    <Model url="/Meshy_AI_Animation_Walking_withSkin.gltf" />
                    <Environment preset="city" />
                    <ContactShadows
                        position={[0, -2.01, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2.5}
                        far={4}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Avatar3D;
