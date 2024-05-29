import { type App, PluginSettingTab, Setting, sanitizeHTMLToDom, Notice } from "obsidian";
import { SettingModal } from "modal";
import type MyPlugin from "main";

export class SampleSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Setting #1')
            .setDesc('It\'s a secret')
            .addText(text => text
                .setPlaceholder('Enter your secret')
                .setValue(this.plugin.settings.mySetting)
                .onChange(async (value) => {
                    this.plugin.settings.mySetting = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Colors')
            .setDesc(
                sanitizeHTMLToDom(
                    'Store custom color palettes for your buttons.<br>**Note: the default colors are using the <a href="https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors">CSS color variables</a> defined by Obsidian<br>Custom set color palettes will show your color array input'
                )
            );

        if (!this.plugin.settings.colors) return;
        for (const [name, value] of Object.entries(this.plugin.settings.colors)) {
            const div = containerEl.createDiv({ attr: { style: 'display: flex; align-items: center; justify-content: space-between;' } })
            const color_row = div.createDiv({ attr: { style: 'display: block;' } })

            color_row.createEl('h6', { text: String(name), attr: { style: 'margin-bottom: 0; margin-top: 0;' } })
            for (const v of value) {

                color_row.createEl('pre', { text: name === 'default' ? ` ${String(v.split("-")[3])}` : ` ${String(v)}`, attr: { style: 'padding: var(--size-2-1); margin: 0; margin-top: var(--size-2-1); display: inline-block;' } }).createDiv({ attr: { style: `background: ${v}; height: var(--size-4-3); width: var(--size-4-3); float: left; margin-top: var(--size-4-1); clear: both;` } })
            }

            if (name !== 'default') {
                const del_button = div.createEl('button', { text: 'delete', attr: { style: 'background: var(--interactive-accent);' } })
                del_button?.addEventListener("click", async () => {
                    this.deletePalette(name);
                    new Notice('bye bye!');
                })
            }
        }
        const div = containerEl.createDiv({ attr: { style: 'display: flex; justify-content: space-between;' } })
        const color_name = div.createEl('input', { type: 'text', placeholder: 'what are we calling this?', attr: { style: 'margin-right: var(--size-4-1);' } })
        const color_array = div.createEl('input', { type: 'text', placeholder: 'gimme an array of colors please!', attr: { style: 'flex-grow: 1; margin-right: var(--size-4-1);' } })
        const add_button = div.createEl('button', { text: 'add color palette', attr: { style: 'background: var(--interactive-accent);' } })

        add_button?.addEventListener("click", async () => {
            if (!color_name.value) return;
            if (!color_array.value) return;

            const colors: string[] = [];
            for (const c of color_array.value.replace('[', '').replace(']', '').replace(/\s/g, '').split(',')) colors.push(c)
            this.plugin.settings.colors[color_name.value] = colors; await this.plugin.saveSettings(); this.display(); new SettingModal(this.app).open()
        })
    }

    async deletePalette(key: string) {
        delete this.plugin.settings.colors[key];
        await this.plugin.saveSettings();
        this.display();
    }
}

