using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text.RegularExpressions;
using ProjectAPI.Interfaces;
using Svg;

namespace Core.Data
{
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

    public class SvgProcessor : IGraphicProcessor
    {
        private readonly SvgDocument _orignalDoc;
        private IReadOnlyList<SvgDocument>? _subgraphicList;

        private bool IsDrawable(SvgElement element)
        {
            return element is SvgPath || element is SvgCircle || element is SvgRectangle || element is SvgPolygon;
        }
        private bool IsRealUnit(SvgUnitType unit)
        {
            switch (unit)
            {
                case SvgUnitType.Centimeter:
                case SvgUnitType.Inch:
                case SvgUnitType.Millimeter:
                    // case SvgUnitType.Pica:
                    // case SvgUnitType.Point:
                    return true;
                default:
                    return false;
            }
        }

        private bool HasRealUnits(SvgDocument doc)
        {
            return IsRealUnit(doc.Width.Type) && IsRealUnit(doc.Height.Type);
        }

        private SvgDocument SetDefaultRealUnits(SvgDocument doc,
            SvgUnitType defaultUnit = SvgUnitType.Millimeter)
        {
            var ratio = (double) doc.ViewBox.Height / doc.ViewBox.Width;
            doc.Width = new SvgUnit(defaultUnit, doc.ViewBox.Width);
            doc.Height = new SvgUnit(defaultUnit, (float) (doc.ViewBox.Width * ratio));
            return doc;
        }
        public SvgElement SetColorsForMode(SvgElement element, LaserMode mode = LaserMode.Score)
        {
            if (!element.Children.Any())
            {
                //modify for now 
                // var e = element.DeepCopy();
                element.StrokeWidth = 1;
                switch (mode)
                {
                    case LaserMode.Cut:
                        element.Fill = SvgPaintServer.None;
                        element.Stroke = new SvgColourServer(Color.Blue);
                        break;
                    case LaserMode.Engrave:
                        element.Fill = new SvgColourServer(Color.Black);
                        element.Stroke = SvgPaintServer.None;
                        break;
                    case LaserMode.Score:
                        element.Fill = SvgPaintServer.None;
                        element.Stroke = new SvgColourServer(Color.Black);
                        break;
                }
               
                return element;
            }
            
            foreach (var child in element.Children)
            {
                SetColorsForMode(child, mode);
            }
           
            return element;
        }

        public SvgProcessor(SvgDocument orignalDoc)
        {
            _orignalDoc = orignalDoc;
        }

        public IReadOnlyList<SvgDocument> ExtractSubGraphicsFromSVG()
        {
            if (_subgraphicList != null && _subgraphicList.Any())
            {
                return _subgraphicList;
            }
            
            var svg = _orignalDoc;
            if (!HasRealUnits(_orignalDoc))
            {
                svg = SetDefaultRealUnits(_orignalDoc);
            }

            var uniqueColors = ExtractColorPairs(svg).Distinct(new PaintServerPairEquality());
           
            var subDocsByColor = uniqueColors
                .Select(color => ExtractDrawableElementsWithColorPair(color, svg)).ToList()
                .Select(group => SvgElementsToDocument(svg, group)).ToList();

            if (!subDocsByColor.Any())
            {
                _subgraphicList = new List<SvgDocument>();
                return _subgraphicList;
            }

            _subgraphicList = subDocsByColor.ToList();

            return _subgraphicList;
        }

        public SvgDocument CreateGraphicGroupFromSubGraphics(IReadOnlyList<SvgDocument>? subDocs = null)
        {
            if (subDocs == null)
            {
                subDocs = ExtractSubGraphicsFromSVG();
            }
            
            
            SvgDocument groupDoc = new();
            foreach (var subDoc in subDocs)
            {
                foreach (var child in subDoc.Children)
                {
                    groupDoc.Children.Add(child);
                }
            }

            if (!subDocs.Any())
            {
                return groupDoc;
            }
            
            //Sometimes there is space above and to the left, we want the graphic to fit with no empty space around it. 
            var xOffset = subDocs.Min(subdoc => subdoc.ViewBox.MinX);
            var yOffset = subDocs.Min(subdoc => subdoc.ViewBox.MinY);

            //Grab all the dimensions of the sub documents
            var dimensions = subDocs.Select(doc =>
            {
                var pxPerWidthUnit = (double)doc.ViewBox.Width / doc.Width.Value;
                var pxPerHeightUnit = (double)doc.ViewBox.Height / doc.Height.Value;

                var posX = (doc.Bounds.X - xOffset) / pxPerWidthUnit;
                var posY = (doc.Bounds.Y - yOffset) / pxPerHeightUnit;

                return (posX:new SvgUnit(doc.Width.Type, (float)posX), posY:new SvgUnit(doc.Height.Type,(float)posY), width:doc.Width, height:doc.Width);
            }).ToList();

            //Find the biggest width/height among all of them to decide the final docs dimensions
            var width = new SvgUnit(_orignalDoc.Width.Type, dimensions.Max(d => d.posX + d.width));
            var height = new SvgUnit(_orignalDoc.Height.Type, dimensions.Max(d => d.posY + d.height));

            groupDoc.ViewBox = new SvgViewBox(groupDoc.Bounds.X, groupDoc.Bounds.Y, groupDoc.Bounds.Width,
                groupDoc.Bounds.Height);
            groupDoc.Width = width;
            groupDoc.Height = height;

            return groupDoc;
        }

        private SvgDocument SvgElementsToDocument(SvgDocument fullSvg, IEnumerable<SvgElement> groupedElements)
        {
            var doc = new SvgDocument();
            foreach (var svgElement in groupedElements)
            {
                doc.Children.Add(svgElement);
            }

            doc.ViewBox = new SvgViewBox(doc.Bounds.X, doc.Bounds.Y, doc.Bounds.Width, doc.Bounds.Height);

            var pxPerWidthUnit = (double) fullSvg.ViewBox.Width / fullSvg.Width.Value;
            doc.Width = new SvgUnit(fullSvg.Width.Type, (float) (doc.Bounds.Width / pxPerWidthUnit));
            var pxPerHeightUnit = (double) fullSvg.ViewBox.Height / fullSvg.Height.Value;
            doc.Height = new SvgUnit(fullSvg.Height.Type, (float) (doc.Bounds.Height / pxPerHeightUnit));

            return doc;
        }

        public IEnumerable<(SvgPaintServer?, SvgPaintServer?)> ExtractColorPairs(SvgElement doc)
        {
            if (doc.Children.Any())
            {
                foreach (var child in doc.Children)
                {
                    foreach (var element in ExtractColorPairs(child))
                    {
                        yield return element;
                    }
                }
            }

            if (IsDrawable(doc))
            {
                yield return (doc.Fill, doc.Stroke);
            }
        }

        public IEnumerable<SvgElement> ExtractDrawableElementsWithColorPair(
            (SvgPaintServer fill, SvgPaintServer stroke) color, SvgElement doc)
        {
            if (IsDrawable(doc))
            {
                PaintServersEquality equality = new();
                if (equality.Equals(doc.Fill, color.fill) && equality.Equals(doc.Stroke, color.stroke))
                {
                    yield return doc.DeepCopy();
                }
            }

            //We want to maintain groups
            if (doc is SvgGroup group)
            {
                var g = group.DeepCopy();
                g.Children.Clear();
                //Not really sure what nodes is used for, but sometimes we can have stray nodes and these override children sometimes
                g.Nodes.Clear();

                foreach (var child in doc.Children)
                {
                    foreach (var drawableChild in ExtractDrawableElementsWithColorPair(color, child))
                    {
                        g.Children.Add(drawableChild);
                    }
                }

                if (g.Children.Any())
                {
                    yield return g;
                }
            }
            else
            {
                //This might be a document, we still want to iterate, but not maintain. 
                foreach (var child in doc.Children)
                {
                    foreach (var drawableChild in ExtractDrawableElementsWithColorPair(color, child))
                    {
                        yield return drawableChild;
                    }
                }
            }
        }

        public class PaintServerPairEquality : IEqualityComparer<(SvgPaintServer?, SvgPaintServer?)>
        {
            public bool Equals((SvgPaintServer?, SvgPaintServer?) x, (SvgPaintServer?, SvgPaintServer?) y)
            {
                var equality = new PaintServersEquality();

                return equality.Equals(x.Item1, y.Item1) && equality.Equals(x.Item2, y.Item2);
            }

            public int GetHashCode((SvgPaintServer?, SvgPaintServer?) obj)
            {
                var equality = new PaintServersEquality();
                return HashCode.Combine(equality.GetHashCode(obj.Item1), equality.GetHashCode(obj.Item2));
            }
        }
        public class PaintServersEquality : IEqualityComparer<SvgPaintServer?>
        {
            public int GetHashCode(SvgPaintServer? paintServer)
            {
                if (paintServer == null)
                {
                    return Int32.MinValue;
                }
                
                if (paintServer == SvgPaintServer.Inherit || 
                    paintServer == SvgPaintServer.None ||
                    paintServer == SvgPaintServer.NotSet)
                {
                    return paintServer.GetHashCode();
                }

                if (paintServer is SvgColourServer server)
                {
                    return server.Colour.GetHashCode();
                }

                return paintServer.GetHashCode();
            }

            public bool Equals(SvgPaintServer? serverA, SvgPaintServer? serverB)
            {
                if (serverA == null && serverB == null)
                {
                    return true;
                }

                if (serverA == null || serverB == null)
                {
                    return false;
                }
                
                if (serverA == SvgPaintServer.None && serverB == SvgPaintServer.None)
                {
                    return true;
                }

                if (serverA == SvgPaintServer.None || serverB == SvgPaintServer.None)
                {
                    return false;
                }

                if (serverA == SvgPaintServer.NotSet && serverB == SvgPaintServer.NotSet)
                {
                    return true;
                }

                if (serverA == SvgPaintServer.NotSet || serverB == SvgPaintServer.NotSet)
                {
                    return false;
                }

                //inherit is a littleweird.... let's just say they are equal
                if (serverA == SvgPaintServer.Inherit || serverB == SvgPaintServer.Inherit)
                {
                    return true;
                }
                if (serverA == SvgPaintServer.Inherit || serverB == SvgPaintServer.Inherit)
                {
                    return false;
                }

                if (serverA is SvgColourServer colorServerA)
                {
                    if (serverB is SvgColourServer colourServerB)
                    {
                        return colorServerA.Colour == colourServerB.Colour;
                    }
                }

                return false;
            }
        }
    }
}