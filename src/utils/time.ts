const padTime = (value: number) => value.toString().padStart(2, "0");

const isSameDate = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export function formatConversationTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  if (isSameDate(date, now)) {
    return `${padTime(date.getHours())}:${padTime(date.getMinutes())}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDate(date, yesterday)) {
    return "昨天";
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${padTime(date.getHours())}:${padTime(date.getMinutes())}`;
}
