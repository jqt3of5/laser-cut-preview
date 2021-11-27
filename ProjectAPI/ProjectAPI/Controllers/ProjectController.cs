using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Data;
using LaserPreview.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace LaserPreview.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProjectController : ControllerBase
    {
        private readonly ILogger<ProjectController> _logger;
        private readonly ProjectModel _repo;

        public ProjectController(ILogger<ProjectController> logger, ProjectModel repo)
        {
            _logger = logger;
            _repo = repo;
        }

        [HttpGet("{projectId}")]
        public Project GetProject(string projectId)
        {
            return _repo.GetProject(projectId);
        }

        [HttpPost("{projectId}")]
        public IActionResult SaveProject([FromBody] Project project)
        {
            if (_repo.IsProjectReadonly(project.projectId))
            {
                //Not Modified
                return StatusCode(304, _repo.GetProject(project.projectId));
            }
            return Ok(_repo.SaveProject(project));
        }

        [HttpPost("{projectId}/order")]
        public IActionResult OrderProject(string projectId, [FromBody] Customer customer)
        {
            if (_repo.IsProjectReadonly(projectId))
            {
                return StatusCode(304, "Project already ordered");
            }

            if (!_repo.OrderProject(projectId, customer))
            {
                return StatusCode(304, "Order failed");
            }
            return Ok();
        }
    }
}