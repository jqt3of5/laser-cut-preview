using System;
using System.Collections.Concurrent;
using System.Linq;
using ProjectAPI.Interfaces;

namespace Core.Data
{
    public class ProjectModel
    {
        private readonly MaterialsModel _materialsModel;
        private ConcurrentDictionary<string, Project> _projects = new ConcurrentDictionary<string, Project>();
        private ConcurrentDictionary<string, Order> _orders = new ConcurrentDictionary<string, Order>();

        public ProjectModel(MaterialsModel materialsModel)
        {
            _materialsModel = materialsModel;
        }

        private Project CreateProject(string projectId)
        {
            return new Project(projectId, _materialsModel.DefaultMaterial, 
                new Dimension(18, DimensionUnits.Inches), 
                new Dimension(12, DimensionUnits.Inches), 
                new DrawableObjectDto[]{},
                DimensionUnits.Inches);
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
                reason = "This project has already been ordered";
                return false;
            }

            _projects[projectId].readOnly = true;

            string GenerateOrderId()
            {
                var ticks = DateTime.Now.Ticks;
                var random = new Random().Next();
                var bytes = BitConverter.GetBytes(ticks).Concat(BitConverter.GetBytes(random));
                return Convert.ToBase64String(bytes.ToArray());
            }
            
            //TODO: SNS topic for email notification
            var order = new Order(customer,GenerateOrderId(),projectId, DateTime.Now, OrderStatus.Ordered, 0f);
            _orders[projectId] = order;

            reason = string.Empty;
            return true;
        }

        public bool GetOrder(string projectId, out Order order)
        {
            return _orders.TryGetValue(projectId, out order);
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