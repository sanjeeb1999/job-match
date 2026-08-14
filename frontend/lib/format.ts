export function formatExperienceLevel(level: string): string {
  switch (level) {
    case "junior":
      return "Junior";
    case "mid":
      return "Mid";
    case "senior":
      return "Senior";
    default:
      return level;
  }
}

export function formatEmploymentType(type: string): string {
  switch (type) {
    case "full-time":
      return "Full-time";
    case "contract":
      return "Contract";
    default:
      return type;
  }
}

export function formatScore(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (Number.isInteger(rounded)) {
    return `${rounded}%`;
  }
  return `${rounded.toFixed(1)}%`;
}

export function matchQualityLabel(overall: number): string {
  if (overall >= 85) {
    return "Excellent match";
  }
  if (overall >= 70) {
    return "Strong match";
  }
  if (overall >= 50) {
    return "Moderate match";
  }
  if (overall >= 30) {
    return "Partial match";
  }
  return "Limited match";
}

export function matchQualityClass(overall: number): string {
  if (overall >= 70) {
    return "bg-teal-50 text-teal-800 ring-teal-200/80";
  }
  if (overall >= 50) {
    return "bg-amber-50 text-amber-900 ring-amber-200/80";
  }
  return "bg-slate-100 text-slate-700 ring-slate-200/80";
}

export function formatExperienceYears(years: number): string {
  return years === 1 ? "1 year experience" : `${years} years experience`;
}
