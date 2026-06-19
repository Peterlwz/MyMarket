import { assertSupabaseConfigured, supabase } from "@/lib/supabase";
import type { CreateListingInput, ListingStatus, ListingType, UpdateListingInput } from "@/types/api";
import type { CategoryId, Listing, ProductListing, RentListing } from "@/types/listing";
import { defaultListingImages } from "@/utils/defaultListingImages";
import { getListingImages } from "@/utils/listingImages";

import { deleteListingImages, uploadListingImages } from "./remoteImageService";
import type { StoredListing } from "../types";

type RemoteImageRow = {
  image_url: string;
  sort_order: number | null;
};

type RemoteListingRow = {
  area: string | null;
  available_date: string | null;
  category: string | null;
  condition: string | null;
  created_at: string | null;
  description: string | null;
  id: string;
  lease_term: string | null;
  listing_images?: Array<RemoteImageRow> | null;
  location: string | null;
  monthly_rent: number | string | null;
  owner_id: string;
  price: number | string | null;
  room_type: string | null;
  status: string;
  title: string;
  type: string;
  updated_at: string | null;
};

const validCategoryIds: Array<CategoryId> = [
  "all",
  "rent",
  "digital",
  "furniture",
  "appliance",
  "fashion",
  "books",
  "daily",
  "tickets",
  "other"
];

function createUuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (value) => {
    const random = Math.floor(Math.random() * 16);
    const variant = value === "x" ? random : (random & 0x3) | 0x8;
    return variant.toString(16);
  });
}

function normalizeAmount(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : 0;
}

function normalizeStatus(value: string): ListingStatus {
  return value === "reserved" || value === "sold" || value === "removed" ? value : "active";
}

function normalizeCategory(value: string | null, listingType: ListingType): CategoryId {
  if (listingType === "rent") {
    return "rent";
  }

  return validCategoryIds.includes(value as CategoryId) && value !== "all" && value !== "rent"
    ? (value as CategoryId)
    : "other";
}

function normalizeCondition(value: string | null): ProductListing["condition"] {
  if (value === "几乎全新" || value === "轻微使用" || value === "正常使用") {
    return value;
  }

  return "正常使用";
}

function getRemoteListingImages(row: RemoteListingRow, type: ListingType) {
  const imageUrls = (row.listing_images ?? [])
    .slice()
    .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
    .flatMap((image) => (image.image_url ? [image.image_url] : []));

  return imageUrls.length ? imageUrls : [defaultListingImages[type]];
}

function formatPostedAt(createdAt: string | null) {
  if (!createdAt) {
    return "远程发布";
  }

  return new Date(createdAt).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric"
  });
}

function toStoredListing(row: RemoteListingRow): StoredListing {
  const type: ListingType = row.type === "rent" ? "rent" : "product";
  const images = getRemoteListingImages(row, type);
  const base = {
    categoryId: normalizeCategory(row.category, type),
    createdAt: row.created_at ?? new Date(0).toISOString(),
    description: row.description?.trim() || "用户暂未填写详细描述。",
    id: row.id,
    image: images[0],
    images,
    liked: false,
    location: row.location?.trim() || row.area?.trim() || "位置待补充",
    ownerId: row.owner_id,
    postedAt: formatPostedAt(row.created_at),
    seller: {
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80",
      name: `用户 ${row.owner_id.slice(0, 6)}`,
      rating: 5
    },
    status: normalizeStatus(row.status),
    title: row.title,
    type,
    updatedAt: row.updated_at ?? row.created_at ?? new Date(0).toISOString()
  };

  if (type === "rent") {
    return {
      ...base,
      availableFrom: row.available_date?.trim() || "时间待确认",
      district: row.area?.trim() || row.location?.trim() || "区域待补充",
      leaseTerm: row.lease_term?.trim() || "租期可谈",
      monthlyRent: normalizeAmount(row.monthly_rent),
      roomType: row.room_type?.trim() || "房型待补充",
      type
    } satisfies StoredListing & RentListing;
  }

  return {
    ...base,
    condition: normalizeCondition(row.condition),
    pickupMethod: "自提",
    price: normalizeAmount(row.price),
    type
  } satisfies StoredListing & ProductListing;
}

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to read Supabase session for listings", error);
    throw error;
  }

  return data.session?.user.id ?? null;
}

async function requireCurrentUserId() {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("登录后才能发布");
  }

  return userId;
}

function toInsertRow(input: Listing, userId: string) {
  return {
    area: input.type === "rent" ? input.district : null,
    available_date: input.type === "rent" ? input.availableFrom : null,
    category: input.categoryId,
    condition: input.type === "product" ? input.condition : null,
    description: input.description,
    id: input.id,
    lease_term: input.type === "rent" ? input.leaseTerm : null,
    location: input.location,
    monthly_rent: input.type === "rent" ? input.monthlyRent : null,
    owner_id: userId,
    price: input.type === "product" ? input.price : null,
    room_type: input.type === "rent" ? input.roomType : null,
    status: input.status,
    title: input.title,
    type: input.type
  };
}

function toUpdateRow(patch: UpdateListingInput) {
  const row: Record<string, string | number | null | undefined> = {};

  if (patch.title !== undefined) {
    row.title = patch.title;
  }

  if (patch.description !== undefined) {
    row.description = patch.description;
  }

  if (patch.categoryId !== undefined) {
    row.category = patch.categoryId;
  }

  if (patch.location !== undefined) {
    row.location = patch.location;
  }

  if (patch.status !== undefined) {
    row.status = patch.status;
  }

  if ("price" in patch && patch.price !== undefined) {
    row.price = patch.price;
  }

  if ("monthlyRent" in patch && patch.monthlyRent !== undefined) {
    row.monthly_rent = patch.monthlyRent;
  }

  if ("condition" in patch && patch.condition !== undefined) {
    row.condition = patch.condition;
  }

  if ("district" in patch && patch.district !== undefined) {
    row.area = patch.district;
  }

  if ("roomType" in patch && patch.roomType !== undefined) {
    row.room_type = patch.roomType;
  }

  if ("availableFrom" in patch && patch.availableFrom !== undefined) {
    row.available_date = patch.availableFrom;
  }

  if ("leaseTerm" in patch && patch.leaseTerm !== undefined) {
    row.lease_term = patch.leaseTerm;
  }

  return row;
}

async function replaceListingImages(listingId: string, imageUrls: Array<string>) {
  const { error: deleteRowsError } = await supabase
    .from("listing_images")
    .delete()
    .eq("listing_id", listingId);

  if (deleteRowsError) {
    console.error("Failed to clear Supabase listing image rows", deleteRowsError);
    throw new Error("上传失败，请重试");
  }

  if (!imageUrls.length) {
    return;
  }

  const { error: insertRowsError } = await supabase.from("listing_images").insert(
    imageUrls.map((imageUrl, index) => ({
      image_url: imageUrl,
      listing_id: listingId,
      sort_order: index
    }))
  );

  if (insertRowsError) {
    console.error("Failed to insert Supabase listing image rows", insertRowsError);
    throw new Error("上传失败，请重试");
  }
}

async function getListingRow(id: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(image_url, sort_order)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load Supabase listing row", error);
    throw new Error("加载失败，请稍后再试");
  }

  return data as RemoteListingRow | null;
}

export function createListingId(_type: ListingType) {
  return createUuid();
}

export async function getListings(): Promise<Array<StoredListing>> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(image_url, sort_order)")
    .in("status", ["active", "reserved", "sold"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load Supabase listings", error);
    throw new Error("加载失败，请稍后再试");
  }

  return ((data ?? []) as Array<RemoteListingRow>).map(toStoredListing);
}

export async function getMyListings(): Promise<Array<StoredListing>> {
  assertSupabaseConfigured();

  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(image_url, sort_order)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load my Supabase listings", error);
    throw new Error("加载失败，请稍后再试");
  }

  return ((data ?? []) as Array<RemoteListingRow>).map(toStoredListing);
}

export async function createListing(input: CreateListingInput): Promise<StoredListing> {
  assertSupabaseConfigured();

  const userId = await requireCurrentUserId();
  const { data, error } = await supabase
    .from("listings")
    .insert(toInsertRow(input, userId))
    .select("*, listing_images(image_url, sort_order)")
    .single();

  if (error) {
    console.error("Failed to create Supabase listing", error);
    throw new Error("发布失败，请稍后再试");
  }

  const createdRow = data as RemoteListingRow;
  const uploadedImageUrls = await uploadListingImages(createdRow.id, getListingImages(input));

  await replaceListingImages(createdRow.id, uploadedImageUrls);

  const rowWithImages = await getListingRow(createdRow.id);

  if (!rowWithImages) {
    throw new Error("发布失败，请稍后再试");
  }

  return toStoredListing(rowWithImages);
}

export async function updateListing(id: string, patch: UpdateListingInput): Promise<StoredListing | undefined> {
  assertSupabaseConfigured();
  await requireCurrentUserId();

  const existingRow = await getListingRow(id);

  if (!existingRow) {
    return undefined;
  }

  const { error } = await supabase
    .from("listings")
    .update(toUpdateRow(patch))
    .eq("id", id);

  if (error) {
    console.error("Failed to update Supabase listing", error);
    throw new Error("保存失败，请稍后再试");
  }

  if (patch.images !== undefined || patch.image !== undefined) {
    const requestedImages = patch.images ?? (patch.image ? [patch.image] : []);
    const existingImages = getRemoteListingImages(existingRow, existingRow.type === "rent" ? "rent" : "product");
    const uploadedImageUrls = await uploadListingImages(id, requestedImages);
    await replaceListingImages(id, uploadedImageUrls);
    await deleteListingImages(existingImages.filter((imageUrl) => !uploadedImageUrls.includes(imageUrl)));
  }

  const updatedRow = await getListingRow(id);

  return updatedRow ? toStoredListing(updatedRow) : undefined;
}

export async function deleteListing(id: string) {
  assertSupabaseConfigured();
  await requireCurrentUserId();

  const existingRow = await getListingRow(id);
  const existingImages = existingRow ? getRemoteListingImages(existingRow, existingRow.type === "rent" ? "rent" : "product") : [];
  const { error } = await supabase.from("listings").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete Supabase listing", error);
    throw new Error("删除失败，请稍后再试");
  }

  await deleteListingImages(existingImages);
}

export async function updateListingStatus(id: string, status: ListingStatus) {
  assertSupabaseConfigured();
  await requireCurrentUserId();

  const { error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Failed to update Supabase listing status", error);
    throw new Error("操作失败，请稍后再试");
  }
}
