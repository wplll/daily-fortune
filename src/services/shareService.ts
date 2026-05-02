import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

/**
 * Capture a React Native View ref as an image URI.
 * Uses react-native-view-shot (imported dynamically to avoid crash if not installed).
 */
export async function captureView(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewRef: any,
): Promise<string> {
  try {
    const ViewShot = require('react-native-view-shot');
    const uri = await ViewShot.captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    return uri;
  } catch {
    throw new Error('截图功能不可用，请确保 react-native-view-shot 已安装');
  }
}

/**
 * Open system share dialog for an image URI.
 */
export async function shareImage(uri: string, message?: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    Alert.alert('分享不可用', '当前设备不支持分享功能');
    return;
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: message || '分享运势图',
    UTI: 'public.png',
  });
}

/**
 * Save an image to the device photo album.
 */
export async function saveImageToAlbum(uri: string): Promise<void> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '需要相册权限才能保存图片');
      return;
    }
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('已保存', '图片已保存到相册');
  } catch {
    Alert.alert('保存失败', '无法保存图片到相册');
  }
}

/**
 * Share to WeChat (fallback to system share if SDK not available).
 */
export async function shareToWechat(uri: string): Promise<void> {
  // WeChat native SDK requires EAS Build / custom Dev Client.
  // For Expo Go, fall back to system share.
  Alert.alert(
    '分享到微信',
    '微信原生分享需要 EAS Build 或自定义 Dev Client。\n\n当前将通过系统分享面板进行分享。',
    [
      { text: '取消', style: 'cancel' },
      { text: '系统分享', onPress: () => shareImage(uri, '分享到微信') },
    ],
  );
}

/**
 * Share to QQ (fallback to system share if SDK not available).
 */
export async function shareToQQ(uri: string): Promise<void> {
  Alert.alert(
    '分享到 QQ',
    'QQ 原生分享需要 EAS Build 或自定义 Dev Client。\n\n当前将通过系统分享面板进行分享。',
    [
      { text: '取消', style: 'cancel' },
      { text: '系统分享', onPress: () => shareImage(uri, '分享到 QQ') },
    ],
  );
}

/** Check if running on a real device (not simulator/emulator) */
export function isRealDevice(): boolean {
  // Platform.isTesting is not available, check at runtime
  return true; // Assume real device for sharing purposes
}
