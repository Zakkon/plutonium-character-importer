export class Charactermancer_Util {
	static getCurrentLevel (actor) {
		return actor.items.filter(it => it.type === "class").map(it => Number(it.system.levels || 0)).sum();
	}

	static getBaseAbilityScores (actor) { return this._getAbilityScores(actor, true); }

	static getCurrentAbilityScores (actor) { return this._getAbilityScores(actor, false); }

	static _getAbilityScores (actor, isBase) {
		const actorData = isBase ? (actor.system._source || actor.system) : actor.system;
		const out = {
			str: Number(MiscUtil.get(actorData, "abilities", "str", "value") || 0),
			dex: Number(MiscUtil.get(actorData, "abilities", "dex", "value") || 0),
			con: Number(MiscUtil.get(actorData, "abilities", "con", "value") || 0),
			int: Number(MiscUtil.get(actorData, "abilities", "int", "value") || 0),
			wis: Number(MiscUtil.get(actorData, "abilities", "wis", "value") || 0),
			cha: Number(MiscUtil.get(actorData, "abilities", "cha", "value") || 0),
		};
		Object.entries(out)
			.forEach(([abv, val]) => {
				if (isNaN(val)) out[abv] = 0;
			});
		return out;
	}

	static getBaseHp (actor) {
		return this._getHp(actor, true);
	}

	static _getHp (actor, isBase) {
		const actorData = isBase ? (actor.system._source || actor.system) : actor.system;
		return {
			value: (actorData?.attributes?.hp?.value || 0),
						max: actorData?.attributes?.hp?.max,
		};
	}

	static getAttackAbilityScore (itemAttack, abilityScores, mode) {
		if (!itemAttack || !abilityScores) return null;
		switch (mode) {
			case "melee": {
				const isFinesse = !!MiscUtil.get(itemAttack, "system", "properties", "fin");
				if (!isFinesse) return abilityScores.str;
				return abilityScores.str > abilityScores.dex ? abilityScores.str : abilityScores.dex;
			}
			case "ranged": {
				const isThrown = !!MiscUtil.get(itemAttack, "system", "properties", "thr");
				if (!isThrown) return abilityScores.dex;
				return abilityScores.str > abilityScores.dex ? abilityScores.str : abilityScores.dex;
			}
			default: throw new Error(`Unhandled mode "${mode}"`);
		}
	}

		static getFilteredFeatures (allFeatures, pageFilter, filterValues) {
		return allFeatures.filter(f => {
			const source = f.source
				|| (f.classFeature
					? DataUtil.class.unpackUidClassFeature(f.classFeature).source : f.subclassFeature ? DataUtil.class.unpackUidSubclassFeature(f.subclassFeature) : null);

						if (!pageFilter.sourceFilter.toDisplay(filterValues, source)) return false;

									f.loadeds = f.loadeds.filter(meta => {
				return Charactermancer_Class_Util.isClassEntryFilterMatch(meta.entity, pageFilter, filterValues);
			});

			return f.loadeds.length;
		});
	}

	//TIP: Charactermancer_Util.getImportableFeatures
	static getImportableFeatures (allFeatures) {
		return allFeatures.filter(f => {
			if (f.gainSubclassFeature && !f.gainSubclassFeatureHasContent) return false;

			const lowName = f.name.toLowerCase();
			switch (lowName) {
				case "proficiency versatility": return false;
				default: return true;
			}
		});
	}

	static doApplyFilterToFeatureEntries_bySource (allFeatures, pageFilter, filterValues) {
				allFeatures.forEach(f => {
			f.loadeds.forEach(loaded => {
				switch (loaded.type) {
					case "classFeature":
					case "subclassFeature": {
						if (loaded.entity.entries) loaded.entity.entries = Charactermancer_Class_Util.getFilteredEntries_bySource(loaded.entity.entries, pageFilter, filterValues);
						break;
					}
				}
			});
		});

		return allFeatures;
	}

	//TIP: getFeaturesGroupedByOptionsSet
	static getFeaturesGroupedByOptionsSet (allFeatures) {
		return allFeatures.map(topLevelFeature => {
			const optionsSets = [];

			let optionsStack = [];
			let lastOptionsSetId = null;
			topLevelFeature.loadeds.forEach(l => {
				const optionsSetId = MiscUtil.get(l, "optionsMeta", "setId") || null;
				if (lastOptionsSetId !== optionsSetId) {
					if (optionsStack.length) optionsSets.push(optionsStack);
					optionsStack = [l];
					lastOptionsSetId = optionsSetId;
				} else {
					optionsStack.push(l);
				}
			});
			if (optionsStack.length) optionsSets.push(optionsStack);

			return {topLevelFeature, optionsSets};
		});
	}
	
		static getFilterSearchMeta ({comp, prop, propVersion = null, data, modalFilter, title}) {
		const {$wrp: $sel, fnUpdateHidden: fnUpdateSelHidden, unhook} = ComponentUiUtil.$getSelSearchable(
			comp,
			prop,
			{
				values: data.map((_, i) => i),
				isAllowNull: true,
				fnDisplay: ix => {
					const it = data[ix];

					if (!it) { 						console.warn(...LGT, `Could not find ${prop} with index ${ix} (${data.length} ${prop} entries were available)`);
						return "(Unknown)";
					}

					return `${it.name} ${it.source !== Parser.SRC_PHB ? `[${Parser.sourceJsonToAbv(it.source)}]` : ""}`;
				},
				fnGetAdditionalStyleClasses: ix => {
					if (ix == null) return null;
					const it = data[ix];
					if (!it) return; 					return it._versionBase_isVersion ? ["italic"] : null;
				},
				asMeta: true,
			},
		);

		const doApplyFilterToSel = () => {
			const f = modalFilter.pageFilter.filterBox.getValues();
			const isHiddenPer = data.map(it => !modalFilter.pageFilter.toDisplay(f, it));
			fnUpdateSelHidden(isHiddenPer, false);
		};

		modalFilter.pageFilter.filterBox.on(
			FilterBox.EVNT_VALCHANGE,
			doApplyFilterToSel,
		);
		doApplyFilterToSel();

		const $btnFilter = $(`<button class="btn btn-xs btn-5et br-0 pr-2" title="Filter for a ${title}"><span class="glyphicon glyphicon-filter"></span> Filter</button>`)
			.click(async () => {
				const selecteds = await modalFilter.pGetUserSelection();
				if (selecteds == null || !selecteds.length) return;

				const selected = selecteds[0];
				const ix = data.findIndex(it => it.name === selected.name && it.source === selected.values.sourceJson);
				if (!~ix) throw new Error(`Could not find selected entity: ${JSON.stringify(selected)}`); 				comp._state[prop] = ix;
			});

		const {$stg: $stgSelVersion = null, unhook: unhookVersion = null} = this._getFilterSearchMeta_getVersionMeta({comp, prop, propVersion, data}) || {};

		return {
			$sel,
			$btnFilter,
			$stgSelVersion,
			unhook: () => {
				unhook();
				modalFilter.pageFilter.filterBox.off(FilterBox.EVNT_VALCHANGE, doApplyFilterToSel);
				if (unhookVersion) unhookVersion();
			},
		};
	}

	static _getFilterSearchMeta_getVersionMeta ({comp, prop, propVersion, data}) {
		if (!propVersion) return;

		const {$sel, setValues, unhook} = ComponentUiUtil.$getSelEnum(
			comp,
			propVersion,
			{
				values: [],
				isAllowNull: true,
				displayNullAs: "(Base version)",
				fnDisplay: it => `${it.name}${it.source !== data[comp._state[prop]]?.source ? ` (${Parser.sourceJsonToAbv(it.source)})` : ""}`,
				asMeta: true,
				isSetIndexes: true,
			},
		);

		const hkProp = () => {
			const ent = data[comp._state[prop]];
			if (ent == null) {
				setValues([]);
				return $stg.hideVe();
			}

			const versions = DataUtil.generic.getVersions(ent);
			setValues(versions);
			$stg.toggleVe(versions.length);
		};
		comp._addHookBase(prop, hkProp);

		const $stg = $$`<div class="ve-flex-col mt-2">
			<label class="split-v-center btn-group w-100">
				<div class="mr-2">Version:</div>
				${$sel}
			</label>
		</div>`;

		hkProp();

		return {
			$stg,
			unhook: () => {
				unhook();
				comp._removeHookBase(prop, hkProp);
			},
		};
	}
}
Charactermancer_Util.STR_WARN_SOURCE_SELECTION = `Did you change your source selection since using the Charactermancer initially?`;
export default Charactermancer_Util;