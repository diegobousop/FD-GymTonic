import { useMemo, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Html, OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { svgIcons } from '../../../../config/constants';
import PropTypes from 'prop-types';

const ThemeColors = {
    background: '#161616',
    primary: '#ff0000',
    accent: '#ff0000', 
    secondary: '#6b7280',
    text: '#ffffff'
};

const DataPoint = ({ position, isHovered, onHover, delay = 0 }) => {
    const [active, setActive] = useState(false);
    const meshRef = useRef();
    const targetPos = useRef(position);
    
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();
            const progress = THREE.MathUtils.clamp((time - delay) * 2, 0, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            meshRef.current.position.lerp(targetPos.current, 0.1);
            const targetScale = isHovered ? 0.25 : 0.15;
            const currentScale = meshRef.current.scale.x;
            const newScale = THREE.MathUtils.lerp(currentScale, targetScale * ease, 0.1);
            meshRef.current.scale.setScalar(newScale);
        }
    });

    useMemo(() => {
        targetPos.current = position;
    }, [position]);

    return (
        <group ref={meshRef}> 
            <Sphere 
                args={[1, 16, 16]} 
                onPointerOver={(e) => { e.stopPropagation(); onHover(true); setActive(true); }}
                onPointerOut={(e) => { onHover(false); setActive(false); }}
                onClick={(e) => { e.stopPropagation(); setActive(!active); }}
            >
                <meshStandardMaterial 
                    color={isHovered ? ThemeColors.accent : ThemeColors.primary} 
                    emissive={isHovered ? ThemeColors.accent : '#000000'} // NOSONAR
                    emissiveIntensity={isHovered ? 2 : 0} //NOSONAR
                />
            </Sphere>
        </group>
    );
};

DataPoint.propTypes = {
    position: PropTypes.object.isRequired,
    isHovered: PropTypes.bool,
    onHover: PropTypes.func,
    delay: PropTypes.number
};

export const PentagramChart = ({ data, valueKey = 'executionCount' }) => {
    const radius = 2.5; 
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const groupRef = useRef();
    const tiltRef = useRef({ angle: 0, intensity: 0 });
    const [badge, setBadge] = useState(null); 
    const badgeTimeoutRef = useRef(null);
    useFrame((state) => {
        if (groupRef.current) {
            const time = state.clock.getElapsedTime();
            const progress = THREE.MathUtils.clamp(time * 1.5, 0, 1);
            const ease = 1 - Math.pow(1 - progress, 4); 

            groupRef.current.scale.setScalar(ease);
            groupRef.current.rotation.z = THREE.MathUtils.lerp(-Math.PI / 4, 0, ease);

            const t = tiltRef.current;
            if (hoveredIndex !== null && t.intensity < 0.12) {
                t.intensity = THREE.MathUtils.lerp(t.intensity, 0.12, 0.2);
            }
            if (t.intensity > 0.0001) {
                const dirX = Math.cos(t.angle);
                const dirY = Math.sin(t.angle);
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, dirY * t.intensity, 0.15);
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -dirX * t.intensity, 0.15);
                if (hoveredIndex === null) {
                    t.intensity = THREE.MathUtils.lerp(t.intensity, 0, 0.06);
                }
            } else {
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1);
            }

            groupRef.current.position.z = THREE.MathUtils.lerp(-5, 0, ease);
        }
    });

    const triggerTilt = (angle) => {
        tiltRef.current.angle = angle;
        tiltRef.current.intensity = Math.max(tiltRef.current.intensity, 0.1);
    };

    const maxVal = useMemo(() => {
        const values = data.map(d => (d?.[valueKey] ?? d?.executionCount ?? 0));
        return Math.max(...values, 1);
    }, [data, valueKey]);

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


    const vertices = useMemo(() => {
        const pts = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; 
            pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
        }
        return pts;
    }, [radius]);


    const dataVertices = useMemo(() => {
        return vertices.map((v, i) => {
            const val = data[i]?.[valueKey] ?? data[i]?.executionCount ?? 0;
            const normalized = val / maxVal;
            return v.clone().multiplyScalar(Math.max(normalized, 0.1)); 
        });
    }, [vertices, data, maxVal, valueKey]);

    const dataLines = useMemo(() => [...dataVertices, dataVertices[0]], [dataVertices]);

    const spokes = useMemo(() => {
        return vertices.map(v => [new THREE.Vector3(0,0,0), v]);
    }, [vertices]);

    const levels = [0.25, 0.5, 0.75, 1];

    const badgePos = useMemo(() => {
        if (badge?.index == null) return null;
        const base = dataVertices[badge.index];
        if (!base) return null;
        const offset = 0.35;
        const dir = new THREE.Vector3(Math.cos(badge.angle), Math.sin(badge.angle), 0).multiplyScalar(offset);
        return base.clone().add(dir);
    }, [badge, dataVertices]);

    return (
        <group ref={groupRef}>
            {levels.map((level) => (
                <group key={`grid-${level}`}> 
                    <Line 
                        points={[...vertices.map(v => v.clone().multiplyScalar(level)), vertices[0].clone().multiplyScalar(level)]} 
                        color={ThemeColors.secondary} 
                        lineWidth={1} 
                        transparent 
                        opacity={0.15} 
                    />
                    <Html position={new THREE.Vector3(0, radius * level, 0)} center zIndexRange={[0, 0]}>
                        <div className="text-[10px] text-gray-500 font-mono bg-[#161616]/80 px-1 rounded">
                            {Math.round(maxVal * level)}
                        </div>
                    </Html>
                </group>
            ))}
            
            {spokes.map((spoke) => {
                const v = spoke[1];
                const key = `spoke-${v.x.toFixed(3)}-${v.y.toFixed(3)}`;
                return <Line key={key} points={spoke} color={ThemeColors.secondary} lineWidth={1} transparent opacity={0.2} />
            })}

            {vertices.map((pos, i) => (
                <Html key={data?.[i]?.id ?? `img-${pos.x.toFixed(3)}-${pos.y.toFixed(3)}`} position={pos} center distanceFactor={10} zIndexRange={[10, 0]}>
                    <div
                        className="flex flex-col items-center justify-center transform translate-y-[-50%] relative cursor-pointer"
                        onPointerEnter={(e) => { e.stopPropagation(); setHoveredIndex(i); const v = vertices[i]; const a = Math.atan2(v.y, v.x); triggerTilt(a); const value = data[i]?.[valueKey] ?? data[i]?.executionCount ?? 0; setBadge({ index: i, value, angle: a }); if (badgeTimeoutRef.current) { clearTimeout(badgeTimeoutRef.current); } }}
                        onPointerLeave={(e) => { setHoveredIndex(null); if (badgeTimeoutRef.current) { clearTimeout(badgeTimeoutRef.current); } badgeTimeoutRef.current = setTimeout(() => setBadge(null), 200); }}
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

            <Line points={dataLines} color={ThemeColors.accent} lineWidth={3} />

            {dataVertices.map((pos, i) => (
                <DataPoint 
                    key={data?.[i]?.id ?? `dp-${i}`} 
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
                            if (badgeTimeoutRef.current) { clearTimeout(badgeTimeoutRef.current); }
                        } else {
                            
                            tiltRef.current.intensity = 0;
                            if (badgeTimeoutRef.current) { clearTimeout(badgeTimeoutRef.current); }
                            badgeTimeoutRef.current = setTimeout(() => setBadge(null), 200);
                        }
                    }}
                    delay={0.5 + i * 0.1} 
                />
            ))}

          
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

PentagramChart.propTypes = {
    data: PropTypes.array.isRequired,
    valueKey: PropTypes.string
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
                        
                        minAzimuthAngle={-Math.PI / 6} 
                        maxAzimuthAngle={Math.PI / 6}
                        minPolarAngle={Math.PI / 2.5} 
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

StatsChartCard.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    valueKey: PropTypes.string.isRequired
};

const UserStatsPentagrams = ({ selectedReps = 10, selectedTime = 'all', stats }) => {
    const [exerciseData, setExerciseData] = useState([]);
    const [muscleData, setMuscleData] = useState([]);

    // Helper: process exercise weights object and update exerciseMaxWeights
    const processExerciseWeights = (exerciseWeightsKg, exerciseMaxWeights) => {
        Object.keys(exerciseWeightsKg).forEach((exName) => {
            const weight = exerciseWeightsKg[exName];
            if (!exerciseMaxWeights[exName] || weight > exerciseMaxWeights[exName]) {
                exerciseMaxWeights[exName] = weight;
            }
        });
    };

    // Helper: process exercise group mapping and update exerciseToMuscleGroup
    const processExerciseGroup = (exerciseGroup, exerciseToMuscleGroup) => {
        Object.keys(exerciseGroup).forEach((exName) => {
            exerciseToMuscleGroup[exName] = exerciseGroup[exName];
        });
    };

    // Helper: accumulate muscle counts
    const accumulateMuscleCounts = (exerciseCount, muscleCounts) => {
        Object.keys(exerciseCount).forEach((muscle) => {
            muscleCounts[muscle] = (muscleCounts[muscle] || 0) + exerciseCount[muscle];
        });
    };

    useEffect(() => {
        if (!stats) return;
        const userStats = Array.isArray(stats) ? stats[0] : stats;
        if (!userStats) return;

        const imagesMap = {};
        if (userStats.muscleGroupImages) {
            userStats.muscleGroupImages.forEach(img => {
                imagesMap[img.name] = img.base64;
            });
        }

        const exerciseMaxWeights = {};
        const exerciseToMuscleGroup = {};

        if (userStats.periodExerciseStats) {
            userStats.periodExerciseStats.forEach((period) => {
                if (!period.exerciseStats) return;
                period.exerciseStats.forEach((stat) => {
                    if (stat.exerciseWeightsKg) {
                        processExerciseWeights(stat.exerciseWeightsKg, exerciseMaxWeights);
                    }
                    if (stat.exerciseGroup) {
                        processExerciseGroup(stat.exerciseGroup, exerciseToMuscleGroup);
                    }
                });
            });
        }

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

        const topExercises = Object.values(bestPerMuscleGroup).map((item, index) => ({
            id: index,
            name: item.name,
            weightKg: item.weightKg,
            image: item.image
        })).sort((a, b) => b.weightKg - a.weightKg).slice(0, 5);
        
        while (topExercises.length < 5) {
             topExercises.push({ id: topExercises.length, name: 'N/A', weightKg: 0 });
        }

        setExerciseData(topExercises);

        const muscleCounts = {};
        if (userStats.periodMuscularGroupStats) {
            userStats.periodMuscularGroupStats.forEach((period) => {
                if (!period.muscularGroupStats) return;
                period.muscularGroupStats.forEach((stat) => {
                    if (stat.exerciseCount) {
                        accumulateMuscleCounts(stat.exerciseCount, muscleCounts);
                    }
                });
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

UserStatsPentagrams.propTypes = {
    selectedReps: PropTypes.number,
    selectedTime: PropTypes.string,
    stats: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ])
};

export default UserStatsPentagrams;