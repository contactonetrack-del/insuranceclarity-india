# 🧠 Braintrust Integration Setup

## ✅ Configuration Complete

**Braintrust API Key Added:**
- ✅ Local `.env` file: `BRAINTRUST_API_KEY="your_braintrust_api_key_here"`
- ✅ Vercel Environment: Added to Production, Preview, Development environments
- ✅ Encrypted: Marked as sensitive for security

---

## 🎯 Braintrust for Error Handling Monitoring

### What is Braintrust?
Braintrust is an AI evaluation and monitoring platform that helps:
- **Evaluate AI Model Performance**: Test and compare different AI models
- **Monitor Production AI**: Track AI behavior in production
- **Debug AI Issues**: Understand why AI models fail
- **A/B Test AI Features**: Compare different AI implementations

### Integration with Error Handling System

**Use Cases for Your Insurance Website:**

1. **AI Advisor Evaluation**
   - Monitor clarity advisor AI responses
   - Evaluate insurance recommendation accuracy
   - Track AI-generated report quality

2. **Error Pattern Analysis**
   - Analyze error logs with AI insights
   - Identify systemic issues in AI responses
   - Predict potential failure points

3. **Performance Monitoring**
   - Track AI response times
   - Monitor token usage and costs
   - Evaluate user satisfaction with AI responses

---

## 🔧 Implementation Steps

### 1. Install Braintrust SDK
```bash
npm install braintrust
```

### 2. Configure Braintrust Client
```typescript
// lib/braintrust.ts
import { Braintrust } from 'braintrust';

export const braintrust = new Braintrust({
  apiKey: process.env.BRAINTRUST_API_KEY,
  project: 'insurance-clarity-ai-monitoring',
});
```

### 3. Add AI Monitoring to Error Handling

**Monitor AI Advisor Responses:**
```typescript
// In your AI advisor API route
import { braintrust } from '@/lib/braintrust';

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const { query, context } = await request.json();

    // Call your AI service (Gemini, etc.)
    const response = await callAIService(query, context);

    // Log to Braintrust for monitoring
    await braintrust.log({
      input: query,
      output: response,
      metadata: {
        userId: context.userId,
        responseTime: Date.now() - startTime,
        model: 'gemini-pro',
        route: '/api/advisor',
      },
    });

    return Response.json({ response });
  } catch (error) {
    // Log errors to Braintrust
    await braintrust.log({
      input: query,
      error: error.message,
      metadata: {
        errorType: 'ai_service_error',
        route: '/api/advisor',
      },
    });

    throw error;
  }
}
```

### 4. Error Analysis Integration

**Connect Error Logs to Braintrust:**
```typescript
// In your error logger
import { braintrust } from '@/lib/braintrust';

export async function logError(error: ApiError, context: any) {
  // Existing error logging
  await errorLogger.log(error, context);

  // Add Braintrust analysis for AI-related errors
  if (context.aiRequest) {
    await braintrust.log({
      input: context.aiRequest,
      error: error.message,
      metadata: {
        errorCode: error.code,
        severity: error.severity,
        aiModel: context.model,
        userId: context.userId,
      },
    });
  }
}
```

---

## 📊 Monitoring Dashboard

### Braintrust Dashboard Features
- **Experiment Tracking**: Compare different AI model versions
- **Performance Metrics**: Response times, accuracy scores
- **Error Analysis**: Root cause analysis of AI failures
- **Cost Tracking**: Monitor API usage and costs

### Integration with Existing Monitoring

**Combined Dashboard View:**
```
Error Dashboard (/dashboard/admin/errors) + Braintrust
├── Error Rates (<1% target)
├── AI Response Times (<500ms target)
├── Model Accuracy Scores (>95% target)
├── Token Usage Optimization
└── User Satisfaction Metrics
```

---

## 🚀 Next Steps

### Immediate Actions
1. **Replace API Key**: Update `BRAINTRUST_API_KEY` in `.env` with your actual key
2. **Get Braintrust Account**: Sign up at https://braintrust.dev
3. **Create Project**: Set up "insurance-clarity-ai-monitoring" project

### Implementation Priority
1. **High Priority**: Monitor AI advisor responses
2. **Medium Priority**: Error pattern analysis
3. **Low Priority**: Performance optimization tracking

### Production Deployment
- ✅ Environment variable configured in Vercel
- ✅ Local development setup complete
- ⏳ Implement monitoring code in AI routes
- ⏳ Set up Braintrust dashboards

---

## 🔒 Security Notes

- **API Key Security**: Never commit actual API keys to git
- **Environment Variables**: Use Vercel's encrypted environment variables
- **Access Control**: Limit Braintrust dashboard access to authorized personnel
- **Data Privacy**: Ensure user data anonymization in logs

---

## 📞 Support

**Braintrust Resources:**
- Documentation: https://braintrust.dev/docs
- API Reference: https://braintrust.dev/api-reference
- Support: https://braintrust.dev/support

**Integration Help:**
- Check existing AI routes in `/src/app/api/`
- Review error handling patterns in `/src/lib/errors/`
- Test with development environment first

---

*Braintrust Integration Ready - April 7, 2026*</content>
<parameter name="filePath">c:\Users\chauh\Downloads\Insurance Website\nextjs-app\docs\braintrust-integration.md