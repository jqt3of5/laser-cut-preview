﻿using System;
using System.Collections.Concurrent;
using System.IO;

namespace LaserPreview.Models
{
    public class GraphicRepo
    {
        public string UploadDir = "uploads";
        private ConcurrentDictionary<string, Graphic> _graphics = new ConcurrentDictionary<string, Graphic>();

        public Stream GetGraphicBytes(string graphicId)
        {
            return File.OpenRead(Path.Combine(UploadDir, graphicId));
        }
        public Graphic? GetGraphic(string graphicId)
        {
            if (!_graphics.ContainsKey(graphicId))
            {
                return null;
            }

            return _graphics[graphicId];
        }

        public Graphic ProcessGraphic(string fileName, string mimeType, long length, Stream stream)
        {
            if (!Directory.Exists(UploadDir))
            {
                Directory.CreateDirectory(UploadDir);
            }

            var guid = Guid.NewGuid().ToString();

            using (var reader = new BinaryReader(stream))
            {
                File.WriteAllBytes(Path.Combine(UploadDir, guid), reader.ReadBytes((int)length));
            }
            
            //TODO: Get a real width and height
            //TODO: Generate the URL in a smarter way
            //TODO: Process the graphic and add ColorModes
            var graphic = new Graphic(guid, fileName, mimeType, $"graphic/{guid}/image", new ColorMode[]
            {
               new ColorMode("000000",guid, $"graphic/{guid}/image", LaserMode.Cut) 
            }, 0, 0, 100, 100);
            
            _graphics[guid] = graphic;
            
            return graphic;
        }
    }
}