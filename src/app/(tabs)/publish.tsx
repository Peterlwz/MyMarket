import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useMemo, useState } from "react";
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

import { AuthRequiredState } from "@/components/AuthRequiredState";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FormField } from "@/components/FormField";
import { Screen } from "@/components/Screen";
import { categories } from "@/data/mock";
import { imageService, listingService } from "@/services";
import { useAuth } from "@/state/AuthContext";
import { useListings } from "@/state/ListingsContext";
import { colors } from "@/theme/colors";
import { radius, shadows, spacing, typography } from "@/theme/spacing";
import type { CategoryId, ProductListing, RentListing } from "@/types/listing";

const { MAX_LISTING_IMAGES } = imageService;

const publishCategories = categories.filter((category) => category.id !== "all");

type PublishForm = {
  availableFrom: string;
  condition: string;
  description: string;
  district: string;
  leaseTerm: string;
  location: string;
  monthlyRent: string;
  price: string;
  roomType: string;
  title: string;
};

type PublishField = keyof PublishForm;
type FieldErrors = Partial<Record<PublishField | "categoryId", string>>;

const initialForm: PublishForm = {
  availableFrom: "",
  condition: "",
  description: "",
  district: "",
  leaseTerm: "",
  location: "",
  monthlyRent: "",
  price: "",
  roomType: "",
  title: ""
};

const defaultSeller = {
  avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80",
  name: "蒲公英用户",
  rating: 5
};

const parseAmount = (value: string) => {
  const amount = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : 0;
};

const normalizeCondition = (value: string): ProductListing["condition"] => {
  if (value.includes("全新")) {
    return "几乎全新";
  }

  if (value.includes("轻微")) {
    return "轻微使用";
  }

  return "正常使用";
};

export default function PublishScreen() {
  const { isAuthReady, isAuthenticated, isRemoteMode } = useAuth();
  const { addListing, showNotice } = useListings();
  const [selectedId, setSelectedId] = useState<CategoryId>("digital");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<PublishForm>(initialForm);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Array<ImagePicker.ImagePickerAsset>>([]);
  const isRent = selectedId === "rent";
  const selectedCategory = useMemo(
    () => publishCategories.find((category) => category.id === selectedId),
    [selectedId]
  );
  const previewImages = selectedImages.length
    ? selectedImages.map((asset) => asset.uri)
    : [imageService.getDefaultImageForType(isRent ? "rent" : "product")];
  const previewDescription = form.description.trim() || "用户暂未填写详细描述。";

  const updateForm = (field: PublishField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setIsPreviewing(false);
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSelectCategory = (id: CategoryId) => {
    setSelectedId(id);
    setError("");
    setIsPreviewing(false);
    setFieldErrors((current) => ({ ...current, categoryId: undefined }));
  };

  const handlePickImages = async () => {
    if (isSaving) {
      return;
    }

    try {
      setError("");
      setIsPreviewing(false);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(false);

      if (!permission.granted) {
        setError("需要相册权限才能选择图片。");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        allowsMultipleSelection: true,
        mediaTypes: ["images"],
        orderedSelection: true,
        quality: 1,
        selectionLimit: MAX_LISTING_IMAGES
      });

      if (result.canceled) {
        return;
      }

      setSelectedImages(result.assets.filter((asset) => Boolean(asset.uri)).slice(0, MAX_LISTING_IMAGES));
    } catch {
      setError("图片选择失败，请稍后再试。");
    }
  };

  const handleRemoveImage = (index: number, event: GestureResponderEvent) => {
    event.stopPropagation();
    setIsPreviewing(false);
    setSelectedImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const validateForPreview = () => {
    const nextErrors: FieldErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "请填写标题。";
    }

    if (!selectedId) {
      nextErrors.categoryId = "请选择分类。";
    }

    if (isRent) {
      if (!parseAmount(form.monthlyRent)) {
        nextErrors.monthlyRent = "请填写正确的月租。";
      }

      if (!form.district.trim()) {
        nextErrors.district = "请填写区域。";
      }

      if (!form.roomType.trim()) {
        nextErrors.roomType = "请填写房型。";
      }

      if (!form.availableFrom.trim()) {
        nextErrors.availableFrom = "请填写可入住时间。";
      }
    } else {
      if (!parseAmount(form.price)) {
        nextErrors.price = "请填写正确的价格。";
      }

      if (!form.location.trim()) {
        nextErrors.location = "请填写位置。";
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildListing = (listingId: string): ProductListing | RentListing => {
    const title = form.title.trim();

    if (isRent) {
      const district = form.district.trim();

      return {
        availableFrom: form.availableFrom.trim(),
        categoryId: "rent",
        description: previewDescription,
        district,
        id: listingId,
        image: imageService.getDefaultImageForType("rent"),
        leaseTerm: form.leaseTerm.trim() || "租期可谈",
        liked: false,
        location: district,
        monthlyRent: parseAmount(form.monthlyRent),
        postedAt: "刚刚",
        roomType: form.roomType.trim(),
        seller: defaultSeller,
        status: "active",
        title,
        type: "rent"
      };
    }

    return {
      categoryId: selectedId,
      condition: normalizeCondition(form.condition),
      description: previewDescription,
      id: listingId,
      image: imageService.getDefaultImageForType("product"),
      liked: false,
      location: form.location.trim(),
      pickupMethod: "自提",
      postedAt: "刚刚",
      price: parseAmount(form.price),
      seller: defaultSeller,
      status: "active",
      title,
      type: "product"
    };
  };

  const handlePreview = () => {
    setError("");

    if (validateForPreview()) {
      setIsPreviewing(true);
    }
  };

  const handleConfirmPublish = async () => {
    if (isSaving || !validateForPreview()) {
      return;
    }

    const listing = buildListing(listingService.createListingId(isRent ? "rent" : "product"));
    const selectedImageUris = selectedImages.map((asset) => asset.uri).filter(Boolean);
    const listingImages = selectedImageUris.length > 0 ? selectedImageUris : [listing.image];

    try {
      setIsSaving(true);

      await addListing({
        ...listing,
        image: listingImages[0],
        images: listingImages
      });
      showNotice("发布成功");
      setFieldErrors({});
      setForm(initialForm);
      setIsPreviewing(false);
      setSelectedImages([]);
      router.replace("/");
    } catch (saveError) {
      console.error("Failed to publish listing", saveError);
      setError(saveError instanceof Error ? saveError.message : "发布失败，请检查图片权限或稍后再试。");
    } finally {
      setIsSaving(false);
    }
  };

  if (isRemoteMode && !isAuthReady) {
    return (
      <Screen>
        <View style={styles.loadingWrap}>
          <Text style={styles.subtitle}>正在读取登录状态...</Text>
        </View>
      </Screen>
    );
  }

  if (isRemoteMode && !isAuthenticated) {
    return (
      <Screen>
        <AuthRequiredState title="登录后才能发布" message="远程模式下，发布内容需要关联到你的 Supabase 用户。" />
      </Screen>
    );
  }

  if (isPreviewing) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>发布预览</Text>
            <Text style={styles.subtitle}>{isRent ? "确认转租信息无误后再发布。" : "确认商品信息无误后再发布。"}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.previewImageRow} horizontal showsHorizontalScrollIndicator={false}>
            {previewImages.map((imageUri, index) => (
              <View key={`${imageUri}-${index}`} style={styles.previewHeroWrap}>
                <Image source={{ uri: imageUri }} style={styles.previewHeroImage} />
                {index === 0 ? (
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>封面</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>

          <View style={styles.previewCard}>
            <Text style={styles.previewType}>{isRent ? "转租信息" : selectedCategory?.label}</Text>
            <Text style={styles.previewTitle}>{form.title.trim()}</Text>
            <View style={styles.previewPriceLine}>
              <Text style={[styles.previewPrice, isRent && styles.previewRentPrice]}>
                ¥{isRent ? parseAmount(form.monthlyRent) : parseAmount(form.price)}
              </Text>
              <Text style={styles.previewPriceMeta}>{isRent ? "/月" : selectedCategory?.label}</Text>
            </View>
            {isRent ? (
              <View style={styles.previewSpecGrid}>
                <PreviewSpec label="区域" value={form.district.trim()} />
                <PreviewSpec label="房型" value={form.roomType.trim()} />
                <PreviewSpec label="入住" value={form.availableFrom.trim()} />
                <PreviewSpec label="租期" value={form.leaseTerm.trim() || "租期可谈"} />
              </View>
            ) : (
              <View style={styles.previewSpecGrid}>
                <PreviewSpec label="成色" value={normalizeCondition(form.condition)} />
                <PreviewSpec label="分类" value={selectedCategory?.label ?? "其他"} />
                <PreviewSpec label="位置" value={form.location.trim()} />
              </View>
            )}
            <View style={styles.previewDescriptionBlock}>
              <Text style={styles.previewDescriptionLabel}>描述</Text>
              <Text style={styles.previewDescription}>{previewDescription}</Text>
            </View>
          </View>

          {error ? (
            <View style={styles.error}>
              <Ionicons color={colors.coral} name="alert-circle-outline" size={20} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.previewActions}>
            <Pressable onPress={() => setIsPreviewing(false)} style={styles.secondarySubmitButton}>
              <Text style={styles.secondarySubmitText}>返回修改</Text>
            </Pressable>
            <Pressable
              disabled={isSaving}
              onPress={handleConfirmPublish}
              style={[styles.submitButton, styles.previewConfirmButton, isSaving && styles.submitButtonDisabled]}
            >
              <Text style={styles.submitText}>{isSaving ? "发布中..." : "确认发布"}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>发布</Text>
            <Text style={styles.subtitle}>
              {isRent ? "转租会收集租房专用信息，方便别人快速判断。" : "拍清楚、价格明确，成交会更顺。"}
            </Text>
          </View>

          <Pressable onPress={handlePickImages} style={styles.imagePicker}>
            {selectedImages.length ? (
              <>
                <View style={styles.imagePickerTop}>
                  <View>
                    <Text style={styles.imageTitle}>已选择 {selectedImages.length}/{MAX_LISTING_IMAGES} 张</Text>
                    <Text style={styles.imageMeta}>第一张会作为封面</Text>
                  </View>
                  <View style={styles.changeImageButton}>
                    <Text style={styles.changeImageText}>重新选择</Text>
                  </View>
                </View>
                <ScrollView
                  contentContainerStyle={styles.previewRow}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {selectedImages.map((asset, index) => (
                    <View key={`${asset.uri}-${index}`} style={styles.previewWrap}>
                      <Image source={{ uri: asset.uri }} style={styles.previewImage} />
                      {index === 0 ? (
                        <View style={styles.coverBadge}>
                          <Text style={styles.coverBadgeText}>封面</Text>
                        </View>
                      ) : null}
                      <Pressable
                        hitSlop={8}
                        onPress={(event) => handleRemoveImage(index, event)}
                        style={styles.removeImageButton}
                      >
                        <Ionicons color={colors.white} name="close" size={15} />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                <View style={styles.imageIcon}>
                  <Ionicons color={colors.accent} name="images-outline" size={24} />
                </View>
                <Text style={styles.imageTitle}>添加照片</Text>
                <Text style={styles.imageMeta}>最多 {MAX_LISTING_IMAGES} 张，未选择时使用默认图</Text>
              </>
            )}
          </Pressable>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>选择分类</Text>
            <CategoryGrid categories={publishCategories} onSelect={handleSelectCategory} selectedId={selectedId} />
            {fieldErrors.categoryId ? <Text style={styles.fieldErrorText}>{fieldErrors.categoryId}</Text> : null}
          </View>

          <View style={styles.formSection}>
            <View style={styles.selectedNotice}>
              <Text style={styles.selectedLabel}>当前分类</Text>
              <Text style={styles.selectedValue}>{selectedCategory?.label}</Text>
            </View>
            <FormField
              error={fieldErrors.title}
              label="标题"
              onChangeText={(value) => updateForm("title", value)}
              placeholder={isRent ? "例如：近地铁主卧转租" : "例如：9成新降噪耳机"}
              value={form.title}
            />
            {isRent ? (
              <>
                <FormField
                  error={fieldErrors.monthlyRent}
                  keyboardType="numeric"
                  label="月租"
                  onChangeText={(value) => updateForm("monthlyRent", value)}
                  placeholder="例如：4200"
                  value={form.monthlyRent}
                />
                <FormField
                  error={fieldErrors.district}
                  label="区域"
                  onChangeText={(value) => updateForm("district", value)}
                  placeholder="例如：世纪公园 / 五道口"
                  value={form.district}
                />
                <FormField
                  error={fieldErrors.roomType}
                  label="房型"
                  onChangeText={(value) => updateForm("roomType", value)}
                  placeholder="例如：三室一厅主卧 / 一居室整租"
                  value={form.roomType}
                />
                <FormField
                  error={fieldErrors.availableFrom}
                  label="可入住时间"
                  onChangeText={(value) => updateForm("availableFrom", value)}
                  placeholder="例如：7月1日 / 随时入住"
                  value={form.availableFrom}
                />
                <FormField
                  label="租期"
                  onChangeText={(value) => updateForm("leaseTerm", value)}
                  placeholder="例如：6个月起 / 可短租"
                  value={form.leaseTerm}
                />
              </>
            ) : (
              <>
                <FormField
                  error={fieldErrors.price}
                  keyboardType="numeric"
                  label="价格"
                  onChangeText={(value) => updateForm("price", value)}
                  placeholder="例如：299"
                  value={form.price}
                />
                <FormField
                  label="成色"
                  onChangeText={(value) => updateForm("condition", value)}
                  placeholder="例如：几乎全新 / 轻微使用"
                  value={form.condition}
                />
                <FormField
                  error={fieldErrors.location}
                  label="位置"
                  onChangeText={(value) => updateForm("location", value)}
                  placeholder="例如：徐汇区 / 海淀区"
                  value={form.location}
                />
              </>
            )}
            <FormField
              label="描述"
              multiline
              onChangeText={(value) => updateForm("description", value)}
              placeholder="补充使用情况、尺寸、瑕疵、取货方式等"
              value={form.description}
            />
          </View>

          {error ? (
            <View style={styles.error}>
              <Ionicons color={colors.coral} name="alert-circle-outline" size={20} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable onPress={handlePreview} style={styles.submitButton}>
            <Text style={styles.submitText}>预览发布</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function PreviewSpec({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.previewSpec}>
      <Text style={styles.previewSpecLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.previewSpecValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  changeImageButton: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  changeImageText: {
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
  coverBadge: {
    backgroundColor: "#202427CC",
    borderRadius: radius.md,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: "absolute",
    top: 6
  },
  coverBadgeText: {
    color: colors.white,
    fontSize: 11,
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
  fieldErrorText: {
    color: colors.coral,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16
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
  header: {
    gap: 8
  },
  imageIcon: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  imageMeta: {
    color: colors.muted,
    fontSize: 13
  },
  imagePicker: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 156,
    justifyContent: "center",
    padding: spacing.md,
    ...shadows.soft
  },
  imagePickerTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%"
  },
  imageTitle: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: "900"
  },
  keyboard: {
    flex: 1
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.md
  },
  previewActions: {
    flexDirection: "row",
    gap: 12
  },
  previewCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.card
  },
  previewConfirmButton: {
    flex: 1
  },
  previewDescription: {
    color: colors.charcoal,
    fontSize: typography.body,
    lineHeight: 22
  },
  previewDescriptionBlock: {
    gap: 8
  },
  previewDescriptionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  previewHeroImage: {
    height: "100%",
    width: "100%"
  },
  previewHeroWrap: {
    backgroundColor: colors.sand,
    borderRadius: radius.lg,
    height: 220,
    marginRight: 12,
    overflow: "hidden",
    width: 220
  },
  previewImage: {
    height: "100%",
    width: "100%"
  },
  previewImageRow: {
    paddingRight: 4
  },
  previewPrice: {
    color: colors.coral,
    fontSize: 32,
    fontVariant: ["tabular-nums"],
    fontWeight: "900"
  },
  previewPriceLine: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 6
  },
  previewPriceMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  previewRentPrice: {
    color: colors.rent
  },
  previewRow: {
    gap: 10,
    paddingTop: 4
  },
  previewSpec: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    gap: 6,
    minHeight: 68,
    padding: 10,
    width: "47.8%"
  },
  previewSpecGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  previewSpecLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  previewSpecValue: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19
  },
  previewTitle: {
    color: colors.charcoal,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 29
  },
  previewType: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "900"
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
    borderRadius: radius.lg,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: 6,
    top: 6,
    width: 24
  },
  secondarySubmitButton: {
    alignItems: "center",
    backgroundColor: colors.sand,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    minHeight: 52,
    justifyContent: "center"
  },
  secondarySubmitText: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: "900"
  },
  sectionTitle: {
    color: colors.charcoal,
    fontSize: typography.title,
    fontWeight: "900"
  },
  selectedLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  selectedNotice: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderColor: "#CDEAE8",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 14
  },
  selectedValue: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: "900"
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.charcoal,
    borderRadius: radius.lg,
    minHeight: 52,
    justifyContent: "center",
    ...shadows.card
  },
  submitButtonDisabled: {
    opacity: 0.64
  },
  submitText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 20
  },
  title: {
    color: colors.charcoal,
    fontSize: typography.screenTitle,
    fontWeight: "900"
  }
});
