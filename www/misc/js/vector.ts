/**
 * @module vector
 */

export class V2 {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
      this.x = x;
      this.y = y;
    }

    add(v: V2): V2 {
        return new V2(this.x + v.x, this.y + v.y);
    }

    addVal(val: number): V2 {
        return new V2(this.x + val, this.y + val);
    }
  
    sub(v: V2): V2 {
        return new V2(this.x - v.x, this.y - v.y);
    }
  
    subVal(val: number): V2 {
        return new V2(this.x - val, this.y - val);
    }
  
    mul(v: V2): V2 {
        return new V2(this.x * v.x, this.y * v.y);
    }
  
    mulVal(val: number): V2 {
        return new V2(this.x * val, this.y * val);
    }
  
    div(v: V2): V2 {
        if (v.x === 0 || v.y === 0)
            throw new Error('Division by zero in V2.div');

        return new V2(this.x / v.x, this.y / v.y);
    }
  
    divVal(val: number): V2 {
        if (val === 0)
            throw new Error('Division by zero in V2.divVal');

        return new V2(this.x / val, this.y / val);
    }
  
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y); // Correct implementation
    }

    magnitude(): number {
        return this.length();
    }
  
    dot(v: V2): number {
        return this.x * v.x + this.y * v.y;
    }
  
    normalize(): V2 {
        const len = this.length();
        if (len === 0)
            return new V2(0, 0);

        return this.divVal(len);
    }
  
    toArray(): [number, number] {
        return [this.x, this.y];
    }
  
    clone(): V2 {
        return new V2(this.x, this.y);
    }
  
    equal(v: V2): boolean {
        return this.x === v.x && this.y === v.y;
    }
}

export class V3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v: V3): V3;
    add(val: number): V3;
    add(vOrVal: V3 | number): V3 {
        if (vOrVal instanceof V3)
            return new V3(this.x + vOrVal.x, this.y + vOrVal.y, this.z + vOrVal.z);
        else
            return new V3(this.x + vOrVal, this.y + vOrVal, this.z + vOrVal);
    }
  
    sub(v: V3): V3;
    sub(val: number): V3;
    sub(vOrVal: V3 | number): V3 {
        if (vOrVal instanceof V3)
            return new V3(this.x - vOrVal.x, this.y - vOrVal.y, this.z - vOrVal.z);
        else
            return new V3(this.x - vOrVal, this.y - vOrVal, this.z - vOrVal);
    }
  
    mul(v: V3): V3;
    mul(val: number): V3;
    mul(vOrVal: V3 | number): V3 {
        if (vOrVal instanceof V3)
            return new V3(this.x * vOrVal.x, this.y * vOrVal.y, this.z * vOrVal.z);
        else
            return new V3(this.x * vOrVal, this.y * vOrVal, this.z * vOrVal);
    }

    div(v: V3): V3;
    div(val: number): V3;
    div(vOrVal: V3 | number): V3 {
        if (vOrVal instanceof V3) {
            if (vOrVal.x === 0 || vOrVal.y === 0 || vOrVal.z === 0) {
                throw new Error('Division by zero in V3.div (vector)');
        }

        return new V3(this.x / vOrVal.x, this.y / vOrVal.y, this.z / vOrVal.z);
        } else {
            if (vOrVal === 0) {
                throw new Error('Division by zero in V3.div (scalar)');
            }

            return new V3(this.x / vOrVal, this.y / vOrVal, this.z / vOrVal);
        }
    }

    dot(v: V3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    length(): number {
        return Math.sqrt(this.dot(this));
    }

    magnitude(): number {
        return this.length();
    }

    normalize(): V3 {
        const len = this.length();
        if (len === 0)
            return new V3(0, 0, 0);

        return this.div(len);
    }

    toArray(): [number, number, number] {
        return [this.x, this.y, this.z];
    }

    clone(): V3 {
        return new V3(this.x, this.y, this.z);
    }

    equal(v: V3): boolean {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }

    static cross(a: V3, b: V3): V3 {
        const x = a.y * b.z - a.z * b.y;
        const y = a.z * b.x - a.x * b.z;
        const z = a.x * b.y - a.y * b.x;

        return new V3(x, y, z);
    }
}