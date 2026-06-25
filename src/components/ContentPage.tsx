import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ContentPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="reveal mx-auto w-full max-w-[760px] px-4 pb-16 pt-6 min-[820px]:px-6 min-[820px]:pt-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-body-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Terug naar de calculator
      </Link>
      <h1 className="mt-5 text-title-xl font-bold text-foreground">{title}</h1>
      {intro ? (
        <p className="mt-2 max-w-[640px] text-body-md text-muted-foreground">
          {intro}
        </p>
      ) : null}
      <div className="mt-7 flex flex-col gap-7">{children}</div>
    </main>
  );
}

export function ContentSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-title-md font-semibold text-foreground">{title}</h2>
      <div className="flex flex-col gap-2 text-body-md text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
