# pue 実装計画

Vue の全機能を4層の理論的フレームワークに沿って整理・実装する。

## 理論的フレームワーク

```
Layer 0  代数的構造（純粋）    Ref の型クラスインスタンス
Layer 1  Effect 操作（副作用）  生成・読み書き・観測・ビュー
Layer 2  インターフェース       DefineX ファントム型マクロ
Layer 3  ランタイムユーティリティ  Vue composable の FFI
```

---

## Phase 1: 代数的コア + Playground リファクタ

Ref を Functor / Apply / Applicative にし、導出インスタンスを追加。
既存 Playground を宣言的スタイルにリファクタして検証。

### 1-1. FFI 追加 (`Pue.js`)

- [x] `mapRef`: `(f) => (r) => Vue.computed(() => f(r.value))`
- [x] `applyRef`: `(fRef) => (aRef) => Vue.computed(() => fRef.value(aRef.value))`
- [x] `pureRef`: `(val) => Vue.computed(() => val)`

### 1-2. 型クラスインスタンス (`Pue.purs`)

- [x] `Functor Ref` via `mapRef`
- [x] `Apply Ref` via `applyRef`
- [x] `Applicative Ref` via `pureRef`
- [x] `Semigroup a => Semigroup (Ref a)` via `lift2 append`
- [x] `Monoid a => Monoid (Ref a)` via `pure mempty`
- [x] `Semiring a => Semiring (Ref a)` via `lift2 add/mul`, `pure zero/one`
- [x] `Ring a => Ring (Ref a)` via `lift2 sub`
- [x] `HeytingAlgebra a => HeytingAlgebra (Ref a)` via `lift2 conj/disj`, `map not`
- [x] `BooleanAlgebra a => BooleanAlgebra (Ref a)`

### 1-3. Playground リファクタ

- [x] DoubleCounter: `computed do readRef ...` → `a + b`（Semiring Ref）
- [x] Temperature: 変換式を `<$>` で
- [x] Fibonacci: `fib <$> n`
- [x] Collatz: derived ref なし — 変更不要
- [x] PropsChild: `(_ * 2) <$> countRef`
- [x] MultiModelChild: `(\t c -> t <> ": " <> c) <$> titleRef <*> contentRef`
- [x] WatchEffectDemo: side effect デモのため維持

### 1-4. ビルド検証

- [x] `spago build` 成功
- [x] `vite build playground` 成功

---

## Phase 2: インターフェースマクロ完成

### 2-1. DefineExpose

- [x] `Pue.purs`: `DefineExpose` ファントム型 + `defineExpose`
- [x] `Pue.js`: `defineExpose = null`
- [x] `plugin.ts`: `extractDefineRecord(source, 'expose')` → `expose: [...]` / `defineExpose({...})` 生成
- [x] Playground: ExposeDemo（親から子メソッド呼び出し）

### 2-2. DefineOptions

- [x] `plugin.ts`: `extractOptionsRecord` — レコードリテラル抽出 → オプションにマージ / `defineOptions({...})`
- [x] Playground: OptionsAttrDemo（`inheritAttrs: false` のデモ）

### 2-3. DefineSlots

- [x] `Pue.purs`: `DefineSlots` ファントム型 + `defineSlots`
- [x] `Pue.js`: `defineSlots = null`
- [x] Playground: SlotDemo（名前付きスロットのデモ）

### 2-4. ビルド検証

- [x] `spago build` 成功
- [x] `vite build playground` 成功

---

## Phase 3: ランタイムユーティリティ

### 3-1. useTemplateRef

- [x] `Pue.purs`: `useTemplateRef :: forall a. String -> Effect (Ref a)`
- [x] `Pue.js`: `Vue.useTemplateRef` ラップ
- [x] Playground: TemplateRefDemo（DOM 要素アクセス + focus）

### 3-2. useSlots / useAttrs

- [x] `Pue.purs`: `useSlots :: forall a. Effect a`
- [x] `Pue.purs`: `useAttrs :: forall a. Effect a`
- [x] `Pue.js`: FFI
- [x] Playground: OptionsAttrChild（`useAttrs` + `inheritAttrs: false`）

### 3-3. useId

- [x] `Pue.purs`: `useId :: Effect String`
- [x] `Pue.js`: FFI
- [x] Playground: IdDemo（アクセシビリティ ID）

### 3-4. onErrorCaptured

- [x] `Pue.purs`: `onErrorCaptured :: forall a. (a -> Effect Boolean) -> Effect Unit`
- [x] `Pue.js`: FFI
- [x] Playground: ErrorBoundary + ErrorDemo

### 3-5. ビルド検証

- [x] `spago build` 成功
- [x] `vite build playground` 成功

---

## Phase 4: ドキュメント再構成

- [x] `docs/api.md`: 4層フレームワークに沿って再編（Layer 0-3 構成 + Before/After 比較）
- [x] `README.md`: 代数的スタイルの例に更新（Functor/Applicative + Component Interface）
- [x] 各セクションに Before/After 比較

---

## 完了条件

- 全 Phase のビルド検証が通る
- Playground が全機能をデモする
- ドキュメントが4層フレームワークを反映する
