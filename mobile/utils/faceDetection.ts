import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

const TensorCamera = cameraWithTensors(CameraView);

export const useBlazeFace = () => {
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function load() {
      await tf.ready();
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
      setIsReady(true);
    }
    load();
  }, []);

  return { model, isReady };
};

