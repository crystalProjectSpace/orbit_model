'use strict'

const rotateMatrix = function(phase, inclination) {
    const CP = Math.cos(phase)
    const SP = Math.sin(phase)
    const CI = Math.cos(inclination)
    const SI = Math.sin(inclination)

    return [
        CP,     SP * CI,    SP * SI,
        -SP,    CP * CI,    CP * SI,
        0,      -SI,        CI,
    ]
}

const rotateCoords = function(X, Y, Z, M) {
    return [
        M[0] * X + M[1] * Y + M[2] * Z,
        M[3] * X + M[4] * Y + M[5] * Z,
        M[6] * X + M[7] * Y + M[8] * Z,
    ]
}

const prepareCoords = function(coordCenter, velocityCenter, hObj, vObj, ThObj, phase, inclination) {
    const xObj = 0
    const yObj = hObj
    const zObj = 0

    const v_xObj = vObj * Math.cos(ThObj)
    const v_yObj = vObj * Math.sin(ThObj)
    const v_zObj = 0

    const rotation = rotateMatrix(phase, inclination)

    const coords = rotateCoords(xObj, yObj, zObj, rotation)
    const velocity = rotateCoords(v_xObj, v_yObj, v_zObj, rotation)

    return {
        CR: [
            coords[0] + coordCenter[0],
            coords[1] + coordCenter[1],
            coords[2] + coordCenter[2],
        ],
        V: [
            velocity[0] + velocityCenter[0],
            velocity[1] + velocityCenter[1],
            velocity[2] + velocityCenter[2],
        ]
    }
}

module.exports = { prepareCoords }