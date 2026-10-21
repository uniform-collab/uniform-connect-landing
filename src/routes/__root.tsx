import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Context } from "@uniformdev/context";
import { UniformContext } from "@uniformdev/context-react";
import { manifest } from "../uniform/manifest";

// Imported as URLs and registered as head links. React 19 hoists and dedupes
// these stylesheets (via the `precedence` prop TanStack adds) so the client
// reuses the SSR <link> instead of re-creating it -- no flash of unstyled
// content. (This is exactly what React 18 could not do.)
import indexCss from "../index.css?url";
import appCss from "../App.css?url";

// TODO: load the manifest from Uniform
const context = new Context({ manifest, defaultConsent: true });

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Uniform Connect · Down for maintenance" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400..700&display=swap",
      },
      { rel: "stylesheet", href: indexCss },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <UniformContext context={context}>
        <Outlet />
      </UniformContext>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div id="root">{children}</div>
        <Scripts />
      </body>
    </html>
  );
}
