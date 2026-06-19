import * as FileSystem from "expo-file-system/legacy";
import type { ImagePickerAsset } from "expo-image-picker";

export const MAX_LISTING_IMAGES = 6;

const LOCAL_IMAGE_FOLDER_NAME = "listing-images";

function getLocalImageDirectory() {
  if (!FileSystem.documentDirectory) {
    throw new Error("Document directory is not available.");
  }

  return `${FileSystem.documentDirectory}${LOCAL_IMAGE_FOLDER_NAME}/`;
}

function getImageExtension(asset: ImagePickerAsset) {
  const fileName = asset.fileName ?? asset.uri.split("/").pop() ?? "";
  const fileExtension = fileName.includes(".") ? fileName.split(".").pop() : "";
  const normalizedExtension = fileExtension?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  if (normalizedExtension) {
    return normalizedExtension;
  }

  if (asset.mimeType?.includes("png")) {
    return "png";
  }

  if (asset.mimeType?.includes("heic")) {
    return "heic";
  }

  if (asset.mimeType?.includes("webp")) {
    return "webp";
  }

  return "jpg";
}

async function ensureLocalImageDirectory() {
  const directory = getLocalImageDirectory();
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  return directory;
}

export function isManagedListingImageUri(uri: string) {
  if (!FileSystem.documentDirectory) {
    return false;
  }

  return uri.startsWith(`${FileSystem.documentDirectory}${LOCAL_IMAGE_FOLDER_NAME}/`);
}

export async function savePickedImagesForListing(
  assets: Array<ImagePickerAsset>,
  listingId: string
) {
  if (assets.length === 0) {
    return [];
  }

  const directory = await ensureLocalImageDirectory();
  const limitedAssets = assets.slice(0, MAX_LISTING_IMAGES);
  const savedUris: Array<string> = [];

  for (const [index, asset] of limitedAssets.entries()) {
    const extension = getImageExtension(asset);
    const destination = `${directory}${listingId}-${index + 1}-${Date.now()}.${extension}`;

    await FileSystem.copyAsync({
      from: asset.uri,
      to: destination
    });
    savedUris.push(destination);
  }

  return savedUris;
}

export async function deleteLocalImageFiles(imageUris: Array<string>) {
  await Promise.all(
    imageUris
      .filter(isManagedListingImageUri)
      .map((uri) => FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined))
  );
}
