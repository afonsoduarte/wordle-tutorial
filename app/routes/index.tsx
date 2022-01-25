import { useActionData } from 'remix'
import type { ActionFunction } from 'remix'
import styles from '~/styles/app.css'

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}

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
        <input readOnly name="attempts" value={attempt} className="grid" />
      ))}
      {data?.solved ? (
        <div>{data.solved}</div>
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
