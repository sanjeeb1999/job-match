import {
  buildExplanation,
  coveragePercent,
  levelFitness,
  overallScore,
  roundScore,
  technologyOverlapPercent,
} from './scoring';

describe('recommendation scoring', () => {
  it('sets niceToHave to 100 when a job has no nice-to-have skills', () => {
    expect(coveragePercent(0, 0)).toBe(100);
  });

  it('sets technologyOverlap to 0 when a job has no technologies', () => {
    expect(technologyOverlapPercent(0, 0)).toBe(0);
  });

  it('calculates partial technology overlap from distinct counts', () => {
    expect(technologyOverlapPercent(1, 4)).toBe(25);
  });

  it('calculates full technology overlap as 100', () => {
    expect(technologyOverlapPercent(4, 4)).toBe(100);
  });

  it('matches the documented weighted formula', () => {
    const mustHave = 75;
    const niceToHave = 50;
    const technologyOverlap = 66.7;
    const fitness = 100;

    expect(
      overallScore({
        mustHave,
        niceToHave,
        technologyOverlap,
        levelFitness: fitness,
      }),
    ).toBe(roundScore(75 * 0.6 + 50 * 0.2 + 66.7 * 0.15 + 100 * 0.05));
  });

  it('reproduces Priya × Platform Engineer from the seeded graph', () => {
    const mustHave = 40;
    const niceToHave = 0;
    const technologyOverlap = 25;
    const fitness = 100;

    expect(technologyOverlapPercent(1, 4)).toBe(25);
    expect(
      overallScore({
        mustHave,
        niceToHave,
        technologyOverlap,
        levelFitness: fitness,
      }),
    ).toBe(32.8);
  });

  it('scores level fitness from seeded junior/mid/senior ranks', () => {
    expect(levelFitness('mid', 'mid')).toBe(100);
    expect(levelFitness('senior', 'mid')).toBe(100);
    expect(levelFitness('mid', 'senior')).toBe(60);
    expect(levelFitness('junior', 'senior')).toBe(20);
    expect(levelFitness('senior', 'junior')).toBe(50);
  });

  it('builds explanations from actual counts', () => {
    const explanation = buildExplanation({
      matchedRequired: 3,
      totalRequired: 4,
      matchedNice: 1,
      totalNice: 2,
      overlappingNames: ['React', 'MongoDB'],
      technologyOverlap: 66.7,
      levelFitness: 100,
    });

    expect(explanation).toEqual([
      'Matches 3 of 4 required skills',
      'Matches 1 of 2 nice-to-have skills',
      'Strong technology overlap: React, MongoDB',
      'Experience level is a strong fit',
    ]);
  });
});
