using System.IO;
using System.Linq;
using System.Text.Json;
using LaserPreview.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;

namespace LaserPreview.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MaterialsController : Controller
    {
        private MaterialCategory[] _categories;
        public MaterialsController()
        {
            var json = System.IO.File.ReadAllText("Models/Assets/materials.json");
            _categories = JsonSerializer.Deserialize<MaterialCategory[]>(json);  
        }
        
        [HttpGet]
        public MaterialCategory [] GetMaterials()
        {
            return _categories;
        }

        [HttpGet("{materialId}")]
        public ActionResult<Stream> GetMaterialImage(string materialId)
        {
            var material = _categories.SelectMany(cat => cat.materials).FirstOrDefault(mat => materialId == "default" || mat.id == materialId);
            if (material == null)
            {
                return NotFound($"Could not find material with Id: {materialId}");
            }
            
            var stream = System.IO.File.OpenRead($"Models/Assets/{material.fileName}");

            HttpContext.Response.Headers["Content-Type"] = "image/jpg";
            return Ok(stream);
        }
    }
}