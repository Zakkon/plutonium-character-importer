import { BaseComponent } from "./basecomponent.js";
import { UtilActors } from "./utilactors.js";
import { ModalFilterSpellsFvtt } from "./modal.js";

class Charactermancer_Class_HpIncreaseModeSelect {//extends BaseComponent {
    static async pGetUserInput() {
        if (this.isNoChoice()) {
            const comp = new this();
            return comp.pGetFormData();
        }

        return UtilApplications.pGetImportCompApplicationFormData({
            comp: new this(),
            width: 480,
            height: 150,
        });
    }

    static isHpAvailable(cls) {
        return cls.hd && cls.hd.number && !isNaN(cls.hd.number) && cls.hd.faces && !isNaN(cls.hd.faces);
    }

    static isNoChoice() {
        if (game.user.isGM)
            return false;

        if (Config.get("importClass", "hpIncreaseMode") === ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__ROLL_CUSTOM && Config.get("importClass", "hpIncreaseModeCustomRollFormula") == null)
            return false;

        return Config.get("importClass", "hpIncreaseMode") != null;
    }

    pGetFormData() {
        return {
            isFormComplete: true,
            data: {
                mode: this._state.mode,
                customFormula: this._state.customFormula,
            },
        };
    }

    get modalTitle() {
        return `Select Hit Points Increase Mode`;
    }

    render($wrp) {
        const $sel = ComponentUiUtil.$getSelEnum(this, "mode", {
            values: [ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__TAKE_AVERAGE, ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__MIN, ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__MAX, ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__ROLL, ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__ROLL_CUSTOM, ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__DO_NOT_INCREASE, ],
            fnDisplay: mode=>ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE___NAMES[mode],
        }, );

        if (!game.user.isGM && Config.get("importClass", "hpIncreaseMode") != null)
            $sel.disable();

        const $iptCustom = ComponentUiUtil.$getIptStr(this, "customFormula").addClass("code");

        if (!game.user.isGM && Config.get("importClass", "hpIncreaseModeCustomRollFormula") != null)
            $iptCustom.disable();

        const $stgCustom = $$`<div class="mt-2 ve-flex-v-center">
			<div class="inline-block bold mr-1 no-wrap">Custom Formula:</div>
			${$iptCustom}
		</div>`;
        const hkMode = ()=>{
            $stgCustom.toggleVe(this._state.mode === ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__ROLL_CUSTOM);
        }
        ;
        this._addHookBase("mode", hkMode);
        hkMode();

        $$`<div class="ve-flex-col min-h-0">
			${$sel}
			${$stgCustom}
		</div>`.appendTo($wrp);
    }

    _getDefaultState() {
        return {
            mode: Config.get("importClass", "hpIncreaseMode") ?? ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__TAKE_AVERAGE,
            customFormula: Config.get("importClass", "hpIncreaseModeCustomRollFormula") ?? "(2 * @hd.number)d(@hd.faces / 2)",
        };
    }
}
class Charactermancer_Class_ProficiencyImportModeSelect extends BaseComponent {
    static async pGetUserInput() {
        return UtilApplications.pGetImportCompApplicationFormData({
            comp: new this(),
            isUnskippable: true,
            isAutoResize: true,
        });
    }

    pGetFormData() {
        return {
            isFormComplete: true,
            data: this._state.mode,
        };
    }

    get modalTitle() {
        return `Select Class Proficiency Import Mode`;
    }

    render($wrp) {
        const $sel = ComponentUiUtil.$getSelEnum(this, "mode", {
            values: [Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS, Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY, Charactermancer_Class_ProficiencyImportModeSelect.MODE_NONE, ],
            fnDisplay: mode=>Charactermancer_Class_ProficiencyImportModeSelect.DISPLAY_MODES[mode],
        }, );

        $$`<div class="ve-flex-col min-h-0">
			${$sel}
		</div>`.appendTo($wrp);
    }

    _getDefaultState() {
        return {
            mode: Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS,
        };
    }
}
Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS = 0;
Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY = 1;
Charactermancer_Class_ProficiencyImportModeSelect.MODE_NONE = 2;

Charactermancer_Class_ProficiencyImportModeSelect.DISPLAY_MODES = {
    [Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS]: "Add multiclass proficiencies (this is my second+ class)",
    [Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY]: "Add base class proficiencies and equipment (this is my first class)",
    [Charactermancer_Class_ProficiencyImportModeSelect.MODE_NONE]: "Do not add proficiencies or equipment",
};

class Charactermancer_Class_StartingProficiencies extends BaseComponent {
    static get({featureSourceTracker, primaryProficiencies, multiclassProficiencies, savingThrowsProficiencies, mode, existingProficienciesFvttArmor, existingProficienciesFvttWeapons, existingProficienciesFvttSavingThrows, }={}, ) {
        const {existingProficienciesVetArmor, existingProficienciesCustomArmor,
        existingProficienciesVetWeapons, existingProficienciesCustomWeapons,
        existingProficienciesVetSavingThrows, } = this._getExistingProficienciesVet({
            existingProficienciesFvttArmor,
            existingProficienciesFvttWeapons,
            existingProficienciesFvttSavingThrows,
        });

        const comp = new this({
            featureSourceTracker,
            primaryProficiencies,
            multiclassProficiencies,
            savingThrowsProficiencies,
            existingProficienciesVetArmor,
            existingProficienciesVetWeapons,
            existingProficienciesVetSavingThrows,

            existingProficienciesCustomArmor,
            existingProficienciesCustomWeapons,

            existingProficienciesFvttArmor,
            existingProficienciesFvttWeapons,
            existingProficienciesFvttSavingThrows,
        });

        if (mode != null)
            comp.mode = mode;

        return comp;
    }

    static async pGetUserInput({featureSourceTracker, primaryProficiencies, multiclassProficiencies, savingThrowsProficiencies, mode, existingProficienciesFvttArmor, existingProficienciesFvttWeapons, existingProficienciesFvttSavingThrows, }={}, ) {
        return this.get({
            featureSourceTracker,
            primaryProficiencies,
            multiclassProficiencies,
            savingThrowsProficiencies,
            mode,
            existingProficienciesFvttArmor,
            existingProficienciesFvttWeapons,
            existingProficienciesFvttSavingThrows,
        }).pGetFormData();
    }

    static applyFormDataToActorUpdate(actUpdate, formData) {
        MiscUtil.getOrSet(actUpdate, "system", "traits", {});

        this._applyFormDataToActorUpdate_applyProfList({
            actUpdate,
            profList: formData?.data?.armor || [],
            profsExisting: formData?.existingDataFvtt?.existingProficienciesArmor || {},
            propTrait: "armorProf",
            fnGetMapped: UtilActors.getMappedArmorProficiency.bind(UtilActors),
        });

        this._applyFormDataToActorUpdate_applyProfList({
            actUpdate,
            profList: formData.data?.weapons || [],
            profsExisting: formData?.existingDataFvtt?.existingProficienciesWeapons || {},
            propTrait: "weaponProf",
            fnGetMapped: UtilActors.getMappedWeaponProficiency.bind(UtilActors),
            fnGetPreMapped: UtilActors.getItemUIdFromWeaponProficiency.bind(UtilActors),
        });

        const tgtAbils = MiscUtil.getOrSet(actUpdate, "system", "abilities", {});
        [...(formData.data?.savingThrows || []), ...(formData.existingDataFvtt?.savingThrows || [])].forEach(abv=>(tgtAbils[abv] = tgtAbils[abv] || {}).proficient = 1);
    }

    static _applyFormDataToActorUpdate_addIfNotExists(arr, itm) {
        if (!arr.some(it=>it.toLowerCase().trim() === itm.toLowerCase().trim()))
            arr.push(itm);
    }

    static _applyFormDataToActorUpdate_applyProfList({actUpdate, profList, profsExisting, propTrait, fnGetMapped, fnGetPreMapped, }, ) {
        if (!profList?.length)
            return;

        const tgt = MiscUtil.getOrSet(actUpdate, "system", "traits", propTrait, {});
        tgt.value = tgt.value || [];
        tgt.custom = tgt.custom || "";

        const customArr = tgt.custom.split(";").map(it=>it.trim()).filter(Boolean);

        (profsExisting.value || []).forEach(it=>this._applyFormDataToActorUpdate_addIfNotExists(tgt.value, it));

        (profsExisting.custom || "").split(";").map(it=>it.trim()).filter(Boolean).forEach(it=>this._applyFormDataToActorUpdate_addIfNotExists(customArr, it));

        profList.forEach(it=>{
            const clean = (fnGetPreMapped ? fnGetPreMapped(it) : null) ?? Renderer.stripTags(it).toLowerCase();
            const mapped = fnGetMapped(clean);
            if (mapped)
                return this._applyFormDataToActorUpdate_addIfNotExists(tgt.value, mapped);

            const [itemTag] = /{@item [^}]+}/i.exec(it) || [];
            if (itemTag) {
                const mappedAlt = fnGetMapped(Renderer.stripTags(itemTag));
                if (mappedAlt)
                    return this._applyFormDataToActorUpdate_addIfNotExists(tgt.value, mappedAlt);
            }

            this._applyFormDataToActorUpdate_addIfNotExists(customArr, Renderer.stripTags(it));
        }
        );

        tgt.custom = customArr.join("; ");
    }

    static getExistingProficienciesFvttSavingThrows(actor) {
        return Object.entries(MiscUtil.get(actor, "_source", "system", "abilities") || {}).filter(([,abMeta])=>abMeta.proficient).map(([ab])=>ab);
    }

    static _getExistingProficienciesVet({existingProficienciesFvttArmor, existingProficienciesFvttWeapons, existingProficienciesFvttSavingThrows}) {
        const vetValidWeapons = new Set();
        const customWeapons = new Set();
        const vetValidArmors = new Set();
        const customArmors = new Set();

        this._getExistingProficienciesVet_({
            existingFvtt: existingProficienciesFvttWeapons,
            fnGetUnmapped: UtilActors.getUnmappedWeaponProficiency.bind(UtilActors),
            fnCheckUnmappedAlt: UtilActors.getItemUIdFromWeaponProficiency.bind(UtilActors),
            vetValidSet: vetValidWeapons,
            customSet: customWeapons,
        });

        this._getExistingProficienciesVet_({
            existingFvtt: existingProficienciesFvttArmor,
            fnGetUnmapped: UtilActors.getUnmappedArmorProficiency.bind(UtilActors),
            vetValidSet: vetValidArmors,
            customSet: customArmors,
        });

        return {
            existingProficienciesVetWeapons: [...vetValidWeapons],
            existingProficienciesCustomWeapons: [...customWeapons],
            existingProficienciesVetArmor: [...vetValidArmors],
            existingProficienciesCustomArmor: [...customArmors],
            existingProficienciesVetSavingThrows: existingProficienciesFvttSavingThrows,
        };
    }

    static _getExistingProficienciesVet_({existingFvtt, vetValidSet, customSet, fnGetUnmapped, fnCheckUnmappedAlt, }) {
        (existingFvtt?.value || []).forEach(it=>{
            const unmapped = fnGetUnmapped(it);
            if (unmapped)
                vetValidSet.add(unmapped);
            else {
                if (fnCheckUnmappedAlt) {
                    const unmappedVet = fnCheckUnmappedAlt(it);
                    if (unmappedVet)
                        vetValidSet.add(it);
                    else
                        customSet.add(it);
                } else {
                    customSet.add(it);
                }
            }
        }
        );

        (existingFvtt?.custom || "").trim().split(";").map(it=>it.trim()).filter(Boolean).forEach(it=>{
            const low = it.toLowerCase();
            const unmapped = fnGetUnmapped(low);
            if (unmapped)
                vetValidSet.add(unmapped);
            else {
                if (fnCheckUnmappedAlt) {
                    const unmappedVet = fnCheckUnmappedAlt(low);
                    if (unmappedVet)
                        vetValidSet.add(low);
                    else
                        customSet.add(it);
                } else {
                    customSet.add(it);
                }
            }
        }
        );
    }

    static _getCleanVetProfs(vetProfs) {
        if (!vetProfs)
            return {};

        const out = {};

        if (vetProfs.armor)
            out.armor = this._getCleanVetProfs_getMappedItemTags(vetProfs.armor.map(it=>it.proficiency || it));
        if (vetProfs.weapons)
            out.weapons = this._getCleanVetProfs_getMappedItemTags(vetProfs.weapons.map(it=>(it.proficiency || it).toLowerCase().trim()));

        return out;
    }

    static _getCleanVetProfs_getMappedItemTags(arr) {
        return arr.map(it=>it.replace(/^{@item ([^}]+)}$/g, (...m)=>{
            const [name,source] = Renderer.splitTagByPipe(m[1]);
            return `${name}|${source || Parser.SRC_DMG}`.toLowerCase();
        }
        ));
    }

    constructor({featureSourceTracker, primaryProficiencies, multiclassProficiencies, savingThrowsProficiencies, existingProficienciesVetArmor, existingProficienciesVetWeapons, existingProficienciesVetSavingThrows, existingProficienciesFvttArmor, existingProficienciesFvttWeapons, existingProficienciesFvttSavingThrows, existingProficienciesCustomArmor, existingProficienciesCustomWeapons, }={}, ) {
        super();
        this._featureSourceTracker = featureSourceTracker;
        this._primaryProficiencies = Charactermancer_Class_StartingProficiencies._getCleanVetProfs(primaryProficiencies);
        this._multiclassProficiencies = Charactermancer_Class_StartingProficiencies._getCleanVetProfs(multiclassProficiencies);
        this._savingThrowsProficiencies = savingThrowsProficiencies;

        this._existingProficienciesVetArmor = existingProficienciesVetArmor;
        this._existingProficienciesVetWeapons = existingProficienciesVetWeapons;
        this._existingProficienciesVetSavingThrows = existingProficienciesVetSavingThrows;

        this._existingProficienciesCustomArmor = existingProficienciesCustomArmor;
        this._existingProficienciesCustomWeapons = existingProficienciesCustomWeapons;
        this._existingProficienciesFvttArmor = existingProficienciesFvttArmor ? MiscUtil.copy(existingProficienciesFvttArmor) : null;
        this._existingProficienciesFvttWeapons = existingProficienciesFvttWeapons ? MiscUtil.copy(existingProficienciesFvttWeapons) : null;
        this._existingProficienciesFvttSavingThrows = existingProficienciesFvttSavingThrows ? MiscUtil.copy(existingProficienciesFvttSavingThrows) : null;
    }

    set mode(mode) {
        this._state.mode = mode;
    }

    _getFormData() {
        const isPrimary = this._state.mode === Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY;
        const profs = isPrimary ? this._primaryProficiencies : this._multiclassProficiencies;

        if (!profs)
            return {
                isFormComplete: true,
                data: {},
                existingData: {}
            };

        return {
            isFormComplete: true,
            data: {
                armor: profs.armor || [],
                weapons: profs.weapons || [],
                savingThrows: isPrimary ? (this._savingThrowsProficiencies || []) : [],
            },
            existingDataFvtt: {
                existingProficienciesArmor: this._existingProficienciesFvttArmor,
                existingProficienciesWeapons: this._existingProficienciesFvttWeapons,
                existingProficienciesSavingThrows: this._existingProficienciesFvttSavingThrows,
            },
        };
    }

    pGetFormData() {
        return this._getFormData();
    }

    render($wrp) {
        const $wrpDisplay = $(`<div class="ve-flex-col min-h-0 ve-small"></div>`).appendTo($wrp);

        const fnsCleanup = [];

        const hkMode = ()=>{
            fnsCleanup.forEach(fn=>fn());
            fnsCleanup.splice(0, fnsCleanup.length);

            $wrpDisplay.empty();
            const isPrimary = this._state.mode === Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY;

            const profs = isPrimary ? this._primaryProficiencies : this._multiclassProficiencies;
            if (profs) {
                this._render_profType({
                    profList: profs.armor,
                    title: "Armor",
                    $wrpDisplay,
                    propTracker: "armorProficiencies",
                    propTrackerPulse: "pulseArmorProficiencies",
                    fnsCleanup,
                    existing: this._existingProficienciesVetArmor,
                    existingProficienciesCustom: this._existingProficienciesCustomArmor,
                    fnDisplay: str=>["light", "medium", "heavy"].includes(str) ? `${str} armor` : str.includes("|") ? `{@item ${str}}` : str,
                });

                this._render_profType({
                    profList: profs.weapons,
                    title: "Weapons",
                    $wrpDisplay,
                    propTracker: "weaponProficiencies",
                    propTrackerPulse: "pulseWeaponProficiencies",
                    fnsCleanup,
                    existing: this._existingProficienciesVetWeapons,
                    existingProficienciesCustom: this._existingProficienciesCustomWeapons,
                    fnDisplay: str=>["simple", "martial"].includes(str) ? `${str} weapons` : str.includes("|") ? `{@item ${str}}` : str,
                });
            }

            if (isPrimary && this._savingThrowsProficiencies) {
                this._render_profType({
                    profList: this._savingThrowsProficiencies,
                    title: "Saving Throws",
                    $wrpDisplay,
                    propTracker: "savingThrowProficiencies",
                    propTrackerPulse: "pulseSavingThrowProficiencies",
                    fnsCleanup,
                    existing: this._existingProficienciesVetSavingThrows,
                    fnDisplay: str=>Parser.attAbvToFull(str),
                });
            }

            if (this._featureSourceTracker)
                this._featureSourceTracker.setState(this, this._getStateTrackerData());
        }
        ;
        this._addHookBase("mode", hkMode);
        hkMode();
    }

    _getStateTrackerData() {
        const formData = this._getFormData();

        const getNoTags = (arr)=>arr.map(it=>this.constructor._getUid(it)).filter(Boolean);

        return {
            armorProficiencies: getNoTags(formData.data?.armor || []).mergeMap(it=>({
                [it]: true
            })),
            weaponProficiencies: getNoTags(formData.data?.weapons || []).mergeMap(it=>({
                [it]: true
            })),
        };
    }

    static _getUid(str) {
        if (!str.startsWith("{@item"))
            return str;

        let[name,source] = Renderer.splitTagByPipe((Renderer.splitFirstSpace(str.slice(1, -1))[1] || "").toLowerCase());
        source = source || Parser.SRC_DMG.toLowerCase();
        if (!name)
            return null;

        return `${name}|${source}`;
    }

    _render_profType({profList, title, $wrpDisplay, propTracker, propTrackerPulse, fnsCleanup, existing, existingProficienciesCustom, fnDisplay}) {
        if (!profList?.length)
            return;

        const profListUids = profList.map(prof=>this.constructor._getUid(prof));

        const $ptsExisting = {};

        const $wrps = profList.map((it,i)=>{
            const $ptExisting = $(`<div class="ve-small veapp__msg-warning inline-block"></div>`);
            const uid = profListUids[i];
            $ptsExisting[uid] = $ptExisting;
            const isNotLast = i < profList.length - 1;
            return $$`<div class="inline-block ${isNotLast ? "mr-1" : ""}">${Renderer.get().render(fnDisplay ? fnDisplay(it) : it)}${$ptExisting}${isNotLast ? `,` : ""}</div>`;
        }
        );

        $$`<div class="block">
			<div class="mr-1 bold inline-block">${title}:</div>${$wrps}
		</div>`.appendTo($wrpDisplay);

        const pHkUpdatePtsExisting = async()=>{
            try {
                await this._pLock("updateExisting");
                await pHkUpdatePtsExisting_();
            } finally {
                this._unlock("updateExisting");
            }
        }
        ;

        const pHkUpdatePtsExisting_ = async()=>{
            const otherStates = this._featureSourceTracker ? this._featureSourceTracker.getStatesForKey(propTracker, {
                ignore: this
            }) : null;

            for (const v of profListUids) {
                if (!$ptsExisting[v])
                    return;

                const parentGroup = await UtilDataConverter.pGetItemWeaponType(v);

                let isExisting = (existing || []).includes(v) || (parentGroup && (existing || []).includes(parentGroup)) || (existingProficienciesCustom || []).includes(v) || (parentGroup && (existingProficienciesCustom || []).includes(parentGroup));

                isExisting = isExisting || (otherStates || []).some(otherState=>!!otherState[v] || (parentGroup && !!otherState[parentGroup]));

                $ptsExisting[v].title(isExisting ? "Proficient from Another Source" : "").toggleClass("ml-1", isExisting).html(isExisting ? `(<i class="fas fa-fw ${UtilActors.PROF_TO_ICON_CLASS[1]}"></i>)` : "");
            }
        }
        ;
        if (this._featureSourceTracker) {
            this._featureSourceTracker.addHook(this, propTrackerPulse, pHkUpdatePtsExisting);
            fnsCleanup.push(()=>this._featureSourceTracker.removeHook(this, propTrackerPulse, pHkUpdatePtsExisting));
        }
        pHkUpdatePtsExisting();
    }

    _getDefaultState() {
        return {
            mode: Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY,
        };
    }
}

class Charactermancer_AdditionalSpellsSelect extends BaseComponent {
    static async pGetUserInput(opts) {
        opts = opts || {};
        const {additionalSpells} = opts;

        if (!additionalSpells || !additionalSpells.length)
            return {
                isFormComplete: true,
                data: []
            };

        const comp = this.getComp(opts);

        if (comp.isNoChoice({
            curLevel: opts.curLevel,
            targetLevel: opts.targetLevel,
            isStandalone: opts.isStandalone
        }))
            return comp.pGetFormData();

        return UtilApplications.pGetImportCompApplicationFormData({
            comp,
            width: 640,
            height: 220,
        });
    }

    static _MODAL_FILTER_SPELLS_DEFAULT = null;

    static async pGetInitModalFilterSpells() {
        if (!this._MODAL_FILTER_SPELLS_DEFAULT) {
            this._MODAL_FILTER_SPELLS_DEFAULT = new ModalFilterSpellsFvtt({
                namespace: "Charactermancer_AdditionalSpellsSelect.spells",
                isRadio: true
            });
            await this._MODAL_FILTER_SPELLS_DEFAULT.pPreloadHidden();
        }
        return this._MODAL_FILTER_SPELLS_DEFAULT;
    }

    static getComp(opts) {
        opts = opts || {};

        const comp = new this({
            ...opts
        });
        comp.curLevel = opts.curLevel;
        comp.targetLevel = opts.targetLevel;
        comp.spellLevelLow = opts.spellLevelLow;
        comp.spellLevelHigh = opts.spellLevelHigh;
        comp.isAnyCantrips = !!opts.isAnyCantrips;

        return comp;
    }

    static async pApplyFormDataToActor(actor, formData, opts) {
        opts = opts || {};

        if (!formData || !formData?.data?.length)
            return [];

        const ability = ((opts.abilityAbv === "inherit" ? opts.parentAbilityAbv : opts.abilityAbv) || (formData.abilityAbv === "inherit" ? opts.parentAbilityAbv : formData.abilityAbv)) ?? undefined;

        const {ImportListSpell} = await Promise.resolve().then(function() {
            return ImportListSpell$1;
        });
        const importListSpell = new ImportListSpell({
            actor
        });

        const out = [];

        for (const spellMeta of formData.data) {
            if (spellMeta.isExpanded)
                continue;

            let[name,source] = spellMeta.uid.split("|");
            if (!source)
                source = Parser.SRC_PHB;
            const hash = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_SPELLS]({
                name,
                source
            });

            const spell = await DataLoader.pCacheAndGet(UrlUtil.PG_SPELLS, source, hash);
            if (!spell) {
                const message = `Could not find spell "${hash}" when applying additional spells!`;
                ui.notifications.warn(message);
                console.warn(...LGT, message);
                continue;
            }

            const importSummary = await importListSpell.pImportEntry(spell, {
                taskRunner: opts.taskRunner,
                opts_pGetSpellItem: {
                    ability,
                    usesMax: spellMeta.uses,
                    usesValue: spellMeta.uses,
                    usesPer: spellMeta.usesPer,
                    consumeType: spellMeta.consumeType,
                    consumeAmount: spellMeta.consumeAmount,
                    consumeTarget: spellMeta.consumeTarget,
                    vetConsumes: spellMeta.vetConsumes,
                    isPrepared: spellMeta.isPrepared,
                    preparationMode: spellMeta.preparationMode,
                    castAtLevel: spellMeta.castAtLevel,

                    isIgnoreExisting: true,
                },
            }, );
            out.push(importSummary);
        }

        return out;
    }

    static isNoChoice(additionalSpells, {additionalSpellsFlat=null, curLevel=null, targetLevel=null, isStandalone=false}={}) {
        if (additionalSpells.length !== 1)
            return false;
        additionalSpellsFlat = additionalSpellsFlat || Charactermancer_AdditionalSpellsUtil.getFlatData(additionalSpells);

        const minLevel = curLevel ?? Number.MIN_SAFE_INTEGER;
        const maxLevel = targetLevel ?? Number.MAX_SAFE_INTEGER;

        const spellsInRange = additionalSpellsFlat.some(it=>Object.values(it.spells).some(it=>(!isStandalone || !it.isExpanded) && (it.requiredLevel == null || (it.requiredLevel >= minLevel && it.requiredLevel <= maxLevel))), );

        if (!spellsInRange)
            return true;

        return !additionalSpellsFlat.some(it=>it.meta.ability?.choose || Object.values(it.spells).some(it=>(it.type !== "all" && it.filterExpression != null) || it.chooseFromGroup != null));
    }

    constructor(opts) {
        opts = opts || {};
        super();

        this._additionalSpells = opts.additionalSpells;
        this._sourceHintText = opts.sourceHintText;
        this._modalFilterSpells = opts.modalFilterSpells;

        this._additionalSpellsFlat = Charactermancer_AdditionalSpellsUtil.getFlatData(opts.additionalSpells);
    }

    get modalTitle() {
        return `Choose Additional Spell Set${this._sourceHintText ? ` (${this._sourceHintText})` : ""}`;
    }

    set curLevel(val) {
        this._state.curLevel = val;
    }
    set targetLevel(val) {
        this._state.targetLevel = val;
    }
    set spellLevelLow(val) {
        this._state.spellLevelLow = val;
    }
    set spellLevelHigh(val) {
        this._state.spellLevelHigh = val;
    }
    set isAnyCantrips(val) {
        this._state.isAnyCantrips = !!val;
    }

    addHookAlwaysPreparedSpells(hk) {
        this._addHookBase("spellsAlwaysPrepared", hk);
    }
    addHookExpandedSpells(hk) {
        this._addHookBase("spellsExpanded", hk);
    }
    addHookAlwaysKnownSpells(hk) {
        this._addHookBase("spellsAlwaysKnown", hk);
    }

    get spellsAlwaysPrepared() {
        return this._state.spellsAlwaysPrepared;
    }
    get spellsExpanded() {
        return this._state.spellsExpanded;
    }
    get spellsAlwaysKnown() {
        return this._state.spellsAlwaysKnown;
    }

    _render_addLastAlwaysPreparedSpellsHook() {
        return this._render_addLastBoolSpellsHook({
            propState: "spellsAlwaysPrepared",
            propIsBool: "isAlwaysPrepared"
        });
    }
    _render_addLastExpandedSpellsHook() {
        return this._render_addLastBoolSpellsHook({
            propState: "spellsExpanded",
            propIsBool: "isExpanded"
        });
    }
    _render_addLastAlwaysKnownSpellsHook() {
        return this._render_addLastBoolSpellsHook({
            propState: "spellsAlwaysKnown",
            propIsBool: "isAlwaysKnown"
        });
    }

    _render_addLastBoolSpellsHook({propState, propIsBool}) {
        const hk = ()=>{
            const formData = this.getFormData();
            const nxt = formData.data.filter(it=>it[propIsBool]).map(it=>it.uid.toLowerCase());

            const setCurr = new Set(this._state[propState]);
            const setNxt = new Set(nxt);
            if (!CollectionUtil.setEq(setCurr, setNxt))
                this._state[propState] = nxt;
        }
        ;
        this._addHookBase("ixSet", hk);
        this._addHookBase("curLevel", hk);
        this._addHookBase("targetLevel", hk);
        this._addHookBase("spellLevelLow", hk);
        this._addHookBase("spellLevelHigh", hk);
        this._addHookBase("isAnyCantrips", hk);
        this._addHookBase("pulseChoose", hk);
        hk();
    }

    render($wrp) {
        this._render_addLastAlwaysPreparedSpellsHook();
        this._render_addLastExpandedSpellsHook();
        this._render_addLastAlwaysKnownSpellsHook();

        const $wrpOptionsButtons = $(`<div class="ve-flex-v-center ve-flex-wrap w-100 btn-group ${this._additionalSpellsFlat.length > 1 ? "mb-1" : ""}"></div>`);
        const $wrpOptions = $(`<div class="ve-flex-col w-100"></div>`);

        for (let i = 0; i < this._additionalSpellsFlat.length; ++i)
            this._render_renderOptions($wrpOptionsButtons, $wrpOptions, i);

        $$($wrp)`
			${$wrpOptionsButtons}
			${$wrpOptions}
		`;
    }

    _render_renderOptions($wrpOptionsButtons, $wrpOptions, ix) {
        const additionalSpellsFlatBlock = this._additionalSpellsFlat[ix];

        const $btnSelect = this._additionalSpellsFlat.length === 1 ? null : $(`<button class="btn btn-xs ve-flex-1" title="Select Spell Set">${additionalSpellsFlatBlock.meta.name ?? `Spell Set ${ix + 1}`}</button>`).click(()=>this._state.ixSet = ix);

        const isInnatePreparedList = this._isAnyInnatePrepared(ix);
        const isExpandedList = this._isAnyExpanded(ix);

        const sortedSpells = Object.values(additionalSpellsFlatBlock.spells).sort((a,b)=>SortUtil.ascSort(a.requiredLevel || 0, b.requiredLevel || 0) || SortUtil.ascSort(a.requiredCasterLevel || 0, b.requiredCasterLevel || 0));

        const $wrpInnatePreparedHeaders = isInnatePreparedList ? $(`<div class="ve-flex-v-center py-1">
			<div class="col-3 ve-text-center">Level</div>
			<div class="col-9">Spells</div>
		</div>`) : null;

        const $wrpExpandedHeaders = isExpandedList ? $(`<div class="ve-flex-v-center py-1">
			<div class="col-3 ve-text-center">Spell Level</div>
			<div class="col-9">Spells</div>
		</div>`) : null;

        const $rowsInnatePrepared = isInnatePreparedList ? this._render_$getRows(ix, sortedSpells, {
            isExpandedMatch: false
        }) : null;
        const $rowsExpanded = isExpandedList ? this._render_$getRows(ix, sortedSpells, {
            isExpandedMatch: true
        }) : null;

        const $wrpNoneAvailableInnatePrepared = isInnatePreparedList ? $(`<div class="ve-small ve-flex-v-center my-1 w-100 italic ve-muted">No spells at this level</div>`) : null;
        const $wrpNoneAvailableExpanded = isExpandedList ? $(`<div class="ve-small ve-flex-v-center my-1 w-100 italic ve-muted">No spells at this level</div>`) : null;

        const hkSpellsAvailable = ()=>{
            const isInnatePreparedAvailable = !!this._getFlatInnatePreparedSpellsInRange(ix).length;
            if ($wrpInnatePreparedHeaders)
                $wrpInnatePreparedHeaders.toggleVe(isInnatePreparedAvailable);
            if ($wrpNoneAvailableInnatePrepared)
                $wrpNoneAvailableInnatePrepared.toggleVe(!isInnatePreparedAvailable);

            const isExpandedAvailable = !!this._getFlatExpandedSpellsInRange(ix).length;
            if ($wrpExpandedHeaders)
                $wrpExpandedHeaders.toggleVe(isExpandedAvailable);
            if ($wrpNoneAvailableExpanded)
                $wrpNoneAvailableExpanded.toggleVe(!isExpandedAvailable);
        }
        ;
        this._addHookBase("spellLevelLow", hkSpellsAvailable);
        this._addHookBase("spellLevelHigh", hkSpellsAvailable);
        this._addHookBase("isAnyCantrips", hkSpellsAvailable);
        this._addHookBase("curLevel", hkSpellsAvailable);
        this._addHookBase("targetLevel", hkSpellsAvailable);
        this._addHookBase("ixSet", hkSpellsAvailable);
        hkSpellsAvailable();

        const $stgInnatePrepared = isInnatePreparedList ? $$`<div class="ve-flex-col">
			<div class="bold my-0">Innate/Prepared/Known Spells</div>
			${$wrpInnatePreparedHeaders}
			${$rowsInnatePrepared}
			${$wrpNoneAvailableInnatePrepared}
		</div>` : null;

        const $stgExpanded = isExpandedList ? $$`<div class="ve-flex-col">
			<div class="bold my-0">Expanded Spell List</div>
			${$wrpExpandedHeaders}
			${$rowsExpanded}
			${$wrpNoneAvailableExpanded}
		</div>` : null;

        const isChooseAbility = this._isChooseAbility(ix);

        const $wrpChooseAbility = isChooseAbility ? this._render_$getSelChooseAbility(ix) : null;

        const $stgAbility = isChooseAbility ? $$`<div class="split-v-center">
			<div class="bold my-0 no-shrink mr-2">Ability Score</div>
			${$wrpChooseAbility}
		</div>` : null;

        if ($btnSelect)
            $wrpOptionsButtons.append($btnSelect);

        const $stg = $$`<div class="ve-flex-col">
			${$stgInnatePrepared}
			${$stgExpanded}
			${$stgAbility}
		</div>`.appendTo($wrpOptions);

        if (this._additionalSpellsFlat.length !== 1) {
            const hkIsActive = ()=>{
                $btnSelect.toggleClass("active", this._state.ixSet === ix);
                $stg.toggleVe(this._state.ixSet === ix);
            }
            ;
            this._addHookBase("ixSet", hkIsActive);
            hkIsActive();

            const hkResetActive = (prop,value,prevValue)=>{
                const prevBlock = this._additionalSpellsFlat[prevValue];
                const nxtState = Object.values(prevBlock.spells).mergeMap(it=>({
                    [it.key]: null
                }));
                this._proxyAssignSimple("state", nxtState);
            }
            ;
            this._addHookBase("ixSet", hkResetActive);
        }
    }

    _getProps_chooseFrom({groupUid}) {
        return {
            propBase: `chooseFrom_${groupUid}`,
        };
    }

    _render_$getRows(ix, spells, {isExpandedMatch}) {
        if (!spells.length)
            return null;

        const byLevel = {};
        spells.forEach(flat=>{
            if (flat.isExpanded !== isExpandedMatch)
                return;

            const level = flat.requiredCasterLevel || flat.requiredLevel;
            (byLevel[level] = byLevel[level] || []).push(flat);
        }
        );

        const getFlatVars = flat=>({
            requiredLevel: flat.requiredLevel,
            requiredCasterLevel: flat.requiredCasterLevel,
            isRequiredCasterLevel: flat.requiredCasterLevel != null,
            isRequiredLevel: flat.requiredLevel != null,
            isExpanded: flat.isExpanded,
        });

        return Object.entries(byLevel).sort(([kA],[kB])=>SortUtil.ascSort(Number(kA), Number(kB))).map(([,flats])=>{
            const {requiredLevel, requiredCasterLevel, isRequiredCasterLevel, isRequiredLevel, isExpanded: isAnyExpanded, } = getFlatVars(flats[0]);

            const metasRenderedFlats = [];

            const chooseFromGroups = {};
            flats = flats.filter(flat=>{
                if (!flat.chooseFromGroup)
                    return true;

                chooseFromGroups[flat.chooseFromGroup] = chooseFromGroups[flat.chooseFromGroup] || {
                    from: [],
                    count: flat.chooseFromCount ?? 1,
                    ...getFlatVars(flat),
                };
                chooseFromGroups[flat.chooseFromGroup].from.push(flat);

                return false;
            }
            );

            const [flatsBasic,flatsFilter] = flats.segregate(it=>it.filterExpression == null);
            flatsBasic.sort((a,b)=>SortUtil.ascSortLower(a.uid, b.uid));
            flatsFilter.sort((a,b)=>SortUtil.ascSortLower(a.filterExpression, b.filterExpression));

            const $colSpells = $$`<div class="col-9 ve-flex-v-center ve-flex-wrap"></div>`;

            flatsBasic.forEach(flat=>{
                const $pt = $(`<div class="ve-flex-v-center"></div>`).fastSetHtml(Renderer.get().render(`{@spell ${flat.uid.toSpellCase()}}`)).appendTo($colSpells);
                const $sep = $(`<div class="mr-1">,</div>`).appendTo($colSpells);

                metasRenderedFlats.push({
                    flat,
                    $pt,
                    $sep,
                    ...getFlatVars(flat),
                });
            }
            );

            const [flatsFilterChoose,flatsFilterAll] = flatsFilter.segregate(it=>it.type !== "all");

            flatsFilterChoose.forEach(flat=>{
                const $dispSpell = $(`<div class="ve-flex-v-center"></div>`);
                const hkChosenSpell = ()=>{
                    $dispSpell.html(this._state[flat.key] != null && this._state.ixSet === ix ? `<div>${Renderer.get().render(`{@spell ${this._state[flat.key].toLowerCase()}}`)}</div>` : `<div class="italic ve-muted">(select a spell)</div>`, );
                }
                ;
                this._addHookBase(flat.key, hkChosenSpell);
                if (this._additionalSpellsFlat.length !== 1) {
                    this._addHookBase("ixSet", hkChosenSpell);
                }
                hkChosenSpell();

                const $btnFilter = $(`<button class="btn btn-default btn-xxs mx-1" title="Choose a Spell"><span class="fas fa-fw fa-search"></span></button>`).click(async()=>{
                    const selecteds = await this._modalFilterSpells.pGetUserSelection({
                        filterExpression: flat.filterExpression
                    });
                    if (selecteds == null || !selecteds.length)
                        return;

                    const selected = selecteds[0];

                    this._state[flat.key] = DataUtil.proxy.getUid("spell", {
                        name: selected.name,
                        source: selected.values.sourceJson
                    });
                    this._state.pulseChoose = !this._state.pulseChoose;
                }
                );

                if (this._additionalSpellsFlat.length !== 1) {
                    const hkDisableBtnFilter = ()=>$btnFilter.prop("disabled", this._state.ixSet !== ix);
                    this._addHookBase("ixSet", hkDisableBtnFilter);
                    hkDisableBtnFilter();
                }

                const $pt = $$`<div class="ve-flex-v-center">${$btnFilter}${$dispSpell}</div>`.appendTo($colSpells);
                const $sep = $(`<div class="mr-1">,</div>`).appendTo($colSpells);

                metasRenderedFlats.push({
                    flat,
                    $pt,
                    $sep,
                    ...getFlatVars(flat),
                });
            }
            );

            flatsFilterAll.forEach(flat=>{
                const ptFilter = this._modalFilterSpells.getRenderedFilterExpression({
                    filterExpression: flat.filterExpression
                });
                const $pt = $$`<div class="ve-flex-v-center"><i class="mr-2 ve-muted">Spells matching:</i> ${ptFilter ? `${ptFilter} ` : ""}</div>`.appendTo($colSpells);
                const $sep = $(`<div class="mr-1">,</div>`).appendTo($colSpells);

                metasRenderedFlats.push({
                    flat,
                    $pt,
                    $sep,
                    ...getFlatVars(flat),
                });
            }
            );

            Object.entries(chooseFromGroups).forEach(([groupUid,group])=>{
                const {propBase} = this._getProps_chooseFrom({
                    groupUid
                });

                const meta = ComponentUiUtil.getMetaWrpMultipleChoice(this, propBase, {
                    values: group.from.map(it=>it.uid),
                    fnDisplay: v=>Renderer.get().render(`{@spell ${v}}`),
                    count: group.count,
                }, );

                const hkPulse = ()=>this._state.pulseChoose = !this._state.pulseChoose;
                this._addHookBase(meta.propPulse, hkPulse);

                if (this._additionalSpellsFlat.length !== 1) {
                    const hkDisableUi = ()=>{
                        meta.rowMetas.forEach(({$cb})=>$cb.prop("disabled", this._state.ixSet !== ix));
                    }
                    ;
                    this._addHookBase("ixSet", hkDisableUi);
                    hkDisableUi();
                }

                const $ptsInline = meta.rowMetas.map(({$cb, displayValue})=>{
                    return $$`<div class="ve-flex-v-center mr-2 no-wrap">${displayValue}${$cb.addClass("ml-1")}</div>`;
                }
                );

                const $pt = $$`<div class="ve-flex-v-center ve-flex-wrap"><i class="mr-1 ve-muted no-wrap">Choose ${group.count === 1 ? "" : `${group.count} `}from:</i>${$ptsInline}</div>`.appendTo($colSpells);
                const $sep = $(`<div class="mr-1">,</div>`).appendTo($colSpells);

                metasRenderedFlats.push({
                    flat: null,
                    $pt,
                    $sep,
                    ...group,
                });
            }
            );

            const $row = $$`<div class="py-1 ve-flex-v-center stripe-even">
					<div class="col-3 ve-text-center">${Parser.getOrdinalForm(requiredCasterLevel || requiredLevel) || `<i class="ve-muted">Current</i>`}</div>
					${$colSpells}
				</div>`;

            const doShowInitialPts = ()=>{
                metasRenderedFlats.forEach(({$pt, $sep},i)=>{
                    $pt.showVe();
                    $sep.toggleVe(i !== metasRenderedFlats.length - 1);
                }
                );
            }
            ;

            const doShowExpandedPts = ()=>{
                let isExpandedVisible;
                let isAllVisible;
                if (isRequiredCasterLevel) {
                    isExpandedVisible = this._isRequiredCasterLevelInRangeUpper(requiredCasterLevel);
                    isAllVisible = this._isRequiredCasterLevelInRange(requiredCasterLevel);
                } else if (isRequiredLevel) {
                    isExpandedVisible = this._isRequiredLevelInRangeUpper(requiredCasterLevel);
                    isAllVisible = this._isRequiredLevelInRange(requiredCasterLevel);
                } else
                    throw new Error(`No need to use this method!`);

                if (isAllVisible || !isExpandedVisible)
                    return doShowInitialPts();

                metasRenderedFlats.forEach((meta,i)=>{
                    meta.$pt.toggleVe(meta.isExpanded);
                    meta.$sep.toggleVe(i !== metasRenderedFlats.length - 1);
                }
                );

                let isFoundFirst = false;
                for (let i = metasRenderedFlats.length - 1; i >= 0; --i) {
                    const meta = metasRenderedFlats[i];

                    meta.$sep.hideVe();
                    if (!meta.isExpanded)
                        continue;

                    if (isFoundFirst) {
                        meta.$sep.showVe();
                        break;
                    }

                    isFoundFirst = true;
                }
            }
            ;

            if (isRequiredCasterLevel) {
                const hkLevel = ()=>{
                    const isVisible = isAnyExpanded ? this._isRequiredCasterLevelInRangeUpper(requiredCasterLevel) : this._isRequiredCasterLevelInRange(requiredCasterLevel);
                    $row.toggleVe(isVisible);
                    if (!isVisible || !isAnyExpanded)
                        return doShowInitialPts();
                    doShowExpandedPts();
                }
                ;
                this._addHookBase("spellLevelLow", hkLevel);
                this._addHookBase("spellLevelHigh", hkLevel);
                this._addHookBase("isAnyCantrips", hkLevel);
                hkLevel();
            } else if (isRequiredLevel) {
                const hkLevel = ()=>{
                    const isVisible = isAnyExpanded ? this._isRequiredLevelInRangeUpper(requiredLevel) : this._isRequiredLevelInRange(requiredLevel);
                    $row.toggleVe(isVisible);
                    if (!isVisible && !isAnyExpanded)
                        return doShowInitialPts();
                    doShowExpandedPts();
                }
                ;
                this._addHookBase("curLevel", hkLevel);
                this._addHookBase("targetLevel", hkLevel);
                hkLevel();
            } else {
                $row.showVe();
                doShowInitialPts();
            }

            return $row;
        }
        );
    }

    _render_$getSelChooseAbility(ix) {
        return ComponentUiUtil.$getSelEnum(this, "ability", {
            values: this._additionalSpells[ix].ability.choose,
            fnDisplay: abv=>Parser.attAbvToFull(abv),
            isAllowNull: true,
        }, );
    }

    _isRequiredLevelInRange(requiredLevel) {
        return this._isRequiredLevelInRangeLower(requiredLevel) && this._isRequiredLevelInRangeUpper(requiredLevel);
    }

    _isRequiredLevelInRangeLower(requiredLevel) {
        return requiredLevel > (this._state.curLevel ?? Number.MAX_SAFE_INTEGER);
    }

    _isRequiredLevelInRangeUpper(requiredLevel) {
        return requiredLevel <= (this._state.targetLevel ?? Number.MIN_SAFE_INTEGER);
    }

    _isRequiredCasterLevelInRange(requiredCasterLevel) {
        if (requiredCasterLevel === 0)
            return this._state.isAnyCantrips;

        return this._isRequiredCasterLevelInRangeLower(requiredCasterLevel) && this._isRequiredCasterLevelInRangeUpper(requiredCasterLevel);
    }

    _isRequiredCasterLevelInRangeLower(requiredCasterLevel) {
        if (requiredCasterLevel === 0)
            return this._state.isAnyCantrips;

        return requiredCasterLevel >= (this._state.spellLevelLow ?? Number.MAX_SAFE_INTEGER);
    }

    _isRequiredCasterLevelInRangeUpper(requiredCasterLevel) {
        if (requiredCasterLevel === 0)
            return this._state.isAnyCantrips;

        return requiredCasterLevel <= (this._state.spellLevelHigh == null ? Number.MIN_SAFE_INTEGER : this._state.spellLevelHigh);
    }

    _getFlatSpellsInRange(ixSet=null, {isExpandedMatch=null}={}) {
        if (ixSet == null)
            ixSet = this._state.ixSet;

        return Object.values((this._additionalSpellsFlat[ixSet] || {
            spells: []
        }).spells).filter(flat=>{
            if (isExpandedMatch != null) {
                if (flat.isExpanded !== isExpandedMatch)
                    return false;
            }

            if (flat.isExpanded) {
                if (flat.requiredCasterLevel != null)
                    return this._isRequiredCasterLevelInRangeUpper(flat.requiredCasterLevel);
                else if (flat.requiredLevel != null)
                    return this._isRequiredLevelInRangeUpper(flat.requiredLevel);
                return true;
            }

            if (flat.requiredCasterLevel != null)
                return this._isRequiredCasterLevelInRange(flat.requiredCasterLevel);
            else if (flat.requiredLevel != null)
                return this._isRequiredLevelInRange(flat.requiredLevel);
            return true;
        }
        );
    }

    _getFlatInnatePreparedSpellsInRange(ixSet) {
        return this._getFlatSpellsInRange(ixSet, {
            isExpandedMatch: false
        });
    }
    _getFlatExpandedSpellsInRange(ixSet) {
        return this._getFlatSpellsInRange(ixSet, {
            isExpandedMatch: true
        });
    }

    _isAnyInnatePrepared(ixSet) {
        return this._isAnyInnatePreparedExpanded(ixSet, {
            isExpandedMatch: false
        });
    }
    _isAnyExpanded(ixSet) {
        return this._isAnyInnatePreparedExpanded(ixSet, {
            isExpandedMatch: true
        });
    }

    _isAnyInnatePreparedExpanded(ixSet, {isExpandedMatch}) {
        if (ixSet == null)
            ixSet = this._state.ixSet;

        return Object.values((this._additionalSpellsFlat[ixSet] || {
            spells: []
        }).spells).some(flat=>flat.isExpanded === isExpandedMatch);
    }

    _isChooseAbility(ixSet) {
        if (ixSet == null)
            ixSet = this._state.ixSet;
        return (this._additionalSpells[ixSet]?.ability?.choose?.length ?? 0) > 1;
    }

    isNoChoice({curLevel, targetLevel, isStandalone}={}) {
        return this.constructor.isNoChoice(this._additionalSpells, {
            additionalSpellsFlat: this._additionalSpellsFlat,
            curLevel,
            targetLevel,
            isStandalone
        });
    }

    getFormData() {
        let flatSpellsInRange = this._getFlatSpellsInRange().map(it=>it.getCopy());

        const chooseFromGroups = {};
        flatSpellsInRange.forEach(flat=>{
            if (!flat.chooseFromGroup)
                return;

            chooseFromGroups[flat.chooseFromGroup] = chooseFromGroups[flat.chooseFromGroup] || {
                from: [],
                selectedValues: [],
                isAcceptable: false,
                count: flat.chooseFromCount ?? 1,
            };
            chooseFromGroups[flat.chooseFromGroup].from.push(flat);
        }
        );

        Object.entries(chooseFromGroups).forEach(([groupUid,groupMeta])=>{
            const {propBase} = this._getProps_chooseFrom({
                groupUid
            });

            groupMeta.isAcceptable = this._state[ComponentUiUtil.getMetaWrpMultipleChoice_getPropIsAcceptable(propBase)];

            groupMeta.selectedValues = ComponentUiUtil.getMetaWrpMultipleChoice_getSelectedValues(this, propBase, {
                values: groupMeta.from.map(it=>it.uid)
            });
        }
        );

        let cntNotChosen = 0;
        flatSpellsInRange = flatSpellsInRange.filter(flat=>{
            if (flat.type === "all")
                return true;
            if (flat.filterExpression != null) {
                const choiceMade = this._state[flat.key];
                if (!choiceMade) {
                    cntNotChosen++;
                    return false;
                }

                flat.filterExpression = null;
                flat.uid = this._state[flat.key];
                return true;
            }

            if (flat.chooseFromGroup != null) {
                return chooseFromGroups[flat.chooseFromGroup].selectedValues.includes(flat.uid);
            }

            return true;
        }
        );

        flatSpellsInRange = flatSpellsInRange.flatMap(flat=>{
            if (flat.type !== "all")
                return flat;

            if (flat.filterExpression != null) {
                const filterExpression = flat.filterExpression;
                flat.filterExpression = null;
                return this._modalFilterSpells.getItemsMatchingFilterExpression({
                    filterExpression
                }).map((li,i)=>flat.getCopy({
                    type: "spell",
                    key: `${flat.key}__${i}`,
                    uid: DataUtil.proxy.getUid("spell", {
                        name: li.name,
                        source: li.values.sourceJson
                    }),
                }, ));
            }

            if (flat.chooseFromGroup != null) {
                if (chooseFromGroups[flat.chooseFromGroup].selectedValues.includes(flat.uid))
                    return flat;
            }

            return null;
        }
        ).filter(Boolean);

        let abilityAbv;
        if (this._isChooseAbility(this._state.ixSet)) {
            abilityAbv = this._state.ability;
            if (abilityAbv == null)
                cntNotChosen++;
        } else
            abilityAbv = (this._additionalSpellsFlat[this._state.ixSet] || {
                meta: {}
            }).meta.ability;

        return {
            isFormComplete: cntNotChosen === 0 && Object.values(chooseFromGroups).every(it=>it.isAcceptable),
            data: flatSpellsInRange.map(it=>it.toObject()),
            abilityAbv,
        };
    }

    pGetFormData() {
        return this.getFormData();
    }

    _getDefaultState() {
        return {
            ixSet: 0,

            curLevel: null,
            targetLevel: null,
            spellLevelLow: null,
            spellLevelHigh: null,
            isAnyCantrips: false,

            spellsAlwaysPrepared: [],
            spellsExpanded: [],
            spellsAlwaysKnown: [],

            ability: null,

            pulseChoose: false,
        };
    }
}

export {Charactermancer_Class_HpIncreaseModeSelect, Charactermancer_Class_ProficiencyImportModeSelect, Charactermancer_Class_StartingProficiencies, Charactermancer_AdditionalSpellsSelect}