import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Html, OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { svgIcons } from '../../../../config/constants';

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
                onClick={(e) => { e.stopPropagation(); setActive(!active); }}
            >
                <meshStandardMaterial 
                    color={isHovered ? ThemeColors.accent : ThemeColors.primary} 
                    emissive={isHovered ? ThemeColors.accent : '#000000'}
                    emissiveIntensity={isHovered ? 2 : 0}
                />
            </Sphere>
            {/* Removed per request: only keep the black badge near vertex */}
        </group>
    );
};

const PentagramChart = ({ data, unit, valueKey = 'executionCount' }) => {
    const radius = 2.5; // Reduced radius for smaller chart
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const groupRef = useRef();
    const tiltRef = useRef({ angle: 0, intensity: 0 });
    const [badge, setBadge] = useState(null); // { index, value, angle }
    const badgeTimeoutRef = useRef(null);

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

            // Apply transient tilt (inverse direction from hovered vertex)
            const t = tiltRef.current;
            if (hoveredIndex !== null && t.intensity < 0.12) {
                // Maintain tilt while hovering
                t.intensity = THREE.MathUtils.lerp(t.intensity, 0.12, 0.2);
            }
            if (t.intensity > 0.0001) {
                const dirX = Math.cos(t.angle);
                const dirY = Math.sin(t.angle);
                // Inverse: lean away from the data direction
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, dirY * t.intensity, 0.15);
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -dirX * t.intensity, 0.15);
                // Decay only when not hovering
                if (hoveredIndex === null) {
                    t.intensity = THREE.MathUtils.lerp(t.intensity, 0, 0.06);
                }
            } else {
                // relax back to flat
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1);
            }

            // Movement along Z axis (depth)
            groupRef.current.position.z = THREE.MathUtils.lerp(-5, 0, ease);
        }
    });

    const triggerTilt = (angle) => {
        tiltRef.current.angle = angle;
        // Initial kick; sustained by hover handler/useFrame
        tiltRef.current.intensity = Math.max(tiltRef.current.intensity, 0.1);
    };

    // Calculate max value for normalization
    const maxVal = useMemo(() => {
        const values = data.map(d => (d?.[valueKey] ?? d?.executionCount ?? 0));
        return Math.max(...values, 1);
    }, [data, valueKey]);

    // Find index of max value to add crown
    const maxIndex = useMemo(() => {
        let max = -1;
        let idx = -1;
        data.forEach((d, i) => {
            const v = d?.[valueKey] ?? d?.executionCount ?? 0;
            if (v > max) {
                max = v;
                idx = i;
            }
        });
        return idx;
    }, [data, valueKey]);

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
            const val = data[i]?.[valueKey] ?? data[i]?.executionCount ?? 0;
            const normalized = val / maxVal;
            // Scale vector by normalized value (min 0.2 to show something)
            return v.clone().multiplyScalar(Math.max(normalized, 0.1)); 
        });
    }, [vertices, data, maxVal, valueKey]);

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

    // Badge position (slightly beyond the clicked data vertex)
    const badgePos = useMemo(() => {
        if (!badge || badge.index == null) return null;
        const base = dataVertices[badge.index];
        if (!base) return null;
        const offset = 0.35;
        const dir = new THREE.Vector3(Math.cos(badge.angle), Math.sin(badge.angle), 0).multiplyScalar(offset);
        return base.clone().add(dir);
    }, [badge, dataVertices]);

    // Unit no longer shown in badge

    // Hover-driven interaction now; click handler removed

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
                <Html key={`img-${i}`} position={pos} center distanceFactor={10} zIndexRange={[10, 0]}>
                    <div
                        className="flex flex-col items-center justify-center transform translate-y-[-50%] relative cursor-pointer"
                        onPointerEnter={(e) => { e.stopPropagation(); setHoveredIndex(i); const v = vertices[i]; const a = Math.atan2(v.y, v.x); triggerTilt(a); const value = data[i]?.[valueKey] ?? data[i]?.executionCount ?? 0; setBadge({ index: i, value, angle: a }); if (badgeTimeoutRef.current) clearTimeout(badgeTimeoutRef.current); }}
                        onPointerLeave={(e) => { setHoveredIndex(null); if (badgeTimeoutRef.current) clearTimeout(badgeTimeoutRef.current); badgeTimeoutRef.current = setTimeout(() => setBadge(null), 200); }}
                    >
                        {i === maxIndex && (
                            <div className="absolute -top-6 text-xl animate-bounce drop-shadow-lg filter" style={{ textShadow: '0 0 10px gold' }}>
                                <svgIcons.CrownIcon className="w-6 h-6 text-yellow-400" />
                            </div>
                        )}
                        <div className={`w-8 h-8 bg-white rounded-md shadow-lg mb-1 flex items-center justify-center overflow-hidden border-2 ${i === maxIndex ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'border-gray-700'}`}>
                            {data[i]?.image ? (
                                <img src={data[i].image} alt={data[i].name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white" />
                            )}
                        </div>
                        <div className={`text-[10px] font-sans px-1 rounded backdrop-blur-sm whitespace-nowrap ${i === maxIndex ? 'text-yellow-400 font-bold bg-black/70' : 'text-gray-400 bg-black/50'}`}>
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
                    value={data[i]?.[valueKey] ?? data[i]?.executionCount} 
                    label={data[i]?.name}
                    isHovered={hoveredIndex === i}
                    onHover={(isHovering) => { 
                        setHoveredIndex(isHovering ? i : null);
                        const v = vertices[i];
                        const a = Math.atan2(v.y, v.x);
                        if (isHovering) {
                            triggerTilt(a);
                            const value = data[i]?.[valueKey] ?? data[i]?.executionCount ?? 0;
                            setBadge({ index: i, value, angle: a });
                            if (badgeTimeoutRef.current) clearTimeout(badgeTimeoutRef.current);
                        } else {
                            // Stop sustaining tilt when hover ends
                            tiltRef.current.intensity = 0;
                            if (badgeTimeoutRef.current) clearTimeout(badgeTimeoutRef.current);
                            badgeTimeoutRef.current = setTimeout(() => setBadge(null), 200);
                        }
                    }}
                    delay={0.5 + i * 0.1} // Staggered animation
                />
            ))}

            {/* Click Badge */}
            {badge && badgePos && (
                <Html position={badgePos} center distanceFactor={10} zIndexRange={[20, 0]}>
                    <div className="px-2 py-1 rounded-full text-xs font-bold bg-black/80 text-white border border-gray-700 shadow-lg">
                        {badge.value}
                    </div>
                </Html>
            )}
        </group>
    );
};

const StatsChartCard = ({ title, subtitle, data, valueKey }) => {
    return (
        <div className="flex-1 flex flex-col bg-[#161616] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
            <div className="p-1 px-6 border-b border-gray-800 flex justify-between items-center bg-[#1a1a1a]">
                <p className="text-sm font-regular text-white  tracking-wide">
                    {title}
                </p>
                <span className="text-xs text-gray-500 uppercase tracking-wider border border-gray-700 px-2 py-1 rounded">
                    {subtitle}
                </span>
            </div>
            
            <div className="flex-grow relative min-h-[300px]">
                <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                    <color attach="background" args={[ThemeColors.background]} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    
                    <PentagramChart data={data} unit={subtitle} valueKey={valueKey} />
                    
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

const UserStatsPentagrams = ({ selectedReps = 10, selectedTime = 'all', stats }) => {
    const [exerciseData, setExerciseData] = useState([]);
    const [muscleData, setMuscleData] = useState([]);

    useEffect(() => {
        if (!stats) return;
        const userStats = Array.isArray(stats) ? stats[0] : stats;
        if (!userStats) return;

        // Extract images
        const imagesMap = {};
        if (userStats.muscleGroupImages) {
            userStats.muscleGroupImages.forEach(img => {
                imagesMap[img.name] = img.base64;
            });
        }

        // Process Exercises
        // Find max weight for each exercise
        const exerciseMaxWeights = {};
        const exerciseToMuscleGroup = {};

        if (userStats.periodExerciseStats) {
            userStats.periodExerciseStats.forEach(period => {
                if (period.exerciseStats) {
                    period.exerciseStats.forEach(stat => {
                        if (stat.exerciseWeightsKg) {
                            Object.keys(stat.exerciseWeightsKg).forEach(exName => {
                                const weight = stat.exerciseWeightsKg[exName];
                                if (!exerciseMaxWeights[exName] || weight > exerciseMaxWeights[exName]) {
                                    exerciseMaxWeights[exName] = weight;
                                }
                            });
                        }
                        if (stat.exerciseGroup) {
                             Object.keys(stat.exerciseGroup).forEach(exName => {
                                 exerciseToMuscleGroup[exName] = stat.exerciseGroup[exName];
                             });
                        }
                    });
                }
            });
        }

        // Filter to keep only the best exercise per muscle group
        const bestPerMuscleGroup = {};
        Object.keys(exerciseMaxWeights).forEach(name => {
            const weight = exerciseMaxWeights[name];
            const muscleGroup = exerciseToMuscleGroup[name];
            
            if (muscleGroup) {
                if (!bestPerMuscleGroup[muscleGroup] || weight > bestPerMuscleGroup[muscleGroup].weightKg) {
                    bestPerMuscleGroup[muscleGroup] = {
                        name: name,
                        weightKg: weight,
                        image: imagesMap[muscleGroup]
                    };
                }
            }
        });

        // Convert to array and sort by weight (descending) to get top 5
        const topExercises = Object.values(bestPerMuscleGroup).map((item, index) => ({
            id: index,
            name: item.name,
            weightKg: item.weightKg,
            image: item.image
        })).sort((a, b) => b.weightKg - a.weightKg).slice(0, 5);
        
        // Pad with placeholders if less than 5
        while (topExercises.length < 5) {
             topExercises.push({ id: topExercises.length, name: 'N/A', weightKg: 0 });
        }

        setExerciseData(topExercises);

        // Process Muscles
        const muscleCounts = {};
        if (userStats.periodMuscularGroupStats) {
            userStats.periodMuscularGroupStats.forEach(period => {
                if (period.muscularGroupStats) {
                    period.muscularGroupStats.forEach(stat => {
                        if (stat.exerciseCount) {
                            Object.keys(stat.exerciseCount).forEach(muscle => {
                                muscleCounts[muscle] = (muscleCounts[muscle] || 0) + stat.exerciseCount[muscle];
                            });
                        }
                    });
                }
            });
        }

        const topMuscles = Object.keys(muscleCounts).map((name, index) => ({
            id: index,
            name: name,
            executionCount: muscleCounts[name],
            image: imagesMap[name]
        })).sort((a, b) => b.executionCount - a.executionCount).slice(0, 5);

        while (topMuscles.length < 5) {
             topMuscles.push({ id: topMuscles.length, name: 'N/A', executionCount: 0 });
        }

        setMuscleData(topMuscles);

    }, [stats]);

    return (
        <div className="w-full h-[500px] flex flex-col md:flex-row gap-4">
            <StatsChartCard title="Tus 5 mejores ejercicios" subtitle="KG" data={exerciseData} valueKey="weightKg" />
            <StatsChartCard title="Grupos Musculares" subtitle="CANTIDAD" data={muscleData} valueKey="executionCount" />
        </div>
    );
}

export default UserStatsPentagrams;