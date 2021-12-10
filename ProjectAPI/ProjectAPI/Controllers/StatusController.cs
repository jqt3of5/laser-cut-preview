using Microsoft.AspNetCore.Mvc;

namespace LaserPreview.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class StatusController : Controller
    {
        // GET
        public IActionResult Index()
        {
            return Ok();
        }
    }
}