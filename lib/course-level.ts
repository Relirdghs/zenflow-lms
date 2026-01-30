export function courseLevelLabel(level?: string | null) {
  switch (level) {
    case "beginner":
      return "Начальный";
    case "intermediate":
      return "Средний";
    case "advanced":
      return "Продвинутый";
    default:
      return level ?? "";
  }
}
