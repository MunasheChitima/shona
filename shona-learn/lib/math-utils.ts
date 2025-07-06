/**
 * Mathematical utilities for machine learning operations
 */

export class Matrix {
  private data: number[][]
  private rows: number
  private cols: number

  constructor(data: number[][]) {
    this.data = data
    this.rows = data.length
    this.cols = data[0]?.length || 0
  }

  multiply(vector: Vector): Vector {
    if (this.cols !== vector.length) {
      throw new Error('Matrix columns must match vector length')
    }

    const result: number[] = []
    for (let i = 0; i < this.rows; i++) {
      let sum = 0
      for (let j = 0; j < this.cols; j++) {
        sum += this.data[i][j] * vector.get(j)
      }
      result.push(sum)
    }

    return new Vector(result)
  }

  static identity(size: number): Matrix {
    const data: number[][] = []
    for (let i = 0; i < size; i++) {
      data[i] = []
      for (let j = 0; j < size; j++) {
        data[i][j] = i === j ? 1 : 0
      }
    }
    return new Matrix(data)
  }
}

export class Vector {
  private data: number[]
  public length: number

  constructor(data: number[]) {
    this.data = data
    this.length = data.length
  }

  get(index: number): number {
    return this.data[index]
  }

  add(other: Vector): Vector {
    if (this.length !== other.length) {
      throw new Error('Vectors must have same length')
    }

    return new Vector(
      this.data.map((val, i) => val + other.get(i))
    )
  }

  map(fn: (value: number) => number): Vector {
    return new Vector(this.data.map(fn))
  }

  mean(): number {
    return this.data.reduce((sum, val) => sum + val, 0) / this.length
  }

  dot(other: Vector): number {
    if (this.length !== other.length) {
      throw new Error('Vectors must have same length')
    }

    return this.data.reduce((sum, val, i) => sum + val * other.get(i), 0)
  }

  magnitude(): number {
    return Math.sqrt(this.data.reduce((sum, val) => sum + val * val, 0))
  }
}

export class Statistics {
  static standardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  static correlationCoefficient(x: number[], y: number[]): number {
    if (x.length !== y.length) {
      throw new Error('Arrays must have same length')
    }

    const n = x.length
    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = y.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0)
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return numerator / denominator
  }

  static exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
    const smoothed: number[] = [data[0]]
    
    for (let i = 1; i < data.length; i++) {
      smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1])
    }

    return smoothed
  }
}