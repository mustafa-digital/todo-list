import Project from './project';
import Task from './task';
import { differenceInCalendarDays, isFuture } from 'date-fns';
import { populateStorage } from './storage';

const TODAY_PROJECT_ID = 0;

export default class ToDoList {
    projects;
    currentDate;
    currentProject;
    todayProj;

    constructor() {
        this.projects = new Map();
    }

    init() {
        this.todayProj = this.createNewProject('Today');
        this.setCurrentProject(this.createNewProject("Default Project"));
    }

    createNewProject(newProjectName, id=null) {
        let newProject;

        // if project has an id (from localStorage) create it with id, else leave id blank to generate new id
        if (id === null) {
            newProject = new Project(newProjectName);
        }
        else {
            newProject = new Project(newProjectName, id);
        }

        // this is here because we don't want to add Today project to the general list of projects
        if (newProject.getProjectID() !== TODAY_PROJECT_ID) {
            console.log(newProject.getProjectID());
            const newProjectID = newProject.getProjectID();
            this.projects.set(newProjectID, newProject);
        }

        populateStorage(this);
        return newProject;
    }

    deleteCurrentProject() {
        this.projects.delete(this.currentProject.getProjectID());
        populateStorage(this);
    }

    setCurrentProject(project) {
        this.currentProject = project;
    }
    
    getProjects() {
        return this.projects;
    }

    setProjects(projects) {
        this.projects = projects;
    }

    getToday() {
        return this.todayProj;
    }

    setToday(todayProj) {
        this.todayProj = todayProj;
    }

    getCurrentProject() {
        return this.currentProject;
    }

    addNewTaskToProject(newTask) {
        this.currentProject.addTask(newTask);
        populateStorage(this);
    }

    deleteTaskFromProject(taskToDeleteId) {
        this.currentProject.deleteTask(taskToDeleteId);
        populateStorage(this);
    }

    getTasksDueSoon() {
        let dueSoonList = [];
        const projects = new Map(this.projects);
        projects.set(0, this.todayProj);
        projects.forEach( (project, projID) => {
            console.log({project, projID});
            const tasks = project.getProjectTasks();
            tasks.forEach((task, taskID) => {
                if (!task.getIsDone()) {
                    if (task.isOverdue) {
                        dueSoonList.push({
                            task: task,
                            project: project
                        });
                    }
                    else {
                        // check if due date is within 3 days of today
                        const currentDate = new Date();
                        const taskDueDate = task.getDueDate();
                        if (isFuture(taskDueDate)) {
                            const dayDiff = differenceInCalendarDays(taskDueDate, currentDate);
                            if (dayDiff <= 3) {
                                dueSoonList.push({
                                    task: task,
                                    project: project
                                }); 
                            }
                        }
                    }

                }
            });
        });
        const sortedTasks = this.sortTasksByDueDate(dueSoonList);
        return sortedTasks;
    }

    sortTasksByDueDate(tasks) {
        if (tasks.length < 2) return tasks;

        let pivot = tasks[tasks.length - 1];
        let left = [];
        let right = [];

        for (let i = 0; i < tasks.length - 1; i++) {

            if (Date.parse(tasks[i]["task"].getDueDate()) < Date.parse(pivot["task"].getDueDate())) {
                left.push(tasks[i]);
            } else  {
                right.push(tasks[i]);
            }
        }

        return [...this.sortTasksByDueDate(left), pivot, ...this.sortTasksByDueDate(right)];
    }

    searchTasks(searchVal) {
        let tasksResult = [];
        const projects = new Map(this.projects);
        projects.set(0, this.todayProj);

        projects.forEach( (project, projID) => {
            project.getProjectTasks().forEach( (task, taskID) => {
                if (task.getTitle().toLowerCase().includes(searchVal)) {
                    tasksResult.push({
                        task: task,
                        project: project
                    });
                }
                else {
                    JSON.parse(task.getTags()).forEach(tag => {
                        if (tag.value.includes(searchVal)) {
                            tasksResult.push({
                                task: task,
                                project: project
                            });
                        }
                    });
                }
            });
        });
        return tasksResult;
    }

    parseStorageData( tasks ) {
        console.log(tasks);

        for ( const [projectData, taskArray] of tasks) {
            const project = this.createNewProject(projectData.projectName, projectData.projectID);

            if (project.getProjectID() === 0) this.todayProj = project;

            taskArray.forEach( taskData => {
                const task = new Task(taskData.title, taskData.description, taskData.dueDate, taskData.priority, taskData.difficulty, taskData.tags, taskData.taskId);
                task.setIsDone(taskData.isDone);

                project.addTask(task);
            });
        }
    }

}
