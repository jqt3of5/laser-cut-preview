using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using Svg;
using Svg.ExCSS;

namespace LaserPreview.Models
{
    public class GraphicRepo
    {
        public string UploadDir = "uploads";
        private ConcurrentDictionary<string, Graphic> _graphics = new ConcurrentDictionary<string, Graphic>();
        private ConcurrentDictionary<string, Image> _images = new ConcurrentDictionary<string, Image>();

        private string ImagePath(string imageId, string ext = ".svg")
        {
            return Path.Combine(UploadDir, imageId + ext);
        }
        public Stream GetImageBytes(string graphicId)
        {
            return File.OpenRead(ImagePath(graphicId));
        }

        public Image? GetImage(string imageId)
        {
            if (!_images.ContainsKey(imageId))
            {
                return null;
            }

            return _images[imageId]; 
        }
        
        public Graphic? GetGraphic(string graphicId)
        {
            if (!_graphics.ContainsKey(graphicId))
            {
                return null;
            }

            return _graphics[graphicId];
        }

        private bool SaveStream(Stream stream, int length, string filePath)
        {
            using (var reader = new BinaryReader(stream))
            {
                File.WriteAllBytes(filePath, reader.ReadBytes((int)length));
            }

            return true;
        }
        public Graphic ProcessGraphic(string originalFileName, string mimeType, long length, Stream stream)
        {
            if (!Directory.Exists(UploadDir))
            {
                Directory.CreateDirectory(UploadDir);
            }

            // When we're grouping drawable elements, we really only care about the set color for the actually drawable elements.
            // So traverse the tree until we get to the bottom, and use that color.
            // Assume that there is only ever one child at each level. 
            Color ColorOfLeaf(SvgElement element)
            {
                if (element.Children.Any())
                {
                    return ColorOfLeaf(element.Children.First());
                }
                if (element.Color is SvgColourServer server)
                {
                    return server.Colour;
                }

                return Color.Transparent; 
            }
            var guid = Guid.NewGuid().ToString();
            var originalFilePath = ImagePath(guid, ".original.svg");
                       
            SaveStream(stream, (int)length, originalFilePath);
 
            var originalSvg  = SvgDocument.Open(originalFilePath);
            var objectsByColor = ExtractDrawableElements(originalSvg).GroupBy(ColorOfLeaf);
            
            var pxPerWidthUnit = originalSvg.ViewBox.Width / originalSvg.Width.Value;
            var pxPerHeightUnit = originalSvg.ViewBox.Height/ originalSvg.Height.Value;
            var widthUnit = originalSvg.Width.Type.ToUnits(); 
            var heightUnit = originalSvg.Height.Type.ToUnits(); 

            List<ColorMode> modes = new List<ColorMode>();
            foreach (var group in objectsByColor)
            {
                var svgGroup = new SvgGroup();
                foreach (var svgElement in group)
                {
                    svgGroup.Children.Add(svgElement);
                }

                var doc = new SvgDocument();
                doc.Children.Add(svgGroup);
                doc.ViewBox = new SvgViewBox(svgGroup.Bounds.X, svgGroup.Bounds.Y, svgGroup.Bounds.Width, svgGroup.Bounds.Height);
                doc.Width = new SvgUnit(originalSvg.Width.Type, svgGroup.Bounds.Width / pxPerWidthUnit);
                doc.Height= new SvgUnit(originalSvg.Height.Type, svgGroup.Bounds.Height / pxPerHeightUnit);
                
                var modeGuid = Guid.NewGuid().ToString();
                var modeFilePath = ImagePath(modeGuid);
                doc.Write(modeFilePath); 
                
                var mode = new ColorMode(modeGuid, $"/graphic/{modeGuid}/image", "image/svg+xml", 
                    new Dimension(svgGroup.Bounds.X/pxPerWidthUnit, widthUnit), new Dimension(svgGroup.Bounds.Y/pxPerHeightUnit, heightUnit), 
                    new Dimension(doc.Bounds.Width/pxPerWidthUnit, widthUnit), new Dimension(doc.Bounds.Height/pxPerHeightUnit, heightUnit), 
                    group.Key, LaserMode.Cut);
                
                modes.Add(mode);
                
                _images[modeGuid] = mode;
            }
            
            //TODO: Addition doesn't factor in units. Hopefully they're always the same. 
            var height = modes.Max(mode => mode.posY.value + mode.height.value);
            var width = modes.Max(mode => mode.posX.value + mode.width.value);
            
            //TODO: Generate the URL in a smarter way
            var graphic = new Graphic(guid,  mimeType, $"/graphic/{guid}/image", 
                new Dimension(0, widthUnit), new Dimension(0, heightUnit), 
                new Dimension(width, widthUnit), new Dimension(height, heightUnit),  
                originalFileName, modes.ToArray());
            _graphics[guid] = graphic;
            
            return graphic;
        }

        private IEnumerable<SvgElement> ExtractDrawableElements(SvgElement doc)
        {
            if (doc.Children.Any())
            {
                foreach (var child in doc.Children)
                {
                    foreach (var element in ExtractDrawableElements(child))
                    {
                        //Groups can have transforms on them, so if there are any, we want to maintain them.
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
            else
            {
                //Basically just ignoring SvgGroups for now. Don't really have a need to care about them. 
                if (doc is SvgPath)
                {
                    yield return doc;
                }

                if (doc is SvgCircle)
                {
                    yield return doc;
                }

                if (doc is SvgRectangle)
                {
                    yield return doc;
                }
            }
        }
    }
}