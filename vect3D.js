'use strict'

const ORIENT = [0.5773502691896257, 0.5773502691896257, 0.5773502691896257]
/**
 * 
 * @description угол между двумя векторами
 * @param {number} x0 вектор 1 - X
 * @param {number} y0 вектор 1 - Y
 * @param {number} z0 вектор 1 - Z
 * @param {number} x1 вектор 2 - X
 * @param {number} y1 вектор 2 - Y
 * @param {number} z1 вектор 2 - Z
 * @returns 
 */
const angle2vect = function(x0, y0, z0, x1, y1, z1) {
    const cross_X = y0 * z1 - z0 * y1
    const cross_Y = z0 * x1 - x0 * z1
    const cross_Z = x0 * y1 - x1 * y0

    const dot = x0 * x1 + y0 * y1 + z0 * z1
    const abs_cross = Math.sqrt(cross_X * cross_X + cross_Y * cross_Y + cross_Z * cross_Z)
    const sign = (ORIENT[0] * cross_X + ORIENT[1] * cross_Y + ORIENT[2] * cross_Z > 0) ? 1.0 : -1.0
    return sign * Math.atan(abs_cross / dot)
}
/**
 * @description класс матрицы 3 * 3
 */
class Matrix extends Array {
    constructor() {
        super()
        this[0] = 0
        this[1] = 0
        this[2] = 0
        this[3] = 0
        this[4] = 0
        this[5] = 0
        this[6] = 0
        this[7] = 0
        this[8] = 0
    }
    /**
     * @description сформировать единичную матрицу
     */
    static Identity() {
        const result = new Matrix()
        result[0] = 1
        result[4] = 1
        result[8] = 1
        return result
    }
    /**
     * @description матрица вращения вокруг произвольной оси
     */
    setRotationAxis(V, Th) {
        const CTH = Math.cos(Th)
        const STH = Math.sin(Th)
        const _CTH = 1 - CTH
        const XY = V[0] * V[1]
        const XZ = V[0] * V[2]
        const YZ = V[1] * V[2]
        const XX = V[0] * V[0]
        const YY = V[1] * V[1]
        const ZZ = V[2] * V[2]

        this[0] = CTH + XX * _CTH
		this[1] = XY * _CTH - V[2] * STH
		this[2] = XZ * _CTH + V[1] * STH
        this[3] = XY * _CTH + V[2] * STH
		this[4] = CTH + YY * _CTH
		this[5] = YZ * _CTH - V[0] * STH
        this[6] = XZ * _CTH - V[1] * STH
		this[7] = YZ * _CTH + V[0] * STH
		this[8] = CTH + ZZ * _CTH
    }
    /**
     * @description умножение матрицы на вектор
     */
    matrix2vect(V) {
        return new Vect3D(
            this[0] * V[0] + this[1] * V[1] + this[2] * V[2],
            this[3] * V[0] + this[4] * V[1] + this[5] * V[2],
            this[6] * V[0] + this[7] * V[1] + this[8] * V[2],
        )
    }
}
/**
 * @description класс вектора в трехмерном пространстве
 */
class Vect3D extends Array {
    constructor(X, Y, Z) {
        super()
        this.push(X)
        this.push(Y)
        this.push(Z)
    }
    /**
     * @description задать координаты вектора
     */
    set(X, Y, Z) {
        this[0] = X
        this[1] = Y
        this[2] = Z
    }
    /**
     * @description модуль вектора
     */
    abs() {
        return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2])
    }
    /**
     * @description сумма векторов
     */
    summ(U) {
        return new Vect3D(this[0] + U[0], this[1] + U[1], this[2] + U[2])
    }
    /**
     * @description разность векторов
     */
    subt(U) {
        return new Vect3D(this[0] - U[0], this[1] - U[1], this[2] - U[2])
    }
    /**
     * @description умножение вектора на скаляр
     */
    byScalar(k) {
        return new Vect3D(this[0] * k, this[1] * k, this[2] * k)
    }
    /**
     * @description скалярное произведение векторов
     */
    dot(U) {
        return this[0] * U[0] + this[1] * U[1] + this[2] * U[2]
    }
    /**
     * @description векторное произведение векторов
     */
    cross(U) {
        return new Vect3D(
            this[1] * U[2] - this[2] * U[1],
            this[2] * U[0] - this[0] * U[2],
            this[0] * U[1] - this[1] * U[0]
        )
    }
    /**
     * @description декартово расстояние 
     */
    delta(U) {
        const dX = this[0] - U[0]
        const dY = this[1] - U[1]
        const dZ = this[2] - U[2]
        return Math.sqrt(dX * dX + dY * dY + dZ * dZ)
    }
    /**
     * @description нормализация вектора
     */
    norm() {
        const _abs = 1 / this.abs()
        return new Vect3D(
            this[0] * _abs,
            this[1] * _abs,
            this[1] * _abs,
        )
    }
}
/**
 * @description класс прямой линии
 */
class Line {
    static FromPoints(A, B) {
        const dX = B[0] - A[0]
        const dY = B[1] - A[1]
        const dZ = B[2] - A[2]
        const absDir = (dX * dX + dY * dY + dZ * dZ) ** -0.5

        return new Line(A, [dX * absDir, dY * absDir, dZ * absDir])
    }

    constructor(point, direct) {
        this.point = new Vect3D(point[0], point[1], point[2])
        this.direct = new Vect3D(direct[0], direct[1], direct[2])
    }
}
/**
 * @description класс плоскости
 */
class Plane {
    static FromPoints(A, B, C) {
        const ab_X = B[0] - A[0]
        const ab_Y = B[1] - A[1]
        const ab_Z = B[2] - A[2]

        const bc_X = B[0] - C[0]
        const bc_Y = B[1] - C[1]
        const bc_Z = B[2] - C[2]

        const nX = ab_Y * bc_Z - ab_Z * bc_Y
        const nY = ab_Z * bc_Y - ab_X * bc_Z
        const nZ = ab_X * bc_Y - ab_Y * bc_X
        
        const nAbs = Math.sqrt(nX * nX + nY * nY + nZ * nZ)

        return new Plane(B, [nX / nAbs, nY / nAbs, nZ / nAbs])
    }

    constructor(point, norm) {
        this.point = new Vect3D(point[0], point[1], point[2])
        this.norm  = new Vect3D(norm[0], norm[1], norm[2])
    }

    set(point, norm) {
        this.point[0] = point[0]
        this.point[1] = point[1]
        this.point[2] = point[2]
        
        const nX = norm[0]
        const nY = norm[1]
        const nZ = norm[2]
        const normAbs = Math.sqrt(nX * nX + nY * nY + nZ * nZ)
        this.norm[0] = nX / normAbs
        this.norm[1] = nY / normAbs
        this.norm[2] = nZ / normAbs
    }
    /**
     * @description спроецировать точку на плоскость
     */
    project(P) {
        const nX = this.norm[0]
        const nY = this.norm[1]
        const nZ = this.norm[2]
        
        const delta_norm = (this.point[0] - P[0]) * nX + 
            (this.point[1] - P[1]) * nY + 
            (this.point[2] - P[2]) * nZ
        
        const norm_2 = nX * nX + nY * nY + nZ * nZ
        const t = delta_norm / norm_2
        
        return new Vect3D(
            P[0] + t * nX,
            P[1] + t * nY,
            P[2] + t * nZ,
        )
    }
    /**
     * @description найти пересечение прямой и плоскости
     */
    intersect(L) {
        const nX = this.norm[0]
        const nY = this.norm[1]
        const nZ = this.norm[2]

        const kX = L.direct[0]
        const kY = L.direct[1]
        const kZ = L.direct[2]
        
        const delta_norm = (this.point[0] - P[0]) * nX + 
            (this.point[1] - P[1]) * nY + 
            (this.point[2] - P[2]) * nZ
        
        const norm_dir = nX * kX + nY * kY + nZ * kZ
        const t = delta_norm / norm_dir
        
        return new Vect3D(
            P[0] + t * kX,
            P[1] + t * kY,
            P[2] + t * kZ,
        )
    }
    /**
     * @description угол между двумя плоскостями
     */
    angle(plane2) {
        const n1 = this.norm
        const n2 = plane2.norm
        return angle2vect(
            n1[0], n1[1], n1[2],
            n2[0], n2[1], n2[2],
        )
    }
}
/**
 * @description класс местной системы координат/наблюдателя
 */
class LocalCoordinates {
    constructor(point, OX, center) {
        this.viewPlane = new Plane(point, OX)
       
        const _OX = this.viewPlane.norm
       
        const deltaX = point[0] - center[0]
        const deltaY = point[1] - center[1]
        const deltaZ = point[2] - center[2]
       
        this.OY = new Vect3D(
            _OX[1] * deltaZ - _OX[2] * deltaY,
            _OX[2] * deltaX - _OX[0] * deltaZ,
            _OX[0] * deltaY - _OX[1] * deltaX,
        )
        
        this.OZ = new Vect3D(
            _OX[1] * this.OY[2] - _OX[2] * this.OY[1],
            _OX[2] * this.OY[0] - _OX[0] * this.OY[2],
            _OX[0] * this.OY[1] - _OX[1] * this.OY[0],
        )
    }
    /**
     * перестроить СК под новое размещение
     */
    resetLocalPoint(point, OX, center) {
        this.viewPlane.set(point, OX)
        const _OX = this.viewPlane.norm

        const deltaX = point[0] - center[0]
        const deltaY = point[1] - center[1]
        const deltaZ = point[2] - center[2]
       
        this.OY = new Vect3D(
            _OX[1] * deltaZ - _OX[2] * deltaY,
            _OX[2] * deltaX - _OX[0] * deltaZ,
            _OX[0] * deltaY - _OX[1] * deltaX,
        )
        
        this.OZ = new Vect3D(
            _OX[1] * this.OY[2] - _OX[2] * this.OY[1],
            _OX[2] * this.OY[0] - _OX[0] * this.OY[2],
            _OX[0] * this.OY[1] - _OX[1] * this.OY[0],
        )
    }
    /**
     * @description сменить центральный референтный объект и перестроить локальные координаты
    */
    switchCentralBody(center) {
        const pX = this.viewPlane.point[0]
        const pY = this.viewPlane.point[1]
        const pZ = this.viewPlane.point[2]
        
        const OX_x = this.viewPlane.norm[0]
        const OX_y = this.viewPlane.norm[1]
        const OX_z = this.viewPlane.norm[2]

        const deltaX = pX - center[0]
        const deltaY = pY - center[1]
        const deltaZ = pZ - center[2]

        const OY_raw_x = OX_y * deltaZ - OX_z * deltaY
        const OY_raw_y = OX_z * deltaX - OX_x * deltaZ
        const OY_raw_z = OX_x * deltaY - OX_y * deltaX

        const _absOY = Math.sqrt(OY_raw_x * OY_raw_x + OY_raw_y * OY_raw_y + OY_raw_z * OY_raw_z) 
        
        this.OY = new Vect3D(
            OY_raw_x / _absOY,
            OY_raw_y / _absOY,
            OY_raw_z / _absOY,
        )

        const OZ_raw_x = OX[1] * this.OY[2] - OX[2] * this.OY[1]
        const OZ_raw_y = OX[2] * this.OY[0] - OX[0] * this.OY[2]
        const OZ_raw_z = OX[0] * this.OY[1] - OX[1] * this.OY[0]

        const _absOZ = Math.sqrt(OZ_raw_x * OZ_raw_x + OZ_raw_y * OZ_raw_y + OZ_raw_z * OZ_raw_z) 
        
        this.OZ = new Vect3D(
            OZ_raw_x / _absOZ,
            OZ_raw_y / _absOZ,
            OZ_raw_z / _absOZ,
        )
    }
    /**
     * @description получить углы возвышения и крена
     */
    getPointView(point, vect) {
        const projection = this.viewPlane.project(point)
        const localZero = this.viewPlane.point
        const OX = this.viewPlane.norm
        
        const dX = point[0] - localZero[0]
        const dY = point[1] - localZero[1]
        const dZ = point[2] - localZero[2]

        const dX_gamma = projection[0] - localZero[0]
        const dY_gamma = projection[1] - localZero[1]
        const dZ_gamma = projection[2] - localZero[2]

        const absGamma = Math.sqrt(dX_gamma * dX_gamma + dY_gamma * dY_gamma + dZ_gamma * dZ_gamma)
        vect[0] = dX_gamma / absGamma
        vect[1] = dY_gamma / absGamma
        vect[2] = dZ_gamma / absGamma
        //const alpha = angle2vect(dX,        dY,         dZ,         OX[0],  OX[1],  OX[2])
        //const gamma = angle2vect(dX_gamma,  dY_gamma,   dZ_gamma,   OY[0],  OY[1],  OY[2])
        //return [alpha, gamma]
    }
}

module.exports = { Vect3D, Plane, Line, LocalCoordinates }