using System.Collections.Generic;
using Svg;

namespace ProjectAPI.Interfaces
{
    public interface IGraphicProcessor
    {
        public IReadOnlyList<(SvgDocument document, SvgSubGraphic subGraphic)> ExtractSubGraphics();
        public SvgGraphic? CreateGraphicFromSubGraphics(string guid, string name);
    }
}