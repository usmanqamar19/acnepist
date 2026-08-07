import { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, Dimensions, Animated } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Animation settings - matching web version exactly
const DOT_APPEAR_DURATION = 800;
const LINE_APPEAR_DURATION = 1000;

interface MeshPoint {
  x: number;
  y: number;
  id: number;
}

interface MeshLine {
  from: number;
  to: number;
  id: number;
}

// Generate rich mesh points from face bounds - works with Expo Camera format
function generateMeshPoints(face: any): MeshPoint[] {
  if (!face) return [];

  // Expo Camera returns bounds as { origin: { x, y }, size: { width, height } }
  // OR sometimes as { x, y, width, height }
  let bounds: { x: number; y: number; width: number; height: number };
  
  if (face.bounds) {
    if (face.bounds.origin) {
      // Format: { origin: { x, y }, size: { width, height } }
      bounds = {
        x: face.bounds.origin.x,
        y: face.bounds.origin.y,
        width: face.bounds.size?.width || face.bounds.width || 200,
        height: face.bounds.size?.height || face.bounds.height || 300
      };
    } else {
      // Format: { x, y, width, height }
      bounds = {
        x: face.bounds.x || 0,
        y: face.bounds.y || 0,
        width: face.bounds.width || 200,
        height: face.bounds.height || 300
      };
    }
  } else {
    // Fallback - center of screen
    bounds = {
      x: SCREEN_WIDTH * 0.15,
      y: SCREEN_HEIGHT * 0.2,
      width: SCREEN_WIDTH * 0.7,
      height: SCREEN_HEIGHT * 0.5
    };
  }

  const points: MeshPoint[] = [];
  let id = 0;

  // Helper to get face landmark position
  const getLandmark = (name: string, fallbackX: number, fallbackY: number) => {
    if (face[name]) {
      return { x: face[name].x, y: face[name].y };
    }
    return {
      x: bounds.x + bounds.width * fallbackX,
      y: bounds.y + bounds.height * fallbackY
    };
  };

  // Key landmarks
  const leftEye = getLandmark('leftEyePosition', 0.3, 0.35);
  const rightEye = getLandmark('rightEyePosition', 0.7, 0.35);
  const nose = getLandmark('noseBasePosition', 0.5, 0.55);
  const leftMouth = getLandmark('leftMouthPosition', 0.35, 0.72);
  const rightMouth = getLandmark('rightMouthPosition', 0.65, 0.72);
  const bottomMouth = getLandmark('bottomMouthPosition', 0.5, 0.78);

  // FOREHEAD (top row)
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    points.push({ id: id++, x: bounds.x + bounds.width * (0.2 + t * 0.6), y: bounds.y + bounds.height * 0.1 });
  }

  // UPPER FOREHEAD
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    points.push({ id: id++, x: bounds.x + bounds.width * (0.15 + t * 0.7), y: bounds.y + bounds.height * 0.18 });
  }

  // EYEBROW LEVEL
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    points.push({ id: id++, x: bounds.x + bounds.width * (0.1 + t * 0.8), y: bounds.y + bounds.height * 0.28 });
  }

  // LEFT EYE (circle)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    points.push({
      id: id++,
      x: leftEye.x + Math.cos(angle) * bounds.width * 0.07,
      y: leftEye.y + Math.sin(angle) * bounds.height * 0.04
    });
  }
  points.push({ id: id++, x: leftEye.x, y: leftEye.y }); // Center

  // RIGHT EYE (circle)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    points.push({
      id: id++,
      x: rightEye.x + Math.cos(angle) * bounds.width * 0.07,
      y: rightEye.y + Math.sin(angle) * bounds.height * 0.04
    });
  }
  points.push({ id: id++, x: rightEye.x, y: rightEye.y }); // Center

  // NOSE BRIDGE (vertical line of points)
  const midEyeX = (leftEye.x + rightEye.x) / 2;
  const midEyeY = (leftEye.y + rightEye.y) / 2;
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    points.push({ id: id++, x: midEyeX, y: midEyeY + (nose.y - midEyeY) * t });
  }

  // NOSE BASE (horizontal)
  for (let i = -2; i <= 2; i++) {
    points.push({ id: id++, x: nose.x + bounds.width * 0.04 * i, y: nose.y });
  }

  // LEFT CHEEK
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      points.push({
        id: id++,
        x: bounds.x + bounds.width * (0.08 + col * 0.06),
        y: leftEye.y + bounds.height * (0.1 + row * 0.1)
      });
    }
  }

  // RIGHT CHEEK
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      points.push({
        id: id++,
        x: bounds.x + bounds.width * (0.74 + col * 0.06),
        y: rightEye.y + bounds.height * (0.1 + row * 0.1)
      });
    }
  }

  // UPPER LIP
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    points.push({ id: id++, x: leftMouth.x + (rightMouth.x - leftMouth.x) * t, y: leftMouth.y });
  }

  // LOWER LIP
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    points.push({ id: id++, x: leftMouth.x + (rightMouth.x - leftMouth.x) * t, y: bottomMouth.y });
  }

  // MOUTH CENTER
  points.push({ id: id++, x: bottomMouth.x, y: (leftMouth.y + bottomMouth.y) / 2 });

  // LEFT JAW
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    points.push({
      id: id++,
      x: bounds.x + bounds.width * (0.05 + t * 0.2),
      y: bounds.y + bounds.height * (0.45 + t * 0.45)
    });
  }

  // RIGHT JAW
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    points.push({
      id: id++,
      x: bounds.x + bounds.width * (0.75 + t * 0.2),
      y: bounds.y + bounds.height * (0.45 + t * 0.45)
    });
  }

  // CHIN
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    points.push({
      id: id++,
      x: bounds.x + bounds.width * (0.25 + t * 0.5),
      y: bounds.y + bounds.height * 0.95 - Math.sin(t * Math.PI) * bounds.height * 0.03
    });
  }

  // FACE OUTLINE - LEFT
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    points.push({
      id: id++,
      x: bounds.x + bounds.width * 0.05,
      y: bounds.y + bounds.height * (0.2 + t * 0.7)
    });
  }

  // FACE OUTLINE - RIGHT
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    points.push({
      id: id++,
      x: bounds.x + bounds.width * 0.95,
      y: bounds.y + bounds.height * (0.2 + t * 0.7)
    });
  }

  return points;
}

// Generate connections between points
function generateConnections(points: MeshPoint[]): MeshLine[] {
  const lines: MeshLine[] = [];
  let lineId = 0;

  // Connect sequential points and nearby points
  for (let i = 0; i < points.length; i++) {
    // Connect to next point
    if (i + 1 < points.length) {
      lines.push({ id: lineId++, from: i, to: i + 1 });
    }
    // Connect to points 3-5 away for more mesh
    if (i + 3 < points.length && i % 2 === 0) {
      lines.push({ id: lineId++, from: i, to: i + 3 });
    }
    if (i + 7 < points.length && i % 4 === 0) {
      lines.push({ id: lineId++, from: i, to: i + 7 });
    }
  }

  return lines;
}

// Sort points by distance from center (edges first)
function sortByDistanceFromCenter(points: MeshPoint[]): number[] {
  if (points.length === 0) return [];

  let cx = 0, cy = 0;
  points.forEach(p => { cx += p.x; cy += p.y; });
  cx /= points.length;
  cy /= points.length;

  const withDist = points.map((p, i) => ({
    index: i,
    dist: Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)
  }));

  withDist.sort((a, b) => b.dist - a.dist); // Furthest first
  return withDist.map(w => w.index);
}

// Main component
export default function DynamicFaceMeshOverlay({ isScanning, face }: { isScanning: boolean; face: any }) {
  const [animProgress, setAnimProgress] = useState(0);
  const animStartTime = useRef<number | null>(null);
  const lastFaceId = useRef<string | null>(null);

  // Generate mesh data
  const { points, lines, sortedIndices } = useMemo(() => {
    const pts = generateMeshPoints(face);
    const lns = generateConnections(pts);
    const sorted = sortByDistanceFromCenter(pts);
    return { points: pts, lines: lns, sortedIndices: sorted };
  }, [face]);

  // Animation loop
  useEffect(() => {
    if (!isScanning || !face || points.length === 0) {
      setAnimProgress(0);
      animStartTime.current = null;
      return;
    }

    // Check if this is a new face
    const faceId = face.faceID?.toString() || `${face.bounds?.x || 0}-${face.bounds?.y || 0}`;
    if (faceId !== lastFaceId.current) {
      animStartTime.current = Date.now();
      lastFaceId.current = faceId;
    }

    if (!animStartTime.current) {
      animStartTime.current = Date.now();
    }

    const animate = () => {
      if (!animStartTime.current || !isScanning) return;
      const elapsed = Date.now() - animStartTime.current;
      const totalDuration = DOT_APPEAR_DURATION + LINE_APPEAR_DURATION;
      const progress = Math.min(elapsed / totalDuration, 1);
      setAnimProgress(progress);
    };

    const interval = setInterval(animate, 16);
    animate();

    return () => clearInterval(interval);
  }, [isScanning, face, points.length]);

  // Don't render if not scanning or no face
  if (!isScanning || !face || points.length === 0) {
    return null;
  }

  // Calculate what to show based on animation progress
  const totalAnimTime = DOT_APPEAR_DURATION + LINE_APPEAR_DURATION;
  const elapsed = animProgress * totalAnimTime;
  const dotProgress = Math.min(elapsed / DOT_APPEAR_DURATION, 1);
  const lineProgress = dotProgress >= 1 ? Math.min((elapsed - DOT_APPEAR_DURATION) / LINE_APPEAR_DURATION, 1) : 0;

  const dotsToShow = Math.floor(points.length * dotProgress);
  const visibleDotIndices = new Set(sortedIndices.slice(0, dotsToShow));

  const linesToShow = Math.floor(lines.length * lineProgress);
  const visibleLines = lines.slice(0, linesToShow).filter(line => 
    visibleDotIndices.has(line.from) && visibleDotIndices.has(line.to)
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Render lines first (behind dots) */}
      {visibleLines.map(line => {
        const from = points[line.from];
        const to = points[line.to];
        if (!from || !to) return null;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        return (
          <View
            key={`line-${line.id}`}
            style={[
              styles.line,
              {
                left: from.x,
                top: from.y,
                width: length,
                transform: [{ rotate: `${angle}deg` }],
              }
            ]}
          />
        );
      })}

      {/* Render dots */}
      {sortedIndices.slice(0, dotsToShow).map(idx => {
        const point = points[idx];
        if (!point) return null;
        return (
          <View
            key={`dot-${point.id}`}
            style={[
              styles.dot,
              { left: point.x - 3, top: point.y - 3 }
            ]}
          />
        );
      })}

      {/* Status indicator */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, { backgroundColor: dotProgress > 0 ? '#10B981' : '#EF4444' }]} />
        <Text style={styles.statusText}>
          {dotProgress < 1 
            ? `MAPPING FACE... ${Math.round(dotProgress * 100)}%` 
            : lineProgress < 1 
              ? `CONNECTING MESH... ${Math.round(lineProgress * 100)}%`
              : `AR MESH ACTIVE • ${points.length} POINTS`
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  line: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transformOrigin: 'left center',
  },
  statusBar: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
