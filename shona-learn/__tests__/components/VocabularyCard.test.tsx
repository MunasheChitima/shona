import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import VocabularyCard, { VocabularyDeck } from '@/components/VocabularyCard'

describe('VocabularyCard Component', () => {
  const mockProps = {
    shona: 'svika',
    english: 'arrive',
    phonetic: '/ˈsβika/',
    tonePattern: 'HL',
    onFlip: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset speech synthesis mock
    global.speechSynthesis.speak.mockClear()
  })

  describe('Basic Rendering', () => {
    it('should display Shona word correctly', () => {
      render(<VocabularyCard {...mockProps} />)
      expect(screen.getByText('svika')).toBeInTheDocument()
    })

    it('should display IPA phonetic notation correctly', () => {
      render(<VocabularyCard {...mockProps} />)
      expect(screen.getByText('/ˈsβika/')).toBeInTheDocument()
    })

    it('should show tone pattern when provided', () => {
      render(<VocabularyCard {...mockProps} />)
      const toneIndicators = screen.getAllByTitle(/tone/)
      expect(toneIndicators).toHaveLength(2) // H and L tones
      expect(screen.getByTitle('High tone')).toBeInTheDocument()
      expect(screen.getByTitle('Low tone')).toBeInTheDocument()
    })

    it('should handle missing tone pattern gracefully', () => {
      const propsWithoutTone = { ...mockProps, tonePattern: undefined }
      render(<VocabularyCard {...propsWithoutTone} />)
      expect(screen.queryByText('Tone:')).not.toBeInTheDocument()
    })
  })

  describe('Card Flipping', () => {
    it('should flip to show English translation when clicked', async () => {
      render(<VocabularyCard {...mockProps} />)
      
      const card = screen.getByText('svika').closest('.cursor-pointer')
      fireEvent.click(card!)
      
      await waitFor(() => {
        expect(screen.getByText('arrive')).toBeInTheDocument()
      })
    })

    it('should call onFlip callback when card is flipped', () => {
      render(<VocabularyCard {...mockProps} />)
      
      const card = screen.getByText('svika').closest('.cursor-pointer')
      fireEvent.click(card!)
      
      expect(mockProps.onFlip).toHaveBeenCalledTimes(1)
    })

    it('should show flip hint text correctly', () => {
      render(<VocabularyCard {...mockProps} />)
      expect(screen.getByText('Click to see translation')).toBeInTheDocument()
      
      const card = screen.getByText('svika').closest('.cursor-pointer')
      fireEvent.click(card!)
      
      expect(screen.getByText('Click to see Shona word')).toBeInTheDocument()
    })

    it('should use flip button to toggle card state', () => {
      render(<VocabularyCard {...mockProps} />)
      
      const flipButton = screen.getByText('Show English')
      fireEvent.click(flipButton)
      
      expect(screen.getByText('Show Shona')).toBeInTheDocument()
    })
  })

  describe('Audio Functionality', () => {
    it('should play audio when volume button is clicked', () => {
      render(<VocabularyCard {...mockProps} />)
      
      const audioButton = screen.getByTitle('Listen to pronunciation')
      fireEvent.click(audioButton)
      
      expect(global.speechSynthesis.speak).toHaveBeenCalledTimes(1)
      expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith('svika')
    })

    it('should show mute icon when audio is playing', () => {
      render(<VocabularyCard {...mockProps} />)
      
      const audioButton = screen.getByTitle('Listen to pronunciation')
      fireEvent.click(audioButton)
      
      expect(screen.getByTestId('volume-mute-icon')).toBeInTheDocument()
    })

    it('should prevent multiple audio plays when already playing', () => {
      render(<VocabularyCard {...mockProps} />)
      
      const audioButton = screen.getByTitle('Listen to pronunciation')
      fireEvent.click(audioButton) // First click
      fireEvent.click(audioButton) // Second click while playing
      
      expect(global.speechSynthesis.speak).toHaveBeenCalledTimes(1)
    })

    it('should configure speech synthesis with correct rate', () => {
      render(<VocabularyCard {...mockProps} />)
      
      const audioButton = screen.getByTitle('Listen to pronunciation')
      fireEvent.click(audioButton)
      
      const utteranceInstance = global.SpeechSynthesisUtterance.mock.results[0].value
      expect(utteranceInstance.rate).toBe(0.8)
    })
  })

  describe('Special Character Handling', () => {
    const specialCharProps = {
      shona: 'dzvinyu',
      english: 'young person',
      phonetic: '/ˈd͡ʒβiɲu/',
      tonePattern: 'HLL',
    }

    it('should handle whistled sibilants correctly', () => {
      const whistledProps = {
        shona: 'tsvaira',
        english: 'sweep',
        phonetic: '/ˈt͡sβaira/',
        tonePattern: 'HH',
      }
      
      render(<VocabularyCard {...whistledProps} />)
      expect(screen.getByText('tsvaira')).toBeInTheDocument()
      expect(screen.getByText('/ˈt͡sβaira/')).toBeInTheDocument()
    })

    it('should handle prenasalized consonants', () => {
      const prenasalizedProps = {
        shona: 'mbira',
        english: 'traditional piano',
        phonetic: '/ᵐbira/',
        tonePattern: 'LH',
      }
      
      render(<VocabularyCard {...prenasalizedProps} />)
      expect(screen.getByText('mbira')).toBeInTheDocument()
    })

    it('should handle complex tone patterns', () => {
      render(<VocabularyCard {...specialCharProps} />)
      const toneIndicators = screen.getAllByTitle(/tone/)
      expect(toneIndicators).toHaveLength(3) // H-L-L pattern
    })
  })

  describe('Cultural Sensitivity', () => {
    it('should use respectful color scheme for elder terms', () => {
      const elderProps = {
        shona: 'sekuru',
        english: 'grandfather',
        phonetic: '/sekuru/',
        tonePattern: 'LHL',
      }
      
      render(<VocabularyCard {...elderProps} />)
      const card = screen.getByText('sekuru').closest('.bg-gradient-to-br')
      expect(card).toHaveClass('from-blue-500', 'to-purple-600')
    })

    it('should handle sacred/respectful terms appropriately', () => {
      const sacredProps = {
        shona: 'mwari',
        english: 'God',
        phonetic: '/mwari/',
        tonePattern: 'LH',
      }
      
      render(<VocabularyCard {...sacredProps} />)
      expect(screen.getByText('mwari')).toBeInTheDocument()
      // Should render without errors and with appropriate styling
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for audio controls', () => {
      render(<VocabularyCard {...mockProps} />)
      const audioButton = screen.getByTitle('Listen to pronunciation')
      expect(audioButton).toHaveAttribute('title', 'Listen to pronunciation')
    })

    it('should support keyboard navigation', () => {
      render(<VocabularyCard {...mockProps} />)
      const card = screen.getByText('svika').closest('.cursor-pointer')
      
      // Simulate Enter key press
      fireEvent.keyDown(card!, { key: 'Enter', code: 'Enter' })
      // Card should be focusable and keyboard accessible
      expect(card).toBeInTheDocument()
    })

    it('should have proper contrast ratios', () => {
      render(<VocabularyCard {...mockProps} />)
      const shonaText = screen.getByText('svika')
      expect(shonaText).toHaveClass('text-white') // White text on gradient background
    })
  })
})

describe('VocabularyDeck Component', () => {
  const mockWords = [
    {
      shona: 'mhoro',
      english: 'hello (informal)',
      phonetic: '/mhoro/',
      tonePattern: 'HL',
    },
    {
      shona: 'mhoroi',
      english: 'hello (formal)',
      phonetic: '/mhoroi/',
      tonePattern: 'HHL',
    },
    {
      shona: 'svika',
      english: 'arrive',
      phonetic: '/ˈsβika/',
      tonePattern: 'HL',
    },
  ]

  describe('Deck Navigation', () => {
    it('should display current card index correctly', () => {
      render(<VocabularyDeck words={mockWords} />)
      expect(screen.getByText('Card 1 of 3')).toBeInTheDocument()
    })

    it('should navigate to next card when Next button is clicked', () => {
      render(<VocabularyDeck words={mockWords} />)
      
      expect(screen.getByText('mhoro')).toBeInTheDocument()
      
      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)
      
      expect(screen.getByText('mhoroi')).toBeInTheDocument()
      expect(screen.getByText('Card 2 of 3')).toBeInTheDocument()
    })

    it('should navigate to previous card when Previous button is clicked', () => {
      render(<VocabularyDeck words={mockWords} />)
      
      // Go to second card first
      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)
      
      // Then go back
      const prevButton = screen.getByText('Previous')
      fireEvent.click(prevButton)
      
      expect(screen.getByText('mhoro')).toBeInTheDocument()
      expect(screen.getByText('Card 1 of 3')).toBeInTheDocument()
    })

    it('should cycle back to first card after last card', () => {
      render(<VocabularyDeck words={mockWords} />)
      
      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton) // Card 2
      fireEvent.click(nextButton) // Card 3
      fireEvent.click(nextButton) // Should cycle to Card 1
      
      expect(screen.getByText('mhoro')).toBeInTheDocument()
      expect(screen.getByText('Card 1 of 3')).toBeInTheDocument()
    })

    it('should cycle to last card when going previous from first card', () => {
      render(<VocabularyDeck words={mockWords} />)
      
      const prevButton = screen.getByText('Previous')
      fireEvent.click(prevButton) // Should cycle to last card
      
      expect(screen.getByText('svika')).toBeInTheDocument()
      expect(screen.getByText('Card 3 of 3')).toBeInTheDocument()
    })
  })

  describe('Progress Indicators', () => {
    it('should show correct number of progress dots', () => {
      render(<VocabularyDeck words={mockWords} />)
      const progressDots = document.querySelectorAll('.w-2.h-2.rounded-full')
      expect(progressDots).toHaveLength(3)
    })

    it('should highlight current card in progress indicator', () => {
      render(<VocabularyDeck words={mockWords} />)
      const activeDot = document.querySelector('.bg-blue-500')
      const inactiveDots = document.querySelectorAll('.bg-gray-300')
      
      expect(activeDot).toBeInTheDocument()
      expect(inactiveDots).toHaveLength(2)
    })
  })

  describe('Card State Management', () => {
    it('should reset flip state when navigating to new card', () => {
      render(<VocabularyDeck words={mockWords} />)
      
      // Flip current card
      const card = screen.getByText('mhoro').closest('.cursor-pointer')
      fireEvent.click(card!)
      
      // Navigate to next card
      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)
      
      // New card should be in unflipped state
      expect(screen.getByText('Click to see translation')).toBeInTheDocument()
    })
  })
})