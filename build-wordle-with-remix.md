# Build a Wordle clone with Remix

## intro to remix

## install remix

```sh
npx create-remix@latest
```

## simple form and back-end check

```sh
npm run dev
```

1. Change title
2. remove ScrollRestoration

```tsx
// root.tsx
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
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}
```

Create a plain ol' html form, and an input with [pattern](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern)

```tsx
// routes/index.tsx
export default function Wordle() {
  return (
    <form>
      <label>
        <p>type a 5 letter words</p>
        <input
          type="text"
          name="word"
          required
          maxLength={5}
          pattern="[a-zA-Z]{5}"
          title="5 lowercase letters"
        />
      </label>
    </form>
  )
}
```

Checking the result against a dictionary and solution

```tsx
// routes/index.tsx
import { useActionData } from 'remix'
import type { ActionFunction } from 'remix'

const dictionary = ['weary', 'teary', 'pluto', 'rebus', 'words']

const solution = 'words'

interface ActionData {
  error?: {
    word: string
  }
  attempts: string[]
  solved?: string
}

export const action: ActionFunction = async ({
  request
}): Promise<ActionData> => {
  const body = await request.formData()
  const word = body.get('word')
  const attempts = body.getAll('attempts') as string[]
  if (typeof word !== 'string') {
    return { error: { word: 'missing' }, attempts }
  }

  if (word === solution) {
    return { solved: solution, attempts }
  }

  if (dictionary.includes(word)) {
    return { attempts: attempts.concat(word) }
  }

  return { error: { word }, attempts }
}

export default function Wordle() {
  const data = useActionData<ActionData>()

  return (
    <form method="POST" action="/?index">
      {data?.attempts?.map((attempt) => (
        <input readOnly name="attempts" value={attempt} />
      ))}
      {data?.solved ? (
        <input readOnly name="solved" value={data.solved} />
      ) : (
        <label>
          <p>type a 5 letter word</p>
          <input
            type="text"
            name="word"
            required
            defaultValue={data?.error?.word || ''}
            maxLength={5}
            pattern="[a-z]{5}"
            title="5 lowercase letters"
          />
          <button type="submit">submit</button>
        </label>
      )}
    </form>
  )
}
```

## styling: adding tailwind.css

https://tailwindcss.com/docs/guides/remix

```sh
npm install -D tailwindcss postcss autoprefixer concurrently
npx tailwindcss init -p
```

```js
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}
```

```js
// package.json
{
  "scripts": {
    "postinstall": "remix setup node",
    "deploy": "fly deploy --remote-only",
    "start": "remix-serve build",
    "build": "npm run build:css && remix build",
    "build:css": "tailwindcss -m -i ./styles/app.css -o app/styles/app.css",
    "dev": "concurrently \"npm run dev:css\" \"remix dev\"",
    "dev:css": "tailwindcss -w -i ./styles/app.css -o app/styles/app.css"
  },
}
```

create styles/app.css

```tsx
// index.tsx
import styles from '~/styles/app.css'

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}
```

Add Row and Cell

```tsx
import { useActionData } from 'remix'
import type { ActionFunction } from 'remix'
import styles from '~/styles/app.css'
import { useEffect, useRef, useState } from 'react'
import { dictionary, solutions } from '~/dictionary'

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}

const now = new Date()
const dd = String(now.getDate()).padStart(2, '0')
const mm = String(now.getMonth() + 1).padStart(2, '0') //January is 0!
const yyyy = now.getFullYear()

const today = Number(yyyy + mm + dd)
const solutionIndex = today - 20220128

const solution = solutions[solutionIndex]

const rows = Array.from({ length: 6 })
const cells = Array.from({ length: 5 })

interface ActionData {
  error?: {
    word: string
  }
  attempts: string[]
  solved?: string
}

export const action: ActionFunction = async ({
  request
}): Promise<ActionData> => {
  const body = await request.formData()
  const word = body.get('word')
  const attempts = body.getAll('attempts') as string[]
  if (typeof word !== 'string') {
    return { error: { word: 'missing' }, attempts }
  }

  if (word === solution) {
    return { solved: solution, attempts }
  }

  if (solutions.includes(word) || dictionary.includes(word)) {
    return { attempts: attempts.concat(word) }
  }

  return { error: { word }, attempts }
}

export default function Wordle() {
  const data = useActionData<ActionData>()
  const [inputState, setInputState] = useState(data?.error?.word || '')
  const inputRef = useRef<HTMLInputElement>(null)

  const allRows = [...(data?.attempts || []), data?.solved || inputState]

  useEffect(() => {
    inputRef.current?.select()
  }, [])

  return (
    <form method="POST" action="/?index">
      {rows.map((_, rowIndex) => (
        <Row key={rowIndex}>
          {cells.map((_, i) => (
            <Cell
              key={`${rowIndex}-${i}`}
              index={i}
              letter={allRows[rowIndex]?.split('')[i]}
              solution={
                rowIndex < (data?.attempts?.length || 0) || data?.solved
                  ? solution
                  : ''
              }
            />
          ))}
        </Row>
      ))}
      {data?.attempts?.map((attempt, i) => (
        <input
          key={i}
          type="hidden"
          name="attempts"
          value={attempt}
          className="grid"
        />
      ))}
      {data?.solved ? (
        <div>{data.solved}</div>
      ) : (
        <label>
          <p>type a 5 letter word</p>
          <input
            ref={inputRef}
            type="text"
            name="word"
            required
            value={inputState}
            onChange={(e) => setInputState(e.target.value)}
            maxLength={5}
            pattern="[a-z]{5}"
            title="5 lowercase letters"
            autoFocus
          />
          {data?.error?.word === inputState && <p>Invalid word</p>}
          <button type="submit">submit</button>
        </label>
      )}
    </form>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-center">{children}</div>
}

type CellProps = React.PropsWithChildren<{
  letter: string | null
  index: number
  solution: string | ''
}>

function Cell({ index, letter, solution }: CellProps) {
  let colour = 'bg-gray-400'
  if (!letter || !solution) {
    colour = 'bg-white-100'
  } else if (solution[index] === letter) {
    colour = 'bg-green-100'
  } else if (solution.includes(letter)) {
    colour = 'bg-yellow-100'
  }
  return (
    <div
      className={`w-16 h-14 grid border-2 border-black m-1 text-center text-5xl uppercase ${colour}`}
    >
      <div className="m-auto">{letter || ' '}</div>
    </div>
  )
}
```

## progressive enhancement - Form

## animation
