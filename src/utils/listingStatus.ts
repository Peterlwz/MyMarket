import type { ListingStatus } from "@/types/listing";

export function getListingStatusLabel(status: ListingStatus) {
  switch (status) {
    case "reserved":
      return "已预留";
    case "sold":
      return "已出";
    case "removed":
      return "已下架";
    case "active":
    default:
      return "可咨询";
  }
}

export function getListingStatusColors(status: ListingStatus) {
  switch (status) {
    case "reserved":
      return { backgroundColor: "#FFF1DE", color: "#C66B1D" };
    case "sold":
      return { backgroundColor: "#FFF1EE", color: "#E45B3D" };
    case "removed":
      return { backgroundColor: "#EFE8DA", color: "#73706A" };
    case "active":
    default:
      return { backgroundColor: "#E9F7F1", color: "#27785D" };
  }
}

export function isListingVisibleInFeed(status: ListingStatus) {
  return status !== "removed";
}

export function isListingContactable(status: ListingStatus) {
  return status === "active";
}
