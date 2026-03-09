module Pue
  ( Ref
  , ref
  , readRef
  , writeRef
  , modifyRef
  , computed
  , onMounted
  , onUnmounted
  ) where

import Data.Unit (Unit)
import Effect (Effect)

foreign import data Ref :: Type -> Type

foreign import ref :: forall a. a -> Effect (Ref a)
foreign import readRef :: forall a. Ref a -> Effect a
foreign import writeRef :: forall a. a -> Ref a -> Effect Unit
foreign import modifyRef :: forall a. (a -> a) -> Ref a -> Effect Unit
foreign import computed :: forall a. Effect a -> Effect (Ref a)
foreign import onMounted :: Effect Unit -> Effect Unit
foreign import onUnmounted :: Effect Unit -> Effect Unit
