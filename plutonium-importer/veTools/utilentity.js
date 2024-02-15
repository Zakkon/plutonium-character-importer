//#region UtilEntity
class UtilEntityBase {
    static _PropNamespacer = null;

    static getCompendiumDeepKeys() {
        return null;
    }

    static getCompendiumAliases(ent, {isStrict=false}={}) {
        return [];
    }

    static getEntityAliases(ent, {isStrict=false}={}) {
        return [];
    }

    static getNamespacedProp(prop) {
        if (!this._PropNamespacer)
            throw new Error("Unimplemented!");
        return this._PropNamespacer.getNamespacedProp(prop);
    }

    static getUnNamespacedProp(propNamespaced) {
        if (!this._PropNamespacer)
            throw new Error("Unimplemented!");
        return this._PropNamespacer.getUnNamespacedProp(propNamespaced);
    }
}
class UtilEntityClassSubclassFeature extends UtilEntityBase {
    static getBrewProp(feature) {
        const type = this.getEntityType(feature);
        switch (type) {
        case "classFeature":
            return "foundryClassFeature";
        case "subclassFeature":
            return "foundrySubclassFeature";
        default:
            throw new Error(`Unhandled feature type "${type}"`);
        }
    }

    static getEntityType(feature) {
        if (feature.subclassShortName)
            return "subclassFeature";
        if (feature.className)
            return "classFeature";
        return null;
    }

    static getCompendiumAliases(ent, {isStrict=false}={}) {
        return this.getEntityAliases(ent).map(it=>it.name);
    }

    static _FEATURE_SRD_ALIAS_WITH_CLASSNAME = new Set(["unarmored defense", "channel divinity", "expertise", "land's stride", "timeless body", "spellcasting", ]);

    static getEntityAliases(ent, {isStrict=false}={}) {
        if (!ent.name)
            return [];

        const out = [];

        const lowName = ent.name.toLowerCase().trim();

        const noBrackets = ent.name.replace(/\([^)]+\)/g, "").replace(/\s+/g, " ").trim();
        if (noBrackets !== ent.name)
            out.push({
                ...ent,
                name: noBrackets
            });

        const splitColon = ent.name.split(":")[0].trim();
        const isSplitColonName = splitColon !== ent.name;
        if (isSplitColonName) {
            out.push({
                ...ent,
                name: splitColon
            });

            if (this._FEATURE_SRD_ALIAS_WITH_CLASSNAME.has(splitColon.toLowerCase())) {
                out.push({
                    ...ent,
                    name: `${splitColon} (${ent.className})`
                });
            }
        }

        if (this._FEATURE_SRD_ALIAS_WITH_CLASSNAME.has(lowName)) {
            out.push({
                ...ent,
                name: `${ent.name} (${ent.className})`
            });
        }

        if (lowName.startsWith("mystic arcanum")) {
            out.push({
                ...ent,
                name: `${ent.name} (${ent.className})`
            });
        }

        if (!isSplitColonName) {
            out.push({
                ...ent,
                name: `Channel Divinity: ${ent.name}`
            });
            out.push({
                ...ent,
                name: `Ki: ${ent.name}`
            });
        }

        return out;
    }
}
//#endregion
export {UtilEntityClassSubclassFeature}