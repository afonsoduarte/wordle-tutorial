import { Links, LiveReload, Meta, Outlet, Scripts } from 'remix'
import type { MetaFunction } from 'remix'

export const meta: MetaFunction = () => {
  return { title: 'Wordle Remix' }
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        {/* <Scripts /> */}
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}
