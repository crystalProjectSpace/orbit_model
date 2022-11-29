'use strict'

const { GravModel } = require('./grav_model.js')
const { MODEL_DATA } = require('./data.js')
const testModel = new GravModel()

testModel.setStep(0.1)
MODEL_DATA.forEach(i => testModel.addItem(i))

const VAL = testModel.integrate(50000, 100000)
const report = testModel.printReport(VAL, 'earth', ['gagarin', 'leonov', 'moon'])

console.log(report)