using System;
using System.Collections.Concurrent;
using Core.Data;

namespace LaserPreview.Models
{
    public class ProjectModel
    {
        private ConcurrentDictionary<string, Project> _projects = new ConcurrentDictionary<string, Project>();
        private ConcurrentDictionary<string, Order> _orders = new ConcurrentDictionary<string, Order>();

        public Project CreateProject(string projectId)
        {
            _projects[projectId] = new Project(projectId, new Material("", "", "", ""), new Dimension(18, DimensionUnits.Inches), new Dimension(12, DimensionUnits.Inches), new SvgGraphic[]{}, DimensionUnits.Inches);
            return _projects[projectId];
        }
        
        public Project GetProject(string projectId)
        {
            if (!_projects.ContainsKey(projectId))
            {
                CreateProject(projectId);
            }

            return _projects[projectId];
        }

        public Project SaveProject(Project project)
        {
            //not allowed to set the project as readonly from a save. 
            project.readOnly = false;
            _projects[project.projectId] = project;
            return project;
        }
        
        public bool OrderProject(string projectId, Customer customer)
        {
            if (_orders.ContainsKey(projectId))
            {
                return false;
            }

            //TODO: Calculate estimate project cost
            var order = new Order(customer, projectId, DateTime.Now, OrderStatus.Ordered, 0f, false);
            _orders[projectId] = order;
            _projects[projectId].readOnly = true;

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