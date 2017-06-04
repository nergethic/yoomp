"use strict";
// NO DEPENDENCIES

function V2(x, y) {
    this.x = x
    this.y = y

    this.add = (v) => {
        return new V2(this.x + v.x, this.y + v.y)
    }

    this.addVal = (val) => {
        return new V2(this.x + val, this.y + val)
    }

    this.sub = (v) => {
        return new V2(this.x - v.x, this.y - v.y)
    }

    this.subVal = (val) => {
        return new V2(this.x - val, this.y - val)
    }

    this.mul = (v) => {
        return new V2(this.x * v.x, this.y * v.y)
    }

    this.mulVal = (val) => {
        return new V2(this.x * val, this.y * val)
    }

    this.div = (v) => {
        if (v.x != 0 && v.y != 0)
            return new V2(this.x / v.x, this.y / v.y)
        else {
            // Logger.logError(gs, "division by zero") // TODO
            return ReturnCode.Error
        }
    }

    this.divVal = (val) => {
        if (val == 0) {
            // Logger.logError(gs, "division by zero") // TODO
            return ReturnCode.Error
        }
        
        return new V2(this.x / val, this.y / val)
    }

    this.length = () => {
        // return Math.sqrt(this.dot(this))
    }

    this.length = () => {
        return new V2(Math.sqrt())
    }

    this.toArray = () => {
        return [this.x, this.y]
    }

    this.clone = () => {
        return new V2(this.x, this.y)
    }

    this.equal = (v) => {
        if (this.x == v.x && this.y == v.y)
            return true
        else
            return false
    }
}

function V3(x, y, z) {
    this.x = x
    this.y = y
    this.z = z

    this.add = (v) => {
        if (typeof(v) == "object")
            return new V3(this.x + v.x, this.y + v.y, this.z + v.z)
        else
            return new V3(this.x + v, this.y + v, this.z + v)
    }

    this.sub = (v) => {
        if (typeof(v) == "object")
            return new V3(this.x - v.x, this.y - v.y, this.z - v.z)
        else
            return new V3(this.x - v, this.y - v, this.z - v)
    }

    this.mul = (v) => {
        if (typeof(v) == "object")
            return new V3(this.x * v.x, this.y * v.y, this.z * v.z)
        else
            return new V3(this.x * v, this.y * v, this.z * v)
    }

    this.div = (v) => {
        if (typeof(v) == "object") {
            if (v.x != 0 && v.y != 0 && v.z != 0) {
                return new V3(this.x / v.x, this.y / v.y, this.z / v.z)
            } else {
                Logger.logError(gs, "division by zero")
                return ReturnCode.Error
            }
        } else if (v == 0) {
            Logger.logError(gs, "division by zero")
            return ReturnCode.Error
        }
        
    }

    this.dot = (v) => {
        return this.x*v.x + this.y*v.y + this.z*v.z
    }

    this.length = () => {
        return Math.sqrt(this.dot(this))
    }

    this.normalize = () => {
        let length = this.length()
        if (length == 0.0) return 0.0

        return new V3(this.x/length, this.y/length, this.z/length)
    }

    this.toArray = () => {
        return [this.x, this.y, this.z]
    }

    this.clone = () => {
        return new V3(this.x, this.y, this.z)
    }

    this.equal = (v) => {
        if (this.x == v.x && this.y == v.y && this.z == v.z)
            return true
        else
            return false
    }
}