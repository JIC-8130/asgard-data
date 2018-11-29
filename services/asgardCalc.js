

function timeAvailable(numWorkers) {
    return numWorkers * 8;
}

function mhProductivity(quantity, time) {
    return (quantity * 1.0) / time;
}

module.exports = {
    timeAvailable: timeAvailable,
    mhProductivity: mhProductivity
}