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
      <body
      // style={{
      //   background:
      //     "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='100%25' width='100%25'%3E%3Cdefs%3E%3Cpattern id='doodad' width='5' height='5' viewBox='0 0 40 40' patternUnits='userSpaceOnUse' patternTransform='rotate(135)'%3E%3Crect width='100%25' height='100%25' fill='rgba(155, 44, 44,1)'/%3E%3Cpath d='M0 40h-10v-60h60L40 0L33 8h-26v24z' fill='rgba(229, 62, 62,1)'/%3E%3Cpath d='M40 0v10h60v60L0 40L7 32h26v-24z' fill='rgba(245, 101, 101,1)'/%3E%3Cpath d='M40 0v10h60v60L0 40L0 40h40v-40z' fill='rgba(229, 62, 62,1)'/%3E%3Cpath d='M0 40h-10v-60h60L40 0L40 0h-40v40z' fill='rgba(245, 101, 101,1)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23doodad)' height='200%25' width='200%25'/%3E%3C/svg%3E \")"
      // }}
      >
        <Outlet />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}
