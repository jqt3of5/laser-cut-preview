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
        private ConcurrentDictionary<string, SvgGraphicGroup> _graphics = new();
        private ConcurrentDictionary<string, ImageObject> _images = new();

        private string ImagePath(string imageId, string ext = ".svg")
        {
            return Path.Combine(UploadDir, imageId + ext);
        }
        public Stream? GetImageStream(string graphicId, out string mimeType)
        {
            var image = GetImageObject(graphicId);
            if (image == null)
            {
                mimeType = string.Empty;
                return null;
            }

            var doc = SvgDocument.Open(ImagePath(graphicId));
            var processor = new SvgProcessor(doc);
            
            switch (image.type)
            {
                case nameof(SvgGraphicGroup):
                    
                    //TODO: Get based on project
                    //TODO: Get original
                    break;
                case nameof(SvgSubGraphic):
                    //TODO: Get based on project
                    if (image is SvgSubGraphic subGraphic)
                    {
                        processor.SetColorsForMode(doc, subGraphic.mode);
                    }
                    //TODO: Get original
                    //TODO: Specify mode
                    break;
                default:
                    break;
            }
            
            mimeType = image.mimetype;
            return File.OpenRead(ImagePath(graphicId));
        }
        
        public ImageObject? GetImageObject(string imageId)
        {
            if (!_images.ContainsKey(imageId))
            {
                return null;
            }

            return _images[imageId]; 
        }
        
        public SvgGraphicGroup? GetGraphicGroupObject(string graphicId)
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

            var subDocs = processor.ExtractSubGraphicsFromSVG();
            
            //Sometimes there is space above and to the left, we want the graphic to fit with no empty space around it. 
            var xOffset = subDocs.Min(subdoc => subdoc.ViewBox.MinX);
            var yOffset = subDocs.Min(subdoc => subdoc.ViewBox.MinY);
            
            var subGraphics = subDocs.Select(doc => CreateSubGraphicFromSvg(xOffset, yOffset, doc)).ToList();
            
            //Save each sub graphic separately
            foreach (var (subGraphic, subDoc) in subGraphics.Zip(subDocs))
            {
                var modeFilePath = ImagePath(subGraphic.guid);
                subDoc.Write(modeFilePath); 
                
                //TODO: Store in DB
                _images[subGraphic.guid] = subGraphic;
            }

            var doc = processor.CreateGraphicGroupFromSubGraphics();
            
            var widthUnit = doc.Width.Type.ToUnits();
            var heightUnit = doc.Height.Type.ToUnits();

            //Create the overall graphic object for all the sub graphics. The height/width should contain all child graphics
            //Must maintain aspect ratio, or drawing gets all weird 
            var height = subGraphics.Max(mode => mode.posY.Add(mode.height));
            var width = subGraphics.Max(mode => mode.posX.Add(mode.width));

            //TODO: Generate the URL in a smarter way
            var graphic = CreateGraphicGroup(guid, $"/graphic/{guid}/image", originalFileName,
                new Dimension(0, widthUnit), new Dimension(0, heightUnit),
                width ?? new Dimension(0, widthUnit), height ?? new Dimension(0, heightUnit),
                subGraphics.ToArray());
            
            var groupFilePath = ImagePath(graphic.guid);
            doc.Write(groupFilePath); 
            
            //TODO: Store in DB
            _graphics[guid] = graphic; 
            _images[guid] = graphic;
             
            return graphic;
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
                subGraphics = subGraphics.Cast<DrawableObjectDto>().ToArray(),
            };
        }

        private SvgSubGraphic CreateSubGraphic(string guid, string url, Dimension posX, Dimension posY, Dimension width,
            Dimension height, LaserMode mode)
        {
            return new DrawableObjectDto()
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

    }
}