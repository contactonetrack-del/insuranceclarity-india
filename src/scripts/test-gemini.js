import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('--- TEST GEMINI START ---');
const key = process.env.GEMINI_API_KEY;
console.log('KEY EXISTS?', !!key);
if (key) {
  console.log('KEY PREFIX:', key.substring(0, 5) + '...');
}

const genAI = new GoogleGenerativeAI(key || '');

async function runTest() {
  console.log('Testing models/text-embedding-004...');
  try {
    const model = genAI.getGenerativeModel({ model: 'models/text-embedding-004' });
    await model.embedContent('test');
    console.log('SUCCESS: text-embedding-004 works!');
  } catch (error) {
    console.error('FAILED: text-embedding-004:', error instanceof Error ? error.message : String(error));
    
    console.log('Testing models/embedding-001...');
    try {
      const model2 = genAI.getGenerativeModel({ model: 'models/embedding-001' });
      await model2.embedContent('test');
      console.log('SUCCESS: embedding-001 works!');
    } catch (error2) {
      console.error('FAILED: embedding-001:', error2 instanceof Error ? error2.message : String(error2));
    }
  }
}

runTest();
