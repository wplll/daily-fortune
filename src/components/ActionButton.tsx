import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
}

export function ActionButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
}: ActionButtonProps) {
  const bgColor =
    variant === 'primary' ? '#6C63FF' :
    variant === 'danger' ? '#e74c3c' :
    'transparent';
  const borderColor =
    variant === 'secondary' ? '#6C63FF' : bgColor;
  const textColor = variant === 'secondary' ? '#6C63FF' : '#fff';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bgColor, borderColor, borderWidth: variant === 'secondary' ? 1.5 : 0 },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
});
