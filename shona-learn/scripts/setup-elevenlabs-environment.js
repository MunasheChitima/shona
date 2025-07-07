#!/usr/bin/env node
/**
 * ElevenLabs Environment Setup Script
 * Prepares the environment for comprehensive Shona audio generation
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

class ElevenLabsEnvironmentSetup {
  constructor() {
    this.envPath = path.join(__dirname, '../.env');
    this.configPath = path.join(__dirname, '../elevenlabs-config.json');
  }

  async setup() {
    console.log('🔧 ========================================');
    console.log('🔧 ElevenLabs Environment Setup');
    console.log('🔧 Comprehensive Shona Audio Generation');
    console.log('🔧 ========================================\n');

    try {
      // Step 1: Check existing configuration
      await this.checkExistingConfig();
      
      // Step 2: Configure ElevenLabs API
      await this.configureElevenLabsAPI();
      
      // Step 3: Verify dependencies
      await this.verifyDependencies();
      
      // Step 4: Test API connection
      await this.testAPIConnection();
      
      // Step 5: Create sample configuration
      await this.createSampleConfig();
      
      console.log('✅ Environment setup complete!');
      console.log('🎯 Ready to generate comprehensive Shona audio!');
      
    } catch (error) {
      console.error('❌ Setup failed:', error);
      throw error;
    }
  }

  async checkExistingConfig() {
    console.log('📋 Checking existing configuration...');
    
    try {
      const envExists = await this.fileExists(this.envPath);
      const configExists = await this.fileExists(this.configPath);
      
      if (envExists) {
        console.log('   ✓ Found existing .env file');
        const envContent = await fs.readFile(this.envPath, 'utf-8');
        if (envContent.includes('ELEVEN_LABS_API_KEY')) {
          console.log('   ✓ ElevenLabs API key configured');
        } else {
          console.log('   ⚠️  ElevenLabs API key not found in .env');
        }
      } else {
        console.log('   ℹ️  No .env file found - will create new one');
      }
      
      if (configExists) {
        console.log('   ✓ Found existing ElevenLabs configuration');
      } else {
        console.log('   ℹ️  No ElevenLabs configuration found - will create new one');
      }
      
    } catch (error) {
      console.log('   ℹ️  No existing configuration found - starting fresh');
    }
    
    console.log();
  }

  async configureElevenLabsAPI() {
    console.log('🔑 Configuring ElevenLabs API...');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    try {
      console.log('\n📝 ElevenLabs API Configuration:');
      console.log('   • Get your API key from: https://elevenlabs.io/app/settings');
      console.log('   • Free tier: 10,000 characters/month');
      console.log('   • Recommended: Starter plan for full audio generation\n');

      const apiKey = await this.askQuestion(rl, 'Enter your ElevenLabs API key: ');
      
      if (!apiKey || apiKey.length < 10) {
        throw new Error('Invalid API key provided');
      }

      console.log('\n🎙️  Voice Selection:');
      console.log('   • Recommended for Shona: Adam (ErXwobaYiN019PkySvjV)');
      console.log('   • Alternative: Antoni (ErXwobaYiN019PkySvjV)');
      console.log('   • Custom: Upload your own Shona voice\n');

      const voiceId = await this.askQuestion(rl, 'Enter Voice ID (or press Enter for Adam): ') || 'ErXwobaYiN019PkySvjV';

      // Create/update .env file
      const envContent = `# ElevenLabs Configuration for Shona Audio Generation
ELEVEN_LABS_API_KEY=${apiKey}
SHONA_VOICE_ID=${voiceId}

# Optional: Additional configuration
NODE_ENV=development
`;

      await fs.writeFile(this.envPath, envContent);
      console.log('   ✅ .env file created/updated');

      // Create ElevenLabs configuration
      const config = {
        api_key: apiKey,
        voice_id: voiceId,
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.4,
          use_speaker_boost: true
        },
        generation_settings: {
          model_id: "eleven_multilingual_v2",
          rate: "85%",
          emphasis: "moderate"
        },
        shona_specific: {
          special_sounds_enabled: true,
          cultural_context_handling: true,
          tone_pattern_application: true,
          ipa_phoneme_tags: true
        }
      };

      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
      console.log('   ✅ ElevenLabs configuration saved');

    } finally {
      rl.close();
    }

    console.log();
  }

  async verifyDependencies() {
    console.log('📦 Verifying dependencies...');
    
    const packageJsonPath = path.join(__dirname, '../package.json');
    
    try {
      const packageData = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageData);
      
      const requiredDeps = [
        'dotenv',
        'node-fetch',
        '@types/node'
      ];

      const missing = requiredDeps.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );

      if (missing.length > 0) {
        console.log('   ⚠️  Missing dependencies:', missing.join(', '));
        console.log('   💡 Run: npm install dotenv node-fetch @types/node');
      } else {
        console.log('   ✅ All required dependencies found');
      }

      // Check for TypeScript compilation
      const tsConfigPath = path.join(__dirname, '../tsconfig.json');
      const tsConfigExists = await this.fileExists(tsConfigPath);
      
      if (!tsConfigExists) {
        console.log('   ⚠️  tsconfig.json not found');
        console.log('   💡 Consider setting up TypeScript compilation');
      } else {
        console.log('   ✅ TypeScript configuration found');
      }

    } catch (error) {
      console.log('   ⚠️  Could not verify package.json');
    }

    console.log();
  }

  async testAPIConnection() {
    console.log('🔗 Testing ElevenLabs API connection...');
    
    try {
      // Load the API key
      const envContent = await fs.readFile(this.envPath, 'utf-8');
      const apiKeyMatch = envContent.match(/ELEVEN_LABS_API_KEY=(.+)/);
      
      if (!apiKeyMatch) {
        throw new Error('API key not found in .env file');
      }

      const apiKey = apiKeyMatch[1].trim();

      // Test API connection (voices endpoint)
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey
        }
      });

      if (response.ok) {
        const voices = await response.json();
        console.log(`   ✅ API connection successful`);
        console.log(`   🎤 Available voices: ${voices.voices?.length || 0}`);
        
        // Check subscription info
        const userResponse = await fetch('https://api.elevenlabs.io/v1/user', {
          headers: {
            'xi-api-key': apiKey
          }
        });

        if (userResponse.ok) {
          const userInfo = await userResponse.json();
          console.log(`   👤 Account: ${userInfo.subscription?.tier || 'Free'}`);
          console.log(`   📊 Character limit: ${userInfo.subscription?.character_limit || 10000}`);
          console.log(`   🔢 Characters used: ${userInfo.subscription?.character_count || 0}`);
        }

      } else {
        throw new Error(`API test failed: ${response.status} ${response.statusText}`);
      }

    } catch (error) {
      console.log(`   ❌ API connection failed: ${error.message}`);
      console.log('   💡 Please check your API key and internet connection');
    }

    console.log();
  }

  async createSampleConfig() {
    console.log('📄 Creating sample configuration...');
    
    const sampleConfig = {
      title: "Shona Audio Generation Sample Configuration",
      description: "Sample setup for testing the comprehensive audio generation system",
      test_words: [
        {
          shona: "mangwanani",
          english: "good morning",
          cultural_context: "standard",
          expected_special_sounds: ["ng"]
        },
        {
          shona: "ndatenda",
          english: "thank you",
          cultural_context: "standard",
          expected_special_sounds: ["nd"]
        },
        {
          shona: "svika",
          english: "arrive",
          cultural_context: "standard",
          expected_special_sounds: ["sv"]
        },
        {
          shona: "mbira",
          english: "thumb piano",
          cultural_context: "traditional",
          expected_special_sounds: ["mb"]
        },
        {
          shona: "mwari",
          english: "God",
          cultural_context: "religious",
          expected_special_sounds: []
        }
      ],
      generation_settings: {
        batch_size: 5,
        rate_limit_ms: 1200,
        retry_attempts: 3,
        output_format: "mp3",
        quality: "high"
      }
    };

    const samplePath = path.join(__dirname, '../sample-audio-config.json');
    await fs.writeFile(samplePath, JSON.stringify(sampleConfig, null, 2));
    console.log(`   ✅ Sample configuration created: ${samplePath}`);
    console.log();
  }

  async askQuestion(rl, question) {
    return new Promise(resolve => {
      rl.question(question, answer => {
        resolve(answer.trim());
      });
    });
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Usage instructions
function displayUsageInstructions() {
  console.log('🎯 ========================================');
  console.log('🎯 NEXT STEPS');
  console.log('🎯 ========================================');
  console.log();
  console.log('📋 To generate comprehensive Shona audio:');
  console.log();
  console.log('1️⃣  Consolidate vocabulary:');
  console.log('   node scripts/consolidate-vocabulary.js');
  console.log();
  console.log('2️⃣  Generate comprehensive audio:');
  console.log('   node scripts/comprehensive-audio-generation.js');
  console.log();
  console.log('3️⃣  Test with sample words:');
  console.log('   node scripts/test-sample-generation.js');
  console.log();
  console.log('📊 Expected Output:');
  console.log('   • 480+ word audio files');
  console.log('   • 960+ sentence audio files');
  console.log('   • Comprehensive manifest');
  console.log('   • Quality assessment report');
  console.log();
  console.log('⚠️  Important Notes:');
  console.log('   • Monitor your ElevenLabs character usage');
  console.log('   • Generation will take 2-4 hours for full vocabulary');
  console.log('   • Audio files will be ~500MB total');
  console.log('   • Check quality of first few files before full run');
  console.log();
  console.log('🎉 Ready to generate authentic Shona audio!');
  console.log('🎯 ========================================\n');
}

// Execute if run directly
if (require.main === module) {
  const setup = new ElevenLabsEnvironmentSetup();
  
  setup.setup()
    .then(() => {
      console.log();
      displayUsageInstructions();
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { ElevenLabsEnvironmentSetup };