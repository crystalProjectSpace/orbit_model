'use strict'

const { GravModel } = require('./grav_model.js')
const { prepareCoords } = require('./vect.js')
const { MODEL_DATA } = require('./data.js')
const fs = require('fs')

const root = MODEL_DATA.find(item => item.root) ?? MODEL_DATA[0]
const childNodes = MODEL_DATA.filter(item => item.ID !== root.ID)
const testModel = new GravModel()

testModel.setStep(0.1)

testModel.addItem({
    VX: 0,
    VY: 0,
    VZ: 0,
    X:  0,
    Y:  0,
    Z:  0,
    M:  root.M,
    ID: root.ID,
    feather: 0,
    powered: 0,
    engine: {},
    guidance: {},	
})

const rootCoords = [0, 0, 0]
const rootVelocity = [0, 0, 0]

childNodes.forEach(i => {
    const { vObj, hObj, ThObj, phase, inclination, M, M_FUEL, ID, feather, powered, engine, guidance } = i
    const { CR, V } = prepareCoords(rootCoords, rootVelocity, hObj, vObj, ThObj, phase, inclination)

    testModel.addItem({
        VX: V[0],
        VY: V[1],
        VZ: V[2],
        X: CR[0],
        Y: CR[1],
        Z: CR[2],
        M,
        M_FUEL,
        ID,
        feather,
        powered,
        engine,
        guidance
    })
})

const VAL = testModel.integrate(1000, 450000)
const report = testModel.printReport(VAL, 'earth', ['gagarin','gagarin-1', 'gagarin-2', 'moon'])

fs.writeFile('output.txt', report, (err) => {
    if(err) {
        console.log(`error while writing results: \n ${err}`) 
    } else {
        console.log('result written')
    }
})