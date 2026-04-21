// Context-aware text display analyzer
// Determines appropriate text display limits based on article complexity
// Includes machine learning capability to improve from user feedback and datasets

import { hybridTraining } from './datasetManager';
import { debugLog } from './logger';

export { hybridTraining };

export interface ArticleComplexity {
  score: number // 0-1, where 0 is simple and 1 is complex
  level: 'simple' | 'medium' | 'complex'
  recommendedLines: number
}

export interface FeedbackData {
  articleId: string;
  predictedLines: number;
  userRating: number; // 1-5, higher = more lines needed
  timestamp: number;
  features: {
    textLength: number;
    avgWordLength: number;
    hasTechnicalKeywords: boolean;
    avgSentenceLength: number;
    informationDensity: number;
  };
}

// Default weights for complexity factors
let weights = {
  textLength: 0.3,
  avgWordLength: 0.2,
  technicalKeywords: 0.25,
  sentenceLength: 0.15,
  informationDensity: 0.1
};

// Load learned weights from localStorage
const loadLearnedWeights = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('contextAnalyzerWeights');
      if (stored) {
        weights = JSON.parse(stored);
      }
    }
  } catch (error) {
    console.error('Error loading learned weights:', error);
  }
};

// Save learned weights to localStorage
const saveLearnedWeights = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('contextAnalyzerWeights', JSON.stringify(weights));
    }
  } catch (error) {
    console.error('Error saving learned weights:', error);
  }
};

// Initialize by loading any existing learned weights
if (typeof window !== 'undefined') {
  loadLearnedWeights();
}

// Train with dataset on first load if no weights exist
const trainWithDatasetIfNew = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const hasTrained = localStorage.getItem('contextAnalyzerDatasetTrained');
      if (!hasTrained) {
        // Disable automatic training to prevent initialization errors
        // User can manually trigger training via hybridTraining() if needed
        // trainContextAnalyzerWithDataset();
        // localStorage.setItem('contextAnalyzerDatasetTrained', 'true');
        debugLog('Automatic dataset training disabled to prevent initialization errors');
      }
    }
  } catch (error) {
    console.error('Error training with dataset:', error);
  }
};

// Auto-train with dataset on first load
if (typeof window !== 'undefined') {
  trainWithDatasetIfNew();
}

export const analyzeArticleComplexity = (article: {
  title: string;
  description: string;
  content?: string;
}): ArticleComplexity => {
  const text = article.content || article.description;
  const title = article.title;
  
  let complexityScore = 0;
  
  // Factor 1: Text length (longer articles often need more context)
  const textLength = text.length;
  if (textLength > 1000) complexityScore += weights.textLength;
  else if (textLength > 500) complexityScore += weights.textLength * 0.5;
  
  // Factor 2: Vocabulary complexity (average word length)
  const words = text.split(/\s+/);
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  if (avgWordLength > 5.5) complexityScore += weights.avgWordLength;
  else if (avgWordLength > 4.5) complexityScore += weights.avgWordLength * 0.5;
  
  // Factor 3: Technical/complex keywords
  const technicalKeywords = [
    'algorithm', 'quantum', 'artificial intelligence', 'machine learning',
    'cryptocurrency', 'blockchain', 'genomic', 'neural', 'quantitative',
    'macroeconomic', 'infrastructure', 'implementation', 'methodology',
    'optimization', 'integration', 'architecture', 'framework', 'protocol'
  ];
  const hasTechnicalKeywords = technicalKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase()) || 
    title.toLowerCase().includes(keyword.toLowerCase())
  );
  if (hasTechnicalKeywords) complexityScore += weights.technicalKeywords;
  
  // Factor 4: Sentence complexity (average sentence length)
  const sentences = text.split(/[.!?]+/);
  const avgSentenceLength = words.length / sentences.length;
  if (avgSentenceLength > 20) complexityScore += weights.sentenceLength;
  else if (avgSentenceLength > 15) complexityScore += weights.sentenceLength * 0.5;
  
  // Factor 5: Information density (unique words / total words)
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const informationDensity = uniqueWords / words.length;
  if (informationDensity > 0.6) complexityScore += weights.informationDensity;
  
  // Normalize score to 0-1 range
  complexityScore = Math.min(complexityScore, 1);
  
  // Determine complexity level and recommended lines
  let level: 'simple' | 'medium' | 'complex';
  let recommendedLines: number;
  
  if (complexityScore < 0.35) {
    level = 'simple';
    recommendedLines = 3; // Simple articles need less context
  } else if (complexityScore < 0.65) {
    level = 'medium';
    recommendedLines = 5; // Medium complexity needs moderate context
  } else {
    level = 'complex';
    recommendedLines = 7; // Complex articles need more context for understanding
  }
  
  return {
    score: complexityScore,
    level,
    recommendedLines
  };
};

// Get dynamic line-clamp style based on article complexity
export const getDynamicLineClamp = (article: {
  title: string;
  description: string;
  content?: string;
}): { lineClamp: number; className: string } => {
  const complexity = analyzeArticleComplexity(article);
  
  return {
    lineClamp: complexity.recommendedLines,
    className: `line-clamp-${complexity.recommendedLines}`
  };
};

// Submit user feedback to train the model
export const submitFeedback = (feedback: FeedbackData) => {
  try {
    // Get existing feedback data
    const existingFeedback = JSON.parse(localStorage.getItem('contextAnalyzerFeedback') || '[]');
    existingFeedback.push(feedback);
    
    // Keep only last 1000 feedback entries to prevent storage bloat
    if (existingFeedback.length > 1000) {
      existingFeedback.splice(0, existingFeedback.length - 1000);
    }
    
    localStorage.setItem('contextAnalyzerFeedback', JSON.stringify(existingFeedback));
    
    // Retrain model with new feedback
    retrainModel(existingFeedback);
  } catch (error) {
    console.error('Error submitting feedback:', error);
  }
};

// Retrain model using feedback data
const retrainModel = (feedbackData: FeedbackData[]) => {
  if (feedbackData.length < 10) return; // Need minimum data to train
  
  // Calculate desired lines based on user rating (1-5 scale)
  // Rating 1-2: too many lines shown, decrease weight
  // Rating 3: just right
  // Rating 4-5: too few lines shown, increase weight
  
  const adjustments = {
    textLength: 0,
    avgWordLength: 0,
    technicalKeywords: 0,
    sentenceLength: 0,
    informationDensity: 0
  };
  
  feedbackData.forEach(feedback => {
    const rating = feedback.userRating;
    const predicted = feedback.predictedLines;
    const desired = Math.round(rating * 1.5); // Convert 1-5 rating to approximate lines
    
    const adjustment = (desired - predicted) * 0.01; // Small learning rate
    
    // Adjust weights based on feature presence
    if (feedback.features.textLength > 500) {
      adjustments.textLength += adjustment;
    }
    if (feedback.features.avgWordLength > 4.5) {
      adjustments.avgWordLength += adjustment;
    }
    if (feedback.features.hasTechnicalKeywords) {
      adjustments.technicalKeywords += adjustment;
    }
    if (feedback.features.avgSentenceLength > 15) {
      adjustments.sentenceLength += adjustment;
    }
    if (feedback.features.informationDensity > 0.5) {
      adjustments.informationDensity += adjustment;
    }
  });
  
  // Apply adjustments with bounds checking
  const learningRate = 0.1;
  weights.textLength = Math.max(0, Math.min(1, weights.textLength + adjustments.textLength * learningRate));
  weights.avgWordLength = Math.max(0, Math.min(1, weights.avgWordLength + adjustments.avgWordLength * learningRate));
  weights.technicalKeywords = Math.max(0, Math.min(1, weights.technicalKeywords + adjustments.technicalKeywords * learningRate));
  weights.sentenceLength = Math.max(0, Math.min(1, weights.sentenceLength + adjustments.sentenceLength * learningRate));
  weights.informationDensity = Math.max(0, Math.min(1, weights.informationDensity + adjustments.informationDensity * learningRate));
  
  // Normalize weights to sum to 1
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  weights.textLength /= total;
  weights.avgWordLength /= total;
  weights.technicalKeywords /= total;
  weights.sentenceLength /= total;
  weights.informationDensity /= total;
  
  saveLearnedWeights();
  debugLog('Model retrained with new weights:', weights);
};

// Get training statistics
export const getTrainingStats = () => {
  try {
    const feedback = JSON.parse(localStorage.getItem('contextAnalyzerFeedback') || '[]');
    return {
      totalFeedback: feedback.length,
      currentWeights: weights,
      averageRating: feedback.length > 0 
        ? feedback.reduce((sum: number, f: any) => sum + f.userRating, 0) / feedback.length 
        : 0
    };
  } catch (error) {
    return {
      totalFeedback: 0,
      currentWeights: weights,
      averageRating: 0
    };
  }
};

// Reset training data
export const resetTraining = () => {
  try {
    localStorage.removeItem('contextAnalyzerFeedback');
    localStorage.removeItem('contextAnalyzerWeights');
    // Reset to default weights
    weights = {
      textLength: 0.3,
      avgWordLength: 0.2,
      technicalKeywords: 0.25,
      sentenceLength: 0.15,
      informationDensity: 0.1
    };
    debugLog('Training data reset');
  } catch (error) {
    console.error('Error resetting training:', error);
  }
};
