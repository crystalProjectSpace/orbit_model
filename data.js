'use stric'

module.exports = {
    MODEL_DATA: [
        {
            VX: 0,
            VY: 0,
            VZ: 0,
            X:  0,
            Y:  0,
            Z:  0,
            M:  5.972E+24,
            ID: 'earth',
            feather: 0,
            powered: 0,
            engine: {},
            guidance: {},	
        },
        {
            VX: 7616.4,
            VY: 0,
            VZ: 0,
            X:  0,
            Y:  6.8711E+6,
            Z:  0,
            M:  100,
            ID: 'gagarin',
            feather: 1,
            powered: 1,
            M_FUEL: 25,
            engine: {
                J_RELATIVE: 17215,
                wMax: 0.5,
                wMin: 0.1,
            },
            guidance: {
                visionLine: 0,
                dM: function(tau) {
                    if(tau > 0.0 && tau < 50000.0) {
                        return 5E-6
                    }
                    return 0.0
                },
                getVectThrust: function(cr, index, V, tau) {
                    const VX = cr[index]
                    const VY = cr[index + 1]
                    const VZ = cr[index + 2]
                    const dAbs = Math.sqrt(VX * VX + VY * VY + VZ * VZ)
                    V[0] = VX / dAbs
                    V[1] = VY / dAbs
                    V[2] = VZ / dAbs
                }
            },
        },
        {
            VX: 7616.4,
            VY: 0,
            VZ: 0,
            X:  0,
            Y:  6.8711E+6,
            Z:  0,
            M:  100,
            ID: 'leonov',
            feather: 1,
            powered: 0,
            engine: {},
            guidance: {},
        },
        {
            VX: 1018,
            VY: 0,
            VZ: 0,
            X:  0,
            Y:  3.84E+8,
            Z:  0,
            M:  7.35E+22,
            ID: 'moon',
            feather: 0,
            powered: 0,
            engine: {},
            guidance: {},
        }
    ],
}