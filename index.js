const { format: asTable } = require('obj-array-table');
const { map, filter, length, times, drop, includes } = require('ramda');
const runExperiment = require('./runExperiment');

const numExperiments = 100000;
const minimumSamples = 1000;
const maximumSamples = 1100;
const checkEvery = 20; // samples
const minimumRuns = 1;
const desiredP = 0.2
const liftToEffectiveTreatments = 0.02

const isType1Error = ({ statsig, knownConversion }) => (statsig && knownConversion === 0)
const isType2Error = ({ statsig, knownConversion }) => (!statsig && knownConversion > 0)

const even = x => x % 2 === 0;

const createExperiment = (i) => ({
  name: `experiment ${i}`,
  liftToBaseProbability: even(i) ? 0 : liftToEffectiveTreatments,
})

const formattedPercent = (n) => `${(Math.round(10000 * n) / 100)}%`

const main = (argv) => {
  const verbose = includes('-v', argv)
  const experiments = times(createExperiment, numExperiments)

  const results = map(runExperiment({ minimumSamples, maximumSamples, desiredP, minimumRuns, checkEvery }), experiments)

  const type1Errors = filter(isType1Error, results)
  const type2Errors = filter(isType2Error, results)

  if (verbose) {
    console.log(asTable(results))
  }
  console.log('Number of Type I errors:', length(type1Errors), formattedPercent(length(type1Errors) / length(results)))
  console.log('Number of Type II errors:', length(type2Errors), formattedPercent(length(type2Errors) / length(results)))
}
main(process.argv);
