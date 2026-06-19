import { appConfig, isRemoteDataMode } from "@/config/appConfig";

import * as localFavoriteService from "./local/localFavoriteService";
import * as localImageService from "./local/localImageService";
import * as localListingService from "./local/localListingService";
import * as localMessageService from "./local/localMessageService";
import * as remoteAuthService from "./remote/remoteAuthService";
import * as remoteFavoriteService from "./remote/remoteFavoriteService";
import * as remoteImageService from "./remote/remoteImageService";
import * as remoteListingService from "./remote/remoteListingService";
import type { FavoriteService, ImageService, ListingService } from "./types";

export type { StoredListing } from "./types";

export const dataMode = appConfig.dataMode;
export const isRemoteMode = isRemoteDataMode;

export const listingService: ListingService = isRemoteDataMode
  ? remoteListingService
  : localListingService;

export const favoriteService: FavoriteService = isRemoteDataMode
  ? remoteFavoriteService
  : localFavoriteService;

export const imageService: ImageService = isRemoteDataMode
  ? remoteImageService
  : localImageService;

export const messageService = localMessageService;
export const authService = remoteAuthService;
