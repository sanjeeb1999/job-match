import type { ReactNode } from "react";

export function MatchingStory() {
  return (
    <section
      aria-labelledby="matching-story-heading"
      className="rounded-xl border border-border/80 bg-card px-4 py-5 shadow-sm ring-1 ring-foreground/5 sm:px-5"
    >
      <h2
        id="matching-story-heading"
        className="font-heading text-sm font-semibold tracking-tight"
      >
        Why this match?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Graph-powered matching combines four signals already returned by the
        API. JobMatch is not using AI or ML ranking.
      </p>
      <ul className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-2">
        <StoryStep>Skills</StoryStep>
        <Separator />
        <StoryStep>Project technologies</StoryStep>
        <Separator />
        <StoryStep>Job requirements</StoryStep>
        <Separator />
        <StoryStep>Experience level</StoryStep>
        <li
          className="hidden text-primary sm:inline"
          aria-hidden="true"
        >
          →
        </li>
        <li className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
          Match score
        </li>
      </ul>
    </section>
  );
}

function StoryStep({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground">
      {children}
    </li>
  );
}

function Separator() {
  return (
    <li className="text-muted-foreground" aria-hidden="true">
      <span>+</span>
    </li>
  );
}
