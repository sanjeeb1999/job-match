/**
 * Deterministic JobMatch scoring.
 *
 * Weights (architecture.md):
 *   must-have skill coverage     60%
 *   nice-to-have skill coverage  20%
 *   technology overlap           15%
 *   experience/level fitness      5%
 *
 * Seeded experienceLevel values are junior < mid < senior.
 *
 * Level fitness:
 *   exact match                  100
 *   developer one level above    100
 *   developer one level below     60
 *   two or more levels below      20
 *   two or more levels above      50
 *
 * Edge cases:
 *   no required skills        → must-have coverage 100 (do not penalize)
 *   no nice-to-have skills    → nice-to-have coverage 100 (do not penalize)
 *   no job technologies       → technology overlap 0 (nothing to overlap)
 *   no overlapping project tech and job has technologies → 0
 */
export const SCORE_WEIGHTS = {
  mustHave: 0.6,
  niceToHave: 0.2,
  technologyOverlap: 0.15,
  levelFitness: 0.05,
} as const;

const LEVEL_RANK: Record<string, number> = {
  junior: 0,
  mid: 1,
  senior: 2,
};

export function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function coveragePercent(matched: number, total: number): number {
  if (total === 0) {
    return 100;
  }
  return roundScore((matched / total) * 100);
}

export function technologyOverlapPercent(
  overlapping: number,
  jobTechnologyCount: number,
): number {
  if (jobTechnologyCount === 0) {
    return 0;
  }
  return roundScore((overlapping / jobTechnologyCount) * 100);
}

export function levelFitness(
  developerLevel: string,
  jobLevel: string,
): number {
  const developerRank = LEVEL_RANK[developerLevel];
  const jobRank = LEVEL_RANK[jobLevel];

  if (developerRank === undefined || jobRank === undefined) {
    return 50;
  }

  const diff = developerRank - jobRank;
  if (diff === 0 || diff === 1) {
    return 100;
  }
  if (diff === -1) {
    return 60;
  }
  if (diff <= -2) {
    return 20;
  }
  return 50;
}

export function overallScore(parts: {
  mustHave: number;
  niceToHave: number;
  technologyOverlap: number;
  levelFitness: number;
}): number {
  return roundScore(
    parts.mustHave * SCORE_WEIGHTS.mustHave +
      parts.niceToHave * SCORE_WEIGHTS.niceToHave +
      parts.technologyOverlap * SCORE_WEIGHTS.technologyOverlap +
      parts.levelFitness * SCORE_WEIGHTS.levelFitness,
  );
}

export function buildExplanation(input: {
  matchedRequired: number;
  totalRequired: number;
  matchedNice: number;
  totalNice: number;
  overlappingNames: string[];
  technologyOverlap: number;
  levelFitness: number;
}): string[] {
  const explanation = [
    `Matches ${input.matchedRequired} of ${input.totalRequired} required skills`,
  ];

  if (input.totalNice === 0) {
    explanation.push('No nice-to-have skills listed');
  } else {
    explanation.push(
      `Matches ${input.matchedNice} of ${input.totalNice} nice-to-have skills`,
    );
  }

  if (input.overlappingNames.length > 0) {
    const names = input.overlappingNames.join(', ');
    explanation.push(
      input.technologyOverlap >= 50
        ? `Strong technology overlap: ${names}`
        : `Some technology overlap: ${names}`,
    );
  } else {
    explanation.push('No shared project technologies');
  }

  if (input.levelFitness === 100) {
    explanation.push('Experience level is a strong fit');
  } else if (input.levelFitness === 60) {
    explanation.push('Experience level is one step below the job');
  } else if (input.levelFitness === 20) {
    explanation.push('Experience level is below the job requirement');
  } else {
    explanation.push('Experience level is a mixed fit');
  }

  return explanation;
}
