'use client'

import { useState, useCallback } from 'react'

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([])

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }, [])

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  )

  return { wishlist, toggleWishlist, isWishlisted }
}
