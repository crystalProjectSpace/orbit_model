'use strict'

const { GravModel } = require('./grav_model.js')
const testModel = new GravModel()

testModel
	.setStep(1)
	.addItem({
		VX: 0,
		VY: 0,
		VZ: 0,
		X:  0,
		Y:  0,
		Z:  0,
		M:  5.972E+24,
		ID: 'earth',
		feather: false,
	})
	.addItem({
		VX: 7818.067,
		VY: 0,
		VZ: 0,
		X:  0,
		Y:  6.5211E+6,
		Z:  0,
		M:  100,
		ID: 'gagarin',
		feather: true,
	})
	.addItem({
		VX: 7918.061,
		VY: 0,
		VZ: 0,
		X:  0,
		Y:  6.5211E+6,
		Z:  0,
		M:  100,
		ID: 'leonov',
		feather: true,
	})
	.addItem({
		VX: 1018,
		VY: 0,
		VZ: 0,
		X:  0,
		Y:  3.84E+8,
		Z:  0,
		M:  7.35E+22,
		ID: 'moon',
		feather: false,
	})

const VAL = testModel.integrate(5000, 50000)

const _log = VAL.reduce((res, item) => {
	const VX = item.coords[7]
	const VY = item.coords[8]
	const VZ = item.coords[9]
	const X = item.coords[10]
	const Y = item.coords[11]
	const Z = item.coords[12]
	
	const _VX = item.coords[14]
	const _VY = item.coords[15]
	const _VZ = item.coords[16]
	const _X = item.coords[17]
	const _Y = item.coords[18]
	const _Z = item.coords[19]
	
	const VX_1 = item.coords[21]
	const VY_1 = item.coords[22]
	const VZ_1 = item.coords[23]
	const X_1 = item.coords[24]
	const Y_1 = item.coords[25]
	const Z_1 = item.coords[26]

	const V = Math.sqrt(VX * VX + VY * VY + VZ * VZ).toFixed(5)
	const H = ((Math.sqrt(X * X + Y * Y + Z * Z) - 6.3711E+6) / 1E3).toFixed(2)
	
	const _V = Math.sqrt(_VX * _VX + _VY * _VY + _VZ * _VZ).toFixed(5)
	const _H = ((Math.sqrt(_X * _X + _Y * _Y + _Z * _Z) - 6.3711E+6) / 1E3).toFixed(2)
	
	const V_1 = Math.sqrt(VX_1 * VX_1 + VY_1 * VY_1 + VZ_1 * VZ_1).toFixed(5)
	const H_1 = ((Math.sqrt(X_1 * X_1 + Y_1 * Y_1 + Z_1 * Z_1) - 6.3711E+6) / 1E3).toFixed(2)
	
	res += ['t: ', item.t.toFixed(2),';', V, H, '|', _V, _H, '|', V_1, H_1, ';\n'].join(' ')
	return res
}, '')

console.log(_log)