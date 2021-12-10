using System;
using System.Collections.Concurrent;
using Core.Data;
using ProjectAPI.Interfaces;

namespace LaserPreview.Models
{
    public class ProjectModel
    {
        private ConcurrentDictionary<string, Project> _projects = new ConcurrentDictionary<string, Project>();
        private ConcurrentDictionary<string, Order> _orders = new ConcurrentDictionary<string, Order>();

        private Project CreateProject(string projectId)
        {
            //TODO: Get default material
            return new Project(projectId, new Material("", "", "", ""), new Dimension(18, DimensionUnits.Inches), new Dimension(12, DimensionUnits.Inches), new SvgGraphicGroup[]{}, DimensionUnits.Inches);
        }
        
        public Project GetProject(string projectId)
        {
            if (!_projects.ContainsKey(projectId))
            {
                _projects[projectId] = CreateProject(projectId);
            }

            return _projects[projectId];
        }

        public Project SaveProject(Project project)
        {
            //TODO: Calculate estimate project cost
            //not allowed to set the project as readonly from a save. 
            project.readOnly = false;
            _projects[project.projectId] = project;
            return project;
        }
        
        public bool OrderProject(string projectId, Customer customer, out string reason)
        {
            if (_orders.ContainsKey(projectId))
            {
                reason = "Project already ordered";
                return false;
            }

            _projects[projectId].readOnly = true;
            
            //TODO: SNS topic for email notification
            var order = new Order(customer, Guid.NewGuid().ToString(), projectId, DateTime.Now, OrderStatus.Ordered, 0f, false);
            _orders[projectId] = order;

            reason = string.Empty;
            return true;
        }

        public bool IsProjectReadonly(string projectGuid)
        {
            if (_projects.ContainsKey(projectGuid))
            {
                return _projects[projectGuid].readOnly;
            }

            return false;
        }
    }
}