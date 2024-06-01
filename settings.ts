import { type App, PluginSettingTab, Setting, sanitizeHTMLToDom, Notice, setIcon } from "obsidian";
import { SettingModal, AddAButtonModal } from "modal";
import type MyPlugin from "main";

export class SettingTab extends PluginSettingTab {
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
                    'Store custom color palettes for your buttons.<br>**Note: the default colors are using the <a href="https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors">CSS color variables</a> defined by Obsidian<br><br>Not sure how to make HEX code colors? Use this <a href="https://htmlcolorcodes.com/color-picker/">htmlcolorcode.com</a>!'
                )
            );

        if (!this.plugin.settings.colors) return;
        for (const [name, value] of Object.entries(this.plugin.settings.colors)) {
            const div_main = containerEl.createDiv({ cls: "settings main" })
            const div = div_main.createDiv({ cls: "settings colors" })
            div.createEl('h6', { text: String(name), attr: { style: 'margin-bottom: 0; margin-top: 0;' } })
            const color_row = div.createDiv({ cls: "info-block" })

            for (const v of value) {
                const info_block = color_row.createDiv({ cls: "info-block" })
                info_block.createDiv({ cls: "color-block", attr: { style: `background: ${v};` } })
                info_block.createEl("span", { text: name === 'default' ? `${String(v.split("-")[3])}` : `${String(v)}`, cls: "hex-code" })
            }

            if (name !== 'default') {
                const btnDiv = div_main.createDiv({ cls: "settings buttons" })
                const edit_btn = btnDiv.createEl('button')
                setIcon(edit_btn, "pencil-line")
                edit_btn?.addEventListener("click", async () => {
                    new AddAButtonModal(this.app, this.plugin, () => { this.display(); }, name).open();
                })

                const del_button = btnDiv.createEl('button')
                setIcon(del_button, "trash-2")
                del_button?.addEventListener("click", async () => {
                    this.deletePalette(name);
                    new Notice(`bye bye ${name}!`);
                })
            }
        }

        const div = containerEl.createDiv({ cls: "settings" })
        const color_name = div.createEl('input', { type: 'text', placeholder: 'what are we calling this?', cls: "settings" })
        const color_array = div.createEl('input', { type: 'text', placeholder: 'gimme an array of colors please!', cls: "settings" })
        const add_button = div.createEl('button', { text: 'add color palette', attr: { style: 'background: var(--interactive-accent);' } })

        add_button?.addEventListener("click", async () => {
            if ((!color_name.value) && (!color_array.value)) { new Notice("There's nothing here!"); return; }
            if (!color_name.value) { new Notice("Where's the palette name???"); return; }
            if (!color_array.value) { new Notice("Where are the colors???"); return; }
            console.log(color_array.value.match(/(\[(\#.*\,(\s)?)?(\#.*)\])/g))
            if (!color_array.value.match(/(\[(\#.*\,(\s)?)?(\#.*)\])/g)) {
                new SettingModal(this.app).open()
                return;
            }

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

