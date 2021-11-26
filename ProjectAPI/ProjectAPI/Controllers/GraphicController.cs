using System.IO;
using Core.Data;
using LaserPreview.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LaserPreview.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GraphicController : Controller
    {
        private readonly GraphicModel _model;

        public GraphicController(GraphicModel model)
        {
            _model = model;
        }

        [HttpGet("{graphicId}/image")]
        public Stream GetGraphicImage(string graphicId)
        {
            var image = _model.GetImage(graphicId);
            if (image == null)
            {
                return null;
            }
            
            var stream = _model.GetImageBytes(graphicId);

            HttpContext.Response.Headers["Content-Type"] = image.mimetype;
            return stream;
            
        }
        [HttpGet("{graphicId}")]
        public SvgGraphic GetGraphic(string graphicId)
        {
            var graphic = _model.GetGraphic(graphicId);
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
            return _model.ProcessGraphic(file.FileName, file.Length, file.OpenReadStream());
        }
    }
}