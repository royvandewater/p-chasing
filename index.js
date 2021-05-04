const R = require('ramda')
const genstats = require('genstats')
const {format: asTable} = require('obj-array-table')

const totalPopulationSize = 1500

const pValue = (control, experiment) => {
  if (control.runs.length < 2 || experiment.runs.length < 2) return 1;
  const controlData = R.map(run => run ? 1 : 0, control.runs)
  const experimentData = R.map(run => run ? 1 : 0, experiment.runs)

  return genstats.student(controlData, experimentData).p
}

const milestones = [
  { n: totalPopulationSize / 4, p: 0.2 },
  { n: totalPopulationSize / 2, p: 0.1 },
  { n: totalPopulationSize / 1, p: 0.05 },
]

const main = () => {
  const control     = {name: 'control',      liftToBaseProbability: 0.0,  runs: [], milestones: [{ n: Infinity, p: 0 }]}

  let experiments = [control,
   {name: 'experiment 1',  liftToBaseProbability: 0.01,  runs: [], milestones: R.clone(milestones)},
   {name: 'experiment 2',  liftToBaseProbability: 0.02,  runs: [], milestones: R.clone(milestones)},
   {name: 'experiment 3',  liftToBaseProbability: 0.03,  runs: [], milestones: R.clone(milestones)},
   {name: 'experiment 4',  liftToBaseProbability: 0.04,  runs: [], milestones: R.clone(milestones)},
   {name: 'experiment 5',  liftToBaseProbability: 0.05,  runs: [], milestones: R.clone(milestones)},
   {name: 'experiment 6',  liftToBaseProbability: 0.06,  runs: [], milestones: R.clone(milestones)},
   {name: 'experiment 7',  liftToBaseProbability: 0.07,  runs: [], milestones: R.clone(milestones)},
   {name: 'experiment 8',  liftToBaseProbability: 0.10, runs: [], milestones: R.clone(milestones)},
   {name: 'experiment 9',  liftToBaseProbability: 0.11, runs: [], milestones: R.clone(milestones)},
   {name: 'experiment 10', liftToBaseProbability: 0.12, runs: [], milestones: R.clone(milestones)},
  ]
  const endedExperiments = []

  let i = 0;
  while (experiments.length > 1) {
    i++;
    const experiment = experiments[i % experiments.length]
    const [milestone] = experiment.milestones
    if (R.isNil(milestone)) {
      experiments = R.without([experiment], experiments)
      endedExperiments.push(experiment)
      continue;
    }

    const rand = Math.random() + experiment.liftToBaseProbability
    const outcome  = rand > 0.5
    experiment.runs.push(outcome)

    if (experiment.runs.length < milestone.n) continue;

    // We are at the point where we have to evaulate the milestone
    experiment.milestones = R.tail(experiment.milestones)

    if (pValue(control, experiment) < milestone.p) {
      // success! let it loop again for the next milestone
      continue;
    }

    // failure :-(. Let's call this one done
    endedExperiments.push(experiment)
    experiments = R.without([experiment], experiments)
  }

  let results = []

  endedExperiments.forEach((experiment) => {
    const {name, liftToBaseProbability, runs} = experiment
    const successes = R.filter(R.identity, runs)
    const p = pValue(control, experiment)

    results.push({
      name,
      knownLift: liftToBaseProbability,
      liftToBaseProbability,
      conversionRate: (successes.length / runs.length).toFixed(3),
      p: (Math.ceil(p * 1000) / 1000).toFixed(3),
      statsig: p < 0.05,
    })
  })

  results = R.sortBy(R.prop('liftToBaseProbability'), results)
  results = R.map(R.omit(['liftToBaseProbability']), results)

  console.log(asTable(results))
  console.log(`\nAchieved in ${i} runs`)
}
main();