using System.Drawing;

namespace LaserPreview.Models
{
    // public enum LaserMode
    // {
        // Cut,
        // Score,
        // Engrave
    // }

    public record Image(
        string guid,
        string mimetype,
        string url 
    );
    public record ColorMode(
        string guid,
        string url,
        string mimetype,
        float posX,
        float posY,
        float width,
        float height,
        
        Color color,
        string mode): Image(guid, mimetype, url);
        // LaserMode mode);

    /// <summary>
    /// Represents an original uploaded svg file, and aggregates the synthetic children of the svg 
    /// </summary>
    /// <param name="guid"></param>
    /// <param name="mimetype"></param>
    /// <param name="url"></param>
    /// <param name="posX">The x position of the whole image on the canvas</param>
    /// <param name="posY">The y position of the whole image on the canvas</param>
    /// <param name="width"></param>
    /// <param name="height"></param>
    /// <param name="originalFileName"></param>
    /// <param name="colorModes"></param>
    public record Graphic(
        string guid,
        string mimetype,
        string url,
        float posX,
        float posY,
        float width,
        float height,
        
        string originalFileName,
        ColorMode[] colorModes): Image(guid, mimetype, url);

    public record Material(
        string category,
        string id,
        string name,
        string fileName);

    public record Dimension(
        float width,
        float height);

    public enum Units
    {
        Metric,
        Imperial
    }
    public record Project(
        string projectId,
        Material material,
        Dimension boardDimension,
        Graphic [] graphics,
        Units units);

    public record MaterialCategory(
        string category,
        Material[] materials);
}