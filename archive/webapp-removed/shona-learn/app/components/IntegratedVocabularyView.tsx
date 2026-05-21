'use client';

import React, { useEffect, useState } from 'react';
import { integratedContentService, VocabularyItem } from '../../lib/services/IntegratedContentService';
import { PronunciationTextCompact } from './shared/PronunciationText';
import LoadingSpinner from './LoadingSpinner'

interface IntegratedVocabularyViewProps {
  category?: string;
  level?: string;
  searchTerm?: string;
}

export default function IntegratedVocabularyView({ 
  category, 
  level, 
  searchTerm 
}: IntegratedVocabularyViewProps) {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    loadVocabulary();
  }, [category, level, searchTerm]);

  const loadVocabulary = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load integrated content
      await integratedContentService.loadIntegratedContent();

      // Get filtered vocabulary based on props
      let filteredVocabulary: VocabularyItem[] = [];

      if (searchTerm) {
        filteredVocabulary = integratedContentService.searchVocabulary(searchTerm);
      } else if (category) {
        filteredVocabulary = integratedContentService.getVocabularyByCategory(category);
      } else if (level) {
        filteredVocabulary = integratedContentService.getVocabularyByLevel(level);
      } else {
        // Get all vocabulary
        const content = await integratedContentService.loadIntegratedContent();
        filteredVocabulary = content.vocabulary;
      }

      setVocabulary(filteredVocabulary);

      // Get statistics
      const stats = integratedContentService.getContentStatistics();
      setStatistics(stats);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vocabulary');
      console.error('Error loading vocabulary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner fullScreen message="Loading integrated vocabulary..." />
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading vocabulary</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {statistics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vocabulary Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.vocabulary.totalWords}</div>
              <div className="text-sm text-gray-600">Total Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.vocabulary.categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{statistics.vocabulary.levels.length}</div>
              <div className="text-sm text-gray-600">Difficulty Levels</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              onChange={(e) => {
                if (e.target.value) {
                  const filtered = integratedContentService.getVocabularyByCategory(e.target.value);
                  setVocabulary(filtered);
                } else {
                  loadVocabulary();
                }
              }}
            >
              <option value="">All Categories</option>
              {statistics?.vocabulary.categories.map((cat: string) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              onChange={(e) => {
                if (e.target.value) {
                  const filtered = integratedContentService.getVocabularyByLevel(e.target.value);
                  setVocabulary(filtered);
                } else {
                  loadVocabulary();
                }
              }}
            >
              <option value="">All Levels</option>
              {statistics?.vocabulary.levels.map((level: string) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vocabulary List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Vocabulary ({vocabulary.length} words)
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {vocabulary.map((item) => (
            <VocabularyCard key={item.id} vocabulary={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function VocabularyCard({ vocabulary }: { vocabulary: VocabularyItem }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div>
              <PronunciationTextCompact
                word={vocabulary.shona}
                pronunciation={vocabulary.ipa || 'N/A'}
                audioFile={vocabulary.audio?.word}
                className="mb-2"
              />
              <p className="text-gray-600">{vocabulary.english}</p>
            </div>
            <div className="flex space-x-2">
              {vocabulary.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {vocabulary.category}
                </span>
              )}
              {vocabulary.level && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {vocabulary.level}
                </span>
              )}
              {vocabulary.difficulty && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Level {vocabulary.difficulty}
                </span>
              )}
            </div>
          </div>

          {vocabulary.ipa && (
            <p className="text-sm text-gray-500 mt-1">
              IPA: {vocabulary.ipa}
            </p>
          )}

          {vocabulary.tones && (
            <p className="text-sm text-gray-500">
              Tones: {vocabulary.tones}
            </p>
          )}

          {showDetails && (
            <div className="mt-4 space-y-3">
              {vocabulary.cultural_notes && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Cultural Notes</h5>
                  <p className="text-sm text-gray-600">{vocabulary.cultural_notes}</p>
                </div>
              )}

              {vocabulary.usage_notes && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Usage Notes</h5>
                  <p className="text-sm text-gray-600">{vocabulary.usage_notes}</p>
                </div>
              )}

              {vocabulary.examples && vocabulary.examples.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Examples</h5>
                  <div className="space-y-2">
                    {vocabulary.examples.map((example, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <PronunciationTextCompact
                          word={example.shona}
                          pronunciation={example.shona.replace(/[aeiou]/g, (match: string) => match + '-')}
                          audioFile={undefined}
                          className="mb-1"
                        />
                        <p className="text-sm text-gray-600">{example.english}</p>
                        {example.context && (
                          <p className="text-xs text-gray-500 mt-1">Context: {example.context}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {vocabulary.source && (
                <p className="text-xs text-gray-500">
                  Source: {vocabulary.source}
                </p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
    </div>
  );
} 