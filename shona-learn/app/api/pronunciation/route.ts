import { NextRequest, NextResponse } from 'next/server';
import { createMuturikiriAI } from '@/lib/pronunciation-analysis';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const targetWord = formData.get('targetWord') as string;
    const audioFile = formData.get('audioFile') as File;

    // Validate inputs
    if (!targetWord || !audioFile) {
      return NextResponse.json(
        { error: 'Missing required fields: targetWord and audioFile' },
        { status: 400 }
      );
    }

    // Validate target word format
    if (!/^[a-z]+$/.test(targetWord.toLowerCase())) {
      return NextResponse.json(
        { error: 'Target word must contain only lowercase letters' },
        { status: 400 }
      );
    }

    // Validate audio file
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'File must be an audio file' },
        { status: 400 }
      );
    }

    // Convert audio file to buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Save audio file temporarily
    const tempFileName = `pronunciation_${Date.now()}_${Math.random().toString(36).substring(7)}.wav`;
    const tempFilePath = join(tmpdir(), tempFileName);
    
    await writeFile(tempFilePath, audioBuffer);

    // Initialize Muturikiri AI
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Generative AI API key not configured' },
        { status: 500 }
      );
    }

    const muturikiriAI = createMuturikiriAI(apiKey);

    // Perform pronunciation analysis
    const analysisResult = await muturikiriAI.analyzePronunciation(
      targetWord.toLowerCase(),
      tempFilePath
    );

    // Clean up temporary file
    try {
      await writeFile(tempFilePath, ''); // Clear the file
    } catch (cleanupError) {
      console.warn('Failed to cleanup temporary audio file:', cleanupError);
    }

    // Return analysis result
    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Pronunciation analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during pronunciation analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 