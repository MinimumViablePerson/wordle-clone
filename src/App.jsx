import { useEffect, useState } from 'react'

import { allWords, wordsToPick } from './words'
import './App.css'

function keyIsInvalid (key) {
  return key.length > 1 || /[^a-z]/i.test(key)
}

function getRandomWord () {
  return wordsToPick[Math.floor(Math.random() * wordsToPick.length)]
}

function noMoreToDelete ({ attempts, position }) {
  const atBeginning = position.char === 0
  const charIsEmpty = attempts[position.attempt][position.char].value === ''
  return atBeginning && charIsEmpty
}

function noMoreToAdd ({ attempts, position }) {
  const atEnd = position.char === 4
  const charIsNotEmpty = attempts[position.attempt][position.char].value !== ''
  return atEnd && charIsNotEmpty
}

function wordIsNotComplete ({ attempts, position }) {
  return attempts[position.attempt].some(char => char.value === '')
}

function wordIsInDictionary ({ attempts, position }) {
  const attempt = attempts[position.attempt]
  const guess = attempt
    .map(char => char.value)
    .join('')
    .toUpperCase()

  return allWords.some(word => word.toUpperCase() === guess)
}

const initialGameState = {
  word: getRandomWord().toUpperCase(),
  attempts: [
    [
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' }
    ],
    [
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' }
    ],
    [
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' }
    ],
    [
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' }
    ],
    [
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' }
    ],
    [
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' },
      { value: '', status: '' }
    ]
  ],
  position: {
    attempt: 0,
    char: 0
  },
  status: 'playing',
  error: ''
}

function App () {
  const [{ word, attempts, position, error }, setGameState] = useState(
    initialGameState
  )

  function enterCharacter (char) {
    char = char.toUpperCase()
    if (keyIsInvalid(char)) return

    setGameState(gameState => {
      if (noMoreToAdd(gameState)) return gameState

      const newGameState = JSON.parse(JSON.stringify(gameState))
      const { attempts, position } = newGameState

      attempts[position.attempt][position.char].value = char
      if (position.char < 4) position.char++

      return newGameState
    })
  }

  function eraseCharacter () {
    setGameState(gameState => {
      if (noMoreToDelete(gameState)) return gameState

      const newGameState = JSON.parse(JSON.stringify(gameState))
      const { attempts, position } = newGameState

      if (attempts[position.attempt][position.char].value !== '') {
        attempts[position.attempt][position.char].value = ''
      } else {
        if (position.char > 0) position.char--
      }

      return newGameState
    })
  }

  function guessWord () {
    setGameState(gameState => {
      if (wordIsNotComplete(gameState)) {
        return { ...gameState, error: 'Palabra incompleta.' }
      }
      if (!wordIsInDictionary(gameState)) {
        return {
          ...gameState,
          error: 'Esta palabra no está en el diccionario.'
        }
      }

      const newGameState = JSON.parse(JSON.stringify(gameState))
      const { attempts, position } = newGameState

      const currentAttempt = attempts[position.attempt]

      let wordCopy = word

      for (const index in currentAttempt) {
        const char = currentAttempt[index]
        if (wordCopy[index] === char.value) {
          char.status = 'at-location'
          wordCopy = wordCopy.replace(char.value, '_')
        }
      }

      for (const index in currentAttempt) {
        const char = currentAttempt[index]
        if (char.status !== '') continue

        if (wordCopy.includes(char.value)) {
          char.status = 'in-word'
          wordCopy = wordCopy.replace(char.value, '_')
        }
      }

      for (const index in currentAttempt) {
        const char = currentAttempt[index]

        if (char.status === '') {
          char.status = 'not-in-word'
        }
      }

      position.attempt += 1
      position.char = 0

      newGameState.error = ''

      return newGameState
    })
  }

  function goLeft () {
    setGameState(gameState => {
      if (gameState.position.char === 0) return gameState

      const newGameState = JSON.parse(JSON.stringify(gameState))
      newGameState.position.char--

      return newGameState
    })
  }

  function goRight () {
    setGameState(gameState => {
      if (gameState.position.char === 4) return gameState

      const newGameState = JSON.parse(JSON.stringify(gameState))
      newGameState.position.char++

      return newGameState
    })
  }

  function updatePosition (newPosition) {
    setGameState(gameState => {
      if (newPosition.attempt !== gameState.position.attempt) return gameState
      return { ...gameState, position: newPosition }
    })
  }

  function checkKey (key) {
    key = key.toUpperCase()
    let status = ''
    for (const attempt of attempts) {
      for (const char of attempt) {
        if (char.value !== key) continue
        if (char.status === 'at-location') {
          return 'at-location'
        } else if (char.status === 'in-word') {
          status = 'in-word'
        } else if (char.status === 'not-in-word' && status === '') {
          status = 'not-in-word'
        }
      }
    }

    return status
  }

  useEffect(() => {
    window.addEventListener('keydown', e => {
      if (e.key === 'Enter') guessWord()
      if (e.key === 'ArrowLeft') goLeft()
      if (e.key === 'ArrowRight') goRight()
      if (e.key === 'Backspace') eraseCharacter()
      else enterCharacter(e.key)
    })
  }, [])

  return (
    <div className='App'>
      <h1>Wordle Clone</h1>
      <div className='board'>
        {attempts.map((attempt, attemptIndex) => (
          <div
            key={attemptIndex}
            className={`attempt ${
              attemptIndex === position.attempt ? 'current' : ''
            }`}
          >
            {attempt.map((char, charIndex) => (
              <span
                key={`${attemptIndex}-${charIndex}`}
                id={`char-${attemptIndex}-${charIndex}`}
                className={`char ${char.status} ${
                  position.attempt === attemptIndex &&
                  position.char === charIndex
                    ? 'current'
                    : ''
                }`}
                onClick={() => {
                  updatePosition({ attempt: attemptIndex, char: charIndex })
                }}
              >
                {char.value}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className='error'>{error}</div>
      <div className='keyboard'>
        {['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map((row, rowIndex) => (
          <div key={rowIndex} className={`row row-${rowIndex}`}>
            {row.split('').map(letter => (
              <button
                key={letter}
                className={`key ${checkKey(letter)}`}
                onClick={() => enterCharacter(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
        <div>
          <button className='key enter' onClick={guessWord}>
            Enter
          </button>
          <button className='key delete' onClick={eraseCharacter}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
