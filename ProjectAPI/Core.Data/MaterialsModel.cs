using System.IO;
using System.Linq;
using System.Text.Json;
using ProjectAPI.Interfaces;

namespace Core.Data
{
    public class MaterialsModel
    {
        public MaterialCategory[] Categories { get; }

        public Material DefaultMaterial => Categories.First().materials.First();
        
        public MaterialsModel()
        {
            //TODO: Materials should be a database, not a json file
            var json = System.IO.File.ReadAllText("Models/Assets/materials.json");
            Categories = JsonSerializer.Deserialize<MaterialCategory[]>(json);  
        }

        public Material? GetMaterial(string materialId)
        {
           return Categories.SelectMany(cat => cat.materials).FirstOrDefault(mat => mat.id == materialId); 
        }

        public Stream GetMaterialImage(string materialId, out string mimeType)
        {
            var material = DefaultMaterial; 
            
            if (!string.IsNullOrEmpty(materialId))
            {
                material = GetMaterial(materialId);
            }
            mimeType = "image/jpg"; 
            return System.IO.File.OpenRead($"Models/Assets/{material.fileName}"); 
        }
    }
}