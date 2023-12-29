let RendererMarkdown$1 = class RendererMarkdown {
    static async pInit() {
        const settings = await StorageUtil.pGet("bookViewSettingsMarkdown") || Object.entries(RendererMarkdown$1._CONFIG).mergeMap(([k,v])=>({
            [k]: v.default
        }));
        Object.assign(RendererMarkdown$1, settings);
        RendererMarkdown$1._isInit = true;
    }

    static checkInit() {
        if (!RendererMarkdown$1._isInit)
            throw new Error(`RendererMarkdown has not been initialised!`);
    }

    getLineBreak() {
        return "\n";
    }

    constructor() {
        const renderer = new Renderer();
        this.__super = {};
        for (const k in renderer) {
            if (this[k] === undefined) {
                if (typeof renderer[k] === "function")
                    this[k] = renderer[k].bind(this);
                else
                    this[k] = MiscUtil.copy(renderer[k]);
            } else {
                if (typeof renderer[k] === "function")
                    this.__super[k] = renderer[k].bind(this);
                else
                    this.__super[k] = MiscUtil.copy(renderer[k]);
            }
        }

        this._isSkipStylingItemLinks = false;
    }

    set isSkipStylingItemLinks(val) {
        this._isSkipStylingItemLinks = val;
    }

    static get() {
        RendererMarkdown$1.checkInit();

        return new RendererMarkdown$1().setFnPostProcess(RendererMarkdown$1._fnPostProcess);
    }

    static _fnPostProcess(str) {
        return str.trim().replace(/\n\n+/g, "\n\n").replace(/(>\n>\n)+/g, ">\n");
    }

    static _getNextPrefix(options, prefix) {
        return options.prefix === ">" || options.prefix === ">>" ? `${options.prefix}${prefix || ""}` : prefix || "";
    }

    _renderEntriesSubtypes(entry, textStack, meta, options, incDepth) {
        const isInlineTitle = meta.depth >= 2;
        const nextDepth = incDepth && meta.depth < 2 ? meta.depth + 1 : meta.depth;

        const nxtPrefix = RendererMarkdown$1._getNextPrefix(options);
        if (entry.name) {
            if (isInlineTitle) {
                textStack[0] += `${nxtPrefix}***${Renderer.stripTags(entry.name)}.*** `;
            } else {
                const hashCount = meta._typeStack.length === 1 && meta.depth === -1 ? 1 : Math.min(6, meta.depth + 3);
                textStack[0] += `\n${nxtPrefix}${"#".repeat(hashCount)} ${Renderer.stripTags(entry.name)}\n\n`;
            }
        }

        if (entry.entries) {
            this._renderEntriesSubtypes_renderPreReqText(entry, textStack, meta);
            const cacheDepth = meta.depth;
            const len = entry.entries.length;
            for (let i = 0; i < len; ++i) {
                meta.depth = nextDepth;
                const isFirstInline = i === 0 && entry.name && isInlineTitle;
                const suffix = meta.isStatblockInlineMonster ? `  \n` : `\n\n`;
                this._recursiveRender(entry.entries[i], textStack, meta, {
                    prefix: isFirstInline ? "" : RendererMarkdown$1._getNextPrefix(options),
                    suffix
                });
            }
            if (meta.isStatblockInlineMonster)
                textStack[0] += "\n";
            meta.depth = cacheDepth;
        }
    }

    _renderEntriesSubtypes_renderPreReqText(entry, textStack, meta) {
        if (entry.prerequisite) {
            textStack[0] += `*Prerequisite: `;
            this._recursiveRender({
                type: "inline",
                entries: [entry.prerequisite]
            }, textStack, meta);
            textStack[0] += `*\n\n`;
        }
    }

    _renderList(entry, textStack, meta, options) {
        if (!entry.items)
            return;

        if (textStack[0] && textStack[0].slice(-1) !== "\n")
            textStack[0] += "\n";

        const listDepth = Math.max(meta._typeStack.filter(it=>it === "list").length - 1, 0);

        if (entry.name)
            textStack[0] += `##### ${entry.name}`;
        const indentSpaces = "  ".repeat(listDepth);
        const len = entry.items.length;

        if (entry.data && entry.data.isSpellList) {
            textStack[0] += `${RendererMarkdown$1._getNextPrefix(options)}\n`;
            for (let i = 0; i < len; ++i) {
                textStack[0] += `${RendererMarkdown$1._getNextPrefix(options)}${indentSpaces}`;
                const cacheDepth = this._adjustDepth(meta, 1);
                this._recursiveRender(entry.items[i], textStack, meta, {
                    suffix: "\n"
                });
                meta.depth = cacheDepth;
            }
        } else {
            for (let i = 0; i < len; ++i) {
                const item = entry.items[i];
                textStack[0] += `${RendererMarkdown$1._getNextPrefix(options)}${indentSpaces}${item.type === "list" ? "" : `- `}`;

                const cacheDepth = this._adjustDepth(meta, 1);
                this._recursiveRender(entry.items[i], textStack, meta, {
                    suffix: "\n"
                });
                if (textStack[0].slice(-2) === "\n\n")
                    textStack[0] = textStack[0].slice(0, -1);
                meta.depth = cacheDepth;
            }
        }

        textStack[0] += "\n";
    }

    _renderTable(entry, textStack, meta, options) {
        if (entry.intro)
            for (const ent of entry.intro)
                this._recursiveRender(ent, textStack, meta);

        textStack[0] += "\n";

        if (entry.caption)
            textStack[0] += `##### ${entry.caption}\n`;

        const headerRowMetas = Renderer.table.getHeaderRowMetas(entry);

        const hasLabels = headerRowMetas != null;
        if (!hasLabels && (!entry.rows || !entry.rows.length)) {
            textStack[0] += `|   |\n`;
            textStack[0] += `|---|\n`;
            textStack[0] += `|   |\n`;
            return;
        }

        let labelRows = MiscUtil.copyFast(headerRowMetas || []);
        if (!hasLabels) {
            const numCells = Math.max(...entry.rows.map(r=>r.length));
            labelRows = [[...new Array(numCells)].map(()=>""), ];
        }

        if (entry.colStyles) {
            labelRows.filter(labelRow=>labelRow.length < entry.colStyles.length).forEach(labelRow=>{
                labelRow.push(...[...new Array(entry.colStyles.length - labelRow.length)].map(()=>""), );
            }
            );
        }

        let styles = null;
        if (entry.colStyles) {
            styles = [...entry.colStyles];
            labelRows.forEach(labelRow=>{
                if (labelRow.length > styles.length) {
                    styles = styles.concat([...new Array(labelRow.length - styles.length)].map(()=>""));
                }
            }
            );
        }

        const mdHeaderRows = labelRows.map(labelRow=>labelRow.map(label=>` ${Renderer.stripTags(label)} `));

        const widths = [...new Array(Math.max(...mdHeaderRows.map(mdHeaderRow=>mdHeaderRow.length)),), ].map((_,i)=>{
            return Math.max(...mdHeaderRows.map(mdHeaderRow=>(mdHeaderRow[i] || "").length), RendererMarkdown$1._md_getPaddedStyleText({
                style: (styles || [])[i] || ""
            }).length, );
        }
        );

        const mdTable = [];

        const numRows = entry.rows.length;
        for (let ixRow = 0; ixRow < numRows; ++ixRow) {
            const row = entry.rows[ixRow];

            const rowRender = row.type === "row" ? row.row : row;

            const numCells = rowRender.length;
            for (let ixCell = 0; ixCell < numCells; ++ixCell) {
                const cell = rowRender[ixCell];

                let toRenderCell;

                if (cell.type === "cell") {
                    if (cell.roll) {
                        if (cell.roll.entry)
                            toRenderCell = cell.roll.entry;
                        else if (cell.roll.exact != null)
                            toRenderCell = cell.roll.pad ? StrUtil.padNumber(cell.roll.exact, 2, "0") : cell.roll.exact;
                        else {
                            toRenderCell = cell.roll.pad ? `${StrUtil.padNumber(cell.roll.min, 2, "0")}-${StrUtil.padNumber(cell.roll.max, 2, "0")}` : `${cell.roll.min}-${cell.roll.max}`;
                        }
                    } else if (cell.entry) {
                        toRenderCell = cell.entry;
                    }
                } else {
                    toRenderCell = cell;
                }

                const textStackCell = [""];
                const cacheDepth = this._adjustDepth(meta, 1);
                this._recursiveRender(toRenderCell, textStackCell, meta);
                meta.depth = cacheDepth;

                const mdCell = ` ${textStackCell.join("").trim()} `.split(/\n+/).join("<br>");

                widths[ixCell] = Math.max(widths[ixCell] || 0, mdCell.length);
                (mdTable[ixRow] = mdTable[ixRow] || [])[ixCell] = mdCell;
            }
        }

        const mdHeaderRowsPadded = mdHeaderRows.map(mdHeaderRow=>{
            return mdHeaderRow.map((header,ixCell)=>RendererMarkdown$1._md_getPaddedTableText({
                text: header,
                width: widths[ixCell],
                ixCell,
                styles
            }));
        }
        );

        const mdStyles = [];
        if (styles) {
            styles.forEach((style,i)=>{
                mdStyles.push(RendererMarkdown$1._md_getPaddedStyleText({
                    style,
                    width: widths[i]
                }));
            }
            );
        }

        for (const mdHeaderRowPadded of mdHeaderRowsPadded) {
            textStack[0] += `|${mdHeaderRowPadded.join("|")}|\n`;
        }
        if (mdStyles.length)
            textStack[0] += `|${mdStyles.join("|")}|\n`;
        for (const mdRow of mdTable) {
            textStack[0] += "|";

            const numCells = mdRow.length;
            for (let ixCell = 0; ixCell < numCells; ++ixCell) {
                textStack[0] += RendererMarkdown$1._md_getPaddedTableText({
                    text: mdRow[ixCell],
                    width: widths[ixCell],
                    ixCell,
                    styles
                });
                textStack[0] += "|";
            }

            textStack[0] += "\n";
        }

        if (entry.footnotes) {
            for (const ent of entry.footnotes) {
                const cacheDepth = this._adjustDepth(meta, 1);
                this._recursiveRender(ent, textStack, meta);
                meta.depth = cacheDepth;
            }
        }
        if (entry.outro)
            for (const ent of entry.outro)
                this._recursiveRender(ent, textStack, meta);

        if (!entry.rows) {
            textStack[0] += `||\n`;
            return;
        }

        textStack[0] += "\n";
    }

    static _md_getPaddedTableText({text, width, ixCell, styles}) {
        if (text.length >= width)
            return text;

        if (styles?.[ixCell]?.includes("text-center"))
            return text.padStart(Math.ceil((width - text.length) / 2) + text.length, " ").padEnd(width, " ");
        if (styles?.[ixCell]?.includes("text-right"))
            return text.padStart(width, " ");
        return text.padEnd(width, " ");
    }

    static _md_getPaddedStyleText({style, width=null}) {
        width = width ?? 0;
        if (style.includes("text-center"))
            return `:${"-".repeat(Math.max(width - 2, 3))}:`;
        if (style.includes("text-right"))
            return `${"-".repeat(Math.max(width - 1, 3))}:`;
        return "-".repeat(Math.max(width, 3));
    }

    _renderInset(entry, textStack, meta, options) {
        textStack[0] += "\n";
        if (entry.name != null)
            textStack[0] += `> ##### ${entry.name}\n>\n`;
        if (entry.entries) {
            const len = entry.entries.length;
            for (let i = 0; i < len; ++i) {
                const cacheDepth = meta.depth;
                meta.depth = 2;
                this._recursiveRender(entry.entries[i], textStack, meta, {
                    prefix: ">",
                    suffix: "\n>\n"
                });
                meta.depth = cacheDepth;
            }
        }
        textStack[0] += `\n`;
    }

    _renderInsetReadaloud(entry, textStack, meta, options) {
        textStack[0] += "\n";
        if (entry.name != null)
            textStack[0] += `>> ##### ${entry.name}\n>>\n`;
        if (entry.entries) {
            const len = entry.entries.length;
            for (let i = 0; i < len; ++i) {
                const cacheDepth = meta.depth;
                meta.depth = 2;
                this._recursiveRender(entry.entries[i], textStack, meta, {
                    prefix: ">>",
                    suffix: "\n>>\n"
                });
                meta.depth = cacheDepth;
            }
        }
        textStack[0] += `\n`;
    }

    _renderVariant(entry, textStack, meta, options) {
        textStack[0] += "\n";
        if (entry.name != null)
            textStack[0] += `> ##### Variant: ${entry.name}\n>\n`;
        if (entry.entries) {
            const len = entry.entries.length;
            for (let i = 0; i < len; ++i) {
                const cacheDepth = meta.depth;
                meta.depth = 2;
                this._recursiveRender(entry.entries[i], textStack, meta, {
                    prefix: ">",
                    suffix: "\n>\n"
                });
                meta.depth = cacheDepth;
            }
        }
        if (entry.source)
            textStack[0] += `>${RendererMarkdown$1.utils.getPageText({
                source: entry.source,
                page: entry.page
            })}\n`;
        textStack[0] += "\n";
    }

    _renderVariantSub(entry, textStack, meta, options) {
        if (entry.name)
            textStack[0] += `*${entry.name}.* `;

        if (entry.entries) {
            const len = entry.entries.length;
            for (let i = 0; i < len; ++i) {
                this._recursiveRender(entry.entries[i], textStack, meta, {
                    prefix: RendererMarkdown$1._getNextPrefix(options),
                    suffix: "\n>\n"
                });
            }
        }
    }

    _renderSpellcasting(entry, textStack, meta, options) {
        const toRender = this._renderSpellcasting_getEntries(entry);
        if (!toRender?.[0].entries?.length)
            return;
        this._recursiveRender({
            type: "entries",
            entries: toRender
        }, textStack, meta, {
            prefix: RendererMarkdown$1._getNextPrefix(options),
            suffix: "\n"
        });
    }

    _renderQuote(entry, textStack, meta, options) {
        const len = entry.entries.length;
        for (let i = 0; i < len; ++i) {
            this._recursiveRender(entry.entries[i], textStack, meta, {
                prefix: RendererMarkdown$1._getNextPrefix(options, "*"),
                suffix: "*"
            });
            if (i !== entry.entries.length - 1)
                textStack[0] += `\n\n`;
        }
        const byArr = this._renderQuote_getBy(entry);
        if (byArr) {
            const tempStack = [""];
            for (let i = 0, len = byArr.length; i < len; ++i) {
                const by = byArr[i];
                this._recursiveRender(by, tempStack, meta);
                if (i < len - 1)
                    tempStack[0] += "\n";
            }
            textStack[0] += `\u2014 ${tempStack.join("")}${entry.from ? `, *${entry.from}*` : ""}`;
        }
    }

    _renderAbilityDc(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        textStack[0] += `**${entry.name} save DC** = 8 + your proficiency bonus + your ${Parser.attrChooseToFull(entry.attributes)}`;
        this._renderSuffix(entry, textStack, meta, options);
    }

    _renderAbilityAttackMod(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        textStack[0] += `**${entry.name} attack modifier** = your proficiency bonus + your ${Parser.attrChooseToFull(entry.attributes)}`;
        this._renderSuffix(entry, textStack, meta, options);
    }

    _renderAbilityGeneric(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        textStack[0] += `${entry.name ? `**${entry.name}**  = ` : ""}${entry.text}${entry.attributes ? ` ${Parser.attrChooseToFull(entry.attributes)}` : ""}`;
        this._renderSuffix(entry, textStack, meta, options);
    }

    _renderDice(entry, textStack, meta, options) {
        textStack[0] += Renderer.getEntryDiceDisplayText(entry, entry.name);
    }

    _renderLink(entry, textStack, meta, options) {
        const href = this._renderLink_getHref(entry);
        textStack[0] += `[${href}](${this.render(entry.text)})`;
    }

    _renderActions(entry, textStack, meta, options) {
        const cachedDepth = meta.depth;
        meta.depth = 2;
        this._renderEntriesSubtypes({
            ...entry,
            type: "entries",
        }, textStack, meta, options, );
        meta.depth = cachedDepth;
    }

    _renderAttack(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        textStack[0] += `*${Parser.attackTypeToFull(entry.attackType)}:* `;
        const len = entry.attackEntries.length;
        for (let i = 0; i < len; ++i)
            this._recursiveRender(entry.attackEntries[i], textStack, meta);
        textStack[0] += ` *Hit:* `;
        const len2 = entry.hitEntries.length;
        for (let i = 0; i < len2; ++i)
            this._recursiveRender(entry.hitEntries[i], textStack, meta);
        this._renderSuffix(entry, textStack, meta, options);
    }

    _renderItem(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        textStack[0] += `**${this.render(entry.name)}${this._renderItem_isAddPeriod(entry) ? "." : ""}** `;
        let addedNewline = false;
        if (entry.entry)
            this._recursiveRender(entry.entry, textStack, meta);
        else if (entry.entries) {
            const len = entry.entries.length;
            for (let i = 0; i < len; ++i) {
                const nxtPrefix = RendererMarkdown$1._getNextPrefix(options, i > 0 ? "  " : "");
                this._recursiveRender(entry.entries[i], textStack, meta, {
                    prefix: nxtPrefix,
                    suffix: "\n"
                });
            }
            addedNewline = true;
        }
        if (!addedNewline)
            textStack[0] += "\n";
        this._renderSuffix(entry, textStack, meta, options);
    }

    _renderItemSub(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        const nxtPrefix = RendererMarkdown$1._getNextPrefix(options, `*${this.render(entry.name)}* `);
        this._recursiveRender(entry.entry, textStack, meta, {
            prefix: nxtPrefix,
            suffix: "\n"
        });
        this._renderSuffix(entry, textStack, meta, options);
    }

    _renderItemSpell(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        this._recursiveRender(entry.entry, textStack, meta, {
            prefix: RendererMarkdown$1._getNextPrefix(options, `${entry.name} `),
            suffix: "  \n"
        });
        this._renderSuffix(entry, textStack, meta, options);
    }

    _renderStatblockInline(entry, textStack, meta, options) {
        const fnGetRenderCompact = RendererMarkdown$1.hover.getFnRenderCompact(entry.dataType);

        if (!fnGetRenderCompact) {
            this._renderPrefix(entry, textStack, meta, options);
            textStack[0] += `**Cannot render "${entry.type}"\u2014unknown type "${entry.dataType}"!**\n`;
            this._renderSuffix(entry, textStack, meta, options);
            return;
        }

        this._renderPrefix(entry, textStack, meta, options);
        textStack[0] += fnGetRenderCompact(entry.data, {
            ...entry,
            meta
        });
        this._renderSuffix(entry, textStack, meta, options);
    }

    _renderImage(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        const href = this._renderImage_getUrl(entry);
        textStack[0] += `![${entry.title || ""}](${href})`;
        this._renderSuffix(entry, textStack, meta, options);
    }

    _renderGallery(entry, textStack, meta, options) {
        if (entry.name)
            textStack[0] += `##### ${entry.name}\n`;
        const len = entry.images.length;
        for (let i = 0; i < len; ++i) {
            const img = MiscUtil.copyFast(entry.images[i]);
            this._recursiveRender(img, textStack, meta);
        }
    }

    _renderFlowchart(entry, textStack, meta, options) {
        const len = entry.blocks.length;
        for (let i = 0; i < len; ++i) {
            this._recursiveRender(entry.blocks[i], textStack, meta, options);
        }
    }

    _renderFlowBlock(entry, textStack, meta, options) {
        textStack[0] += "\n";
        if (entry.name != null)
            textStack[0] += `> ##### ${entry.name}\n>\n`;
        if (entry.entries) {
            const len = entry.entries.length;
            for (let i = 0; i < len; ++i) {
                const cacheDepth = meta.depth;
                meta.depth = 2;
                this._recursiveRender(entry.entries[i], textStack, meta, {
                    prefix: ">",
                    suffix: "\n>\n"
                });
                meta.depth = cacheDepth;
            }
        }
        textStack[0] += `\n`;
    }

    _renderHomebrew(entry, textStack, meta, options) {
        if (entry.oldEntries) {
            let markerText;
            if (entry.movedTo) {
                markerText = "*Homebrew:* The following content has been moved:";
            } else if (entry.entries) {
                markerText = "*Homebrew:* The following content has been replaced:";
            } else {
                markerText = "*Homebrew:* The following content has been removed:";
            }

            textStack[0] += `##### ${markerText}\n`;
            this._recursiveRender({
                type: "entries",
                entries: entry.oldEntries
            }, textStack, meta, {
                suffix: "\n"
            });
        }

        if (entry.entries) {
            const len = entry.entries.length;
            if (entry.oldEntries)
                textStack[0] += `*The replacement is as follows:*\n`;
            for (let i = 0; i < len; ++i)
                this._recursiveRender(entry.entries[i], textStack, meta, {
                    suffix: "\n"
                });
        } else if (entry.movedTo) {
            textStack[0] += `*This content has been moved to ${entry.movedTo}.*\n`;
        } else {
            textStack[0] += "*This content has been deleted.*\n";
        }
    }

    _renderCode(entry, textStack, meta, options) {
        textStack[0] += "\n```\n";
        textStack[0] += entry.preformatted;
        textStack[0] += "\n```\n";
    }

    _renderHr(entry, textStack, meta, options) {
        textStack[0] += `\n---\n`;
    }

    _renderString(entry, textStack, meta, options) {
        switch (RendererMarkdown$1._tagRenderMode || 0) {
        case 0:
            {
                this._renderString_renderMode0(entry, textStack, meta, options);
                break;
            }
        case 1:
            {
                textStack[0] += entry;
                break;
            }
        case 2:
            {
                textStack[0] += Renderer.stripTags(entry);
                break;
            }
        }
    }

    _renderString_renderMode0(entry, textStack, meta, options) {
        const tagSplit = Renderer.splitByTags(entry);
        const len = tagSplit.length;
        for (let i = 0; i < len; ++i) {
            const s = tagSplit[i];
            if (!s)
                continue;
            if (s.startsWith("{@")) {
                const [tag,text] = Renderer.splitFirstSpace(s.slice(1, -1));
                this._renderString_renderTag(textStack, meta, options, tag, text);
            } else
                textStack[0] += s;
        }
    }

    _renderString_renderTag(textStack, meta, options, tag, text) {
        switch (tag) {
        case "@b":
        case "@bold":
            textStack[0] += `**`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `**`;
            break;
        case "@i":
        case "@italic":
            textStack[0] += `*`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `*`;
            break;
        case "@s":
        case "@strike":
            textStack[0] += `~~`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `~~`;
            break;
        case "@note":
            textStack[0] += "*";
            this._recursiveRender(text, textStack, meta);
            textStack[0] += "*";
            break;
        case "@atk":
            textStack[0] += `*${Renderer.attackTagToFull(text)}*`;
            break;
        case "@h":
            textStack[0] += `*Hit:* `;
            break;

        case "@dc":
            {
                const [dcText,displayText] = Renderer.splitTagByPipe(text);
                textStack[0] += `DC ${displayText || dcText}`;
                break;
            }

        case "@dice":
        case "@damage":
        case "@hit":
        case "@d20":
        case "@chance":
        case "@recharge":
        case "@coinflip":
            textStack[0] += Renderer.stripTags(`{${tag} ${text}}`);
            break;

        case "@scaledice":
        case "@scaledamage":
            textStack[0] += Renderer.stripTags(`{${tag} ${text}}`);
            break;

        case "@filter":
            textStack[0] += Renderer.stripTags(`{${tag} ${text}}`);
            break;

        case "@link":
        case "@5etools":
            this.__super._renderString_renderTag(textStack, meta, options, tag, text);
            break;

        case "@footnote":
        case "@homebrew":
        case "@skill":
        case "@sense":
        case "@area":
        case "@cite":
            textStack[0] += Renderer.stripTags(`{${tag} ${text}}`);
            break;

        case "@loader":
            {
                const {name, path} = this._renderString_getLoaderTagMeta(text, {
                    isDefaultUrl: true
                });
                textStack[0] += `[${name}](${path})`;
                break;
            }

        case "@book":
        case "@adventure":
            textStack[0] += `*${Renderer.stripTags(`{${tag} ${text}}`)}*`;
            break;

        case "@deity":
            textStack[0] += `**${Renderer.stripTags(`{${tag} ${text}}`)}**`;
            break;

        default:
            {
                switch (tag) {
                case "@item":
                    {
                        if (this._isSkipStylingItemLinks)
                            textStack[0] += `${Renderer.stripTags(`{${tag} ${text}}`)}`;
                        else
                            textStack[0] += `*${Renderer.stripTags(`{${tag} ${text}}`)}*`;
                        break;
                    }

                case "@spell":
                case "@psionic":
                    textStack[0] += `*${Renderer.stripTags(`{${tag} ${text}}`)}*`;
                    break;
                case "@creature":
                    textStack[0] += `**${Renderer.stripTags(`{${tag} ${text}}`)}**`;
                    break;
                default:
                    textStack[0] += Renderer.stripTags(`{${tag} ${text}}`);
                    break;
                }
            }
        }
    }

    _renderPrimitive(entry, textStack, meta, options) {
        textStack[0] += `${entry}`;
    }

    static async pShowSettingsModal() {
        RendererMarkdown$1.checkInit();

        const {$modalInner} = UiUtil.getShowModal({
            title: "Markdown Settings",
            cbClose: ()=>RendererMarkdown$1.__$wrpSettings.detach(),
        });
        if (!RendererMarkdown$1.__$wrpSettings) {
            const _compMarkdownSettings = BaseComponent.fromObject({
                _tagRenderMode: RendererMarkdown$1._tagRenderMode,
                _isAddColumnBreaks: RendererMarkdown$1._isAddColumnBreaks,
            });
            const compMarkdownSettings = _compMarkdownSettings.getPod();
            const saveMarkdownSettingsDebounced = MiscUtil.debounce(()=>StorageUtil.pSet("bookViewSettingsMarkdown", _compMarkdownSettings.toObject()), 100);
            compMarkdownSettings.addHookAll(()=>{
                Object.assign(RendererMarkdown$1, compMarkdownSettings.getState());
                saveMarkdownSettingsDebounced();
            }
            );

            const $rows = Object.entries(RendererMarkdown$1._CONFIG).map(([k,v])=>{
                let $ipt;
                switch (v.type) {
                case "boolean":
                    {
                        $ipt = ComponentUiUtil.$getCbBool(_compMarkdownSettings, k).addClass("mr-1");
                        break;
                    }
                case "enum":
                    {
                        $ipt = ComponentUiUtil.$getSelEnum(_compMarkdownSettings, k, {
                            values: v.values,
                            fnDisplay: v.fnDisplay
                        });
                        break;
                    }
                default:
                    throw new Error(`Unhandled input type!`);
                }

                return $$`<div class="m-1 stripe-even"><label class="split-v-center">
						<div class="w-100 mr-2">${v.name}</div>
						${$ipt.addClass("max-w-33")}
					</label></div>`;
            }
            );

            RendererMarkdown$1.__$wrpSettings = $$`<div class="ve-flex-v-col w-100 h-100">${$rows}</div>`;
        }
        RendererMarkdown$1.__$wrpSettings.appendTo($modalInner);
    }

    static getSetting(key) {
        return this[`_${key}`];
    }
}
;
RendererMarkdown$1._isInit = false;
RendererMarkdown$1.CHARS_PER_PAGE = 5500;
RendererMarkdown$1.__$wrpSettings = null;
RendererMarkdown$1._TAG_RENDER_MODES = ["Convert to Markdown", "Leave As-Is", "Convert to Text"];
RendererMarkdown$1._CONFIG = {
    _tagRenderMode: {
        default: 0,
        name: "Tag Handling (<code>@tag</code>)",
        fnDisplay: ix=>RendererMarkdown$1._TAG_RENDER_MODES[ix],
        type: "enum",
        values: [0, 1, 2]
    },
    _isAddColumnBreaks: {
        default: false,
        name: "Add GM Binder Column Breaks (<code>\\columnbreak</code>)",
        type: "boolean"
    },
    _isAddPageBreaks: {
        default: false,
        name: "Add GM Binder Page Breaks (<code>\\pagebreak</code>)",
        type: "boolean"
    },
};

if (typeof window !== "undefined")
    window.addEventListener("load", ()=>RendererMarkdown$1.pInit());

RendererMarkdown$1.utils = class {
    static getPageText(it) {
        const sourceSub = Renderer.utils.getSourceSubText(it);
        const baseText = Renderer.utils.isDisplayPage(it.page) ? `**Source:** *${Parser.sourceJsonToAbv(it.source)}${sourceSub}*, page ${it.page}` : "";
        const addSourceText = this._getPageText_getAltSourceText(it, "additionalSources", "Additional information from");
        const otherSourceText = this._getPageText_getAltSourceText(it, "otherSources", "Also found in");
        const externalSourceText = this._getPageText_getAltSourceText(it, "externalSources", "External sources:");

        return `${[baseText, addSourceText, otherSourceText, externalSourceText].filter(it=>it).join(". ")}${baseText && (addSourceText || otherSourceText || externalSourceText) ? "." : ""}`;
    }

    static _getPageText_getAltSourceText(it, prop, introText) {
        if (!it[prop] || !it[prop].length)
            return "";

        return `${introText} ${it[prop].map(as=>{
            if (as.entry)
                return Renderer.get().render(as.entry);
            else
                return `*${Parser.sourceJsonToAbv(as.source)}*${Renderer.utils.isDisplayPage(as.page) ? `, page ${as.page}` : ""}`;
        }
        ).join("; ")}`;
    }

    static compact = class {
        static getRenderedAbilityScores(ent, {prefix=""}="") {
            return `${prefix}|${Parser.ABIL_ABVS.map(it=>`${it.toUpperCase()}|`).join("")}
${prefix}|:---:|:---:|:---:|:---:|:---:|:---:|
${prefix}|${Parser.ABIL_ABVS.map(ab=>`${ent[ab]} (${Parser.getAbilityModifier(ent[ab])})|`).join("")}`;
        }
    }
    ;

    static withMetaDepth(depth, opts, fn) {
        opts.meta ||= {};
        const depthCached = opts.meta.depth;
        opts.meta.depth = depth;
        const out = fn();
        opts.meta.depth = depthCached;
        return out;
    }

    static getNormalizedNewlines(str) {
        return str.replace(/\n\n+/g, "\n\n");
    }
}
;

RendererMarkdown$1.monster = class {
    static getCompactRenderedString(mon, opts={}) {
        const legendaryGroup = opts.legendaryGroup;
        const meta = opts.meta || {};

        let addedStatblockInline;
        if (!meta.isStatblockInlineMonster) {
            meta.isStatblockInlineMonster = true;
            addedStatblockInline = true;
        }

        const monTypes = Parser.monTypeToFullObj(mon.type);
        RendererMarkdown$1.get().isSkipStylingItemLinks = true;
        const acPart = Parser.acToFull(mon.ac, RendererMarkdown$1.get());
        RendererMarkdown$1.get().isSkipStylingItemLinks = false;
        const resourcePart = mon.resource?.length ? mon.resource.map(res=>`\n>- **${res.name}** ${Renderer.monster.getRenderedResource(res, true)}`).join("") : "";
        const abilityScorePart = RendererMarkdown$1.utils.compact.getRenderedAbilityScores(mon, {
            prefix: ">"
        });
        const savePart = mon.save ? `\n>- **Saving Throws** ${Object.keys(mon.save).sort(SortUtil.ascSortAtts).map(it=>RendererMarkdown$1.monster.getSave(it, mon.save[it])).join(", ")}` : "";
        const skillPart = mon.skill ? `\n>- **Skills** ${RendererMarkdown$1.monster.getSkillsString(mon)}` : "";
        const damVulnPart = mon.vulnerable ? `\n>- **Damage Vulnerabilities** ${Parser.getFullImmRes(mon.vulnerable)}` : "";
        const damResPart = mon.resist ? `\n>- **Damage Resistances** ${Parser.getFullImmRes(mon.resist)}` : "";
        const damImmPart = mon.immune ? `\n>- **Damage Immunities** ${Parser.getFullImmRes(mon.immune)}` : "";
        const condImmPart = mon.conditionImmune ? `\n>- **Condition Immunities** ${Parser.getFullCondImm(mon.conditionImmune, {
            isPlainText: true
        })}` : "";
        const sensePart = !opts.isHideSenses ? `\n>- **Senses** ${mon.senses ? `${Renderer.monster.getRenderedSenses(mon.senses, true)}, ` : ""}passive Perception ${mon.passive || "\u2014"}` : "";
        const languagePart = !opts.isHideLanguages ? `\n>- **Languages** ${Renderer.monster.getRenderedLanguages(mon.languages)}` : "";

        const fnGetSpellTraits = RendererMarkdown$1.monster.getSpellcastingRenderedTraits.bind(RendererMarkdown$1.monster, meta);
        const traitArray = Renderer.monster.getOrderedTraits(mon, {
            fnGetSpellTraits
        });
        const actionArray = Renderer.monster.getOrderedActions(mon, {
            fnGetSpellTraits
        });
        const bonusActionArray = Renderer.monster.getOrderedBonusActions(mon, {
            fnGetSpellTraits
        });
        const reactionArray = Renderer.monster.getOrderedReactions(mon, {
            fnGetSpellTraits
        });

        const traitsPart = traitArray?.length ? `\n${RendererMarkdown$1.monster._getRenderedSection({
            prop: "trait",
            entries: traitArray,
            depth: 1,
            meta,
            prefix: ">"
        })}` : "";

        const actionsPart = RendererMarkdown$1.monster.getRenderedSection({
            arr: actionArray,
            ent: mon,
            prop: "action",
            title: "Actions",
            meta,
            prefix: ">"
        });
        const bonusActionsPart = RendererMarkdown$1.monster.getRenderedSection({
            arr: bonusActionArray,
            ent: mon,
            prop: "bonus",
            title: "Bonus Actions",
            meta,
            prefix: ">"
        });
        const reactionsPart = RendererMarkdown$1.monster.getRenderedSection({
            arr: reactionArray,
            ent: mon,
            prop: "reaction",
            title: "Reactions",
            meta,
            prefix: ">"
        });

        const legendaryActionsPart = mon.legendary ? `${RendererMarkdown$1.monster._getRenderedSectionHeader({
            mon,
            title: "Legendary Actions",
            prop: "legendary",
            prefix: ">"
        })}>${Renderer.monster.getLegendaryActionIntro(mon, {
            renderer: RendererMarkdown$1.get()
        })}\n>\n${RendererMarkdown$1.monster._getRenderedLegendarySection(mon.legendary, 1, meta)}` : "";
        const mythicActionsPart = mon.mythic ? `${RendererMarkdown$1.monster._getRenderedSectionHeader({
            mon,
            title: "Mythic Actions",
            prop: "mythic",
            prefix: ">"
        })}>${Renderer.monster.getSectionIntro(mon, {
            renderer: RendererMarkdown$1.get(),
            prop: "mythic"
        })}\n>\n${RendererMarkdown$1.monster._getRenderedLegendarySection(mon.mythic, 1, meta)}` : "";

        const legendaryGroupLairPart = legendaryGroup?.lairActions ? `\n>### Lair Actions\n${RendererMarkdown$1.monster._getRenderedSection({
            prop: "lairaction",
            entries: legendaryGroup.lairActions,
            depth: -1,
            meta,
            prefix: ">"
        })}` : "";
        const legendaryGroupRegionalPart = legendaryGroup?.regionalEffects ? `\n>### Regional Effects\n${RendererMarkdown$1.monster._getRenderedSection({
            prop: "regionaleffect",
            entries: legendaryGroup.regionalEffects,
            depth: -1,
            meta,
            prefix: ">"
        })}` : "";

        const footerPart = mon.footer ? `\n${RendererMarkdown$1.monster._getRenderedSectionEntries({
            sectionEntries: mon.footer,
            sectionDepth: 0,
            meta,
            prefix: ">"
        })}` : "";

        const unbreakablePart = `___
>## ${mon._displayName || mon.name}
>*${mon.level ? `${Parser.getOrdinalForm(mon.level)}-level ` : ""}${Renderer.utils.getRenderedSize(mon.size)} ${monTypes.asText}${mon.alignment ? `, ${mon.alignmentPrefix ? RendererMarkdown$1.get().render(mon.alignmentPrefix) : ""}${Parser.alignmentListToFull(mon.alignment)}` : ""}*
>___
>- **Armor Class** ${acPart}
>- **Hit Points** ${Renderer.monster.getRenderedHp(mon.hp, true)}${resourcePart}
>- **Speed** ${Parser.getSpeedString(mon)}
>___
${abilityScorePart}
>___${savePart}${skillPart}${damVulnPart}${damResPart}${damImmPart}${condImmPart}${sensePart}${languagePart}
>- **Challenge** ${mon.cr ? Parser.monCrToFull(mon.cr, {
            isMythic: !!mon.mythic
        }) : "\u2014"}
${mon.pbNote || Parser.crToNumber(mon.cr) < VeCt.CR_CUSTOM ? `>- **Proficiency Bonus** ${mon.pbNote ?? UiUtil.intToBonus(Parser.crToPb(mon.cr), {
            isPretty: true
        })}` : ""}
>___`;

        let breakablePart = `${traitsPart}${actionsPart}${bonusActionsPart}${reactionsPart}${legendaryActionsPart}${mythicActionsPart}${legendaryGroupLairPart}${legendaryGroupRegionalPart}${footerPart}`;

        if (RendererMarkdown$1.getSetting("isAddColumnBreaks")) {
            let charAllowanceFirstCol = 2200 - unbreakablePart.length;

            const breakableLines = breakablePart.split("\n");
            for (let i = 0; i < breakableLines.length; ++i) {
                const l = breakableLines[i];
                if ((charAllowanceFirstCol -= l.length) < 0) {
                    breakableLines.splice(i, 0, ">", "> \\columnbreak", ">");
                    break;
                }
            }
            breakablePart = breakableLines.join("\n");
        }

        const str = `${unbreakablePart}${breakablePart}`;

        const monRender = str.trim().split("\n").map(it=>it.trim() ? it : `>`).join("\n");
        const out = `\n${monRender}\n\n`;

        if (addedStatblockInline)
            delete meta.isStatblockInlineMonster;

        return out;
    }

    static getSave(attr, mod) {
        if (attr === "special")
            return Renderer.stripTags(mod);
        return `${attr.uppercaseFirst()} ${mod}`;
    }

    static getSkillsString(mon) {
        function doSortMapJoinSkillKeys(obj, keys, joinWithOr) {
            const toJoin = keys.sort(SortUtil.ascSort).map(s=>`${s.toTitleCase()} ${obj[s]}`);
            return joinWithOr ? toJoin.joinConjunct(", ", " or ") : toJoin.join(", ");
        }

        const skills = doSortMapJoinSkillKeys(mon.skill, Object.keys(mon.skill).filter(k=>k !== "other" && k !== "special"));

        if (mon.skill.other || mon.skill.special) {
            const others = mon.skill.other && mon.skill.other.map(it=>{
                if (it.oneOf) {
                    return `plus one of the following: ${doSortMapJoinSkillKeys(it.oneOf, Object.keys(it.oneOf), true)}`;
                }
                throw new Error(`Unhandled monster "other" skill properties!`);
            }
            );
            const special = mon.skill.special && Renderer.stripTags(mon.skill.special);
            return [skills, others, special].filter(Boolean).join(", ");
        } else
            return skills;
    }

    static getRenderedSection({arr, ent, prop, title, meta, prefix=""}) {
        if (!arr?.length)
            return "";

        return `${RendererMarkdown$1.monster._getRenderedSectionHeader({
            mon: ent,
            title,
            prop,
            prefix
        })}${RendererMarkdown$1.monster._getRenderedSection({
            mon: ent,
            prop,
            entries: arr,
            depth: 1,
            meta,
            prefix
        })}`;
    }

    static _getRenderedSectionHeader({mon, title, prop, prefix}) {
        const propNote = `${prop}Note`;
        const ptTitle = `\n${prefix}### ${title}`;
        if (!mon[propNote])
            return `${ptTitle}\n`;
        return `${ptTitle} (${mon[propNote]})\n`;
    }

    static _getRenderedSection({mon=null, prop, entries, depth=1, meta, prefix}) {
        const ptHeader = mon ? Renderer.monster.getSectionIntro(mon, {
            renderer: RendererMarkdown$1.get(),
            prop
        }) : "";

        return `${ptHeader ? `${prefix}${ptHeader}\n${prefix}\n` : ""}${this._getRenderedSectionEntries({
            sectionEntries: entries,
            sectionDepth: depth,
            meta,
            prefix
        })}`;
    }

    static _getRenderedSectionEntries({sectionEntries, sectionDepth, meta, prefix}) {
        const renderer = RendererMarkdown$1.get();
        const renderStack = [""];
        sectionEntries.forEach(entry=>{
            if (entry.rendered)
                renderStack[0] += entry.rendered;
            else {
                const cacheDepth = meta.depth;
                meta.depth = sectionDepth + 1;
                renderer._recursiveRender(entry, renderStack, meta, {
                    prefix
                });
                meta.depth = cacheDepth;
            }
        }
        );
        return renderStack.join("");
    }

    static _getRenderedLegendarySection(sectionEntries, sectionLevel, meta) {
        const renderer = RendererMarkdown$1.get();
        const renderStack = [""];

        const cpy = MiscUtil.copyFast(sectionEntries).map(it=>{
            if (it.name && it.entries) {
                it.name = `${it.name}.`;
                it.type = it.type || "item";
            }
            return it;
        }
        );

        const toRender = {
            type: "list",
            style: "list-hang-notitle",
            items: cpy
        };
        const cacheDepth = meta.depth;
        meta.depth = sectionLevel;
        renderer._recursiveRender(toRender, renderStack, meta, {
            prefix: ">"
        });
        meta.depth = cacheDepth;

        return renderStack.join("");
    }

    static getSpellcastingRenderedTraits(meta, mon, displayAsProp="trait") {
        const renderer = RendererMarkdown$1.get();
        const out = [];
        const cacheDepth = meta.depth;
        meta.depth = 2;
        (mon.spellcasting || []).filter(it=>(it.displayAs || "trait") === displayAsProp).forEach(entry=>{
            entry.type = entry.type || "spellcasting";
            const renderStack = [""];
            renderer._recursiveRender(entry, renderStack, meta, {
                prefix: ">"
            });
            const rendered = renderStack.join("");
            if (!rendered.length)
                return;
            out.push({
                name: entry.name,
                rendered
            });
        }
        );
        meta.depth = cacheDepth;
        return out;
    }

    static async pGetMarkdownDoc(monsters) {
        const asEntries = (await Promise.all(monsters.map(async(mon,i)=>{
            const monEntry = ({
                type: "statblockInline",
                dataType: "monster",
                data: mon
            });

            const fluff = await Renderer.monster.pGetFluff(mon);

            const fluffEntries = (fluff || {}).entries || [];

            RendererMarkdown$1.get().setFirstSection(true);
            const fluffText = fluffEntries.map(ent=>RendererMarkdown$1.get().render(ent)).join("\n\n");

            const out = [monEntry];

            const isAddPageBreaks = RendererMarkdown$1.getSetting("isAddPageBreaks");
            if (fluffText) {
                if (isAddPageBreaks)
                    out.push("", "\\pagebreak", "");

                out.push(`## ${mon.name}`);

                let stack = [];
                let charLimit = RendererMarkdown$1.CHARS_PER_PAGE;
                fluffText.split("\n").forEach(l=>{
                    if ((charLimit -= l.length) < 0) {
                        out.push(stack.join("\n"));
                        if (isAddPageBreaks)
                            out.push("", "\\pagebreak", "");
                        stack = [];
                        charLimit = RendererMarkdown$1.CHARS_PER_PAGE - l.length;
                    }
                    stack.push(l);
                }
                );
                if (stack.length)
                    out.push(stack.join("\n"));
            }

            if (i !== monsters.length - 1 && isAddPageBreaks)
                out.push("", "\\pagebreak", "");
            return out;
        }
        ))).flat();

        return RendererMarkdown$1.get().render({
            entries: asEntries
        });
    }
}
;

RendererMarkdown$1.spell = class {
    static getCompactRenderedString(sp, opts={}) {
        const meta = opts.meta || {};

        const subStack = [""];

        subStack[0] += `#### ${sp._displayName || sp.name}
*${Parser.spLevelSchoolMetaToFull(sp.level, sp.school, sp.meta, sp.subschools)}*
___
- **Casting Time:** ${Parser.spTimeListToFull(sp.time)}
- **Range:** ${Parser.spRangeToFull(sp.range)}
- **Components:** ${Parser.spComponentsToFull(sp.components, sp.level, {
            isPlainText: true
        })}
- **Duration:** ${Parser.spDurationToFull(sp.duration)}
---\n`;

        const cacheDepth = meta.depth;
        meta.depth = 2;
        RendererMarkdown$1.get().recursiveRender({
            entries: sp.entries
        }, subStack, meta, {
            suffix: "\n"
        });
        if (sp.entriesHigherLevel) {
            RendererMarkdown$1.get().recursiveRender({
                entries: sp.entriesHigherLevel
            }, subStack, meta, {
                suffix: "\n"
            });
        }
        meta.depth = cacheDepth;

        const spellRender = subStack.join("").trim();
        return `\n${spellRender}\n\n`;
    }
}
;

RendererMarkdown$1.item = class {
    static getCompactRenderedString(item, opts={}) {
        const meta = opts.meta || {};

        const subStack = [""];

        const [damage,damageType,propertiesTxt] = Renderer.item.getDamageAndPropertiesText(item, {
            renderer: RendererMarkdown$1.get()
        });
        const [typeRarityText,subTypeText,tierText] = RendererMarkdown$1.item.getTypeRarityAndAttunementText(item);

        const typeRarityTierValueWeight = [typeRarityText, subTypeText, tierText, Parser.itemValueToFullMultiCurrency(item), Parser.itemWeightToFull(item)].filter(Boolean).join(", ").uppercaseFirst();
        const damageProperties = [damage, damageType, propertiesTxt].filter(Boolean).join(" ").uppercaseFirst();

        const ptSubtitle = [typeRarityTierValueWeight, damageProperties].filter(Boolean).join("\n\n");

        subStack[0] += `#### ${item._displayName || item.name}${ptSubtitle ? `\n\n${ptSubtitle}` : ""}\n\n${ptSubtitle ? `---\n\n` : ""}`;

        if (Renderer.item.hasEntries(item)) {
            const cacheDepth = meta.depth;

            if (item._fullEntries || (item.entries?.length)) {
                const entry = {
                    type: "entries",
                    entries: item._fullEntries || item.entries
                };
                meta.depth = 1;
                RendererMarkdown$1.get().recursiveRender(entry, subStack, meta, {
                    suffix: "\n"
                });
            }

            if (item._fullAdditionalEntries || item.additionalEntries) {
                const additionEntries = {
                    type: "entries",
                    entries: item._fullAdditionalEntries || item.additionalEntries
                };
                meta.depth = 1;
                RendererMarkdown$1.get().recursiveRender(additionEntries, subStack, meta, {
                    suffix: "\n"
                });
            }

            meta.depth = cacheDepth;
        }

        const itemRender = subStack.join("").trim();
        return `\n${itemRender}\n\n`;
    }

    static getTypeRarityAndAttunementText(item) {
        const typeRarity = [item._typeHtml === "other" ? "" : $(`<div></div>`).html(item._typeHtml).text(), (item.rarity && Renderer.item.doRenderRarity(item.rarity) ? item.rarity : ""), ].filter(Boolean).join(", ");

        return [item.reqAttune ? `${typeRarity} ${item._attunement}` : typeRarity, item._subTypeHtml || "", item.tier ? `${item.tier} tier` : "", ];
    }
}
;

RendererMarkdown$1.legendaryGroup = class {
    static getCompactRenderedString(lg, opts={}) {
        const meta = opts.meta || {};

        const subEntry = Renderer.legendaryGroup.getSummaryEntry(lg);
        if (!subEntry)
            return "";

        const subStack = [""];

        subStack[0] += `## ${lg._displayName || lg.name}`;
        RendererMarkdown$1.get().recursiveRender(subEntry, subStack, meta, {
            suffix: "\n"
        });

        const lgRender = subStack.join("").trim();
        return `\n${lgRender}\n\n`;
    }
}
;

RendererMarkdown$1.table = class {
    static getCompactRenderedString(tbl, opts={}) {
        const meta = opts.meta || {};

        const subStack = [""];
        RendererMarkdown$1.get().recursiveRender(tbl, subStack, meta, {
            suffix: "\n"
        });
        return `\n${subStack.join("").trim()}\n\n`;
    }
}
;

RendererMarkdown$1.tableGroup = class {
    static getCompactRenderedString(tbl, opts={}) {
        return RendererMarkdown$1.table.getCompactRenderedString(tbl, opts);
    }
}
;

RendererMarkdown$1.cult = class {
    static getCompactRenderedString(ent, opts={}) {
        const entries = [Renderer.cultboon.getCultRenderableEntriesMeta(ent)?.listGoalsCultistsSpells, ...ent.entries, ].filter(Boolean);

        const entFull = {
            ...ent,
            entries,
        };

        return RendererMarkdown$1.utils.withMetaDepth(2, opts, ()=>{
            return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
        }
        );
    }
}
;

RendererMarkdown$1.boon = class {
    static getCompactRenderedString(ent, opts={}) {
        const entries = [Renderer.cultboon.getBoonRenderableEntriesMeta(ent)?.listBenefits, ...ent.entries, ].filter(Boolean);

        const entFull = {
            ...ent,
            entries,
        };

        return RendererMarkdown$1.utils.withMetaDepth(1, opts, ()=>{
            return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
        }
        );
    }
}
;

RendererMarkdown$1.charoption = class {
    static getCompactRenderedString(ent, opts={}) {
        const entries = [RendererMarkdown$1.generic.getRenderedPrerequisite(ent), Renderer.charoption.getCharoptionRenderableEntriesMeta(ent)?.entryOptionType, ...ent.entries, ].filter(Boolean);

        const entFull = {
            ...ent,
            entries,
        };

        return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
    }
}
;

RendererMarkdown$1.action = class {
    static getCompactRenderedString(ent, opts={}) {
        return RendererMarkdown$1.generic.getCompactRenderedString(ent, opts);
    }
}
;

RendererMarkdown$1.condition = class {
    static getCompactRenderedString(ent, opts={}) {
        return RendererMarkdown$1.generic.getCompactRenderedString(ent, opts);
    }
}
;

RendererMarkdown$1.disease = class {
    static getCompactRenderedString(ent, opts={}) {
        return RendererMarkdown$1.generic.getCompactRenderedString(ent, opts);
    }
}
;

RendererMarkdown$1.status = class {
    static getCompactRenderedString(ent, opts={}) {
        return RendererMarkdown$1.generic.getCompactRenderedString(ent, opts);
    }
}
;

RendererMarkdown$1.race = class {
    static getCompactRenderedString(ent, opts={}) {
        const entries = [{
            type: "list",
            style: "list-hang-notitle",
            items: [{
                type: "item",
                name: "Ability Scores",
                entry: Renderer.getAbilityData(ent.ability).asText,
            }, {
                type: "item",
                name: "Size",
                entry: Renderer.race.getRenderedSize(ent),
            }, {
                type: "item",
                name: "Speed",
                entry: Parser.getSpeedString(ent),
            }, ],
        }, Renderer.race.getRaceRenderableEntriesMeta(ent)?.entryMain, ].filter(Boolean);

        const entFull = {
            ...ent,
            entries,
        };

        const ptHeightAndWeight = this._getHeightAndWeightPart(ent);

        return [RendererMarkdown$1.utils.withMetaDepth(1, opts, ()=>{
            return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
        }
        ), ptHeightAndWeight ? `---\n\n${ptHeightAndWeight}` : null, ].filter(Boolean).join("");
    }

    static _getHeightAndWeightPart(race) {
        if (!race.heightAndWeight)
            return null;
        if (race._isBaseRace)
            return null;
        return RendererMarkdown$1.get().render({
            entries: Renderer.race.getHeightAndWeightEntries(race, {
                isStatic: true
            })
        });
    }
}
;

RendererMarkdown$1.feat = class {
    static getCompactRenderedString(ent, opts={}) {
        const entries = [Renderer.feat.getJoinedCategoryPrerequisites(ent.category, RendererMarkdown$1.generic.getRenderedPrerequisite(ent), ), Renderer.utils.getRepeatableEntry(ent), Renderer.feat.getFeatRendereableEntriesMeta(ent)?.entryMain, ].filter(Boolean);

        const entFull = {
            ...ent,
            entries,
        };

        return RendererMarkdown$1.utils.withMetaDepth(2, opts, ()=>{
            return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
        }
        );
    }
}
;

RendererMarkdown$1.optionalfeature = class {
    static getCompactRenderedString(ent, opts={}) {
        const entries = [RendererMarkdown$1.generic.getRenderedPrerequisite(ent), Renderer.optionalfeature.getCostEntry(ent), {
            entries: ent.entries
        }, Renderer.optionalfeature.getPreviouslyPrintedEntry(ent), Renderer.optionalfeature.getTypeEntry(ent), ].filter(Boolean);

        const entFull = {
            ...ent,
            entries,
        };

        return RendererMarkdown$1.utils.withMetaDepth(1, opts, ()=>{
            return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
        }
        );
    }
}
;

RendererMarkdown$1.background = class {
    static getCompactRenderedString(ent, opts={}) {
        return RendererMarkdown$1.generic.getCompactRenderedString(ent, opts);
    }
}
;

RendererMarkdown$1.object = class {
    static getCompactRenderedString(ent, opts={}) {
        const entriesMeta = Renderer.object.getObjectRenderableEntriesMeta(ent);

        const entries = [entriesMeta.entrySize, ...Renderer.object.RENDERABLE_ENTRIES_PROP_ORDER__ATTRIBUTES.filter(prop=>entriesMeta[prop]).map(prop=>entriesMeta[prop]), ent.entries ? {
            entries: ent.entries
        } : null, ent.actionEntries ? {
            entries: ent.actionEntries
        } : null, ].filter(Boolean);

        const entFull = {
            ...ent,
            entries,
        };

        return RendererMarkdown$1.utils.withMetaDepth(2, opts, ()=>{
            return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
        }
        );
    }
}
;

RendererMarkdown$1.trap = class {
    static getCompactRenderedString(ent, opts={}) {
        return RendererMarkdown$1.traphazard.getCompactRenderedString(ent, opts);
    }
}
;

RendererMarkdown$1.hazard = class {
    static getCompactRenderedString(ent, opts={}) {
        return RendererMarkdown$1.traphazard.getCompactRenderedString(ent, opts);
    }
}
;

RendererMarkdown$1.traphazard = class {
    static getCompactRenderedString(ent, opts={}) {
        const ptHead = RendererMarkdown$1.utils.withMetaDepth(2, opts, ()=>{
            const subtitle = Renderer.traphazard.getSubtitle(ent);

            const entries = [subtitle ? `{@i ${subtitle}}` : null, {
                entries: ent.entries
            }, ].filter(Boolean);

            const entFull = {
                ...ent,
                entries,
            };

            return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
        }
        );

        const ptAttributes = RendererMarkdown$1.utils.withMetaDepth(1, opts, ()=>{
            const entriesMeta = Renderer.trap.getTrapRenderableEntriesMeta(ent);

            return RendererMarkdown$1.generic.getRenderedSubEntry({
                type: "entries",
                entries: entriesMeta.entriesAttributes
            }, opts);
        }
        );

        return ptHead + ptAttributes;
    }
}
;

RendererMarkdown$1.deity = class {
    static getCompactRenderedString(ent, opts={}) {
        const entriesMeta = Renderer.deity.getDeityRenderableEntriesMeta(ent);

        const entries = [...entriesMeta.entriesAttributes, ent.entries ? {
            entries: ent.entries
        } : null, ].filter(Boolean);

        const entFull = {
            ...ent,
            name: ent.title ? [ent.name, ent.title.toTitleCase()].join(", ") : ent.name,
            entries,
        };

        return RendererMarkdown$1.utils.withMetaDepth(1, opts, ()=>{
            return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
        }
        );
    }
}
;

RendererMarkdown$1.language = class {
    static getCompactRenderedString(ent, opts={}) {
        const entriesMeta = Renderer.language.getLanguageRenderableEntriesMeta(ent);

        const entries = [entriesMeta.entryType, entriesMeta.entryTypicalSpeakers, entriesMeta.entryScript, entriesMeta.entriesContent ? {
            entries: entriesMeta.entriesContent
        } : null, ].filter(Boolean);

        const entFull = {
            ...ent,
            entries,
        };

        return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
    }
}
;

RendererMarkdown$1.reward = class {
    static getCompactRenderedString(ent, opts={}) {
        const entriesMeta = Renderer.reward.getRewardRenderableEntriesMeta(ent);

        const entries = [{
            entries: entriesMeta.entriesContent
        }, ].filter(Boolean);

        const entFull = {
            ...ent,
            entries,
        };

        return RendererMarkdown$1.utils.withMetaDepth(1, opts, ()=>{
            return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
        }
        );
    }
}
;

RendererMarkdown$1.psionic = class {
    static getCompactRenderedString(ent, opts={}) {
        const entriesMeta = Renderer.psionic.getPsionicRenderableEntriesMeta(ent);

        const entries = [entriesMeta.entryTypeOrder, entriesMeta.entryContent, entriesMeta.entryFocus, ...(entriesMeta.entriesModes || []), ].filter(Boolean);

        const entFull = {
            ...ent,
            entries,
        };

        return RendererMarkdown$1.utils.withMetaDepth(2, opts, ()=>{
            return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
        }
        );
    }
}
;

RendererMarkdown$1.vehicle = class {
    static getCompactRenderedString(ent, opts={}) {
        if (ent.upgradeType)
            return RendererMarkdown$1.vehicleUpgrade.getCompactRenderedString(ent, opts);

        ent.vehicleType ||= "SHIP";
        switch (ent.vehicleType) {
        case "SHIP":
            return RendererMarkdown$1.vehicle._getRenderedString_ship(ent, opts);
        case "SPELLJAMMER":
            return RendererMarkdown$1.vehicle._getRenderedString_spelljammer(ent, opts);
        case "INFWAR":
            return RendererMarkdown$1.vehicle._getRenderedString_infwar(ent, opts);
        case "CREATURE":
            return RendererMarkdown$1.monster.getCompactRenderedString(ent, {
                ...opts,
                isHideLanguages: true,
                isHideSenses: true,
                page: UrlUtil.PG_VEHICLES
            });
        case "OBJECT":
            return RendererMarkdown$1.object.getCompactRenderedString(ent, {
                ...opts,
                page: UrlUtil.PG_VEHICLES
            });
        default:
            throw new Error(`Unhandled vehicle type "${ent.vehicleType}"`);
        }
    }

    static _getLinesRendered_traits({ent, renderer}) {
        const traitArray = Renderer.monster.getOrderedTraits(ent);

        return [ent.trait ? `### Traits` : null, ...(traitArray || []).map(entry=>renderer.render(entry, 2)), ];
    }

    static ship = class {
        static getCrewCargoPaceSection_(ent, {entriesMetaShip=null}={}) {
            entriesMetaShip ||= Renderer.vehicle.ship.getVehicleShipRenderableEntriesMeta(ent);

            return Renderer.vehicle.ship.PROPS_RENDERABLE_ENTRIES_ATTRIBUTES.map(prop=>RendererMarkdown$1.get().render(entriesMetaShip[prop]).trim()).join("\n\n");
        }

        static getControlSection_({entry}) {
            const renderer = RendererMarkdown$1.get();
            const entriesMetaSection = Renderer.vehicle.ship.getSectionHpEntriesMeta_({
                entry
            });

            return [`### Control: ${entry.name}`, entriesMetaSection.entryArmorClass ? renderer.render(entriesMetaSection.entryArmorClass) : null, entriesMetaSection.entryHitPoints ? renderer.render(entriesMetaSection.entryHitPoints) : null, RendererMarkdown$1.get().render({
                entries: entry.entries
            }), ].map(it=>it != null ? it.trim() : it).filter(Boolean).join("\n\n");
        }

        static getMovementSection_({entry}) {
            const renderer = RendererMarkdown$1.get();
            const entriesMetaSection = Renderer.vehicle.ship.getSectionHpEntriesMeta_({
                entry
            });

            return [`### ${entry.isControl ? `Control and ` : ""}Movement: ${entry.name}`, entriesMetaSection.entryArmorClass ? renderer.render(entriesMetaSection.entryArmorClass) : null, entriesMetaSection.entryHitPoints ? renderer.render(entriesMetaSection.entryHitPoints) : null, ...(entry.locomotion || []).map(entry=>RendererMarkdown$1.get().render(Renderer.vehicle.ship.getLocomotionEntries(entry))), ...(entry.speed || []).map(entry=>RendererMarkdown$1.get().render(Renderer.vehicle.ship.getSpeedEntries(entry))), ].map(it=>it != null ? it.trim() : it).filter(Boolean).join("\n\n");
        }

        static getWeaponSection_({entry}) {
            const renderer = RendererMarkdown$1.get();
            const entriesMetaSection = Renderer.vehicle.ship.getSectionHpEntriesMeta_({
                entry,
                isEach: !!entry.count
            });

            return [`### Weapons: ${entry.name}${entry.count ? ` (${entry.count})` : ""}`, entriesMetaSection.entryArmorClass ? renderer.render(entriesMetaSection.entryArmorClass) : null, entriesMetaSection.entryHitPoints ? renderer.render(entriesMetaSection.entryHitPoints) : null, RendererMarkdown$1.get().render({
                entries: entry.entries
            }), ].map(it=>it != null ? it.trim() : it).filter(Boolean).join("\n\n");
        }

        static getOtherSection_({entry}) {
            const renderer = RendererMarkdown$1.get();
            const entriesMetaSection = Renderer.vehicle.ship.getSectionHpEntriesMeta_({
                entry
            });

            return [`### ${entry.name}`, entriesMetaSection.entryArmorClass ? renderer.render(entriesMetaSection.entryArmorClass) : null, entriesMetaSection.entryHitPoints ? renderer.render(entriesMetaSection.entryHitPoints) : null, RendererMarkdown$1.get().render({
                entries: entry.entries
            }), ].map(it=>it != null ? it.trim() : it).filter(Boolean).join("\n\n");
        }
    }
    ;

    static _getRenderedString_ship(ent, opts) {
        const renderer = RendererMarkdown$1.get();
        const entriesMeta = Renderer.vehicle.getVehicleRenderableEntriesMeta(ent);
        const entriesMetaShip = Renderer.vehicle.ship.getVehicleShipRenderableEntriesMeta(ent);

        const entriesMetaSectionHull = ent.hull ? Renderer.vehicle.ship.getSectionHpEntriesMeta_({
            entry: ent.hull
        }) : null;

        const ptsJoined = [`## ${ent.name}`, renderer.render(entriesMetaShip.entrySizeDimensions), RendererMarkdown$1.vehicle.ship.getCrewCargoPaceSection_(ent, {
            entriesMetaShip
        }), RendererMarkdown$1.utils.compact.getRenderedAbilityScores(ent), entriesMeta.entryDamageImmunities ? renderer.render(entriesMeta.entryDamageImmunities) : null, entriesMeta.entryConditionImmunities ? renderer.render(entriesMeta.entryConditionImmunities) : null, ent.action ? "### Actions" : null, ent.action ? renderer.render({
            entries: ent.action
        }) : null, ...(entriesMetaShip.entriesOtherActions || []).map(entry=>RendererMarkdown$1.vehicle.ship.getOtherSection_({
            entry
        })), ent.hull ? "### Hull" : null, entriesMetaSectionHull?.entryArmorClass ? renderer.render(entriesMetaSectionHull.entryArmorClass) : null, entriesMetaSectionHull?.entryHitPoints ? renderer.render(entriesMetaSectionHull.entryHitPoints) : null, ...this._getLinesRendered_traits({
            ent,
            renderer
        }), ...(ent.control || []).map(entry=>RendererMarkdown$1.vehicle.ship.getControlSection_({
            entry
        })), ...(ent.movement || []).map(entry=>RendererMarkdown$1.vehicle.ship.getMovementSection_({
            entry
        })), ...(ent.weapon || []).map(entry=>RendererMarkdown$1.vehicle.ship.getWeaponSection_({
            entry
        })), ...(entriesMetaShip.entriesOtherOthers || []).map(entry=>RendererMarkdown$1.vehicle.ship.getOtherSection_({
            entry
        })), ].map(it=>it != null ? it.trim() : it).filter(Boolean).join("\n\n");

        return ptsJoined.trim();
    }

    static spelljammer = class {
        static getWeaponSection_({entry}) {
            const renderer = RendererMarkdown$1.get();
            const entriesMetaSectionWeapon = Renderer.vehicle.spelljammer.getSectionWeaponEntriesMeta(entry);
            const entriesMetaSectionHpCost = Renderer.vehicle.spelljammer.getSectionHpCostEntriesMeta(entry);

            return [`### ${entriesMetaSectionWeapon.entryName}`, entriesMetaSectionHpCost.entryArmorClass ? renderer.render(entriesMetaSectionHpCost.entryArmorClass) : null, entriesMetaSectionHpCost.entryHitPoints ? renderer.render(entriesMetaSectionHpCost.entryHitPoints) : null, entriesMetaSectionHpCost.entryCost ? renderer.render(entriesMetaSectionHpCost.entryCost) : null, RendererMarkdown$1.get().render({
                entries: entry.entries
            }), ...(entry.action || []).map(act=>renderer.render(act, 2)), ].map(it=>it != null ? it.trim() : it).filter(Boolean).join("\n\n");
        }
    }
    ;

    static _getRenderedString_spelljammer(ent, opts) {
        const renderer = RendererMarkdown$1.get();
        const entriesMetaSpelljammer = Renderer.vehicle.spelljammer.getVehicleSpelljammerRenderableEntriesMeta(ent);

        const ptsJoined = [`## ${ent.name}`, renderer.render(entriesMetaSpelljammer.entryTableSummary), ...(ent.weapon || []).map(entry=>RendererMarkdown$1.vehicle.spelljammer.getWeaponSection_({
            entry
        })), ].map(it=>it != null ? it.trim() : it).filter(Boolean).join("\n\n");

        return ptsJoined.trim();
    }

    static _getRenderedString_infwar(ent, opts) {
        opts.meta ||= {};

        const renderer = RendererMarkdown$1.get();
        const entriesMeta = Renderer.vehicle.getVehicleRenderableEntriesMeta(ent);
        const entriesMetaInfwar = Renderer.vehicle.infwar.getVehicleInfwarRenderableEntriesMeta(ent);

        const reactionArray = Renderer.monster.getOrderedReactions(ent);

        const ptsJoined = [`## ${ent.name}`, renderer.render(entriesMetaInfwar.entrySizeWeight), ...Renderer.vehicle.infwar.PROPS_RENDERABLE_ENTRIES_ATTRIBUTES.map(prop=>renderer.render(entriesMetaInfwar[prop])), renderer.render(entriesMetaInfwar.entrySpeedNote), RendererMarkdown$1.utils.compact.getRenderedAbilityScores(ent), entriesMeta.entryDamageImmunities ? renderer.render(entriesMeta.entryDamageImmunities) : null, entriesMeta.entryConditionImmunities ? renderer.render(entriesMeta.entryConditionImmunities) : null, ...this._getLinesRendered_traits({
            ent,
            renderer
        }), RendererMarkdown$1.monster.getRenderedSection({
            arr: ent.actionStation,
            ent,
            prop: "actionStation",
            title: "Action Stations",
            meta: opts.meta
        }), RendererMarkdown$1.monster.getRenderedSection({
            arr: reactionArray,
            ent,
            prop: "reaction",
            title: "Reactions",
            meta: opts.meta
        }), ].map(it=>it != null ? it.trim() : it).filter(Boolean).join("\n\n");

        return ptsJoined.trim();
    }
}
;

RendererMarkdown$1.vehicleUpgrade = class {
    static getCompactRenderedString(ent, opts={}) {
        const entries = [RendererMarkdown$1.vehicleUpgrade.getUpgradeSummary(ent), {
            entries: ent.entries
        }, ].filter(Boolean);

        const entFull = {
            ...ent,
            entries,
        };

        return RendererMarkdown$1.utils.withMetaDepth(1, opts, ()=>{
            return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
        }
        );
    }

    static getUpgradeSummary(ent) {
        const out = [ent.upgradeType ? ent.upgradeType.map(t=>Parser.vehicleTypeToFull(t)) : null, ent.prerequisite ? Renderer.utils.prerequisite.getHtml(ent.prerequisite, {
            isTextOnly: true
        }) : null, ].filter(Boolean).join(", ");

        return out ? `{@i ${out}}` : null;
    }
}
;

RendererMarkdown$1.recipe = class {
    static getCompactRenderedString(ent, opts={}) {
        const entriesMeta = Renderer.recipe.getRecipeRenderableEntriesMeta(ent);

        const ptHead = RendererMarkdown$1.utils.withMetaDepth(0, opts, ()=>{
            const entries = [...(entriesMeta.entryMetasTime || []).map(({entryName, entryContent})=>`${entryName} ${entryContent}`), entriesMeta.entryMakes, entriesMeta.entryServes, entriesMeta.entryIngredients, ].filter(Boolean);

            const entFull = {
                ...ent,
                entries,
            };

            return RendererMarkdown$1.generic.getCompactRenderedString(entFull, opts);
        }
        );

        const ptInstructions = RendererMarkdown$1.utils.withMetaDepth(2, opts, ()=>{
            return RendererMarkdown$1.generic.getRenderedSubEntry(entriesMeta.entryInstructions, opts);
        }
        );

        const out = [ptHead, entriesMeta.entryEquipment ? RendererMarkdown$1.get().render(entriesMeta.entryEquipment) : null, entriesMeta.entryCooksNotes ? RendererMarkdown$1.get().render(entriesMeta.entryCooksNotes) : null, ptInstructions, ].filter(Boolean).join("\n\n");
        return RendererMarkdown$1.utils.getNormalizedNewlines(out);
    }
}
;

RendererMarkdown$1.variantrule = class {
    static getCompactRenderedString(ent, opts={}) {
        return RendererMarkdown$1.generic.getCompactRenderedString(ent, opts);
    }
}
;

RendererMarkdown$1.generic = class {
    static getCompactRenderedString(ent, opts={}) {
        const subStack = [""];
        subStack[0] += `## ${ent._displayName || ent.name}\n\n`;
        ent.entries.forEach(entry=>{
            RendererMarkdown$1.generic.getRenderedSubEntry(entry, opts, {
                subStack
            });
            subStack[0] += "\n\n";
        }
        );
        return `\n${RendererMarkdown$1.utils.getNormalizedNewlines(subStack.join("").trim())}\n\n`;
    }

    static getRenderedSubEntry(entry, opts={}, {subStack=null}={}) {
        const meta = opts.meta || {};
        subStack ||= [""];
        RendererMarkdown$1.get().recursiveRender(entry, subStack, meta, {
            suffix: "\n"
        });
        return subStack.join("");
    }

    static getRenderedPrerequisite(ent) {
        const out = Renderer.utils.prerequisite.getHtml(ent.prerequisite, {
            isTextOnly: true,
            isSkipPrefix: true
        });
        return out ? `Prerequisite: ${out}` : "";
    }
}
;

RendererMarkdown$1.hover = class {
    static getFnRenderCompact(prop) {
        return RendererMarkdown$1[prop]?.getCompactRenderedString?.bind(RendererMarkdown$1[prop]);
    }
}
;