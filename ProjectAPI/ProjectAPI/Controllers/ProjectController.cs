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
        private readonly ProjectModel _model;

        public ProjectController(ILogger<ProjectController> logger, ProjectModel model)
        {
            _logger = logger;
            _model = model;
        }

        [HttpGet("{projectId}")]
        public Project GetProject(string projectId)
        {
            return _model.GetProject(projectId);
        }

        [HttpPost("{projectId}")]
        public IActionResult SaveProject([FromBody] Project project)
        {
            if (_model.IsProjectReadonly(project.projectId))
            {
                //Not Modified
                return StatusCode(304, _model.GetProject(project.projectId));
            }
            return Ok(_model.SaveProject(project));
        }

        [HttpPost("{projectId}/order")]
        public IActionResult OrderProject(string projectId, [FromBody] Customer customer)
        {
            if (_model.IsProjectReadonly(projectId))
            {
                return StatusCode(304, "Project already ordered");
            }

            if (!_model.OrderProject(projectId, customer))
            {
                return StatusCode(304, "Order failed");
            }
            return Ok();
        }
    }
}