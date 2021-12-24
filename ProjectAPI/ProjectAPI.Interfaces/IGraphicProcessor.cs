using System.Collections.Generic;
using Svg;

namespace ProjectAPI.Interfaces
{
    public interface IGraphicProcessor
    {
        public IReadOnlyList<SvgDocument> ExtractSubGraphicsFromSVG();
        public SvgDocument CreateGraphicGroupFromSubGraphics();
    }
}