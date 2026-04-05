
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY missing');
    return;
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Note: The SDK doesn't have a direct listModels, but we can try a dummy call
  const model = genAI.getGenerativeModel({ model: 'models/text-embedding-004' });
  try {
    await model.embedContent('test');
    console.log('text-embedding-004 works!');
  } catch (e: any) {
    console.error('text-embedding-004 failed:', e.message);
    const model2 = genAI.getGenerativeModel({ model: 'models/embedding-001' });
    try {
      await model2.embedContent('test');
      console.log('embedding-001 works!');
    } catch (e2: any) {
      console.error('embedding-001 failed:', e2.message);
    }
  }
}

listModels();
