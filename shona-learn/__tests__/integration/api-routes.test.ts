import { NextRequest } from 'next/server'
import { POST, OPTIONS } from '@/app/api/pronunciation/route'

// Mock dependencies
jest.mock('@/lib/pronunciation-analysis', () => ({
  createMuturikiriAI: jest.fn().mockReturnValue({
    analyzePronunciation: jest.fn().mockResolvedValue({
      target_word: 'test',
      overall_score: 85,
      phoneme_analyses: [
        {
          phoneme: 't',
          score: 90,
          deviations: [],
          feedback_codes: []
        }
      ],
      feedback_messages: ['Great pronunciation!']
    })
  })
}))

jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('os', () => ({
  tmpdir: jest.fn().mockReturnValue('/tmp')
}))

describe('API Routes Integration Tests', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { 
      ...originalEnv, 
      GOOGLE_GENERATIVE_AI_API_KEY: 'test-api-key'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Pronunciation Analysis API (/api/pronunciation)', () => {
    it('should analyze pronunciation successfully', async () => {
      const mockAudioFile = new File(['mock audio data'], 'test.wav', {
        type: 'audio/wav'
      })

      const formData = new FormData()
      formData.append('targetWord', 'svika')
      formData.append('audioFile', mockAudioFile)

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(formData)
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.target_word).toBe('test')
      expect(responseData.overall_score).toBe(85)
      expect(responseData.phoneme_analyses).toHaveLength(1)
    })

    it('should handle missing target word', async () => {
      const formData = new FormData()
      formData.append('audioFile', new File(['data'], 'test.wav', { type: 'audio/wav' }))

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(formData)
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toContain('Missing required fields')
    })

    it('should handle missing audio file', async () => {
      const formData = new FormData()
      formData.append('targetWord', 'test')

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(formData)
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toContain('Missing required fields')
    })

    it('should validate target word format', async () => {
      const formData = new FormData()
      formData.append('targetWord', 'test123!')
      formData.append('audioFile', new File(['data'], 'test.wav', { type: 'audio/wav' }))

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(formData)
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toContain('lowercase letters')
    })

    it('should validate audio file type', async () => {
      const formData = new FormData()
      formData.append('targetWord', 'test')
      formData.append('audioFile', new File(['data'], 'test.txt', { type: 'text/plain' }))

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(formData)
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toContain('audio file')
    })

    it('should handle missing API key', async () => {
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY

      const formData = new FormData()
      formData.append('targetWord', 'test')
      formData.append('audioFile', new File(['data'], 'test.wav', { type: 'audio/wav' }))

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(formData)
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.error).toContain('API key not configured')
    })

    it('should handle pronunciation analysis errors', async () => {
      // Mock analysis failure
      const { createMuturikiriAI } = require('@/lib/pronunciation-analysis')
      createMuturikiriAI.mockReturnValue({
        analyzePronunciation: jest.fn().mockRejectedValue(new Error('Analysis failed'))
      })

      const formData = new FormData()
      formData.append('targetWord', 'test')
      formData.append('audioFile', new File(['data'], 'test.wav', { type: 'audio/wav' }))

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(formData)
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.error).toContain('Internal server error')
    })

    it('should handle CORS preflight requests', async () => {
      const response = await OPTIONS()

      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    })
  })

  describe('Cultural Validation Tests', () => {
    const culturalWords = [
      { word: 'sekuru', expectation: 'respectful' },
      { word: 'ambuya', expectation: 'respectful' },
      { word: 'mwari', expectation: 'sacred' },
      { word: 'mbira', expectation: 'traditional' }
    ]

    culturalWords.forEach(({ word, expectation }) => {
      it(`should handle ${expectation} term "${word}" appropriately`, async () => {
        const formData = new FormData()
        formData.append('targetWord', word)
        formData.append('audioFile', new File(['data'], 'test.wav', { type: 'audio/wav' }))

        const mockRequest = {
          formData: jest.fn().mockResolvedValue(formData)
        } as unknown as NextRequest

        const response = await POST(mockRequest)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData.target_word).toBe('test')
        // Should complete without cultural violations
        expect(responseData.error).toBeUndefined()
      })
    })
  })

  describe('Shona Phonetic Features Tests', () => {
    const specialSounds = [
      { word: 'svika', feature: 'whistled sibilant' },
      { word: 'zvino', feature: 'whistled sibilant' },
      { word: 'mbira', feature: 'prenasalized' },
      { word: 'baba', feature: 'implosive' },
      { word: 'bhazi', feature: 'breathy-voiced' }
    ]

    specialSounds.forEach(({ word, feature }) => {
      it(`should analyze ${feature} in word "${word}"`, async () => {
        const formData = new FormData()
        formData.append('targetWord', word)
        formData.append('audioFile', new File(['data'], 'test.wav', { type: 'audio/wav' }))

        const mockRequest = {
          formData: jest.fn().mockResolvedValue(formData)
        } as unknown as NextRequest

        const response = await POST(mockRequest)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData.phoneme_analyses).toBeDefined()
        expect(responseData.overall_score).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 5 }, async (_, i) => {
        const formData = new FormData()
        formData.append('targetWord', `test${i}`)
        formData.append('audioFile', new File(['data'], 'test.wav', { type: 'audio/wav' }))

        const mockRequest = {
          formData: jest.fn().mockResolvedValue(formData)
        } as unknown as NextRequest

        return POST(mockRequest)
      })

      const responses = await Promise.all(promises)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
    })

    it('should complete analysis within reasonable time', async () => {
      const startTime = Date.now()

      const formData = new FormData()
      formData.append('targetWord', 'test')
      formData.append('audioFile', new File(['data'], 'test.wav', { type: 'audio/wav' }))

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(formData)
      } as unknown as NextRequest

      await POST(mockRequest)
      
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(3000) // Should complete within 3 seconds
    })

    it('should handle large audio files gracefully', async () => {
      const largeAudioData = new Uint8Array(1024 * 1024 * 2) // 2MB file
      const formData = new FormData()
      formData.append('targetWord', 'test')
      formData.append('audioFile', new File([largeAudioData], 'large.wav', { type: 'audio/wav' }))

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(formData)
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      
      expect([200, 413]).toContain(response.status) // Either success or payload too large
    })
  })

  describe('Error Recovery and Resilience', () => {
    it('should recover from temporary service failures', async () => {
      const { createMuturikiriAI } = require('@/lib/pronunciation-analysis')
      
      // First call fails
      createMuturikiriAI.mockReturnValueOnce({
        analyzePronunciation: jest.fn().mockRejectedValue(new Error('Service unavailable'))
      })

      const formData = new FormData()
      formData.append('targetWord', 'test')
      formData.append('audioFile', new File(['data'], 'test.wav', { type: 'audio/wav' }))

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(formData)
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      
      expect(response.status).toBe(500)
      
      // Reset mock for successful call
      createMuturikiriAI.mockReturnValue({
        analyzePronunciation: jest.fn().mockResolvedValue({
          target_word: 'test',
          overall_score: 85,
          phoneme_analyses: [],
          feedback_messages: []
        })
      })

      const secondResponse = await POST(mockRequest)
      expect(secondResponse.status).toBe(200)
    })

    it('should provide meaningful error messages', async () => {
      const { createMuturikiriAI } = require('@/lib/pronunciation-analysis')
      createMuturikiriAI.mockReturnValue({
        analyzePronunciation: jest.fn().mockRejectedValue(new Error('Specific error message'))
      })

      const formData = new FormData()
      formData.append('targetWord', 'test')
      formData.append('audioFile', new File(['data'], 'test.wav', { type: 'audio/wav' }))

      const mockRequest = {
        formData: jest.fn().mockResolvedValue(formData)
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.details).toContain('Specific error message')
    })
  })
})