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
                    if (task.getTags()) {
                        JSON.parse(task.getTags()).forEach(tag => {
                            if (tag.value.includes(searchVal)) {
                                tasksResult.push({
                                    task: task,
                                    project: project
                                });
                            }
                        });
                    }
                }
            });
        });
        return tasksResult;
    }

    parseStorageData( tasks ) {
        for ( const [projectData, taskArray] of tasks) {
            const project = this.createNewProject(projectData.projectName, projectData.projectID);

            if (project.getProjectID() === 0) this.todayProj = project;

            taskArray.forEach( taskData => {
            const task = new Task(taskData.title, taskData.description, taskData.dueDate,
                                    taskData.priority, taskData.difficulty, taskData.tags, taskData.taskId);
            task.setIsDone(taskData.isDone);

            project.addTask(task);
            });
        }
    }

    sortEarliestDueDate() {
        const tasks = this.currentProject.getProjectTasks();
        return new Map([...tasks.entries()].sort(this.compareDueEarliest));
    }

    compareDueEarliest(taskA, taskB) {
        const dateA = Date.parse(taskA[1].dueDate);
        const dateB = Date.parse(taskB[1].dueDate);

        if (isNaN(dateA) && isNaN(dateB)) return 0;
        else if (isNaN(dateA)) return 1;
        else if (isNaN(dateB)) return -1;

        if (dateA > dateB) return 1;
        else if (dateA < dateB) return -1;
        else return 0;
    }

    sortLatestDueDate() {
        const tasks = this.currentProject.getProjectTasks();
        return new Map([...tasks.entries()].sort(this.compareDueLatest));
    }

    compareDueLatest(taskA, taskB) {
        const dateA = Date.parse(taskA[1].dueDate);
        const dateB = Date.parse(taskB[1].dueDate);

        console.log({dateA});
        console.log({dateB});

        if (isNaN(dateA) && isNaN(dateB)) return 0;
        else if (isNaN(dateA)) return 1;
        else if (isNaN(dateB)) return -1;

        if (dateA > dateB) return -1;
        else if (dateA < dateB) return 1;
        else return 0;
    }

    sortHighestPriority() {
        const tasks = this.currentProject.getProjectTasks();
        return new Map([...tasks.entries()].sort(this.comparePriorityHighest));
    }

    comparePriorityHighest(taskA, taskB) {
        const prioA = taskA[1].priority;
        const prioB = taskB[1].priority;

        if (prioA > prioB) return 1;
        else if (prioA < prioB) return -1;
        else return 0;

    }

    sortLowestPriority() {
        const tasks = this.currentProject.getProjectTasks();
        return new Map([...tasks.entries()].sort(this.comparePriorityLowest));
    }

    comparePriorityLowest(taskA, taskB) {
        const prioA = taskA[1].priority;
        const prioB = taskB[1].priority;

        if (prioA === 'none') return 1;
        if (prioB === 'none') return -1;

        if (prioA > prioB) return -1;
        else if (prioA < prioB) return 1;
        else return 0;

    }

    sortHighestDifficulty() {
        const tasks = this.currentProject.getProjectTasks();
        return new Map([...tasks.entries()].sort(this.compareDifficultyHighest.bind(this)));
    }

    compareDifficultyHighest(taskA, taskB) {
        const diffA = taskA[1].difficulty;
        const diffB = taskB[1].difficulty;

        const aVal = this.convertDifficultyToNumbers(diffA);
        const bVal = this.convertDifficultyToNumbers(diffB);

        if (isNaN(aVal) && isNaN(bVal)) return 0;
        else if (isNaN(aVal)) return 1;
        else if (isNaN(bVal)) return -1;

        if (aVal > bVal) return -1;
        else if (aVal < bVal) return 1;
        else return 0;

    }

    sortLowestDifficulty() {
        const tasks = this.currentProject.getProjectTasks();
        return new Map([...tasks.entries()].sort(this.compareDifficultyLowest.bind(this)));
    }

    compareDifficultyLowest(taskA, taskB) {
        const diffA = taskA[1].difficulty;
        const diffB = taskB[1].difficulty;

        const aVal = this.convertDifficultyToNumbers(diffA);
        const bVal = this.convertDifficultyToNumbers(diffB);

        if (isNaN(aVal) && isNaN(bVal)) return 0;
        else if (isNaN(aVal)) return 1;
        else if (isNaN(bVal)) return -1;

        if (aVal > bVal) return 1;
        else if (aVal < bVal) return -1;
        else return 0;

    }

    convertDifficultyToNumbers(diff) {
        if (diff === 'easy') return 1;
        else if (diff === 'medium') return 2;
        else if (diff === 'hard') return 3;

        return NaN;

    }

}
