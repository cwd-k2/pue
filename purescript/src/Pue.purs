module Pue
  ( Ref
  , ref
  , readRef
  , writeRef
  , modifyRef
  , computed
  , watch
  , watchEffect
  , onBeforeMount
  , onMounted
  , onBeforeUpdate
  , onUpdated
  , onBeforeUnmount
  , onUnmounted
  , provide
  , inject
  , nextTick
  , shallowRef
  , toRef
  , DefineProps
  , defineProps
  , DefineEmits
  , defineEmits
  , DefineModel
  , defineModel
  ) where

import Data.Unit (Unit)
import Effect (Effect)

foreign import data Ref :: Type -> Type
foreign import data DefineProps :: Type -> Type
foreign import data DefineEmits :: Type -> Type
foreign import data DefineModel :: Type -> Type

foreign import defineProps :: forall a. DefineProps a
foreign import defineEmits :: forall a. DefineEmits a
foreign import defineModel :: forall a. DefineModel a

foreign import ref :: forall a. a -> Effect (Ref a)
foreign import readRef :: forall a. Ref a -> Effect a
foreign import writeRef :: forall a. a -> Ref a -> Effect Unit
foreign import modifyRef :: forall a. (a -> a) -> Ref a -> Effect Unit
foreign import computed :: forall a. Effect a -> Effect (Ref a)
foreign import watch :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect Unit
foreign import watchEffect :: Effect Unit -> Effect Unit
foreign import onBeforeMount :: Effect Unit -> Effect Unit
foreign import onMounted :: Effect Unit -> Effect Unit
foreign import onBeforeUpdate :: Effect Unit -> Effect Unit
foreign import onUpdated :: Effect Unit -> Effect Unit
foreign import onBeforeUnmount :: Effect Unit -> Effect Unit
foreign import onUnmounted :: Effect Unit -> Effect Unit
foreign import provide :: forall a. String -> a -> Effect Unit
foreign import inject :: forall a. String -> a -> Effect a
foreign import nextTick :: Effect Unit -> Effect Unit
foreign import shallowRef :: forall a. a -> Effect (Ref a)
foreign import toRef :: forall props a. props -> String -> Effect (Ref a)
