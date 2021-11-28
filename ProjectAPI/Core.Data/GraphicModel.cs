using System;
using System.Collections.Concurrent;
using System.IO;
using System.Linq;
using ProjectAPI.Interfaces;
using Svg;

namespace Core.Data
{
    public class GraphicModel
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
     
        public SvgGraphic? ProcessGraphic(string originalFileName, long streamByteCount, Stream stream)
        {
            if (!Directory.Exists(UploadDir))
            {
                Directory.CreateDirectory(UploadDir);
            }
            var guid = Guid.NewGuid().ToString();
            //Save the original graphic for future use.
            var originalFilePath = ImagePath(guid, ".original.svg");
            SaveStream(stream, (int)streamByteCount, originalFilePath);
            
            var originalSvg  = SvgDocument.Open(originalFilePath);

            var processor = new SvgProcessor(originalSvg);

            var modes = processor.ExtractSubGraphics();
           
            //Save each sub graphic separately
            foreach (var (doc, colorMode) in modes)
            {
                var modeFilePath = ImagePath(colorMode.guid);
                doc.Write(modeFilePath); 
                
                //TODO: Store in DB
                _images[colorMode.guid] = colorMode;
            }

            var graphic = processor.CreateGraphicFromSubGraphics(guid, originalFileName);
            
            //TODO: Store in DB
            _graphics[guid] = graphic; 
             
            return graphic;
        }
    }
}