const { curry, filter, identity } = require("ramda");
const pValue = require('./pValue')

const doRun = (probability) => (Math.random() + probability) > 0.5

const runExperiment = curry(({ minimumSamples, maximumSamples, desiredP, minimumRuns, checkEvery }, experiment) => {
  const controlRuns = []
  const treatmentRuns = []

  let pRun = 0;

  for (let i = 0; i < maximumSamples; i++) {
    controlRuns.push(doRun(0))
    treatmentRuns.push(doRun(experiment.liftToBaseProbability))

    if (i < minimumSamples) continue
    if (i % checkEvery !== 0) continue
    if (pValue(controlRuns, treatmentRuns) > desiredP) {
      pRun = 0
      continue
    };

    pRun++

    if (pRun > minimumRuns) break
  }

  const p = pValue(controlRuns, treatmentRuns)
  const controlSuccesses = filter(identity, controlRuns)
  const treatmentSuccesses = filter(identity, treatmentRuns)

  return {
    name: experiment.name,
    knownConversion: experiment.liftToBaseProbability,
    controlConversion: (controlSuccesses.length / controlRuns.length).toFixed(3),
    treatmentConversion: (treatmentSuccesses.length / treatmentRuns.length).toFixed(3),
    p: (Math.ceil(p * 1000) / 1000).toFixed(3),
    statsig: p < desiredP,
  }
})

module.exports = runExperiment