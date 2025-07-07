import '@testing-library/jest-dom'

// Global test setup
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}; 

// Mock Web Speech API
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  lang: 'sn-ZW',
  onstart: null,
  onend: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onmark: null,
  onboundary: null,
}))

// Mock Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  createAnalyser: jest.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: jest.fn(),
    getByteTimeDomainData: jest.fn(),
  })),
  createMediaStreamSource: jest.fn(),
  createScriptProcessor: jest.fn(),
  close: jest.fn(),
}))

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: jest.fn(() => 
    Promise.resolve({
      getTracks: () => [{ stop: jest.fn() }],
      addTrack: jest.fn(),
      removeTrack: jest.fn(),
      getAudioTracks: () => [{ stop: jest.fn() }],
      getVideoTracks: () => [],
    })
  ),
}

// Mock file operations for pronunciation testing
global.File = class MockFile {
  constructor(parts, filename, options = {}) {
    this.name = filename
    this.size = parts.reduce((acc, part) => acc + part.length, 0)
    this.type = options.type || 'audio/wav'
    this.lastModified = Date.now()
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(this.size))
  }

  text() {
    return Promise.resolve('')
  }
}

// Mock framer-motion for animation components
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
}))

// Mock react-circular-progressbar
jest.mock('react-circular-progressbar', () => ({
  CircularProgressbar: ({ value, text }) => (
    <div data-testid="circular-progressbar" data-value={value}>
      {text}
    </div>
  ),
  buildStyles: jest.fn(),
}))

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaVolumeUp: () => <span data-testid="volume-up-icon" />,
  FaVolumeMute: () => <span data-testid="volume-mute-icon" />,
  FaRotateLeft: () => <span data-testid="rotate-left-icon" />,
  FaMicrophone: () => <span data-testid="microphone-icon" />,
  FaStop: () => <span data-testid="stop-icon" />,
}))

// Setup fetch mock for API testing
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Enhanced audio mock for pronunciation testing
global.createAudioMock = (duration = 1000, sampleRate = 44100) => ({
  duration,
  sampleRate,
  numberOfChannels: 1,
  getChannelData: (channel) => new Float32Array(sampleRate),
  copyFromChannel: jest.fn(),
  copyToChannel: jest.fn(),
})

// Mock Gemini AI for pronunciation analysis
global.mockGeminiResponse = {
  word_transcription: 'test',
  phoneme_observations: [
    {
      phoneme_observed: 't',
      phoneme_type_observed: 'Plosive',
      acoustic_features: {
        formant_f1_hz: 500,
        formant_f2_hz: 1500,
        is_voiced: false,
        plosive_burst_energy: 'medium',
        aspiration_noise_level: 'low',
        spectral_centroid_khz: 3.5,
        is_implosive_airstream_detected: false,
      },
      tone_observed: 'High',
      observation_confidence: 0.85,
    },
  ],
} 