import { type Editor, MarkdownView, Notice, Plugin, type WorkspaceLeaf } from "obsidian"
import { ExampleView, VIEW_TYPE_EXAMPLE } from "view"
import { SampleModal, AddButtonModal, PaletteModal } from "modal"
import { SettingTab } from "settings"
import { buttonStateBlock, csvExample } from "code-block"
addIcon("square-arrow-up-right",`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-arrow-up-right"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 8h8v8"/><path d="m8 16 8-8"/></svg>`)
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
    mySetting: string
    colors: Record<string, Array<string>>
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: "default",
    colors: {
        default: [
            "rgba(var(--color-cyan-rgb), 0.7)",
            "rgba(var(--color-green-rgb), 0.7)",
            "rgba(var(--color-yellow-rgb), 0.7)",
            "rgba(var(--color-orange-rgb), 0.7)",
            "rgba(var(--color-red-rgb), 0.7)"
        ]
    }
}

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings

    async onload() {
        await this.loadSettings()
        // this.registerView(
        //     VIEW_TYPE_EXAMPLE,
        //     (leaf) => new ExampleView(leaf)
        // );

        // this.addRibbonIcon("dice", "Activate view", () => {
        //     this.activateView();
        // });

        //csv example given
        this.registerMarkdownCodeBlockProcessor("csv", (source, el, ctx) => {
            csvExample(source, el, ctx)
        })

        // render buttons in a custom code block
        // using a function to call it instead of just writing it all in main.ts
        // it gets confusing for me if everything is just stuffed into one file
        this.registerMarkdownCodeBlockProcessor("button-state", (source, el, ctx) => {
            buttonStateBlock(source, el, ctx, this)
        })

        // This creates an icon in the left ribbon.
        const ribbonIconEl = this.addRibbonIcon("dice", "Sample Plugin", (evt: MouseEvent) => {
            // Called when the user clicks the icon.
            new Notice("This is a notice! And I added a little extra")
        })

        // Create icon in left ribbon to open palette modal
        this.addRibbonIcon("mouse-pointer-click", "Make a Button", (evt: MouseEvent) => {
            new PaletteModal(this.app, this, () => {}).open()
        })

        // Create icon in left ribbon to open add button modal
        this.addRibbonIcon("square-arrow-up-right", "Make a Button", (evt: MouseEvent) => {
            new AddButtonModal(this.app, this, () => {}).open()
        })

        // Perform additional things with the ribbon
        ribbonIconEl.addClass("my-plugin-ribbon-class")

        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        const statusBarItemEl = this.addStatusBarItem()
        statusBarItemEl.setText("Status Bar Text")

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: "open-palette-maker",
            name: "Create new button palette",
            callback: () => {
                new PaletteModal(this.app, this, () => {}).open()
            }
        })

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: "open-sample-modal-simple",
            name: "Open sample modal (simple)",
            callback: () => {
                new SampleModal(this.app).open()
            }
        })
        // This adds an editor command that can perform some operation on the current editor instance
        this.addCommand({
            id: "sample-editor-command",
            name: "Sample editor command",
            editorCallback: (editor: Editor, view: MarkdownView) => {
                console.log(editor.getSelection())
                editor.replaceSelection("Sample Editor Command")
            }
        })
        // This adds a complex command that can check whether the current state of the app allows execution of the command
        this.addCommand({
            id: "open-sample-modal-complex",
            name: "Open sample modal (complex)",
            checkCallback: (checking: boolean) => {
                // Conditions to check
                const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView)
                if (markdownView) {
                    // If checking is true, we're simply "checking" if the command can be run.
                    // If checking is false, then we want to actually perform the operation.
                    if (!checking) {
                        new SampleModal(this.app).open()
                    }

                    // This command will only show up in Command Palette when the check function returns true
                    return true
                }
            }
        })

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SettingTab(this.app, this))

        // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
        // Using this function will automatically remove the event listener when this plugin is disabled.
        this.registerDomEvent(document, "click", (evt: MouseEvent) => {
            console.log("click", evt)
        })

        // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
        this.registerInterval(window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000))
    }

    onunload() {}

    async activateView() {
        const { workspace } = this.app

        let leaf: WorkspaceLeaf | null = null
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)

        if (leaves.length > 0) {
            // A leaf with our view already exists, use that
            leaf = leaves[0]
        } else {
            // Our view could not be found in the workspace, create a new leaf
            // in the right sidebar for it
            leaf = workspace.getRightLeaf(false)
            if (!leaf) return
            await leaf.setViewState({ type: VIEW_TYPE_EXAMPLE, active: true })
        }

        // "Reveal" the leaf in case it is in a collapsed sidebar
        workspace.revealLeaf(leaf)
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    }

    async saveSettings() {
        await this.saveData(this.settings)
    }
}
