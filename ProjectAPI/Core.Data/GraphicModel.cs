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
        private ConcurrentDictionary<string, SvgGraphicGroup> _graphics = new ConcurrentDictionary<string, SvgGraphicGroup>();
        private ConcurrentDictionary<string, Image> _images = new ConcurrentDictionary<string, Image>();

        private string ImagePath(string imageId, string ext = ".svg")
        {
            return Path.Combine(UploadDir, imageId + ext);
        }
        public Stream GetImageBytes(string graphicId)
        {
            return File.OpenRead(ImagePath(graphicId));
        }
        
        public Image? GetImageObject(string imageId)
        {
            if (!_images.ContainsKey(imageId))
            {
                return null;
            }

            return _images[imageId]; 
        }
        
        public SvgGraphicGroup? GetGraphicGroup(string graphicId)
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
     
        
        public SvgGraphicGroup? ProcessGraphic(string originalFileName, long streamByteCount, Stream stream)
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

            var modes = processor.ExtractSubGraphicsFromSVG();
           
            //Save each sub graphic separately
            foreach (var (subDoc, colorMode) in modes)
            {
                var modeFilePath = ImagePath(colorMode.guid);
                subDoc.Write(modeFilePath); 
                
                //TODO: Store in DB
                _images[colorMode.guid] = colorMode;
            }

            var (doc, graphic) = processor.CreateGraphicGroupFromSubGraphics(guid, originalFileName);
            
            var groupFilePath = ImagePath(graphic.guid);
            doc.Write(groupFilePath); 
            
            //TODO: Store in DB
            _graphics[guid] = graphic; 
            _images[guid] = graphic;
             
            return graphic;
        }
    }
}