import { useState, useEffect } from 'react'
import { ReadingTimeCalculator, ReadingTimeResult } from '../utils/readingTime'

// React hook for reading time
export const useReadingTime = (text: string, speed?: number) => {
  const [readingTime, setReadingTime] = useState<ReadingTimeResult | null>(null);

  useEffect(() => {
    const result = ReadingTimeCalculator.calculateReadingTime(text, speed);
    setReadingTime(result);
  }, [text, speed]);

  return readingTime;
}

// React hook for article reading time
export const useArticleReadingTime = (
  title: string,
  description: string,
  content: string,
  speed?: number
) => {
  const [readingTime, setReadingTime] = useState<ReadingTimeResult | null>(null);

  useEffect(() => {
    const result = ReadingTimeCalculator.calculateArticleReadingTime(title, description, content, speed);
    setReadingTime(result);
  }, [title, description, content, speed]);

  return readingTime;
}
