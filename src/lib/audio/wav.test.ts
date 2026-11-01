import { describe, expect, it } from 'vitest'
import { audioBufferToWav } from './wav'

function fakeBuffer(channels: Float32Array[], sampleRate: number): AudioBuffer {
  return {
    numberOfChannels: channels.length,
    length: channels[0]?.length ?? 0,
    sampleRate,
    duration: (channels[0]?.length ?? 0) / sampleRate,
    getChannelData: (channel: number) => channels[channel],
  } as unknown as AudioBuffer
}

function readString(view: DataView, offset: number, length: number): string {
  let value = ''
  for (let index = 0; index < length; index += 1) {
    value += String.fromCharCode(view.getUint8(offset + index))
  }
  return value
}

describe('audioBufferToWav', () => {
  it('writes a valid 16-bit PCM RIFF header', () => {
    const left = new Float32Array([0, 0.5, -0.5, 1])
    const right = new Float32Array([0, -0.5, 0.5, -1])
    const wav = audioBufferToWav(fakeBuffer([left, right], 44100))
    const view = new DataView(wav)

    expect(readString(view, 0, 4)).toBe('RIFF')
    expect(readString(view, 8, 4)).toBe('WAVE')
    expect(readString(view, 12, 4)).toBe('fmt ')
    expect(view.getUint16(20, true)).toBe(1)
    expect(view.getUint16(22, true)).toBe(2)
    expect(view.getUint32(24, true)).toBe(44100)
    expect(view.getUint16(34, true)).toBe(16)
    expect(readString(view, 36, 4)).toBe('data')
    expect(view.getUint32(40, true)).toBe(4 * 2 * 2)
    expect(wav.byteLength).toBe(44 + 4 * 2 * 2)
  })

  it('interleaves and scales samples', () => {
    const mono = new Float32Array([0, 0.5, -0.5, 1, -1])
    const wav = audioBufferToWav(fakeBuffer([mono], 48000))
    const view = new DataView(wav)

    expect(view.getInt16(44, true)).toBe(0)
    expect(view.getInt16(46, true)).toBe(Math.round(0.5 * 0x7fff))
    expect(view.getInt16(48, true)).toBe(Math.round(-0.5 * 0x8000))
    expect(view.getInt16(50, true)).toBe(0x7fff)
    expect(view.getInt16(52, true)).toBe(-0x8000)
  })

  it('clamps out-of-range samples', () => {
    const mono = new Float32Array([2, -2])
    const wav = audioBufferToWav(fakeBuffer([mono], 44100))
    const view = new DataView(wav)

    expect(view.getInt16(44, true)).toBe(0x7fff)
    expect(view.getInt16(46, true)).toBe(-0x8000)
  })
})
