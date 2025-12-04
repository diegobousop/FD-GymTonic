import React, { useMemo, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Html, OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const ThemeColors = {
    background: '#161616',
    primary: '#ff0000',
    accent: '#ff0000', // Neon green-ish
    secondary: '#6b7280',
    text: '#ffffff'
};

const DataPoint = ({ position, value, label, isHovered, onHover, delay = 0 }) => {
    const [active, setActive] = useState(false);
    const meshRef = useRef();
    const targetPos = useRef(position);
    
    useFrame((state) => {
        if (active) {
            // Pulse effect could be added here if needed
        }
        
        // Animation: Grow from center to position
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();
            // Start animation after delay
            const progress = THREE.MathUtils.clamp((time - delay) * 2, 0, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            
            meshRef.current.position.lerp(targetPos.current, 0.1);
            // Also scale up from 0
            const targetScale = isHovered ? 0.25 : 0.15;
            const currentScale = meshRef.current.scale.x;
            const newScale = THREE.MathUtils.lerp(currentScale, targetScale * ease, 0.1);
            meshRef.current.scale.setScalar(newScale);
        }
    });

    // Update target position when prop changes
    useMemo(() => {
        targetPos.current = position;
    }, [position]);

    return (
        <group ref={meshRef} position={[0,0,0]}> {/* Start at center */}
            <Sphere 
                args={[1, 16, 16]} // Base size 1, scaled down
                onPointerOver={(e) => { e.stopPropagation(); onHover(true); setActive(true); }}
                onPointerOut={(e) => { onHover(false); setActive(false); }}
                onClick={() => setActive(!active)}
            >
                <meshStandardMaterial 
                    color={isHovered ? ThemeColors.accent : ThemeColors.primary} 
                    emissive={isHovered ? ThemeColors.accent : '#000000'}
                    emissiveIntensity={isHovered ? 2 : 0}
                />
            </Sphere>
            {isHovered && (
                <Html position={[0, 0.4, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
                    <div className="bg-gray-900/90 p-3 rounded-lg shadow-xl border border-gray-700 backdrop-blur-md min-w-[120px] text-center transform transition-all duration-200">
                        <div className="text-white font-bold text-sm mb-1 font-sans">{label}</div>
                        <div className="text-green-400 text-xs font-mono">{value} reps</div>
                    </div>
                </Html>
            )}
        </group>
    );
};

const PentagramChart = ({ data }) => {
    const radius = 2.5; // Reduced radius for smaller chart
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const groupRef = useRef();

    // Animation for the whole chart (convolution/expansion)
    useFrame((state) => {
        if (groupRef.current) {
            const time = state.clock.getElapsedTime();
            const progress = THREE.MathUtils.clamp(time * 1.5, 0, 1);
            const ease = 1 - Math.pow(1 - progress, 4); // Ease out quart

            // Scale up
            groupRef.current.scale.setScalar(ease);
            
            // Rotate slightly (convolution effect)
            // Start rotated by -PI/4 and rotate to 0
            groupRef.current.rotation.z = THREE.MathUtils.lerp(-Math.PI / 4, 0, ease);

            // Movement along Z axis (depth)
            groupRef.current.position.z = THREE.MathUtils.lerp(-5, 0, ease);
        }
    });

    // Calculate max value for normalization
    const maxVal = useMemo(() => Math.max(...data.map(d => d.executionCount), 1), [data]);

    // Calculate vertices for the pentagon (outer shape)
    const vertices = useMemo(() => {
        const pts = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; // Start from top
            pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
        }
        return pts;
    }, [radius]);

    // Calculate vertices for the data shape (inner shape)
    const dataVertices = useMemo(() => {
        return vertices.map((v, i) => {
            const val = data[i]?.executionCount || 0;
            const normalized = val / maxVal;
            // Scale vector by normalized value (min 0.2 to show something)
            return v.clone().multiplyScalar(Math.max(normalized, 0.1)); 
        });
    }, [vertices, data, maxVal]);

    // Lines for the outer pentagon (unused but kept for reference logic if needed, or remove)
    // const outerLines = useMemo(() => [...vertices, vertices[0]], [vertices]);
    
    // Lines for the data shape
    const dataLines = useMemo(() => [...dataVertices, dataVertices[0]], [dataVertices]);

    // Lines from center to vertices (spokes)
    const spokes = useMemo(() => {
        return vertices.map(v => [new THREE.Vector3(0,0,0), v]);
    }, [vertices]);

    // Grid levels (25%, 50%, 75%, 100%)
    const levels = [0.25, 0.5, 0.75, 1];

    return (
        <group ref={groupRef}>
            {/* Grid Lines (Concentric Pentagons) */}
            {levels.map((level, idx) => (
                <group key={`grid-${idx}`}>
                    <Line 
                        points={[...vertices.map(v => v.clone().multiplyScalar(level)), vertices[0].clone().multiplyScalar(level)]} 
                        color={ThemeColors.secondary} 
                        lineWidth={1} 
                        transparent 
                        opacity={0.15} 
                    />
                    {/* Axis Labels along the top spoke */}
                    <Html position={new THREE.Vector3(0, radius * level, 0)} center zIndexRange={[0, 0]}>
                        <div className="text-[10px] text-gray-500 font-mono bg-[#161616]/80 px-1 rounded">
                            {Math.round(maxVal * level)}
                        </div>
                    </Html>
                </group>
            ))}
            
            {/* Spokes */}
            {spokes.map((spoke, i) => (
                <Line key={`spoke-${i}`} points={spoke} color={ThemeColors.secondary} lineWidth={1} transparent opacity={0.2} />
            ))}

            {/* Exercise Images at Vertices */}
            {vertices.map((pos, i) => (
                <Html key={`img-${i}`} position={pos} center distanceFactor={10} zIndexRange={[100, 0]}>
                    <div className="flex flex-col items-center justify-center transform translate-y-[-50%]">
                        <div className="w-8 h-8 bg-white rounded-md shadow-lg mb-1 flex items-center justify-center overflow-hidden border-2 border-gray-700">
                            {/* Placeholder white image/div as requested */}
                            <div className="w-full h-full bg-white" />
                        </div>
                        <div className="text-[10px] text-gray-400 font-sans bg-black/50 px-1 rounded backdrop-blur-sm whitespace-nowrap">
                            {data[i]?.name}
                        </div>
                    </div>
                </Html>
            ))}

            {/* Data Shape */}
            <Line points={dataLines} color={ThemeColors.accent} lineWidth={3} />

            {/* Interactive Points */}
            {dataVertices.map((pos, i) => (
                <DataPoint 
                    key={i} 
                    position={pos} 
                    value={data[i]?.executionCount} 
                    label={data[i]?.name}
                    isHovered={hoveredIndex === i}
                    onHover={(isHovering) => setHoveredIndex(isHovering ? i : null)}
                    delay={0.5 + i * 0.1} // Staggered animation
                />
            ))}
        </group>
    );
};

const StatsChartCard = ({ title, subtitle, data }) => {
    return (
        <div className="flex-1 flex flex-col bg-[#161616] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a1a1a]">
                <h3 className="text-xl font-bold text-white font-sans tracking-wide">
                    {title}
                </h3>
                <span className="text-xs text-gray-500 uppercase tracking-wider border border-gray-700 px-2 py-1 rounded">
                    {subtitle}
                </span>
            </div>
            
            <div className="flex-grow relative min-h-[300px]">
                <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                    <color attach="background" args={[ThemeColors.background]} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    
                    <PentagramChart data={data} />
                    
                    <OrbitControls 
                        enableZoom={false} 
                        minDistance={5} 
                        maxDistance={10} 
                        enablePan={false}
                        // Restrict rotation significantly
                        minAzimuthAngle={-Math.PI / 6} // +/- 30 degrees horizontal
                        maxAzimuthAngle={Math.PI / 6}
                        minPolarAngle={Math.PI / 2.5} // Restrict vertical angle
                        maxPolarAngle={Math.PI / 2}
                    />
                </Canvas>
                
                <div className="absolute bottom-4 right-4 text-gray-600 text-xs pointer-events-none select-none">
                    Interactive 3D View
                </div>
            </div>
        </div>
    );
};

const UserStatsPentagrams = () => {
    // Mock data: 5 most executed exercises
    const topExercises = [
        { id: 1, name: 'Press Banca', executionCount: 120 },
        { id: 2, name: 'Sentadillas', executionCount: 95 },
        { id: 3, name: 'Peso Muerto', executionCount: 80 },
        { id: 4, name: 'Dominadas', executionCount: 65 },
        { id: 5, name: 'Flexiones', executionCount: 50 }
    ];

    // Mock data: Muscle groups
    const topMuscleGroups = [
        { id: 1, name: 'Pectoral', executionCount: 25 },
        { id: 2, name: 'Espalda', executionCount: 15 },
        { id: 3, name: 'Pierna', executionCount: 5 },
        { id: 4, name: 'Hombro', executionCount: 45 },
        { id: 5, name: 'Brazo', executionCount: 40 }
    ];

    return (
        <div className="w-full h-[500px] flex flex-col md:flex-row gap-4">
            <StatsChartCard title="Top 5 Exercises" subtitle="Performance" data={topExercises} />
            <StatsChartCard title="Muscle Groups" subtitle="Focus" data={topMuscleGroups} />
        </div>
    );
}

export default UserStatsPentagrams;