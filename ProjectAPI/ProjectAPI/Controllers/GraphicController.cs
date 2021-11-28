using System.IO;
using Core.Data;
using LaserPreview.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProjectAPI.Interfaces;

namespace LaserPreview.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GraphicController : Controller
    {
        private readonly GraphicModel _repo;

        public GraphicController(GraphicModel repo)
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
        public SvgGraphic GetGraphic(string graphicId)
        {
            var graphic = _repo.GetGraphic(graphicId);
            if (graphic == null)
            {
                return null;
            }

            return graphic;
        }

        [HttpPost]
        public SvgGraphic ProcessGraphic(IFormFile file)
        {
            //TODO: validate mimetype is a vector graphic
            return _repo.ProcessGraphic(file.FileName, file.Length, file.OpenReadStream());
        }
    }
}