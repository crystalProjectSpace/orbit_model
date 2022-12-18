'use stric'

// {
//     vObj: 10677.5,
//     hObj:  6.8711E+6,
//     ThObj: 0,
//     phase: -2.209,
//     inclination: 0,
//     M:  10000,
//     ID: 'gagarin',
//     feather: 1,
//     powered: 1,
//     M_FUEL: 0,
//     engine: {
//         J_RELATIVE: 3015,
//         wMax: 0.5,
//         wMin: 0.1,
//     },
//     guidance: {
//         visionLine: 0,
//         dM: function(tau) {
//             if(tau > 0.0 && tau < 100.0) {
//                 return 65.0
//             }
//             return 0.0
//         },
//         getVectThrust: function(cr, index, V, tau) {
//             const VX = cr[index]
//             const VY = cr[index + 1]
//             const VZ = cr[index + 2]
//             const dAbs = Math.sqrt(VX * VX + VY * VY + VZ * VZ)
//             V[0] = VX / dAbs
//             V[1] = VY / dAbs
//             V[2] = VZ / dAbs
//         }
//     },
// },

module.exports = {
    MODEL_DATA: [
        {
            root: true,
            M:  5.972E+24,
            ID: 'earth',
            feather: 0,
            powered: 0,
            engine: {},
            guidance: {},	
        },
        {
            vObj: 10676.5,
            hObj:  6.8711E+6,
            ThObj: 0,
            phase: -1.906,
            inclination: 0,
            M:  10000,
            ID: 'gagarin',
            feather: 1,
            powered: 1,
            M_FUEL: 0,
            engine: {},
            guidance: {},
        },
        {
            vObj: 10676.5,
            hObj:  6.8711E+6,
            ThObj: 0,
            phase: -1.905,
            inclination: 0,
            M:  10000,
            ID: 'gagarin-1',
            feather: 1,
            powered: 0,
            M_FUEL: 0,
            engine: {},
            guidance: {},
        },
        {
            vObj: 10676.5,
            hObj:  6.8711E+6,
            ThObj: 0,
            phase: -1.904,
            inclination: 0,
            M:  10000,
            ID: 'gagarin-2',
            feather: 1,
            powered: 0,
            M_FUEL: 0,
            engine: {},
            guidance: {},
        },
        {
            VX: 1018,
            vObj: 1018,
            hObj:  3.84E+8,
            ThObj: 0,
            phase: 0,
            inclination: 0,
            M:  7.35E+22,
            ID: 'moon',
            feather: 0,
            powered: 0,
            engine: {},
            guidance: {},
        }
    ],
}