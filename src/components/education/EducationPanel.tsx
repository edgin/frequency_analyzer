import { Collapsible } from '../ui/Collapsible'

const topics = [
  {
    title: 'What is comb filtering?',
    body: 'When a signal is mixed with a slightly delayed copy of itself, some frequencies add in phase and others cancel. The resulting response has a series of peaks and dips that looks like the teeth of a comb — hence the name.',
  },
  {
    title: 'Why does delay time affect frequency?',
    body: 'A delay of T seconds reinforces frequencies whose period divides T exactly, so the spacing between peaks is 1/T. At 10 ms the spacing is 100 Hz; at 3 ms it is about 333 Hz. Shorter delays push the resonant grid higher and wider apart.',
  },
  {
    title: 'Why do short delays sound metallic?',
    body: 'Very short delays place a dense grid of resonance peaks inside the audible range. When the input is broadband, those peaks behave like the modes of a struck metal object, giving a bright, bell-like or comb-like timbre.',
  },
  {
    title: 'How does feedback create ringing aftertones?',
    body: 'Feedback sends the delayed signal back into the delay again. Energy recirculates and the peaks become narrower and louder, so they ring for longer after the input stops. The closer the feedback gain gets to 100%, the longer and more metallic the decay — which is why the control stops at 98%.',
  },
  {
    title: 'Delay vs resonance vs pitch shifting',
    body: 'A delay repeats a signal in time. A resonance is a frequency-dependent boost created by that delay combined with feedback. Pitch shifting actually changes the playback rate and transposes the signal. Changing delay time inside a running feedback loop can produce pitch artefacts, but that is modulation, not a true pitch shifter.',
  },
]

export function EducationPanel() {
  return (
    <Collapsible
      title="How this works"
      subtitle="Comb filtering, resonance and feedback in plain language"
    >
      <div className="space-y-4">
        {topics.map((topic) => (
          <section key={topic.title}>
            <h3 className="mb-1 text-sm font-semibold text-white">{topic.title}</h3>
            <p>{topic.body}</p>
          </section>
        ))}
        <p className="rounded-lg border border-line bg-charcoal-950/60 p-3 text-xs text-mist/90">
          The graph shows the theoretical response of the selected filter. The audio engine uses a
          real delay loop, so its output also depends on dry/wet mix, source signal and the safety
          limiter.
        </p>
      </div>
    </Collapsible>
  )
}
