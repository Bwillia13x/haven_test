import { useMemo, useRef } from "react";
import { Line, QuadraticBezierLine, CubicBezierLine } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAetherStore } from "../stores/useAetherStore";
import { ConnectorType, ConnectorProperties } from "../types/aether";

// Smart routing algorithms
const findPathWithCollisionAvoidance = (
  start: THREE.Vector3,
  end: THREE.Vector3,
  obstacles: THREE.Vector3[],
  avoidanceRadius: number = 0.5
): THREE.Vector3[] => {
  const path: THREE.Vector3[] = [start];
  const direction = end.clone().sub(start).normalize();
  const distance = start.distanceTo(end);
  const steps = Math.ceil(distance / 0.2); // Step size of 0.2 units

  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    let currentPoint = start.clone().lerp(end, t);

    // Check for collisions with obstacles
    for (const obstacle of obstacles) {
      const distanceToObstacle = currentPoint.distanceTo(obstacle);
      if (distanceToObstacle < avoidanceRadius) {
        // Calculate avoidance vector
        const avoidanceVector = currentPoint.clone().sub(obstacle).normalize();
        const pushDistance = avoidanceRadius - distanceToObstacle + 0.1;
        currentPoint.add(avoidanceVector.multiplyScalar(pushDistance));
      }
    }

    path.push(currentPoint);
  }

  path.push(end);
  return path;
};

const generateAutoRoute = (
  start: THREE.Vector3,
  end: THREE.Vector3,
  routingStyle: 'manhattan' | 'smooth' | 'direct' = 'smooth'
): THREE.Vector3[] => {
  switch (routingStyle) {
    case 'manhattan':
      // Right-angle routing (like circuit boards)
      const midX = (start.x + end.x) / 2;
      return [
        start,
        new THREE.Vector3(midX, start.y, start.z),
        new THREE.Vector3(midX, end.y, end.z),
        end
      ];

    case 'smooth':
      // Smooth curved routing
      const distance = start.distanceTo(end);
      const offset = distance * 0.3;
      const direction = end.clone().sub(start).normalize();
      const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);

      const control1 = start.clone().add(direction.clone().multiplyScalar(distance * 0.3));
      const control2 = end.clone().sub(direction.clone().multiplyScalar(distance * 0.3));

      // Add some curvature
      control1.add(perpendicular.clone().multiplyScalar(offset * 0.5));
      control2.add(perpendicular.clone().multiplyScalar(-offset * 0.5));

      return [start, control1, control2, end];

    case 'direct':
    default:
      return [start, end];
  }
};

interface AdvancedConnectorProps {
  startNodeId: string;
  endNodeId: string;
  type: ConnectorType;
  properties: ConnectorProperties;
  material?: string;
}

export function AdvancedConnector({ 
  startNodeId, 
  endNodeId, 
  type, 
  properties, 
  material = 'default' 
}: AdvancedConnectorProps) {
  const { nodes, materials } = useAetherStore();
  const lineRef = useRef<THREE.Line>(null);
  const animationRef = useRef(0);

  const { points, controlPoints, isValid } = useMemo(() => {
    const startNode = nodes.find(n => n.id === startNodeId);
    const endNode = nodes.find(n => n.id === endNodeId);

    if (!startNode || !endNode) {
      return { points: [], controlPoints: [], isValid: false };
    }

    const startPos = startNode.properties?.position || startNode.position;
    const endPos = endNode.properties?.position || endNode.position;
    const startVec = new THREE.Vector3(...startPos);
    const endVec = new THREE.Vector3(...endPos);

    // Get other nodes as potential obstacles for collision avoidance
    const obstacles = nodes
      .filter(n => n.id !== startNodeId && n.id !== endNodeId)
      .map(n => new THREE.Vector3(...(n.properties?.position || n.position)));

    let points: THREE.Vector3[] = [];
    let controlPoints: THREE.Vector3[] = [];

    // Check if smart routing is enabled
    const useSmartRouting = properties.autoRoute !== false;
    const avoidCollisions = properties.collisionAvoidance !== false;
    
    switch (type) {
      case 'straight':
        if (avoidCollisions && obstacles.length > 0) {
          points = findPathWithCollisionAvoidance(startVec, endVec, obstacles);
        } else if (useSmartRouting) {
          points = generateAutoRoute(startVec, endVec, 'direct');
        } else {
          points = [startVec, endVec];
        }
        break;
        
      case 'bezier':
        // Generate control points for Bezier curve
        const midPoint = startVec.clone().lerp(endVec, 0.5);
        const distance = startVec.distanceTo(endVec);
        const offset = distance * 0.3;
        
        // Create control points perpendicular to the line
        const direction = endVec.clone().sub(startVec).normalize();
        const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
        
        const control1 = startVec.clone().lerp(midPoint, 0.5).add(perpendicular.clone().multiplyScalar(offset));
        const control2 = endVec.clone().lerp(midPoint, 0.5).add(perpendicular.clone().multiplyScalar(-offset));
        
        controlPoints = [control1, control2];
        points = [startVec, endVec];
        break;
        
      case 'arc':
        // Generate arc points
        const center = startVec.clone().lerp(endVec, 0.5);
        const radius = startVec.distanceTo(endVec) * 0.3;
        const segments = properties.segments || 16;
        
        points = [];
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const angle = Math.PI * t;
          const point = new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
          );
          
          // Transform to connect start and end points
          const lerpPoint = startVec.clone().lerp(endVec, t);
          point.add(lerpPoint);
          points.push(point);
        }
        break;
        
      case 'spline':
        // Generate smooth spline
        const splineSegments = properties.segments || 20;
        const curve = new THREE.CatmullRomCurve3([
          startVec,
          startVec.clone().lerp(endVec, 0.33).add(new THREE.Vector3(0, 1, 0)),
          startVec.clone().lerp(endVec, 0.66).add(new THREE.Vector3(0, -1, 0)),
          endVec
        ]);
        
        points = curve.getPoints(splineSegments);
        break;
        
      case 'spring':
        // Generate spring/coil shape
        const springSegments = properties.segments || 32;
        const coils = 3;
        const springRadius = startVec.distanceTo(endVec) * 0.1;
        
        points = [];
        for (let i = 0; i <= springSegments; i++) {
          const t = i / springSegments;
          const angle = coils * 2 * Math.PI * t;
          
          const springPoint = new THREE.Vector3(
            Math.cos(angle) * springRadius,
            Math.sin(angle) * springRadius,
            0
          );
          
          const basePoint = startVec.clone().lerp(endVec, t);
          springPoint.add(basePoint);
          points.push(springPoint);
        }
        break;
        
      default:
        points = [startVec, endVec];
    }
    
    return { points, controlPoints, isValid: true };
  }, [nodes, startNodeId, endNodeId, type, properties.segments]);

  const materialProps = materials[material] || materials.default;

  // Physics simulation for spring connectors
  useFrame((state, delta) => {
    if (properties.animated && lineRef.current) {
      animationRef.current += 0.02;
      // This would be used for animated dash patterns
    }

    // Spring physics simulation
    if (type === 'spring' && properties.stiffness && properties.damping) {
      const startNode = nodes.find(n => n.id === startNodeId);
      const endNode = nodes.find(n => n.id === endNodeId);

      if (startNode && endNode) {
        const startPos = new THREE.Vector3(...(startNode.properties?.position || startNode.position));
        const endPos = new THREE.Vector3(...(endNode.properties?.position || endNode.position));
        const currentLength = startPos.distanceTo(endPos);
        const restLength = properties.restLength || 1.0;

        // Calculate spring force (Hooke's law: F = -kx)
        const displacement = currentLength - restLength;
        const springForce = -properties.stiffness * displacement;

        // Apply damping
        const dampingForce = -properties.damping * 0.1; // Simplified damping

        // This would be used to apply forces to connected nodes in a full physics system
        // For now, we just use it to animate the spring visualization
        const oscillation = Math.sin(state.clock.elapsedTime * 2) * 0.1 * Math.abs(displacement);

        // Update spring visualization based on physics
        if (lineRef.current) {
          const scale = 1 + oscillation;
          lineRef.current.scale.setScalar(scale);
        }
      }
    }
  });

  if (!isValid || points.length === 0) {
    return null;
  }

  // Create material based on style
  const createMaterial = () => {
    const baseColor = properties.color || materialProps.color;
    const opacity = properties.opacity ?? materialProps.opacity ?? 1;
    
    switch (properties.style) {
      case 'dashed':
        return (
          <lineDashedMaterial
            attach="material"
            color={baseColor}
            transparent={opacity < 1}
            opacity={opacity}
            dashSize={properties.dashSize || 0.1}
            gapSize={properties.gapSize || 0.05}
          />
        );
        
      case 'dotted':
        return (
          <lineDashedMaterial
            attach="material"
            color={baseColor}
            transparent={opacity < 1}
            opacity={opacity}
            dashSize={properties.dashSize || 0.02}
            gapSize={properties.gapSize || 0.08}
          />
        );
        
      default:
        return (
          <lineBasicMaterial
            attach="material"
            color={baseColor}
            transparent={opacity < 1}
            opacity={opacity}
          />
        );
    }
  };

  // Render based on connector type
  switch (type) {
    case 'bezier':
      if (controlPoints.length >= 2) {
        return (
          <CubicBezierLine
            ref={lineRef}
            start={points[0]}
            midA={controlPoints[0]}
            midB={controlPoints[1]}
            end={points[1]}
            color={properties.color || materialProps.color}
            lineWidth={properties.thickness}
            transparent={(properties.opacity ?? materialProps.opacity) < 1}
            opacity={properties.opacity ?? materialProps.opacity}
          />
        );
      }
      // Fallback to straight line
      return (
        <Line
          ref={lineRef}
          points={points}
          color={properties.color || materialProps.color}
          lineWidth={properties.thickness}
        />
      );
      
    case 'straight':
    case 'arc':
    case 'spline':
    case 'spring':
    default:
      // For dashed/dotted lines, we need to use a different approach
      if (properties.style === 'dashed' || properties.style === 'dotted') {
        // Create geometry manually for dashed lines
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(points.length * 3);
        
        points.forEach((point, index) => {
          positions[index * 3] = point.x;
          positions[index * 3 + 1] = point.y;
          positions[index * 3 + 2] = point.z;
        });
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.computeLineDistances(); // Required for dashed lines
        
        return (
          <line ref={lineRef}>
            <primitive object={geometry} attach="geometry" />
            {createMaterial()}
          </line>
        );
      }
      
      return (
        <Line
          ref={lineRef}
          points={points}
          color={properties.color || materialProps.color}
          lineWidth={properties.thickness}
          transparent={(properties.opacity ?? materialProps.opacity) < 1}
          opacity={properties.opacity ?? materialProps.opacity}
        />
      );
  }
}
