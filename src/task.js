import _ from 'lodash';
import { isPast } from 'date-fns';

export default class Task {
    notes = "";
    tags;
    static id = 0;
    taskId;
    isDone = false;
    isOverdue;

    constructor(title, description, dueDate, priority, difficulty, tags, id=null) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.difficulty = difficulty;
        this.tags = tags;

        if (id === null) {
            this.taskId = Task.id++;
        }
        else {
            this.taskId = id;
            Task.id++;
        }

        if (this.dueDate) { this.isOverdue = isPast(this.dueDate); }
    }

    getTitle() {
        return this.title;
    }

    setTitle(newTitle) {
        this.title = newTitle;
    }

    getDescription() {
        return this.description;
    }

    setDescription(newDescription) {
        this.description = newDescription;
    }

    getDueDate() {
        return this.dueDate;
    }

    setDueDate(newDueDate) {
        this.dueDate = newDueDate;

        if (this.dueDate) { this.isOverdue = isPast(this.dueDate); }
    }

    getPriority() {
        return this.priority;
    }

    setPriority(newPriority) {

        this.priority = newPriority;
    }

    getDifficulty() {
        return this.difficulty;
    }

    setDifficulty(newDifficulty) {
        this.difficulty = newDifficulty;
    }

    setNotes(note) {
        this.notes = note;
    }

    getTags() {
        return this.tags;
    }

    addTag(newTag) {
        this.tags.push(newTag);
    }

    removeTag(tagToRemove) {
        _.remove(this.projectTasks, () => {
            _.isEqual(task, tagToRemove);
        });
    }

    getID() {
        return this.taskId;
    }

    getIsDone() {
        return this.isDone;
    }

    setIsDone(isDone) {
        this.isDone = isDone;
    }

    getIsOverDue() {
        return this.isOverdue;
    }

    setIsOverDue(isOverdue) {
        this.isOverdue = isOverdue;
    }

    editTask(title, description, dueDate, priority, difficulty, tags) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.difficulty = difficulty;
        this.tags = tags;
    }

}



