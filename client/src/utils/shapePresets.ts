import * as THREE from "three";

export interface ShapePreset {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'geometric' | 'organic' | 'architectural' | 'mathematical';
  icon: string;
  generate: (options?: ShapePresetOptions) => ShapePresetResult;
}

export interface ShapePresetOptions {
  scale?: number;
  position?: [number, number, number];
  material?: string;
  density?: number;
  complexity?: number;
  [key: string]: any;
}

export interface ShapePresetResult {
  nodes: Array<{
    position: [number, number, number];
    material?: string;
    scale?: number;
  }>;
  connectors: Array<{
    startIndex: number;
    endIndex: number;
    material?: string;
    thickness?: number;
  }>;
}

// Basic geometric shapes
export const cubePreset: ShapePreset = {
  id: 'cube',
  name: 'Cube',
  description: 'A basic 3D cube with 8 vertices and 12 edges',
  category: 'basic',
  icon: '⬜',
  generate: (options = {}) => {
    const { scale = 1, position = [0, 0, 0] } = options;
    const [x, y, z] = position;
    const s = scale;

    const nodes = [
      { position: [x - s, y - s, z - s] as [number, number, number] },
      { position: [x + s, y - s, z - s] as [number, number, number] },
      { position: [x + s, y + s, z - s] as [number, number, number] },
      { position: [x - s, y + s, z - s] as [number, number, number] },
      { position: [x - s, y - s, z + s] as [number, number, number] },
      { position: [x + s, y - s, z + s] as [number, number, number] },
      { position: [x + s, y + s, z + s] as [number, number, number] },
      { position: [x - s, y + s, z + s] as [number, number, number] },
    ];

    const connectors = [
      // Bottom face
      { startIndex: 0, endIndex: 1 },
      { startIndex: 1, endIndex: 2 },
      { startIndex: 2, endIndex: 3 },
      { startIndex: 3, endIndex: 0 },
      // Top face
      { startIndex: 4, endIndex: 5 },
      { startIndex: 5, endIndex: 6 },
      { startIndex: 6, endIndex: 7 },
      { startIndex: 7, endIndex: 4 },
      // Vertical edges
      { startIndex: 0, endIndex: 4 },
      { startIndex: 1, endIndex: 5 },
      { startIndex: 2, endIndex: 6 },
      { startIndex: 3, endIndex: 7 },
    ];

    return { nodes, connectors };
  }
};

export const pyramidPreset: ShapePreset = {
  id: 'pyramid',
  name: 'Pyramid',
  description: 'A triangular pyramid with 4 vertices and 6 edges',
  category: 'basic',
  icon: '🔺',
  generate: (options = {}) => {
    const { scale = 1, position = [0, 0, 0] } = options;
    const [x, y, z] = position;
    const s = scale;

    const nodes = [
      { position: [x - s, y - s, z - s] as [number, number, number] },
      { position: [x + s, y - s, z - s] as [number, number, number] },
      { position: [x, y - s, z + s] as [number, number, number] },
      { position: [x, y + s, z] as [number, number, number] },
    ];

    const connectors = [
      // Base triangle
      { startIndex: 0, endIndex: 1 },
      { startIndex: 1, endIndex: 2 },
      { startIndex: 2, endIndex: 0 },
      // Edges to apex
      { startIndex: 0, endIndex: 3 },
      { startIndex: 1, endIndex: 3 },
      { startIndex: 2, endIndex: 3 },
    ];

    return { nodes, connectors };
  }
};

export const spherePreset: ShapePreset = {
  id: 'sphere',
  name: 'Sphere',
  description: 'A geodesic sphere approximation',
  category: 'geometric',
  icon: '⚪',
  generate: (options = {}) => {
    const { scale = 1, position = [0, 0, 0], density = 8 } = options;
    const [x, y, z] = position;
    const nodes: Array<{ position: [number, number, number] }> = [];
    const connectors: Array<{ startIndex: number; endIndex: number }> = [];

    // Generate points on sphere using spherical coordinates
    const rings = Math.max(4, Math.floor(density));
    const pointsPerRing = Math.max(6, Math.floor(density * 1.5));

    for (let ring = 0; ring <= rings; ring++) {
      const phi = (ring / rings) * Math.PI; // 0 to PI
      const y_pos = Math.cos(phi) * scale;
      const ringRadius = Math.sin(phi) * scale;

      const pointsInThisRing = ring === 0 || ring === rings ? 1 : pointsPerRing;

      for (let point = 0; point < pointsInThisRing; point++) {
        const theta = (point / pointsInThisRing) * 2 * Math.PI;
        const x_pos = ringRadius * Math.cos(theta);
        const z_pos = ringRadius * Math.sin(theta);

        nodes.push({
          position: [x + x_pos, y + y_pos, z + z_pos]
        });
      }
    }

    // Connect adjacent points
    let nodeIndex = 0;
    for (let ring = 0; ring <= rings; ring++) {
      const pointsInThisRing = ring === 0 || ring === rings ? 1 : pointsPerRing;
      const pointsInNextRing = ring === rings ? 0 : (ring + 1 === rings ? 1 : pointsPerRing);

      // Connect within ring
      if (pointsInThisRing > 1) {
        for (let point = 0; point < pointsInThisRing; point++) {
          const nextPoint = (point + 1) % pointsInThisRing;
          connectors.push({
            startIndex: nodeIndex + point,
            endIndex: nodeIndex + nextPoint
          });
        }
      }

      // Connect to next ring
      if (pointsInNextRing > 0) {
        for (let point = 0; point < pointsInThisRing; point++) {
          if (pointsInNextRing === 1) {
            // Connect to single point (pole)
            connectors.push({
              startIndex: nodeIndex + point,
              endIndex: nodeIndex + pointsInThisRing
            });
          } else {
            // Connect to corresponding points in next ring
            const nextRingStart = nodeIndex + pointsInThisRing;
            const correspondingPoint = Math.floor((point / pointsInThisRing) * pointsInNextRing);
            connectors.push({
              startIndex: nodeIndex + point,
              endIndex: nextRingStart + correspondingPoint
            });
            // Also connect to next point for triangulation
            const nextCorrespondingPoint = (correspondingPoint + 1) % pointsInNextRing;
            connectors.push({
              startIndex: nodeIndex + point,
              endIndex: nextRingStart + nextCorrespondingPoint
            });
          }
        }
      }

      nodeIndex += pointsInThisRing;
    }

    return { nodes, connectors };
  }
};

export const helixPreset: ShapePreset = {
  id: 'helix',
  name: 'Helix',
  description: 'A spiral helix structure',
  category: 'mathematical',
  icon: '🌀',
  generate: (options = {}) => {
    const { scale = 1, position = [0, 0, 0], complexity = 20 } = options;
    const [x, y, z] = position;
    const nodes: Array<{ position: [number, number, number] }> = [];
    const connectors: Array<{ startIndex: number; endIndex: number }> = [];

    const turns = 3;
    const height = scale * 4;
    const radius = scale;
    const points = Math.max(10, Math.floor(complexity));

    for (let i = 0; i < points; i++) {
      const t = (i / (points - 1)) * turns * 2 * Math.PI;
      const y_pos = (i / (points - 1)) * height - height / 2;
      const x_pos = radius * Math.cos(t);
      const z_pos = radius * Math.sin(t);

      nodes.push({
        position: [x + x_pos, y + y_pos, z + z_pos]
      });

      if (i > 0) {
        connectors.push({
          startIndex: i - 1,
          endIndex: i
        });
      }
    }

    return { nodes, connectors };
  }
};

export const torusPreset: ShapePreset = {
  id: 'torus',
  name: 'Torus',
  description: 'A donut-shaped torus',
  category: 'geometric',
  icon: '🍩',
  generate: (options = {}) => {
    const { scale = 1, position = [0, 0, 0], density = 8 } = options;
    const [x, y, z] = position;
    const nodes: Array<{ position: [number, number, number] }> = [];
    const connectors: Array<{ startIndex: number; endIndex: number }> = [];

    const majorRadius = scale;
    const minorRadius = scale * 0.3;
    const majorSegments = Math.max(6, Math.floor(density));
    const minorSegments = Math.max(4, Math.floor(density * 0.7));

    // Generate torus vertices
    for (let i = 0; i < majorSegments; i++) {
      const u = (i / majorSegments) * 2 * Math.PI;
      for (let j = 0; j < minorSegments; j++) {
        const v = (j / minorSegments) * 2 * Math.PI;
        
        const x_pos = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
        const y_pos = minorRadius * Math.sin(v);
        const z_pos = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);

        nodes.push({
          position: [x + x_pos, y + y_pos, z + z_pos]
        });
      }
    }

    // Generate connections
    for (let i = 0; i < majorSegments; i++) {
      for (let j = 0; j < minorSegments; j++) {
        const current = i * minorSegments + j;
        const nextMajor = ((i + 1) % majorSegments) * minorSegments + j;
        const nextMinor = i * minorSegments + ((j + 1) % minorSegments);

        connectors.push({ startIndex: current, endIndex: nextMajor });
        connectors.push({ startIndex: current, endIndex: nextMinor });
      }
    }

    return { nodes, connectors };
  }
};

export const fractalTreePreset: ShapePreset = {
  id: 'fractal-tree',
  name: 'Fractal Tree',
  description: 'A recursive fractal tree structure',
  category: 'mathematical',
  icon: '🌳',
  generate: (options = {}) => {
    const { scale = 1, position = [0, 0, 0], complexity = 4 } = options;
    const [x, y, z] = position;
    const nodes: Array<{ position: [number, number, number] }> = [];
    const connectors: Array<{ startIndex: number; endIndex: number }> = [];

    const maxDepth = Math.max(2, Math.min(6, Math.floor(complexity / 5)));
    const branchAngle = Math.PI / 6; // 30 degrees
    const lengthRatio = 0.7;

    function addBranch(
      startPos: [number, number, number],
      direction: [number, number, number],
      length: number,
      depth: number,
      parentIndex: number
    ): void {
      if (depth <= 0) return;

      const endPos: [number, number, number] = [
        startPos[0] + direction[0] * length,
        startPos[1] + direction[1] * length,
        startPos[2] + direction[2] * length
      ];

      const currentIndex = nodes.length;
      nodes.push({ position: endPos });

      if (parentIndex >= 0) {
        connectors.push({ startIndex: parentIndex, endIndex: currentIndex });
      }

      if (depth > 1) {
        // Create multiple branches
        const numBranches = depth === maxDepth ? 2 : Math.min(4, Math.floor(complexity / 3));

        for (let i = 0; i < numBranches; i++) {
          const angle = (i - (numBranches - 1) / 2) * branchAngle;
          const newDirection: [number, number, number] = [
            direction[0] * Math.cos(angle) - direction[2] * Math.sin(angle),
            direction[1],
            direction[0] * Math.sin(angle) + direction[2] * Math.cos(angle)
          ];

          addBranch(endPos, newDirection, length * lengthRatio, depth - 1, currentIndex);
        }
      }
    }

    // Start with trunk
    const trunkIndex = nodes.length;
    nodes.push({ position: [x, y - scale, z] });
    addBranch([x, y - scale, z], [0, 1, 0], scale * 2, maxDepth, trunkIndex);

    return { nodes, connectors };
  }
};

export const dodecahedronPreset: ShapePreset = {
  id: 'dodecahedron',
  name: 'Dodecahedron',
  description: 'A regular dodecahedron with 20 vertices and 30 edges',
  category: 'geometric',
  icon: '⬟',
  generate: (options = {}) => {
    const { scale = 1, position = [0, 0, 0] } = options;
    const [x, y, z] = position;
    const nodes: Array<{ position: [number, number, number] }> = [];
    const connectors: Array<{ startIndex: number; endIndex: number }> = [];

    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    const a = scale / Math.sqrt(3);
    const b = a / phi;
    const c = a * phi;

    // Generate vertices of dodecahedron
    const vertices = [
      // Cube vertices
      [a, a, a], [a, a, -a], [a, -a, a], [a, -a, -a],
      [-a, a, a], [-a, a, -a], [-a, -a, a], [-a, -a, -a],
      // Rectangle in yz plane
      [0, c, b], [0, c, -b], [0, -c, b], [0, -c, -b],
      // Rectangle in xz plane
      [b, 0, c], [b, 0, -c], [-b, 0, c], [-b, 0, -c],
      // Rectangle in xy plane
      [c, b, 0], [c, -b, 0], [-c, b, 0], [-c, -b, 0]
    ];

    vertices.forEach(vertex => {
      nodes.push({
        position: [x + vertex[0], y + vertex[1], z + vertex[2]]
      });
    });

    // Define edges (simplified for demonstration)
    const edges = [
      [0, 16], [0, 12], [0, 8], [1, 16], [1, 13], [1, 9],
      [2, 17], [2, 12], [2, 10], [3, 17], [3, 13], [3, 11],
      [4, 18], [4, 14], [4, 8], [5, 18], [5, 15], [5, 9],
      [6, 19], [6, 14], [6, 10], [7, 19], [7, 15], [7, 11],
      [8, 9], [10, 11], [12, 14], [13, 15], [16, 17], [18, 19]
    ];

    edges.forEach(edge => {
      connectors.push({ startIndex: edge[0], endIndex: edge[1] });
    });

    return { nodes, connectors };
  }
};

export const spiralGalaxyPreset: ShapePreset = {
  id: 'spiral-galaxy',
  name: 'Spiral Galaxy',
  description: 'A spiral galaxy structure with multiple arms',
  category: 'mathematical',
  icon: '🌌',
  generate: (options = {}) => {
    const { scale = 1, position = [0, 0, 0], density = 8 } = options;
    const [x, y, z] = position;
    const nodes: Array<{ position: [number, number, number] }> = [];
    const connectors: Array<{ startIndex: number; endIndex: number }> = [];

    const arms = 3;
    const pointsPerArm = Math.max(8, Math.floor(density * 1.5));
    const maxRadius = scale * 3;

    for (let arm = 0; arm < arms; arm++) {
      const armOffset = (arm / arms) * 2 * Math.PI;
      let prevIndex = -1;

      for (let i = 0; i < pointsPerArm; i++) {
        const t = i / (pointsPerArm - 1);
        const radius = t * maxRadius;
        const angle = armOffset + t * 4 * Math.PI; // 2 full rotations

        const x_pos = radius * Math.cos(angle);
        const z_pos = radius * Math.sin(angle);
        const y_pos = (Math.random() - 0.5) * scale * 0.2; // Small vertical variation

        const currentIndex = nodes.length;
        nodes.push({
          position: [x + x_pos, y + y_pos, z + z_pos]
        });

        if (prevIndex >= 0) {
          connectors.push({ startIndex: prevIndex, endIndex: currentIndex });
        }
        prevIndex = currentIndex;
      }
    }

    // Add central bulge
    const bulgeNodes = Math.floor(density / 2);
    for (let i = 0; i < bulgeNodes; i++) {
      const angle = (i / bulgeNodes) * 2 * Math.PI;
      const radius = (scale * 0.5) * Math.random();
      const x_pos = radius * Math.cos(angle);
      const z_pos = radius * Math.sin(angle);
      const y_pos = (Math.random() - 0.5) * scale * 0.1;

      nodes.push({
        position: [x + x_pos, y + y_pos, z + z_pos]
      });
    }

    return { nodes, connectors };
  }
};

export const dnaHelixPreset: ShapePreset = {
  id: 'dna-helix',
  name: 'DNA Double Helix',
  description: 'A double helix structure like DNA',
  category: 'organic',
  icon: '🧬',
  generate: (options = {}) => {
    const { scale = 1, position = [0, 0, 0], complexity = 20 } = options;
    const [x, y, z] = position;
    const nodes: Array<{ position: [number, number, number] }> = [];
    const connectors: Array<{ startIndex: number; endIndex: number }> = [];

    const turns = 2;
    const height = scale * 4;
    const radius = scale * 0.8;
    const points = Math.max(16, Math.floor(complexity));

    // Create two helixes
    for (let helix = 0; helix < 2; helix++) {
      const offset = helix * Math.PI; // 180 degree offset
      const helixNodes: number[] = [];

      for (let i = 0; i < points; i++) {
        const t = (i / (points - 1)) * turns * 2 * Math.PI;
        const y_pos = (i / (points - 1)) * height - height / 2;
        const x_pos = radius * Math.cos(t + offset);
        const z_pos = radius * Math.sin(t + offset);

        const nodeIndex = nodes.length;
        nodes.push({
          position: [x + x_pos, y + y_pos, z + z_pos]
        });
        helixNodes.push(nodeIndex);

        // Connect along helix
        if (i > 0) {
          connectors.push({
            startIndex: helixNodes[i - 1],
            endIndex: nodeIndex
          });
        }
      }

      // Connect between helixes (base pairs)
      if (helix === 1) {
        for (let i = 0; i < points; i += 3) { // Every 3rd point
          const helix1Index = i;
          const helix2Index = helixNodes[i];
          if (helix1Index < nodes.length && helix2Index < nodes.length) {
            connectors.push({
              startIndex: helix1Index,
              endIndex: helix2Index
            });
          }
        }
      }
    }

    return { nodes, connectors };
  }
};

export const crystalLatticePreset: ShapePreset = {
  id: 'crystal-lattice',
  name: 'Crystal Lattice',
  description: 'A 3D crystal lattice structure',
  category: 'architectural',
  icon: '💎',
  generate: (options = {}) => {
    const { scale = 1, position = [0, 0, 0], density = 4 } = options;
    const [x, y, z] = position;
    const nodes: Array<{ position: [number, number, number] }> = [];
    const connectors: Array<{ startIndex: number; endIndex: number }> = [];

    const size = Math.max(2, Math.floor(density / 2));
    const spacing = scale * 0.8;

    // Create 3D grid
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        for (let k = 0; k < size; k++) {
          const nodeIndex = nodes.length;
          nodes.push({
            position: [
              x + (i - (size - 1) / 2) * spacing,
              y + (j - (size - 1) / 2) * spacing,
              z + (k - (size - 1) / 2) * spacing
            ]
          });

          // Connect to adjacent nodes
          if (i > 0) {
            const adjacentIndex = nodeIndex - size * size;
            connectors.push({ startIndex: adjacentIndex, endIndex: nodeIndex });
          }
          if (j > 0) {
            const adjacentIndex = nodeIndex - size;
            connectors.push({ startIndex: adjacentIndex, endIndex: nodeIndex });
          }
          if (k > 0) {
            const adjacentIndex = nodeIndex - 1;
            connectors.push({ startIndex: adjacentIndex, endIndex: nodeIndex });
          }
        }
      }
    }

    return { nodes, connectors };
  }
};

// Export all presets
export const shapePresets: ShapePreset[] = [
  cubePreset,
  pyramidPreset,
  spherePreset,
  helixPreset,
  torusPreset,
  fractalTreePreset,
  dodecahedronPreset,
  spiralGalaxyPreset,
  dnaHelixPreset,
  crystalLatticePreset,
];

export const getPresetsByCategory = (category: string) => {
  return shapePresets.filter(preset => preset.category === category);
};

export const getPresetById = (id: string) => {
  return shapePresets.find(preset => preset.id === id);
};
