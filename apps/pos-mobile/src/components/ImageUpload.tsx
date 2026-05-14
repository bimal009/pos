import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import { ImageKitSign } from "@/types/imagekit";
import { useGetImageKitAuthSign } from "@/client/images";

const theme = Colors.light;

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  size?: number;
  title?: string;
}

async function uploadToImageKit(
  uri: string,
  sign: ImageKitSign,
  folder: string,
): Promise<string> {
  const filename = `img_${Date.now()}.jpg`;

  const formData = new FormData();
  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: filename,
  } as any);
  formData.append("fileName", filename);
  formData.append("folder", folder);
  formData.append("publicKey", sign.publicKey);
  formData.append("signature", sign.signature);
  formData.append("expire", String(sign.expire));
  formData.append("token", sign.token);

  const response = await fetch(
    "https://upload.imagekit.io/api/v1/files/upload",
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ImageKit upload failed: ${err}`);
  }

  const data = await response.json();
  return data.url as string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = "/avatars",
  size = 96,
  title = "Add Profile Picture",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { data: sign, isLoading: signLoading } = useGetImageKitAuthSign();

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) return;
    if (!sign) return;

    try {
      setUploading(true);

      // Compress to keep under ~1MB
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );

      const url = await uploadToImageKit(manipulated.uri, sign, folder);
      onChange(url);
    } catch (error) {
      console.error("Image upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const borderRadius = size / 2;
  const badgeSize = size * 0.29;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={pick}
        disabled={uploading || signLoading}
        style={[styles.touchable, { width: size, height: size }]}
      >
        {value ? (
          <Image
            source={{ uri: value }}
            style={[styles.image, { width: size, height: size, borderRadius }]}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: size, height: size, borderRadius },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={size * 0.42}
              color={theme.mutedForeground}
            />
          </View>
        )}

        {/* Badge */}
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
            },
          ]}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={theme.primaryForeground} />
          ) : (
            <Ionicons
              name="camera"
              size={badgeSize * 0.5}
              color={theme.primaryForeground}
            />
          )}
        </View>
      </TouchableOpacity>

      <Text style={styles.hint}>
        {uploading
          ? "Uploading..."
          : value
            ? "Tap to change photo"
            : `${title} (optional)`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  touchable: {
    position: "relative",
    marginBottom: Spacing.one,
  },
  image: {
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  placeholder: {
    backgroundColor: Colors.light.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
  },
  badge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.light.card,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.light.mutedForeground,
    marginTop: Spacing.one,
  },
});
