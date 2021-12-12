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
        public Stream GetImageStream(string graphicId)
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

        public string SaveNewSvg(string guid, long streamByteCount, Stream stream)
        {
            if (!Directory.Exists(UploadDir))
            {
                Directory.CreateDirectory(UploadDir);
            }
            //Save the original graphic for future use.
            var originalFilePath = ImagePath(guid, ".original.svg");
            SaveStream(stream, (int)streamByteCount, originalFilePath);

            return originalFilePath;
        }
        public SvgGraphicGroup? ProcessGraphic(string originalFileName, long streamByteCount, Stream stream)
        {
            var guid = Guid.NewGuid().ToString();
            var originalFilePath = SaveNewSvg(guid, streamByteCount, stream);
            var originalSvg  = SvgDocument.Open(originalFilePath);

            var processor = new SvgProcessor(originalSvg);

            //Save each sub graphic separately
            foreach (var (subDoc, colorMode) in processor.ExtractSubGraphicsFromSVG())
            {
                var modeFilePath = ImagePath(colorMode.guid);
                subDoc.Write(modeFilePath); 
                
                //TODO: Store in DB
                _images[colorMode.guid] = colorMode;
            }

            //TODO: Passing the guid and the original file name here feels really weird. I know the object needs it
            //but it's really not the place for the processor I think...
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