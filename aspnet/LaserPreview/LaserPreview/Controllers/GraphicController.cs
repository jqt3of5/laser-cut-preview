using System.IO;
using LaserPreview.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LaserPreview.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GraphicController
    {
        private readonly GraphicRepo _repo;

        public GraphicController(GraphicRepo repo)
        {
            _repo = repo;
        }

        [HttpGet("/{graphicId}/image")]
        public Stream GetGraphicImage(string graphicId)
        {
            var graphic = _repo.GetGraphic(graphicId);
            if (graphic == null)
            {
                return null;
            }

            using (var stream = _repo.GetGraphicBytes(graphicId))
            using (var reader = new StreamReader(stream))
            {
                //TODO: Certainly we need to set the content type for this to work right. 
                return stream;
            }
        }
        [HttpGet("/{graphicId}")]
        public Graphic GetGraphic(string graphicId)
        {
            var graphic = _repo.GetGraphic(graphicId);
            if (graphic == null)
            {
                return null;
            }

            return graphic;
        }

        [HttpPost]
        public Graphic ProcessGraphic(IFormFile file)
        {
            return _repo.ProcessGraphic(file.FileName, file.ContentType, file.Length, file.OpenReadStream());
        }
    }
}