import Project from './project';
import { differenceInCalendarDays, isFuture } from 'date-fns';

export default class ToDoList {
    projects;
    currentDate;
    currentProject;
    todayProj;

    constructor() {
        this.projects = new Map();
        this.todayProj = this.createNewProject('Today');
        this.setCurrentProject(this.createNewProject("Default Project"));
    }

    createNewProject(newProjectName) {
        const newProject = new Project(newProjectName);
        if (newProject.getProjectID() !== 0) {
            const newProjectID = newProject.getProjectID();
            this.projects.set(newProjectID, newProject);
        }

        return newProject;
    }

    deleteCurrentProject() {
        this.projects.delete(this.currentProject.getProjectID());

    }

    setCurrentProject(project) {
        this.currentProject = project;
    }

    getCurrentProject() {
        return this.currentProject;
    }

    addNewTaskToProject(newTask) {
        this.currentProject.addTask(newTask);
    }

    deleteTaskFromProject(taskToDeleteId) {
        this.currentProject.deleteTask(taskToDeleteId);
    }

    getTasksDueSoon() {
        let dueSoonList = [];
        const projects = new Map(this.projects);
        projects.set(0, this.todayProj);
        projects.forEach( (proj, projID) => {
            const tasks = proj.getProjectTasks();
            tasks.forEach((task, taskID) => {
                if (!task.getIsDone()) {
                    if (task.isOverdue) {
                        dueSoonList.push({
                            task: task,
                            project: proj
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
                                    project: proj
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

}