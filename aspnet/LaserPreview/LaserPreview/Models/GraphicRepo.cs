using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using Svg;

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

        public Graphic ProcessGraphic(string originalFileName, string mimeType, long length, Stream stream)
        {
            if (!Directory.Exists(UploadDir))
            {
                Directory.CreateDirectory(UploadDir);
            }

            var guid = Guid.NewGuid().ToString();

            var originalFilePath = ImagePath(guid, ".original.svg");
            using (var reader = new BinaryReader(stream))
            {
                File.WriteAllBytes(originalFilePath, reader.ReadBytes((int)length));
            }

            var originalSvg  = SvgDocument.Open(originalFilePath);

            Color LeafMostColor(SvgElement element)
            {
                if (element.Children.Any())
                {
                    return LeafMostColor(element.Children.First());
                }
                if (element.Color is SvgColourServer server)
                {
                    return server.Colour;
                }

                return Color.Transparent; 
            }
            var objectsByColor = ExtractDrawableElements(originalSvg ).GroupBy(LeafMostColor);

            var fullSvgGroup = new SvgGroup();
            List<ColorMode> modes = new List<ColorMode>();
            foreach (var group in objectsByColor)
            {
                var svgGroup = new SvgGroup();
                foreach (var svgElement in group)
                {
                    svgGroup.Children.Add(svgElement);
                    fullSvgGroup.Children.Add(svgElement);
                }

                var doc = new SvgDocument();
                doc.Children.Add(svgGroup);
                doc.ViewBox = originalSvg.ViewBox;
                doc.Width = originalSvg.Width;
                doc.Height = originalSvg.Height;
                
                var modeGuid = Guid.NewGuid().ToString();
                var modeFilePath = ImagePath(modeGuid);
                doc.Write(modeFilePath); 
                
                var mode = new ColorMode(modeGuid, $"/graphic/{modeGuid}/image", "image/svg+xml", 0, 0, doc.Bounds.Width, doc.Bounds.Height, group.Key, "Cut");
                modes.Add(mode);
                
                _images[modeGuid] = mode;
            }

            //TODO: SVGs can have physical dimensions attached to them. We should try to read and respect these on the canvas. 
            //TODO: If the original SVG has a bunch of padding and such, we don't currently remove any of that. 
            //TODO: Generate the URL in a smarter way
            var fullSvgDoc = new SvgDocument();
            fullSvgDoc.Children.Add(fullSvgGroup);
            fullSvgDoc.ViewBox = originalSvg.ViewBox;
            fullSvgDoc.Width = originalSvg.Width;
            fullSvgDoc.Height = originalSvg.Height;
             
            var fullSvgFilePath = ImagePath(guid);
            fullSvgDoc.Write(fullSvgFilePath);
            var graphic = new Graphic(guid,  mimeType, $"/graphic/{guid}/image", 0, 0, fullSvgDoc.Bounds.Width, fullSvgDoc.Bounds.Height,originalFileName, modes.ToArray());
            _graphics[guid] = graphic;
            _images[guid] = graphic;
            
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