using System.IO;
using Core.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProjectAPI.Interfaces;

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
        public Stream GetImage(string graphicId)
        {
            var stream = _model.GetImageStream(graphicId, out var mimeType);
            if (stream == null)
            {
                return null;
            }

            HttpContext.Response.Headers["Content-Type"] = mimeType;
            return stream;
        }
        
        [HttpGet("{graphicId}")]
        public DrawableObjectDto GetGraphicObject(string graphicId)
        {
            var graphic = _model.GetImageObject(graphicId);
            if (graphic == null)
            {
                return null;
            }

            //They really should always be dtos.... but it's possible they aren't
            if (graphic is DrawableObjectDto dto)
            {
                return dto;
            }
            
            return null;
        }

        [HttpPost]
        public SvgGraphicGroup UploadNewVectorGraphic(IFormFile file)
        {
            //TODO: validate mimetype is a vector graphic
            return _model.ProcessGraphic(file.FileName, file.Length, file.OpenReadStream());
        }
    }
}