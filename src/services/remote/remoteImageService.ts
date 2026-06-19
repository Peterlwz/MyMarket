import type { ImagePickerAsset } from "expo-image-picker";

import { assertSupabaseConfigured, supabase } from "@/lib/supabase";
import { MAX_LISTING_IMAGES } from "@/storage/images";
import type { ListingType } from "@/types/api";
import { defaultListingImages } from "@/utils/defaultListingImages";

const LISTING_IMAGES_BUCKET = "listing-images";

export { MAX_LISTING_IMAGES };

type TempImageInput = ImagePickerAsset | string;

const normalizeUri = (image: TempImageInput) => (typeof image === "string" ? image : image.uri);

function isRemoteUrl(uri: string) {
  return uri.startsWith("http://") || uri.startsWith("https://");
}

function getExtension(uri: string) {
  const fileName = uri.split("?")[0]?.split("/").pop() ?? "";
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "";
  const normalized = extension?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return normalized || "jpg";
}

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to read Supabase session before image upload", error);
    throw error;
  }

  if (!data.session?.user) {
    throw new Error("登录后才能上传图片");
  }

  return data.session.user.id;
}

async function uploadImageUri(listingId: string, uri: string, index: number) {
  if (isRemoteUrl(uri)) {
    return uri;
  }

  const userId = await getCurrentUserId();
  const extension = getExtension(uri);
  const path = `${userId}/${listingId}/${Date.now()}-${index + 1}.${extension}`;
  const response = await fetch(uri);
  const blob = await response.blob();
  const contentType = blob.type || `image/${extension === "jpg" ? "jpeg" : extension}`;
  const { error } = await supabase.storage.from(LISTING_IMAGES_BUCKET).upload(path, blob, {
    contentType,
    upsert: false
  });

  if (error) {
    console.error("Supabase listing image upload failed", error);
    throw new Error("上传失败，请重试");
  }

  const { data } = supabase.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadListingImages(listingId: string, imageUris: Array<string>) {
  assertSupabaseConfigured();

  const limitedUris = imageUris.filter(Boolean).slice(0, MAX_LISTING_IMAGES);
  const uploadedUrls: Array<string> = [];

  for (const [index, imageUri] of limitedUris.entries()) {
    uploadedUrls.push(await uploadImageUri(listingId, imageUri, index));
  }

  return uploadedUrls;
}

export async function persistImages(tempUris: Array<TempImageInput>, listingId?: string) {
  if (!listingId) {
    throw new Error("listingId is required when uploading images in remote mode.");
  }

  return uploadListingImages(listingId, tempUris.map(normalizeUri));
}

function getStoragePathFromPublicUrl(imageUrl: string) {
  const marker = `/storage/v1/object/public/${LISTING_IMAGES_BUCKET}/`;

  try {
    const { pathname } = new URL(imageUrl);
    const markerIndex = pathname.indexOf(marker);

    if (markerIndex < 0) {
      return null;
    }

    return decodeURIComponent(pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function deleteListingImages(imageUrls: Array<string>) {
  assertSupabaseConfigured();

  const storagePaths = imageUrls.flatMap((imageUrl) => {
    const storagePath = getStoragePathFromPublicUrl(imageUrl);
    return storagePath ? [storagePath] : [];
  });

  if (!storagePaths.length) {
    return;
  }

  const { error } = await supabase.storage.from(LISTING_IMAGES_BUCKET).remove(storagePaths);

  if (error) {
    console.error("Supabase listing image delete failed", error);
  }
}

export function getDefaultImageForType(type: ListingType) {
  return defaultListingImages[type];
}
