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
        private SvgGraphicGroup CreateGraphicGroup(string guid, string url, string name, Dimension posX, Dimension posY,
            Dimension width, Dimension height, SvgSubGraphic[] subGraphics)
        {
            return new DrawableObjectDto()
            {
                type = nameof(SvgGraphicGroup),
                guid = guid,
                mimetype = "image/svg+xml",
                url = url,
                name = name,
                posX = posX,
                posY = posY,
                width = width,
                height = height,
                //TODO: this feels a bit odd... this dto requires concrete classes to deserialize properly. Maybe we can canvert some other way?
                subGraphics = subGraphics.Cast<SvgSubGraphicDto>().ToArray(),
            };
        }

        private SvgSubGraphic CreateSubGraphic(string guid, string url, Dimension posX, Dimension posY, Dimension width,
            Dimension height, LaserMode mode)
        {
            return new SvgSubGraphicDto()
            {
                type = nameof(SvgSubGraphic),
                guid = guid,
                mimetype = "image/svg+xml",
                url = url,
                posX = posX,
                posY = posY,
                width = width,
                height = height,
                mode = mode
            };
        }

        private readonly SvgDocument _orignalDoc;
        private IReadOnlyList<(SvgDocument document, SvgSubGraphic subGraphic)>? _subgraphicList;

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

        public SvgProcessor(SvgDocument orignalDoc)
        {
            _orignalDoc = orignalDoc;
        }

        public IReadOnlyList<(SvgDocument document, SvgSubGraphic subGraphic)> ExtractSubGraphicsFromSVG()
        {
            var svg = _orignalDoc;
            if (!HasRealUnits(_orignalDoc))
            {
                svg = SetDefaultRealUnits(_orignalDoc);
            }

            var uniqueColors = ExtractColorPairs(svg).Distinct(new PaintServerPairEquality());

            SvgElement ToCommonStroke(SvgElement element)
            {
                var e = element.DeepCopy();
                e.StrokeWidth = 1;
                e.Fill = SvgPaintServer.None;
                e.Stroke = new SvgColourServer(Color.Blue);
                return e;
            }
            var subDocsByColor = uniqueColors
                .Select(color => ExtractDrawableElementsWithColorPair(color, svg)).ToList()
                .Select(elements => elements.Select(ToCommonStroke))
                .Select(group => SvgElementsToDocument(svg, group)).ToList();

            if (!subDocsByColor.Any())
            {
                _subgraphicList = new List<(SvgDocument document, SvgSubGraphic subGraphic)>();
                return _subgraphicList;
            }

            //Sometimes there is space above and to the left, we want the graphic to fit with no empty space around it. 
            var xOffset = subDocsByColor.Min(subdoc => subdoc.ViewBox.MinX);
            var yOffset = subDocsByColor.Min(subdoc => subdoc.ViewBox.MinY);

            _subgraphicList = subDocsByColor.Select(svg => (svg, CreateSubGraphicFromSvg(xOffset, yOffset, svg))).ToList();

            return _subgraphicList;
        }

        public (SvgDocument, SvgGraphicGroup) CreateGraphicGroupFromSubGraphics(string guid, string name)
        {
            if (_subgraphicList == null)
            {
                ExtractSubGraphicsFromSVG();
            }

            //Create the overall graphic object for all the sub graphics. The height/width should contain all child graphics
            //Must maintain aspect ratio, or drawing gets all weird 
            var height = _subgraphicList.Select(m => m.subGraphic).Max(mode => mode.posY.Add(mode.height));
            var width = _subgraphicList.Select(m => m.subGraphic).Max(mode => mode.posX.Add(mode.width));

            var widthUnit = _orignalDoc.Width.Type.ToUnits();
            var heightUnit = _orignalDoc.Height.Type.ToUnits();

            //TODO: Generate the URL in a smarter way
            var graphic = CreateGraphicGroup(guid, $"/graphic/{guid}/image", name,
                new Dimension(0, widthUnit), new Dimension(0, heightUnit),
                width ?? new Dimension(0, widthUnit), height ?? new Dimension(0, heightUnit),
                _subgraphicList.Select(m => m.subGraphic).ToArray());

            SvgDocument groupDoc = new SvgDocument();
            foreach (var (subDoc, subGraphic) in _subgraphicList)
            {
                foreach (var child in subDoc.Children)
                {
                    groupDoc.Children.Add(child);
                }
            }

            groupDoc.ViewBox = new SvgViewBox(groupDoc.Bounds.X, groupDoc.Bounds.Y, groupDoc.Bounds.Width,
                groupDoc.Bounds.Height);
            groupDoc.Width = new SvgUnit(_orignalDoc.Width.Type, (float) (width?.value ?? 0));
            groupDoc.Height = new SvgUnit(_orignalDoc.Height.Type, (float) (height?.value ?? 0));

            return (groupDoc, graphic);
        }

        private SvgSubGraphic CreateSubGraphicFromSvg(float offsetX, float offsetY, SvgDocument doc,
            LaserMode defaultLaserMode = LaserMode.Cut)
        {
            var pxPerWidthUnit =
                new PixelConversion((double) doc.ViewBox.Width / doc.Width.Value, doc.Width.Type.ToUnits());
            var pxPerHeightUnit =
                new PixelConversion((double) doc.ViewBox.Height / doc.Height.Value, doc.Height.Type.ToUnits());

            var modeGuid = Guid.NewGuid().ToString();
            //TODO: Generate the URL in a smarter way
            return CreateSubGraphic(modeGuid, $"/graphic/{modeGuid}/image",
                pxPerWidthUnit.FromPixels(doc.Bounds.X - offsetX),
                pxPerHeightUnit.FromPixels(doc.Bounds.Y - offsetY),
                pxPerWidthUnit.FromPixels(doc.Bounds.Width),
                pxPerHeightUnit.FromPixels(doc.Bounds.Height),
                defaultLaserMode);
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

            if (doc is SvgPath || doc is SvgCircle || doc is SvgRectangle || doc is SvgPolygon)
            {
                yield return (doc.Fill, doc.Stroke);
            }
        }

        public IEnumerable<SvgElement> ExtractDrawableElementsWithColorPair(
            (SvgPaintServer fill, SvgPaintServer stroke) color, SvgElement doc)
        {
            if (doc is SvgPath || doc is SvgCircle || doc is SvgRectangle || doc is SvgPolygon)
            {
                PaintServersEquality equality = new();
                if (equality.Equals(doc.Fill, color.fill) && equality.Equals(doc.Stroke, color.stroke))
                {
                    yield return doc;
                }
            }

            //We want to maintain groups
            if (doc is SvgGroup group)
            {
                var g = group.DeepCopy();
                g.Children.Clear();

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

        // public SvgElement SetToLaserMode(LaserMode mode)
        // {
        //     
        // }
        //

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