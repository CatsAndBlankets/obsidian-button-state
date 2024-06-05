/*
data in the dv.view() would be as follows:
{
    page: [{page: "", header: ""}, {}]
    tags: [[{tag: "", name: "", action: false, reverse: false, uri:"link"},{}], [{},{}]]
    colors: {"colornaem": [colors here]}
    ranges: {"range anem": [range]}
    columns: number
})

*/

const { pages, tags, columns, colors, ranges, css = "./view.css" } = input;

const rootNode = dv.el("div", "", { cls: "buttonState", attr: { id: "buttonState", style: 'position:relative;-webkit-user-select:none!important' } });
rootNode.innerHTML = null;

if (css) { const style = document.createElement("style"); style.innerHTML = css; rootNode.append(style) }

if (columns) rootNode.style.setProperty("--columns", columns);

const colorArray = { default: ["var(--great)", "var(--good)", "var(--okay)", "var(--not-okay)", "var(--bad)"] };
const dayArray = { default: [0, 1, 3, 7, 14] };

if (colors) { for (const [name, array] of Object.entries(colors)) { colorArray[name] = array; } }
if (ranges) { for (const [name, array] of Object.entries(ranges)) { dayArray[name] = array; } }



for (const [index, page] of pages.entries()) {
    const pageTags = tags[index];
    if (!pageTags) {
        rootNode.appendChild(dv.el("button", page.name, { attr: { id: page, type: "button"} }));
        if (page.uri) { document.getElementById(page).addEventListener("click", () => clickLink(page.uri)); }
        break;
    }
    for (const tag of pageTags) {
        const button = rootNode.appendChild(dv.el("button", tag.name, { attr: { id: tag.tag, type: "button", path: page.page } }));
        let diff = 0;
        let zip;

        if (page.folder) {
            const matchedTags = dv.pages(`"${page.page}" and ${tag.tag}`).sort(p => p.file.name, 'desc')[0].file.path; // making sure to grab the latest file with the tag
            const date = moment(matchedTags.match(/(\d\d\d\d-\d\d-\d\d)/g), "YYYY-MM-DD");
            diff = moment().diff(moment(date), 'days');
        } else {
            const matchedTags = dv.pages(`"${page.page}" and ${tag.tag}`).file.etags;
            if (!matchedTags) { dv.span("Didn't find anything!"); break; }

            for (const t of matchedTags) {
                if (t.includes(tag.tag)) {
                    const date = moment(t.match(/(\d\d\d\d\/\d\d\/\d\d)/g), "YYYY/MM/DD");
                    diff = moment().diff(moment(date), 'days');
                    break; // once tag has been found, move on to the next tag to look for
                }
            }
        }

        const days = tag.range ? dayArray[tag.range] : dayArray.default;
        const color = tag.color ? colorArray[tag.color] : colorArray.default;

        if (tag.reverse) {
            zip = days.map((left, idx) => [left, color[color.length - 1 - idx]]);
        } else {
            zip = days.map((left, idx) => [left, color[idx]]);
        }

        for (const z of zip) {
            if (diff >= z[0]) {
                button.style.setProperty("background-color", z[1]);
            }
        }

        if (tag.action) {
            ((() => {
                if (tag.uri) {
                    document.getElementById(tag.tag).addEventListener("click", () => clickLink(tag.uri));
                } else {
                    document.getElementById(tag.tag).addEventListener("click", () => addTag(tag.tag, page.page, page.header));
                }
            })());
        }
    }
}


function addTag(tag, path, heading) {
    const slash = "%252F";
    const space = "%2520";

    // Copy tag into clipboard
    navigator.clipboard.writeText(`${tag}/${String(moment().format("YYYY/MM/DD"))}`);

    // Starting off the advanced uri link
    let url = `obsidian://advanced-uri?valut=${this.app.vault.adapter.basePath.split("\\").slice(-1)}&filepath=`;

    let page = path;
    page = page.replace(/\//g, slash);
    page = page.replace(/\s/g, space);

    url += `${page}&mode=prepend&clipboard=true&openmode=silent`;

    if (heading) url += `&heading=${heading}`;

    clickLink(url);
}


function clickLink(url) {
    dv.el("a", "", { attr: { id: "addthetask", href: url } });
    document.getElementById("addthetask").click();
}
