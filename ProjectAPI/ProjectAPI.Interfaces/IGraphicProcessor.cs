using System.Collections.Generic;
using Svg;

namespace ProjectAPI.Interfaces
{
    public interface IGraphicProcessor
    {
        public IReadOnlyList<(SvgDocument document, SvgSubGraphic subGraphic)> ExtractSubGraphicsFromSVG();
        public (SvgDocument, SvgGraphicGroup) CreateGraphicGroupFromSubGraphics(string guid, string name);
    }
}