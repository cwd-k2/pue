<template>
  <div class="card">
    <h2>Temperature</h2>
    <p>{{ celsius }}°C = {{ fahrenheit }}°F</p>
    <button @click="hotterC">+5°C</button>
    <button @click="coolerC">-5°C</button>
    <button @click="hotterF">+9°F</button>
    <button @click="coolerF">-9°F</button>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (ref, focus, modifyRef)
import Lib.Temperature (toFahrenheit, toCelsius)

setup = do
  celsius <- ref 20

  let fahrenheit = focus toFahrenheit toCelsius celsius

  let hotterC = modifyRef (_ + 5) celsius
  let coolerC = modifyRef (_ - 5) celsius
  let hotterF = modifyRef (_ + 9) fahrenheit
  let coolerF = modifyRef (_ - 9) fahrenheit

  pure { celsius, fahrenheit, hotterC, coolerC, hotterF, coolerF }
</script>
