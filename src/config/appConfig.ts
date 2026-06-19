export const appConfig = {
  dataMode: "local" as "local" | "remote"
} as const;

export const isRemoteDataMode = appConfig.dataMode === "remote";
