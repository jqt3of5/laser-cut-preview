using System.IO;
using System.Linq;
using System.Text.Json;
using Core.Data;
using LaserPreview.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using ProjectAPI.Interfaces;

namespace LaserPreview.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MaterialsController : Controller
    {
        private readonly MaterialsModel _model;

        public MaterialsController(MaterialsModel model)
        {
            _model = model;
        }
        
        [HttpGet]
        public MaterialCategory [] GetMaterials()
        {
            return _model.Categories;
        }

        [HttpGet("{materialId}")]
        public ActionResult<Stream> GetMaterialImage(string materialId)
        {
            var stream = _model.GetMaterialImage(materialId, out var mimeType);
            HttpContext.Response.Headers["Content-Type"] = mimeType;
            return Ok(stream);
        }
    }
}