using System.IO;
using System.Text.Json;
using LaserPreview.Models;
using Microsoft.AspNetCore.Mvc;

namespace LaserPreview.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MaterialsController
    {
        [HttpGet]
        public MaterialCategory [] GetMaterials()
        {
            //TODO: Perhaps refactor this into a repo?
            var json = File.ReadAllText("Models/Assets/materials.json");
            return JsonSerializer.Deserialize<MaterialCategory[]>(json);
        }

        public Stream GetMaterialImage(string materialId)
        {
            //TODO: open the material image file and return it.     
            //TODO: Certainly we need to set the content type for this to work right. 
        }
    }
}