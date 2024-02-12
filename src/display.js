import editImgSrc from './assets/dots-horizontal.svg';
import addTaskIconSrc from './assets/plus-box.svg';
import editTaskIconSrc from './assets/pencil-outline.svg';
import deleteTaskIconSrc from './assets/trash-can-outline.svg';


export default class Display {
    currentProject;
    currentPageSelect;
    constructor() {
        this.projectsDiv = document.querySelector(".projects");
        this.bodyContent = document.querySelector(".body-content");

        this.changePageSelect(document.querySelector(".home"));
    }

    changePageSelect(element) {
        if(this.currentPageSelect != null) 
            this.currentPageSelect.classList.remove("sidebar-selected");

        this.currentPageSelect = element;
        this.currentPageSelect.classList.add("sidebar-selected");
    }

    clearProjectsDiv() {
        this.projectsDiv.textContent = "";
    }

    displayProjects(projects) {
        this.clearProjectsDiv();

        projects.forEach( (project, id) => {
            this.projectsDiv.appendChild(this.createProjectButton(project, id));
        });
    }

    displayNewProject(project) {
        const newProjectButtonDiv = this.createProjectButton(project, project.getProjectID());
        this.projectsDiv.appendChild(newProjectButtonDiv);

        return newProjectButtonDiv;
    }

    editProject(project) {
        const bodyHeader = document.querySelector(".body-header");
        const projectName = project.getProjectName();
        bodyHeader.textContent = projectName;

        const projectButtonDiv = document.querySelector(`.project-btn-div[data-project-id="${project.getProjectID()}"]`);
        const projectButton = projectButtonDiv.querySelector(".project-btn");
        projectButton.textContent = projectName;
    }

    createProjectButton(project, id) {
        const projectButtonDiv = document.createElement("div");
        projectButtonDiv.setAttribute("class", "project-btn-div");
        projectButtonDiv.setAttribute("data-project-id", project.getProjectID());
        const projectButton = document.createElement("a");
        projectButton.textContent = `${project.getProjectName()}`;
        projectButton.setAttribute("class", "project-btn");

        projectButtonDiv.appendChild(projectButton);

        return projectButtonDiv;
    }

    removeProject(projectToDelete) {
        const projectToDeleteDOM = document.querySelector(`[data-project-id="${projectToDelete.getProjectID()}"]`);
        this.projectsDiv.removeChild(projectToDeleteDOM);
    }

    displayProjectContent(project) {
        const editProjDiv = document.querySelector(".edit-proj-div");
        if (project.getProjectID() !== 0) {
        editProjDiv.style.display = "block";
        } else {
        editProjDiv.style.display = "none";
        }

        const projectBody = document.querySelector(".project-body");
        projectBody.style.display = "block";

        const homeContent = document.querySelector(".home-body");
        homeContent.style.display = "none";

        this.currentProject = project;

        // Update the project header
        const projectTitle = document.querySelector(".body-header");
        projectTitle.textContent = project.getProjectName();

        // apply image to edit project button
        const editProjImg = document.querySelector(".edit-proj-img");
        editProjImg.src = editImgSrc;

        const editProjModalImg = document.querySelector(".edit-proj-img-modal");
        editProjModalImg.src = editTaskIconSrc;

        const delProjModalImg = document.querySelector(".del-proj-img-modal");
        delProjModalImg.src = deleteTaskIconSrc;

        // add the add task button icon
        const addTaskIcon = document.querySelectorAll(".add-task-icon");
        Array.from(addTaskIcon).forEach(icon => {
            icon.src = addTaskIconSrc;
        });

        const taskDiv = document.querySelector(".task-div");

        // clear the task div
        taskDiv.textContent = "";

        // display every task in this project
        const projectTasks = project.getProjectTasks();
        projectTasks.forEach( (task) => {
            this.displayTask(task);
        });        
    }

    clearProjectBody() {
        const bodyHeader = document.querySelector(".body-header");
        const taskDiv = document.querySelector(".task-div");
        bodyHeader.textContent = "";
        taskDiv.textContent = "";
    }

    displayTask(task) {
        const taskDiv = document.querySelector(".task-div");

        const taskWrapper = document.createElement("div");
        taskWrapper.setAttribute("class", "task-content-wrapper collapsible-wrapper");
        taskWrapper.setAttribute("data-task-id",`${task.getID()}`);

        const checkTask = document.createElement("input");
        checkTask.setAttribute("data-task-id", task.getID());
        checkTask.setAttribute("type", "checkbox");
        checkTask.setAttribute("class", "check-task");
        taskWrapper.appendChild(checkTask);

        if (task.getIsDone()) { checkTask.checked = true; }

        checkTask.addEventListener("change", e => {
            task.getIsDone() === true ? task.setIsDone(false) : task.setIsDone(true);     
        });

        const inputCollapsible = document.createElement("input");
        inputCollapsible.setAttribute("id", `collapsible-${task.getID()}`);
        inputCollapsible.setAttribute("class", "toggle");
        inputCollapsible.setAttribute("type", "checkbox");
        taskWrapper.appendChild(inputCollapsible);

        const labelCollapsible = document.createElement("label");
        labelCollapsible.setAttribute("class", "lbl-toggle");
        labelCollapsible.setAttribute("for", `collapsible-${task.getID()}`);
        taskWrapper.appendChild(labelCollapsible);

        const labelSpan = document.createElement("span");
        labelSpan.textContent = task.getTitle();
        labelSpan.setAttribute("class", "lbl-span");
        labelCollapsible.appendChild(labelSpan);

        const contentCollapsible = document.createElement("div");
        contentCollapsible.setAttribute("class", "collapsible-content");
        taskWrapper.appendChild(contentCollapsible);

        const innerContentCollapsible = document.createElement("div");
        innerContentCollapsible.setAttribute("class","collapsible-content-inner");
        contentCollapsible.appendChild(innerContentCollapsible);

        const taskDesc = document.createElement("p");
        taskDesc.textContent = task.getDescription();
        taskDesc.setAttribute("class", "task-desc");
        innerContentCollapsible.appendChild(taskDesc);
        
        const taskPrio = document.createElement("p");
        if (task.getPriority() != "none") { taskPrio.textContent = `Priority: ${task.getPriority()}`; }
        taskPrio.setAttribute("class", "task-prio");
        innerContentCollapsible.appendChild(taskPrio);
        
        const taskDiff = document.createElement("p");
        if (task.getDifficulty()) {
            taskDiff.textContent = capitalizeFirstLetter(task.getDifficulty());
        }
        taskDiff.setAttribute("class", `task-diff task-${task.getDifficulty()}`);
        innerContentCollapsible.appendChild(taskDiff);

        const taskDueDate = document.createElement("p");
        taskDueDate.setAttribute("class", "task-due-date");

        task.getDueDate() !== "" ? taskDueDate.textContent =  `Due: ${task.getDueDate()}` : taskDueDate.textContent = "No due date :)";
        innerContentCollapsible.appendChild(taskDueDate);

        const tagWrapper = document.createElement("div");
        tagWrapper.setAttribute("class", "tag-wrapper");
        labelCollapsible.appendChild(tagWrapper);
        
        if (task.getTags()) {
            const tagArray = JSON.parse(task.getTags());
            tagArray.forEach( tag => {
                const tagText = tag.value;
                const tagDiv = document.createElement("div");
                tagDiv.setAttribute("class", "task-tag");
                tagDiv.textContent = "#" + tagText;
                tagWrapper.appendChild(tagDiv);
            });
        }

        const editTaskDiv = document.createElement("div");
        editTaskDiv.setAttribute("class", "edit-task-div");
        const editTaskModalButton = document.createElement("button");
        editTaskModalButton.setAttribute("class", "edit-task-modal-btn");
        
        const editTaskImg = new Image();
        editTaskImg.setAttribute("class", "edit-task-img");
        editTaskImg.src = editImgSrc;
        editTaskModalButton.appendChild(editTaskImg);
        editTaskDiv.appendChild(editTaskModalButton);

        const editTaskModal = document.createElement("div");
        editTaskModal.setAttribute("class", "edit-task-modal");
        editTaskModal.classList.add("small-modal");
        editTaskDiv.appendChild(editTaskModal);

        editTaskModalButton.addEventListener("click", (e) => {
            editTaskModal.classList.toggle("active-modal");

            if (editTaskModal.classList.contains("active-modal")) {
                editTaskModal.style.display = "grid";
            }
            else {
                editTaskModal.style.display = "none";
            }
        });

        window.addEventListener("click", (e) => {
            if (e.target !== editTaskModal && e.target !== inputCollapsible && e.target !== editTaskImg) {
                if (editTaskModal.classList.contains("active-modal")){
                    editTaskModal.classList.toggle("active-modal");
                    editTaskModal.style.display = "none";
                }
            }
        });

        const editTaskButton = document.createElement("button");
        editTaskButton.setAttribute("class","edit-task-btn task-edit-modal-btn");
        editTaskButton.setAttribute("data-task-id", task.getID());
        editTaskButton.textContent = "Edit";
        editTaskModal.appendChild(editTaskButton);


        editTaskButton.addEventListener("click", e => {
            // show modal
            const modal = document.querySelector(".edit-task-form-modal");
            modal.setAttribute("data-task-id", task.getID());
            modal.showModal();

            // fill in inputs for edit form
            let taskTitle = document.querySelector(".edit-task-form-modal input[name=task-name]");
            taskTitle.value = task.getTitle();
            let taskDesc = document.querySelector(".edit-task-form-modal textarea[name=task-desc]");
            taskDesc.value = task.getDescription(); 
            let taskDueDate = document.querySelector(".edit-task-form-modal input[name=task-due-date]");
            taskDueDate.value = task.getDueDate();
            let taskPrio = document.querySelector(".edit-task-form-modal select[name=task-prio]");
            if (task.getPriority() == "none"){
                taskPrio.options[0].value = "none";
            }
            else {
                taskPrio.options[task.getPriority()].selected = true;
            }
            let taskDiff = document.querySelector(`.edit-task-form-modal input#task-${task.getDifficulty()}`);
            if (taskDiff)
                taskDiff.checked = true;
            let taskTags = document.querySelector(".edit-task-form-modal input[name=task-tags]");
            taskTags.value = task.getTags(); // in JSON format

        });

        const editTaskImgModal = new Image();
        editTaskImgModal.src = editTaskIconSrc;
        editTaskImgModal.setAttribute("class", "edit-task-img-modal");
        editTaskButton.appendChild(editTaskImgModal);

        const deleteTaskButton = document.createElement("button");
        deleteTaskButton.setAttribute("class", "del-task-btn task-edit-modal-btn");
        deleteTaskButton.textContent = "Delete";
        editTaskModal.appendChild(deleteTaskButton);

        const deleteTaskImg = new Image();
        deleteTaskImg.src = deleteTaskIconSrc;
        deleteTaskImg.setAttribute("class", "del-task-img-modal");
        deleteTaskButton.appendChild(deleteTaskImg);

        deleteTaskButton.addEventListener("click", () => {
            this.displayDeleteTaskModal(task);
        });

        labelCollapsible.appendChild(editTaskDiv);

        taskDiv.appendChild(taskWrapper);
    }

    displayDeleteTaskModal(task) {
        const modal = document.querySelector(".del-task-modal");

        const confirmSpan = document.querySelector(".del-task-modal-span");
        confirmSpan.textContent = task.getTitle();
        confirmSpan.style.fontWeight = "bold";

        const confirmButton = document.querySelector(".del-task-confirm");
        confirmButton.setAttribute("data-task-id", task.getID());

        modal.showModal();
    }

    displayEditedTask(task, taskID) {
        // get the correct task content wrapper
        const taskContent = document.querySelector(`div[data-task-id="${taskID}"]`); 
        // find the elements containing the task contents
        const taskTitle = taskContent.querySelector(".lbl-span");
        const taskDesc = taskContent.querySelector(".task-desc");
        const taskPrio = taskContent.querySelector(".task-prio");
        const taskDiff = taskContent.querySelector(".task-diff");
        const taskDue = taskContent.querySelector(".task-due-date");

        // change the text content to new task params
        taskTitle.textContent = task.getTitle();
        taskDesc.textContent = task.getDescription();
        if (task.getPriority() != "none")
            taskPrio.textContent = `Priority: ${task.getPriority()}`;
        else {
            taskPrio.textContent = "";
        }
        if (task.getDifficulty() != null) {
            taskDiff.textContent = capitalizeFirstLetter(task.getDifficulty());
            taskDiff.setAttribute("class", `task-diff task-${task.getDifficulty()}`);
        }
        taskDue.textContent = `Due: ${task.getDueDate()}`;
        if (taskDue.textContent == "Due: ") {
            taskDue.textContent = "No due date :)"
        }

        const tagWrapper = document.querySelector(".tag-wrapper");
        tagWrapper.textContent = "";
        if (task.getTags()) {
            const tagArray = JSON.parse(task.getTags());
            tagArray.forEach( tag => {
                const tagText = tag.value;
                const tagDiv = document.createElement("div");
                tagDiv.setAttribute("class", "task-tag");
                tagDiv.textContent = "#" + tagText;
                tagWrapper.appendChild(tagDiv);
            });
        }

    }
    displayHome() {
        const editProjDiv = document.querySelector(".edit-proj-div");
        editProjDiv.style.display = "none";

        const projectBody = document.querySelector(".project-body");
        projectBody.style.display = "none";

        const homeContent = document.querySelector(".home-body");
        homeContent.style.display = "grid";

        const bodyHeader = document.querySelector(".body-header");
        bodyHeader.textContent = "My Todo's";
    }

    displayHomeDueSoon(dueSoonList) {
        const homeTaskWrapper = document.querySelector('.home-tasks-due-soon-wrapper');
        homeTaskWrapper.textContent = '';

        dueSoonList.forEach(({task, project}) => {
            this.displayDueSoonTask(task, project);
        });
    }

    displayDueSoonTask(task, project) {

        const taskWrapper = document.createElement("div");
        taskWrapper.setAttribute("class", "task-content-wrapper collapsible-wrapper");
        taskWrapper.setAttribute("data-task-due-id",`${task.getID()}`);

        const projectHeader = document.createElement('a');
        projectHeader.classList.add('task-due-soon-proj-link');
        projectHeader.setAttribute("data-proj-id",`${project.getProjectID()}`);
        projectHeader.textContent = '# ' + project.getProjectName();

        taskWrapper.appendChild(projectHeader);

        const inputCollapsible = document.createElement("input");
        inputCollapsible.setAttribute("id", `collapsible-home-${task.getID()}`);
        inputCollapsible.setAttribute("class", "toggle");
        inputCollapsible.setAttribute("type", "checkbox");
        taskWrapper.appendChild(inputCollapsible);

        const labelCollapsible = document.createElement("label");
        labelCollapsible.setAttribute("class", "lbl-toggle");
        if (task.getIsOverDue()) labelCollapsible.classList.add("overdue");
        else labelCollapsible.classList.add("due-soon");
        labelCollapsible.setAttribute("for", `collapsible-home-${task.getID()}`);
        taskWrapper.appendChild(labelCollapsible);

        const labelSpan = document.createElement("span");
        labelSpan.textContent = task.getTitle();
        labelSpan.setAttribute("class", "lbl-span");
        labelCollapsible.appendChild(labelSpan);

        const taskDueDateLabel = document.createElement("p");
        taskDueDateLabel.setAttribute("class", "task-due-date-label");
        taskDueDateLabel.textContent =  `Due: ${task.getDueDate()}`;
        labelCollapsible.appendChild(taskDueDateLabel);

        const contentCollapsible = document.createElement("div");
        contentCollapsible.setAttribute("class", "collapsible-content");
        taskWrapper.appendChild(contentCollapsible);

        const innerContentCollapsible = document.createElement("div");
        innerContentCollapsible.setAttribute("class","collapsible-content-inner");
        contentCollapsible.appendChild(innerContentCollapsible);

        const taskDesc = document.createElement("p");
        taskDesc.textContent = task.getDescription();
        taskDesc.setAttribute("class", "task-desc");
        innerContentCollapsible.appendChild(taskDesc);
        
        const taskPrio = document.createElement("p");
        if (task.getPriority() != "none") {
            taskPrio.textContent = `Priority: ${task.getPriority()}`;
        }
        taskPrio.setAttribute("class", "task-prio");
        innerContentCollapsible.appendChild(taskPrio);
        
        const taskDiff = document.createElement("p");
        if (task.getDifficulty()) {
            taskDiff.textContent = capitalizeFirstLetter(task.getDifficulty());
        }
        taskDiff.setAttribute("class", `task-diff task-${task.getDifficulty()}`);
        innerContentCollapsible.appendChild(taskDiff);
        

        const taskDueDate = document.createElement("p");
        taskDueDate.setAttribute("class", "task-due-date");
        taskDueDate.textContent =  `Due: ${task.getDueDate()}`;
        

        innerContentCollapsible.appendChild(taskDueDate);

        const tagWrapper = document.createElement("div");
        tagWrapper.setAttribute("class", "tag-wrapper");
        labelCollapsible.appendChild(tagWrapper);
        
        if (task.getTags()) {
            const tagArray = JSON.parse(task.getTags());
            tagArray.forEach( tag => {
                const tagText = tag.value;
                const tagDiv = document.createElement("div");
                tagDiv.setAttribute("class", "task-tag");
                tagDiv.textContent = "#" + tagText;
                tagWrapper.appendChild(tagDiv);
            });
        }

        const homeTaskWrapper = document.querySelector('.home-tasks-due-soon-wrapper');
        homeTaskWrapper.appendChild(taskWrapper);
    }



}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}