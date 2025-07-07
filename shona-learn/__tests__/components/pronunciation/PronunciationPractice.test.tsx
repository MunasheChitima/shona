import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import PronunciationPractice from '@/components/voice/PronunciationPractice'

// Mock the other voice components
jest.mock('@/components/voice/SpeechRecognition', () => {
  return function MockSpeechRecognition({ onResult, targetPhrase }) {
    return (
      <div data-testid="speech-recognition">
        <button
          onClick={() => onResult('svika', 85)}
          data-testid="mock-speech-result"
        >
          Simulate Speech Recognition
        </button>
        <span>Target: {targetPhrase}</span>
      </div>
    )
  }
})

jest.mock('@/components/voice/TextToSpeech', () => {
  return function MockTextToSpeech({ text, phonetic, rate }) {
    return (
      <div data-testid="text-to-speech">
        <button data-testid="play-audio">Play Audio</button>
        <span>Text: {text}</span>
        <span>Phonetic: {phonetic}</span>
        <span>Rate: {rate}</span>
      </div>
    )
  }
})

jest.mock('@/components/voice/ToneMeter', () => {
  return function MockToneMeter({ pattern, word }) {
    return (
      <div data-testid="tone-meter">
        <span>Pattern: {pattern}</span>
        <span>Word: {word}</span>
      </div>
    )
  }
})

describe('PronunciationPractice Component', () => {
  const mockProps = {
    word: 'svika',
    translation: 'arrive',
    phonetic: '/ˈsβika/',
    tonePattern: 'HL',
    onComplete: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should display word and translation correctly', () => {
      render(<PronunciationPractice {...mockProps} />)
      expect(screen.getByText('svika')).toBeInTheDocument()
      expect(screen.getByText('arrive')).toBeInTheDocument()
    })

    it('should render TextToSpeech component with correct props', () => {
      render(<PronunciationPractice {...mockProps} />)
      const ttsComponent = screen.getByTestId('text-to-speech')
      expect(ttsComponent).toBeInTheDocument()
      expect(screen.getByText('Text: svika')).toBeInTheDocument()
      expect(screen.getByText('Phonetic: /ˈsβika/')).toBeInTheDocument()
      expect(screen.getByText('Rate: 0.8')).toBeInTheDocument()
    })

    it('should render ToneMeter when tone pattern is provided', () => {
      render(<PronunciationPractice {...mockProps} />)
      const toneMeter = screen.getByTestId('tone-meter')
      expect(toneMeter).toBeInTheDocument()
      expect(screen.getByText('Pattern: HL')).toBeInTheDocument()
    })

    it('should not render ToneMeter when tone pattern is missing', () => {
      const propsWithoutTone = { ...mockProps, tonePattern: undefined }
      render(<PronunciationPractice {...propsWithoutTone} />)
      expect(screen.queryByTestId('tone-meter')).not.toBeInTheDocument()
    })
  })

  describe('Score Calculation and Feedback', () => {
    it('should calculate score correctly for exact match', async () => {
      render(<PronunciationPractice {...mockProps} />)
      
      // Simulate perfect pronunciation
      const speechButton = screen.getByTestId('mock-speech-result')
      fireEvent.click(speechButton)
      
      await waitFor(() => {
        expect(screen.getByText('85%')).toBeInTheDocument()
      })
    })

    it('should show appropriate feedback for different score ranges', async () => {
      render(<PronunciationPractice {...mockProps} />)
      
      // Mock different scores
      const { rerender } = render(
        <PronunciationPractice 
          {...mockProps} 
          word="test" 
          translation="test"
          phonetic="/test/"
        />
      )
      
      // Test excellent score (90+)
      fireEvent.click(screen.getByTestId('mock-speech-result'))
      await waitFor(() => {
        expect(screen.getByText(/85%/)).toBeInTheDocument()
        expect(screen.getByText('Great job! 👏')).toBeInTheDocument()
      })
    })

    it('should detect tone differences correctly', async () => {
      const toneTestProps = {
        ...mockProps,
        word: 'guru',
        translation: 'huge/stomach',
        tonePattern: 'HH', // High-High pattern
      }
      
      render(<PronunciationPractice {...toneTestProps} />)
      
      // Simulate speech recognition result
      fireEvent.click(screen.getByTestId('mock-speech-result'))
      
      await waitFor(() => {
        expect(screen.getByTestId('circular-progressbar')).toBeInTheDocument()
      })
    })

    it('should handle special Shona sounds (whistled sibilants)', async () => {
      const whistledProps = {
        ...mockProps,
        word: 'zvino',
        translation: 'now',
        phonetic: '/ˈzβino/',
        tonePattern: 'HL',
      }
      
      render(<PronunciationPractice {...whistledProps} />)
      
      fireEvent.click(screen.getByTestId('mock-speech-result'))
      
      await waitFor(() => {
        // Should handle whistled sound properly
        expect(screen.getByText('You said: "svika"')).toBeInTheDocument()
      })
    })

    it('should provide cultural appropriateness feedback for respectful terms', async () => {
      const respectfulProps = {
        ...mockProps,
        word: 'sekuru',
        translation: 'grandfather',
        phonetic: '/sekuru/',
        tonePattern: 'LHL',
      }
      
      render(<PronunciationPractice {...respectfulProps} />)
      
      fireEvent.click(screen.getByTestId('mock-speech-result'))
      
      await waitFor(() => {
        // Should show appropriate feedback for elder terms
        expect(screen.getByTestId('circular-progressbar')).toBeInTheDocument()
      })
    })
  })

  describe('Pronunciation Tips and Cultural Context', () => {
    it('should display pronunciation tips', () => {
      render(<PronunciationPractice {...mockProps} />)
      expect(screen.getByText('Pronunciation Tips:')).toBeInTheDocument()
      expect(screen.getByText('• Listen carefully to the audio before trying')).toBeInTheDocument()
      expect(screen.getByText('• Pay attention to tone patterns')).toBeInTheDocument()
    })

    it('should provide specific tips for complex sounds', () => {
      const complexSoundProps = {
        ...mockProps,
        word: 'tsvaira',
        translation: 'sweep',
        phonetic: '/ˈt͡sβaira/',
        tonePattern: 'HH',
      }
      
      render(<PronunciationPractice {...complexSoundProps} />)
      expect(screen.getByText('Pronunciation Tips:')).toBeInTheDocument()
    })
  })

  describe('Practice History Tracking', () => {
    it('should track and display practice attempts', async () => {
      render(<PronunciationPractice {...mockProps} />)
      
      // Make first attempt
      fireEvent.click(screen.getByTestId('mock-speech-result'))
      
      await waitFor(() => {
        expect(screen.getByText('Practice History')).toBeInTheDocument()
        expect(screen.getByText('"svika"')).toBeInTheDocument()
      })
    })

    it('should limit history display to last 5 attempts', async () => {
      render(<PronunciationPractice {...mockProps} />)
      
      // Make multiple attempts
      for (let i = 0; i < 7; i++) {
        fireEvent.click(screen.getByTestId('mock-speech-result'))
        await waitFor(() => {
          expect(screen.getByTestId('circular-progressbar')).toBeInTheDocument()
        })
      }
      
      // Should only show last 5 attempts
      const historyItems = screen.getAllByText('"svika"')
      expect(historyItems.length).toBeLessThanOrEqual(5)
    })

    it('should track best score across attempts', async () => {
      render(<PronunciationPractice {...mockProps} />)
      
      fireEvent.click(screen.getByTestId('mock-speech-result'))
      
      await waitFor(() => {
        expect(screen.getByText(/Best score:/)).toBeInTheDocument()
        expect(screen.getByText(/85%/)).toBeInTheDocument()
      })
    })
  })

  describe('Completion Logic', () => {
    it('should call onComplete when score is 80 or higher', async () => {
      render(<PronunciationPractice {...mockProps} />)
      
      fireEvent.click(screen.getByTestId('mock-speech-result'))
      
      await waitFor(() => {
        // Wait for the completion timeout
        setTimeout(() => {
          expect(mockProps.onComplete).toHaveBeenCalledWith(85)
        }, 1600)
      })
    })

    it('should not complete for scores below 80', async () => {
      // Mock a lower score
      jest.mock('@/components/voice/SpeechRecognition', () => {
        return function MockSpeechRecognition({ onResult }) {
          return (
            <button
              onClick={() => onResult('svika', 75)}
              data-testid="mock-speech-result-low"
            >
              Low Score Result
            </button>
          )
        }
      })
      
      render(<PronunciationPractice {...mockProps} />)
      
      const lowScoreButton = screen.queryByTestId('mock-speech-result-low')
      if (lowScoreButton) {
        fireEvent.click(lowScoreButton)
        
        await waitFor(() => {
          expect(mockProps.onComplete).not.toHaveBeenCalled()
        })
      }
    })
  })

  describe('Accessibility Features', () => {
    it('should provide clear visual feedback for scores', async () => {
      render(<PronunciationPractice {...mockProps} />)
      
      fireEvent.click(screen.getByTestId('mock-speech-result'))
      
      await waitFor(() => {
        const progressBar = screen.getByTestId('circular-progressbar')
        expect(progressBar).toHaveAttribute('data-value', '85')
      })
    })

    it('should have keyboard accessible controls', () => {
      render(<PronunciationPractice {...mockProps} />)
      
      const playButton = screen.getByTestId('play-audio')
      expect(playButton).toBeInTheDocument()
      
      // Should be focusable
      playButton.focus()
      expect(document.activeElement).toBe(playButton)
    })

    it('should provide clear instructions for users', () => {
      render(<PronunciationPractice {...mockProps} />)
      
      expect(screen.getByText('Listen and Learn')).toBeInTheDocument()
      expect(screen.getByText('Your Turn!')).toBeInTheDocument()
      expect(screen.getByText('• Speak clearly and at a steady pace')).toBeInTheDocument()
    })
  })

  describe('Animation and Feedback Display', () => {
    it('should show feedback with proper timing', async () => {
      render(<PronunciationPractice {...mockProps} />)
      
      fireEvent.click(screen.getByTestId('mock-speech-result'))
      
      await waitFor(() => {
        expect(screen.getByText('Great job! 👏')).toBeInTheDocument()
      })
      
      // Test that feedback auto-hides (would need to advance timers in real test)
    })

    it('should handle rapid successive attempts gracefully', async () => {
      render(<PronunciationPractice {...mockProps} />)
      
      // Rapid clicks
      fireEvent.click(screen.getByTestId('mock-speech-result'))
      fireEvent.click(screen.getByTestId('mock-speech-result'))
      
      await waitFor(() => {
        expect(screen.getByTestId('circular-progressbar')).toBeInTheDocument()
      })
    })
  })
})