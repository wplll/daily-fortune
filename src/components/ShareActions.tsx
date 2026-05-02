import React, { useRef, useCallback, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { ActionButton } from './ActionButton';
import { captureView, shareImage, saveImageToAlbum, shareToWechat, shareToQQ } from '../services/shareService';

interface ShareActionsProps {
  shareCard: React.ReactElement;
}

export function ShareActions({ shareCard }: ShareActionsProps) {
  const viewRef = useRef<View>(null);
  const [generating, setGenerating] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setShowPreview(true);
    // Wait for the view to be laid out on screen
    await new Promise((r) => setTimeout(r, 300));
    try {
      const uri = await captureView(viewRef);
      setImageUri(uri);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '生成图片失败';
      Alert.alert('分享图生成失败', msg);
    } finally {
      setGenerating(false);
      setShowPreview(false);
    }
  }, []);

  const handleSystemShare = useCallback(async () => {
    if (imageUri) {
      await shareImage(imageUri);
    }
  }, [imageUri]);

  const handleSaveToAlbum = useCallback(async () => {
    if (imageUri) {
      await saveImageToAlbum(imageUri);
    }
  }, [imageUri]);

  const handleWechat = useCallback(async () => {
    if (imageUri) {
      await shareToWechat(imageUri);
    }
  }, [imageUri]);

  const handleQQ = useCallback(async () => {
    if (imageUri) {
      await shareToQQ(imageUri);
    }
  }, [imageUri]);

  return (
    <View style={styles.container}>
      {/* Render capture target on-screen (needed for view-shot to work) */}
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
          <ActionButton title="QQ" onPress={handleQQ} icon="🐧" variant="secondary" />
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
    borderRadius: 20,
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
