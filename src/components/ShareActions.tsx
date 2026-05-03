import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from './ActionButton';
import { captureView, saveImageToAlbum, shareImage, shareToQQ, shareToWechat } from '../services/shareService';
import { AppError } from '../utils/AppError';

interface ShareActionsProps {
  shareCard: React.ReactElement;
}

function showOperationError(title: string, error: unknown): void {
  Alert.alert(title, error instanceof AppError ? error.userMessage : '操作失败，请稍后重试');
}

export function ShareActions({ shareCard }: ShareActionsProps) {
  const viewRef = useRef<View>(null);
  const [generating, setGenerating] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setShowPreview(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const uri = await captureView(viewRef);
      setImageUri(uri);
    } catch (error: unknown) {
      showOperationError('分享图生成失败', error);
    } finally {
      setGenerating(false);
      setShowPreview(false);
    }
  }, []);

  const handleSystemShare = useCallback(async () => {
    if (!imageUri) return;
    try {
      await shareImage(imageUri);
    } catch (error: unknown) {
      showOperationError('分享失败', error);
    }
  }, [imageUri]);

  const handleSaveToAlbum = useCallback(async () => {
    if (!imageUri) return;
    try {
      await saveImageToAlbum(imageUri);
    } catch (error: unknown) {
      showOperationError('保存失败', error);
    }
  }, [imageUri]);

  const handleWechat = useCallback(async () => {
    if (imageUri) await shareToWechat(imageUri);
  }, [imageUri]);

  const handleQQ = useCallback(async () => {
    if (imageUri) await shareToQQ(imageUri);
  }, [imageUri]);

  return (
    <View style={styles.container}>
      {showPreview && (
        <View style={styles.captureOverlay}>
          <View style={styles.captureWrapper}>
            <View ref={viewRef} collapsable={false}>
              {shareCard}
            </View>
            <ActivityIndicator size="large" color="#6C63FF" style={styles.captureLoader} />
            <Text style={styles.captureText}>正在生成分享图...</Text>
          </View>
        </View>
      )}

      {!imageUri ? (
        <ActionButton
          title="生成分享图"
          onPress={handleGenerate}
          loading={generating}
          icon="🖼️"
        />
      ) : (
        <View style={styles.shareButtons}>
          <ActionButton title="系统分享" onPress={handleSystemShare} icon="📤" variant="secondary" />
          <ActionButton title="保存图片" onPress={handleSaveToAlbum} icon="💾" variant="secondary" />
          <ActionButton title="微信" onPress={handleWechat} icon="💬" variant="secondary" />
          <ActionButton title="QQ" onPress={handleQQ} icon="💬" variant="secondary" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  captureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingTop: 60,
  },
  captureWrapper: {
    backgroundColor: '#12122a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  captureLoader: {
    marginTop: 16,
  },
  captureText: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
  },
  shareButtons: {
    gap: 10,
  },
});
