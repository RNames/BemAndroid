import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { useAuthController } from '../../controllers/auth.controller';
import { uploadImageToCloudinary } from '../../../../shared/services/cloudinary.service';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { useTranslation } from '../../../../shared/localization';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  currentPhotoUrl?: string;
}

/**
 * EditProfileModal
 * Modal to edit user's full name and profile photo
 * Supports Camera & Gallery photo selection with Cloudinary upload
 */
const EditProfileModal: React.FC<Props> = ({
  visible,
  onClose,
  currentName,
  currentPhotoUrl,
}) => {
  const { t } = useTranslation();
  const [, authActions] = useAuthController();
  const [name, setName] = useState(currentName);
  const [photoUri, setPhotoUri] = useState<string | undefined>(currentPhotoUrl);
  const [isNewPhoto, setIsNewPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(currentName);
      setPhotoUri(currentPhotoUrl);
      setIsNewPhoto(false);
      setSaving(false);
    }
  }, [visible, currentName, currentPhotoUrl]);

  const handleImagePickerResult = (response: ImagePickerResponse) => {
    if (response.didCancel) return;

    if (response.errorCode) {
      Alert.alert(
        t.editProfile.failedPhoto,
        response.errorMessage || t.editProfile.failedPhoto,
      );
      return;
    }

    const asset = response.assets?.[0];
    if (asset?.uri) {
      setPhotoUri(asset.uri);
      setIsNewPhoto(true);
    }
  };

  const handlePickFromGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
      },
      handleImagePickerResult,
    );
  };

  const handlePickFromCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
      },
      handleImagePickerResult,
    );
  };

  const showPhotoPickerOptions = () => {
    Alert.alert(t.editProfile.changePhoto, t.editProfile.chooseSource, [
      { text: t.editProfile.takePhoto, onPress: handlePickFromCamera },
      { text: t.editProfile.chooseGallery, onPress: handlePickFromGallery },
      { text: t.common.cancel, style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert(t.common.warning, t.editProfile.nameRequired);
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert(t.common.warning, t.editProfile.nameTooShort);
      return;
    }

    try {
      setSaving(true);
      let finalPhotoUrl = photoUri;

      // Upload to Cloudinary if user picked a new local photo
      if (isNewPhoto && photoUri) {
        finalPhotoUrl = await uploadImageToCloudinary(photoUri);
      }

      const success = await authActions.updateUserProfile({
        displayName: trimmedName,
        photoUrl: finalPhotoUrl,
      });

      if (success) {
        Alert.alert(t.common.success, t.editProfile.successMessage);
        onClose();
      } else {
        Alert.alert(t.common.error, t.editProfile.updateFailed);
      }
    } catch (err: any) {
      console.error('[EditProfileModal] Error updating profile:', err);
      Alert.alert(
        t.common.error,
        err?.message || t.editProfile.uploadFailed,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !saving && onClose()}
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <Text style={styles.modalTitle}>{t.editProfile.title}</Text>
            <Text style={styles.modalSubtitle}>
              {t.editProfile.subtitle}
            </Text>

            {/* ─── Avatar Picker Section (Centered) ─────── */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={showPhotoPickerOptions}
                activeOpacity={0.8}
                disabled={saving}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.cameraIconBadge}>
                  <Text style={styles.cameraIconText}>📷</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={showPhotoPickerOptions}
                activeOpacity={0.7}
                disabled={saving}
              >
                <Text style={styles.changePhotoText}>{t.editProfile.changePhoto}</Text>
              </TouchableOpacity>
            </View>

            {/* ─── Full Name Input ─────────────────────── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.editProfile.nameLabel}</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder={t.editProfile.namePlaceholder}
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="words"
                editable={!saving}
              />
            </View>

            {/* ─── Action Buttons ─────────────────────── */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={saving}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>{t.common.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>{t.editProfile.saveBtn}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: Colors.primaryBorder,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primaryBorder,
  },
  avatarPlaceholderText: {
    fontFamily: Fonts.bold,
    fontSize: 36,
    color: Colors.primaryDark,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  cameraIconText: {
    fontSize: 13,
  },
  changePhotoText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.primary,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.white,
  },
});

export default EditProfileModal;
