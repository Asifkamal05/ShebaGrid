const dateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "19 Oct, 11:30" in Dhaka time, the same on the server and in the browser. */
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}

export const CATEGORY_LABEL = {
  pothole: "Pothole",
  waterlogging: "Waterlogging",
  "open-manhole": "Open manhole",
  other: "Other hazard",
} as const;
