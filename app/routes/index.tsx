import { useActionData } from 'remix'
import type { ActionFunction } from 'remix'
import styles from '~/styles/app.css'
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'
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

const rows = Array.from({ length: 6 })
const cells = Array.from({ length: 5 })

type LetterState = 'used' | 'guessed' | 'guessedInWrongLocation' | 'input'

type Letter = { letter: string; state: LetterState }

type Attempt = Letter[]

type AttemptsWithState = Attempt[]

function attemptsWithState(
  attempts: string[],
  solution: string
): AttemptsWithState {
  let letterStates: AttemptsWithState = []

  for (let i = 0; i < attempts.length; i++) {
    const word = attempts[i]
    const letters = word.split('')
    letterStates[i] = []
    for (let j = 0; j < letters.length; j++) {
      const letter = letters[j]
      if (solution[j] === letter) {
        letterStates[i].push({ letter, state: 'guessed' })
      } else if (solution.includes(letter)) {
        letterStates[i].push({ letter, state: 'guessedInWrongLocation' })
      } else {
        letterStates[i].push({ letter, state: 'used' })
      }
    }
  }

  return letterStates
}

interface ActionData {
  error?: {
    word: string
  }
  attempts: AttemptsWithState
  solved?: string
}

export const action: ActionFunction = async ({
  request
}): Promise<ActionData> => {
  const body = await request.formData()
  const word = body.get('word')?.toString().toLowerCase()
  const attempts = body.getAll('attempts') as string[]
  const solution = solutions[solutionIndex]

  if (attempts.includes(solution)) {
    return {
      solved: solution,
      attempts: attemptsWithState(attempts, solution)
    }
  }

  if (typeof word !== 'string') {
    return {
      error: { word: 'missing' },
      attempts: attemptsWithState(attempts, solution)
    }
  }

  if (word === solution) {
    const newAttempts = [...attempts, word]
    return {
      solved: solution,
      attempts: attemptsWithState(newAttempts, solution)
    }
  }

  if (solutions.includes(word) || dictionary.includes(word)) {
    const newAttempts = [...attempts, word]
    return {
      attempts: attemptsWithState(newAttempts, solution)
    }
  }

  return {
    error: { word },
    attempts: attemptsWithState(attempts, solution)
  }
}

export default function Wordle() {
  const data = useActionData<ActionData>()
  const [inputState, setInputState] = useState(data?.error?.word || '')
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputStateRow: Attempt = inputState.split('').map((letter) => ({
    letter,
    state: 'input'
  }))

  const allRows = [...(data?.attempts || []), inputStateRow]

  function handleKeyDown(c: string) {
    if (c === '{enter}') {
      return buttonRef.current?.click()
    }
    if (c === '{backspace}') {
      return setInputState((s) => s.substring(0, s.length - 1))
    }
    setInputState((s) => s + c.toLowerCase())
  }

  useEffect(() => {
    inputRef.current?.select()
  }, [])

  return (
    <form
      method="POST"
      action="/?index"
      className="m-auto max-w-lg"
      onClick={() => inputRef.current?.focus()}
    >
      {rows.map((_, rowIndex) => {
        const row = allRows[rowIndex]
        return (
          <Row key={rowIndex}>
            {cells.map((_, i) => {
              if (!row?.[i]) return <Cell key={i} letter=" " type="empty" />
              const letter = row[i]

              return (
                <Cell
                  key={`${rowIndex}-${i}`}
                  letter={letter.letter}
                  type={letter.state}
                />
              )
            })}
          </Row>
        )
      })}
      {data?.attempts?.map((attempt, i) => (
        <input
          key={i}
          type="hidden"
          name="attempts"
          value={attempt.map((letter) => letter?.letter).join('')}
          className="grid"
        />
      ))}
      <div className="flex flex-col items-center gap-2 mt-8">
        <label htmlFor="word">Type a 5 letter word</label>
        <div className={`flex gap-2 outline-none `}>
          <input
            ref={inputRef}
            type="text"
            id="word"
            name="word"
            required
            value={inputState}
            onChange={(e) => {
              if (e.target.value.match(/[^a-zA-Z]+/) === null) {
                setInputState(e.target.value)
              }
            }}
            maxLength={5}
            pattern="[a-zA-Z]{5}"
            title="5 letters"
            className="border-2 border-gray-600 p-2 w-40"
            disabled={Boolean(data?.solved)}
            autoFocus
          />
          <button
            ref={buttonRef}
            type="submit"
            disabled={Boolean(data?.solved)}
            className="uppercase text-sm tracking-wide border-2 border-gray-600 p-2"
          >
            submit
          </button>
        </div>
        {data?.error?.word === inputState && (
          <p className="text-red-500">Invalid word</p>
        )}
      </div>
      {/* <Keyboard
        onKeyPress={handleKeyDown}
        usedLetters={data?.attempts.join('').split('') || []}
      /> */}
    </form>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-center">{children}</div>
}

type CellProps = React.PropsWithChildren<{
  type: LetterState | 'empty'
  letter: string | null
}>

const CELL_COLOURS = {
  guessed: 'bg-green-400',
  guessedInWrongLocation: 'bg-yellow-100',
  used: 'bg-gray-400',
  input: 'bg-white'
} as const

function Cell({ letter, type }: CellProps) {
  return (
    <div
      className={`w-16 h-14 grid border-2 border-black m-1 text-center text-5xl uppercase ${CELL_COLOURS[type]}`}
    >
      <div className="m-auto">{letter || ' '}</div>
    </div>
  )
}

function Keyboard({
  onKeyPress,
  usedLetters
}: PropsWithChildren<{
  onKeyPress: (s: string) => void
  usedLetters: string[]
}>): React.ReactNode {
  const layout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
  ] as const
  return layout.map((row, i) => (
    <KeyRow key={i}>
      {row.map((c) => (
        <Key
          key={c}
          onClick={() => onKeyPress(c)}
          className={
            usedLetters.includes(c.toLowerCase())
              ? 'bg-gray-400'
              : 'bg-gray-200'
          }
        >
          {c}
        </Key>
      ))}
    </KeyRow>
  ))
}

function KeyRow({ children }: PropsWithChildren<{}>) {
  return <div className="flex justify-center gap-2 py-2">{children}</div>
}

function Key({
  children,
  className,
  ...props
}: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      type="button"
      className={`p-4 text-lg rounded-md ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
