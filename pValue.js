const genstats = require('genstats')
const { map } = require("ramda");

const pValue = (controlRuns, treatmentRuns) => {
  if (controlRuns.length < 2 || treatmentRuns.length < 2) return 1;

  const controlData = map(run => run ? 1 : 0, controlRuns)
  const treatmentData = map(run => run ? 1 : 0, treatmentRuns)

  return genstats.student(controlData, treatmentData).p
}

module.exports = pValue