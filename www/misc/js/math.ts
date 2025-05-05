/**
 * @module math
 */

export const PI: number = 3.1415;
export const TAU: number = 6.2832;

export type RGBAColor = [number, number, number, number]; // NOTE: Assumes values 0-1
export type RGBColor = [number, number, number]; // NOTE: Assumes values 0-1

export interface Point {
    x: number;
    y: number;
}

export class Rect {
    leftX: number;
    topY: number;
    width: number;
    height: number;
  
    constructor(leftX: number, topY: number, width: number, height: number) {
        this.leftX = leftX;
        this.topY = topY;
        this.width = width;
        this.height = height;
    }
}

export function isInsideRect(point: Point, rect: Rect): boolean {
    return (
        point.x >= rect.leftX &&
        point.x <= rect.width &&
        point.y >= rect.topY &&
        point.y <= rect.height
    );
}

export function randInt(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min));
}

export function cosFixed(n: number, precision: number = 5): number {
    return parseFloat(Math.cos(n).toFixed(precision));
}

export function sinFixed(n: number, precision: number = 5): number {
    return parseFloat(Math.sin(n).toFixed(precision));
}

export function tanFixed(n: number, precision: number = 5): number {
    return parseFloat(Math.tan(n).toFixed(precision));
}

export function toRadian(degrees: number): number {
    return degrees * (Math.PI / 180.0);
}

export function lerp(a: number, b: number, t: number): number {
    const clampedT = Math.max(0, Math.min(1, t));
    return b * clampedT + a * (1 - clampedT);
}

export function lerpRGBA(src: RGBAColor, dest: RGBAColor, t: number): RGBAColor {
    const clampedT = Math.max(0, Math.min(1, t));
    return [
        lerp(src[0], dest[0], clampedT),
        lerp(src[1], dest[1], clampedT),
        lerp(src[2], dest[2], clampedT),
        src[3] * dest[3],
    ];
}

export function hexToRgb(hex: string): RGBColor | null {
    if (hex.length !== 6) {
      console.error('Invalid hex string length:', hex);
      return null;
    }

    const bigint = parseInt(hex, 16);
    if (isNaN(bigint)) {
        console.error('Invalid hex string characters:', hex);
        return null;
    }

    const r = ((bigint >> 16) & 255) / 255.0;
    const g = ((bigint >> 8) & 255) / 255.0;
    const b = (bigint & 255) / 255.0;

    return [r, g, b];
}