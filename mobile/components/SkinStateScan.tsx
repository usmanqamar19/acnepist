import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Alert, Dimensions, LayoutChangeEvent } from 'react-native';
import { CameraView, useCameraPermissions, FaceDetectionResult } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { StatusBar } from 'expo-status-bar';
import DynamicFaceMeshOverlay from './DynamicFaceMeshOverlay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Roboflow API Configuration
// Supply your own key via an EXPO_PUBLIC_ROBOFLOW_API_KEY entry in a local .env file.
const ROBOFLOW_API_KEY = process.env.EXPO_PUBLIC_ROBOFLOW_API_KEY ?? 'YOUR_ROBOFLOW_API_KEY';
const ROBOFLOW_PROJECT = 'skin-problem-detection-relabel-clean3-o641f';
const ROBOFLOW_VERSION = '1';
const ROBOFLOW_URL = `https://detect.roboflow.com/${ROBOFLOW_PROJECT}/${ROBOFLOW_VERSION}?api_key=${ROBOFLOW_API_KEY}`;
// Skin condition types (keeping your existing skin conditions)
interface SkinConditionInfo {
  therapeuticName: string;
  clinicalName: string;
  description: string;
  whatItLooksLike: string;
  careTip: string;
  severity: 'mild' | 'moderate' | 'needs-attention';
  color: string;
  emoji: string;
}

const SKIN_CONDITIONS: Record<string, SkinConditionInfo> = {
  'whitehead': {
    therapeuticName: 'Closed Surface Bumps',
    clinicalName: 'Whiteheads',
    description: 'Small bumps where the pore is closed, trapping oil and dead skin cells inside.',
    whatItLooksLike: 'Flesh-colored or white small bumps on the skin surface',
    careTip: 'Gentle exfoliation with salicylic acid can help. Avoid squeezing!',
    severity: 'mild',
    color: '#10B981',
    emoji: '⚪',
  },
  'whiteheads': {
    therapeuticName: 'Closed Surface Bumps',
    clinicalName: 'Whiteheads',
    description: 'Small bumps where the pore is closed, trapping oil and dead skin cells inside.',
    whatItLooksLike: 'Flesh-colored or white small bumps on the skin surface',
    careTip: 'Gentle exfoliation with salicylic acid can help. Avoid squeezing!',
    severity: 'mild',
    color: '#10B981',
    emoji: '⚪',
  },
  'blackhead': {
    therapeuticName: 'Open Pore Congestion',
    clinicalName: 'Blackheads',
    description: 'Open pores where trapped material oxidizes and turns dark when exposed to air.',
    whatItLooksLike: 'Small dark spots, usually on nose, chin, or forehead',
    careTip: 'Clay masks and pore strips can help. Keep skin clean but not over-dried.',
    severity: 'mild',
    color: '#374151',
    emoji: '⚫',
  },
  'blackheads': {
    therapeuticName: 'Open Pore Congestion',
    clinicalName: 'Blackheads',
    description: 'Open pores where trapped material oxidizes and turns dark when exposed to air.',
    whatItLooksLike: 'Small dark spots, usually on nose, chin, or forehead',
    careTip: 'Clay masks and pore strips can help. Keep skin clean but not over-dried.',
    severity: 'mild',
    color: '#374151',
    emoji: '⚫',
  },
  'pustule': {
    therapeuticName: 'Surface Spots with Fluid',
    clinicalName: 'Pustules',
    description: 'Inflamed bumps filled with pus, typically with a visible white or yellow center.',
    whatItLooksLike: 'Red bumps with a white or yellow tip containing fluid',
    careTip: 'Spot treatment with benzoyl peroxide. Never pop - it can cause scarring!',
    severity: 'moderate',
    color: '#F59E0B',
    emoji: '🟡',
  },
  'pustules': {
    therapeuticName: 'Surface Spots with Fluid',
    clinicalName: 'Pustules',
    description: 'Inflamed bumps filled with pus, typically with a visible white or yellow center.',
    whatItLooksLike: 'Red bumps with a white or yellow tip containing fluid',
    careTip: 'Spot treatment with benzoyl peroxide. Never pop - it can cause scarring!',
    severity: 'moderate',
    color: '#F59E0B',
    emoji: '🟡',
  },
  'pimple': {
    therapeuticName: 'Surface Spot',
    clinicalName: 'Pimple',
    description: 'A general term for a raised bump on the skin caused by clogged pores.',
    whatItLooksLike: 'Red or skin-colored bump that may be tender to touch',
    careTip: 'Keep clean, use gentle products, and let it heal naturally.',
    severity: 'moderate',
    color: '#F59E0B',
    emoji: '🔴',
  },
  'pimples': {
    therapeuticName: 'Surface Spots',
    clinicalName: 'Pimples',
    description: 'Raised bumps on the skin caused by clogged pores.',
    whatItLooksLike: 'Red or skin-colored bumps that may be tender to touch',
    careTip: 'Keep clean, use gentle products, and let them heal naturally.',
    severity: 'moderate',
    color: '#F59E0B',
    emoji: '🔴',
  },
  'papule': {
    therapeuticName: 'Small Sensitive Bumps',
    clinicalName: 'Papules',
    description: 'Small, solid, raised bumps caused by inflammation. No visible pus inside.',
    whatItLooksLike: 'Small red or pink bumps without a "head"',
    careTip: 'Be gentle! Harsh products can make them worse. Try niacinamide.',
    severity: 'moderate',
    color: '#EF4444',
    emoji: '🔺',
  },
  'papules': {
    therapeuticName: 'Small Sensitive Bumps',
    clinicalName: 'Papules',
    description: 'Small, solid, raised bumps caused by inflammation. No visible pus inside.',
    whatItLooksLike: 'Small red or pink bumps without a "head"',
    careTip: 'Be gentle! Harsh products can make them worse. Try niacinamide.',
    severity: 'moderate',
    color: '#EF4444',
    emoji: '🔺',
  },
  'nodule': {
    therapeuticName: 'Deep Under-Skin Bumps',
    clinicalName: 'Nodules',
    description: 'Large, hard bumps deep under the skin. More serious and can be painful.',
    whatItLooksLike: 'Large, firm lumps you can feel under the skin',
    careTip: 'Professional care recommended. Don\'t try to squeeze - it won\'t work and can scar.',
    severity: 'needs-attention',
    color: '#DC2626',
    emoji: '🟤',
  },
  'nodules': {
    therapeuticName: 'Deep Under-Skin Bumps',
    clinicalName: 'Nodules',
    description: 'Large, hard bumps deep under the skin. More serious and can be painful.',
    whatItLooksLike: 'Large, firm lumps you can feel under the skin',
    careTip: 'Professional care recommended. Don\'t try to squeeze - it won\'t work and can scar.',
    severity: 'needs-attention',
    color: '#DC2626',
    emoji: '🟤',
  },
  'cyst': {
    therapeuticName: 'Deep Sensitive Areas',
    clinicalName: 'Cysts',
    description: 'Large, painful, pus-filled lumps deep under the skin. The most severe type.',
    whatItLooksLike: 'Large, soft, painful lumps deep beneath the surface',
    careTip: 'See a dermatologist. These need professional treatment to prevent scarring.',
    severity: 'needs-attention',
    color: '#991B1B',
    emoji: '⭕',
  },
  'cysts': {
    therapeuticName: 'Deep Sensitive Areas',
    clinicalName: 'Cysts',
    description: 'Large, painful, pus-filled lumps deep under the skin. The most severe type.',
    whatItLooksLike: 'Large, soft, painful lumps deep beneath the surface',
    careTip: 'See a dermatologist. These need professional treatment to prevent scarring.',
    severity: 'needs-attention',
    color: '#991B1B',
    emoji: '⭕',
  },
  'cystic': {
    therapeuticName: 'Deep Sensitive Areas',
    clinicalName: 'Cystic Acne',
    description: 'Large, painful, pus-filled lumps deep under the skin. The most severe type.',
    whatItLooksLike: 'Large, soft, painful lumps deep beneath the surface',
    careTip: 'See a dermatologist. These need professional treatment to prevent scarring.',
    severity: 'needs-attention',
    color: '#991B1B',
    emoji: '⭕',
  },
  'acne': {
    therapeuticName: 'Surface Activity',
    clinicalName: 'Acne',
    description: 'General skin activity in this area that may include various types of blemishes.',
    whatItLooksLike: 'Mix of bumps, redness, or congestion',
    careTip: 'Consistent gentle routine is key. Cleanser, treatment, moisturizer.',
    severity: 'moderate',
    color: '#F59E0B',
    emoji: '✦',
  },
  'redness': {
    therapeuticName: 'Sensitivity & Warmth',
    clinicalName: 'Redness/Inflammation',
    description: 'Areas showing redness or sensitivity, possibly from irritation or inflammation.',
    whatItLooksLike: 'Pink or red patches on the skin',
    careTip: 'Soothing ingredients like aloe, centella, or green tea can help calm redness.',
    severity: 'mild',
    color: '#F87171',
    emoji: '🌸',
  },
};

const DEFAULT_CONDITION: SkinConditionInfo = {
  therapeuticName: 'Skin Activity',
  clinicalName: 'Detected Area',
  description: 'An area that our AI noticed during the scan.',
  whatItLooksLike: 'A noticeable area on the skin',
  careTip: 'Keep the area clean and monitor for changes.',
  severity: 'mild',
  color: '#64748B',
  emoji: '•',
};

function getConditionInfo(label: string): SkinConditionInfo {
  const lower = label.toLowerCase().trim();
  return SKIN_CONDITIONS[lower] || DEFAULT_CONDITION;
}

interface Detection {
  class: string;
  confidence: number;
}

interface GroupedDetection {
  info: SkinConditionInfo;
  count: number;
  avgConfidence: number;
}

interface ScanResult {
  clarityScore: number;
  groupedDetections: GroupedDetection[];
  totalDetections: number;
  overallSeverity: 'calm' | 'mild' | 'moderate' | 'needs-attention';
}

export default function SkinStateScan({ onBack }: { onBack: () => void }) {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  // Remove capturedImage from state to keep Live Scanning active
  const [permission, requestPermission] = useCameraPermissions();
  const [statusText, setStatusText] = useState('');
  const [faceData, setFaceData] = useState<any>(null); 
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraLayout, setCameraLayout] = useState<{ width: number; height: number }>({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
  const cameraRef = useRef<CameraView>(null);

  // Handle face detection from camera
  const handleFacesDetected = ({ faces }: FaceDetectionResult) => {
    // Keep updating face bounds even while scanning for the live effect
    if (!cameraLayout) return;

    if (!faces.length) {
      if (!isScanning) {
        setFaceData(null);
        setFaceDetected(false);
      }
      return;
    }

    const face = faces[0];
    setFaceData(face);
    setFaceDetected(true);
  };

  const handleCameraLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCameraLayout({ width, height });
  };

  const captureAndAnalyze = async () => {
    if (!cameraRef.current) return;
    
    // 1. Start UI Animation immediately (Live tracking mode)
    setIsScanning(true);
    setStatusText('Mapping facial features...');
    
    // 2. Capture Image for AI Analysis (Background process)
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, exif: false });
      if (cameraRef.current) cameraRef.current.resumePreview(); // Resume preview for live tracking
      if (!photo?.uri) throw new Error('Failed to capture');
      
      // 3. Process image in background
      const analysisPromise = (async () => {
        const resized = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 640 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        const response = await fetch(ROBOFLOW_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: resized.base64,
        });

        if (!response.ok) throw new Error('Analysis failed');

        const data = await response.json();
        return (data.predictions || []).map((p: any) => ({
          class: p.class,
          confidence: p.confidence,
        }));
      })();

      // Force animation to run for at least 3 seconds
      const animationPromise = new Promise(resolve => setTimeout(resolve, 3500));
      
      // Wait for both
      const [detections] = await Promise.all([analysisPromise, animationPromise]);
      
      setStatusText('Generating report...');
      await new Promise(r => setTimeout(r, 600)); 

      setResult(processDetections(detections));
      
    } catch (error) {
      Alert.alert('Oops!', "Let's try again with better lighting.", [
        { text: 'OK', onPress: () => {
          setIsScanning(false);
          setResult(null);
        }}
      ]);
      setIsScanning(false);
    } finally {
      setStatusText('');
    }
  };

  const processDetections = (detections: Detection[]): ScanResult => {
    const groups: Record<string, { info: SkinConditionInfo; count: number; totalConf: number }> = {};
    
    detections.forEach(d => {
      const info = getConditionInfo(d.class);
      const key = info.clinicalName;
      if (!groups[key]) groups[key] = { info, count: 0, totalConf: 0 };
      groups[key].count++;
      groups[key].totalConf += d.confidence;
    });

    const groupedDetections = Object.values(groups)
      .map(g => ({ info: g.info, count: g.count, avgConfidence: g.totalConf / g.count }))
      .sort((a, b) => {
        const sev = { 'needs-attention': 0, 'moderate': 1, 'mild': 2 };
        return sev[a.info.severity] - sev[b.info.severity] || b.count - a.count;
      });

    let overallSeverity: 'calm' | 'mild' | 'moderate' | 'needs-attention' = 'calm';
    if (groupedDetections.some(g => g.info.severity === 'needs-attention')) overallSeverity = 'needs-attention';
    else if (groupedDetections.some(g => g.info.severity === 'moderate')) overallSeverity = 'moderate';
    else if (groupedDetections.length > 0) overallSeverity = 'mild';

    const total = detections.length;
    const severe = groupedDetections.filter(g => g.info.severity === 'needs-attention').reduce((s, g) => s + g.count, 0);
    const moderate = groupedDetections.filter(g => g.info.severity === 'moderate').reduce((s, g) => s + g.count, 0);
    const mild = groupedDetections.filter(g => g.info.severity === 'mild').reduce((s, g) => s + g.count, 0);
    const clarityScore = Math.max(1, Math.round((10 - severe * 2 - moderate * 1 - mild * 0.3) * 10) / 10);

    return { clarityScore, groupedDetections, totalDetections: total, overallSeverity };
  };

  const getSeverityGradient = (sev: string): [string, string] => {
    if (sev === 'needs-attention') return ['#DC2626', '#EF4444'];
    if (sev === 'moderate') return ['#F59E0B', '#FBBF24'];
    if (sev === 'mild') return ['#10B981', '#34D399'];
    return ['#3B82F6', '#60A5FA'];
  };

  if (!permission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0F2FE' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0F2FE', padding: 32 }}>
        <Ionicons name="camera-outline" size={64} color="#3B82F6" />
        <Text style={{ fontSize: 18, color: '#1E293B', fontWeight: '500', marginTop: 16, marginBottom: 24 }}>Camera access needed</Text>
        <TouchableOpacity onPress={requestPermission}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={{ paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Grant Access</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden={false} />
      {!result ? (
        <>
          {/* Always show LIVE Camera */}
          <CameraView 
            ref={cameraRef} 
            style={styles.camera} 
            facing="front"
            onFacesDetected={handleFacesDetected}
            onLayout={handleCameraLayout}
            faceDetectorSettings={{
              mode: 'fast',
              detectLandmarks: 'all',
              runClassifications: 'none',
              minDetectionInterval: 50,
              tracking: true,
            }}
          />
          
          {/* Header overlay */}
          <View style={styles.headerOverlay} pointerEvents="none">
            <SafeAreaView>
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={onBack} style={[styles.backBtn, { pointerEvents: 'auto' }]}>
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Skin Check-In</Text>
                <View style={{ width: 40 }} />
              </View>
            </SafeAreaView>
          </View>
          
          {/* Dynamic face mesh animation overlay - Live Tracking */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 }} pointerEvents="none">
             <DynamicFaceMeshOverlay isScanning={isScanning} face={faceData} />
          </View>
          
          {/* Face detection indicator - Only show if NOT scanning */}
          {!isScanning && faceDetected && faceData && (
            <View pointerEvents="none" style={[styles.faceFrame, {
              top: faceData.bounds.y,
              left: faceData.bounds.x,
              width: faceData.bounds.width,
              height: faceData.bounds.height,
            }]}>
              <Text style={styles.faceDetectedText}>✓ Face Detected</Text>
            </View>
          )}
          
          {/* No face detected - Static Guide Frame - Only show if NOT scanning */}
          {!isScanning && !faceDetected && (
            <View pointerEvents="none" style={styles.guideFrameContainer}>
              <View style={styles.guideFrame} />
              <View style={styles.guideMessage}>
                <Ionicons name="scan-outline" size={24} color="#FFF" />
                <Text style={styles.noFaceText}>Center your face here</Text>
              </View>
            </View>
          )}
          
          {/* Status text when scanning */}
          {isScanning && (
            <View style={styles.scanStatusBar}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.scanStatusText}>{statusText}</Text>
            </View>
          )}

          {/* Scan button overlay on camera - Hide when scanning */}
          {!isScanning && (
            <TouchableOpacity 
              onPress={captureAndAnalyze} 
              style={styles.scanBtn}
            >
              <LinearGradient 
                colors={faceDetected ? ['#3B82F6', '#2563EB'] : ['#60A5FA', '#3B82F6']} 
                style={styles.scanBtnInner}
              >
                <Ionicons name="scan" size={24} color="#fff" />
                <Text style={styles.scanBtnText}>Scan My Face</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <Text style={styles.hint}>
            {!isScanning && (faceDetected ? 'Ready to scan!' : 'Position your face in the frame')}
          </Text>
        </>
        ) : (
          <View style={styles.resultsContainer}>
            <StatusBar style="dark" />
            <LinearGradient colors={['#3B82F6', '#60A5FA']} style={styles.header}>
              <SafeAreaView>
                <View style={styles.headerRow}>
                  <TouchableOpacity onPress={() => {
                    setResult(null);
                    setIsScanning(false);
                    setFaceData(null);
                  }} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Skin Check-In Results</Text>
                  <View style={{ width: 40 }} />
                </View>
              </SafeAreaView>
            </LinearGradient>
            
            <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
            {/* Score */}
            <View style={styles.scoreWrap}>
              <LinearGradient colors={getSeverityGradient(result.overallSeverity)} style={styles.scoreCircle}>
                <Text style={styles.scoreNum}>{result.clarityScore}</Text>
                <Text style={styles.scoreOf}>/10</Text>
              </LinearGradient>
              <Text style={styles.scoreLabel}>Skin Calmness Score</Text>
              <Text style={styles.scoreDesc}>
                {result.overallSeverity === 'calm' && '✨ Your skin looks great!'}
                {result.overallSeverity === 'mild' && '👍 Minor activity detected'}
                {result.overallSeverity === 'moderate' && '💙 Some areas need attention'}
                {result.overallSeverity === 'needs-attention' && '💝 Consider professional advice'}
              </Text>
            </View>

            {/* What We Found Section */}
            {result.groupedDetections.length > 0 ? (
              <View style={styles.foundSection}>
                <Text style={styles.sectionTitle}>🔍 What We Found</Text>
                <Text style={styles.sectionSubtitle}>
                  {result.totalDetections} area{result.totalDetections !== 1 ? 's' : ''} detected
                </Text>

                {result.groupedDetections.map((group, idx) => (
                  <View key={idx} style={styles.typeCard}>
                    <View style={styles.typeHeader}>
                      <View style={[styles.typeEmoji, { backgroundColor: group.info.color + '20' }]}>
                        <Text style={styles.typeEmojiText}>{group.info.emoji}</Text>
                      </View>
                      <View style={styles.typeHeaderText}>
                        <Text style={styles.typeName}>{group.info.clinicalName}</Text>
                        <Text style={[styles.typeTherapeutic, { color: group.info.color }]}>
                          {group.info.therapeuticName}
                        </Text>
                      </View>
                      <View style={[styles.countBadge, { backgroundColor: group.info.color }]}>
                        <Text style={styles.countText}>{group.count}</Text>
                      </View>
                    </View>

                    <View style={styles.typeBody}>
                      <Text style={styles.typeQuestion}>What is it?</Text>
                      <Text style={styles.typeAnswer}>{group.info.description}</Text>

                      <Text style={styles.typeQuestion}>What it looks like:</Text>
                      <Text style={styles.typeAnswer}>{group.info.whatItLooksLike}</Text>

                      <View style={styles.tipBox}>
                        <Ionicons name="bulb" size={16} color="#F59E0B" />
                        <Text style={styles.tipText}>{group.info.careTip}</Text>
                      </View>
                    </View>

                    <View style={[styles.severityBar, { backgroundColor: group.info.color + '30' }]}>
                      <View style={[styles.severityDot, { backgroundColor: group.info.color }]} />
                      <Text style={[styles.severityText, { color: group.info.color }]}>
                        {group.info.severity === 'mild' && 'Mild - Usually clears with basic care'}
                        {group.info.severity === 'moderate' && 'Moderate - May need targeted treatment'}
                        {group.info.severity === 'needs-attention' && 'Needs Attention - Consider seeing a professional'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noneFound}>
                <Text style={styles.noneFoundEmoji}>🎉</Text>
                <Text style={styles.noneFoundTitle}>Looking Clear!</Text>
                <Text style={styles.noneFoundText}>
                  We didn't detect any specific concerns. Your skin appears calm and healthy!
                </Text>
              </View>
            )}

            {/* General Tips */}
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>💡 General Skin Tips</Text>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipItemText}>Never pick or squeeze - it causes scarring</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipItemText}>Wash face twice daily with gentle cleanser</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipItemText}>Always use sunscreen, even on cloudy days</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => {
              setResult(null);
              setIsScanning(false);
              setFaceData(null);
            }} style={styles.againBtn}>
              <Text style={styles.againBtnText}>Scan Again</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              This is not medical advice. Consult a dermatologist for professional diagnosis.
            </Text>
          </ScrollView>
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { ...StyleSheet.absoluteFillObject },
  
  // Header overlay
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  header: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },

  // Results container
  resultsContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  results: { flex: 1, padding: 16 },
  
  // Face detection frame
  faceFrame: { position: 'absolute', borderWidth: 2, borderColor: '#10B981', borderRadius: 8, borderStyle: 'solid' },
  faceDetectedText: { position: 'absolute', top: -30, left: 0, right: 0, textAlign: 'center', color: '#10B981', fontSize: 14, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'center' },
  
  // No face warning / Guide Frame
  guideFrameContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  guideFrame: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.65,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 24,
    borderStyle: 'dashed',
  },
  guideMessage: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noFaceText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginTop: 12, textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  
  // Face Mesh Overlay Styles
  meshOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  meshBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  meshContainer: { position: 'absolute', width: '100%', height: '100%' },
  glView: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  scanLine: { position: 'absolute', height: 4 },
  scanLineGradient: { flex: 1, borderRadius: 2 },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#FFFFFF', borderWidth: 3 },
  cornerTL: { borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  cornerTR: { borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
  cornerBL: { borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  cornerBR: { borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
  statusContainer: { position: 'absolute', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF', marginRight: 8 },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  
  scanStatusBar: { position: 'absolute', bottom: 200, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  scanStatusText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500', marginLeft: 10 },

  scanBtn: { position: 'absolute', bottom: 100, left: 20, right: 20, borderRadius: 16, overflow: 'hidden' },
  scanBtnDisabled: { opacity: 0.5 },
  scanBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  scanBtnText: { color: '#fff', fontSize: 17, fontWeight: '600', marginLeft: 10 },
  hint: { position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', color: '#FFF', fontSize: 13, fontWeight: '500', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },

  scoreWrap: { alignItems: 'center', marginBottom: 24 },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  scoreNum: { fontSize: 44, fontWeight: '700', color: '#fff' },
  scoreOf: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: -4 },
  scoreLabel: { fontSize: 18, fontWeight: '600', color: '#1E293B' },
  scoreDesc: { fontSize: 14, color: '#64748B', marginTop: 4 },

  foundSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 16 },

  typeCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  typeHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  typeEmoji: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  typeEmojiText: { fontSize: 24 },
  typeHeaderText: { flex: 1 },
  typeName: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  typeTherapeutic: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  countBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  countText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  typeBody: { padding: 16 },
  typeQuestion: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 4, marginTop: 8 },
  typeAnswer: { fontSize: 15, color: '#1E293B', lineHeight: 22 },
  tipBox: { flexDirection: 'row', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, marginTop: 12 },
  tipText: { flex: 1, fontSize: 13, color: '#92400E', marginLeft: 8, lineHeight: 20 },

  severityBar: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 16 },
  severityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  severityText: { fontSize: 12, fontWeight: '500' },

  noneFound: { backgroundColor: '#ECFDF5', borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 24 },
  noneFoundEmoji: { fontSize: 48, marginBottom: 12 },
  noneFoundTitle: { fontSize: 22, fontWeight: '700', color: '#065F46', marginBottom: 8 },
  noneFoundText: { fontSize: 15, color: '#047857', textAlign: 'center', lineHeight: 22 },

  tipsSection: { backgroundColor: '#EFF6FF', borderRadius: 20, padding: 20, marginBottom: 24 },
  tipsTitle: { fontSize: 18, fontWeight: '700', color: '#1E3A8A', marginBottom: 12 },
  tipItem: { flexDirection: 'row', marginBottom: 8 },
  tipBullet: { color: '#3B82F6', fontSize: 16, marginRight: 8, fontWeight: '700' },
  tipItemText: { flex: 1, fontSize: 14, color: '#1E40AF', lineHeight: 20 },

  againBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#3B82F6', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  againBtnText: { color: '#3B82F6', fontSize: 17, fontWeight: '600' },
  disclaimer: { textAlign: 'center', fontSize: 12, color: '#94A3B8', marginBottom: 32, lineHeight: 18 },
});
