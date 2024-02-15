export function populateStorage(todo) {

    if (!todo.getToday()) {
        return;
    }
    const projects = new Map(todo.getProjects());
    projects.set(todo.getToday().getProjectID(), todo.getToday());
    let tasks = new Map();
    for (const [projectID, project] of projects) {
        if (project.getProjectTasks().length !== 0) {
            for (const [taskID, task] of project.getProjectTasks()) {
                if (tasks.has(project)){
                    tasks.get(project).push(task);
                }
                else {
                    tasks.set(project, [task]);
                }
            }
        }
    }

    localStorage.setItem('tasks', JSON.stringify(Array.from(tasks.entries())));
}

export function getTodoFromStorage(todo) {
    const tasks = new Map(JSON.parse(localStorage.getItem('tasks')));
    todo.parseStorageData(tasks);
}