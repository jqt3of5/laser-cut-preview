export enum DimensionUnits {
    Inches,
    Millimeters,
    Centimeters,
    Picas,
    Points,
    Pixels
}

export class Dimension {
    constructor(
        public value : number,
        public unit : DimensionUnits) {}
}

export function MultScaler(a : Dimension, s : number) : Dimension
{
   return new Dimension(a.value * s, a.unit)
}
export function AddDimensions(a : Dimension, b: Dimension) : Dimension
{
    let c = ConvertTo(b, a.unit)
    return new Dimension(c.value + a.value, a.unit)
}

export function ConvertTo(d : Dimension, unit: DimensionUnits ): Dimension
{
    if (unit === d.unit)
    {
        return d
    }

    var intermetiate = d.value;
    switch (d.unit)
    {
        case DimensionUnits.Centimeters:
            break;
        case DimensionUnits.Millimeters:
            intermetiate = intermetiate / 10;
            break;
        case DimensionUnits.Inches:
            intermetiate = intermetiate * 2.54;
            break;
        case DimensionUnits.Points:
            intermetiate = intermetiate / 72 * 2.54;
            break;
        case DimensionUnits.Picas:
            intermetiate = intermetiate / 6 * 2.54;
            break;
        case DimensionUnits.Pixels:
            break;
    }

    switch (unit)
    {
        case DimensionUnits.Centimeters:
            break;
        case DimensionUnits.Millimeters:
            intermetiate = intermetiate * 10;
            break;
        case DimensionUnits.Inches:
            intermetiate = intermetiate / 2.54;
            break;
        case DimensionUnits.Points:
            intermetiate = intermetiate * 72 / 2.54;
            break;
        case DimensionUnits.Picas:
            intermetiate = intermetiate * 6 / 2.54;
            break;
        case DimensionUnits.Pixels:
            break;
    }
    return new Dimension(intermetiate, unit)
}

export function ToPixels(d : Dimension, pxPerUnit : number, unit : DimensionUnits) : number {
    return ConvertTo(d, unit).value * pxPerUnit
}
export function FromPixels(pixels: number, pxPerUnit : number, unit : DimensionUnits) : Dimension {
    return new Dimension(pixels / pxPerUnit, unit)
}

export function ToUnitName(unit : DimensionUnits) : string
{
    switch(unit)
    {
        case DimensionUnits.Millimeters:
            return "mm"
        case DimensionUnits.Inches:
            return "in"
        case DimensionUnits.Centimeters:
            return "cm"
        case DimensionUnits.Pixels:
            return "px"
        case DimensionUnits.Picas:
            return "pi"
        case DimensionUnits.Points:
            return "pt"
    }
}