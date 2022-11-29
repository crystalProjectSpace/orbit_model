'use strict'
/**
* @module grav_model
*/
/**
* @description объект для расчетов в модели 
* @typedef {{VX: number, VY: number, VZ: number, X: number, Y: number, Z: number, ID: string, feather: boolean}} BallisticObject
*/
const { performance } = require('perf_hooks')
const { Vect3D, LocalCoordinates } = require('./vect3D.js')
/**
* @const Гравитационная постоянная
*/
const G0 = 6.6743E-11
/**
* @const Максимальное количество объектов в модели
*/
const MAX_BUFF_SIZE = 2048
/**
* @const Количество float для описания одного объекта
*/
const N_OBJ_PRMS = 7
/**
* @const Размер массива с координиатами/скоростями/массами объектов
*/
const CACHE_SIZE = MAX_BUFF_SIZE * N_OBJ_PRMS
/**
* @description модель N-объектов
*/
const GravModel = function() {
	this.objectData = []
	this.coords     = new Float64Array(CACHE_SIZE)
	this.indexLast  = -1
	this.nObjects   = 0
	this.dT         = 0
	this.dT_05      = 0
	this.dT_6       = 0
	this.K0_buff    = null
	this.K1_buff    = null
	this.K2_buff    = null
	this.K3_buff    = null
}
/**
* @description добавить новый объект
*/
GravModel.prototype.addItem = function(obj) {
	this.nObjects++
	this.coords[++this.indexLast] = obj.VX
	this.coords[++this.indexLast] = obj.VY
	this.coords[++this.indexLast] = obj.VZ
	this.coords[++this.indexLast] = obj.X
	this.coords[++this.indexLast] = obj.Y
	this.coords[++this.indexLast] = obj.Z
	this.coords[++this.indexLast] = obj.M
	
	this.objectData.push({
		ID: obj.ID,
		mDry: obj.M - obj.M_FUEL,
		feather: obj.feather,
		powered: obj.powered,
		engine: obj.engine,
		guidance: obj.guidance,
		localCR: new LocalCoordinates(
			[obj.X,  obj.Y,  obj.Z],
			[obj.VX, obj.VY, obj.VZ],
			[this.coords[3], this.coords[4], this.coords[5]]
		),
		vect_thrust: new Vect3D(0, 0, 0),
	})
	
	const K_size = N_OBJ_PRMS * this.nObjects
	
	this.K0_buff = new Float64Array(K_size)
	this.K1_buff = new Float64Array(K_size)
	this.K2_buff = new Float64Array(K_size)
	this.K3_buff = new Float64Array(K_size)
	
	return this
}
/**
* @description удалить объект из расчетов
*/
GravModel.prototype.deleteItem = function(ID) {
}
/**
* @description задать шаг интегрирования
* @param {dT} number шаг численного интегрирования
*/
GravModel.prototype.setStep = function(dT) {
	this.dT = dT
	this.dT_05 = 0.5 * dT
	this.dT_6 = 0.166666666666667 * dT
	return this
}
/**
* @description получить производные
*/
GravModel.prototype.derivatives = function(DATA, RES, t) {
	let i0 = 0
	const objs = this.objectData
	for(let i = 0; i < this.nObjects; i++) {
		const i0_1 = i0 + 1
		const i0_2 = i0 + 2
		const i0_3 = i0 + 3
		const i0_4 = i0 + 4
		const i0_5 = i0 + 5
		const i0_6 = i0 + 6
		
		const VX  = DATA[i0]
		const VY  = DATA[i0_1]
		const VZ  = DATA[i0_2]

		const X  = DATA[i0_3]
		const Y  = DATA[i0_4]
		const Z  = DATA[i0_5]
		const M  = DATA[i0_6]
		let j0 = i0 + N_OBJ_PRMS
		const obj = objs[i]
		const isFeather = obj.feather
		for(let j = i + 1; j < this.nObjects; j++) {
			const secondFeather = objs[j].feather
			if (isFeather === 1 && secondFeather === 1) {
				j0 += N_OBJ_PRMS;
				continue;
			}
			
			const _X = DATA[j0 + 3]
			const _Y = DATA[j0 + 4]
			const _Z = DATA[j0 + 5]
			const _M = DATA[j0 + 6]

			const dX = X - _X
			const dY = Y - _Y
			const dZ = Z - _Z
			const dR_2 = dX * dX + dY * dY + dZ * dZ
			const dR = Math.sqrt(dR_2)
			const grav = G0 / (dR_2 * dR)
			
			if (secondFeather === 0) {
				const grav_i = grav * _M
				RES[i0]   -= grav_i * dX
				RES[i0_1] -= grav_i * dY
				RES[i0_2] -= grav_i * dZ
			}
			if (isFeather === 0) {
				const grav_j = grav * M
				RES[j0]     += grav_j * dX
				RES[j0 + 1] += grav_j * dY
				RES[j0 + 2] += grav_j * dZ
			}
			
			j0 += N_OBJ_PRMS
		}
		
		if (obj.powered === 1) {
			if (M > objs[i].mDry) {
				const dM = obj.guidance.dM(t)
				if (dM > 0) {
					const aR = obj.engine.J_RELATIVE * dM / M
					const vect = obj.vect_thrust
					obj.guidance.getVectThrust(DATA, i0, vect, t)
					RES[i0]   += aR * vect[0]
					RES[i0_1] += aR * vect[1]
					RES[i0_2] += aR * vect[2]
					RES[i0_6] = -dM
				}
			}
		}

		RES[i0_3] = VX
		RES[i0_4] = VY
		RES[i0_5] = VZ
		i0 += N_OBJ_PRMS
	}
}
/**
* @description один шаг численного интегрирования
*/
GravModel.prototype.integrate = function(freq, tMax) {
	const N_TOTAL_COORDS = this.indexLast + 1
	const itemBuff = this.coords.slice(0, N_TOTAL_COORDS)

	const RES = [{
		t: 0,
		coords: this.coords.slice(0, N_TOTAL_COORDS)
	}]
	let t = 0
	let k = 0
	let i = 0
	let t0 = performance.now()
	const cr = this.coords
	const k0 = this.K0_buff
	const k1 = this.K1_buff
	const k2 = this.K2_buff
	const k3 = this.K3_buff
	const dT = this.dT
	const dT_05 = this.dT_05
	const dT_6 = this.dT_6
	const nObjects = this.nObjects
	const derivatives = this.derivatives.bind(this)
	while(t < tMax) {
		derivatives(itemBuff, k0, t)
		let i0 = 0
		for(i = 0; i < nObjects; i++) {
			itemBuff[i0] += k0[i0] * dT_05
			i0++
			itemBuff[i0] += k0[i0] * dT_05
			i0++
			itemBuff[i0] += k0[i0] * dT_05
			i0++
			itemBuff[i0] += k0[i0] * dT_05
			i0++
			itemBuff[i0] += k0[i0] * dT_05
			i0++
			itemBuff[i0] += k0[i0] * dT_05
			i0++
			itemBuff[i0] += k0[i0] * dT_05
			i0++
		}
		
		derivatives(itemBuff, k1, t)
		i0 = 0
		for(i = 0; i < nObjects; i++) {
			itemBuff[i0] = cr[i0] + k1[i0] * dT_05
			i0++
			itemBuff[i0] = cr[i0] + k1[i0] * dT_05
			i0++
			itemBuff[i0] = cr[i0] + k1[i0] * dT_05
			i0++
			itemBuff[i0] = cr[i0] + k1[i0] * dT_05
			i0++
			itemBuff[i0] = cr[i0] + k1[i0] * dT_05
			i0++
			itemBuff[i0] = cr[i0] + k1[i0] * dT_05
			i0++
			itemBuff[i0] = cr[i0] + k1[i0] * dT_05
			i0++
		}
		
		derivatives(itemBuff, k2, t)
		i0 = 0
		for(i = 0; i < nObjects; i++) {
			itemBuff[i0] = cr[i0] + k2[i0] * dT
			i0++
			itemBuff[i0] = cr[i0] + k2[i0] * dT
			i0++
			itemBuff[i0] = cr[i0] + k2[i0] * dT
			i0++
			itemBuff[i0] = cr[i0] + k2[i0] * dT
			i0++
			itemBuff[i0] = cr[i0] + k2[i0] * dT
			i0++
			itemBuff[i0] = cr[i0] + k2[i0] * dT
			i0++
			itemBuff[i0] = cr[i0] + k2[i0] * dT
			i0++
		}
		
		derivatives(itemBuff, k3, t)
		i0 = 0
		for(i = 0; i < nObjects; i++) {
			cr[i0] += dT_6 * (k0[i0] + 2.0 * (k1[i0] + k2[i0]) + k3[i0])
			k0[i0] = 0
			k1[i0] = 0
			k2[i0] = 0
			k3[i0] = 0
			itemBuff[i0] = cr[i0]
			i0++
			
			cr[i0] += dT_6 * (k0[i0] + 2.0 * (k1[i0] + k2[i0]) + k3[i0])
			k0[i0] = 0
			k1[i0] = 0
			k2[i0] = 0
			k3[i0] = 0
			itemBuff[i0] = cr[i0]
			i0++
			
			cr[i0] += dT_6 * (k0[i0] + 2.0 * (k1[i0] + k2[i0]) + k3[i0])
			k0[i0] = 0
			k1[i0] = 0
			k2[i0] = 0
			k3[i0] = 0
			itemBuff[i0] = cr[i0]
			i0++
			
			cr[i0] += dT_6 * (k0[i0] + 2.0 * (k1[i0] + k2[i0]) + k3[i0])
			k0[i0] = 0
			k1[i0] = 0
			k2[i0] = 0
			k3[i0] = 0
			itemBuff[i0] = cr[i0]
			i0++
			
			cr[i0] += dT_6 * (k0[i0] + 2.0 * (k1[i0] + k2[i0]) + k3[i0])
			k0[i0] = 0
			k1[i0] = 0
			k2[i0] = 0
			k3[i0] = 0
			itemBuff[i0] = cr[i0]
			i0++
			
			cr[i0] += dT_6 * (k0[i0] + 2.0 * (k1[i0] + k2[i0]) + k3[i0])
			k0[i0] = 0
			k1[i0] = 0
			k2[i0] = 0
			k3[i0] = 0
			itemBuff[i0] = cr[i0]
			i0++
			
						
			cr[i0] += dT_6 * (k0[i0] + 2.0 * (k1[i0] + k2[i0]) + k3[i0])
			k0[i0] = 0
			k1[i0] = 0
			k2[i0] = 0
			k3[i0] = 0
			itemBuff[i0] = cr[i0]
			i0++
		}
		t += dT
				
		if(++k === freq) {
			RES.push({
				t: t,
				coords: cr.slice(0, N_TOTAL_COORDS)
			})
			k = 0
		}
	}
	console.log(performance.now() - t0)
	return RES
}
/**
* @description проанализировать результаты расчета и сформировать отчет
*/
GravModel.prototype.printReport = function(DATA, centralID, idsToOutput) {
	const objs = this.objectData
	const centralIndex = objs.findIndex(o => o.ID === centralID)
	const _central_i = centralIndex * N_OBJ_PRMS
	
	const N_DATA_ROWS = DATA.length
	
	const outputData = idsToOutput.map(id => {
		const index = objs.findIndex(o => o.ID === id)
		const V = new Vect3D(0, 0, 0)
		const H = new Vect3D(0, 0, 0)
		const getRelativeData = cr => {
			const _i = N_OBJ_PRMS * index
			V.set(
				cr[_i]     - cr[_central_i],
				cr[_i + 1] - cr[_central_i + 1],
				cr[_i + 2] - cr[_central_i + 2],
			)
			H.set(
				cr[_i + 3] - cr[_central_i + 3],
				cr[_i + 4] - cr[_central_i + 4],
				cr[_i + 5] - cr[_central_i + 5],
			)
		}
		return {
			velocity: V,
			coordinates: H,
			getRelativeData,
		}
	})

	const nOutputObjs = outputData.length
	let result = ''
	let str = ''
	for(let i = 0; i < N_DATA_ROWS; i++) {
		const CR = DATA[i].coords
		const t = DATA[i].t
		str += `t: ${t.toFixed(3)} s |`
		for(let j = 0; j < nOutputObjs; j++) {
			const outObj = outputData[j]
			outObj.getRelativeData(CR)
			const V = outObj.velocity.abs()
			const H = outObj.coordinates.abs()
			str += `V: ${V.toFixed(4)} | H: ${((H - 6.3711E+6) * 1E-3).toFixed(1)} |`
		}
		result += `${str}\n`
		str = ''
	}

	return result
}

module.exports = { GravModel } 