import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Animation timing - matching web version
const DOT_DURATION = 800;
const LINE_DURATION = 1000;

interface Point {
  x: number;
  y: number;
  id: number;
}

interface Line {
  from: number;
  to: number;
  id: number;
}

// Generate detailed face mesh for the guide area
function generateFaceMesh(cx: number, cy: number, w: number, h: number): { points: Point[]; lines: Line[] } {
  const points: Point[] = [];
  const lines: Line[] = [];
  
  let id = 0;
  
  // FOREHEAD - multiple rows
  for (let row = 0; row < 4; row++) {
    const rowY = cy - h * 0.45 + row * h * 0.08;
    const rowWidth = 0.6 + row * 0.1;
    const numPoints = 8 + row * 2;
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      points.push({ 
        id: id++, 
        x: cx - w * rowWidth / 2 + w * rowWidth * t, 
        y: rowY 
      });
    }
  }
  
  // LEFT EYE - detailed
  const leftEyeX = cx - w * 0.2;
  const leftEyeY = cy - h * 0.12;
  // Outer ellipse
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    points.push({
      id: id++,
      x: leftEyeX + Math.cos(angle) * w * 0.12,
      y: leftEyeY + Math.sin(angle) * h * 0.05
    });
  }
  // Inner ellipse
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    points.push({
      id: id++,
      x: leftEyeX + Math.cos(angle) * w * 0.06,
      y: leftEyeY + Math.sin(angle) * h * 0.025
    });
  }
  // Pupil
  points.push({ id: id++, x: leftEyeX, y: leftEyeY });
  
  // RIGHT EYE - detailed
  const rightEyeX = cx + w * 0.2;
  const rightEyeY = cy - h * 0.12;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    points.push({
      id: id++,
      x: rightEyeX + Math.cos(angle) * w * 0.12,
      y: rightEyeY + Math.sin(angle) * h * 0.05
    });
  }
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    points.push({
      id: id++,
      x: rightEyeX + Math.cos(angle) * w * 0.06,
      y: rightEyeY + Math.sin(angle) * h * 0.025
    });
  }
  points.push({ id: id++, x: rightEyeX, y: rightEyeY });
  
  // NOSE BRIDGE
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    points.push({ id: id++, x: cx, y: cy - h * 0.15 + h * 0.25 * t });
  }
  
  // NOSE SIDES
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const spread = 0.03 + t * 0.05;
      points.push({ 
        id: id++, 
        x: cx + side * w * spread, 
        y: cy - h * 0.05 + h * 0.15 * t 
      });
    }
  }
  
  // NOSE BASE
  for (let i = -4; i <= 4; i++) {
    points.push({ id: id++, x: cx + w * 0.025 * i, y: cy + h * 0.1 });
  }
  
  // NOSTRILS
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI + (side > 0 ? 0 : Math.PI);
      points.push({
        id: id++,
        x: cx + side * w * 0.06 + Math.cos(angle) * w * 0.025,
        y: cy + h * 0.08 + Math.sin(angle) * h * 0.015
      });
    }
  }
  
  // CHEEKS - left
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      points.push({
        id: id++,
        x: cx - w * 0.48 + col * w * 0.07,
        y: cy - h * 0.1 + row * h * 0.1
      });
    }
  }
  
  // CHEEKS - right
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      points.push({
        id: id++,
        x: cx + w * 0.27 + col * w * 0.07,
        y: cy - h * 0.1 + row * h * 0.1
      });
    }
  }
  
  // UPPER LIP
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const curve = Math.sin(t * Math.PI) * h * 0.02;
    points.push({
      id: id++,
      x: cx - w * 0.2 + w * 0.4 * t,
      y: cy + h * 0.2 - curve
    });
  }
  
  // LOWER LIP
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const curve = Math.sin(t * Math.PI) * h * 0.03;
    points.push({
      id: id++,
      x: cx - w * 0.2 + w * 0.4 * t,
      y: cy + h * 0.28 + curve
    });
  }
  
  // MOUTH LINE
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    points.push({
      id: id++,
      x: cx - w * 0.15 + w * 0.3 * t,
      y: cy + h * 0.23
    });
  }
  
  // JAW - left
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const curve = Math.sin(t * Math.PI * 0.6) * w * 0.08;
    points.push({
      id: id++,
      x: cx - w * 0.5 + curve,
      y: cy - h * 0.05 + h * 0.55 * t
    });
  }
  
  // JAW - right
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const curve = Math.sin(t * Math.PI * 0.6) * w * 0.08;
    points.push({
      id: id++,
      x: cx + w * 0.5 - curve,
      y: cy - h * 0.05 + h * 0.55 * t
    });
  }
  
  // CHIN
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const curve = Math.sin(t * Math.PI) * h * 0.05;
    points.push({
      id: id++,
      x: cx - w * 0.35 + w * 0.7 * t,
      y: cy + h * 0.48 - curve
    });
  }
  
  // Generate connections (tesselation)
  let lineId = 0;
  for (let i = 0; i < points.length; i++) {
    if (i + 1 < points.length) lines.push({ id: lineId++, from: i, to: i + 1 });
    if (i + 2 < points.length && i % 2 === 0) lines.push({ id: lineId++, from: i, to: i + 2 });
    if (i + 3 < points.length && i % 3 === 0) lines.push({ id: lineId++, from: i, to: i + 3 });
    if (i + 5 < points.length && i % 4 === 0) lines.push({ id: lineId++, from: i, to: i + 5 });
    if (i + 10 < points.length && i % 6 === 0) lines.push({ id: lineId++, from: i, to: i + 10 });
  }
  
  return { points, lines };
}

// Sort by distance from center
function sortByDistance(points: Point[], cx: number, cy: number): number[] {
  return points
    .map((p, i) => ({ index: i, dist: Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2) }))
    .sort((a, b) => b.dist - a.dist)
    .map(x => x.index);
}

interface ARMeshCameraProps {
  onBack: () => void;
}

export default function ARMeshCamera({ onBack }: ARMeshCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);
  const [hasShownInfo, setHasShownInfo] = useState(false);
  const animStartTime = useRef<number | null>(null);
  
  // Face guide area (where user should position face)
  const guideX = SCREEN_WIDTH / 2;
  const guideY = SCREEN_HEIGHT * 0.38;
  const guideW = SCREEN_WIDTH * 0.75;
  const guideH = SCREEN_HEIGHT * 0.5;
  
  // Generate mesh for guide area
  const meshData = useRef(generateFaceMesh(guideX, guideY, guideW, guideH));
  const sortedIndices = useRef(sortByDistance(meshData.current.points, guideX, guideY));
  
  // Show info alert on first use
  useEffect(() => {
    if (!hasShownInfo) {
      setHasShownInfo(true);
      setTimeout(() => {
        Alert.alert(
          '📱 Expo Go Limitation',
          'Real-time face tracking requires native modules not available in Expo Go.\n\n' +
          'This demo shows what the AR mesh looks like. For production, you\'d need a custom development build with expo-face-detector.\n\n' +
          'Position your face in the guide oval to see the mesh effect!',
          [{ text: 'Got it!' }]
        );
      }, 500);
    }
  }, [hasShownInfo]);
  
  // Animation loop
  useEffect(() => {
    if (!isScanning) {
      setAnimProgress(0);
      animStartTime.current = null;
      return;
    }
    
    animStartTime.current = Date.now();
    let frameId: number;
    
    const animate = () => {
      if (!animStartTime.current || !isScanning) return;
      
      const elapsed = Date.now() - animStartTime.current;
      const totalDuration = DOT_DURATION + LINE_DURATION;
      const progress = Math.min(elapsed / totalDuration, 1);
      setAnimProgress(progress);
      
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };
    
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isScanning]);
  
  // Permission handling
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <LinearGradient colors={['#FAF8F3', '#E8E4DB']} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#7A9370" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>AR Face Mesh</Text>
              <View style={{ width: 40 }} />
            </View>
            
            <View style={styles.permissionContainer}>
              <Ionicons name="camera" size={80} color="#9CAF88" />
              <Text style={styles.permissionTitle}>Camera Access Needed</Text>
              <Text style={styles.permissionText}>
                Grant camera permission to see the AR face mesh demo
              </Text>
              <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                <Text style={styles.permissionBtnText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }
  
  // Animation calculations
  const totalTime = DOT_DURATION + LINE_DURATION;
  const elapsed = animProgress * totalTime;
  const dotProgress = Math.min(elapsed / DOT_DURATION, 1);
  const lineProgress = dotProgress >= 1 ? Math.min((elapsed - DOT_DURATION) / LINE_DURATION, 1) : 0;
  
  const { points, lines } = meshData.current;
  const dotsToShow = Math.floor(points.length * dotProgress);
  const visibleDots = new Set(sortedIndices.current.slice(0, dotsToShow));
  const linesToShow = Math.floor(lines.length * lineProgress);
  const visibleLines = lines.slice(0, linesToShow).filter(l => visibleDots.has(l.from) && visibleDots.has(l.to));
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Camera */}
      <CameraView style={styles.camera} facing="front" />
      
      {/* Face guide oval */}
      <View style={styles.guideContainer} pointerEvents="none">
        <View style={[styles.guideOval, {
          left: guideX - guideW / 2,
          top: guideY - guideH / 2,
          width: guideW,
          height: guideH,
          opacity: isScanning ? 0.3 : 0.8,
        }]} />
      </View>
      
      {/* Mesh overlay */}
      {isScanning && (
        <View style={styles.meshOverlay} pointerEvents="none">
          {/* Lines */}
          {visibleLines.map(line => {
            const from = points[line.from];
            const to = points[line.to];
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            return (
              <View
                key={`line-${line.id}`}
                style={[styles.line, {
                  left: from.x,
                  top: from.y,
                  width: length,
                  transform: [{ rotate: `${angle}deg` }],
                }]}
              />
            );
          })}
          
          {/* Dots */}
          {sortedIndices.current.slice(0, dotsToShow).map(idx => {
            const p = points[idx];
            return (
              <View
                key={`dot-${p.id}`}
                style={[styles.dot, { left: p.x - 3, top: p.y - 3 }]}
              />
            );
          })}
        </View>
      )}
      
      {/* Header */}
      <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent']} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: '#fff' }]}>AR Face Mesh</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      {/* Status */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, { backgroundColor: isScanning ? '#10B981' : '#6B7280' }]} />
        <Text style={styles.statusText}>
          {!isScanning ? 'Position face in oval, tap Start' :
           dotProgress < 1 ? `Mapping face... ${Math.round(dotProgress * 100)}%` :
           lineProgress < 1 ? `Connecting mesh... ${Math.round(lineProgress * 100)}%` :
           `AR Mesh Demo • ${points.length} points`}
        </Text>
      </View>
      
      {/* Instructions */}
      {!isScanning && (
        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>📍 Position Your Face</Text>
          <Text style={styles.instructionText}>
            Align your face with the oval guide above, then tap "Start AR Mesh" to see the mesh animation.
          </Text>
          <View style={styles.noteBox}>
            <Ionicons name="information-circle" size={16} color="#F59E0B" />
            <Text style={styles.noteText}>
              Note: Real face tracking requires a custom dev build. This is a positioning guide demo.
            </Text>
          </View>
        </View>
      )}
      
      {/* Controls */}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.bottomGradient}>
        <SafeAreaView>
          <View style={styles.controls}>
            {!isScanning ? (
              <TouchableOpacity style={styles.startBtn} onPress={() => setIsScanning(true)}>
                <LinearGradient colors={['#9CAF88', '#7A9370']} style={styles.startBtnGradient}>
                  <Ionicons name="scan" size={24} color="#fff" />
                  <Text style={styles.startBtnText}>Start AR Mesh</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.controlRow}>
                <TouchableOpacity 
                  style={styles.resetBtn} 
                  onPress={() => {
                    animStartTime.current = Date.now();
                    setAnimProgress(0);
                  }}
                >
                  <Ionicons name="refresh" size={22} color="#fff" />
                  <Text style={styles.resetBtnText}>Replay</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.stopBtn} onPress={() => setIsScanning(false)}>
                  <Ionicons name="stop" size={22} color="#fff" />
                  <Text style={styles.stopBtnText}>Stop</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  camera: { ...StyleSheet.absoluteFillObject },
  
  guideContainer: { ...StyleSheet.absoluteFillObject, zIndex: 5 },
  guideOval: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#10B981',
    borderRadius: 1000,
    borderStyle: 'dashed',
  },
  
  meshOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  
  line: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transformOrigin: 'left center',
  },
  
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7A9370',
  },
  
  statusBar: {
    position: 'absolute',
    top: 95,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    zIndex: 30,
  },
  
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  instructionBox: {
    position: 'absolute',
    bottom: 160,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 16,
    padding: 20,
    zIndex: 25,
  },
  
  instructionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  
  noteText: {
    color: '#F59E0B',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  
  controls: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 20,
  },
  
  startBtn: {
    width: SCREEN_WIDTH - 80,
    borderRadius: 30,
    overflow: 'hidden',
  },
  
  startBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  
  startBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  
  controlRow: {
    flexDirection: 'row',
    gap: 16,
  },
  
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 30,
  },
  
  resetBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 30,
  },
  
  stopBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7A9370',
    marginTop: 24,
    marginBottom: 12,
  },
  
  permissionText: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    marginBottom: 32,
  },
  
  permissionBtn: {
    backgroundColor: '#9CAF88',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  
  permissionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
