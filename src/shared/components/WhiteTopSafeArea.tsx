import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

interface Props {
  zIndex?: number;
  elevation?: number;
  backgroundColor?: string;
}

/**
 * Hook to calculate accurate top safe area inset across all devices.
 * Handles Android Edge-to-Edge (Android 15+ / TargetSDK 35+),
 * notched displays, hole punch cutouts, and iOS safe areas.
 */
export const useTopInset = (): number => {
  const insets = useSafeAreaInsets();
  const androidStatusBarHeight =
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  return Math.max(insets.top, androidStatusBarHeight);
};

/**
 * WhiteTopSafeArea
 * Solid bar positioned at the top of the screen to protect content
 * from status bar, notch, and punch-hole camera cutouts.
 * Color seamlessly matches the appbar without any border or separation shadow.
 */
const WhiteTopSafeArea: React.FC<Props> = ({
  zIndex = 100,
  elevation = 0,
  backgroundColor = Colors.white,
}) => {
  const topInset = useTopInset();

  return (
    <>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle="dark-content"
        translucent={Platform.OS === 'android'}
      />
      <View
        style={[
          styles.safeArea,
          {
            height: topInset,
            backgroundColor,
            zIndex,
            elevation,
          },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
    backgroundColor: Colors.white,
    borderWidth: 0,
    borderBottomWidth: 0,
  },
});

export default WhiteTopSafeArea;
