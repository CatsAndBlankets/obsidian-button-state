import MyPlugin from "main"
import { MarkdownPostProcessorContext, App, FileSystemAdapter, TFile, TFolder } from "obsidian"




export async function buttonStateBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext, app: App, plugin: MyPlugin) {
    let page = source.match(/page:\s(.*)/) != null ? String(source.match(/page:\s(.*)/)![1]).split(",") : "nothing"
    let tags = source.match(/tag:\s(.*)/) != null ? String(source.match(/tag:\s(.*)/)![1]).split(",") : ["nothing"]
    let names = source.match(/name:\s(.*)/) != null ? String(source.match(/name:\s(.*)/)![1]).split(",") : ["nothing"]
    let columns = Number(source.match(/columns:\s(\d+)/)) > 0 ? Number(source.match(/columns:\s(\d+)/)) : 3
    let range = source.match(/range:\s\[(\d+)\]/) != null ? String(source.match(/range:\s\[(\d+)\]/)![1]).split(",").map(Number) : [0, 1, 3, 7, 14]
    let colors = source.match(/colors:\s(\w+)/) != null ? String(source.match(/colors:\s(\w+)/)![1]).split(",") : plugin.settings.colors['default']

    const panel = el.createEl("div")
    panel.createEl("span", { text: "tags: " + String(tags[1]) + " fff " })
    panel.createEl("br")
    panel.createEl("span", { text: "names: " + String(names) + " wefaweaf " })
    panel.createEl("br")

    if ((tags.length != names.length) && (names[0] != "nothing")) {
        panel.createEl("span", { text: "Each tag needs a name!" })
        panel.createEl("br")
        return
    }

    panel.createEl("span", { text: page[0] })
    panel.createEl("br")
    panel.createEl("span", { text: page[1] })

    panel.createEl("br")
    // const result = this.app.vault.getFiles()
    // const result = this.app.vault.getFolderByPath(page[0])
    const result = this.app.vault.getAbstractFileByPath(page[0])

    if (result instanceof TFile) {
        panel.createEl("span", { text: "file" })
    }
    if (result instanceof TFolder) {
        panel.createEl("span", { text: "folder" })
        for (const i of result.children) {
            panel.createEl("br")
            panel.createEl("span", { text: "result: " + i.name })
            if (i instanceof TFile) {
                const text = await this.app.vault.cachedRead(i)
                // panel.createEl("span", { text: "reading file: " + text })
                // panel.createEl("br")
                if (text.match(/\#(\w+.*)/g) != null) {
                    panel.createEl("br")
                    panel.createEl("span", { text: "tags: " + text.match(/\#(\w+.*)/g) })
                }
            }
        }
    }
}


export function csvExample(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    const rows = source.split("\n").filter((row) => row.length > 0);
    const table = el.createEl("table");
    const body = table.createEl("tbody");

    for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].split(",");
        const row = body.createEl("tr");

        for (let j = 0; j < cols.length; j++) {
            row.createEl("td", { text: cols[j] });
        }
    }
}