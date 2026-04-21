// Dataset Manager for training ML models
// Supports loading and using pre-labeled datasets for context analyzer and fake news detection
import { debugLog } from './logger';

export interface ContextDatasetEntry {
  id: string;
  title: string;
  description: string;
  content?: string;
  complexityLabel: 'simple' | 'medium' | 'complex';
  recommendedLines: number;
  features: {
    textLength: number;
    avgWordLength: number;
    hasTechnicalKeywords: boolean;
    avgSentenceLength: number;
    informationDensity: number;
  };
}

export interface FakeNewsDatasetEntry {
  id: string;
  title: string;
  description: string;
  content?: string;
  isFake: boolean;
  source: string;
  features: {
    sensationalismScore: number;
    clickbaitIndicators: number;
    factualityScore: number;
    sourceReliability: number;
    emotionalLanguage: number;
  };
}

// Sample context dataset for training
const contextTrainingData: ContextDatasetEntry[] = [
  {
    id: 'ctx-1',
    title: 'New Study Shows Benefits of Regular Exercise',
    description: 'A comprehensive study published in the Journal of Medicine has found that regular physical activity can significantly improve cardiovascular health and reduce the risk of chronic diseases.',
    complexityLabel: 'simple',
    recommendedLines: 3,
    features: {
      textLength: 180,
      avgWordLength: 4.2,
      hasTechnicalKeywords: false,
      avgSentenceLength: 12,
      informationDensity: 0.5
    }
  },
  {
    id: 'ctx-2',
    title: 'Quantum Computing Breakthrough Achieves 1000 Qubit Stability',
    description: 'Researchers at MIT have successfully demonstrated quantum error correction techniques that maintain coherence in a 1000-qubit system for over 10 microseconds, representing a significant milestone in quantum computing development.',
    complexityLabel: 'complex',
    recommendedLines: 7,
    features: {
      textLength: 220,
      avgWordLength: 5.8,
      hasTechnicalKeywords: true,
      avgSentenceLength: 22,
      informationDensity: 0.7
    }
  },
  {
    id: 'ctx-3',
    title: 'Global Markets Rally as Economic Indicators Improve',
    description: 'Stock markets worldwide showed strong performance today as new economic data suggests inflation is cooling and consumer confidence is rising. Major indices gained 2-3% in trading.',
    complexityLabel: 'medium',
    recommendedLines: 5,
    features: {
      textLength: 195,
      avgWordLength: 4.8,
      hasTechnicalKeywords: false,
      avgSentenceLength: 16,
      informationDensity: 0.55
    }
  },
  {
    id: 'ctx-4',
    title: 'Implementation of Neural Network Architecture for Real-Time Image Processing',
    description: 'This paper presents a novel convolutional neural network architecture optimized for edge computing devices. The proposed methodology achieves 95% accuracy while reducing computational overhead by 40% compared to existing frameworks.',
    complexityLabel: 'complex',
    recommendedLines: 7,
    features: {
      textLength: 235,
      avgWordLength: 6.1,
      hasTechnicalKeywords: true,
      avgSentenceLength: 24,
      informationDensity: 0.75
    }
  },
  {
    id: 'ctx-5',
    title: 'Local Community Garden Project Wins Environmental Award',
    description: 'A community garden initiative in downtown has been recognized for its sustainable practices and positive impact on local biodiversity. The project has created green space and educational opportunities for residents.',
    complexityLabel: 'simple',
    recommendedLines: 3,
    features: {
      textLength: 175,
      avgWordLength: 4.1,
      hasTechnicalKeywords: false,
      avgSentenceLength: 11,
      informationDensity: 0.45
    }
  }
];

// Sample fake news dataset for training
const fakeNewsTrainingData: FakeNewsDatasetEntry[] = [
  {
    id: 'fake-1',
    title: 'SHOCKING: Scientists Discover Coffee Cures Cancer!',
    description: 'BREAKING NEWS - A secret study reveals that drinking just 3 cups of coffee per day completely eliminates cancer cells. Big Pharma is trying to suppress this information!',
    isFake: true,
    source: 'unknown',
    features: {
      sensationalismScore: 0.9,
      clickbaitIndicators: 0.85,
      factualityScore: 0.2,
      sourceReliability: 0.1,
      emotionalLanguage: 0.8
    }
  },
  {
    id: 'fake-2',
    title: 'FDA Approves New Drug for Diabetes Treatment',
    description: 'The Food and Drug Administration has granted approval for a new medication that helps regulate blood sugar levels in patients with type 2 diabetes. Clinical trials showed significant improvement in glycemic control.',
    isFake: false,
    source: 'Reuters',
    features: {
      sensationalismScore: 0.2,
      clickbaitIndicators: 0.1,
      factualityScore: 0.9,
      sourceReliability: 0.95,
      emotionalLanguage: 0.15
    }
  },
  {
    id: 'fake-3',
    title: 'You Won\'t Believe What This Politician Said! (Must Read)',
    description: 'EXCLUSIVE: Leaked audio shows shocking statements that will change everything you thought you knew. Click here to hear the truth they don\'t want you to know!',
    isFake: true,
    source: 'clickbait-site.com',
    features: {
      sensationalismScore: 0.95,
      clickbaitIndicators: 0.9,
      factualityScore: 0.15,
      sourceReliability: 0.05,
      emotionalLanguage: 0.85
    }
  },
  {
    id: 'fake-4',
    title: 'Central Bank Announces Interest Rate Decision',
    description: 'The Federal Reserve has decided to maintain current interest rates following their latest policy meeting. The decision reflects concerns about inflation while supporting economic growth.',
    isFake: false,
    source: 'AP News',
    features: {
      sensationalismScore: 0.15,
      clickbaitIndicators: 0.05,
      factualityScore: 0.92,
      sourceReliability: 0.98,
      emotionalLanguage: 0.1
    }
  },
  {
    id: 'fake-5',
    title: 'Doctors Hate This One Weird Trick for Weight Loss!',
    description: 'Lose 50 pounds in 2 weeks with this simple trick that doctors are trying to hide! No exercise needed, just drink this special mixture before bed!',
    isFake: true,
    source: 'health-scam-site.com',
    features: {
      sensationalismScore: 0.98,
      clickbaitIndicators: 0.95,
      factualityScore: 0.05,
      sourceReliability: 0.02,
      emotionalLanguage: 0.9
    }
  }
];

// Train context analyzer with dataset
export const trainContextAnalyzerWithDataset = (dataset: ContextDatasetEntry[] = contextTrainingData) => {
  try {
    const weights = {
      textLength: 0,
      avgWordLength: 0,
      technicalKeywords: 0,
      sentenceLength: 0,
      informationDensity: 0
    };
    
    const counts = {
      textLength: 0,
      avgWordLength: 0,
      technicalKeywords: 0,
      sentenceLength: 0,
      informationDensity: 0
    };
    
    dataset.forEach(entry => {
      if (!entry || !entry.features) return;
      
      const targetLines = entry.recommendedLines || 3;
      const features = entry.features;
      
      // Calculate ideal complexity score based on target lines
      const idealScore = targetLines / 7; // Normalize to 0-1
      
      // Determine which features should be weighted based on target
      if (features.textLength > 500) {
        weights.textLength += idealScore;
        counts.textLength++;
      }
      if (features.avgWordLength > 4.5) {
        weights.avgWordLength += idealScore;
        counts.avgWordLength++;
      }
      if (features.hasTechnicalKeywords) {
        weights.technicalKeywords += idealScore;
        counts.technicalKeywords++;
      }
      if (features.avgSentenceLength > 15) {
        weights.sentenceLength += idealScore;
        counts.sentenceLength++;
      }
      if (features.informationDensity > 0.5) {
        weights.informationDensity += idealScore;
        counts.informationDensity++;
      }
    });
    
    // Calculate average weights
    if (counts.textLength > 0) weights.textLength /= counts.textLength;
    if (counts.avgWordLength > 0) weights.avgWordLength /= counts.avgWordLength;
    if (counts.technicalKeywords > 0) weights.technicalKeywords /= counts.technicalKeywords;
    if (counts.sentenceLength > 0) weights.sentenceLength /= counts.sentenceLength;
    if (counts.informationDensity > 0) weights.informationDensity /= counts.informationDensity;
    
    // Normalize weights to sum to 1
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    if (total > 0) {
      weights.textLength /= total;
      weights.avgWordLength /= total;
      weights.technicalKeywords /= total;
      weights.sentenceLength /= total;
      weights.informationDensity /= total;
    }
    
    // Save trained weights
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('contextAnalyzerWeights', JSON.stringify(weights));
      debugLog('Context analyzer trained with dataset:', weights);
    }
    return weights;
  } catch (error) {
    console.error('Error training context analyzer with dataset:', error);
    return {
      textLength: 0.3,
      avgWordLength: 0.2,
      technicalKeywords: 0.25,
      sentenceLength: 0.15,
      informationDensity: 0.1
    };
  }
};

// Train fake news detector with dataset
export const trainFakeNewsDetectorWithDataset = (dataset: FakeNewsDatasetEntry[] = fakeNewsTrainingData) => {
  const thresholds = {
    sensationalism: 0,
    clickbait: 0,
    factuality: 0,
    sourceReliability: 0,
    emotionalLanguage: 0
  };
  
  let fakeCount = 0;
  let realCount = 0;
  
  dataset.forEach(entry => {
    if (entry.isFake) {
      fakeCount++;
      thresholds.sensationalism += entry.features.sensationalismScore;
      thresholds.clickbait += entry.features.clickbaitIndicators;
      thresholds.factuality += entry.features.factualityScore;
      thresholds.sourceReliability += entry.features.sourceReliability;
      thresholds.emotionalLanguage += entry.features.emotionalLanguage;
    } else {
      realCount++;
    }
  });
  
  // Calculate average thresholds for fake news
  if (fakeCount > 0) {
    thresholds.sensationalism /= fakeCount;
    thresholds.clickbait /= fakeCount;
    thresholds.factuality /= fakeCount;
    thresholds.sourceReliability /= fakeCount;
    thresholds.emotionalLanguage /= fakeCount;
  }
  
  // Save trained thresholds
  try {
    localStorage.setItem('fakeNewsThresholds', JSON.stringify(thresholds));
    debugLog('Fake news detector trained with dataset:', thresholds);
    return { thresholds, fakeCount, realCount };
  } catch (error) {
    console.error('Error saving trained thresholds:', error);
    return { thresholds, fakeCount, realCount };
  }
};

// Get trained thresholds for fake news detection
export const getFakeNewsThresholds = () => {
  try {
    const stored = localStorage.getItem('fakeNewsThresholds');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading fake news thresholds:', error);
  }
  
  // Return default thresholds
  return {
    sensationalism: 0.7,
    clickbait: 0.7,
    factuality: 0.4,
    sourceReliability: 0.3,
    emotionalLanguage: 0.7
  };
};

// Load custom dataset from file or API
export const loadCustomDataset = async (datasetUrl: string): Promise<any[]> => {
  try {
    const response = await fetch(datasetUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading custom dataset:', error);
    return [];
  }
};

// Combine user feedback with dataset training
export const hybridTraining = () => {
  // First train with dataset
  const datasetWeights = trainContextAnalyzerWithDataset();
  
  // Then load user feedback weights
  let feedbackWeights;
  try {
    const stored = localStorage.getItem('contextAnalyzerWeights');
    if (stored) {
      feedbackWeights = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading feedback weights:', error);
  }
  
  // Combine weights (70% dataset, 30% user feedback)
  if (feedbackWeights) {
    const combinedWeights = {
      textLength: datasetWeights.textLength * 0.7 + feedbackWeights.textLength * 0.3,
      avgWordLength: datasetWeights.avgWordLength * 0.7 + feedbackWeights.avgWordLength * 0.3,
      technicalKeywords: datasetWeights.technicalKeywords * 0.7 + feedbackWeights.technicalKeywords * 0.3,
      sentenceLength: datasetWeights.sentenceLength * 0.7 + feedbackWeights.sentenceLength * 0.3,
      informationDensity: datasetWeights.informationDensity * 0.7 + feedbackWeights.informationDensity * 0.3
    };
    
    // Normalize combined weights
    const total = Object.values(combinedWeights).reduce((sum, w) => sum + w, 0);
    combinedWeights.textLength /= total;
    combinedWeights.avgWordLength /= total;
    combinedWeights.technicalKeywords /= total;
    combinedWeights.sentenceLength /= total;
    combinedWeights.informationDensity /= total;
    
    // Save combined weights
    try {
      localStorage.setItem('contextAnalyzerWeights', JSON.stringify(combinedWeights));
      debugLog('Hybrid training completed:', combinedWeights);
      return combinedWeights;
    } catch (error) {
      console.error('Error saving combined weights:', error);
      return combinedWeights;
    }
  }
  
  return datasetWeights;
};

// Get dataset statistics
export const getDatasetStats = () => {
  return {
    contextDataset: {
      total: contextTrainingData.length,
      simple: contextTrainingData.filter(e => e.complexityLabel === 'simple').length,
      medium: contextTrainingData.filter(e => e.complexityLabel === 'medium').length,
      complex: contextTrainingData.filter(e => e.complexityLabel === 'complex').length
    },
    fakeNewsDataset: {
      total: fakeNewsTrainingData.length,
      fake: fakeNewsTrainingData.filter(e => e.isFake).length,
      real: fakeNewsTrainingData.filter(e => !e.isFake).length
    }
  };
};
