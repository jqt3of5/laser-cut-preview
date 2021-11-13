using System.IO;
using LaserPreview.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LaserPreview.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GraphicController : Controller
    {
        private readonly GraphicRepo _repo;

        public GraphicController(GraphicRepo repo)
        {
            _repo = repo;
        }

        [HttpGet("{graphicId}/image")]
        public Stream GetGraphicImage(string graphicId)
        {
            var image = _repo.GetImage(graphicId);
            if (image == null)
            {
                return null;
            }
            
            var stream = _repo.GetImageBytes(graphicId);

            HttpContext.Response.Headers["Content-Type"] = image.mimetype;
            return stream;
            
        }
        [HttpGet("{graphicId}")]
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
            //TODO: validate mimetype is a vector graphic
            return _repo.ProcessGraphic(file.FileName, file.ContentType, file.Length, file.OpenReadStream());
        }
    }
}