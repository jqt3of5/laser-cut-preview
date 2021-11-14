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
    public record ColorMode(
        string guid,
        string url,
        string mimetype,
        Dimension posX,
        Dimension posY,
        Dimension width,
        Dimension height,
        Color color,
        LaserMode mode): Image(guid, mimetype, url, posX, posY, width, height);
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
    public record Graphic(
        string guid,
        string mimetype,
        string url,
        Dimension posX,
        Dimension posY,
        Dimension width,
        Dimension height,
        string originalFileName,
        ColorMode[] colorModes): Image(guid, mimetype, url, posX, posY, width, height);

    public record Material(
        string category,
        string id,
        string name,
        string fileName);


    public record Dimension(
        float value,
        Units unit = Units.Centimeters);

    public enum Units
    {
        Inches,
        Millimeters,
        Centimeters,
        Pixels
    }
    public static class UnitConversions
    {
        public static Units ToUnits(this SvgUnitType unit)
        {
            return unit switch
            {
                SvgUnitType.None =>Units.Pixels,
                SvgUnitType.Pixel => Units.Pixels,
                SvgUnitType.Em => Units.Pixels,
                SvgUnitType.Ex => Units.Pixels,
                SvgUnitType.Percentage => Units.Pixels,
                SvgUnitType.User => Units.Centimeters,
                SvgUnitType.Inch => Units.Inches,
                SvgUnitType.Centimeter => Units.Centimeters,
                SvgUnitType.Millimeter => Units.Millimeters,
                SvgUnitType.Pica => Units.Pixels,
                SvgUnitType.Point => Units.Pixels,
                _ => throw new ArgumentOutOfRangeException()
            }; 
        }
    }
    public record Project(
        string projectId,
        Material material,
        Dimension boardWidth,
        Dimension boardHeight,
        Graphic [] graphics,
        Units units);

    public record MaterialCategory(
        string category,
        Material[] materials);
}