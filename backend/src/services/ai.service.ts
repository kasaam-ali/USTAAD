import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

interface PriceEstimationParams {
  trade: string;
  description: string;
  hourlyRate: number;
  minCharge: number;
  visitCharge: number;
}

export const estimatePriceWithAI = async (params: PriceEstimationParams): Promise<number> => {
  try {
    const prompt = `
You are a pricing expert for home services in Pakistan. Analyze this job request and estimate a fair price range.

Trade: ${params.trade}
Job Description: ${params.description}
Worker's Hourly Rate: Rs. ${params.hourlyRate}
Worker's Minimum Charge: Rs. ${params.minCharge}
Worker's Visit Charge: Rs. ${params.visitCharge}

Based on the job complexity, estimated time, materials needed, and market rates in Pakistan, provide:
1. Estimated minimum price (in PKR)
2. Estimated maximum price (in PKR)

Consider:
- Job complexity from description
- Typical time required for this type of work
- Material costs if applicable
- Travel/visit charges
- Market rates in Pakistan

Respond ONLY with two numbers separated by a hyphen, like: 800-1500
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse the response (e.g., "800-1500")
    const match = text.match(/(\d+)-(\d+)/);

    if (match) {
      const minPrice = parseInt(match[1]);
      const maxPrice = parseInt(match[2]);

      // Return average as estimated price
      return Math.round((minPrice + maxPrice) / 2);
    }

    // Fallback to simple calculation
    return params.minCharge + params.visitCharge;
  } catch (error) {
    logger.error('AI price estimation error:', error);

    // Fallback calculation
    return params.minCharge + params.visitCharge;
  }
};

export const analyzeJobDescription = async (description: string): Promise<{
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedHours: number;
  keywords: string[];
}> => {
  try {
    const prompt = `
Analyze this job description for a home service:

"${description}"

Provide:
1. Complexity level (simple/moderate/complex)
2. Estimated hours needed (number only)
3. Key technical keywords (comma-separated)

Respond in this exact format:
complexity: [simple/moderate/complex]
hours: [number]
keywords: [word1, word2, word3]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse response
    const complexityMatch = text.match(/complexity:\s*(simple|moderate|complex)/i);
    const hoursMatch = text.match(/hours:\s*(\d+)/i);
    const keywordsMatch = text.match(/keywords:\s*(.+)/i);

    return {
      complexity: (complexityMatch?.[1] as any) || 'moderate',
      estimatedHours: parseInt(hoursMatch?.[1] || '2'),
      keywords: keywordsMatch?.[1]?.split(',').map(k => k.trim()) || [],
    };
  } catch (error) {
    logger.error('AI job analysis error:', error);
    return {
      complexity: 'moderate',
      estimatedHours: 2,
      keywords: [],
    };
  }
};

export const generateWorkerRecommendations = async (
  userPreferences: string,
  availableWorkers: any[]
): Promise<string[]> => {
  try {
    const workersInfo = availableWorkers.map(w => ({
      id: w.id,
      trade: w.trade,
      rating: w.rating,
      experience: w.experience_years,
      completedJobs: w.completed_jobs,
    }));

    const prompt = `
User needs: ${userPreferences}

Available workers:
${JSON.stringify(workersInfo, null, 2)}

Recommend the top 3 worker IDs based on:
- Relevance to user needs
- Rating and experience
- Completed jobs

Respond with only the worker IDs, comma-separated.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return text.split(',').map(id => id.trim());
  } catch (error) {
    logger.error('AI recommendation error:', error);
    return availableWorkers.slice(0, 3).map(w => w.id);
  }
};

export const translateToUrdu = async (text: string): Promise<string> => {
  try {
    const prompt = `Translate this text to Urdu (Roman script): "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text().trim();
  } catch (error) {
    logger.error('Translation error:', error);
    return text;
  }
};

export const generateSmartReply = async (
  context: string,
  language: 'english' | 'urdu' | 'roman' = 'english'
): Promise<string[]> => {
  try {
    const prompt = `
Context: ${context}

Generate 3 quick reply suggestions in ${language} language.
Keep them short (max 10 words each).
Make them natural and conversational.

Respond with 3 lines, one suggestion per line.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return text.split('\n').filter(line => line.trim()).slice(0, 3);
  } catch (error) {
    logger.error('Smart reply error:', error);
    return ['OK', 'Thank you', 'I understand'];
  }
};
