class ActorCharactermancer extends Application {
    static ["_DATA_PROPS_EXPECTED"] = ['class', "subclass", 'classFeature', "subclassFeature", "race", "background", "item", "spell", "feat", 'optionalfeature'];
    constructor(_0x53cbd6) {
      _0x53cbd6 = _0x53cbd6 || {};
      super({
        'title': "Charactermancer (Actor \"" + _0x53cbd6.actor.name + "\")",
        'template': SharedConsts.MODULE_LOCATION + '/template/Charactermancer.hbs',
        'width': Util.getMaxWindowWidth(1200),
        'height': Util.getMaxWindowHeight(),
        'resizable': true
      });
      const _0x284eac = UtilDataSource.getMergedData([_0x53cbd6.data]);
      ActorCharactermancer._DATA_PROPS_EXPECTED.forEach(_0x1f8368 => _0x284eac[_0x1f8368] = _0x284eac[_0x1f8368] || []);
      this._comp = new ActorCharactermancer.Component({
        'actor': _0x53cbd6.actor,
        'data': _0x284eac,
        'cbPostSave': this.close.bind(this)
      });
    }
    ["activateListeners"](_0x20ab30) {
      this._comp.render(_0x20ab30);
    }
  }
  class ActorCharactermancerBaseComponent extends BaseComponent {
    get ['state']() {
      return this._state;
    }
    ['addHookBase'](_0x2e65a3, _0xfdf4bf) {
      this._addHookBase(_0x2e65a3, _0xfdf4bf);
    }
    ["proxyAssignSimple"](_0x1b7a05, _0x15052f, _0x40bc58) {
      return this._proxyAssignSimple(_0x1b7a05, _0x15052f, _0x40bc58);
    }
    static ["class_getProps"](_0x3166f1) {
      return {
        'propPrefixClass': 'class_' + _0x3166f1 + '_',
        'propIxClass': "class_" + _0x3166f1 + "_ixClass",
        'propPrefixSubclass': "class_" + _0x3166f1 + "_subclass_",
        'propIxSubclass': "class_" + _0x3166f1 + "_subclass_ixSubclass",
        'propCntAsi': "class_" + _0x3166f1 + "_cntAsi",
        'propCurLevel': "class_" + _0x3166f1 + "_curLevel",
        'propTargetLevel': "class_" + _0x3166f1 + "_targetLevel"
      };
    }
    ["_shared_renderEntity_stgOtherProficiencies"]({
      $stg: _0xc3c609,
      ent: _0x18d378,
      propComp: _0x4903c6,
      propProficiencies: _0x5a1d45,
      title: _0x275afd,
      CompClass: _0x479d8d,
      propPathActorExistingProficiencies: _0x429830,
      fnGetExistingFvtt: _0x42b271,
      fnGetMappedProficiencies: _0x18857c
    }) {
      _0xc3c609.empty();
      this._parent.featureSourceTracker_.unregister(this[_0x4903c6]);
      if (_0x18d378 && _0x18d378[_0x5a1d45]) {
        _0xc3c609.showVe().append("<hr class=\"hr-2\"><div class=\"bold mb-2\">" + _0x275afd + "</div>");
        const _0x5ddf7b = _0x42b271 ? _0x42b271(this._actor) : {
          [_0x5a1d45]: MiscUtil.get(this._actor, '_source', ..._0x429830)
        };
        this[_0x4903c6] = new _0x479d8d({
          'featureSourceTracker': this._parent.featureSourceTracker_,
          'existing': _0x479d8d.getExisting(_0x5ddf7b),
          'existingFvtt': _0x5ddf7b,
          'available': _0x18857c ? _0x18857c(_0x18d378[_0x5a1d45], _0x5a1d45) : _0x18d378[_0x5a1d45]
        });
        this[_0x4903c6].render(_0xc3c609);
      } else {
        _0xc3c609.hideVe();
        this[_0x4903c6] = null;
      }
    }
    ["_shared_renderEntity_stgDiDrDvCi"]({
      $stg: _0x53e426,
      ent: _0x137c88,
      propComp: _0x528966,
      CompClass: _0x49593b,
      title: _0xf6f71d,
      propRaceData: _0xcf0cc,
      propTraits: _0x141da8
    }) {
      _0x53e426.empty();
      if (_0x137c88 && _0x137c88[_0xcf0cc]) {
        _0x53e426.showVe().append("<hr class=\"hr-2\"><div class=\"bold mb-2\">" + _0xf6f71d + "</div>");
        const _0x44ab2c = {
          [_0xcf0cc]: MiscUtil.get(this._actor, "_source", "system", "traits", _0x141da8)
        };
        this[_0x528966] = new _0x49593b({
          'existing': _0x49593b.getExisting(_0x44ab2c),
          'existingFvtt': _0x44ab2c,
          'available': _0x137c88[_0xcf0cc]
        });
        this[_0x528966].render(_0x53e426);
      } else {
        _0x53e426.hideVe();
        this[_0x528966] = null;
      }
    }
  }
  ActorCharactermancer.Component = class extends ActorCharactermancerBaseComponent {
    constructor(_0xe0fc3) {
      _0xe0fc3 = _0xe0fc3 || {};
      super();
      TabUiUtil.decorate(this);
      this._actor = _0xe0fc3.actor;
      this._data = _0xe0fc3.data;
      this._cbPostSave = _0xe0fc3.cbPostSave;
      this._featureSourceTracker = new Charactermancer_FeatureSourceTracker();
      this._isLevelUp = Charactermancer_Util.getCurrentLevel(this._actor) > 0x0;
      this._tabs = null;
      const {
        tabClass: _0x4fac2d,
        tabRace: _0x2d980d,
        tabAbilities: _0x6aa85c,
        tabBackground: _0x4a1a31,
        tabEquipment: _0x10186c,
        tabShop: _0xe8a405,
        tabSpells: _0x3e6f63,
        tabFeats: _0x44dc09
      } = this._cons_initTabs();
      this._tabEquipment = _0x10186c;
      this._tabShop = _0xe8a405;
      this._compClass = new ActorCharactermancerClass({
        'actor': _0xe0fc3.actor,
        'data': _0xe0fc3.data,
        'parent': this,
        'tabClass': _0x4fac2d
      });
      this._compRace = new ActorCharactermancerRace({
        'actor': _0xe0fc3.actor,
        'data': _0xe0fc3.data,
        'parent': this,
        'tabRace': _0x2d980d
      });
      this._compAbility = new ActorCharactermancerAbility({
        'actor': _0xe0fc3.actor,
        'data': _0xe0fc3.data,
        'parent': this,
        'tabAbilities': _0x6aa85c
      });
      this._compBackground = new ActorCharactermancerBackground({
        'actor': _0xe0fc3.actor,
        'data': _0xe0fc3.data,
        'parent': this,
        'tabBackground': _0x4a1a31
      });
      this._compEquipment = new ActorCharactermancerEquipment({
        'actor': _0xe0fc3.actor,
        'data': _0xe0fc3.data,
        'parent': this,
        'tabEquipment': _0x10186c,
        'tabShop': _0xe8a405
      });
      this._compSpell = new ActorCharactermancerSpell({
        'actor': _0xe0fc3.actor,
        'data': _0xe0fc3.data,
        'parent': this,
        'tabSpells': _0x3e6f63
      });
      this._compFeat = new ActorCharactermancerFeat({
        'actor': _0xe0fc3.actor,
        'data': _0xe0fc3.data,
        'parent': this,
        'tabFeats': _0x44dc09
      });
      this._conInitialWithModifiers = null;
      this._conFinalWithModifiers = null;
    }
    ['_cons_initTabs']() {
      if (this._isLevelUp) {
        this._tabs = this._renderTabs([new TabUiUtil.TabMeta({
          'name': "Class",
          'hasBorder': true
        }), new TabUiUtil.TabMeta({
          'name': "Abilities",
          'hasBorder': true
        }), new TabUiUtil.TabMeta({
          'name': "Spells",
          'hasBorder': true
        }), new TabUiUtil.TabMeta({
          'name': "Feats",
          'hasBorder': true
        })], {
          'propProxy': "state"
        });
      } else {
        this._tabs = this._renderTabs([new TabUiUtil.TabMeta({
          'name': 'Class',
          'hasBorder': true
        }), new TabUiUtil.TabMeta({
          'name': 'Race',
          'hasBorder': true
        }), new TabUiUtil.TabMeta({
          'name': "Abilities",
          'hasBorder': true
        }), new TabUiUtil.TabMeta({
          'name': 'Background',
          'hasBorder': true
        }), new TabUiUtil.TabMeta({
          'name': "Starting Equipment",
          'hasBorder': true
        }), new TabUiUtil.TabMeta({
          'name': "Equipment Shop",
          'hasBorder': true
        }), new TabUiUtil.TabMeta({
          'name': 'Spells',
          'hasBorder': true
        }), new TabUiUtil.TabMeta({
          'name': 'Feats',
          'hasBorder': true
        })], {
          'propProxy': "state"
        });
      }
      if (this._isLevelUp) {
        const [_0x55b2e5, _0x695695, _0x113297, _0x536370] = this._tabs;
        return {
          'tabClass': _0x55b2e5,
          'tabAbilities': _0x695695,
          'tabSpells': _0x113297,
          'tabFeats': _0x536370
        };
      } else {
        const [_0x943c93, _0x2d1f6d, _0x2b7853, _0x38bce3, _0x344032, _0x5b4111, _0xb5da6b, _0x4376b2] = this._tabs;
        return {
          'tabClass': _0x943c93,
          'tabRace': _0x2d1f6d,
          'tabAbilities': _0x2b7853,
          'tabBackground': _0x38bce3,
          'tabEquipment': _0x344032,
          'tabShop': _0x5b4111,
          'tabSpells': _0xb5da6b,
          'tabFeats': _0x4376b2
        };
      }
    }
    get ["featureSourceTracker_"]() {
      return this._featureSourceTracker;
    }
    get ["compClass"]() {
      return this._compClass;
    }
    get ['compRace']() {
      return this._compRace;
    }
    get ["compBackground"]() {
      return this._compBackground;
    }
    get ["compEquipment"]() {
      return this._compEquipment;
    }
    get ["compSpell"]() {
      return this._compSpell;
    }
    get ['compFeat']() {
      return this._compFeat;
    }
    get ["compAbility"]() {
      return this._compAbility;
    }
    set ["activeTab_"](_0xd59f0b) {
      this._setActiveTab({
        'propProxy': "state",
        'tab': _0xd59f0b
      });
    }
    ["render"](_0x5e2e1f) {
      this._render_loading(_0x5e2e1f);
      this._pLoad().then(() => this._pRender(_0x5e2e1f))["catch"](_0x5757db => {
        ui.notifications.error("Failed to load! " + VeCt.STR_SEE_CONSOLE);
        throw _0x5757db;
      });
    }
    ['_render_loading'](_0x12279f) {
      _0x12279f.append("<div class=\"ve-flex-vh-center w-100 h-100\"><i>Loading...</i></div>");
    }
    async ["_pLoad"]() {
      await this._compRace.pLoad();
      await this._compBackground.pLoad();
      await this._compClass.pLoad();
      await this._compSpell.pLoad();
      await this._compFeat.pLoad();
    }
    async ["_pRender"](_0x41716a) {
      _0x41716a.empty();
      const _0x17a262 = $("<button class=\"btn btn-5et btn-default w-100p\">Previous</button>").click(() => this._doSwitchToPrevTab({
        'propProxy': "state"
      }));
      const _0x44f16f = $("<button class=\"btn btn-5et btn-default w-100p\">Next</button>").click(() => {
        this._doSwitchToNextTab({
          'propProxy': "state"
        });
        if (this._getActiveTab({
          'propProxy': "state"
        }) === this._tabShop && this._compEquipment.isStandardStartingEquipmentActive_() || this._getActiveTab({
          'propProxy': "state"
        }) === this._tabEquipment && !this._compEquipment.isStandardStartingEquipmentActive_()) {
          this._doSwitchToNextTab({
            'propProxy': "state"
          });
        }
      });
      const _0x5401ff = () => {
        _0x17a262.prop('disabled', !this._hasPrevTab({
          'propProxy': 'state'
        }));
        _0x44f16f.prop("disabled", !this._hasNextTab({
          'propProxy': "state"
        }));
      };
      this._addHookActiveTab(_0x5401ff, {
        'propProxy': "state"
      });
      _0x5401ff();
      const _0x3847dd = $("<button class=\"btn btn-5et btn-primary\">Finalize</button>").click(() => {
        _0x3847dd.prop('disabled', true);
        try {
          this._pHandleSaveClick();
        } finally {
          _0x3847dd.prop("disabled", false);
        }
      });
      $$`<div class="w-100 no-shrink ui-tab__wrp-tab-heads--border">
              ${this._tabs.map(_0x11d042 => _0x11d042.$btnTab.addClass("btn-sm"))}
          </div>`.appendTo(_0x41716a);
      this._tabs.forEach(_0x30beeb => _0x30beeb.$wrpTab.appendTo(_0x41716a));
      _0x41716a.append("<hr class=\"hr-1 w-100\">");
      $$`<div class="w-100 no-shrink ve-flex-h-right pr-3">
              <div class="ve-flex-v-center btn-group">${_0x17a262}${_0x44f16f}</div>
              <div class="vr-2"></div>
              ${_0x3847dd}
          </div>`.appendTo(_0x41716a);
      this._pRender_renderTabClass();
      this._pRender_renderTabRace();
      this._pRender_renderTabAbilities();
      this._pRender_renderTabBackground();
      await this._render_pRenderTabEquipmentStarting();
      await this._render_pRenderTabEquipmentShop();
      await this._pRender_pRenderTabSpells();
      this._pRender_renderTabFeats();
    }
    ['_pRender_renderTabClass']() {
      this._compClass.render();
    }
    ["_pRender_renderTabRace"]() {
      this._compRace.render();
    }
    ["_pRender_renderTabAbilities"]() {
      this._compAbility.render();
    }
    ["_pRender_renderTabBackground"]() {
      this._compBackground.render();
    }
    async ["_render_pRenderTabEquipmentStarting"]() {
      await this._compEquipment.pRenderStarting();
    }
    async ["_render_pRenderTabEquipmentShop"]() {
      await this._compEquipment.pRenderShop();
    }
    async ["_pRender_pRenderTabSpells"]() {
      await this._compSpell.pRender();
    }
    ["_pRender_renderTabFeats"]() {
      this._compFeat.render();
    }
    async ["_pHandleSaveClick"]() {
      const _0x30760f = await InputUiUtil.pGetUserBoolean({
        'title': "Are You Sure?"
      });
      if (!_0x30760f) {
        return;
      }
      await new AppTaskRunner({
        'tasks': [this._pHandleSaveClick_getClosure({
          'pFn': this._pHandleSaveClick_abilities.bind(this),
          'msgStart': "Setting ability scores...",
          'msgComplete': "Set ability scores."
        }), this._isLevelUp ? null : this._pHandleSaveClick_getClosure({
          'pFn': this._pHandleSaveClick_race.bind(this),
          'msgStart': "Importing race...",
          'msgComplete': "Imported race."
        }), this._pHandleSaveClick_getClosure({
          'pFn': this._pHandleSaveClick_class.bind(this),
          'msgStart': "Importing classes and subclasses...",
          'msgComplete': "Imported classes and subclasses."
        }), this._isLevelUp ? null : this._pHandleSaveClick_getClosure({
          'pFn': this._pHandleSaveClick_background.bind(this),
          'msgStart': "Importing background...",
          'msgComplete': "Imported background."
        }), this._pHandleSaveClick_getClosure({
          'pFn': this._pHandleSaveClick_feats.bind(this),
          'msgStart': "Importing feats...",
          'msgComplete': "Imported feats."
        }), this._pHandleSaveClick_getClosure({
          'pFn': this._pHandleSaveClick_spells.bind(this),
          'msgStart': "Importing spells...",
          'msgComplete': "Imported spells."
        }), this._isLevelUp ? null : this._pHandleSaveClick_getClosure({
          'pFn': this._pHandleSaveClick_equipment.bind(this),
          'msgStart': "Importing equipment...",
          'msgComplete': "Imported equipment."
        }), this._pHandleSaveClick_getClosure({
          'pFn': this._pHandleSaveClick_postSave.bind(this),
          'msgStart': "Running post-build step...",
          'msgComplete': "Build complete."
        })].filter(Boolean),
        'titleInitial': 'Building...',
        'titleComplete': "Build Complete",
        'isStopOnError': true
      }).pRun();
    }
    ['_pHandleSaveClick_getClosure']({
      pFn: _0x37a5a6,
      msgStart: _0x43bdd3,
      msgComplete: _0x51fbca
    }) {
      return new TaskClosure({
        'fnGetPromise': async ({
          taskRunner: _0x17eb9d
        }) => {
          const _0x3d4899 = _0x17eb9d.addLogLine(_0x43bdd3);
          _0x17eb9d.pushDepth();
          try {
            await _0x37a5a6({
              'taskRunner': _0x17eb9d
            });
            this._pHandleSaveClick_getClosure_handleSuccess({
              'taskRunner': _0x17eb9d,
              'taskRunnerLineMeta': _0x3d4899,
              'msgComplete': _0x51fbca
            });
          } catch (_0x296228) {
            this._pHandleSaveClick_getClosure_handleFailure({
              'taskRunner': _0x17eb9d,
              'taskRunnerLineMeta': _0x3d4899
            });
            throw _0x296228;
          }
        }
      });
    }
    ["_pHandleSaveClick_getClosure_handleSuccess"]({
      taskRunner: _0x200a6d,
      taskRunnerLineMeta: _0x398832,
      msgComplete: _0x4485c4
    }) {
      _0x200a6d.popDepth();
      _0x200a6d.addLogLine(_0x4485c4, {
        'linkedLogLineMeta': _0x398832
      });
    }
    ["_pHandleSaveClick_getClosure_handleFailure"]({
      taskRunner: _0x2b6159,
      taskRunnerLineMeta: _0x3076cb
    }) {
      _0x2b6159.popDepth();
      _0x2b6159.addLogLine("Build failed! " + VeCt.STR_SEE_CONSOLE, {
        'isError': true,
        'linkedLogLineMeta': _0x3076cb
      });
    }
    async ["_pHandleSaveClick_abilities"]() {
      if (this._isLevelUp) {
        const {
          con: _0x279772
        } = Charactermancer_Util.getCurrentAbilityScores(this._actor);
        this._conInitialWithModifiers = _0x279772;
      }
      const _0x36b4cd = this._compAbility.compStatgen.getTotals();
      if (_0x36b4cd.mode !== StatGenUi.MODE_NONE) {
        const _0x3ed58a = {
          'system': {
            'abilities': {
              ...Parser.ABIL_ABVS.mergeMap(_0x4f1b56 => ({
                [_0x4f1b56]: {
                  'value': _0x36b4cd?.['totals']?.[_0x36b4cd.mode]?.[_0x4f1b56] || 0x0
                }
              }))
            }
          }
        };
        await UtilDocuments.pUpdateDocument(this._actor, _0x3ed58a, {
          'isRender': false
        });
      }
      if (this._isLevelUp) {
        const {
          con: _0x105a05
        } = Charactermancer_Util.getCurrentAbilityScores(this._actor);
        this._conFinalWithModifiers = _0x105a05;
      }
    }
    async ["_pHandleSaveClick_race"]({
      taskRunner: _0x3004e0
    }) {
      const _0x491a73 = this._compRace.getRace_();
      if (_0x491a73) {
        const _0x35d062 = new ImportListRace({
          'actor': this._actor
        });
        await _0x35d062.pInit();
        const _0x28cdd4 = MiscUtil.copy(_0x491a73);
        delete _0x28cdd4.ability;
        delete _0x28cdd4.feats;
        delete _0x28cdd4._versions;
        delete _0x28cdd4.additionalSpells;
        if (this._compRace.compRaceSize) {
          _0x28cdd4.size = [(await this._compRace.compRaceSize.pGetFormData().data) || Parser.SZ_VARIES];
        } else {
          delete _0x28cdd4.size;
        }
        await this._pHandleSaveClick_pDoApplySkills([this._compRace.compRaceSkillProficiencies, this._compRace.compRaceSkillToolLanguageProficiencies], _0x28cdd4, ["skillProficiencies"]);
        await this._pHandleSaveClick_pDoApplyTools([this._compRace.compRaceToolProficiencies, this._compRace.compRaceSkillToolLanguageProficiencies], _0x28cdd4, ["toolProficiencies"]);
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compRace.compRaceLanguageProficiencies, this._compRace.compRaceSkillToolLanguageProficiencies],
          'toObj': _0x28cdd4,
          'path': ['languageProficiencies']
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compRace.compRaceExpertise],
          'toObj': _0x28cdd4,
          'path': ["expertise"]
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compRace.compRaceArmorProficiencies],
          'toObj': _0x28cdd4,
          'path': ["armorProficiencies"]
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compRace.compRaceWeaponProficiencies],
          'toObj': _0x28cdd4,
          'path': ["weaponProficiencies"]
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compRace.compRaceDamageImmunity],
          'toObj': _0x28cdd4,
          'path': ["immune"],
          'isLegacy': true
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compRace.compRaceDamageResistance],
          'toObj': _0x28cdd4,
          'path': ["resist"],
          'isLegacy': true
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compRace.compRaceDamageVulnerability],
          'toObj': _0x28cdd4,
          'path': ['vulnerable'],
          'isLegacy': true
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compRace.compRaceConditionImmunity],
          'toObj': _0x28cdd4,
          'path': ["conditionImmune"],
          'isLegacy': true
        });
        await _0x35d062.pImportEntry(_0x28cdd4, {
          'isCharactermancer': true,
          'taskRunner': _0x3004e0
        });
      }
    }
    async ["_pHandleSaveClick_class"]({
      taskRunner: _0xe36415
    }) {
      const _0xaf846e = [];
      for (let _0x342ec9 = 0x0; _0x342ec9 < this._compClass.state.class_ixMax + 0x1; ++_0x342ec9) {
        const {
          propIxClass: _0x5c1be6,
          propIxSubclass: _0x559ff6
        } = ActorCharactermancerBaseComponent.class_getProps(_0x342ec9);
        const _0x480164 = this._compClass.getClass_({
          'propIxClass': _0x5c1be6
        });
        if (!_0x480164) {
          continue;
        }
        const _0x13049d = this._compClass.getSubclass_({
          'cls': _0x480164,
          'propIxSubclass': _0x559ff6
        });
        _0xaf846e.push({
          'ix': _0x342ec9,
          'cls': _0x480164,
          'sc': _0x13049d,
          'isPrimary': this._compClass.state.class_ixPrimaryClass === _0x342ec9
        });
      }
      if (_0xaf846e.length) {
        _0xaf846e.sort((_0x49bcf2, _0x2531e5) => SortUtil.ascSort(Number(_0x2531e5.isPrimary), Number(_0x49bcf2.isPrimary)) || SortUtil.ascSort(_0x49bcf2.cls.name, _0x2531e5.cls.name));
        const _0x53be9f = new ImportListClass({
          'actor': this._actor
        });
        await _0x53be9f.pInit();
        const _0x37641b = this._compClass.modalFilterClasses.pageFilter.filterBox.getValues();
        for (let _0x57eef4 = 0x0; _0x57eef4 < _0xaf846e.length; ++_0x57eef4) {
          const {
            ix: _0x3b89aa,
            cls: _0xc6a512,
            sc: _0x471f46,
            isPrimary: _0x4f8858
          } = _0xaf846e[_0x57eef4];
          const _0x49f53d = MiscUtil.copy(_0xc6a512);
          const _0x32e5ba = _0x471f46 ? MiscUtil.copy(_0x471f46) : null;
          if (_0x32e5ba) {
            delete _0x32e5ba.additionalSpells;
          }
          if (_0x32e5ba) {
            _0x49f53d.subclasses = [_0x32e5ba];
          } else {
            _0x49f53d.subclasses = [];
          }
          _0x49f53d._foundrySelectedLevelIndices = await this._compClass.compsClassLevelSelect[_0x3b89aa].pGetFormData().data;
          if (!_0x49f53d._foundrySelectedLevelIndices.length) {
            continue;
          }
          _0x49f53d._foundryStartingProficiencyMode = _0x4f8858 ? Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY : Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS;
          if (this._compClass.compsClassHpIncreaseMode[_0x3b89aa]) {
            const {
              mode: _0x37ccf8,
              customFormula: _0x30c459
            } = (await this._compClass.compsClassHpIncreaseMode[_0x3b89aa].pGetFormData()).data;
            _0x49f53d._foundryHpIncreaseMode = _0x37ccf8;
            _0x49f53d._foundryHpIncreaseCustomFormula = _0x30c459;
          }
          _0x49f53d._foundryAllFeatures = [];
          for (const _0x1862c4 of this._compClass.compsClassFeatureOptionsSelect[_0x3b89aa]) {
            const _0x195903 = await _0x1862c4.pGetFormData();
            const _0x237cd5 = {
              'system': {}
            };
            await Charactermancer_FeatureOptionsSelect.pDoApplyResourcesFormDataToActor({
              'actor': this._actor,
              'formData': _0x195903
            });
            await Charactermancer_FeatureOptionsSelect.pDoApplySensesFormDataToActor({
              'actor': this._actor,
              'actorUpdate': _0x237cd5,
              'formData': _0x195903,
              'configGroup': 'importClassSubclassFeature'
            });
            if (_0x195903?.["data"]?.['features']?.["length"]) {
              _0x49f53d._foundryAllFeatures.push(..._0x195903.data.features);
            }
            await Charactermancer_FeatureOptionsSelect.pDoApplyProficiencyFormDataToActorUpdate(this._actor, _0x237cd5, _0x195903);
            if (Object.keys(_0x237cd5.system).length || Object.keys(_0x237cd5.prototypeToken || {}).length) {
              await UtilDocuments.pUpdateDocument(this._actor, _0x237cd5, {
                'isRender': false
              });
            }
          }
          delete _0x49f53d.additionalSpells;
          _0x49f53d._foundryAllFeatures.forEach(_0x20b3a5 => delete _0x20b3a5?.["entity"]?.["additionalSpells"]);
          if (this._isLevelUp) {
            _0x49f53d._foundryConInitial = this._conInitialWithModifiers;
            _0x49f53d._foundryConFinal = this._conFinalWithModifiers;
          }
          _0x49f53d._foundryIsSkipImportPreparedSpells = true;
          _0x49f53d._foundryIsSkipImportCantrips = true;
          await this._pHandleSaveClick_pDoApplySkills([this._compClass.compsClassSkillProficiencies[_0x3b89aa]], _0x49f53d, [...(_0x4f8858 ? ["startingProficiencies", "skills"] : ["multiclassing", 'proficienciesGained', 'skills'])]);
          await this._pHandleSaveClick_pDoApplyTools([this._compClass.compsClassToolProficiencies[_0x3b89aa]], _0x49f53d, ...(_0x4f8858 ? [["startingProficiencies", "toolProficiencies"], ["startingProficiencies", "tools"]] : [["multiclassing", "proficienciesGained", "toolProficiencies"], ["multiclassing", "proficienciesGained", "tools"]]));
          delete _0x49f53d.startingEquipment;
          const _0x2c5e9a = this._compSpell.compsSpellSpellSlotLevelSelect[_0x3b89aa];
          await _0x53be9f.pImportClass(_0x49f53d, {
            'filterValues': _0x37641b,
            'isCharactermancer': true,
            'spellSlotLevelSelection': _0x2c5e9a?.["isAnyChoice"]() ? _0x2c5e9a.getFlagsChoicesState() : null,
            'taskRunner': _0xe36415
          });
          for (const _0x1cafa7 of this._compClass.compsClassFeatureOptionsSelect[_0x3b89aa]) {
            const _0x454e55 = await _0x1cafa7.pGetFormData();
            await Charactermancer_FeatureOptionsSelect.pDoApplyAdditionalSpellsFormDataToActor({
              'actor': this._actor,
              'formData': _0x454e55,
              'abilityAbv': _0x471f46?.["spellcastingAbility"] || _0xc6a512.spellcastingAbility,
              'taskRunner': _0xe36415
            });
          }
        }
      }
    }
    async ["_pHandleSaveClick_background"]({
      taskRunner: _0x45d633
    }) {
      const _0x51382f = this._compBackground.getFeatureCustomizedBackground_({
        'isAllowStub': false
      });
      if (_0x51382f) {
        const _0x176ad7 = await this._compBackground.compBackgroundFeatures.pGetFormData();
        const _0x2d3201 = _0x176ad7?.["data"]?.['background'] ?? MiscUtil.copy(_0x51382f);
        delete _0x2d3201.ability;
        delete _0x2d3201.skillProficiencies;
        delete _0x2d3201.toolProficiencies;
        delete _0x2d3201.languageProficiencies;
        delete _0x2d3201.skillToolLanguageProficiencies;
        const _0x501c53 = new ImportListBackground({
          'actor': this._actor
        });
        await _0x501c53.pInit();
        if (this._compBackground.compBackgroundFeatures) {
          _0x2d3201._foundryFormDataFeatures = _0x176ad7;
        } else {
          _0x2d3201._foundryFormDataFeatures = {
            'isFormComplete': true
          };
        }
        _0x2d3201._foundryIsSkipCustomizeSkills = true;
        _0x2d3201._foundryIsSkipCustomizeLanguagesTools = true;
        await this._pHandleSaveClick_pDoApplySkills([this._compBackground.compBackgroundSkillProficiencies], _0x2d3201, ["skillProficiencies"]);
        await this._pHandleSaveClick_pDoApplyTools([this._compBackground.isCustomizeLanguagesTools ? this._compBackground.compBackgroundLanguageToolProficiencies : this._compBackground.compBackgroundToolProficiencies], _0x2d3201, ["toolProficiencies"]);
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compBackground.isCustomizeLanguagesTools ? this._compBackground.compBackgroundLanguageToolProficiencies : this._compBackground.compBackgroundLanguageProficiencies],
          'toObj': _0x2d3201,
          'path': ["languageProficiencies"]
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compBackground.compBackgroundExpertise],
          'toObj': _0x2d3201,
          'path': ["expertise"]
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compBackground.compBackgroundArmorProficiencies],
          'toObj': _0x2d3201,
          'path': ['armorProficiencies']
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compBackground.compBackgroundWeaponProficiencies],
          'toObj': _0x2d3201,
          'path': ["weaponProficiencies"]
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compBackground.compBackgroundDamageImmunity],
          'toObj': _0x2d3201,
          'path': ['immune'],
          'isLegacy': true
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compBackground.compBackgroundDamageResistance],
          'toObj': _0x2d3201,
          'path': ["resist"],
          'isLegacy': true
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compBackground.compBackgroundDamageVulnerability],
          'toObj': _0x2d3201,
          'path': ["vulnerable"],
          'isLegacy': true
        });
        await this._pHandleSaveClick_pDoApplyTraitLike({
          'comps': [this._compBackground.compBackgroundConditionImmunity],
          'toObj': _0x2d3201,
          'path': ["conditionImmune"],
          'isLegacy': true
        });
        if (this._compBackground.compBackgroundCharacteristics) {
          _0x2d3201._foundryFormDataCharacteristics = await this._compBackground.compBackgroundCharacteristics.pGetFormData();
        } else {
          _0x2d3201._foundryIsSkipImportCharacteristics = true;
        }
        delete _0x2d3201.startingEquipment;
        delete _0x2d3201.additionalSpells;
        delete _0x2d3201.feats;
        await _0x501c53.pImportEntry(_0x2d3201, {
          'isCharactermancer': true,
          'taskRunner': _0x45d633
        });
      }
    }
    async ['_pHandleSaveClick_feats']({
      taskRunner: _0x6237f
    }) {
      const _0x1325b3 = await this._compFeat.feat_pGetAdditionalFeatFormData();
      if (_0x1325b3?.['isAnyData']) {
        const _0x553ee0 = this._compAbility.compStatgen.getFormDataAsi();
        const _0x109c14 = new ImportListFeat({
          'actor': this._actor
        });
        await _0x109c14.pInit();
        for (const _0x208f3f of ["ability", "race", "background", "custom"]) {
          if (!_0x1325b3?.[_0x208f3f]) {
            continue;
          }
          for (const {
            feat: _0x8a13c2,
            formDatasFeatureOptionsSelect: _0x21a946,
            ix: _0x348026
          } of _0x1325b3[_0x208f3f].data) {
            if (!_0x8a13c2) {
              continue;
            }
            if (_0x553ee0.feats[_0x208f3f]?.[_0x348026]) {
              const _0x3fc484 = _0x553ee0.feats[_0x208f3f]?.[_0x348026];
              _0x8a13c2.ability = [_0x3fc484.abilityChosen].filter(Boolean);
              if (!_0x8a13c2.ability.length) {
                delete _0x8a13c2.ability;
              }
              _0x8a13c2._foundryChosenAbilityScoreIncrease = _0x8a13c2?.["ability"]?.[0x0] || {};
              delete _0x8a13c2._fullEntries;
              Renderer.feat.initFullEntries(_0x8a13c2);
            }
            for (const _0x49efd4 of _0x21a946) {
              const _0x3741bf = {
                'system': {}
              };
              await Charactermancer_FeatureOptionsSelect.pDoApplyResourcesFormDataToActor({
                'actor': this._actor,
                'formData': _0x49efd4
              });
              await Charactermancer_FeatureOptionsSelect.pDoApplySensesFormDataToActor({
                'actor': this._actor,
                'actorUpdate': _0x3741bf,
                'formData': _0x49efd4,
                'configGroup': "importFeat"
              });
              await Charactermancer_FeatureOptionsSelect.pDoApplyProficiencyFormDataToActorUpdate(this._actor, _0x3741bf, _0x49efd4);
              if (Object.keys(_0x3741bf.system).length) {
                await UtilDocuments.pUpdateDocument(this._actor, _0x3741bf, {
                  'isRender': false
                });
              }
              let _0x4970bd = null;
              if (_0x553ee0.feats[_0x208f3f]?.[_0x348026]) {
                const _0x144e53 = _0x553ee0.feats[_0x208f3f]?.[_0x348026];
                _0x4970bd = Object.keys(_0x144e53.abilityChosen || {})[0x0];
              }
              await Charactermancer_FeatureOptionsSelect.pDoApplyAdditionalSpellsFormDataToActor({
                'actor': this._actor,
                'formData': _0x49efd4,
                'parentAbilityAbv': _0x4970bd,
                'taskRunner': _0x6237f
              });
              if (_0x49efd4?.["data"]?.['features']?.['length']) {
                for (let _0x5b631b = 0x0; _0x5b631b < _0x49efd4.data.features.length; ++_0x5b631b) {
                  const _0x48229c = _0x49efd4.data.features[_0x5b631b];
                  const _0x4ccf3b = _0x48229c.type === "feat" && _0x5b631b === 0x0 ? MiscUtil.copy(_0x8a13c2) : MiscUtil.copy(_0x48229c.entity);
                  delete _0x4ccf3b.ability;
                  delete _0x4ccf3b.skillProficiencies;
                  delete _0x4ccf3b.languageProficiencies;
                  delete _0x4ccf3b.toolProficiencies;
                  delete _0x4ccf3b.weaponProficiencies;
                  delete _0x4ccf3b.armorProficiencies;
                  delete _0x4ccf3b.savingThrowProficiencies;
                  delete _0x4ccf3b.immune;
                  delete _0x4ccf3b.resist;
                  delete _0x4ccf3b.vulnerable;
                  delete _0x4ccf3b.conditionImmune;
                  delete _0x4ccf3b.expertise;
                  delete _0x4ccf3b.resources;
                  delete _0x4ccf3b.senses;
                  delete _0x4ccf3b.additionalSpells;
                  await _0x109c14.pImportEntry(_0x4ccf3b, {
                    'isCharactermancer': true,
                    'isLeaf': true,
                    'taskRunner': _0x6237f
                  });
                }
              }
            }
          }
        }
      }
    }
    async ["_pHandleSaveClick_spells"]({
      taskRunner: _0x4e09cd
    }) {
      const _0x24c0ab = this._compSpell.filterValuesSpellsCache || this._compSpell.filterBoxSpells.getValues();
      for (let _0x3a6073 = 0x0; _0x3a6073 < this._compClass.state.class_ixMax + 0x1; ++_0x3a6073) {
        const {
          propIxClass: _0x26d743,
          propIxSubclass: _0x153d86
        } = ActorCharactermancerBaseComponent.class_getProps(_0x3a6073);
        const _0x3443e1 = this._compClass.getClass_({
          'propIxClass': _0x26d743
        });
        if (!_0x3443e1) {
          continue;
        }
        const _0x5925fa = this._compClass.getSubclass_({
          'cls': _0x3443e1,
          'propIxSubclass': _0x153d86
        });
        if (this._compSpell.compsSpellSpells[_0x3a6073]) {
          const _0x42a102 = await this._compSpell.compsSpellSpells[_0x3a6073].pGetFormData(_0x24c0ab);
          await Charactermancer_Spell.pApplyFormDataToActor(this._actor, _0x42a102, {
            'cls': _0x3443e1,
            'sc': _0x5925fa,
            'taskRunner': _0x4e09cd
          });
        }
        if (this._compSpell.compsSpellAdditionalSpellClass[_0x3a6073]) {
          const _0x33b945 = await this._compSpell.compsSpellAdditionalSpellClass[_0x3a6073].pGetFormData();
          await this._pHandleSaveClick_pDoImportAdditionalSpells({
            'formData': _0x33b945,
            'abilityAbv': _0x3443e1.spellcastingAbility,
            'taskRunner': _0x4e09cd
          });
        }
        if (!_0x5925fa) {
          continue;
        }
        if (this._compSpell.compsSpellAdditionalSpellSubclass[_0x3a6073]) {
          const _0x5e251f = await this._compSpell.compsSpellAdditionalSpellSubclass[_0x3a6073].pGetFormData();
          await this._pHandleSaveClick_pDoImportAdditionalSpells({
            'formData': _0x5e251f,
            'abilityAbv': _0x5925fa?.["spellcastingAbility"] || _0x3443e1.spellcastingAbility,
            'taskRunner': _0x4e09cd
          });
        }
      }
      const _0x10a426 = [this._compSpell.compSpellAdditionalSpellRace, this._compSpell.compSpellAdditionalSpellBackground];
      for (const _0x4e2585 of _0x10a426) {
        if (!_0x4e2585) {
          continue;
        }
        const _0x5c7410 = await _0x4e2585.pGetFormData();
        await this._pHandleSaveClick_pDoImportAdditionalSpells({
          'formData': _0x5c7410,
          'taskRunner': _0x4e09cd
        });
      }
    }
    async ['_pHandleSaveClick_equipment']({
      taskRunner: _0x5020d6
    }) {
      const _0x330005 = await this._compEquipment.compEquipmentCurrency.pGetFormData();
      const _0xf5075c = await this._compEquipment.compEquipmentStartingDefault.pGetFormData();
      const _0x975cc8 = await this._compEquipment.compEquipmentShopGold.pGetFormData();
      if (_0x330005?.["data"]?.['currency']) {
        await Charactermancer_StartingEquipment.pUpdateActorCurrency(this._actor, _0x330005);
      }
      if (_0xf5075c?.["data"]?.["equipmentItemEntries"]) {
        await Charactermancer_StartingEquipment.pImportEquipmentItemEntries(this._actor, _0xf5075c, {
          'taskRunner': _0x5020d6
        });
      }
      if (_0x975cc8?.["data"]?.["equipmentItemEntries"]) {
        await Charactermancer_StartingEquipment.pImportEquipmentItemEntries(this._actor, _0x975cc8, {
          'taskRunner': _0x5020d6
        });
      }
    }
    async ["_pHandleSaveClick_pDoApplySkills"](_0x121e8d, _0x5332d7, ..._0x249346) {
      return this._pHandleSaveClick_pDoApplySkillsTools({
        'comps': _0x121e8d,
        'toObj': _0x5332d7,
        'paths': _0x249346,
        'validProficiencies': new Set(Object.keys(Parser.SKILL_TO_ATB_ABV)),
        'propFormData': "skillProficiencies"
      });
    }
    async ["_pHandleSaveClick_pDoApplyTools"](_0x39afbe, _0x2c1893, ..._0x4c761c) {
      return this._pHandleSaveClick_pDoApplySkillsTools({
        'comps': _0x39afbe,
        'toObj': _0x2c1893,
        'paths': _0x4c761c,
        'validProficiencies': new Set(Object.values(UtilActors.TOOL_ABV_TO_FULL)),
        'propFormData': 'toolProficiencies'
      });
    }
    async ["_pHandleSaveClick_pDoApplySkillsTools"]({
      comps: _0x3a0bd2,
      toObj: _0x544991,
      paths: _0x46965e,
      validProficiencies: _0x435304,
      propFormData: _0x47789b
    }) {
      for (const _0x21e450 of _0x46965e) MiscUtil["delete"](_0x544991, ..._0x21e450);
      _0x3a0bd2 = (_0x3a0bd2 || []).filter(Boolean);
      if (!_0x3a0bd2.length) {
        return;
      }
      const _0x41829a = {};
      for (const _0x3e7a9c of _0x3a0bd2) {
        const _0x63b23c = await _0x3e7a9c.pGetFormData();
        Object.keys(_0x63b23c.data?.[_0x47789b] || {}).filter(_0x410001 => _0x435304.has(_0x410001)).forEach(_0x455f81 => _0x41829a[_0x455f81] = true);
      }
      if (!Object.keys(_0x41829a).length) {
        return;
      }
      const _0x17bea3 = _0x46965e[0x0];
      MiscUtil.set(_0x544991, ..._0x17bea3, [_0x41829a]);
    }
    async ["_pHandleSaveClick_pDoApplyTraitLike"]({
      comps: _0xce9c70,
      toObj: _0x30c852,
      path: _0x1be6b3,
      isLegacy = false
    }) {
      const _0x373e78 = _0x1be6b3.last();
      MiscUtil["delete"](_0x30c852, ..._0x1be6b3);
      _0xce9c70 = _0xce9c70.filter(Boolean);
      if (!_0xce9c70.length) {
        return;
      }
      const _0xed83d7 = (await _0xce9c70.pSerialAwaitMap(_0x598789 => _0x598789.pGetFormData())).map(_0x900cdd => _0x900cdd?.["data"]?.[_0x373e78]).filter(Boolean);
      if (isLegacy) {
        const _0xc32d64 = _0xed83d7.map(_0x18e10d => Object.keys(_0x18e10d));
        if (_0xc32d64.length) {
          MiscUtil.set(_0x30c852, ..._0x1be6b3, _0xc32d64);
        }
      } else {
        const _0x3fa9c1 = _0xed83d7.mergeMap(_0x4a23ae => _0x4a23ae);
        if (Object.keys(_0x3fa9c1).length) {
          MiscUtil.set(_0x30c852, ..._0x1be6b3, [_0x3fa9c1]);
        }
      }
    }
    async ["_pHandleSaveClick_pDoImportAdditionalSpells"]({
      formData: _0x177043,
      abilityAbv: _0x3d2027,
      parentAbilityAbv: _0x5bcb7c,
      taskRunner: _0x270d15
    }) {
      await Charactermancer_AdditionalSpellsSelect.pApplyFormDataToActor(this._actor, _0x177043, {
        'abilityAbv': _0x3d2027,
        'parentAbilityAbv': _0x5bcb7c,
        'taskRunner': _0x270d15
      });
    }
    async ["_pHandleSaveClick_postSave"]() {
      if (this._cbPostSave) {
        this._cbPostSave();
      }
    }
  };
  class ActorCharactermancerClass extends ActorCharactermancerBaseComponent {
    constructor(_0x13f182) {
      _0x13f182 = _0x13f182 || {};
      super();
      this._actor = _0x13f182.actor;
      this._data = _0x13f182.data;
      this._parent = _0x13f182.parent;
      this._tabClass = _0x13f182.tabClass;
      this._modalFilterClasses = new ModalFilterClassesFvtt({
        'namespace': "ActorCharactermancer.classes",
        'allData': this._data["class"]
      });
      this._metaHksClassStgSubclass = [];
      this._compsClassStartingProficiencies = [];
      this._compsClassHpIncreaseMode = [];
      this._compsClassHpInfo = [];
      this._compsClassLevelSelect = [];
      this._compsClassFeatureOptionsSelect = [];
      this._compsClassSkillProficiencies = [];
      this._compsClassToolProficiencies = [];
      this._metaHksClassStgSkills = [];
      this._metaHksClassStgTools = [];
      this._metaHksClassStgStartingProficiencies = [];
      this._$wrpsClassTable = [];
      this._existingClassMetas = [];
    }
    get ["modalFilterClasses"]() {
      return this._modalFilterClasses;
    }
    get ["compsClassStartingProficiencies"]() {
      return this._compsClassStartingProficiencies;
    }
    get ["compsClassHpIncreaseMode"]() {
      return this._compsClassHpIncreaseMode;
    }
    get ["compsClassLevelSelect"]() {
      return this._compsClassLevelSelect;
    }
    get ["compsClassFeatureOptionsSelect"]() {
      return this._compsClassFeatureOptionsSelect;
    }
    get ["compsClassSkillProficiencies"]() {
      return this._compsClassSkillProficiencies;
    }
    get ["compsClassToolProficiencies"]() {
      return this._compsClassToolProficiencies;
    }
    get ['existingClassMetas']() {
      return this._existingClassMetas;
    }
    async ["pLoad"]() {
      await this._modalFilterClasses.pPreloadHidden();
      await this._pLoad_pDoHandleExistingClassItems();
    }
    async ['_pLoad_pDoHandleExistingClassItems']() {
      const _0x1c249f = this._actor.items.filter(_0x5de464 => _0x5de464.type === 'class');
      const _0x3dab8a = this._actor.items.filter(_0x248afa => _0x248afa.type === 'subclass');
      this._existingClassMetas = _0x1c249f.map(_0x122387 => {
        const _0x39760a = this._pLoad_getExistingClassIndex(_0x122387);
        const _0x56b925 = _0x3dab8a.find(_0x162fde => _0x162fde.system.classIdentifier === _0x122387.system.identifier);
        let _0xa0d172 = this._pLoad_getExistingSubclassIndex(_0x39760a, _0x56b925);
        const _0x5372b3 = this._actor.system?.["details"]?.['originalClass'] ? this._actor.system?.["details"]?.["originalClass"] === _0x122387.id : !!_0x122387.flags?.[SharedConsts.MODULE_ID]?.['isPrimaryClass'];
        const _0x55c437 = ~_0x39760a ? null : "Could not find class \"" + _0x122387.name + "\" (\"" + UtilDocumentSource.getDocumentSourceDisplayString(_0x122387) + "\") in loaded data. " + Charactermancer_Util.STR_WARN_SOURCE_SELECTION;
        if (_0x55c437) {
          ui.notifications.warn(_0x55c437);
          console.warn(...LGT, _0x55c437, "Strict source matching is: " + Config.get("import", "isStrictMatching") + '.');
        }
        const _0x530b46 = _0x56b925 == null || ~_0xa0d172 ? null : "Could not find subclass \"" + _0x56b925.name + "\" in loaded data. " + Charactermancer_Util.STR_WARN_SOURCE_SELECTION;
        if (_0x530b46) {
          ui.notifications.warn(_0x530b46);
          console.warn(...LGT, _0x530b46, "Strict source matching is: " + Config.get("import", "isStrictMatching") + '.');
        }
        return new ActorCharactermancerClass.ExistingClassMeta({
          'item': _0x122387,
          'ixClass': _0x39760a,
          'isUnknownClass': !~_0x39760a,
          'ixSubclass': _0xa0d172,
          'isUnknownSubclass': _0xa0d172 == null && !~_0xa0d172,
          'level': Number(_0x122387.system.levels || 0x0),
          'isPrimary': _0x5372b3,
          'spellSlotLevelSelection': _0x122387?.["flags"]?.[SharedConsts.MODULE_ID]?.['spellSlotLevelSelection']
        });
      });
      if (!this._existingClassMetas.length) {
        return;
      }
      this._state.class_ixMax = this._existingClassMetas.length - 0x1;
      for (let _0xfaa7c6 = 0x0; _0xfaa7c6 < this._existingClassMetas.length; ++_0xfaa7c6) {
        const _0x325547 = this._existingClassMetas[_0xfaa7c6];
        const {
          propIxClass: _0x57fec3,
          propIxSubclass: _0x4335dc
        } = ActorCharactermancerBaseComponent.class_getProps(_0xfaa7c6);
        await this._pDoProxySetBase(_0x57fec3, _0x325547.ixClass);
        await this._pDoProxySetBase(_0x4335dc, _0x325547.ixSubclass);
        if (_0x325547.isPrimary) {
          this._state.class_ixPrimaryClass = _0xfaa7c6;
        }
      }
      if (!this._existingClassMetas.some(_0x34ec7d => _0x34ec7d.isPrimary)) {
        this._state.class_ixPrimaryClass = 0x0;
      }
    }
    ['_pLoad_getExistingClassIndex'](_0x31ccce) {
      const _0x9c6a99 = _0x31ccce.flags?.[SharedConsts.MODULE_ID];
      if (_0x9c6a99?.["propDroppable"] === 'class' && _0x9c6a99?.["source"] && _0x9c6a99?.["hash"]) {
        const _0x4fb2d3 = this._data["class"].findIndex(_0xc280a8 => _0x9c6a99.source === _0xc280a8.source && _0x9c6a99.hash === UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](_0xc280a8));
        if (~_0x4fb2d3) {
          return _0x4fb2d3;
        }
      }
      const _0x22658f = (IntegrationBabele.getOriginalName(_0x31ccce) || '').toLowerCase().trim();
      const _0xf5d9aa = this._data['class'].findIndex(_0x5112df => {
        return _0x22658f === _0x5112df.name.toLowerCase().trim() && (!Config.get("import", "isStrictMatching") || (UtilDocumentSource.getDocumentSource(_0x31ccce).source || '').toLowerCase() === Parser.sourceJsonToAbv(_0x5112df.source).toLowerCase());
      });
      if (~_0xf5d9aa) {
        return _0xf5d9aa;
      }
      const _0x4d5c9d = /^(.*?)\(.*\)$/.exec(_0x22658f);
      if (!_0x4d5c9d) {
        return -0x1;
      }
      return this._data["class"].findIndex(_0x12f0b7 => {
        return _0x4d5c9d[0x1].trim() === _0x12f0b7.name.toLowerCase().trim() && (!Config.get("import", "isStrictMatching") || (UtilDocumentSource.getDocumentSource(_0x31ccce).source || '').toLowerCase() === Parser.sourceJsonToAbv(_0x12f0b7.source).toLowerCase());
      });
    }
    ["_pLoad_getExistingSubclassIndex"](_0x161fa4, _0x3e14d4) {
      if (!_0x3e14d4 || !~_0x161fa4) {
        return null;
      }
      const _0x10558f = this._data['class'][_0x161fa4];
      const _0x50af12 = _0x3e14d4.flags?.[SharedConsts.MODULE_ID];
      if (_0x50af12?.["propDroppable"] === "subclass" && _0x50af12?.["source"] && _0x50af12?.["hash"]) {
        const _0x37d579 = _0x10558f.subclasses.findIndex(_0x5067b7 => _0x50af12.source === _0x5067b7.source && _0x50af12.hash === UrlUtil.URL_TO_HASH_BUILDER.subclass(_0x5067b7));
        if (~_0x37d579) {
          return _0x37d579;
        }
      }
      return _0x10558f.subclasses.findIndex(_0x54c0e7 => (IntegrationBabele.getOriginalName(_0x3e14d4) || '').toLowerCase().trim() === _0x54c0e7.name.toLowerCase().trim() && (!Config.get("import", 'isStrictMatching') || (UtilDocumentSource.getDocumentSource(_0x3e14d4).source || '').toLowerCase() === Parser.sourceJsonToAbv(_0x54c0e7.source).toLowerCase()));
    }
    ['getExistingClassTotalLevels_']() {
      return this._existingClassMetas.filter(Boolean).map(_0x29ccbb => _0x29ccbb.level).sum();
    }
    ["_getExistingClassCount"]() {
      return this._existingClassMetas.filter(Boolean).length;
    }
    ["getClass_"]({
      ix: _0x55508b,
      propIxClass: _0x21ca68
    }) {
      if (_0x55508b == null && _0x21ca68 == null) {
        throw new Error("At least one argument must be provided!");
      }
      if (_0x21ca68 != null) {
        if (this._state[_0x21ca68] == null) {
          return null;
        }
        if (!~this._state[_0x21ca68]) {
          return DataConverterClass.getClassStub();
        }
        return this._data["class"][this._state[_0x21ca68]];
      }
      if (_0x55508b != null && ~_0x55508b) {
        return this._data['class'][_0x55508b];
      }
      return DataConverterClass.getClassStub();
    }
    ["getSubclass_"]({
      cls: _0x5c8967,
      propIxSubclass: _0x3ff653,
      ix: _0x325aa4
    }) {
      if (_0x325aa4 == null && _0x3ff653 == null) {
        throw new Error("At least one argument must be provided!");
      }
      if (!_0x5c8967) {
        return null;
      }
      if (_0x3ff653 != null) {
        if (this._state[_0x3ff653] == null) {
          return null;
        }
        if (!~this._state[_0x3ff653]) {
          return DataConverterClass.getSubclassStub({
            'cls': _0x5c8967
          });
        }
        if (!_0x5c8967.subclasses?.["length"]) {
          return DataConverterClass.getSubclassStub({
            'cls': _0x5c8967
          });
        }
        return _0x5c8967.subclasses[this._state[_0x3ff653]];
      }
      if (_0x325aa4 != null && ~_0x325aa4) {
        return _0x5c8967.subclasses[_0x325aa4];
      }
      return DataConverterClass.getSubclassStub({
        'cls': _0x5c8967
      });
    }
    ["_class_isClassSelectionDisabled"]({
      ix: _0x5bbf32
    }) {
      return !!this._existingClassMetas[_0x5bbf32];
    }
    ["_class_isSubclassSelectionDisabled"]({
      ix: _0x3ccf09
    }) {
      return this._existingClassMetas[_0x3ccf09] && (this._existingClassMetas[_0x3ccf09].ixSubclass != null || this._existingClassMetas[_0x3ccf09].isUnknownClass);
    }
    ["render"]() {
      const _0x18bf08 = this._tabClass?.["$wrpTab"];
      if (!_0x18bf08) {
        return;
      }
      const _0x3e5d60 = $$`<div class="ve-flex-col w-100 h-100 px-1 pt-1 overflow-y-auto ve-grow veapp__bg-foundry"></div>`;
      const _0x47c29f = $$`<div class="ve-flex-col w-100 h-100 px-1 overflow-y-auto ve-grow veapp__bg-foundry"></div>`;
      for (let _0x2673ed = 0x0; _0x2673ed < this._state.class_ixMax + 0x1; ++_0x2673ed) {
        this._class_renderClass(_0x3e5d60, _0x47c29f, _0x2673ed);
      }
      this._addHookBase("class_ixPrimaryClass", () => this._state.class_pulseChange = !this._state.class_pulseChange);
      const _0x26fcb4 = $("<button class=\"btn btn-5et btn-sm\">Add Another Class</button>").click(() => {
        this._class_renderClass(_0x3e5d60, _0x47c29f, ++this._state.class_ixMax);
      });
      $$`<div class="ve-flex w-100 h-100">
              <div class="ve-flex-col w-100">
                  ${_0x3e5d60}
                  <div class="mt-2">${_0x26fcb4}</div>
              </div>
              <div class="vr-1"></div>
              ${_0x47c29f}
          </div>`.appendTo(_0x18bf08);
    }
    static ["_class_getLocks"](_0x4a6f5e) {
      return {
        'lockChangeClass': 'class_' + _0x4a6f5e + '_pHkChangeClass',
        'lockChangeSubclass': "class_" + _0x4a6f5e + '_pHkChangeSubclass',
        'lockRenderFeatureOptionsSelects': 'class_' + _0x4a6f5e + "_renderFeatureOptionsSelects"
      };
    }
    ["_class_renderClass"](_0x2222f0, _0x3ae137, _0x4ebd4a) {
      const {
        propPrefixClass: _0x9db42f,
        propIxClass: _0x3873dd,
        propPrefixSubclass: _0x1fdd4b,
        propIxSubclass: _0x485b27,
        propCntAsi: _0x117b6f,
        propCurLevel: _0x3243ea,
        propTargetLevel: _0x3fb00f
      } = ActorCharactermancerBaseComponent.class_getProps(_0x4ebd4a);
      const _0x27d6ca = FilterBox.EVNT_VALCHANGE + ".class_" + _0x4ebd4a + "_classLevels";
      const _0x28f013 = FilterBox.EVNT_VALCHANGE + ".class_" + _0x4ebd4a + "_subclass";
      const {
        lockChangeClass: _0xf5ce07,
        lockChangeSubclass: _0x549fe4,
        lockRenderFeatureOptionsSelects: _0x3217e0
      } = this.constructor._class_getLocks(_0x4ebd4a);
      this._addHookBase(_0x3873dd, () => this._state.class_pulseChange = !this._state.class_pulseChange);
      const {
        $wrp: _0xb2bb46,
        $iptDisplay: _0x1b93cb,
        $iptSearch: _0x2020ae,
        fnUpdateHidden: _0x41f2bf
      } = ComponentUiUtil.$getSelSearchable(this, _0x3873dd, {
        'values': this._data["class"].map((_0x2b7aa2, _0x2f3ba4) => _0x2f3ba4),
        'isAllowNull': true,
        'fnDisplay': _0x16ef4f => {
          const _0xc2c5e1 = this.getClass_({
            'ix': _0x16ef4f
          });
          if (!_0xc2c5e1) {
            console.warn(...LGT, "Could not find class with index " + _0x16ef4f + " (" + this._data["class"].length + " classes were available)");
            return '(Unknown)';
          }
          return _0xc2c5e1.name + " " + (_0xc2c5e1.source !== Parser.SRC_PHB ? '[' + Parser.sourceJsonToAbv(_0xc2c5e1.source) + ']' : '');
        },
        'fnGetAdditionalStyleClasses': _0x39d0ed => {
          if (_0x39d0ed == null) {
            return null;
          }
          const _0x328d9d = this.getClass_({
            'ix': _0x39d0ed
          });
          if (!_0x328d9d) {
            return;
          }
          return _0x328d9d._versionBase_isVersion ? ['italic'] : null;
        },
        'asMeta': true,
        'isDisabled': this._class_isClassSelectionDisabled({
          'ix': _0x4ebd4a
        })
      });
      _0x1b93cb.addClass("bl-0");
      _0x2020ae.addClass("bl-0");
      const _0x1133f2 = () => {
        const _0x268690 = this._modalFilterClasses.pageFilter.filterBox.getValues();
        const _0x1af3cf = this._data["class"].map(_0x41822a => !this._modalFilterClasses.pageFilter.toDisplay(_0x268690, _0x41822a));
        _0x41f2bf(_0x1af3cf, false);
      };
      const _0x218a13 = () => {
        const _0x431ac1 = this.getClass_({
          'propIxClass': _0x3873dd
        });
        if (!_0x431ac1 || !this._metaHksClassStgSubclass[_0x4ebd4a]) {
          return;
        }
        const _0x13d23e = this._modalFilterClasses.pageFilter.filterBox.getValues();
        const _0x397355 = _0x431ac1.subclasses.map(_0x2c919a => !this._modalFilterClasses.pageFilter.toDisplay(_0x13d23e, _0x2c919a));
        this._metaHksClassStgSubclass[_0x4ebd4a].fnUpdateHidden(_0x397355, false);
      };
      this._modalFilterClasses.pageFilter.filterBox.on(FilterBox.EVNT_VALCHANGE, () => _0x1133f2());
      _0x1133f2();
      const _0x4c7960 = $("<button class=\"btn btn-xs btn-5et h-100 btr-0 bbr-0 pr-2\" title=\"Filter for Class and Subclass\"><span class=\"glyphicon glyphicon-filter\"></span> Filter</button>").click(async () => {
        const _0x41b20e = this.getClass_({
          'propIxClass': _0x3873dd
        });
        const _0x2f5963 = this.getSubclass_({
          'cls': _0x41b20e,
          'propIxSubclass': _0x485b27
        });
        const _0x439ed4 = this._class_isClassSelectionDisabled({
          'ix': _0x4ebd4a
        });
        const _0x196e19 = this._class_isSubclassSelectionDisabled({
          'ix': _0x4ebd4a
        });
        const _0x3a170d = await this._modalFilterClasses.pGetUserSelection({
          'selectedClass': _0x41b20e,
          'selectedSubclass': _0x2f5963,
          'isClassDisabled': _0x439ed4,
          'isSubclassDisabled': _0x196e19
        });
        if (_0x439ed4 && _0x196e19) {
          return;
        }
        if (_0x3a170d == null || !_0x3a170d["class"]) {
          return;
        }
        const _0x5dfbb4 = this._data["class"].findIndex(_0x46996f => _0x46996f.name === _0x3a170d["class"].name && _0x46996f.source === _0x3a170d['class'].source);
        if (!~_0x5dfbb4) {
          throw new Error("Could not find selected class: " + JSON.stringify(_0x3a170d["class"]));
        }
        this._state[_0x3873dd] = _0x5dfbb4;
        await this._pGate(_0xf5ce07);
        if (_0x3a170d.subclass != null) {
          const _0x318161 = this.getClass_({
            'propIxClass': _0x3873dd
          });
          const _0x314a80 = _0x318161.subclasses.findIndex(_0x482224 => _0x482224.name === _0x3a170d.subclass.name && _0x482224.source === _0x3a170d.subclass.source);
          if (!~_0x314a80) {
            throw new Error("Could not find selected subclass: " + JSON.stringify(_0x3a170d.subclass));
          }
          this._state[_0x485b27] = _0x314a80;
        } else {
          this._state[_0x485b27] = null;
        }
      });
      const _0x3e16b9 = async _0xd4d6f7 => {
        this._modalFilterClasses.pageFilter.filterBox.off(_0x28f013);
        if (_0xd4d6f7) {
          const _0x2904ee = Object.keys(this.__state).filter(_0xe4814 => _0xe4814.startsWith(_0x9db42f) && _0xe4814 !== _0x3873dd).mergeMap(_0x77ce3e => ({
            [_0x77ce3e]: null
          }));
          this._proxyAssignSimple("state", _0x2904ee);
        }
        const _0x30a877 = this.getClass_({
          'propIxClass': _0x3873dd
        });
        const _0x4a407c = this.getSubclass_({
          'cls': _0x30a877,
          'propIxSubclass': _0x485b27
        });
        this._class_renderClass_stgSelectSubclass({
          '$stgSelectSubclass': _0x1f4b48,
          'cls': _0x30a877,
          'ix': _0x4ebd4a,
          'propIxSubclass': _0x485b27,
          'idFilterBoxChangeSubclass': _0x28f013,
          'doApplyFilterToSelSubclass': _0x218a13
        });
        this._class_renderClass_stgHpMode({
          '$stgHpMode': _0x27a480,
          'ix': _0x4ebd4a,
          'cls': _0x30a877
        });
        this._class_renderClass_stgHpInfo({
          '$stgHpInfo': _0xba4016,
          'ix': _0x4ebd4a,
          'cls': _0x30a877
        });
        this._class_renderClass_stgStartingProficiencies({
          '$stgStartingProficiencies': _0x45be9a,
          'ix': _0x4ebd4a,
          'cls': _0x30a877
        });
        await this._class_renderClass_pStgLevelSelect({
          '$stgLevelSelect': _0x53adcb,
          '$stgFeatureOptions': _0x415e8b,
          'ix': _0x4ebd4a,
          'cls': _0x30a877,
          'sc': _0x4a407c,
          'propIxSubclass': _0x485b27,
          'propCurLevel': _0x3243ea,
          'propTargetLevel': _0x3fb00f,
          'propCntAsi': _0x117b6f,
          'lockRenderFeatureOptionsSelects': _0x3217e0,
          'idFilterBoxChangeClassLevels': _0x27d6ca
        });
        this._state.class_totalLevels = this.class_getTotalLevels();
        this._class_renderClass_stgSkills({
          '$stgSkills': _0x5a05e8,
          'ix': _0x4ebd4a,
          'propIxClass': _0x3873dd
        });
        this._class_renderClass_stgTools({
          '$stgTools': _0x44f4a1,
          'ix': _0x4ebd4a,
          'propIxClass': _0x3873dd
        });
        await this._class_renderClass_pDispClass({
          'ix': _0x4ebd4a,
          '$dispClass': _0x2d0e0a,
          'cls': _0x30a877,
          'sc': _0x4a407c
        });
        _0x26a7a3.empty();
      };
      const _0x23a52f = async _0x7a25e5 => {
        try {
          await this._pLock(_0xf5ce07);
          await _0x3e16b9(_0x7a25e5);
        } finally {
          this._unlock(_0xf5ce07);
        }
      };
      this._addHookBase(_0x3873dd, _0x23a52f);
      const _0x2c927e = async () => {
        this._modalFilterClasses.pageFilter.filterBox.off(_0x28f013);
        const _0x4df187 = Object.keys(this.__state).filter(_0x30923e => _0x30923e.startsWith(_0x1fdd4b) && _0x30923e !== _0x485b27).mergeMap(_0x207fe4 => ({
          [_0x207fe4]: null
        }));
        this._proxyAssignSimple("state", _0x4df187);
        const _0x306bae = this.getClass_({
          'propIxClass': _0x3873dd
        });
        const _0x3aa118 = this.getSubclass_({
          'cls': _0x306bae,
          'propIxSubclass': _0x485b27
        });
        const _0x3e569e = this._class_getFilteredFeatures(_0x306bae, _0x3aa118);
        if (this._compsClassLevelSelect[_0x4ebd4a]) {
          this._compsClassLevelSelect[_0x4ebd4a].setFeatures(_0x3e569e);
        }
        await this._class_pRenderFeatureOptionsSelects({
          'ix': _0x4ebd4a,
          'propCntAsi': _0x117b6f,
          'filteredFeatures': _0x3e569e,
          '$stgFeatureOptions': _0x415e8b,
          'lockRenderFeatureOptionsSelects': _0x3217e0
        });
        this._modalFilterClasses.pageFilter.filterBox.on(_0x28f013, () => _0x218a13());
        _0x218a13();
        await this._class_renderClass_pDispSubclass({
          'ix': _0x4ebd4a,
          '$dispSubclass': _0x26a7a3,
          'cls': _0x306bae,
          'sc': _0x3aa118
        });
      };
      const _0xc2b902 = async () => {
        try {
          await this._pLock(_0x549fe4);
          await _0x2c927e();
        } finally {
          this._unlock(_0x549fe4);
        }
      };
      this._addHookBase(_0x485b27, _0xc2b902);
      const _0x6b961f = $("<div class=\"bold\">Select a Class</div>");
      const _0x1f4b48 = $$`<div class="ve-flex-col w-100"></div>`.hideVe();
      const _0x27a480 = $$`<div class="ve-flex-col"></div>`.hideVe();
      const _0xba4016 = $$`<div class="ve-flex-col"></div>`.hideVe();
      const _0x45be9a = $$`<div class="ve-flex-col"></div>`.hideVe();
      const _0x53adcb = $$`<div class="ve-flex-col"></div>`.hideVe();
      const _0x415e8b = $$`<div class="ve-flex-col"></div>`.hideVe();
      const _0x5a05e8 = $$`<div class="ve-flex-col"></div>`.hideVe();
      const _0x44f4a1 = $$`<div class="ve-flex-col"></div>`.hideVe();
      let _0x2cf4c4 = null;
      if (!this._existingClassMetas.length) {
        _0x2cf4c4 = $("<button class=\"btn btn-5et btn-xs mr-2\"></button>").click(() => this._state.class_ixPrimaryClass = _0x4ebd4a);
        const _0x4e8bfe = () => {
          _0x2cf4c4.text(this._state.class_ixPrimaryClass === _0x4ebd4a ? "Primary Class" : "Make Primary").title(this._state.class_ixPrimaryClass === _0x4ebd4a ? "This is your primary class, i.e. the one you chose at level 1 for the purposes of proficiencies/etc." : "Make this your primary class, i.e. the one you chose at level 1 for the purposes of proficiencies/etc.").prop("disabled", this._state.class_ixPrimaryClass === _0x4ebd4a);
        };
        this._addHookBase("class_ixPrimaryClass", _0x4e8bfe);
        _0x4e8bfe();
      }
      const _0x55562f = $("<div class=\"py-1 clickable ve-muted\">[‒]</div>").click(() => {
        const _0x569ead = _0x55562f.text() === '[+]';
        _0x55562f.text(_0x569ead ? "[‒]" : "[+]");
        if (_0x569ead) {
          _0x6b961f.text("Select a Class");
        } else {
          const _0x1d557c = this.getClass_({
            'propIxClass': _0x3873dd
          });
          const _0x478ca6 = this.getSubclass_({
            'cls': _0x1d557c,
            'propIxSubclass': _0x485b27
          });
          if (_0x1d557c) {
            _0x6b961f.text('' + _0x1d557c.name + (_0x478ca6 ? " (" + _0x478ca6.name + ')' : ''));
          } else {
            _0x6b961f.text("Select a Class");
          }
        }
        _0x2dcb1e.toggleVe();
      });
      const _0x2d0e0a = $$`<div class="ve-flex-col w-100"></div>`;
      const _0x26a7a3 = $$`<div class="ve-flex-col w-100"></div>`;
      const _0x2dcb1e = $$`<div class="ve-flex-col w-100 mt-2">
              <div class="ve-flex btn-group w-100">
                  <div class="ve-flex no-shrink">
                      ${_0x4c7960}
                  </div>
                  <div class="ve-flex-col w-100">
                      ${_0xb2bb46}
                      ${_0x1f4b48}
                  </div>
              </div>
              ${_0x27a480}
              ${_0xba4016}
              ${_0x45be9a}
              ${_0x5a05e8}
              ${_0x44f4a1}
              ${_0x53adcb}
              ${_0x415e8b}
          </div>`;
      _0x23a52f().then(() => _0xc2b902());
    }
    ["_class_renderClass_stgSelectSubclass"]({
      $stgSelectSubclass: _0x5c8971,
      cls: _0x21801c,
      ix: _0x259c8f,
      propIxSubclass: _0x1278d0,
      idFilterBoxChangeSubclass: _0x5f53f9,
      doApplyFilterToSelSubclass: _0x40f46c
    }) {
      _0x5c8971.empty();
      if (this._metaHksClassStgSubclass[_0x259c8f]) {
        this._metaHksClassStgSubclass[_0x259c8f].unhook();
      }
      if (_0x21801c && _0x21801c.subclasses && _0x21801c.subclasses.length) {
        const _0x3b29a1 = ComponentUiUtil.$getSelSearchable(this, _0x1278d0, {
          'values': _0x21801c.subclasses.map((_0x362bb0, _0x376059) => _0x376059),
          'isAllowNull': true,
          'fnDisplay': _0x2ae9b7 => {
            const _0x7954ef = this.getSubclass_({
              'cls': _0x21801c,
              'ix': _0x2ae9b7
            });
            if (!_0x7954ef) {
              console.warn(...LGT, "Could not find subclass with index " + _0x2ae9b7 + " (" + _0x21801c.subclasses.length + " subclasses were available for class " + _0x21801c.name + ')');
              return '(Unknown)';
            }
            return _0x7954ef.name + " " + (_0x7954ef.source !== Parser.SRC_PHB ? '[' + Parser.sourceJsonToAbv(_0x7954ef.source) + ']' : '');
          },
          'fnGetAdditionalStyleClasses': _0x1d7fa3 => {
            if (_0x1d7fa3 == null) {
              return null;
            }
            const _0x3d2ce1 = this.getSubclass_({
              'cls': _0x21801c,
              'ix': _0x1d7fa3
            });
            if (!_0x3d2ce1) {
              return;
            }
            return _0x3d2ce1._versionBase_isVersion ? ['italic'] : null;
          },
          'asMeta': true,
          'isDisabled': this._class_isSubclassSelectionDisabled({
            'ix': _0x259c8f
          }),
          'displayNullAs': "Select a Subclass"
        });
        _0x3b29a1.$iptDisplay.addClass('bl-0');
        _0x3b29a1.$iptSearch.addClass("bl-0");
        this._metaHksClassStgSubclass[_0x259c8f] = _0x3b29a1;
        this._modalFilterClasses.pageFilter.filterBox.on(_0x5f53f9, () => _0x40f46c());
        _0x40f46c();
        const _0x464d42 = $$`<div class="ve-flex-col w-100 mt-1">
                  ${_0x3b29a1.$wrp}
              </div>`;
        _0x5c8971.showVe().append(_0x464d42);
      } else {
        _0x5c8971.hideVe();
        this._metaHksClassStgSubclass[_0x259c8f] = null;
      }
    }
    ["_class_renderClass_stgHpMode"]({
      $stgHpMode: _0x597dad,
      ix: _0x406f89,
      cls: _0x444a9c
    }) {
      _0x597dad.empty();
      if (_0x444a9c && Charactermancer_Class_HpIncreaseModeSelect.isHpAvailable(_0x444a9c)) {
        _0x597dad.showVe().append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Hit Points Increase Mode</div>");
        this._compsClassHpIncreaseMode[_0x406f89] = new Charactermancer_Class_HpIncreaseModeSelect();
        this._compsClassHpIncreaseMode[_0x406f89].render(_0x597dad);
      } else {
        _0x597dad.hideVe();
        this._compsClassHpIncreaseMode[_0x406f89] = null;
      }
    }
    ['_class_renderClass_stgHpInfo']({
      $stgHpInfo: _0x5101d6,
      ix: _0x3c88f7,
      cls: _0x5419b6
    }) {
      _0x5101d6.empty();
      if (_0x5419b6 && Charactermancer_Class_HpIncreaseModeSelect.isHpAvailable(_0x5419b6)) {
        _0x5101d6.showVe().append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Hit Points</div>");
        this._compsClassHpInfo[_0x3c88f7] = new Charactermancer_Class_HpInfo({
          'className': _0x5419b6.name,
          'hitDice': _0x5419b6.hd
        });
        this._compsClassHpInfo[_0x3c88f7].render(_0x5101d6);
      } else {
        _0x5101d6.hideVe();
        this._compsClassHpInfo[_0x3c88f7] = null;
      }
    }
    ["_class_renderClass_stgStartingProficiencies"]({
      $stgStartingProficiencies: _0x1b56f5,
      ix: _0x527fdb,
      cls: _0x1777c2
    }) {
      const _0x344de6 = this._class_getExistingClassMeta(_0x527fdb);
      if (_0x344de6) {
        return;
      }
      if (this._metaHksClassStgStartingProficiencies[_0x527fdb]) {
        this._metaHksClassStgStartingProficiencies[_0x527fdb].unhook();
      }
      _0x1b56f5.empty();
      this._parent.featureSourceTracker_.unregister(this._compsClassStartingProficiencies[_0x527fdb]);
      if (_0x1777c2 && (_0x1777c2.startingProficiencies || _0x1777c2.multiclassing?.["proficienciesGained"])) {
        _0x1b56f5.showVe().append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Proficiencies</div>");
        this._compsClassStartingProficiencies[_0x527fdb] = Charactermancer_Class_StartingProficiencies.get({
          'featureSourceTracker': this._parent.featureSourceTracker_,
          'primaryProficiencies': _0x1777c2.startingProficiencies,
          'multiclassProficiencies': _0x1777c2.multiclassing?.["proficienciesGained"],
          'savingThrowsProficiencies': _0x1777c2.proficiency,
          'existingProficienciesFvttArmor': MiscUtil.get(this._actor, "_source", "system", "traits", "armorProf"),
          'existingProficienciesFvttWeapons': MiscUtil.get(this._actor, '_source', "system", "traits", "weaponProf"),
          'existingProficienciesFvttSavingThrows': Charactermancer_Class_StartingProficiencies.getExistingProficienciesFvttSavingThrows(this._actor)
        });
        this._compsClassStartingProficiencies[_0x527fdb].render(_0x1b56f5);
      } else {
        _0x1b56f5.hideVe();
        this._compsClassStartingProficiencies[_0x527fdb] = null;
      }
      const _0x2c34e2 = () => {
        if (this._compsClassStartingProficiencies[_0x527fdb]) {
          this._compsClassStartingProficiencies[_0x527fdb].mode = this._state.class_ixPrimaryClass === _0x527fdb ? Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY : Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS;
        }
      };
      this._addHookBase("class_ixPrimaryClass", _0x2c34e2);
      this._metaHksClassStgStartingProficiencies[_0x527fdb] = {
        'unhook': () => this._removeHookBase("class_ixPrimaryClass", _0x2c34e2)
      };
      _0x2c34e2();
    }
    ["_class_getExistingClassMeta"](_0xbe660b) {
      if (this._existingClassMetas[_0xbe660b]) {
        return this._existingClassMetas[_0xbe660b];
      }
      const {
        propIxClass: _0x5b74cd
      } = ActorCharactermancerBaseComponent.class_getProps(_0xbe660b);
      const _0x1f931b = this.getClass_({
        'propIxClass': _0x5b74cd
      });
      const _0x11c553 = Charactermancer_Class_Util.getExistingClassItems(this._actor, _0x1f931b);
      const _0x5dcf2a = _0x11c553.length ? _0x11c553[0x0] : null;
      if (!_0x5dcf2a) {
        return null;
      }
      return {
        'item': _0x5dcf2a,
        'level': Number(_0x5dcf2a.system.levels || 0x0)
      };
    }
    async ["_class_renderClass_pStgLevelSelect"]({
      $stgLevelSelect: _0xfb7131,
      $stgFeatureOptions: _0x2cd62a,
      ix: _0x2974ee,
      cls: _0x3174e4,
      sc: _0x39dfb0,
      propIxSubclass: _0x157e74,
      propCurLevel: _0x507c12,
      propTargetLevel: _0x325b4f,
      propCntAsi: _0x36fa76,
      lockRenderFeatureOptionsSelects: _0x31ad95,
      idFilterBoxChangeClassLevels: _0x36f0ca
    }) {
      _0xfb7131.empty();
      if (_0x3174e4) {
        _0xfb7131.showVe().append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Select Levels</div>");
        const _0xab8fed = this._class_getFilteredFeatures(_0x3174e4, _0x39dfb0);
        const _0xa230b0 = this._class_getExistingClassMeta(_0x2974ee);
        this._compsClassLevelSelect[_0x2974ee] = new Charactermancer_Class_LevelSelect({
          'features': _0xab8fed,
          'isRadio': true,
          'isForceSelect': this.getExistingClassTotalLevels_() === 0x0 || !_0xa230b0,
          'maxPreviousLevel': _0xa230b0?.["level"],
          'isSubclass': true
        });
        this._compsClassLevelSelect[_0x2974ee].render(_0xfb7131);
        const _0x54b941 = async () => {
          const _0x30091c = this.getSubclass_({
            'cls': _0x3174e4,
            'propIxSubclass': _0x157e74
          });
          const _0x4869de = this._class_getFilteredFeatures(_0x3174e4, _0x30091c);
          await this._class_pRenderFeatureOptionsSelects({
            'ix': _0x2974ee,
            'propCntAsi': _0x36fa76,
            'filteredFeatures': _0x4869de,
            '$stgFeatureOptions': _0x2cd62a,
            'lockRenderFeatureOptionsSelects': _0x31ad95
          });
          this._state[_0x507c12] = this._compsClassLevelSelect[_0x2974ee].getCurLevel();
          this._state[_0x325b4f] = this._compsClassLevelSelect[_0x2974ee].getTargetLevel();
          this._state.class_totalLevels = this.class_getTotalLevels();
        };
        this._compsClassLevelSelect[_0x2974ee].onchange(_0x54b941);
        await _0x54b941();
        this._modalFilterClasses.pageFilter.filterBox.on(_0x36f0ca, () => {
          if (!this._compsClassLevelSelect[_0x2974ee]) {
            return;
          }
          const _0x5bc252 = this.getSubclass_({
            'cls': _0x3174e4,
            'propIxSubclass': _0x157e74
          });
          const _0x10299e = this._class_getFilteredFeatures(_0x3174e4, _0x5bc252);
          if (this._compsClassLevelSelect[_0x2974ee]) {
            this._compsClassLevelSelect[_0x2974ee].setFeatures(_0x10299e);
          }
          this._class_pRenderFeatureOptionsSelects({
            'ix': _0x2974ee,
            'propCntAsi': _0x36fa76,
            'filteredFeatures': _0x10299e,
            '$stgFeatureOptions': _0x2cd62a,
            'lockRenderFeatureOptionsSelects': _0x31ad95
          });
        });
      } else {
        _0xfb7131.hideVe();
        this._compsClassLevelSelect[_0x2974ee] = null;
        _0x2cd62a.empty().hideVe();
        this._class_unregisterFeatureSourceTrackingFeatureComps(_0x2974ee);
        this._state[_0x36fa76] = null;
        this._modalFilterClasses.pageFilter.filterBox.off(_0x36f0ca);
      }
    }
    ['_class_renderClass_stgSkills']({
      $stgSkills: _0x18fe7d,
      ix: _0x138ef0,
      propIxClass: _0x2f063c
    }) {
      this._class_renderClass_stgSkillsTools({
        '$stg': _0x18fe7d,
        'ix': _0x138ef0,
        'propIxClass': _0x2f063c,
        'propMetaHks': "_metaHksClassStgSkills",
        'propCompsClass': '_compsClassSkillProficiencies',
        'propSystem': 'skills',
        'fnGetProfs': ({
          cls: _0x1dbeaa,
          isPrimaryClass: _0x155251
        }) => {
          if (!_0x1dbeaa) {
            return null;
          }
          return _0x155251 ? _0x1dbeaa.startingProficiencies?.["skills"] : _0x1dbeaa.multiclassing?.['proficienciesGained']?.["skills"];
        },
        'headerText': "Skill Proficiencies",
        'fnGetMapped': Charactermancer_OtherProficiencySelect.getMappedSkillProficiencies.bind(Charactermancer_OtherProficiencySelect)
      });
    }
    ["_class_renderClass_stgTools"]({
      $stgTools: _0x32cea1,
      ix: _0x40352a,
      propIxClass: _0x1e9a92
    }) {
      this._class_renderClass_stgSkillsTools({
        '$stg': _0x32cea1,
        'ix': _0x40352a,
        'propIxClass': _0x1e9a92,
        'propMetaHks': "_metaHksClassStgTools",
        'propCompsClass': '_compsClassToolProficiencies',
        'propSystem': "tools",
        'fnGetProfs': ({
          cls: _0x5ed998,
          isPrimaryClass: _0x1be964
        }) => {
          if (!_0x5ed998) {
            return null;
          }
          return _0x1be964 ? Charactermancer_Class_Util.getToolProficiencyData(_0x5ed998.startingProficiencies) : Charactermancer_Class_Util.getToolProficiencyData(_0x5ed998.multiclassing?.['proficienciesGained']);
        },
        'headerText': "Tool Proficiencies",
        'fnGetMapped': Charactermancer_OtherProficiencySelect.getMappedToolProficiencies.bind(Charactermancer_OtherProficiencySelect)
      });
    }
    ["_class_renderClass_stgSkillsTools"]({
      $stg: _0x469daf,
      ix: _0x3fe1d8,
      propIxClass: _0x15d389,
      propMetaHks: _0x343f18,
      propCompsClass: _0x122a08,
      propSystem: _0x4a9a60,
      fnGetProfs: _0x39bdbe,
      headerText: _0x17d1c9,
      fnGetMapped: _0x2664f3
    }) {
      const _0x1d6f33 = this._class_getExistingClassMeta(_0x3fe1d8);
      if (_0x1d6f33) {
        return;
      }
      if (this[_0x343f18][_0x3fe1d8]) {
        this[_0x343f18][_0x3fe1d8].unhook();
      }
      const _0x3f3f87 = () => {
        _0x469daf.empty();
        const _0x456745 = this.getClass_({
          'propIxClass': _0x15d389
        });
        const _0x405d40 = this._state.class_ixPrimaryClass === _0x3fe1d8;
        this._parent.featureSourceTracker_.unregister(this[_0x122a08][_0x3fe1d8]);
        const _0x52873c = _0x39bdbe({
          'cls': _0x456745,
          'isPrimaryClass': _0x405d40
        });
        if (_0x456745 && _0x52873c) {
          _0x469daf.showVe().append("<hr class=\"hr-2\"><div class=\"bold mb-2\">" + _0x17d1c9 + "</div>");
          const _0x16d7ec = {
            'skillProficiencies': MiscUtil.get(this._actor, "_source", "system", _0x4a9a60)
          };
          this[_0x122a08][_0x3fe1d8] = new Charactermancer_OtherProficiencySelect({
            'featureSourceTracker': this._parent.featureSourceTracker_,
            'existing': Charactermancer_OtherProficiencySelect.getExisting(_0x16d7ec),
            'existingFvtt': _0x16d7ec,
            'available': _0x2664f3(_0x52873c)
          });
          this[_0x122a08][_0x3fe1d8].render(_0x469daf);
        } else {
          _0x469daf.hideVe();
          this[_0x122a08][_0x3fe1d8] = null;
        }
      };
      this._addHookBase("class_ixPrimaryClass", _0x3f3f87);
      this[_0x343f18][_0x3fe1d8] = {
        'unhook': () => this._removeHookBase("class_ixPrimaryClass", _0x3f3f87)
      };
      _0x3f3f87();
    }
    async ['_class_renderClass_pDispClass']({
      ix: _0x3c9e06,
      $dispClass: _0x1bf26,
      cls: _0x50e1af,
      sc: _0x1f1733
    }) {
      if (this._$wrpsClassTable[_0x3c9e06]) {
        this._$wrpsClassTable[_0x3c9e06].detach();
      } else {
        this._$wrpsClassTable[_0x3c9e06] = $("<div class=\"ve-flex-col w-100\"></div>");
      }
      _0x1bf26.empty();
      if (_0x50e1af) {
        const _0x184e57 = _0x50e1af._isStub ? _0x50e1af : await DataLoader.pCacheAndGet("class", _0x50e1af.source, UrlUtil.URL_TO_HASH_BUILDER["class"](_0x50e1af));
        let _0x5c41fe = MiscUtil.copy(_0x184e57.classFeatures || []).flat();
        _0x5c41fe = Charactermancer_Class_Util.getFilteredEntries_bySource(_0x5c41fe, this._modalFilterClasses.pageFilter, this._modalFilterClasses.pageFilter.filterBox.getValues());
        const _0x50ec18 = {
          'type': "section",
          'entries': _0x5c41fe
        };
        this._class_renderEntriesSection(_0x1bf26, _0x50e1af.name, _0x50ec18, {
          '$wrpTable': this._$wrpsClassTable[_0x3c9e06]
        });
        await this._class_renderClass_pClassTable({
          'ix': _0x3c9e06,
          'cls': _0x50e1af,
          'sc': _0x1f1733
        });
      }
    }
    async ["_class_renderClass_pDispSubclass"]({
      ix: _0xd8d788,
      $dispSubclass: _0x189ba0,
      cls: _0x3f21f6,
      sc: _0x5dd639
    }) {
      _0x189ba0.empty();
      if (_0x5dd639) {
        _0x189ba0.append("<hr class=\"hr-1\">");
        const _0x19c6a9 = _0x5dd639._isStub ? _0x5dd639 : await DataLoader.pCacheAndGet("subclass", _0x5dd639.source, UrlUtil.URL_TO_HASH_BUILDER.subclass(_0x5dd639));
        let _0x4cd88b = MiscUtil.copy(_0x19c6a9.subclassFeatures).flat();
        _0x4cd88b = Charactermancer_Class_Util.getFilteredEntries_bySource(_0x4cd88b, this._modalFilterClasses.pageFilter, this._modalFilterClasses.pageFilter.filterBox.getValues());
        const _0x92cb5c = {
          'type': "section",
          'entries': _0x4cd88b
        };
        if (_0x92cb5c.entries[0x0] && _0x92cb5c.entries[0x0].name) {
          delete _0x92cb5c.entries[0x0].name;
        }
        this._class_renderEntriesSection(_0x189ba0, _0x5dd639.name, _0x92cb5c);
      }
      await this._class_renderClass_pClassTable({
        'ix': _0xd8d788,
        'cls': _0x3f21f6,
        'sc': _0x5dd639
      });
    }
    async ["_class_renderClass_pClassTable"]({
      ix: _0x29a0a3,
      cls: _0xed637d,
      sc: _0x386619
    }) {
      const _0x57a945 = _0xed637d ? _0xed637d._isStub ? _0xed637d : await DataLoader.pCacheAndGet('class', _0xed637d.source, UrlUtil.URL_TO_HASH_BUILDER["class"](_0xed637d)) : null;
      const _0x4d6b47 = _0x386619 ? _0x386619._isStub ? _0x386619 : await DataLoader.pCacheAndGet("subclass", _0x386619.source, UrlUtil.URL_TO_HASH_BUILDER.subclass(_0x386619)) : null;
      const _0x2da178 = _0x57a945?.["classFeatures"] || _0x4d6b47?.["subclassFeatures"] ? this._modalFilterClasses.pageFilter.filterBox.getValues() : null;
      if (_0x57a945?.["classFeatures"]) {
        _0x57a945.classFeatures = _0x57a945.classFeatures.map(_0x2106c1 => {
          _0x2106c1 = MiscUtil.copy(_0x2106c1);
          _0x2106c1 = Charactermancer_Class_Util.getFilteredEntries_bySource(_0x2106c1, this._modalFilterClasses.pageFilter, _0x2da178);
          return _0x2106c1;
        });
      }
      if (_0x4d6b47?.["subclassFeatures"]) {
        _0x4d6b47.subclassFeatures = _0x4d6b47.subclassFeatures.map(_0x3cb3f1 => {
          _0x3cb3f1 = MiscUtil.copy(_0x3cb3f1);
          _0x3cb3f1 = Charactermancer_Class_Util.getFilteredEntries_bySource(_0x3cb3f1, this._modalFilterClasses.pageFilter, _0x2da178);
          return _0x3cb3f1;
        });
      }
      const _0x5e497c = DataConverterClass.getRenderedClassTableFromDereferenced(_0x57a945, _0x4d6b47);
      this._$wrpsClassTable[_0x29a0a3].html('').fastSetHtml(_0x5e497c);
    }
    ["_class_getFilteredFeatures"](_0x547c47, _0x29fb5c) {
      if (!_0x547c47) {
        return [];
      }
      _0x547c47 = MiscUtil.copy(_0x547c47);
      _0x547c47.subclasses = [_0x29fb5c].filter(Boolean);
      return Charactermancer_Util.getFilteredFeatures(Charactermancer_Class_Util.getAllFeatures(_0x547c47), this._modalFilterClasses.pageFilter, this._modalFilterClasses.pageFilter.filterBox.getValues());
    }
    async ['_class_pRenderFeatureOptionsSelects'](_0xd3c29b) {
      const {
        lockRenderFeatureOptionsSelects: _0x105085
      } = _0xd3c29b;
      try {
        await this._pLock(_0x105085);
        return this._class_pRenderFeatureOptionsSelects_(_0xd3c29b);
      } finally {
        this._unlock(_0x105085);
      }
    }
    async ['_class_pRenderFeatureOptionsSelects_']({
      ix: _0x4ba617,
      propCntAsi: _0x5c4b09,
      filteredFeatures: _0xcaac0c,
      $stgFeatureOptions: _0x15b372
    }) {
      const _0x4b61c1 = this._compsClassFeatureOptionsSelect[_0x4ba617] || [];
      _0x4b61c1.forEach(_0x5ddd00 => this._parent.featureSourceTracker_.unregister(_0x5ddd00));
      _0x15b372.empty();
      const _0x4548cc = this._existingClassMetas[_0x4ba617] ? new Charactermancer_Class_Util.ExistingFeatureChecker(this._actor) : null;
      const _0x336be4 = Charactermancer_Util.getImportableFeatures(_0xcaac0c);
      const _0x117b40 = MiscUtil.copy(_0x336be4);
      Charactermancer_Util.doApplyFilterToFeatureEntries_bySource(_0x117b40, this._modalFilterClasses.pageFilter, this._modalFilterClasses.pageFilter.filterBox.getValues());
      const _0x21ae90 = Charactermancer_Util.getFeaturesGroupedByOptionsSet(_0x117b40);
      const {
        lvlMin: _0x1dec8f,
        lvlMax: _0x38b4f6
      } = await this._class_pGetMinMaxLevel(_0x4ba617);
      this._class_unregisterFeatureSourceTrackingFeatureComps(_0x4ba617);
      let _0x585d43 = 0x0;
      for (const _0x54d088 of _0x21ae90) {
        const {
          topLevelFeature: _0x40205c,
          optionsSets: _0x23331a
        } = _0x54d088;
        if (_0x40205c.level < _0x1dec8f || _0x40205c.level > _0x38b4f6) {
          continue;
        }
        const _0x2dedef = _0x40205c.name.toLowerCase();
        if (_0x2dedef === "ability score improvement") {
          _0x585d43++;
          continue;
        }
        for (const _0x3d4985 of _0x23331a) {
          const _0x4fef4c = new Charactermancer_FeatureOptionsSelect({
            'featureSourceTracker': this._parent.featureSourceTracker_,
            'existingFeatureChecker': _0x4548cc,
            'actor': this._actor,
            'optionsSet': _0x3d4985,
            'level': _0x40205c.level,
            'modalFilterSpells': this._parent.compSpell.modalFilterSpells
          });
          this._compsClassFeatureOptionsSelect[_0x4ba617].push(_0x4fef4c);
          _0x4fef4c.findAndCopyStateFrom(_0x4b61c1);
        }
      }
      this._state[_0x5c4b09] = _0x585d43;
      await this._class_pRenderFeatureComps(_0x4ba617, {
        '$stgFeatureOptions': _0x15b372
      });
    }
    ["_class_unregisterFeatureSourceTrackingFeatureComps"](_0x3f9ba9) {
      (this._compsClassFeatureOptionsSelect[_0x3f9ba9] || []).forEach(_0x2edadc => _0x2edadc.unregisterFeatureSourceTracking());
      this._compsClassFeatureOptionsSelect[_0x3f9ba9] = [];
    }
    async ["_class_pGetMinMaxLevel"](_0x356dbb) {
      let _0x3d959d = 0x0;
      let _0x1005e8 = 0x0;
      if (this._compsClassLevelSelect[_0x356dbb]) {
        const _0xbda027 = await this._compsClassLevelSelect[_0x356dbb].pGetFormData().data;
        _0x3d959d = Math.min(..._0xbda027) + 0x1;
        _0x1005e8 = Math.max(..._0xbda027) + 0x1;
      }
      return {
        'lvlMin': _0x3d959d,
        'lvlMax': _0x1005e8
      };
    }
    async ["_class_pRenderFeatureComps"](_0x3f9795, {
      $stgFeatureOptions: _0x3179cf
    }) {
      for (const _0x5b3543 of this._compsClassFeatureOptionsSelect[_0x3f9795]) {
        if ((await _0x5b3543.pIsNoChoice()) && !(await _0x5b3543.pIsAvailable())) {
          continue;
        }
        if (!(await _0x5b3543.pIsNoChoice()) || (await _0x5b3543.pIsForceDisplay())) {
          _0x3179cf.showVe().append('' + (_0x5b3543.modalTitle ? "<hr class=\"hr-2\"><div class=\"mb-2 bold w-100\">" + _0x5b3543.modalTitle + "</div>" : ''));
        }
        _0x5b3543.render(_0x3179cf);
      }
    }
    ["_class_renderEntriesSection"](_0x3413d5, _0x582d2d, _0x1aea64, {
      $wrpTable = null
    } = {}) {
      const _0x4c8fa0 = $("<div class=\"py-1 pl-2 clickable ve-muted\">[‒]</div>").click(() => {
        _0x4c8fa0.text(_0x4c8fa0.text() === '[+]' ? '[‒]' : "[+]");
        if ($wrpTable) {
          $wrpTable.toggleVe();
        }
        _0x3fe7d2.toggleVe();
      });
      const _0x3fe7d2 = Renderer.hover.$getHoverContent_generic(_0x1aea64);
      $$`<div class="ve-flex-col">
              <div class="split-v-center">
                  <div class="rd__h rd__h--0"><div class="entry-title-inner">${(_0x582d2d || '').qq()}</div></div>
                  ${_0x4c8fa0}
              </div>
              ${$wrpTable}
              ${_0x3fe7d2}
          </div>`.appendTo(_0x3413d5);
    }
    ['class_getPrimaryClass']() {
      if (!~this._state.class_ixPrimaryClass) {
        return null;
      }
      const {
        propIxClass: _0x42dfba
      } = ActorCharactermancerBaseComponent.class_getProps(this._state.class_ixPrimaryClass);
      return this._data["class"][this._state[_0x42dfba]];
    }
    ["class_getTotalLevels"]() {
      return this._compsClassLevelSelect.filter(Boolean).map(_0x169930 => _0x169930.getTargetLevel() || _0x169930.getCurLevel()).reduce((_0x130249, _0x125134) => _0x130249 + _0x125134, 0x0);
    }
    ["class_getMinMaxSpellLevel"]() {
      const _0x35ebcb = [];
      const _0x5ba174 = [];
      let _0x8a1dd5 = false;
      for (let _0xa4aa35 = 0x0; _0xa4aa35 < this._state.class_ixMax + 0x1; ++_0xa4aa35) {
        const {
          propIxClass: _0x27f359,
          propIxSubclass: _0x215bda,
          propCurLevel: _0x496498,
          propTargetLevel: _0x4c7a29
        } = ActorCharactermancerBaseComponent.class_getProps(_0xa4aa35);
        const _0x2bea38 = this.getClass_({
          'propIxClass': _0x27f359
        });
        if (!_0x2bea38) {
          continue;
        }
        const _0x6aec7a = this.getSubclass_({
          'cls': _0x2bea38,
          'propIxSubclass': _0x215bda
        });
        const _0x19e990 = this._state[_0x496498];
        const _0x275d07 = this._state[_0x4c7a29];
        const _0x547cd0 = DataConverter.getMaxCasterProgression(_0x2bea38.casterProgression, _0x6aec7a?.["casterProgression"]);
        const _0x52dd93 = Charactermancer_Spell_Util.getCasterProgressionMeta({
          'casterProgression': _0x547cd0,
          'curLevel': _0x19e990,
          'targetLevel': _0x275d07,
          'isBreakpointsOnly': true
        })?.["spellLevelLow"];
        if (_0x52dd93 != null) {
          _0x35ebcb.push(_0x52dd93);
        }
        const _0x38d005 = Charactermancer_Spell_Util.getCasterProgressionMeta({
          'casterProgression': _0x547cd0,
          'curLevel': _0x19e990,
          'targetLevel': _0x275d07,
          'isBreakpointsOnly': true
        })?.["spellLevelHigh"];
        if (_0x38d005 != null) {
          _0x5ba174.push(_0x38d005);
        }
        _0x8a1dd5 = _0x8a1dd5 || Charactermancer_Spell_Util.getMaxLearnedCantrips({
          'cls': _0x2bea38,
          'sc': _0x6aec7a,
          'targetLevel': _0x275d07
        }) != null;
      }
      return {
        'min': _0x35ebcb.length ? Math.min(..._0x35ebcb) : null,
        'max': _0x5ba174.length ? Math.max(..._0x5ba174) : null,
        'isAnyCantrips': _0x8a1dd5
      };
    }
    ["_getDefaultState"]() {
      return {
        'class_ixPrimaryClass': 0x0,
        'class_ixMax': 0x0,
        'class_totalLevels': 0x0,
        'class_pulseChange': false
      };
    }
  }
  ActorCharactermancerClass.ExistingClassMeta = class {
    constructor({
      item: _0x15e322,
      ixClass: _0x3e76af,
      isUnknownClass: _0x2e3ac8,
      ixSubclass: _0x592c09,
      isUnknownSubclass: _0x1539ea,
      level: _0x4882af,
      isPrimary: _0x56643b,
      spellSlotLevelSelection: _0x1ba959
    }) {
      this.item = _0x15e322;
      this.ixClass = _0x3e76af;
      this.isUnknownClass = _0x2e3ac8;
      this.ixSubclass = _0x592c09;
      this.isUnknownSubclass = _0x1539ea;
      this.level = _0x4882af;
      this.isPrimary = _0x56643b;
      this.spellSlotLevelSelection = _0x1ba959;
      if (isNaN(this.level)) {
        this.level = 0x0;
      }
    }
  };