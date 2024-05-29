import type MyPlugin from "main"
import { type MarkdownPostProcessorContext, type App, TFile, TFolder } from "obsidian"


export async function buttonStateBlock(source: string, el: HTMLElement, _ctx: MarkdownPostProcessorContext, _app: App, plugin: MyPlugin) {
    const src = source.match(/(^page:\s(.*)\n(.*\n){1,5}(.*)$)/gm)?.map(String)
    if (!src) return

    const panel = el.createEl("div", { cls: "button-state" })

    for (const s of src) {
        // set any custom settings for the presentation of the buttons
        panel.style.setProperty("--columns", Number(s.match(/columns:\s(\d+)/)?.[1]) > 0 ? String(s.match(/columns:\s(\d+)/)?.[1]) : String(3))
        const page = s.match(/page:\s(.*)/) != null ? String(s.match(/page:\s(.*)/)?.[1]) : "nothing"
        const range = s.match(/range:\s\[(\d+)\]/) != null ? String(s.match(/range:\s\[(\d+)\]/)?.[1]).split(",").map(Number) : [0, 1, 3, 7, 14]
        const tags = s.match(/tag:\s(.*)/) == null ? ["nothing"] :
            String(s.match(/tag:\s(.*)/)?.[1]).split(",").length === 1 ? [String(s.match(/tag:\s(.*)/)?.[1])] :
                String(s.match(/tag:\s(.*)/)?.[1]).replace(" ", "").split(",").map(String);

        const names = s.match(/name:\s(.*)/) != null ? String(s.match(/name:\s(.*)/)?.[1]).split(",") : tags;
        const reverse = s.match(/reverse:\s(.*)/) == null ? false : String(s.match(/reverse:\s(.*)/)?.[1]) === "true";
        const colors = s.match(/colors:\s(.*)/) == null ? plugin.settings.colors.default :
            String(s.match(/colors:\s(.*)/)?.[1]).split(",").length === 1 ? plugin.settings.colors[String(s.match(/colors:\s(.*)/)?.[1])] :
                String(s.match(/colors:\s(.*)/)?.[1]).split(",").map(String);

        const date_format = s.match(/date format:\s(.*)/) == null ? /(\d\d\d\d\/\d\d\/\d\d)/g :
            String(s.match(/date format:\s(.*)/)?.[1]) === "YYYY/MM/DD" ? /(\d\d\d\d\/\d\d\/\d\d)/g :
                /(\d\d\d\d-\d\d-\d\d)/g;

        if (tags.length !== names.length && names[0] !== "nothing") {
            el.createEl("span", { text: "Each tag needs a name!" })
            return
        }

        const result = this.app.vault.getAbstractFileByPath(page)

        for (let t = 0; t < tags.length; t++) {
            const btn = panel.createEl("button", { text: names[t] })

            if (result instanceof TFile) {
                findTags(result, tags[t], panel, btn, colors, range, reverse, date_format)
            } else if (result instanceof TFolder) {
                //Assuming that the date format of entries is YYYY-MM-DD, process files in reverse order to get latest entry with target tag(s) in it
                for (const i of result.children.reverse()) {
                    if (i instanceof TFile) { findTags(i, tags[t], panel, btn, colors, range, reverse, date_format) }
                }
            }
        }
    }
}


function findTags(file: TFile, tag: string, _el: HTMLElement, btn: HTMLElement, color: Array<string>, range: Array<number>, reverse: boolean, dateformat: RegExp) {
    const tags = this.app.metadataCache.getFileCache(file).tags

    if (!tags) return

    const today = new Date()
    const todayDate = new Date(`${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`)
    let diff: number | undefined;
    let zip: (string | number)[][];

    for (const key of Object.values(tags)) {
        const t = JSON.parse(JSON.stringify(key))
        if (t.tag.contains(tag)) {
            let date = new Date(t.tag.match(dateformat))
            if (date.valueOf() === 0) {
                date = new Date(String(file.name.match(dateformat)).replace("-", "/")) //apparently need to have date strings as YYYY/MM/DD for Date() to work properly?
            }

            diff = Math.round((todayDate.getTime() - date.getTime()) / (1000 * 3600 * 24))
            break
        }
    }

    if (!diff) return;
    if (range.length !== color.length) {
        document.createEl("span", { text: "range and colors need to be the same length!" })
        return
    }

    zip = reverse ? range.map((left, idx) => [left, color[color.length - 1 - idx]]) : range.map((left, idx) => [left, color[idx]])

    for (const z of zip) {
        if (String(diff) >= z[0]) {
            btn.style.setProperty("background-color", String(z[1]))
        }
    }

    btn.addEventListener("click", () => console.log("I did it :3"))
}














export function csvExample(source: string, el: HTMLElement, _ctx: MarkdownPostProcessorContext) {
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