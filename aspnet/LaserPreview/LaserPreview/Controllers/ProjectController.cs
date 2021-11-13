using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
        private readonly ProjectRepo _repo;

        public ProjectController(ILogger<ProjectController> logger, ProjectRepo repo)
        {
            _logger = logger;
            _repo = repo;
        }

        [HttpGet("/{projectId}")]
        public Project GetProject(string projectId)
        {
            return _repo.GetProject(projectId);
        }

        [HttpPost("/{projectId}")]
        public Project SaveProject([FromBody] Project project)
        {
            return _repo.SaveProject(project);
        }
    }
}