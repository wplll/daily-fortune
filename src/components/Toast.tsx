import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide: () => void;
}

export function Toast({ visible, message, type = 'success', onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start(() => onHide());
    }
  }, [visible]);

  if (!visible) return null;

  const bgColor =
    type === 'success' ? '#4CAF50' :
    type === 'error' ? '#e74c3c' :
    '#6C63FF';

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: bgColor }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
