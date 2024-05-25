import { App, Modal } from "obsidian";

export class SampleModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.setText('Woah!');
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

export class SettingModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.setText('This should be a different modal than the first one');
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}