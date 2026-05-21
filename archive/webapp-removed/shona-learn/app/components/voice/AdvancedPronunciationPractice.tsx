'use client';

import React, { useState, useRef, useCallback } from 'react';
import TextToSpeech from './TextToSpeech';
import ToneMeter from './ToneMeter';
import { PhonemeAnalysis, PronunciationAnalysisResult } from '@/lib/pronunciation-analysis';

interface AdvancedPronunciationPracticeProps {
  word: string;
  translation: string;
  phonetic: string;
  tonePattern?: string;
  onComplete: (score: number, feedback: string[]) => void;
}

interface RecordingState {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export default function AdvancedPronunciationPractice({
  word,
  translation,
  phonetic,
  tonePattern,
  onComplete
}: AdvancedPronunciationPracticeProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    audioBlob: null,
    audioUrl: null
  });
  const [analysisResult, setAnalysisResult] = useState<PronunciationAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecordingState({
          isRecording: false,
          audioBlob,
          audioUrl
        });

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingState(prev => ({ ...prev, isRecording: true }));

    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Recording error:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [recordingState.isRecording]);

  const analyzePronunciation = useCallback(async () => {
    if (!recordingState.audioBlob) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('targetWord', word);
      formData.append('audioFile', recordingState.audioBlob, 'pronunciation.webm');

      const response = await fetch('/api/pronunciation', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result: PronunciationAnalysisResult = await response.json();
      setAnalysisResult(result);

      // Call onComplete with results
      if (result.error) {
        setError(result.error.message);
        onComplete(0, [result.error.message]);
      } else {
        onComplete(result.overall_score, result.feedback_messages);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      onComplete(0, [errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [recordingState.audioBlob, word, onComplete]);

  const resetRecording = useCallback(() => {
    setRecordingState({
      isRecording: false,
      audioBlob: null,
      audioUrl: null
    });
    setAnalysisResult(null);
    setError(null);
    
    // Clean up audio URL
    if (recordingState.audioUrl) {
      URL.revokeObjectURL(recordingState.audioUrl);
    }
  }, [recordingState.audioUrl]);

  const renderPhonemeAnalysis = (analysis: PhonemeAnalysis) => (
    <div key={analysis.phoneme} className="mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-lg">{analysis.phoneme}</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-6 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                analysis.score >= 80 ? 'bg-green-500' :
                analysis.score >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${analysis.score}%` }}
            />
          </div>
          <span className="text-sm font-medium">{analysis.score}%</span>
        </div>
      </div>
      
      {analysis.feedback_codes.length > 0 && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-1">Feedback:</p>
          <ul className="text-sm text-red-600 space-y-1">
            {analysis.feedback_codes.map((code, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>{getFeedbackMessage(code, analysis.phoneme)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const getFeedbackMessage = (code: string, phoneme: string): string => {
    const feedbackMessages: Record<string, string> = {
      'VOWEL_NOT_PURE': `Keep the ${phoneme} sound steady and pure`,
      'INCORRECT_TONE': `Pay attention to the tone for ${phoneme}`,
      'IMPLOSIVE_TOO_PLOSIVE': `${phoneme} should be an implosive sound - try sucking air in slightly`,
      'BREATHY_VOICE_WEAK': `Make the breathy quality stronger for ${phoneme}`,
      'WHISTLE_QUALITY_LOW': `${phoneme} should be more high-pitched and whistling-like`,
      'WHISTLE_MISSING': `${phoneme} should be a whistled sound, not a regular fricative`,
      'VOWEL_HIATUS_ERROR': `These are two separate vowel sounds, say them distinctly`,
      'UNEVEN_STRESS': `Keep even stress across all syllables`
    };
    
    return feedbackMessages[code] || `Improve pronunciation of ${phoneme}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-2">{word}</h2>
        <p className="text-xl text-gray-600 text-center mb-2">{translation}</p>
        <p className="text-lg text-blue-600 text-center mb-6 font-mono">{phonetic}</p>

        {/* Audio playback section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-center">Listen and Learn</h3>
          <TextToSpeech 
            text={word}
            phonetic={phonetic}
            rate={0.8}
          />
        </div>

        {/* Tone pattern visualization */}
        {tonePattern && (
          <div className="mb-8">
            <ToneMeter pattern={tonePattern} word={word} />
          </div>
        )}

        {/* Recording section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-center">Your Turn!</h3>
          
          {!recordingState.audioBlob ? (
            <div className="flex justify-center">
              <button
                onClick={recordingState.isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 ${
                  recordingState.isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {recordingState.isRecording ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                    Recording... Click to stop
                  </div>
                ) : (
                  'Start Recording'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Audio playback */}
              <div className="flex justify-center">
                <audio controls src={recordingState.audioUrl!} className="w-full max-w-md" />
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={analyzePronunciation}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Pronunciation'}
                </button>
                
                <button
                  onClick={resetRecording}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Record Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Analysis results */}
        {analysisResult && !analysisResult.error && (
          <div className="space-y-6">
            {/* Overall score */}
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Pronunciation Score</h3>
              <div className="flex items-center justify-center gap-4">
                <div className="w-24 h-24 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={
                        analysisResult.overall_score >= 80 ? '#10b981' :
                        analysisResult.overall_score >= 60 ? '#f59e0b' :
                        '#ef4444'
                      }
                      strokeWidth="3"
                      strokeDasharray={`${analysisResult.overall_score}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{analysisResult.overall_score}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phoneme-by-phoneme analysis */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Detailed Analysis</h3>
              <div className="space-y-3">
                {analysisResult.phoneme_analyses.map(renderPhonemeAnalysis)}
              </div>
            </div>

            {/* General feedback */}
            {analysisResult.feedback_messages.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Tips for Improvement</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ul className="space-y-2">
                    {analysisResult.feedback_messages.map((message, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">💡</span>
                        <span className="text-blue-800">{message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 