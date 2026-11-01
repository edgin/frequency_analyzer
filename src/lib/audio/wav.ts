const BYTES_PER_SAMPLE = 2
const HEADER_BYTES = 44

function writeString(view: DataView, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index))
  }
}

export function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const channels = buffer.numberOfChannels
  const frames = buffer.length
  const sampleRate = buffer.sampleRate
  const blockAlign = channels * BYTES_PER_SAMPLE
  const dataBytes = frames * blockAlign
  const arrayBuffer = new ArrayBuffer(HEADER_BYTES + dataBytes)
  const view = new DataView(arrayBuffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataBytes, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 8 * BYTES_PER_SAMPLE, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataBytes, true)

  const channelData: Float32Array[] = []
  for (let channel = 0; channel < channels; channel += 1) {
    channelData.push(buffer.getChannelData(channel))
  }

  let offset = HEADER_BYTES
  for (let frame = 0; frame < frames; frame += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][frame]))
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
      view.setInt16(offset, Math.round(intSample), true)
      offset += BYTES_PER_SAMPLE
    }
  }

  return arrayBuffer
}

export function encodeWav(buffer: AudioBuffer): Blob {
  return new Blob([audioBufferToWav(buffer)], { type: 'audio/wav' })
}
