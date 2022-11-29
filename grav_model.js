'use strict'
/**
* @module grav_model
*/
/**
* @description объект для расчетов в модели 
* @typedef {{VX: number, VY: number, VZ: number, X: number, Y: number, Z: number, ID: string, feather: boolean}} BallisticObject
*/
const { performance } = require('perf_hooks')
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
		feather: obj.feather,
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
GravModel.prototype.derivatives = function(DATA, RES) {
	let i0 = 0
	for(let i = 0; i < this.nObjects; i++) {
		const X  = DATA[i0 + 3]
		const Y  = DATA[i0 + 4]
		const Z  = DATA[i0 + 5]
		const M  = DATA[i0 + 6]
		let j0 = i0 + N_OBJ_PRMS
		const isFeather = this.objectData[i].feather
		for(let j = i + 1; j < this.nObjects; j++) {
			if(isFeather && this.objectData[j].feather) {
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
			
			const grav_i = grav * _M
			const grav_j = grav * M
			if (!this.objectData[j].feather) {
				RES[i0]     -= grav_i * dX
				RES[i0 + 1] -= grav_i * dY
				RES[i0 + 2] -= grav_i * dZ
			}
			if (!isFeather) {
				RES[j0]     += grav_j * dX
				RES[j0 + 1] += grav_j * dY
				RES[j0 + 2] += grav_j * dZ
			}
			
			j0 += N_OBJ_PRMS
		}
		RES[i0 + 3] = DATA[i0]
		RES[i0 + 4] = DATA[i0 + 1]
		RES[i0 + 5] = DATA[i0 + 2]
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
	let t0 = performance.now()
	while((t += this.dT) < tMax) {
		this.derivatives(itemBuff, this.K0_buff)
		let i0 = 0
		for(let i = 0; i < this.nObjects; i++) {
			itemBuff[i0] += this.K0_buff[i0] * this.dT_05
			i0++
			itemBuff[i0] += this.K0_buff[i0] * this.dT_05
			i0++
			itemBuff[i0] += this.K0_buff[i0] * this.dT_05
			i0++
			itemBuff[i0] += this.K0_buff[i0] * this.dT_05
			i0++
			itemBuff[i0] += this.K0_buff[i0] * this.dT_05
			i0++
			itemBuff[i0] += this.K0_buff[i0] * this.dT_05
			i0++
			itemBuff[i0] += this.K0_buff[i0] * this.dT_05
			i0++
		}
		
		this.derivatives(itemBuff, this.K1_buff)
		i0 = 0
		for(let i = 0; i < this.nObjects; i++) {
			itemBuff[i0] = this.coords[i0] + this.K1_buff[i0] * this.dT_05
			i0++
			itemBuff[i0] = this.coords[i0] + this.K1_buff[i0] * this.dT_05
			i0++
			itemBuff[i0] = this.coords[i0] + this.K1_buff[i0] * this.dT_05
			i0++
			itemBuff[i0] = this.coords[i0] + this.K1_buff[i0] * this.dT_05
			i0++
			itemBuff[i0] = this.coords[i0] + this.K1_buff[i0] * this.dT_05
			i0++
			itemBuff[i0] = this.coords[i0] + this.K1_buff[i0] * this.dT_05
			i0++
			itemBuff[i0] = this.coords[i0] + this.K1_buff[i0] * this.dT_05
			i0++
		}
		
		this.derivatives(itemBuff, this.K2_buff)
		i0 = 0
		for(let i = 0; i < this.nObjects; i++) {
			itemBuff[i0] = this.coords[i0] + this.K2_buff[i0] * this.dT
			i0++
			itemBuff[i0] = this.coords[i0] + this.K2_buff[i0] * this.dT
			i0++
			itemBuff[i0] = this.coords[i0] + this.K2_buff[i0] * this.dT
			i0++
			itemBuff[i0] = this.coords[i0] + this.K2_buff[i0] * this.dT
			i0++
			itemBuff[i0] = this.coords[i0] + this.K2_buff[i0] * this.dT
			i0++
			itemBuff[i0] = this.coords[i0] + this.K2_buff[i0] * this.dT
			i0++
			itemBuff[i0] = this.coords[i0] + this.K2_buff[i0] * this.dT
			i0++
		}
		
		this.derivatives(itemBuff, this.K3_buff)
		i0 = 0
		for(let i = 0; i < this.nObjects; i++) {
			this.coords[i0] += this.dT_6 * (this.K0_buff[i0] + 2 * (this.K1_buff[i0] + this.K2_buff[i0]) + this.K3_buff[i0])
			this.K0_buff[i0] = 0
			this.K1_buff[i0] = 0
			this.K2_buff[i0] = 0
			this.K3_buff[i0] = 0
			itemBuff[i0] = this.coords[i0]
			i0++
			
			this.coords[i0] += this.dT_6 * (this.K0_buff[i0] + 2 * (this.K1_buff[i0] + this.K2_buff[i0]) + this.K3_buff[i0])
			this.K0_buff[i0] = 0
			this.K1_buff[i0] = 0
			this.K2_buff[i0] = 0
			this.K3_buff[i0] = 0
			itemBuff[i0] = this.coords[i0]
			i0++
			
			this.coords[i0] += this.dT_6 * (this.K0_buff[i0] + 2 * (this.K1_buff[i0] + this.K2_buff[i0]) + this.K3_buff[i0])
			this.K0_buff[i0] = 0
			this.K1_buff[i0] = 0
			this.K2_buff[i0] = 0
			this.K3_buff[i0] = 0
			itemBuff[i0] = this.coords[i0]
			i0++
			
			this.coords[i0] += this.dT_6 * (this.K0_buff[i0] + 2 * (this.K1_buff[i0] + this.K2_buff[i0]) + this.K3_buff[i0])
			this.K0_buff[i0] = 0
			this.K1_buff[i0] = 0
			this.K2_buff[i0] = 0
			this.K3_buff[i0] = 0
			itemBuff[i0] = this.coords[i0]
			i0++
			
			this.coords[i0] += this.dT_6 * (this.K0_buff[i0] + 2 * (this.K1_buff[i0] + this.K2_buff[i0]) + this.K3_buff[i0])
			this.K0_buff[i0] = 0
			this.K1_buff[i0] = 0
			this.K2_buff[i0] = 0
			this.K3_buff[i0] = 0
			itemBuff[i0] = this.coords[i0]
			i0++
			
			this.coords[i0] += this.dT_6 * (this.K0_buff[i0] + 2 * (this.K1_buff[i0] + this.K2_buff[i0]) + this.K3_buff[i0])
			this.K0_buff[i0] = 0
			this.K1_buff[i0] = 0
			this.K2_buff[i0] = 0
			this.K3_buff[i0] = 0
			itemBuff[i0] = this.coords[i0]
			i0++
			
						
			this.coords[i0] += this.dT_6 * (this.K0_buff[i0] + 2 * (this.K1_buff[i0] + this.K2_buff[i0]) + this.K3_buff[i0])
			this.K0_buff[i0] = 0
			this.K1_buff[i0] = 0
			this.K2_buff[i0] = 0
			this.K3_buff[i0] = 0
			itemBuff[i0] = this.coords[i0]
			i0++
		}
	
		if(++k === freq) {
			RES.push({
				t: t,
				coords: this.coords.slice(0, N_TOTAL_COORDS)
			})
			k = 0
		}
	}
	console.log(performance.now() - t0)
	return RES
}

module.exports = { GravModel } 