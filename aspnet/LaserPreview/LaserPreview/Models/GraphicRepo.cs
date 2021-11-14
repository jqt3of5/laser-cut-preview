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
        private ConcurrentDictionary<string, SvgGraphic> _graphics = new ConcurrentDictionary<string, SvgGraphic>();
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
        
        public SvgGraphic? GetGraphic(string graphicId)
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

        private SvgDocument SetDefaultRealUnits(SvgDocument doc, float defaultWidth = 10,
            SvgUnitType defaultUnit = SvgUnitType.Centimeter)
        {
            var ratio = doc.ViewBox.Height / doc.ViewBox.Width;
            doc.Width = new SvgUnit(defaultUnit, defaultWidth);
            doc.Height = new SvgUnit(defaultUnit, defaultWidth * ratio);
            return doc;
        }

        public SvgGraphic? ProcessGraphic(string name, long length, Stream stream)
        {
            if (!Directory.Exists(UploadDir))
            {
                Directory.CreateDirectory(UploadDir);
            }
            var guid = Guid.NewGuid().ToString();
            //Save the original graphic for future use.
            var originalFilePath = ImagePath(guid, ".original.svg");
            SaveStream(stream, (int)length, originalFilePath);
            
            var originalSvg  = SvgDocument.Open(originalFilePath);
            if (!HasRealUnits(originalSvg))
            {
                originalSvg = SetDefaultRealUnits(originalSvg);
            }

            var processor = new SvgProcessor();
            var modes = processor.ExtractSubGraphicsByColor(originalSvg).Select(svg => (svg.Item2, processor.CreateSubGraphicFromSvg(svg.Item1, svg.Item2))).ToList();

            if (!modes.Any())
            {
                return null;
            }
            
            //Save each sub graphic separately
            foreach (var (doc, colorMode) in modes)
            {
                var modeFilePath = ImagePath(colorMode.guid);
                doc.Write(modeFilePath); 
                _images[colorMode.guid] = colorMode;
            }

            var graphic = processor.CreateGraphicFromSubGraphics(guid, name, originalSvg, modes);
            _graphics[guid] = graphic; 
             
            return graphic;
        }
    }
}