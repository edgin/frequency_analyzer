import type { AudioRender, ExplorerParams, FilterType, Preset, PresetMode, SignalType } from '../types'
import { sanitizeParams } from './audio/params'
import { renderSnapshot } from './audio/offline'
import { presetToParams } from './presets'
import { AUDIO_BUCKET, requireSupabase } from './supabase'

interface DbPreset {
  id: string
  user_id: string
  name: string
  description: string | null
  mode: string
  filter_type: string
  delay_left_ms: number | string
  delay_right_ms: number | string
  feedback: number | string
  dry_wet: number | string
  signal_type: string
  input_freq: number | string | null
  created_at: string
  updated_at: string
}

interface DbAudioRender {
  id: string
  preset_id: string
  user_id: string
  storage_path: string
  duration_seconds: number | string
  sample_rate: number | string
  created_at: string
}

function mapPreset(row: DbPreset): Preset {
  const params = sanitizeParams({
    mode: row.mode as PresetMode,
    filterType: row.filter_type as FilterType,
    delayLeftMs: Number(row.delay_left_ms),
    delayRightMs: Number(row.delay_right_ms),
    feedback: Number(row.feedback),
    dryWet: Number(row.dry_wet),
    signalType: row.signal_type as SignalType,
    inputFreq: row.input_freq === null ? undefined : Number(row.input_freq),
  })

  return {
    ...params,
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapRender(row: DbAudioRender): AudioRender {
  return {
    id: row.id,
    presetId: row.preset_id,
    userId: row.user_id,
    storagePath: row.storage_path,
    durationSeconds: Number(row.duration_seconds),
    sampleRate: Number(row.sample_rate),
    createdAt: row.created_at,
  }
}

function fail(message: string): never {
  throw new Error(message)
}

export async function listPresets(userId: string): Promise<Preset[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('presets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) fail(error.message)
  return (data ?? []).map((row) => mapPreset(row as DbPreset))
}

export async function getPreset(presetId: string): Promise<Preset | null> {
  const client = requireSupabase()
  const { data, error } = await client.from('presets').select('*').eq('id', presetId).maybeSingle()

  if (error) fail(error.message)
  return data ? mapPreset(data as DbPreset) : null
}

export async function createPreset(
  userId: string,
  name: string,
  description: string | null,
  params: ExplorerParams,
): Promise<Preset> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('presets')
    .insert({
      user_id: userId,
      name,
      description,
      mode: params.mode,
      filter_type: params.filterType,
      delay_left_ms: params.delayLeftMs,
      delay_right_ms: params.delayRightMs,
      feedback: params.feedback,
      dry_wet: params.dryWet,
      signal_type: params.signalType,
      input_freq: params.inputFreq,
    })
    .select('*')
    .single()

  if (error) fail(error.message)
  return mapPreset(data as DbPreset)
}

export async function updatePresetDetails(
  presetId: string,
  name: string,
  description: string | null,
): Promise<Preset> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('presets')
    .update({ name, description })
    .eq('id', presetId)
    .select('*')
    .single()

  if (error) fail(error.message)
  return mapPreset(data as DbPreset)
}

export async function deletePreset(preset: Preset): Promise<void> {
  const client = requireSupabase()

  const { data: renders, error: renderError } = await client
    .from('audio_renders')
    .select('storage_path')
    .eq('preset_id', preset.id)

  if (renderError) fail(renderError.message)

  const paths = (renders ?? [])
    .map((row) => (row as { storage_path: string }).storage_path)
    .filter(Boolean)

  if (paths.length > 0) {
    // Best effort: a missing storage object should not block deleting the preset.
    await client.storage.from(AUDIO_BUCKET).remove(paths)
  }

  const { error } = await client.from('presets').delete().eq('id', preset.id)
  if (error) fail(error.message)
}

export async function getAudioRender(presetId: string): Promise<AudioRender | null> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('audio_renders')
    .select('*')
    .eq('preset_id', presetId)
    .maybeSingle()

  if (error) fail(error.message)
  return data ? mapRender(data as DbAudioRender) : null
}

export async function saveAudioSnapshot(preset: Preset): Promise<AudioRender> {
  const client = requireSupabase()
  const snapshot = await renderSnapshot(presetToParams(preset))
  const storagePath = `${preset.userId}/${preset.id}.wav`

  const { error: uploadError } = await client.storage
    .from(AUDIO_BUCKET)
    .upload(storagePath, snapshot.blob, {
      upsert: true,
      contentType: 'audio/wav',
      cacheControl: '3600',
    })

  if (uploadError) fail(uploadError.message)

  const { data, error } = await client
    .from('audio_renders')
    .upsert(
      {
        preset_id: preset.id,
        user_id: preset.userId,
        storage_path: storagePath,
        duration_seconds: snapshot.durationSeconds,
        sample_rate: snapshot.sampleRate,
      },
      { onConflict: 'preset_id' },
    )
    .select('*')
    .single()

  if (error) fail(error.message)
  return mapRender(data as DbAudioRender)
}

export async function createAudioUrl(storagePath: string): Promise<string> {
  const client = requireSupabase()
  const { data, error } = await client.storage.from(AUDIO_BUCKET).createSignedUrl(storagePath, 3600)
  if (error) fail(error.message)
  return data.signedUrl
}
