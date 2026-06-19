import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthRequiredState } from "@/components/AuthRequiredState";
import { FormField } from "@/components/FormField";
import { imageService } from "@/services";
import { useAuth } from "@/state/AuthContext";
import { useListings } from "@/state/ListingsContext";
import { colors } from "@/theme/colors";
import { radius, shadows, spacing, typography } from "@/theme/spacing";
import type { Listing } from "@/types/listing";
import { getListingImages } from "@/utils/listingImages";

const { MAX_LISTING_IMAGES } = imageService;

type EditForm = {
  amount: string;
  description: string;
  district: string;
  location: string;
  title: string;
};

type EditErrors = Partial<Record<keyof EditForm, string>>;

const emptyForm: EditForm = {
  amount: "",
  description: "",
  district: "",
  location: "",
  title: ""
};

const parseAmount = (value: string) => {
  const amount = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : 0;
};

function getFormFromListing(listing: Listing): EditForm {
  return {
    amount: String(listing.type === "rent" ? listing.monthlyRent : listing.price),
    description: listing.description,
    district: listing.type === "rent" ? listing.district : "",
    location: listing.location,
    title: listing.title
  };
}

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { isAuthReady, isAuthenticated, isRemoteMode } = useAuth();
  const { isReady, myListings, showNotice, updateListing } = useListings();
  const listing = id ? myListings.find((item) => item.id === id) : undefined;
  const [errors, setErrors] = useState<EditErrors>({});
  const [existingImages, setExistingImages] = useState<Array<string>>([]);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [newImages, setNewImages] = useState<Array<ImagePicker.ImagePickerAsset>>([]);
  const [screenError, setScreenError] = useState("");

  useEffect(() => {
    if (!listing) {
      return;
    }

    setForm(getFormFromListing(listing));
    setExistingImages(getListingImages(listing));
    setNewImages([]);
    setErrors({});
    setScreenError("");
  }, [listing?.id]);

  const isRent = listing?.type === "rent";
  const allPreviewImages = useMemo(
    () => [...existingImages, ...newImages.map((asset) => asset.uri)],
    [existingImages, newImages]
  );
  const previewImages = allPreviewImages.length
    ? allPreviewImages
    : [imageService.getDefaultImageForType(isRent ? "rent" : "product")];

  const updateForm = (field: keyof EditForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setScreenError("");
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handlePickImages = async () => {
    if (isSaving) {
      return;
    }

    const currentCount = existingImages.length + newImages.length;

    if (currentCount >= MAX_LISTING_IMAGES) {
      setScreenError(`最多只能选择 ${MAX_LISTING_IMAGES} 张图片。`);
      return;
    }

    try {
      setScreenError("");
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(false);

      if (!permission.granted) {
        setScreenError("需要相册权限才能选择图片。");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        allowsMultipleSelection: true,
        mediaTypes: ["images"],
        orderedSelection: true,
        quality: 1,
        selectionLimit: MAX_LISTING_IMAGES - currentCount
      });

      if (result.canceled) {
        return;
      }

      setNewImages((current) => [
        ...current,
        ...result.assets.filter((asset) => Boolean(asset.uri))
      ].slice(0, MAX_LISTING_IMAGES));
    } catch {
      setScreenError("图片选择失败，请稍后再试。");
    }
  };

  const handleRemoveImage = (index: number, event: GestureResponderEvent) => {
    event.stopPropagation();

    if (index < existingImages.length) {
      setExistingImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
      return;
    }

    const newImageIndex = index - existingImages.length;
    setNewImages((current) => current.filter((_, imageIndex) => imageIndex !== newImageIndex));
  };

  const validate = () => {
    const nextErrors: EditErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "请填写标题。";
    }

    if (!parseAmount(form.amount)) {
      nextErrors.amount = isRent ? "请填写正确的月租。" : "请填写正确的价格。";
    }

    if (isRent) {
      if (!form.district.trim()) {
        nextErrors.district = "请填写区域。";
      }
    } else if (!form.location.trim()) {
      nextErrors.location = "请填写位置。";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildUpdatedListing = (listingToUpdate: Listing, addedImageUris: Array<string>): Listing => {
    const listingImages = [...existingImages, ...addedImageUris];
    const fallbackImage = imageService.getDefaultImageForType(listingToUpdate.type);
    const nextImages = listingImages.length > 0 ? listingImages : [fallbackImage];
    const title = form.title.trim();
    const description = form.description.trim() || "用户暂未填写详细描述。";

    if (listingToUpdate.type === "rent") {
      const district = form.district.trim();

      return {
        ...listingToUpdate,
        description,
        district,
        image: nextImages[0],
        images: nextImages,
        location: district,
        monthlyRent: parseAmount(form.amount),
        title
      };
    }

    return {
      ...listingToUpdate,
      description,
      image: nextImages[0],
      images: nextImages,
      location: form.location.trim(),
      price: parseAmount(form.amount),
      title
    };
  };

  const handleSave = async () => {
    if (!listing || isSaving || !validate()) {
      return;
    }

    try {
      setIsSaving(true);
      setScreenError("");
      const newImageUris = newImages.map((asset) => asset.uri).filter(Boolean);
      const updatedListing = await updateListing(listing.id, buildUpdatedListing(listing, newImageUris));

      if (!updatedListing) {
        setScreenError("只能编辑自己的发布。");
        return;
      }

      showNotice("保存成功");
      router.replace("/profile");
    } catch (saveError) {
      console.error("Failed to save listing", saveError);
      setScreenError(saveError instanceof Error ? saveError.message : "保存失败，请稍后再试。");
    } finally {
      setIsSaving(false);
    }
  };

  if (isRemoteMode && !isAuthReady) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={styles.emptyTitle}>正在读取登录状态</Text>
      </SafeAreaView>
    );
  }

  if (isRemoteMode && !isAuthenticated) {
    return (
      <SafeAreaView style={styles.authWrap}>
        <AuthRequiredState title="登录后才能编辑" message="远程模式下，编辑发布需要先登录。" />
      </SafeAreaView>
    );
  }

  if (!isReady) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={styles.emptyTitle}>正在读取本地发布</Text>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={styles.emptyTitle}>没找到这条发布</Text>
        <Pressable onPress={() => router.back()} style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>返回</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.topSafe}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} style={styles.navButton}>
            <Ionicons color={colors.charcoal} name="chevron-back" size={24} />
          </Pressable>
          <Text style={styles.navTitle}>编辑发布</Text>
          <View style={styles.navPlaceholder} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable onPress={handlePickImages} style={styles.imagePicker}>
            <View style={styles.imagePickerTop}>
              <View>
                <Text style={styles.imageTitle}>图片 {allPreviewImages.length}/{MAX_LISTING_IMAGES}</Text>
                <Text style={styles.imageMeta}>点这里继续从相册添加</Text>
              </View>
              <View style={styles.addImageButton}>
                <Ionicons color={colors.accent} name="images-outline" size={18} />
                <Text style={styles.addImageText}>添加</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.previewRow} horizontal showsHorizontalScrollIndicator={false}>
              {previewImages.map((imageUri, index) => (
                <View key={`${imageUri}-${index}`} style={styles.previewWrap}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  {allPreviewImages.length > 0 ? (
                    <Pressable
                      hitSlop={8}
                      onPress={(event) => handleRemoveImage(index, event)}
                      style={styles.removeImageButton}
                    >
                      <Ionicons color={colors.white} name="close" size={15} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          </Pressable>

          <View style={styles.formSection}>
            <FormField
              error={errors.title}
              label="标题"
              onChangeText={(value) => updateForm("title", value)}
              placeholder={isRent ? "例如：近地铁主卧转租" : "例如：9成新降噪耳机"}
              value={form.title}
            />
            <FormField
              error={errors.amount}
              keyboardType="numeric"
              label={isRent ? "月租" : "价格"}
              onChangeText={(value) => updateForm("amount", value)}
              placeholder={isRent ? "例如：4200" : "例如：299"}
              value={form.amount}
            />
            {isRent ? (
              <FormField
                error={errors.district}
                label="区域"
                onChangeText={(value) => updateForm("district", value)}
                placeholder="例如：世纪公园 / 五道口"
                value={form.district}
              />
            ) : (
              <FormField
                error={errors.location}
                label="位置"
                onChangeText={(value) => updateForm("location", value)}
                placeholder="例如：徐汇区 / 海淀区"
                value={form.location}
              />
            )}
            <FormField
              label="描述"
              multiline
              onChangeText={(value) => updateForm("description", value)}
              placeholder="补充使用情况、尺寸、瑕疵、取货方式等"
              value={form.description}
            />
          </View>

          {screenError ? (
            <View style={styles.error}>
              <Ionicons color={colors.coral} name="alert-circle-outline" size={20} />
              <Text style={styles.errorText}>{screenError}</Text>
            </View>
          ) : null}

          <Pressable disabled={isSaving} onPress={handleSave} style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}>
            <Text style={styles.submitText}>{isSaving ? "保存中..." : "保存修改"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  addImageButton: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 10
  },
  addImageText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "900"
  },
  content: {
    gap: spacing.lg,
    paddingBottom: 124,
    paddingHorizontal: spacing.md,
    paddingTop: 16
  },
  empty: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24
  },
  emptyButton: {
    alignItems: "center",
    backgroundColor: colors.charcoal,
    borderRadius: radius.lg,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 24
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900"
  },
  emptyTitle: {
    color: colors.charcoal,
    fontSize: 18,
    fontWeight: "900"
  },
  error: {
    alignItems: "center",
    backgroundColor: "#FFF1EE",
    borderColor: "#F4C7BE",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 12
  },
  errorText: {
    color: colors.coral,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  formSection: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.soft
  },
  imageMeta: {
    color: colors.muted,
    fontSize: 13
  },
  imagePicker: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.soft
  },
  imagePickerTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  imageTitle: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: "900"
  },
  keyboard: {
    flex: 1
  },
  authWrap: {
    backgroundColor: colors.background,
    flex: 1
  },
  nav: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16
  },
  navButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  navPlaceholder: {
    width: 44
  },
  navTitle: {
    color: colors.charcoal,
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  previewImage: {
    height: "100%",
    width: "100%"
  },
  previewRow: {
    gap: 10
  },
  previewWrap: {
    backgroundColor: colors.sand,
    borderRadius: radius.lg,
    height: 88,
    overflow: "hidden",
    width: 88
  },
  removeImageButton: {
    alignItems: "center",
    backgroundColor: "#202427CC",
    borderRadius: radius.md,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: 6,
    top: 6,
    width: 24
  },
  root: {
    backgroundColor: colors.background,
    flex: 1
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.charcoal,
    borderRadius: radius.lg,
    minHeight: 52,
    justifyContent: "center"
  },
  submitButtonDisabled: {
    opacity: 0.64
  },
  submitText: {
    color: colors.white,
    fontSize: typography.bodyLarge,
    fontWeight: "900"
  },
  topSafe: {
    backgroundColor: colors.background
  }
});
