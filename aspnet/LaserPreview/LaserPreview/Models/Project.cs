namespace LaserPreview.Models
{
    // public enum LaserMode
    // {
        // Cut,
        // Score,
        // Engrave
    // }

    public record ColorMode(
        string color,
        string guid,
        string url,
        string mode);
        // LaserMode mode);

    public record Graphic(
        string guid,
        string name,
        string mimetype,
        string url,
        ColorMode[] colorModes,
        float posX,
        float posY,
        float width,
        float height);

    public record Material(
        string category,
        string id,
        string name,
        string fileName);

    public record Project(
        string projectId,
        Material material,
        Graphic [] graphics);

    public record MaterialCategory(
        string category,
        Material[] materials);
}