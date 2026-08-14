import type { ReactNode } from "react";

export function MatchingStory() {
  return (
    <section
      aria-labelledby="matching-story-heading"
      className="rounded-xl border bg-card px-4 py-4 ring-1 ring-foreground/10 sm:px-5"
    >
      <h2
        id="matching-story-heading"
        className="font-heading text-sm font-medium"
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
          className="hidden text-muted-foreground sm:inline"
          aria-hidden="true"
        >
          →
        </li>
        <li className="font-medium text-foreground">Match score</li>
      </ul>
    </section>
  );
}

function StoryStep({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-md border bg-muted/40 px-2.5 py-1 font-medium">
      {children}
    </li>
  );
}

function Separator() {
  return (
    <li className="text-muted-foreground" aria-hidden="true">
      <span className="sm:hidden">+</span>
      <span className="hidden sm:inline">+</span>
    </li>
  );
}
