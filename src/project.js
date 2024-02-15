import _ from 'lodash';

export default class Project {
    static id = 0;

    constructor(name, id=null) {
        this.projectTasks = new Map();
        if (id === null) {
            this.projectID = Project.id++;
        }
        else {
            this.projectID = id;
            Project.id++;
        }

        this.projectName = name;
    }

    getProjectName() {
        return this.projectName;
    }

    setProjectName(projectName) {
        this.projectName = projectName;
    }

    getProjectID() {
        return this.projectID;
    }

    addTask(newTask) {
        this.projectTasks.set(newTask.getID(), newTask);
    }

    deleteTask(taskToDeleteId) {
        this.projectTasks.delete(taskToDeleteId);
    }

    getProjectTasks() {
        return this.projectTasks;
    }
}

export function createNewProject() {
    return new Project();
}