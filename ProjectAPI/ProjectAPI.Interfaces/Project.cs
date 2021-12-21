using System;
using System.Drawing;

namespace ProjectAPI.Interfaces
{
    public enum LaserMode
    {
        Cut,
        Score,
        Engrave
    }
    
    //The react side has distriminated unions, so I'm using this dto to transfer any instance of an object, using "type" as the differentiating parameter
    public record DrawableObjectDto() : DrawableObject, TextObject, SvgSubGraphic, SvgGraphicGroup
    {
        public string type { init; get; }
        public string text { init; get; }
        public string font { init; get; }
        public int fontSize { init; get; }
        public string guid { init; get; }
        public string mimetype { init; get; }
        public string url { init; get; }
        public string name { init; get; }
        public Dimension posX { init; get; }
        public Dimension posY { init; get; }
        public Dimension width { init; get; }
        public Dimension height { init; get; }
        public float angle { init; get; }
        public SvgSubGraphicDto[] subGraphics { init; get; }
        public LaserMode mode { init; get; }
    }
    
    public interface DrawableObject
    {
        string type { get; }
        Dimension posX { get; }
        Dimension posY { get; }
        Dimension width { get; } 
        Dimension height { get; }
    }

    public interface TextObject
    {
        string text { get; }
        string font { get;  }
        int fontSize { get; }
        LaserMode mode { get; }
        Dimension posX { get; }
        Dimension posY { get; }
        Dimension width { get; }
        Dimension height { get; }
        // string type { get; } = nameof(TextObject);
    }

    public interface ImageObject : DrawableObject
    {
        string guid{ get; }
        string mimetype{ get; }
        string url{ get; }
        Dimension posX{ get; }
        Dimension posY{ get; }
        Dimension width{ get; }
        Dimension height{ get; }
        // public string type { get; } = nameof(ImageObject);
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
    public interface SvgSubGraphic : ImageObject
    {
        string guid { get; }
        string url{ get; }
        Dimension posX{ get; }
        Dimension posY{ get; }
        Dimension width{ get; }
        Dimension height{ get; }
        LaserMode mode{ get; } 
        // : ImageObject(guid, "image/svg+xml", url, posX, posY, width, height)
        // public string type { get; } = nameof(SvgSubGraphic);
    }

    public record SvgSubGraphicDto : SvgSubGraphic
    {
        public string type { init; get; }
        public string guid { init; get; }
        public string mimetype { init; get; }
        public string url { init; get; }
        public Dimension posX { init; get; }
        public Dimension posY { init; get; }
        public Dimension width { init; get; }
        public Dimension height { init; get; }
        public Color color { init; get; }
        public LaserMode mode { init; get; }
    }

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
        /// <param name="subGraphics"></param>
        public interface SvgGraphicGroup : ImageObject
        {
            string guid{ get; }
            string url{ get; }
            string name{ get; }
            Dimension posX{ get; }
            Dimension posY{ get; }
            Dimension width{ get; }
            Dimension height{ get; }
            float angle{ get; }
            SvgSubGraphicDto[] subGraphics{ get; } 
            // : ImageObject(guid, "image/svg+xml", url, posX, posY, width, height)
            // public string type { get; } = nameof(SvgGraphicGroup);
        }

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
                if (Math.Abs(n.value - value) < 0.0001)
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

    public record Project(
        string projectId,
        Material material,
        Dimension boardWidth,
        Dimension boardHeight,
        DrawableObjectDto [] objects,
        DimensionUnits DimensionUnits)
    {
        public bool readOnly = false;
    }

    public record MaterialCategory(
        string category,
        Material[] materials);
}