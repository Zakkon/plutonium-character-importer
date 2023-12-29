globalThis.SourceUtil = {
    ADV_BOOK_GROUPS: [{
        group: "core",
        displayName: "Core"
    }, {
        group: "supplement",
        displayName: "Supplements"
    }, {
        group: "setting",
        displayName: "Settings"
    }, {
        group: "setting-alt",
        displayName: "Additional Settings"
    }, {
        group: "supplement-alt",
        displayName: "Extras"
    }, {
        group: "prerelease",
        displayName: "Prerelease"
    }, {
        group: "homebrew",
        displayName: "Homebrew"
    }, {
        group: "screen",
        displayName: "Screens"
    }, {
        group: "recipe",
        displayName: "Recipes"
    }, {
        group: "other",
        displayName: "Miscellaneous"
    }, ],

    _subclassReprintLookup: {},
    async pInitSubclassReprintLookup() {
        SourceUtil._subclassReprintLookup = await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/generated/gendata-subclass-lookup.json`);
    },

    isSubclassReprinted(className, classSource, subclassShortName, subclassSource) {
        const fromLookup = MiscUtil.get(SourceUtil._subclassReprintLookup, classSource, className, subclassSource, subclassShortName);
        return fromLookup ? fromLookup.isReprinted : false;
    },

    isSiteSource(source) {
        return !!Parser.SOURCE_JSON_TO_FULL[source];
    },

    isAdventure(source) {
        if (source instanceof FilterItem)
            source = source.item;
        return Parser.SOURCES_ADVENTURES.has(source);
    },

    isCoreOrSupplement(source) {
        if (source instanceof FilterItem)
            source = source.item;
        return Parser.SOURCES_CORE_SUPPLEMENTS.has(source);
    },

    isNonstandardSource(source) {
        if (source == null)
            return false;
        return ((typeof BrewUtil2 === "undefined" || !BrewUtil2.hasSourceJson(source)) && SourceUtil.isNonstandardSourceWotc(source)) || SourceUtil.isPrereleaseSource(source);
    },

    isPartneredSourceWotc(source) {
        if (source == null)
            return false;
        return Parser.SOURCES_PARTNERED_WOTC.has(source);
    },

    isPrereleaseSource(source) {
        if (source == null)
            return false;
        if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
            return true;
        return source.startsWith(Parser.SRC_UA_PREFIX) || source.startsWith(Parser.SRC_UA_ONE_PREFIX);
    },

    isNonstandardSourceWotc(source) {
        return SourceUtil.isPrereleaseSource(source) || source.startsWith(Parser.SRC_PS_PREFIX) || source.startsWith(Parser.SRC_AL_PREFIX) || source.startsWith(Parser.SRC_MCVX_PREFIX) || Parser.SOURCES_NON_STANDARD_WOTC.has(source);
    },

    FILTER_GROUP_STANDARD: 0,
    FILTER_GROUP_PARTNERED: 1,
    FILTER_GROUP_NON_STANDARD: 2,
    FILTER_GROUP_HOMEBREW: 3,

    getFilterGroup(source) {
        if (source instanceof FilterItem)
            source = source.item;
        if ((typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source)) || SourceUtil.isNonstandardSource(source))
            return SourceUtil.FILTER_GROUP_NON_STANDARD;
        if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
            return SourceUtil.FILTER_GROUP_HOMEBREW;
        if (SourceUtil.isPartneredSourceWotc(source))
            return SourceUtil.FILTER_GROUP_PARTNERED;
        return SourceUtil.FILTER_GROUP_STANDARD;
    },

    getAdventureBookSourceHref(source, page) {
        if (!source)
            return null;
        source = source.toLowerCase();

        let docPage, mappedSource;
        if (Parser.SOURCES_AVAILABLE_DOCS_BOOK[source]) {
            docPage = UrlUtil.PG_BOOK;
            mappedSource = Parser.SOURCES_AVAILABLE_DOCS_BOOK[source];
        } else if (Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE[source]) {
            docPage = UrlUtil.PG_ADVENTURE;
            mappedSource = Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE[source];
        }
        if (!docPage)
            return null;

        mappedSource = mappedSource.toLowerCase();

        return `${docPage}#${[mappedSource, page ? `page:${page}` : null].filter(Boolean).join(HASH_PART_SEP)}`;
    },

    getEntitySource(it) {
        return it.source || it.inherits?.source;
    },
};