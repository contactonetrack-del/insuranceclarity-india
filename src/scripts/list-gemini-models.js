import 'dotenv/config';

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing from environment.');
    return;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json() as { models?: Array<{ name: string }> };
    console.log('Available Models:', JSON.stringify(data.models?.map(m => m.name), null, 2));
  } catch (error) {
    console.error('List models failed:', error instanceof Error ? error.message : String(error));
  }
}

listModels();
