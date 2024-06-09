import type MyPlugin from "main"
import { type MarkdownPostProcessorContext, TFile, TFolder } from "obsidian"
import { btnAction, JSONize } from "helper-functions"

export async function buttonStateBlock(source: string, el: HTMLElement, _ctx: MarkdownPostProcessorContext, plugin: MyPlugin) {
    const panel = el.createEl("div", { cls: "button-state" })
    const src = JSON.parse(JSONize(source))
    console.log(JSON.stringify(src))

    if (src.columns) {
        panel.style.setProperty("--columns", src.columns)
    }

    const colors: { [index: string]: string[] } = {}
    const days: { [index: string]: number[] } = {}
    if (src.colors) {
        for (const array of src.colors) {
            colors[array.name] = array.range
        }
    }
    if (src.ranges) {
        for (const array of src.ranges) {
            days[array.name] = array.range
        }
    }

    for (const page of src.pages) {
        const result = this.app.vault.getAbstractFileByPath(page.page)
        for (const tag of page.tags) {
            const btn = panel.createEl("button", { text: tag.name })
            // console.log(tag.tag)
            // if the color name is in the colors object, convert color name to an array
            if (colors[tag.color]) {
                tag.color = colors[tag.color]
            }
            // if the range name is in the days object, convert range name to an array
            if (days[tag.range]) {
                tag.range = days[tag.range]
            }
            const header = tag.header ? tag.header : page.header
            // console.log(tag.header)
            // console.log(page.header)
            if (result instanceof TFile) {
                console.log("file")
                findTags(result, tag, panel, btn, plugin, header)
            } else if (result instanceof TFolder) {
                console.log("folder")
                //Assuming that the date format of entries is YYYY-MM-DD, process files in reverse order to get latest entry with target tag(s) in it
                for (const i of result.children.reverse()) {
                    if (i instanceof TFile) {
                        findTags(i, tag, panel, btn, plugin, header)
                    }
                }
            }
        }
    }
}

function findTags(file: TFile, json: JSON, el: HTMLElement, btn: HTMLElement, plugin: MyPlugin, heading: string | undefined, repeat = 0) {
    const tag = JSON.parse(JSON.stringify(json))
    const tags = this.app.metadataCache.getFileCache(file).tags
    if (!tags) return
    const color = tag.color
        ? typeof tag.color === "string"
            ? plugin.settings.colors[tag.color]
                ? plugin.settings.colors[tag.color]
                : plugin.settings.colors.default
            : tag.color
        : plugin.settings.colors.default
    const range = tag.range ? tag.range : [0, 1, 3, 7, 14]
    const dateformat = tag.dateformat ? (tag.dateformat === "YYYY/MM/DD" ? /(\d\d\d\d\/\d\d\/\d\d)/g : /(\d\d\d\d-\d\d-\d\d)/g) : /(\d\d\d\d\/\d\d\/\d\d)/g

    if (tag.action && repeat === 0) {
        btn.addEventListener("click", async () => {
            await btnAction(this.app, file, el, tag.tag, tag.uri, heading)
            await sleep(100)
            findTags(file, json, el, btn, plugin, undefined, 1)
            console.log("done")
        })
    }

    // get today's date and then set time to midnight so that time is not influencing the difference in days
    const today = new Date()
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)

    let diff: number | undefined
    let zip: (string | number)[][]

    for (const t of tags) {
        if (t.tag.contains(tag.tag)) {
            // console.log("matched tag")
            let date = new Date(t.tag.match(dateformat))
            if (date.valueOf() === 0) {
                //apparently need to have date strings as YYYY/MM/DD for Date() to work properly?
                date = new Date(String(file.name.match(dateformat)).replace("-", "/"))
            }

            diff = Math.round((today.getTime() - date.getTime()) / (1000 * 3600 * 24))
            break
        }
    }

    // stop function if difference doesn't exist or is less than zero
    if (diff === undefined || (diff as number) < 0) return
    if (range.length !== color.length) {
        el.createEl("span", { text: "range and colors need to be the same length!" })
        return
    }

    zip = tag.reverse ? range.map((left: number, idx: number) => [left, color[color.length - 1 - idx]]) : range.map((left: number, idx: number) => [left, color[idx]])

    for (const z of zip) {
        if (String(diff) >= z[0]) {
            btn.style.setProperty("background-color", String(z[1]))
        }
    }
}

export function csvExample(source: string, el: HTMLElement, _ctx: MarkdownPostProcessorContext) {
    const rows = source.split("\n").filter(row => row.length > 0)
    const table = el.createEl("table")
    const body = table.createEl("tbody")

    for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].split(",")
        const row = body.createEl("tr")

        for (let j = 0; j < cols.length; j++) {
            row.createEl("td", { text: cols[j] })
        }
    }
}
