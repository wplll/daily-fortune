import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = 'AI 正在深度分析中...' }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.hint}>这可能需要几秒钟</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1e1e3a',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    minWidth: 200,
  },
  message: {
    color: '#e8e8f0',
    fontSize: 16,
    fontWeight: '500',
  },
  hint: {
    color: '#666',
    fontSize: 13,
  },
});
