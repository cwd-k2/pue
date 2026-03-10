module Lib.Numeric
  ( fib
  , gcd'
  , collatzStep
  ) where

import Prelude

-- | Fibonacci number (tail-recursive with accumulator).
fib :: Int -> Int
fib n = go n 0 1
  where
  go 0 a _ = a
  go k a b = go (k - 1) b (a + b)

-- | Greatest common divisor (Euclidean algorithm).
gcd' :: Int -> Int -> Int
gcd' a 0 = a
gcd' a b = gcd' b (mod a b)

-- | One step of the Collatz sequence.
collatzStep :: Int -> Int
collatzStep n
  | n <= 1       = 1
  | mod n 2 == 0 = n / 2
  | otherwise    = 3 * n + 1
