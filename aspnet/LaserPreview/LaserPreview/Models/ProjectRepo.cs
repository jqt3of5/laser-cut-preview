﻿using System.Collections.Concurrent;

namespace LaserPreview.Models
{
    public class ProjectRepo
    {
        private ConcurrentDictionary<string, Project> _projects = new ConcurrentDictionary<string, Project>();

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
            _projects[project.projectId] = project;
            return project;
        }
    }
}