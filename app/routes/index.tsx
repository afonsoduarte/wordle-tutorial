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
