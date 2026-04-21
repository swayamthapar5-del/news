import { useState, useEffect, useRef } from 'react'
import { Article } from '../types'
import { NewsVerificationService, VerificationResult } from '../services/verificationService'

export const useVerification = (article: Article | null) => {
  const [verification, setVerification] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasVerifiedRef = useRef(false)

  useEffect(() => {
    if (article && !hasVerifiedRef.current) {
      verifyArticle(article)
      hasVerifiedRef.current = true
    }
  }, [article?.id])

  const verifyArticle = async (articleToVerify: Article) => {
    setLoading(true)
    setError(null)
    
    try {
      const verificationService = NewsVerificationService.getInstance()
      const result = await verificationService.verifyArticle(articleToVerify)
      setVerification(result)
    } catch (err) {
      setError('Failed to verify article')
      console.error('Verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  const reverify = () => {
    if (article) {
      verifyArticle(article)
    }
  }

  return {
    verification,
    loading,
    error,
    reverify
  }
}

export const useBatchVerification = (articles: Article[]) => {
  const [verifications, setVerifications] = useState<VerificationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasVerifiedRef = useRef(false)

  useEffect(() => {
    if (articles.length > 0 && !hasVerifiedRef.current) {
      verifyArticles(articles)
      hasVerifiedRef.current = true
    }
  }, [articles.length])

  const verifyArticles = async (articlesToVerify: Article[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const verificationService = NewsVerificationService.getInstance()
      const results = await verificationService.verifyMultipleArticles(articlesToVerify)
      setVerifications(results)
    } catch (err) {
      setError('Failed to verify articles')
      console.error('Batch verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  const reverify = () => {
    if (articles.length > 0) {
      verifyArticles(articles)
    }
  }

  return {
    verifications,
    loading,
    error,
    reverify
  }
}
