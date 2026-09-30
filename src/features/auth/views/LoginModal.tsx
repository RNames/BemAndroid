import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../../../shared/constants/colors';
import { Fonts } from '../../../shared/constants/fonts';
import { useTranslation } from '../../../shared/localization';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  authenticating: boolean;
  error?: string | null;
}

/**
 * LoginModal
 * Pop-up modal intersept saat guest user mencoba menambah produk
 * atau menekan tombol Sign In pada header.
 */
const LoginModal: React.FC<Props> = ({
  visible,
  onClose,
  onGoogleSignIn,
  authenticating,
  error,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={[
            styles.backdrop,
            {
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 24,
            },
          ]}
        >
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header Icon */}
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>LOGIN</Text>
              </View>

              {/* Title & Description */}
              <Text style={styles.title}>{t.login.title}</Text>
              <Text style={styles.subtitle}>{t.login.subtitle}</Text>

              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Google Sign-In Button */}
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={onGoogleSignIn}
                disabled={authenticating}
                activeOpacity={0.85}
              >
                {authenticating ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <View style={styles.googleIconCircle}>
                      <Text style={styles.googleG}>G</Text>
                    </View>
                    <Text style={styles.googleBtnText}>
                      {t.login.signInGoogle}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={authenticating}
              >
                <Text style={styles.cancelBtnText}>{t.login.later}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.primaryDark,
    letterSpacing: 1,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: Colors.danger,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    fontFamily: Fonts.medium,
    color: Colors.danger,
    fontSize: 12,
    textAlign: 'center',
  },
  googleBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#4285F4',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  googleIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleG: {
    fontFamily: Fonts.bold,
    color: '#4285F4',
    fontSize: 16,
  },
  googleBtnText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 15,
  },
  cancelBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontFamily: Fonts.semiBold,
    color: Colors.textMuted,
    fontSize: 14,
  },
});

export default LoginModal;
