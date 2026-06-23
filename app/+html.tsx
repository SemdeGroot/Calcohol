import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const THEME_COLOR = "#F5F8F7";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="nl">
      <head>
        <meta charSet="utf-8" />
        <title>AlcoTox</title>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content={THEME_COLOR} />
        <style
          dangerouslySetInnerHTML={{
            __html: `html { color-scheme: light; background: ${THEME_COLOR}; } body { background: ${THEME_COLOR}; }`,
          }}
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
