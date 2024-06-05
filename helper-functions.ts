import Pickr from "@simonwep/pickr"
import type { App, TFile } from "obsidian"

export function HSLToHex(h: number, s: number, l: number) {
    const ss = s / 100
    const ll = l / 100

    const c = (1 - Math.abs(2 * ll - 1)) * ss
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = ll - c / 2
    let r = 0
    let g = 0
    let b = 0

    if (0 <= h && h < 60) {
        r = c
        g = x
        b = 0
    } else if (60 <= h && h < 120) {
        r = x
        g = c
        b = 0
    } else if (120 <= h && h < 180) {
        r = 0
        g = c
        b = x
    } else if (180 <= h && h < 240) {
        r = 0
        g = x
        b = c
    } else if (240 <= h && h < 300) {
        r = x
        g = 0
        b = c
    } else if (300 <= h && h < 360) {
        r = c
        g = 0
        b = x
    }
    // Having obtained RGB, convert channels to hex
    let rr = Math.round((r + m) * 255).toString(16)
    let gg = Math.round((g + m) * 255).toString(16)
    let bb = Math.round((b + m) * 255).toString(16)

    // Prepend 0s, if necessary
    if (rr.length === 1) rr = `0${rr}`
    if (gg.length === 1) gg = `0${gg}`
    if (bb.length === 1) bb = `0${bb}`

    return `#${rr}${gg}${bb}`
}

export function RGBToHex(rgb: string) {
    const n = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)

    if (!n) return
    function hex(x: string) {
        return `0${Number.parseInt(x).toString(16)}`.slice(-2)
    }
    return `#${hex(n[1])}${hex(n[2])}${hex(n[3])}`
}

export function initpickr(color: string, c: string) {
    const pickr = Pickr.create({
        // Selector or element which will be replaced with the actual color-picker.
        // Can be a HTMLElement.
        el: document.querySelector("button.pickr") as HTMLElement,

        // Where the pickr-app should be added as child.
        container: c,

        // Which theme you want to use. Can be 'classic', 'monolith' or 'nano'
        theme: "nano",

        // Nested scrolling is currently not supported and as this would be really sophisticated to add this
        // it's easier to set this to true which will hide pickr if the user scrolls the area behind it.
        closeOnScroll: false,

        // Custom class which gets added to the pcr-app. Can be used to apply custom styles.
        // appClass: 'custom-class',

        // Don't replace 'el' Element with the pickr-button, instead use 'el' as a button.
        // If true, appendToBody will also be automatically true.
        useAsButton: true,

        // Size of gap between pickr (widget) and the corresponding reference (button) in px
        padding: 8,

        // If true pickr won't be floating, and instead will append after the in el resolved element.
        // It's possible to hide it via .hide() anyway.
        inline: false,

        // If true, pickr will be repositioned automatically on page scroll or window resize.
        // Can be set to false to make custom positioning easier.
        autoReposition: true,

        // Defines the direction in which the knobs of hue and opacity can be moved.
        // 'v' => opacity- and hue-slider can both only moved vertically.
        // 'hv' => opacity-slider can be moved horizontally and hue-slider vertically.
        // Can be used to apply custom layouts
        sliders: "h",

        // Start state. If true 'disabled' will be added to the button's classlist.
        disabled: false,

        // If true, the user won't be able to adjust any opacity.
        // Opacity will be locked at 1 and the opacity slider will be removed.
        // The HSVaColor object also doesn't contain an alpha, so the toString() methods just
        // print HSV, HSL, RGB, HEX, etc.
        lockOpacity: true,

        // Precision of output string (only effective if components.interaction.input is true)
        outputPrecision: 0,

        // Defines change/save behavior:
        // - to keep current color in place until Save is pressed, set to `true`,
        // - to apply color to button and preview (save) in sync with each change
        //   (from picker or palette), set to `false`.
        comparison: false,

        // Default color. If you're using a named color such as red, white ... set
        // a value for defaultRepresentation too as there is no button for named-colors.
        // default: "#42445a",
        default: color,

        // Optional color swatches. When null, swatches are disabled.
        // Types are all those which can be produced by pickr e.g. hex(a), hsv(a), hsl(a), rgb(a), cmyk, and also CSS color names like 'magenta'.
        // Example: swatches: ['#F44336', '#E91E63', '#9C27B0', '#673AB7'],
        swatches: ["#F44336", "#E91E63", "#9C27B0", "#673AB7"],
        // swatches: null,

        // Default color representation of the input/output textbox.
        // Valid options are `HEX`, `RGBA`, `HSVA`, `HSLA` and `CMYK`.
        defaultRepresentation: "HEXA",

        // Option to keep the color picker always visible.
        // You can still hide / show it via 'pickr.hide()' and 'pickr.show()'.
        // The save button keeps its functionality, so still fires the onSave event when clicked.
        showAlways: false,

        // Close pickr with a keypress.
        // Default is 'Escape'. Can be the event key or code.
        // (see: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)
        closeWithKey: "Escape",

        // Defines the position of the color-picker.
        // Any combinations of top, left, bottom or right with one of these optional modifiers: start, middle, end
        // Examples: top-start / right-end
        // If clipping occurs, the color picker will automatically choose its position.
        // Pickr uses https://github.com/Simonwep/nanopop as positioning-engine.
        position: "bottom-middle",

        // Enables the ability to change numbers in an input field with the scroll-wheel.
        // To use it set the cursor on a position where a number is and scroll, use ctrl to make steps of five
        adjustableNumbers: true,

        // Show or hide specific components.
        // By default only the palette (and the save button) is visible.
        components: {
            // Defines if the palette itself should be visible.
            // Will be overwritten with true if preview, opacity or hue are true
            palette: true,

            preview: true, // Display comparison between previous state and new color
            opacity: false, // Display opacity slider
            hue: true, // Display hue slider

            // show or hide components on the bottom interaction bar.
            interaction: {
                // // Buttons, if you disable one but use the format in default: or setColor() - set the representation-type too!
                // hex: false,  // Display 'input/output format as hex' button  (hexadecimal representation of the rgba value)
                // rgba: false, // Display 'input/output format as rgba' button (red green blue and alpha)
                // hsla: false, // Display 'input/output format as hsla' button (hue saturation lightness and alpha)
                // hsva: false, // Display 'input/output format as hsva' button (hue saturation value and alpha)
                // cmyk: false, // Display 'input/output format as cmyk' button (cyan mangenta yellow key )

                input: true // Display input/output textbox which shows the selected color value.
                // the format of the input is determined by defaultRepresentation,
                // and can be changed by the user with the buttons set by hex, rgba, hsla, etc (above).
                // cancel: false, // Display Cancel Button, resets the color to the previous state
                // clear: false, // Display Clear Button; same as cancel, but keeps the window open
                // save: false,  // Display Save Button,
            }
        },

        // Translations, these are the default values.
        i18n: {
            // Strings visible in the UI
            "ui:dialog": "color picker dialog",
            "btn:toggle": "toggle color picker dialog",
            "btn:swatch": "color swatch",
            "btn:last-color": "use previous color",
            "btn:save": "Save",
            "btn:cancel": "Cancel",
            "btn:clear": "Clear",

            // Strings used for aria-labels
            "aria:btn:save": "save and close",
            "aria:btn:cancel": "cancel and close",
            "aria:btn:clear": "clear and close",
            "aria:input": "color input field",
            "aria:palette": "color selection area",
            "aria:hue": "hue selection slider",
            "aria:opacity": "selection slider"
        }
    })
    // .on('init', (instance: Pickr) => {
    //     console.log('Event: "init"', instance);
    // }).on('hide', (instance: Pickr) => {
    //     console.log('Event: "hide"', instance);
    // }).on('show', (color: Pickr.HSVaColor, instance: Pickr) => {
    //     console.log('Event: "show"', color, instance);
    // }).on('save', (color: Pickr.HSVaColor, instance: Pickr) => {
    //     console.log('Event: "save"', color, instance);
    // }).on('clear', (instance: Pickr) => {
    //     console.log('Event: "clear"', instance);
    //     // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    // }).on('change', (color: Pickr.HSVaColor, source: any, instance: Pickr) => {
    //     console.log('Event: "change"', color, source, instance);
    // })
    // .on('changestop', (source: any, instance: Pickr) => {
    //     console.log('Event: "changestop"', source, instance);
    // }).on('cancel', (instance: Pickr) => {
    //     console.log('Event: "cancel"', instance);
    // }).on('swatchselect', (color: Pickr.HSVaColor, instance: Pickr) => {
    //     console.log('Event: "swatchselect"', color, instance);
    // });

    return pickr
}

export async function btnAction(app: App, file: TFile, el: HTMLElement, text: string, uri: string) {
    console.log("hrere")
    console.log(uri)
    if (uri) {
        const link = el.createEl("a", { attr: { href: uri } })
        link.click()
        return
    }

    const f = app.metadataCache.getFileCache(file)
    const headings = f?.headings
    if (!headings) return
    const a = await app.vault.cachedRead(file)
    const today = new Date()
    // biome-ignore lint/style/useTemplate: <explanation>
    const month = ("0" + String(today.getMonth() + 1)).slice(-2)
    // biome-ignore lint/style/useTemplate: <explanation>
    const date = ("0" + String(today.getDate())).slice(-2)
    const todayDate = `${today.getFullYear()}/${month}/${date}`
    let heading = ""
    for (const h of headings) {
        console.log(h.heading.toLowerCase().includes("poop"))
        if (h.heading.toLowerCase().includes("poop")) {
            heading = `${"#".repeat(h.level)} ${h.heading}`
            break
        }
    }

    const array = a.split(heading)
    array.splice(1, 0, `${heading}\n`)
    array.splice(2, 0, `${text}\/${todayDate}`)

    let result = ""

    for (const a of array) {
        result += a
    }
    // console.log(String(array))
    // console.log(result)
    // console.log( new Date())

    app.vault.process(file, () => result)
}

export function JSONize(str: string) {
    return (
        str
            // wrap everything in brackets
            .replace(/((.+[\s\n]*)+)/g, $1 => `{${$1}}`)
            // wrap all pages in a pages record
            .replace(/((page:.*\n(([\s]*tag:.*[\n])+))+)/gm, `"pages": [$1],`)
            // wrap each page record in brackets
            .replace(/(page:.*\n(([\s]*tag:.*[\n])+))/gm, "{$1},")
            // wrap each tag in a tags record
            .replace(/\n(([\s]*tag:.*[\n])+)/gm, ` "tags":[$1],`)
            // wrap each tag record in brackets
            .replace(/(tag:.*[\n])/gm, $1 => `{${$1}},`)
            // wrap each range in an array
            .replace(/ranges:.*\n(([\s]*range:.*[\n])+)/gm, `"ranges":[$1],`)
            // wrap each color palette in an array
            .replace(/colors:.*\n(([\s]*range:.*[\n])+)/gm, `"colors":[$1],`)
            // wrap each range record in brackets
            .replace(/(range:.*[\n])/gm, "{$1},")
            // wrap variables in "variable: " in double quotes
            .replace(/([\w]+):\s/gm, `"$1":`)
            // adding in commas
            .replace(/(\"\s\")/gm, `","`)
            // adding in commas when using boolean values
            .replace(/(true\s\")/gm, `true,"`)
            // adding in commas when using boolean values
            .replace(/(false\s\")/gm, `false,"`)
            // removing trailing commas },] variation
            .replace(/([}][,][\s\n]{0,}[\]])/gm, "}]")
            // removing trailing commas ],} variation
            .replace(/([\]][,][\s\n]{0,}[}])/gm, "]}")
            // removing trailing commas },} variation
            .replace(/([}][,][\s\n]{0,}[}])/gm, "}}")
            // removing trailing commas ],] variation
            .replace(/([\]][,][\s\n]{0,}[\]])/gm, "]]")
            // removing trailing commas ] " variation
            .replace(/([\]][\s]["])/gm, '], "')
    )
}
