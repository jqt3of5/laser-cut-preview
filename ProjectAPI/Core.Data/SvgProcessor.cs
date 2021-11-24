using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using Core.Data;
using Svg;

namespace LaserPreview.Models
{
    public class SvgProcessor
    {
        public SvgGraphic? CreateGraphicFromSubGraphics(string guid, string name, SvgDocument originalSvg, IEnumerable<(SvgDocument, SvgSubGraphic)> subGraphics)
        {
            //Create the overall graphic object for all the sub graphics. The height/width should contain all child graphics
            if (subGraphics.Select(m => m.Item2).Max(mode => mode.posY.Add(mode.height)) is { } height)
            {
                if (subGraphics.Select(m => m.Item2).Max(mode => mode.posX.Add(mode.width)) is { } width)
                {
                    var widthUnit = originalSvg.Width.Type.ToUnits(); 
                    var heightUnit = originalSvg.Height.Type.ToUnits();
            
                    //TODO: Generate the URL in a smarter way
                    var graphic = new SvgGraphic(guid,   $"/graphic/{guid}/image", name,
                        new Dimension(0, widthUnit), new Dimension(0, heightUnit), 
                        width, height, subGraphics.Select(m => m.Item2).ToArray());
           
                    return graphic; 
                }
            }

            return null;
        }
        public SvgSubGraphic CreateSubGraphicFromSvg(Color color, SvgDocument doc, LaserMode defaultLaserMode = LaserMode.Cut)
        {
            var pxPerWidthUnit = new PixelConversion((double)doc.ViewBox.Width / doc.Width.Value, doc.Width.Type.ToUnits());
            var pxPerHeightUnit = new PixelConversion((double)doc.ViewBox.Height/ doc.Height.Value, doc.Height.Type.ToUnits());
            
            var modeGuid = Guid.NewGuid().ToString();
            return new SvgSubGraphic(modeGuid, $"/graphic/{modeGuid}/image", 
                            pxPerWidthUnit.FromPixels(doc.Bounds.X),
                            pxPerHeightUnit.FromPixels(doc.Bounds.Y),
                                pxPerWidthUnit.FromPixels(doc.Bounds.Width), 
                                pxPerHeightUnit.FromPixels(doc.Bounds.Height),
                                color, defaultLaserMode);
        }
        
        public IEnumerable<(Color, SvgDocument)> ExtractSvgsByColor(SvgDocument svg)
        {
            var objectsByColor = ExtractSvgElementsByColor(svg);

            foreach (var group in objectsByColor)
            {
                var doc = new SvgDocument();
                foreach (var svgElement in group)
                {
                    doc.Children.Add(svgElement);
                }

                doc.ViewBox = new SvgViewBox(doc.Bounds.X, doc.Bounds.Y, doc.Bounds.Width, doc.Bounds.Height);

                var pxPerWidthUnit = (double)svg.ViewBox.Width / svg.Width.Value;
                doc.Width = new SvgUnit(svg.Width.Type, (float)(doc.Bounds.Width / pxPerWidthUnit));
                var pxPerHeightUnit = (double)svg.ViewBox.Height/ svg.Height.Value;
                doc.Height= new SvgUnit(svg.Height.Type, (float)(doc.Bounds.Height / pxPerHeightUnit));

                yield return (group.Key, doc);
            }
        }

        private IEnumerable<IGrouping<Color, SvgElement>> ExtractSvgElementsByColor(SvgElement element)
        {
            Color ColorOfLeaf(SvgElement element)
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

           return  ExtractDrawableElements(element).GroupBy(ColorOfLeaf); 
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