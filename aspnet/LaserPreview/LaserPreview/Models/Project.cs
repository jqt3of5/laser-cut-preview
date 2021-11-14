using System;
using System.Drawing;
using Svg;

namespace LaserPreview.Models
{
    public record Image(
        string guid,
        string mimetype,
        string url,
        Dimension posX,
        Dimension posY,
        Dimension width,
        Dimension height
    );

    public enum LaserMode
    {
        Cut,
        Score,
        Engrave
    }
    /// <summary>
    /// Represents a subset of an SVG that is all the same color. Used to associate a laser mode to a color in an SVG
    /// </summary>
    /// <param name="guid"></param>
    /// <param name="url"></param>
    /// <param name="mimetype"></param>
    /// <param name="posX">Relative to the top left corner of the overall graphic</param>
    /// <param name="posY">Relative to the top left corner of the overall graphic</param>
    /// <param name="width"></param>
    /// <param name="height"></param>
    /// <param name="color"></param>
    /// <param name="mode"></param>
    public record SvgSubGraphic(
        string guid,
        string url,
        Dimension posX,
        Dimension posY,
        Dimension width,
        Dimension height,
        Color color,
        LaserMode mode): Image(guid, "image/svg+xml", url, posX, posY, width, height);
        // LaserMode mode);

    /// <summary>
    /// Represents an original uploaded svg file, and aggregates the synthetic children of the svg 
    /// </summary>
    /// <param name="guid"></param>
    /// <param name="mimetype"></param>
    /// <param name="url"></param>
    /// <param name="posX">The starting x position of the whole image on the canvas</param>
    /// <param name="posY">The starting y position of the whole image on the canvas</param>
    /// <param name="width"></param>
    /// <param name="height"></param>
    /// <param name="originalFileName"></param>
    /// <param name="colorModes"></param>
    public record SvgGraphic(
        string guid,
        string url,
        string name,
        Dimension posX,
        Dimension posY,
        Dimension width,
        Dimension height,
        SvgSubGraphic[] colorModes): Image(guid, "image/svg+xml", url, posX, posY, width, height);

    public record Material(
        string category,
        string id,
        string name,
        string fileName);


    public record PixelConversion(
        double pixels,
        DimensionUnits PerDimensionUnit)
    {
        public Dimension FromPixels(double p)
        {
            return new Dimension(p/ pixels, PerDimensionUnit);
        }

        public double ToPixels(Dimension dimension)
        {
            return dimension.ConvertTo(PerDimensionUnit).value * pixels;
        } 
    }
    public record Dimension(
        double value,
        DimensionUnits unit = DimensionUnits.Centimeters) : IComparable
    {
        public Dimension Add(Dimension dimension)
        {
            var d = dimension.ConvertTo(this.unit);
            return new Dimension(value + d.value, unit);
        }
        
        public Dimension ConvertTo(DimensionUnits dimensionUnit)
        {
            var intermetiate = value;
            switch (this.unit)
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
            
            switch (dimensionUnit)
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

            return new Dimension(intermetiate, dimensionUnit);
        }

        public int CompareTo(object? obj)
        {
            if (obj is Dimension d)
            {
                var n = d.ConvertTo(this.unit);
                if (n.value == value)
                {
                    return 0;
                }

                return value < n.value ? -1 : 1;
            }

            return -1;
        }
    };

    public enum DimensionUnits
    {
        Inches,
        Millimeters,
        Centimeters,
        Picas, 
        Points,
        Pixels
    }
    public static class UnitConversions
    {
        public static DimensionUnits ToUnits(this SvgUnitType unit)
        {
            return unit switch
            {
                SvgUnitType.None =>DimensionUnits.Pixels,
                SvgUnitType.Pixel => DimensionUnits.Pixels,
                SvgUnitType.Em => DimensionUnits.Pixels,
                SvgUnitType.Ex => DimensionUnits.Pixels,
                SvgUnitType.Percentage => DimensionUnits.Pixels,
                SvgUnitType.User => DimensionUnits.Centimeters,
                SvgUnitType.Inch => DimensionUnits.Inches,
                SvgUnitType.Centimeter => DimensionUnits.Centimeters,
                SvgUnitType.Millimeter => DimensionUnits.Millimeters,
                SvgUnitType.Pica => DimensionUnits.Picas,
                SvgUnitType.Point => DimensionUnits.Points,
                _ => throw new ArgumentOutOfRangeException()
            }; 
        }
    }
    public record Project(
        string projectId,
        Material material,
        Dimension boardWidth,
        Dimension boardHeight,
        SvgGraphic [] graphics,
        DimensionUnits DimensionUnits);

    public record MaterialCategory(
        string category,
        Material[] materials);
}