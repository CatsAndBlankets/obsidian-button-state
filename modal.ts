import {
	type App,
	Modal,
	Setting,
	sanitizeHTMLToDom,
	Notice,
	ColorComponent,
	setIcon,
} from "obsidian";
import { HSLToHex, initpickr } from "helper-functions";
import type MyPlugin from "main";
import type Pickr from "@simonwep/pickr";

export class SampleModal extends Modal {
	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class SettingModal extends Modal {
	onOpen() {
		const { contentEl } = this;
		contentEl.setText(
			sanitizeHTMLToDom(
				`Hm, that doesn't seem right. Make sure to have your colors in the following format:<br><br>[#hexcolorcode, #hexcolorcode, ... etc]`,
			),
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class AddAButtonModal extends Modal {
	plugin: MyPlugin;
	btnName: string;
	btnPalette: string[] = [];
	color_id: string | null;
	onSubmit: (btnName: string, btnPalette: string[]) => void;
	constructor(
		app: App,
		plugin: MyPlugin,
		onSubmit: (btnName: string, btnPalette: string[]) => void,
		color_id?: string,
	) {
		super(app);
		this.plugin = plugin;
		this.onSubmit = onSubmit;
		this.color_id = color_id ? color_id : null;
	}

	onOpen() {
		const { contentEl } = this;
		this.btnName = this.color_id ? this.color_id : "";
		let color = HSLToHex(
			Number(getComputedStyle(this.containerEl).getPropertyValue("--accent-h")),
			Number(
				getComputedStyle(this.containerEl)
					.getPropertyValue("--accent-s")
					.replace("%", ""),
			),
			Number(
				getComputedStyle(this.containerEl)
					.getPropertyValue("--accent-l")
					.replace("%", ""),
			),
		);
		contentEl.createEl("h1", { text: "What kind of button you wanting?" });

		new Setting(contentEl).setName("Button Name").addText((text) =>
			text.setValue(this.color_id ? this.color_id : "").onChange((value) => {
				this.btnName = value;
			}),
		);

		new Setting(contentEl)
			.setName("Button Color")
			.addButton((btn) => {
				btn.setClass("pickr").setIcon("palette");

				const p = initpickr();
				p.on("change", (c: Pickr.HSVaColor) => {
					(
						document.querySelector("button.pickr") as HTMLElement
					).style.setProperty("background", `${c.toHEXA().toString()}`);
					color = c.toHEXA().toString();
				});
			})
			.addButton((btn) =>
				btn.setIcon("plus").onClick(() => {
					if (!color) return;
					const list_item = color_list.createEl("li", {
						attr: { draggable: true },
					});
					const div = list_item.createEl("div");
					const color_div = div.createEl("div", { cls: "info-block" });
					color_div.createEl("div", {
						cls: "color-block",
						attr: { style: `background: ${color};` },
					});
					color_div.createEl("span", { text: color, cls: "hex-code" });
					const btn = div.createEl("button", { text: "huh" });
					btn.addEventListener("click", () => {
						list_item.remove();
					});
				}),
			);

		const div = contentEl.createEl("div");
		const color_list = div.createEl("ul", { attr: { id: "color-list" } });

		if (this.color_id) {
			const color_array = this.plugin.settings.colors[this.color_id];
			for (const c of color_array) {
				const list_item = color_list.createEl("li", {
					attr: { draggable: true },
				});
				const div = list_item.createEl("div");
				const color_div = div.createEl("div", { cls: "info-block" });
				color_div.createEl("div", {
					cls: "color-block",
					attr: { style: `background: ${c};` },
				});
				color_div.createEl("span", { text: c, cls: "hex-code" });
				const btn = div.createEl("button", { text: "huh" });
				btn.addEventListener("click", () => {
					list_item.remove();
				});
			}
		}

		const sortableList = document.getElementById("color-list") as HTMLElement;
		let draggedItem: HTMLElement | null = null;

		sortableList.addEventListener("dragstart", (e: DragEvent) => {
			draggedItem = e.target as HTMLElement;
			setTimeout(() => {
				(draggedItem as HTMLInputElement).style.opacity = "50%";
			}, 0);
		});

		sortableList.addEventListener("dragend", (e: DragEvent) => {
			setTimeout(() => {
				(draggedItem as HTMLInputElement).style.opacity = "100%";
				draggedItem = null;
			}, 0);
		});

		sortableList.addEventListener("dragover", (e: DragEvent) => {
			e.preventDefault();
			const afterElement = getDragAfterElement(sortableList, e.clientY);
			// const currentElement = document.querySelector(".dragging") as HTMLElement;
			if (afterElement === null) {
				sortableList.appendChild(draggedItem as HTMLElement);
			} else {
				sortableList.insertBefore(draggedItem as HTMLElement, afterElement);
			}
		});

		const getDragAfterElement = (
			container: HTMLElement,
			y: number,
		): HTMLElement | null => {
			const draggableElements = [
				...container.querySelectorAll<HTMLElement>("li:not(.dragging)"),
			];

			return draggableElements.reduce(
				(closest, child) => {
					const box = child.getBoundingClientRect();
					const offset = y - box.top - box.height / 2;
					if (offset < 0 && offset > closest.offset) {
						return { offset: offset, element: child };
					}
					return closest;
				},
				{ offset: Number.NEGATIVE_INFINITY, element: null },
			).element;
		};

		new Setting(contentEl).addButton((btn) =>
			btn.setButtonText("Submit").onClick(() => {
				for (const i of document.querySelectorAll('span[class="hex-code"]')) {
					(this.btnPalette as string[]).push(i.innerHTML);
				}

				if (!this.btnName && this.btnPalette.length === 0) {
					new Notice("There's nothing here!");
					return;
				}
				if (!this.btnName) {
					new Notice("Where's the palette name???");
					return;
				}
				if (this.btnPalette.length === 0) {
					new Notice("Where are the colors???");
					return;
				}

				this.plugin.settings.colors[this.btnName] = this.btnPalette;
				(async () => {
					await this.plugin.saveSettings();
				})();
				this.close();
				this.onSubmit(this.btnName, this.btnPalette);
			}),
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		for (const d of document.getElementsByClassName("pcr-app")) {
			d.remove();
		}
	}
}
