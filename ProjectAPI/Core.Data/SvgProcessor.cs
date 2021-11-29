using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
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
            var ratio = (double)doc.ViewBox.Height / doc.ViewBox.Width;
            doc.Width = new SvgUnit(defaultUnit, doc.ViewBox.Width);
            doc.Height = new SvgUnit(defaultUnit, (float)(doc.ViewBox.Width* ratio));
            return doc;
        }
        
        public SvgProcessor(SvgDocument orignalDoc)
        {
            _orignalDoc = orignalDoc;
        }

        public IReadOnlyList<(SvgDocument document, SvgSubGraphic subGraphic)> ExtractSubGraphics()
        {
            var svg = _orignalDoc;
            if (!HasRealUnits(_orignalDoc))
            {
                svg = SetDefaultRealUnits(_orignalDoc);
            }
            var drawableElements= ExtractDrawableElements(svg).ToList();
            
            var subDocsByColor = drawableElements
                .GroupBy(ColorOfLeaf)
                .Select(group => (Color: group.Key, Doc: SvgElementsToDocument(svg, group))).ToList();
            
            if (!subDocsByColor.Any())
            {
                _subgraphicList = new List<(SvgDocument document, SvgSubGraphic subGraphic)>();
                return _subgraphicList;
            }

            //Sometimes there is space above and to the left, we want the graphic to fit with no empty space around it. 
            var xOffset = subDocsByColor.Min(subdoc => subdoc.Doc.ViewBox.MinX);
            var yOffset = subDocsByColor.Min(subdoc => subdoc.Doc.ViewBox.MinY);

            _subgraphicList = subDocsByColor.Select(
                svg => (svg.Doc, CreateSubGraphicFromSvg(xOffset, yOffset, svg.Color, svg.Doc))).ToList();
            
            return _subgraphicList;
        }

        public SvgGraphic? CreateGraphicFromSubGraphics(string guid, string name)
        {
            if (_subgraphicList == null)
            {
                ExtractSubGraphics();
            }
            
            //Create the overall graphic object for all the sub graphics. The height/width should contain all child graphics
            //Must maintain aspect ratio, or drawing gets all weird 
            var height = _subgraphicList.Select(m => m.subGraphic).Max(mode => mode.posY.Add(mode.height));
            var width = _subgraphicList.Select(m => m.subGraphic).Max(mode => mode.posX.Add(mode.width));
           
            
            
            
            var widthUnit = _orignalDoc.Width.Type.ToUnits(); 
            var heightUnit = _orignalDoc.Height.Type.ToUnits();

            //TODO: Generate the URL in a smarter way
            var graphic = new SvgGraphic(guid,   $"/graphic/{guid}/image", name,
                new Dimension(0, widthUnit), new Dimension(0, heightUnit), 
                width ?? new Dimension(0, widthUnit), height?? new Dimension(0, heightUnit),0,
                _subgraphicList.Select(m => m.subGraphic).ToArray());

            return graphic; 
        }
        private SvgSubGraphic CreateSubGraphicFromSvg(float offsetX, float offsetY, Color color, SvgDocument doc, LaserMode defaultLaserMode = LaserMode.Cut)
        {
            var pxPerWidthUnit = new PixelConversion((double)doc.ViewBox.Width / doc.Width.Value, doc.Width.Type.ToUnits());
            var pxPerHeightUnit = new PixelConversion((double)doc.ViewBox.Height/ doc.Height.Value, doc.Height.Type.ToUnits());
            
            var modeGuid = Guid.NewGuid().ToString();
            //TODO: Generate the URL in a smarter way
            return new SvgSubGraphic(modeGuid, $"/graphic/{modeGuid}/image", 
                            pxPerWidthUnit.FromPixels(doc.Bounds.X - offsetX),
                            pxPerHeightUnit.FromPixels(doc.Bounds.Y - offsetY),
                                pxPerWidthUnit.FromPixels(doc.Bounds.Width), 
                                pxPerHeightUnit.FromPixels(doc.Bounds.Height),
                                color, defaultLaserMode);
        }
        
        private SvgDocument SvgElementsToDocument(SvgDocument fullSvg, IGrouping<Color, SvgElement> groupedElements)
        {
            var doc = new SvgDocument();
            foreach (var svgElement in groupedElements)
            {
                doc.Children.Add(svgElement);
            }

            doc.ViewBox = new SvgViewBox(doc.Bounds.X, doc.Bounds.Y, doc.Bounds.Width, doc.Bounds.Height);

            var pxPerWidthUnit = (double)fullSvg.ViewBox.Width / fullSvg.Width.Value;
            doc.Width = new SvgUnit(fullSvg.Width.Type, (float)(doc.Bounds.Width / pxPerWidthUnit));
            var pxPerHeightUnit = (double)fullSvg.ViewBox.Height/ fullSvg.Height.Value;
            doc.Height= new SvgUnit(fullSvg.Height.Type, (float)(doc.Bounds.Height/ pxPerHeightUnit));

            return doc;
        }

        private Color ColorOfLeaf(SvgElement element)
        {
            //Always assumes there is only one child ever. OR that all children are the same color. 
            if (element.Children.Any())
            {
                return ColorOfLeaf(element.Children.First());
            }

            if (element.Stroke != SvgPaintServer.None && element.Stroke is SvgColourServer strokeServer)
            {
                return strokeServer.Colour;
            }
            
            if (element.Fill != SvgPaintServer.None && element.Fill is SvgColourServer fillServer)
            {
                return fillServer.Colour;
            }

            return Color.Transparent; 
        }

        private IEnumerable<SvgElement> ExtractDrawableElements(SvgElement doc)
        {
            if (doc.Children.Any())
            {
                foreach (var child in doc.Children)
                {
                    foreach (var element in ExtractDrawableElements(child))
                    {
                        //Groups can have transforms on them, so if there are any, we want to maintain them for each element.
                        if (child is SvgGroup group)
                        {
                            if (group.Transforms != null && group.Transforms.Any())
                            {
                                var g = group.DeepCopy();
                                g.Children.Clear(); 
                                g.Children.Add(element);
                                yield return g;
                                continue;
                            }
                        }
                        yield return element;
                    }
                }
            }
            
            if (doc is SvgPath || doc is SvgCircle || doc is SvgRectangle || doc is SvgPolygon)
            {
                foreach (var element in SeparateFillFromStroke(doc))
                {
                    yield return element;
                }                
            }

            IEnumerable<SvgElement> SeparateFillFromStroke(SvgElement element)
            {
                if (element.Fill != null && element.Fill != SvgPaintServer.None)
                {
                    var fill = element.DeepCopy();
                    fill.Stroke = SvgPaintServer.None;
                    fill.StrokeWidth = 0;
                    yield return fill;
                }
                
                if (element.Stroke != null && element.Stroke != SvgPaintServer.None)
                {
                    var stroke = element.DeepCopy();
                    stroke.Fill = null;
                    stroke.FillOpacity = 0;
                    yield return stroke;
                } 
            }
        }
    }
}