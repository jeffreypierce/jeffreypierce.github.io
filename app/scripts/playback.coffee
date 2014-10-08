pitches = [110, 146.832, 164.814,
  174.614, 195.998, 220,
  246.942, 261.626, 293.665,
  329.628]

pluck = (length = 2, volume = 0.6, frequency = 440) ->
  begin = audioContext.currentTime
  end = begin + length
  sampleRate = audioContext.sampleRate

  _noise = ->
    2 * Math.random() - 1

  _karplusStrong = (freq) ->
    noise = []
    samples = new Float32Array(sampleRate)

    # generate noise
    period = Math.floor(sampleRate / freq)
    i = 0
    while i < period
      noise[i] = _noise()
      i++

    prevIndex = 0
    _generateSample = ->
      index = noise.shift()
      sample = (index + prevIndex) / 2
      prevIndex = sample
      noise.push sample
      sample

    # generate decay
    amp = (Math.random() * 0.5) + 0.4
    j = 0
    while j < sampleRate
      samples[j] = _generateSample()
      decay = amp - (j / sampleRate) * amp
      samples[j] = samples[j] * decay
      j++

    samples

  _generateImpulse = (length = 3, decay = 50) ->
    rate = sampleRate
    length = rate * length
    impulse = audioContext.createBuffer 1, length, rate
    impulseChannel = impulse.getChannelData 0
    i = 0
    while i < length
      impulseChannel[i] = _noise() * Math.pow(1 - i / length, decay)
      i++
    impulse

  masterVol = audioContext.createGain()
  wet = audioContext.createGain()
  dry = audioContext.createGain()
  pluckSound = audioContext.createBufferSource()
  reverb = audioContext.createConvolver()

  samples = _karplusStrong frequency
  audioBuffer = audioContext.createBuffer 1, samples.length, sampleRate
  audioBuffer.getChannelData(0).set samples
  pluckSound.buffer = audioBuffer
  reverb.buffer = _generateImpulse()
  wet.gain.value = 0.8
  dry.gain.value = 0.5
  masterVol.gain.value = volume

  pluckSound.connect reverb
  pluckSound.connect dry

  reverb.connect wet

  wet.connect masterVol
  dry.connect masterVol

  masterVol.connect audioContext.destination

  pluckSound.start begin
  pluckSound.stop end
    
  
