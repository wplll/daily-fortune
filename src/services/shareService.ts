import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { AppError } from '../utils/AppError';

export async function captureView(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewRef: any,
): Promise<string> {
  try {
    const ViewShot = require('react-native-view-shot');
    return await ViewShot.captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new AppError('SHARE_CAPTURE_FAILED', '分享图生成失败，请稍后重试', detail);
  }
}

export async function shareImage(uri: string, message?: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new AppError('SHARE_UNAVAILABLE', '当前设备不支持系统分享');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: message || '分享运势图',
    UTI: 'public.png',
  });
}

export async function saveImageToAlbum(uri: string): Promise<void> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new AppError('MEDIA_PERMISSION_DENIED', '需要相册权限才能保存图片');
    }
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('已保存', '图片已保存到相册');
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    const detail = error instanceof Error ? error.message : String(error);
    throw new AppError('SAVE_IMAGE_FAILED', '无法保存图片到相册', detail);
  }
}

export async function shareToWechat(uri: string): Promise<void> {
  Alert.alert(
    '分享到微信',
    '微信原生分享需要额外接入原生 SDK。当前将使用系统分享面板。',
    [
      { text: '取消', style: 'cancel' },
      { text: '系统分享', onPress: () => shareImage(uri, '分享到微信') },
    ],
  );
}

export async function shareToQQ(uri: string): Promise<void> {
  Alert.alert(
    '分享到 QQ',
    'QQ 原生分享需要额外接入原生 SDK。当前将使用系统分享面板。',
    [
      { text: '取消', style: 'cancel' },
      { text: '系统分享', onPress: () => shareImage(uri, '分享到 QQ') },
    ],
  );
}

export function isRealDevice(): boolean {
  return true;
}
