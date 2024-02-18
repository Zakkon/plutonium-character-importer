import { ImportListCharacter } from "./importlist.js";
import { DataConverterClass, DataConverter, UtilDataConverter } from "./dataconverter.js";
import { PageFilterClassesFoundry } from "../veTools/pagefilters.js";
import { SharedConsts, ConfigConsts, Config } from "../veTools/config.js";
import { ImportEntryManagerClass } from "./importentrymanager.js";
import { LGT } from "../veTools/utils.js";
import { UtilActors } from "./utilactors.js";
import { Charactermancer_Class_HpIncreaseModeSelect, Charactermancer_Class_ProficiencyImportModeSelect, Charactermancer_Class_StartingProficiencies, Charactermancer_AdditionalSpellsSelect } from "./mancercomponents.js";
import { Charactermancer_Class_Util } from "./charactermancer.js";
import { UtilDocuments } from "./utildocument.js";
import { Charactermancer_Spell_Util } from "./spellutil.js";

class ImportListClass extends ImportListCharacter {
     static ["init"]() {
      const _0x57b41d = {
        'isForce': true,
        'fnGetSuccessMessage': ({
          ent: _0x4e6141
        }) => "Imported \"" + (_0x4e6141.className || _0x4e6141.name) + "\"" + (_0x4e6141.subclassShortName ? " (" + _0x4e6141.name + ')' : '') + " via Class Importer",
        'fnGetFailedMessage': ({
          ent: _0x3e2edc
        }) => "Failed to import \"" + (_0x3e2edc.className || _0x3e2edc.name) + "\"" + (_0x3e2edc.subclassShortName ? " (" + _0x3e2edc.name + ')' : '') + "! " + VeCt.STR_SEE_CONSOLE
      };
      this._initCreateSheetItemHook({
        ..._0x57b41d,
        'prop': 'class',
        'importerName': "Class"
      });
      this._initCreateSheetItemHook({
        ..._0x57b41d,
        'prop': "subclass",
        'importerName': "Subclass"
      });
    }
    static get ['ID']() {
      return "classes-subclasses";
    }
    static get ["DISPLAY_NAME_TYPE_PLURAL"]() {
      return "Classes & Subclasses";
    }
    static get ["PROPS"]() {
      return ["class", "subclass"];
    }
    static ['_'] = this.registerImpl(this);
    static get ["defaultOptions"]() {
      return mergeObject(super.defaultOptions, {
        'template': SharedConsts.MODULE_LOCATION + "/template/ImportListClass.hbs"
      });
    }
    ["_isSkipContentFlatten"] = true;
    ["_dirsHomebrew"] = ["class", 'subclass'];
    ['_sidebarTab'] = "items";
    ['_gameProp'] = "items";
    ["_defaultFolderPath"] = ["Classes"];
    ["_pageFilter"] = new PageFilterClassesFoundry();
    ["_page"] = UrlUtil.PG_CLASSES;
    ["_isDedupable"] = true;
    ["_namespace"] = 'class_subclass';
    ['_configGroup'] = "importClass";
     static ['_DataConverter'] = DataConverterClass;
    constructor(..._0x12d74e) {
      super(..._0x12d74e);
      this._cachedData = null;
    }
    async ["pSetContent"](_0x4a4c36) {
      await super.pSetContent(_0x4a4c36);
      this._cachedData = null;
    }
    static async ["pPostLoad"](_0x3f9654, {
      actor: _0x54ca09
    } = {}) {
      const _0xdddcba = await DataConverterClassSubclassFeature.pGetClassSubclassFeatureIgnoredLookup({
        'data': _0x3f9654
      });
      const _0x45363b = await PageFilterClassesFoundry.pPostLoad(_0x3f9654, {
        'actor': _0x54ca09,
        'isIgnoredLookup': _0xdddcba
      });
      Charactermancer_Class_Util.addFauxOptionalFeatureFeatures(_0x45363b['class'], (await this._pPostLoad_pGetAllOptionalFeatures()).optionalfeature);
      return _0x45363b;
    }
    async ["_pGetSources"]() {
      return [new UtilDataSource.DataSourceSpecial(Config.get('ui', 'isStreamerMode') ? "SRD" : '5etools', Vetools.pGetClasses, {
        'cacheKey': "5etools-classes",
        'pPostLoad': _0x18dd93 => this.constructor.pPostLoad(_0x18dd93, {
          'actor': this._actor
        }),
        'filterTypes': [UtilDataSource.SOURCE_TYP_OFFICIAL_ALL],
        'isDefault': true
      }), ...UtilDataSource.getSourcesCustomUrl({
        'pPostLoad': _0xccecd7 => this.constructor.pPostLoad(_0xccecd7, {
          'actor': this._actor
        })
      }), ...UtilDataSource.getSourcesUploadFile({
        'pPostLoad': _0x1e97e1 => this.constructor.pPostLoad(_0x1e97e1, {
          'actor': this._actor
        })
      }), ...(await this._pGetSourcesPrerelease({
        'pPostLoad': _0xec802b => this.constructor.pPostLoad(_0xec802b, {
          'actor': this._actor
        })
      })), ...(await this._pGetSourcesBrew({
        'pPostLoad': _0x347f7a => this.constructor.pPostLoad(_0x347f7a, {
          'actor': this._actor
        })
      }))];
    }
    ["isInvalidatedByConfigChange"](_0x1bf88c) {
      const _0x1a3503 = !!Config.get("importClass", "isHideSubclassRows");
      return this._cachedData && !!this._cachedData.isHideSubclassRows !== _0x1a3503;
    }
    ['getData']() {
      if (this._cachedData && this._cachedData.isRadio !== !!this._actor) {
        this._cachedData = null;
      }
      const _0x274ede = !!Config.get("importClass", "isHideSubclassRows");
      if (this._cachedData && !!this._cachedData.isHideSubclassRows !== !!_0x274ede) {
        this._cachedData = null;
      }
      this._cachedData = this._cachedData || {
        'titleButtonRun': this._titleButtonRun,
        'titleSearch': this._titleSearch,
        'rows': this._content["class"].sort((_0x223ec6, _0x164be7) => SortUtil.ascSortLower(_0x223ec6.name, _0x164be7.name) || SortUtil.ascSortLower(Parser.sourceJsonToFull(_0x223ec6.source || Parser.SRC_PHB), Parser.sourceJsonToFull(_0x164be7.source || Parser.SRC_PHB))).map((_0x55c265, _0x4e854d) => {
          this._pageFilter.constructor.mutateForFilters(_0x55c265);
          return {
            'name': _0x55c265.name,
            'source': _0x55c265.source,
            'sourceShort': Parser.sourceJsonToAbv(_0x55c265.source),
            'sourceLong': Parser.sourceJsonToFull(_0x55c265.source),
            'sourceClassName': Parser.sourceJsonToColor(_0x55c265.source),
            'sourceStyle': PrereleaseUtil.sourceJsonToStylePart(_0x55c265.source) || BrewUtil2.sourceJsonToStylePart(_0x55c265.source),
            'ixClass': _0x4e854d,
            'disabled': !_0x55c265.classFeatures,
            'subRows': _0x274ede ? [] : (_0x55c265.subclasses || []).map((_0x5da161, _0x8ecc17) => ({
              'name': _0x5da161.name,
              'source': _0x5da161.source || _0x55c265.source,
              'sourceShort': Parser.sourceJsonToAbv(_0x5da161.source || _0x55c265.source),
              'sourceLong': Parser.sourceJsonToFull(_0x5da161.source || _0x55c265.source),
              'sourceClassName': Parser.sourceJsonToColor(_0x5da161.source || _0x55c265.source),
              'sourceStyle': PrereleaseUtil.sourceJsonToStylePart(_0x5da161.source || _0x55c265.source) || BrewUtil2.sourceJsonToStylePart(_0x5da161.source || _0x55c265.source),
              'ixSubclass': _0x8ecc17
            }))
          };
        })
      };
      if (this._actor) {
        this._cachedData.isRadio = true;
      }
      if (_0x274ede) {
        this._cachedData.isHideSubclassRows = true;
      }
      return this._cachedData;
    }
    ['_getDedupedData']({
      allContentMerged: _0x3c2f39
    }) {
      return ImportListClass.Utils.getDedupedData({
        'allContentMerged': _0x3c2f39
      });
    }
    ["_getBlocklistFilteredData"]({
      dedupedAllContentMerged: _0x248871
    }) {
      return ImportListClass.Utils.getBlocklistFilteredData({
        'dedupedAllContentMerged': _0x248871
      });
    }
    ["_renderInner_initRunButton"]() {
      this._$btnRun.click(async () => {
        if (!this._list) {
          return;
        }
        const _0x1ecf17 = this._actor ? this._list.items.filter(_0x37c9c6 => _0x37c9c6.data.tglSel && _0x37c9c6.data.tglSel.classList.contains("active")) : this._list.items.filter(_0x550a66 => _0x550a66.data.cbSel.checked);
        if (!_0x1ecf17.length) {
          return ui.notifications.warn("Please select something to import!");
        }
        this.close();
        await this._pImportListItems({
          'listItems': _0x1ecf17
        });
        this._$cbAll.prop("checked", false).change();
      });
    }
    async ["_pImportListItems"]({
      listItems: _0x185cf1,
      isBackground: _0x4082d6
    }) {
      const _0x213222 = _0x185cf1.map(_0x41bbf0 => ({
        'ixClass': _0x41bbf0.data.ixClass,
        'ixSubclass': _0x41bbf0.data.ixSubclass
      }));
      const _0x3515c8 = _0x213222.map(({
        ixClass: _0x5d47bf,
        ixSubclass: _0x48f52a
      }) => {
        const _0x33a0db = MiscUtil.copy(this._content['class'][_0x5d47bf]);
        return {
          'ixClass': _0x5d47bf,
          'cls': _0x33a0db,
          'ixSubclass': _0x48f52a,
          'sc': _0x48f52a != null ? _0x33a0db.subclasses[_0x48f52a] : null
        };
      });
      _0x3515c8.filter(_0x4ce097 => !_0x4ce097.sc).forEach(_0x3700c0 => _0x3700c0.cls.subclasses = []);
      _0x3515c8.sort((_0x240ce0, _0x2d6bed) => !!_0x240ce0.sc - !!_0x2d6bed.sc);
      const _0x17fbdf = [];
      const _0x359c94 = [];
      _0x3515c8.forEach(_0x2a9656 => {
        if (_0x2a9656.sc) {
          const _0x529211 = _0x17fbdf.find(_0x3ef8e1 => _0x3ef8e1.name.toLowerCase() === _0x2a9656.sc.className.toLowerCase() && _0x3ef8e1.source.toLowerCase() === _0x2a9656.sc.classSource.toLowerCase());
          if (_0x529211) {
            _0x529211.subclasses.push(_0x2a9656.sc);
          } else {
            _0x359c94.push({
              'cls': _0x2a9656.cls,
              'sc': _0x2a9656.sc
            });
          }
        } else {
          _0x17fbdf.push(_0x2a9656.cls);
        }
      });
      if (_0x17fbdf.length || _0x359c94.length) {
        await this._pDoPreCachePack();
      }
      await (_0x4082d6 ? this._pImportListItems_background({
        'classes': _0x17fbdf,
        'looseSubclasses': _0x359c94
      }) : this._pImportListItems_foreground({
        'classes': _0x17fbdf,
        'looseSubclasses': _0x359c94
      }));
      this.activateSidebarTab();
      this.renderTargetApplication();
    }
    async ["_pImportListItems_background"]({
      classes: _0x50b192,
      looseSubclasses: _0x238cee
    }) {
      for (const _0xcf6e5c of _0x50b192) {
        try {
          const _0x5f4d2a = await this.pImportClass(_0xcf6e5c);
          if (_0x5f4d2a) {
            _0x5f4d2a.doNotification();
          }
        } catch (_0x1d0253) {
          ImportSummary.failed({
            'entity': _0xcf6e5c
          }).doNotification();
          console.error(_0x1d0253);
        }
      }
      for (const {
        cls: _0x2c06ac,
        sc: _0x477d37
      } of _0x238cee) {
        try {
          const _0x20110e = await this.pImportSubclass(_0x2c06ac, _0x477d37);
          if (_0x20110e) {
            _0x20110e.doNotification();
          }
        } catch (_0x3a4290) {
          ImportSummary.failed({
            'entity': _0x477d37
          }).doNotification();
          console.error(_0x3a4290);
        }
      }
    }
    async ["_pImportListItems_foreground"]({
      classes: _0x51db5a,
      looseSubclasses: _0x7029e5
    }) {
      await new AppTaskRunner({
        'tasks': [..._0x51db5a.map(_0x56f917 => {
          return new TaskClosure({
            'fnGetPromise': async ({
              taskRunner: _0x53cc1c
            }) => this.pImportClass(_0x56f917, {
              'taskRunner': _0x53cc1c
            })
          });
        }), ..._0x7029e5.map(({
          cls: _0x475124,
          sc: _0x35262e
        }) => {
          return new TaskClosure({
            'fnGetPromise': async ({
              taskRunner: _0x342fe9
            }) => this.pImportSubclass(_0x475124, _0x35262e, {
              'taskRunner': _0x342fe9
            })
          });
        })],
        'titleInitial': "Importing...",
        'titleComplete': "Import Complete"
      }).pRun();
    }
    async ["_renderInner_pInitFilteredList"]() {
      this._list = new List({
        '$iptSearch': this._$iptSearch,
        '$wrpList': this._$wrpList,
        'fnSort': (_0x13c5d3, _0x2b782c, _0x559fb3) => {
          if (_0x559fb3.sortDir === "desc" && _0x13c5d3.data.ixClass === _0x2b782c.data.ixClass && (_0x13c5d3.data.ixSubclass != null || _0x2b782c.data.ixSubclass != null)) {
            return _0x13c5d3.data.ixSubclass != null ? -0x1 : 0x1;
          }
          return SortUtil.ascSortLower(_0x13c5d3.values.sortName, _0x2b782c.values.sortName);
        }
      });
      SortUtil.initBtnSortHandlers(this._$wrpBtnsSort, this._list);
      this._listSelectClickHandler = new ListSelectClickHandler({
        'list': this._list
      });
      const _0x55e5b4 = this._cachedData.rows.map(_0x2bb269 => {
        const _0x188e24 = {
          ..._0x2bb269
        };
        delete _0x188e24.subRows;
        if (Config.get('importClass', "isHideSubclassRows")) {
          return [_0x188e24];
        }
        const _0x2b6fcc = _0x2bb269.subRows.map(_0xcace36 => ({
          ..._0xcace36,
          'ixClass': _0x2bb269.ixClass,
          'className': _0x2bb269.name,
          'classSource': _0x2bb269.source,
          'classSourceLong': _0x2bb269.sourceLong,
          'classSourceClassName': _0x2bb269.sourceClassName
        }));
        return [_0x188e24, ..._0x2b6fcc];
      }).flat();
      await this._pageFilter.pInitFilterBox({
        '$iptSearch': this._$iptSearch,
        '$btnReset': this._$btnReset,
        '$btnOpen': this._$bntFilter,
        '$btnToggleSummaryHidden': this._$btnToggleSummary,
        '$wrpMiniPills': this._$wrpMiniPills,
        'namespace': this._getFilterNamespace()
      });
      this._content["class"].forEach(_0x29d8cb => this._pageFilter.addToFilters(_0x29d8cb));
      const _0x29caaf = {
        'fnGetName': _0x292e02 => _0x292e02.name,
        'fnGetValues': _0x845b12 => {
          if (_0x845b12.ixSubclass != null) {
            return {
              'sortName': _0x845b12.className + " SOURCE " + _0x845b12.classSourceLong + " SUBCLASS " + _0x845b12.name + " SOURCE " + _0x845b12.sourceLong,
              'source': _0x845b12.source,
              'hash': UrlUtil.URL_TO_HASH_BUILDER.subclass(_0x845b12)
            };
          }
          return {
            'sortName': _0x845b12.name + " SOURCE " + _0x845b12.sourceLong,
            'source': _0x845b12.source,
            'hash': UrlUtil.URL_TO_HASH_BUILDER[this._page](_0x845b12)
          };
        },
        'fnGetData': (_0x1306b1, _0x4d1cde) => {
          const _0x495a49 = this._actor ? {
            'tglSel': _0x1306b1.ele.firstElementChild.firstElementChild
          } : UtilList2.absorbFnGetData(_0x1306b1);
          if (_0x4d1cde.ixSubclass != null) {
            return {
              ..._0x495a49,
              'ixClass': _0x4d1cde.ixClass,
              'ixSubclass': _0x4d1cde.ixSubclass
            };
          }
          return {
            ..._0x495a49,
            'ixClass': _0x4d1cde.ixClass
          };
        }
      };
      if (this._actor) {
        _0x29caaf.fnBindListeners = _0x13e616 => {
          _0x13e616.ele.addEventListener('click', () => {
            const _0x50befc = _0x13e616.data.ixSubclass != null;
            const _0x81e2a2 = _0x50befc ? this._list.items.find(_0x1e66a8 => _0x1e66a8.data.ixClass === _0x13e616.data.ixClass && _0x1e66a8.data.ixSubclass == null) : null;
            const _0x1d718e = this._list.items.filter(_0x1a76bf => _0x1a76bf.data.tglSel.classList.contains('active'));
            if (!_0x1d718e.length) {
              _0x13e616.data.tglSel.classList.add("active");
              _0x13e616.ele.classList.add("list-multi-selected");
              if (_0x50befc) {
                _0x81e2a2.data.tglSel.classList.add("active");
                _0x81e2a2.ele.classList.add("list-multi-selected");
              }
              return;
            }
            if (_0x13e616.data.tglSel.classList.contains("active")) {
              _0x13e616.data.tglSel.classList.remove('active');
              _0x13e616.ele.classList.remove("list-multi-selected");
              if (_0x50befc) {
                _0x81e2a2.data.tglSel.classList.remove("active");
                _0x81e2a2.ele.classList.remove("list-multi-selected");
              } else {
                _0x1d718e.forEach(_0x19672c => {
                  _0x19672c.data.tglSel.classList.remove("active");
                  _0x19672c.ele.classList.remove("list-multi-selected");
                });
              }
              return;
            }
            _0x1d718e.forEach(_0x839fbf => {
              _0x839fbf.data.tglSel.classList.remove("active");
              _0x839fbf.ele.classList.remove("list-multi-selected");
            });
            _0x13e616.data.tglSel.classList.add("active");
            _0x13e616.ele.classList.add("list-multi-selected");
            if (_0x50befc) {
              _0x81e2a2.data.tglSel.classList.add("active");
              _0x81e2a2.ele.classList.add("list-multi-selected");
            }
          });
        };
      } else {
        _0x29caaf.fnBindListeners = _0x5dbf70 => UtilList2.absorbFnBindListeners(this._listSelectClickHandler, _0x5dbf70);
      }
      this._list.doAbsorbItems(_0x55e5b4, _0x29caaf);
      this._list.init();
      this._pageFilter.trimState();
      this._pageFilter.filterBox.render();
      this._pageFilter.filterBox.on(FilterBox.EVNT_VALCHANGE, this._handleFilterChange.bind(this));
      this._handleFilterChange();
    }
    ['_renderInner_getListSyntax']() {
      return null;
    }
    ["_renderInner_initFeelingLuckyButton"]() {
      if (!this._actor) {
        return super._renderInner_initFeelingLuckyButton();
      }
      this._$btnFeelingLucky.click(() => {
        if (!this._list || !this._list.visibleItems.length) {
          return;
        }
        const _0x4caf75 = RollerUtil.rollOnArray(this._list.visibleItems);
        if (!_0x4caf75) {
          return;
        }
        _0x4caf75.ele.click();
        _0x4caf75.ele.scrollIntoView({
          'block': "center"
        });
      });
    }
    ["_handleFilterChange"]() {
      return ModalFilterClasses.handleFilterChange({
        'pageFilter': this._pageFilter,
        'list': this._list,
        'allData': this._content["class"]
      });
    }
    async ['_pEnsureFilterBoxInit']() {
      if (this._pageFilter.filterBox) {
        return;
      }
      await this._pageFilter.pInitFilterBox({
        'namespace': this._getFilterNamespace()
      });
    }
    async ['_pImportEntry'](_0xe8f46d, _0x538279, _0x17d911) {
      _0x538279 ||= new ImportOpts();
      await this._pEnsureFilterBoxInit();
      let _0x68be5a = null;
      let _0x3c4729 = null;
      if (_0xe8f46d?.["subclassFeatures"]?.["every"](_0xeea410 => _0xeea410 == null || _0xeea410 instanceof Array)) {
        _0x3c4729 = await DataLoader.pCacheAndGet("raw_subclass", _0xe8f46d.source, UrlUtil.URL_TO_HASH_BUILDER.subclass(_0xe8f46d), {
          'isCopy': true
        });
        _0x68be5a = await DataLoader.pCacheAndGet("raw_class", _0x3c4729.classSource, UrlUtil.URL_TO_HASH_BUILDER["class"]({
          'name': _0x3c4729.className,
          'source': _0x3c4729.classSource
        }), {
          'isCopy': true
        });
      }
      if (_0xe8f46d?.["classFeatures"]?.['every'](_0x359a65 => _0x359a65 == null || _0x359a65 instanceof Array)) {
        _0x68be5a = await DataLoader.pCacheAndGet("raw_class", _0xe8f46d.source, UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](_0xe8f46d), {
          'isCopy': true
        });
      }
      if (_0x68be5a || _0x3c4729) {
        const _0x1236e7 = {
          'class': [_0x68be5a]
        };
        if (_0x3c4729) {
          _0x1236e7.subclass = [_0x3c4729];
        }
        const _0x50af96 = await this.constructor.pPostLoad(_0x1236e7);
        _0xe8f46d = _0x50af96["class"][0x0];
        if (_0x3c4729) {
          const _0x4168ab = _0xe8f46d.subclasses[0x0];
          _0xe8f46d.subclasses = [];
          return this._pImportSubclass(_0xe8f46d, _0x4168ab, _0x538279, _0x17d911);
        }
      }
      return this._pImportClass(_0xe8f46d, _0x538279, _0x17d911);
    }
    async ['pImportClass'](_0x1f8df5, _0x53cb15, _0x4a036f) {
      return new ImportEntryManagerClass({
        'instance': this,
        'ent': _0x1f8df5,
        'importOpts': _0x53cb15,
        'dataOpts': _0x4a036f
      }).pImportEntry();
    }
    async ["_pImportClass"](_0x2430a6, _0xaaee18, _0x3262f2) {
      _0xaaee18 ||= new ImportOpts();
      console.log(...LGT, "Importing class \"" + _0x2430a6.name + "\" (from \"" + Parser.sourceJsonToAbv(_0x2430a6.source) + "\")");
      if (DataConverterClass.isStubClass(_0x2430a6)) {
        return ImportSummary.completedStub({
          'entity': _0x2430a6
        });
      }
      if (_0xaaee18.isTemp) {
        return this._pImportClass_pImportToItems(_0x2430a6, _0xaaee18, _0x3262f2);
      }
      if (this._actor) {
        return this._pImportClass_pImportToActor(_0x2430a6, _0xaaee18, _0x3262f2);
      }
      return this._pImportClass_pImportToItems(_0x2430a6, _0xaaee18, _0x3262f2);
    }
    async ["_pImportClass_pImportToActor"](_0x3ab7e2, _0x2168c7, _0x406335) {
      const _0x3ab350 = new ImportListClass.ImportEntryOpts({
        'isClassImport': true,
        'isCharactermancer': _0x2168c7.isCharactermancer
      });
      let _0x354d11;
      if (!_0x3ab7e2._foundryAllFeatures) {
        _0x354d11 = Charactermancer_Class_Util.getAllFeatures(_0x3ab7e2);
        this.constructor._tagFirstSubclassLoaded(_0x3ab7e2, _0x354d11);
        _0x354d11 = Charactermancer_Util.getFilteredFeatures(_0x354d11, this._pageFilter, _0x2168c7.filterValues || this._pageFilter.filterBox.getValues());
      } else {
        this.constructor._tagFirstSubclassLoaded(_0x3ab7e2);
      }
      const _0x10b9ce = _0x3ab7e2.subclasses?.['length'] ? _0x3ab7e2.subclasses[0x0] : null;
      return this._pImportClassSubclass_pImportToActor({
        'cls': _0x3ab7e2,
        'sc': _0x10b9ce,
        'importOpts': _0x2168c7,
        'dataBuilderOpts': _0x3ab350,
        'allFeatures': _0x354d11
      });
    }
    static ["_tagFirstSubclassLoaded"](_0x566bc3, _0x3625e1 = null) {
      let _0x2978a4;
      if (_0x3625e1) {
        const _0x2bcf02 = _0x3625e1.find(_0x56914a => _0x56914a.subclassFeature);
        if (!_0x2bcf02?.["loadeds"]["length"]) {
          return;
        }
        _0x2978a4 = _0x2bcf02.loadeds;
      } else {
        _0x2978a4 = _0x566bc3._foundryAllFeatures.filter(_0x5782e6 => _0x5782e6.type === "subclassFeature");
      }
      if (!_0x2978a4.length) {
        return;
      }
      const _0xc33a4d = _0x566bc3.classFeatures.find(_0x46ed92 => _0x46ed92.gainSubclassFeature)?.['level'];
      if (_0x2978a4[0x0]?.['entity']?.['level'] !== _0xc33a4d) {
        return;
      }
      if (BrewUtil2.hasSourceJson(_0x2978a4[0x0]?.["entity"]?.["source"]) && ["skillProficiencies", "languageProficiencies", "toolProficiencies", "armorProficiencies", "weaponProficiencies", "savingThrowProficiencies", "immune", 'resist', "vulnerable", "conditionImmune", "expertise"].some(_0x375123 => _0x2978a4[0x0].entity[_0x375123])) {
        return;
      }
      _0x2978a4[0x0]._foundryIsIgnoreFeature = true;
    }
    async ["_pImportClassSubclass_pImportToActor"]({
      cls: _0x949550,
      sc: _0x372cec,
      importOpts: _0x331322,
      dataBuilderOpts: _0x127948,
      allFeatures: _0x2c8a81
    }) {
      const _0x87fe8a = await this._pGetSelectedLevelIndices(_0x949550, _0x331322, _0x2c8a81, _0x127948, _0x372cec != null);
      if (_0x127948.isCancelled) {
        return ImportSummary.cancelled();
      }
      await this._pValidateUserLevelIndices(_0x87fe8a, _0x127948);
      if (_0x127948.isCancelled) {
        return ImportSummary.cancelled();
      }
      _0x127948.targetLevel = Math.max(..._0x87fe8a) + 0x1;
      _0x127948.numLevels = _0x127948.targetLevel - Math.min(..._0x87fe8a);
      _0x127948.numLevelsPrev = UtilActors.getTotalClassLevels(this._actor);
      _0x127948.isIncludesLevelOne = _0x949550 != null && _0x87fe8a.includes(0x0);
      const {
        proficiencyImportMode: _0x4d0c3c,
        shouldBeMulticlass: _0x4cbaf2
      } = await this._pImportClass_pGetProficiencyImportMode(_0x949550, _0x127948);
      _0x127948.proficiencyImportMode = _0x4d0c3c;
      _0x127948.shouldBeMulticlass = _0x4cbaf2;
      if (_0x127948.isCancelled) {
        return ImportSummary.cancelled();
      }
      const _0x36103c = await this._pImportClass_pGetHpImportMode(_0x949550, _0x127948);
      if (_0x127948.isCancelled) {
        return ImportSummary.cancelled();
      }
      _0x127948.hpIncreaseMode = _0x36103c.mode;
      _0x127948.hpIncreaseCustomRollFormula = _0x36103c.customFormula;
      const _0x3e451b = {
        'system': {}
      };
      const _0x579410 = await this._pImportEntry_pDoUpdateCharacterHp({
        'actUpdate': _0x3e451b,
        'cls': _0x949550,
        'dataBuilderOpts': _0x127948
      });
      const _0x5a7f3f = await this._pImportEntry_pGetCurLevelFillClassData({
        'actUpdate': _0x3e451b,
        'cls': _0x949550,
        'sc': _0x372cec,
        'importOpts': _0x331322,
        'dataBuilderOpts': _0x127948,
        'hpIncreasePerLevel': _0x579410
      });
      if (_0x127948.isCancelled) {
        return ImportSummary.cancelled();
      }
      const {
        curLevel: _0x5cd3f0,
        existingClassItem: _0x74c7c8,
        existingSubclassItem: _0x69ff8b
      } = _0x5a7f3f;
      this._pImportEntry_setActorFlags(_0x3e451b, _0x949550, _0x372cec, _0x5cd3f0, _0x127948);
      await this._pImportEntry_pDoUpdateCharacter(_0x3e451b, _0x949550, _0x372cec, _0x5cd3f0, _0x74c7c8, _0x69ff8b, _0x127948);
      if (_0x127948.isCancelled) {
        return ImportSummary.cancelled();
      }
      await this._pImportCasterCantrips(_0x949550, _0x372cec, _0x5cd3f0, _0x331322, _0x127948);
      await this._pImportEntry_pFillItemArrayAdditionalSpells(_0x949550, _0x949550.subclasses, _0x5cd3f0, _0x331322, _0x127948);
      if (_0x127948.isCancelled) {
        return ImportSummary.cancelled();
      }
      if (_0x949550.preparedSpells && !_0x949550.spellsKnownProgressionFixed || _0x949550.preparedSpellsProgression && !_0x949550.spellsKnownProgressionFixed) {
        await this._pImportPreparedCasterSpells(_0x949550, _0x372cec, _0x5cd3f0, _0x331322, _0x127948);
      }
      await this._pImportEntry_pAddUpdateClassItem(_0x949550, _0x372cec, _0x331322, _0x127948);
      await this._pImportEntry_pHandleFeatures(_0x949550, _0x372cec, _0x2c8a81, _0x87fe8a, _0x331322, _0x127948);
      if (_0x127948.isCancelled) {
        return ImportSummary.cancelled();
      }
      await this._pImportEntry_pAddUnarmedStrike({
        'importOpts': _0x331322
      });
      await this._pImportEntry_pAddAdvancements(_0x127948);
      await this._pImportEntry_pFinalise(_0x331322, _0x127948);
      if (this._actor.isToken) {
        this._actor.sheet.render();
      }
      return new ImportSummary({
        'status': ConstsTaskRunner.TASK_EXIT_COMPLETE,
        'imported': [new ImportedDocument({
          'name': '' + _0x949550.name + (_0x372cec ? " (" + _0x372cec.name + ')' : ''),
          'actor': this._actor
        })]
      });
    }
    async ["_pGetSelectedLevelIndices"](_0x4b655e, _0x5e5feb, _0x30700a, _0x363008, _0x366226) {
      if (_0x4b655e._foundrySelectedLevelIndices) {
        return _0x4b655e._foundrySelectedLevelIndices;
      }
      if (_0x5e5feb.levels) {
        return _0x5e5feb.levels.map(_0xae2b49 => _0xae2b49 - 0x1).filter(_0x21376f => _0x21376f >= 0x0);
      }
      const _0x130afb = await Charactermancer_Class_LevelSelect.pGetUserInput({
        'features': _0x30700a,
        'isSubclass': _0x366226,
        'maxPreviousLevel': this._pImportEntry_getApproxPreviousMaxLevel(_0x4b655e)
      });
      if (_0x130afb == null) {
        return _0x363008.isCancelled = true;
      }
      return _0x130afb.data;
    }
    ['_pImportEntry_getApproxPreviousMaxLevel'](_0x497d97) {
      const _0x3e8c01 = this._getExistingClassItems(_0x497d97);
      if (!_0x3e8c01.length) {
        return 0x0;
      }
      return Math.max(..._0x3e8c01.map(_0x3d9544 => _0x3d9544.system.levels || 0x0));
    }
    ["_pImportEntry_setActorFlags"](_0x28a667, _0x311627, _0x5e5c99, _0x3591af, _0x516b5c) {
      const _0x398a21 = {
        [SharedConsts.SYSTEM_ID_DND5E]: {}
      };
      if (Object.keys(_0x398a21[SharedConsts.SYSTEM_ID_DND5E]).length) {
        _0x28a667.flags = _0x398a21;
      }
    }
    async ['_pImportClass_pGetProficiencyImportMode'](_0x388024, _0x8f4dae) {
      const _0x2843aa = this._actor.items.filter(_0x13a07d => _0x13a07d.type === 'class');
      if (!_0x8f4dae.isClassImport || !_0x8f4dae.isIncludesLevelOne || !_0x2843aa.length) {
        return {
          'proficiencyImportMode': Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY,
          'shouldBeMulticlass': false
        };
      }
      if (_0x388024._foundryStartingProficiencyMode != null) {
        return {
          'proficiencyImportMode': _0x388024._foundryStartingProficiencyMode,
          'shouldBeMulticlass': _0x388024._foundryStartingProficiencyMode === Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS
        };
      }
      const _0x452319 = UtilDocumentItem.getNameAsIdentifier(_0x388024.name);
      const _0x2bfe31 = _0x2843aa.every(_0x230cb5 => _0x230cb5.system.identifier !== _0x452319);
      const _0x3426b2 = await Charactermancer_Class_ProficiencyImportModeSelect.pGetUserInput();
      if (_0x3426b2 == null) {
        _0x8f4dae.isCancelled = true;
      }
      return {
        'proficiencyImportMode': _0x3426b2?.["data"],
        'shouldBeMulticlass': _0x2bfe31 && _0x3426b2 != null
      };
    }
    async ['_pImportClass_pGetHpImportMode'](_0x2d9254, _0x4335dc) {
      if (!Charactermancer_Class_HpIncreaseModeSelect.isHpAvailable(_0x2d9254)) {
        return {
          'mode': ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__DO_NOT_INCREASE
        };
      }
      if (_0x2d9254._foundryHpIncreaseMode != null || _0x2d9254._foundryHpIncreaseCustomFormula != null) {
        return {
          'mode': _0x2d9254._foundryHpIncreaseMode,
          'customFormula': _0x2d9254._foundryHpIncreaseCustomFormula
        };
      }
      const _0x1acffa = await Charactermancer_Class_HpIncreaseModeSelect.pGetUserInput();
      if (_0x1acffa == null) {
        return _0x4335dc.isCancelled = true;
      }
      if (_0x1acffa === VeCt.SYM_UI_SKIP) {
        return {
          'mode': ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__DO_NOT_INCREASE
        };
      }
      return _0x1acffa.data;
    }
    async ["_pImportClass_pImportToItems"](_0x5a85b7, _0x33db9d, _0x3713dd) {
      const _0xcf2a20 = this._getDuplicateMeta({
        'entity': _0x5a85b7,
        'importOpts': _0x33db9d
      });
      if (_0xcf2a20.isSkip) {
        return new ImportSummary({
          'status': ConstsTaskRunner.TASK_EXIT_SKIPPED_DUPLICATE,
          'imported': [new ImportedDocument({
            'isExisting': true,
            'document': _0xcf2a20.existing
          })]
        });
      }
      const _0x5c6272 = await DataConverterClass.pGetClassItem(_0x5a85b7, {
        'filterValues': _0x33db9d.filterValues || this._pageFilter.filterBox.getValues(),
        ..._0x3713dd,
        'isAddDefaultOwnershipFromConfig': _0x33db9d.isAddDefaultOwnershipFromConfig ?? true,
        'defaultOwnership': _0x33db9d.defaultOwnership,
        'userOwnership': _0x33db9d.userOwnership,
        'pageFilter': this._pageFilter,
        'taskRunner': _0x33db9d.taskRunner
      });
      const _0x45290f = this._getDocumentClass();
      if (_0x33db9d.isTemp) {
        const _0x4322bb = await UtilDocuments.pCreateDocument(Item, _0x5c6272, {
          'isRender': false,
          'isTemporary': true
        });
        const _0x292873 = await (_0x5a85b7.subclasses || []).pSerialAwaitMap(_0x303049 => this.pImportSubclass(_0x5a85b7, _0x303049, _0x33db9d, _0x3713dd));
        return new ImportSummary({
          'status': ConstsTaskRunner.TASK_EXIT_COMPLETE,
          'imported': [_0x4322bb, ..._0x292873].map(_0x5801c3 => new ImportedDocument({
            'document': _0x5801c3,
            'actor': this._actor
          }))
        });
      } else {
        if (this._pack) {
          if (_0xcf2a20.isOverwrite) {
            const _0x35a1f9 = await this._pImportEntry_pDoUpdateExistingPackEntity({
              'entity': _0x5a85b7,
              'duplicateMeta': _0xcf2a20,
              'docData': _0x5c6272,
              'importOpts': _0x33db9d
            });
            const _0x1093f1 = await (_0x5a85b7.subclasses || []).pSerialAwaitMap(_0x5ebb47 => this.pImportSubclass(_0x5a85b7, _0x5ebb47, _0x33db9d, _0x3713dd));
            return new ImportSummary({
              'status': ConstsTaskRunner.TASK_EXIT_COMPLETE_UPDATE_OVERWRITE_DUPLICATE,
              'imported': [_0x35a1f9, ..._0x1093f1].map(_0x11b97c => new ImportedDocument({
                'isExisting': true,
                'document': _0x11b97c,
                'actor': this._actor
              }))
            });
          }
          const _0x1e76ac = new _0x45290f(_0x5c6272);
          await this._pack.importDocument(_0x1e76ac);
          const _0x1493f1 = await (_0x5a85b7.subclasses || []).pSerialAwaitMap(_0x8874bb => this.pImportSubclass(_0x5a85b7, _0x8874bb, _0x33db9d, _0x3713dd));
          await this._pImportEntry_pAddToTargetTableIfRequired([_0x1e76ac], _0xcf2a20, _0x33db9d);
          return new ImportSummary({
            'status': ConstsTaskRunner.TASK_EXIT_COMPLETE,
            'imported': [_0x1e76ac, ..._0x1493f1].map(_0x45a72a => new ImportedDocument({
              'document': _0x45a72a,
              'actor': this._actor
            }))
          });
        }
      }
      return this._pImportClass_pImportToItems_toDirectory({
        'duplicateMeta': _0xcf2a20,
        'cls': _0x5a85b7,
        'clsData': _0x5c6272,
        'importOpts': _0x33db9d
      });
    }
    async ["_pImportClass_pImportToItems_toDirectory"]({
      duplicateMeta: _0x2f846a,
      cls: _0x583068,
      clsData: _0x2e6670,
      importOpts: _0x5b8062
    }) {
      if (_0x2f846a?.["isOverwrite"]) {
        const _0x221647 = await this._pImportEntry_pDoUpdateExistingDirectoryEntity({
          'entity': _0x583068,
          'duplicateMeta': _0x2f846a,
          'docData': _0x2e6670
        });
        const _0x3c0bd4 = await (_0x583068.subclasses || []).pSerialAwaitMap(_0x44b94f => this.pImportSubclass(_0x583068, _0x44b94f, _0x5b8062));
        return new ImportSummary({
          'status': ConstsTaskRunner.TASK_EXIT_COMPLETE_UPDATE_OVERWRITE_DUPLICATE,
          'imported': [_0x221647, ..._0x3c0bd4].map(_0x512ace => new ImportedDocument({
            'isExisting': true,
            'document': _0x512ace,
            'actor': this._actor
          }))
        });
      }
      const _0x58e809 = await this._pImportEntry_pImportToDirectoryGeneric_pGetFolderIdMeta({
        'toImport': _0x583068,
        'importOpts': _0x5b8062
      });
      if (_0x58e809?.["folderId"]) {
        _0x2e6670.folder = _0x58e809.folderId;
      }
      const _0x2d58ba = await UtilDocuments.pCreateDocument(Item, _0x2e6670, {
        'isRender': !_0x5b8062.isBatched
      });
      await game.items.set(_0x2d58ba.id, _0x2d58ba);
      const _0x368ce2 = await (_0x583068.subclasses || []).pSerialAwaitMap(_0x62cae6 => this.pImportSubclass(_0x583068, _0x62cae6, new ImportOpts({
        ..._0x5b8062,
        'folderId': _0x58e809?.["folderId"] || _0x5b8062.folderId
      })));
      return new ImportSummary({
        'status': ConstsTaskRunner.TASK_EXIT_COMPLETE,
        'imported': [_0x2d58ba, ..._0x368ce2].map(_0x1092a8 => new ImportedDocument({
          'document': _0x1092a8,
          'actor': this._actor
        }))
      });
    }
    async ["pImportSubclass"](_0x3efe99, _0x427753, _0x3caeb4, _0x192025) {
      return new ImportEntryManagerSubclass({
        'instance': this,
        'ent': _0x427753,
        'cls': _0x3efe99,
        'importOpts': _0x3caeb4,
        'dataOpts': _0x192025
      }).pImportEntry();
    }
    async ['_pImportSubclass'](_0x2bb26e, _0x113373, _0x49c917, _0x4ea13c) {
      _0x49c917 ||= new ImportOpts();
      console.log(...LGT, "Importing subclass \"" + _0x113373.name + "\" (from \"" + Parser.sourceJsonToAbv(_0x113373.source) + "\")");
      if (DataConverterClass.isStubClass(_0x2bb26e)) {
        return ImportSummary.completedStub();
      }
      if (DataConverterClass.isStubSubclass(_0x113373)) {
        return ImportSummary.completedStub();
      }
      if (_0x49c917.isTemp) {
        return this._pImportSubclass_pImportToItems(_0x2bb26e, _0x113373, _0x49c917, _0x4ea13c);
      }
      if (this._actor) {
        return this._pImportSubclass_pImportToActor(_0x2bb26e, _0x113373, _0x49c917, _0x4ea13c);
      }
      return this._pImportSubclass_pImportToItems(_0x2bb26e, _0x113373, _0x49c917, _0x4ea13c);
    }
    async ["_pImportSubclass_pImportToActor"](_0x22bb41, _0x575dca, _0x5dd6d4, _0x44b052) {
      const _0x382355 = new ImportListClass.ImportEntryOpts({
        'isClassImport': false,
        'isCharactermancer': _0x5dd6d4.isCharactermancer
      });
      const _0x33c48f = this._actor.items.filter(_0x46d6a1 => _0x46d6a1.type === "class");
      if (!_0x33c48f.length) {
        const _0x4bd3fa = await InputUiUtil.pGetUserBoolean({
          'title': "Import Class?",
          'htmlDescription': "You have selected a subclass to import, but have no class levels. Would you like to import the class too?",
          'textYes': "Import Class and Subclass",
          'textNo': "Import Only Subclass"
        });
        if (_0x4bd3fa == null) {
          _0x382355.isCancelled = true;
          return ImportSummary.cancelled();
        }
        if (_0x4bd3fa === true) {
          const _0x100795 = MiscUtil.copy(_0x22bb41);
          _0x100795.subclasses = [_0x575dca];
          return this.pImportClass(_0x100795, _0x5dd6d4);
        }
      }
      let _0x42a82c = MiscUtil.copy(_0x575dca.subclassFeatures);
      this.constructor._tagFirstSubclassLoaded(_0x22bb41, _0x42a82c);
      _0x42a82c = Charactermancer_Util.getFilteredFeatures(_0x42a82c, this._pageFilter, _0x5dd6d4.filterValues || this._pageFilter.filterBox.getValues());
      return this._pImportClassSubclass_pImportToActor({
        'cls': _0x22bb41,
        'sc': _0x575dca,
        'importOpts': _0x5dd6d4,
        'dataBuilderOpts': _0x382355,
        'allFeatures': _0x42a82c
      });
    }
    async ["_pImportSubclass_pImportToItems"](_0x4ef0df, _0x222763, _0x1ea3ec, _0x4782fe = {}) {
      const _0x35a702 = await DataConverterClass.pGetSubclassItem(_0x4ef0df, _0x222763, {
        'filterValues': _0x1ea3ec.filterValues || this._pageFilter.filterBox.getValues(),
        ..._0x4782fe,
        'isAddDefaultOwnershipFromConfig': _0x1ea3ec.isAddDefaultOwnershipFromConfig ?? true,
        'defaultOwnership': _0x1ea3ec.defaultOwnership,
        'userOwnership': _0x1ea3ec.userOwnership,
        'pageFilter': this._pageFilter,
        'taskRunner': _0x1ea3ec.taskRunner
      });
      const _0x3e5a83 = this._getDuplicateMeta({
        'name': _0x35a702.name,
        'sourceIdentifier': UtilDocumentSource.getDocumentSourceIdentifierString({
          'doc': _0x35a702
        }),
        'importOpts': _0x1ea3ec
      });
      if (_0x3e5a83.isSkip) {
        return new ImportSummary({
          'status': ConstsTaskRunner.TASK_EXIT_SKIPPED_DUPLICATE,
          'imported': [new ImportedDocument({
            'isExisting': true,
            'document': _0x3e5a83.existing
          })]
        });
      }
      const _0x3563de = this._getDocumentClass();
      if (_0x1ea3ec.isTemp) {
        const _0x2651be = await UtilDocuments.pCreateDocument(Item, _0x35a702, {
          'isRender': false,
          'isTemporary': true
        });
        return new ImportSummary({
          'status': ConstsTaskRunner.TASK_EXIT_COMPLETE,
          'imported': [new ImportedDocument({
            'document': _0x2651be
          })]
        });
      } else {
        if (this._pack) {
          if (_0x3e5a83.isOverwrite) {
            return this._pImportEntry_pDoUpdateExistingPackEntity({
              'entity': _0x222763,
              'duplicateMeta': _0x3e5a83,
              'docData': _0x35a702,
              'importOpts': _0x1ea3ec
            });
          }
          const _0x4202ef = new _0x3563de(_0x35a702);
          await this._pack.importDocument(_0x4202ef);
          await this._pImportEntry_pAddToTargetTableIfRequired([_0x4202ef], _0x3e5a83, _0x1ea3ec);
          return new ImportSummary({
            'status': ConstsTaskRunner.TASK_EXIT_COMPLETE,
            'imported': [new ImportedDocument({
              'document': _0x4202ef
            })]
          });
        }
      }
      return this._pImportEntry_pImportToDirectoryGeneric_toDirectory({
        'duplicateMeta': _0x3e5a83,
        'docData': _0x35a702,
        'toImport': _0x222763,
        'Clazz': _0x3563de,
        'importOpts': _0x1ea3ec
      });
    }
    async ["_pImportEntry_pDoUpdateCharacter"](_0x25536a, _0x5116cc, _0x554ae1, _0x5967d9, _0x4c587b, _0x19cac9, _0x1cc410) {
      const _0x48b9a0 = this._actor.items.filter(_0xf32373 => _0xf32373.type === 'class').filter(_0x649f8d => _0x649f8d !== _0x4c587b);
      const _0xe87441 = this._actor.items.filter(_0x1099ee => _0x1099ee.type === "subclass").filter(_0x2ce2d2 => _0x2ce2d2 !== _0x19cac9);
      await this._pImportEntry_pDoUpdateCharacter_xp({
        'actUpdate': _0x25536a,
        'dataBuilderOpts': _0x1cc410,
        'otherExistingClassItems': _0x48b9a0
      });
      await this._pImportEntry_pDoUpdateCharacter_profBonus({
        'actUpdate': _0x25536a,
        'dataBuilderOpts': _0x1cc410
      });
      await this._pImportEntry_pDoUpdateCharacter_spellcasting({
        'actUpdate': _0x25536a,
        'cls': _0x5116cc,
        'sc': _0x554ae1,
        'dataBuilderOpts': _0x1cc410,
        'otherExistingClassItems': _0x48b9a0,
        'otherExistingSubclassItems': _0xe87441
      });
      await this._pImportEntry_pDoUpdateCharacter_psionics({
        'actUpdate': _0x25536a,
        'cls': _0x5116cc,
        'sc': _0x554ae1,
        'dataBuilderOpts': _0x1cc410,
        'otherExistingClassItems': _0x48b9a0,
        'otherExistingSubclassItems': _0xe87441
      });
      await this._pImportEntry_pDoUpdateCharacter_languages({
        'actUpdate': _0x25536a,
        'cls': _0x5116cc,
        'dataBuilderOpts': _0x1cc410
      });
      if (_0x1cc410.isCancelled) {
        return;
      }
      if (Object.keys(_0x25536a.system).length) {
        await UtilDocuments.pUpdateDocument(this._actor, _0x25536a);
      }
    }
    async ["_pImportEntry_pDoUpdateCharacter_xp"]({
      actUpdate: _0x4739e5,
      dataBuilderOpts: _0x1d17fd,
      otherExistingClassItems: _0x10bf24
    }) {
      if (Config.get("importClass", "isSetXp")) {
        return;
      }
      const _0x332150 = _0x10bf24.map(_0x411e6e => _0x411e6e.system.levels || 0x0).reduce((_0x573201, _0x1479ef) => _0x573201 + _0x1479ef, 0x0) + (_0x1d17fd.targetLevel || 0x0);
      if (_0x332150 <= 0x0) {
        return;
      }
      const _0x4fa838 = (_0x4739e5.system.details = _0x4739e5.system.details || {}).xp = _0x4739e5.system.details.xp || {};
      const _0x198840 = MiscUtil.get(this._actor, "system", 'details', 'xp', "value") || 0x0;
      const _0x205c58 = Parser.LEVEL_XP_REQUIRED[_0x332150 - 0x1];
      const _0x56691f = Parser.LEVEL_XP_REQUIRED[Math.min(_0x332150, 0x13)];
      if (_0x198840 < _0x205c58) {
        _0x4fa838.pct = 0x0;
        _0x4fa838.value = _0x205c58;
      } else {
        _0x4fa838.pct = _0x198840 / _0x56691f * 0x64;
      }
      _0x4fa838.max = _0x56691f;
    }
    async ["_pImportEntry_pDoUpdateCharacter_profBonus"]({
      actUpdate: _0x20d6ca,
      dataBuilderOpts: _0x45c57c
    }) {
      const _0x2901aa = MiscUtil.get(this._actor, 'system', 'attributes', "prof");
      const _0x2f7ab7 = Math.floor((_0x45c57c.targetLevel - 0x1) / 0x4) + 0x2;
      if (_0x2901aa < _0x2f7ab7) {
        (_0x20d6ca.system.attributes = _0x20d6ca.system.attributes || {}).prof = _0x2f7ab7;
      }
    }
    async ["_pImportEntry_pDoUpdateCharacter_spellcasting"]({
      actUpdate: _0x10c6c4,
      cls: _0x4e1f36,
      sc: _0x4535f0,
      dataBuilderOpts: _0x2f627f,
      otherExistingClassItems: _0x233b5d,
      otherExistingSubclassItems: _0x17ff39
    }) {
      const _0x1fab20 = Charactermancer_Class_Util.getCasterProgression(_0x4e1f36, _0x4535f0, {
        'targetLevel': _0x2f627f.targetLevel,
        'otherExistingClassItems': _0x233b5d,
        'otherExistingSubclassItems': _0x17ff39
      });
      const _0x37cb0b = this._pImportEntry_pDoUpdateCharacter_spellcasting_slots({
        'actUpdate': _0x10c6c4,
        'dataBuilderOpts': _0x2f627f,
        'progressionMeta': _0x1fab20
      });
      if (!_0x37cb0b) {
        delete _0x10c6c4.data?.["spells"];
        delete _0x2f627f.postItemActorUpdate?.["data"]?.["spells"];
      }
      const {
        spellAbility: _0x2b4128,
        totalSpellcastingLevels: _0x366a7b
      } = _0x1fab20;
      if (_0x2b4128) {
        (_0x10c6c4.system.attributes = _0x10c6c4.system.attributes || {}).spellcasting = _0x2b4128;
      }
      await this._pImportEntry_pDoUpdateCharacter_spellcasting_spellPoints({
        'actUpdate': _0x10c6c4,
        'totalSpellcastingLevels': _0x366a7b
      });
    }
    ["_pImportEntry_pDoUpdateCharacter_spellcasting_slots"]({
      actUpdate: _0x58e6f3,
      dataBuilderOpts: _0x4db1ea,
      progressionMeta: _0x4db7ff
    }) {
      const {
        casterProgression: _0x55dec3,
        totalSpellcastingLevels: _0x543e96,
        maxPactCasterLevel: _0x52ba63
      } = _0x4db7ff;
      if (!_0x543e96 && _0x55dec3 !== 'pact') {
        return;
      }
      let _0x121b8e = false;
      _0x58e6f3.system.spells = _0x58e6f3.system.spells || {};
      const _0x1bc732 = MiscUtil.getOrSet(_0x4db1ea.postItemActorUpdate, 'system', "spells", {});
      if (_0x543e96) {
        const _0x29bdcd = UtilDataConverter.CASTER_TYPE_TO_PROGRESSION.full;
        let _0x7b06be = _0x29bdcd[_0x543e96 - 0x1] || _0x29bdcd.last();
        _0x7b06be.forEach((_0x5411ef, _0x4392a6) => {
          if (_0x5411ef === 0x0) {
            return;
          }
          const _0x413fce = 'spell' + (_0x4392a6 + 0x1);
          const _0x2f84ef = MiscUtil.get(this._actor, "system", 'spells', _0x413fce, "max");
          const _0x32e1c8 = MiscUtil.get(this._actor, "system", "spells", _0x413fce, "value");
          if (_0x2f84ef != null) {
            if (_0x2f84ef < _0x5411ef) {
              _0x121b8e = true;
              const _0x1a180f = _0x5411ef - _0x2f84ef;
              _0x58e6f3.system.spells[_0x413fce] = {
                'max': _0x5411ef,
                'value': _0x32e1c8 + _0x1a180f
              };
              _0x1bc732[_0x413fce] = {
                'max': _0x5411ef,
                'value': _0x32e1c8 + _0x1a180f
              };
            }
          } else {
            _0x121b8e = true;
            _0x58e6f3.system.spells[_0x413fce] = {
              'max': _0x5411ef,
              'value': _0x5411ef
            };
            _0x1bc732[_0x413fce] = {
              'max': _0x5411ef,
              'value': _0x5411ef
            };
          }
        });
        return _0x121b8e;
      }
      if (_0x55dec3 === "pact") {
        const _0x54fc31 = MiscUtil.get(this._actor, "system", "spells", "pact", 'max');
        const _0x3ecb44 = MiscUtil.get(this._actor, "system", "spells", "pact", "value");
        const _0x56ca59 = UtilDataConverter.CASTER_TYPE_TO_PROGRESSION.pact[_0x52ba63 - 0x1].find(Boolean);
        if (_0x54fc31 != null) {
          if (_0x54fc31 < _0x56ca59) {
            _0x121b8e = true;
            const _0x355a0b = _0x56ca59 - _0x54fc31;
            _0x58e6f3.system.spells.pact = {
              'max': _0x56ca59,
              'value': _0x3ecb44 + _0x355a0b
            };
            _0x1bc732.pact = {
              'max': _0x56ca59,
              'value': _0x3ecb44 + _0x355a0b
            };
          }
        } else {
          _0x121b8e = true;
          _0x58e6f3.system.spells.pact = {
            'max': _0x56ca59,
            'value': _0x56ca59
          };
          _0x1bc732.pact = {
            'max': _0x56ca59,
            'value': _0x56ca59
          };
        }
        return _0x121b8e;
      }
      return false;
    }
    async ["_pImportEntry_pDoUpdateCharacter_spellcasting_spellPoints"]({
      actUpdate: _0x556447,
      totalSpellcastingLevels: _0x4d0bea
    }) {
      if (!_0x4d0bea || Config.get('importSpell', Config.getSpellPointsKey({
        'actorType': this._actor?.["type"]
      })) === ConfigConsts.C_SPELL_POINTS_MODE__DISABLED) {
        return;
      }
      return Config.get("importSpell", "spellPointsResource") === ConfigConsts.C_SPELL_POINTS_RESOURCE__SHEET_ITEM ? UtilActors.pGetCreateActorSpellPointsItem({
        'actor': this._actor,
        'totalSpellcastingLevels': _0x4d0bea
      }) : this._pImportEntry_pDoUpdateCharacter_spellcasting_spellPsiPoints_resource({
        'actUpdate': _0x556447,
        'amount': UtilDataConverter.getSpellPointTotal({
          'totalSpellcastingLevels': _0x4d0bea
        }),
        'label': "Spell Points",
        'resource': Config.getSpellPointsResource()
      });
    }
    async ["_pImportEntry_pDoUpdateCharacter_spellcasting_spellPsiPoints_resource"]({
      actUpdate: _0x109d12,
      amount: _0x21ffa3,
      label: _0x56ffc2,
      resource: _0x294ff5
    }) {
      const _0x368adf = (_0x294ff5 || '').trim().split('.');
      if (!_0x368adf.length) {
        const _0x6f84f0 = "Could not update " + _0x56ffc2 + " total—resource \"" + _0x294ff5 + "\" was not valid!";
        console.warn(...LGT, _0x6f84f0);
        ui.notifications.warn(_0x6f84f0);
        return;
      }
      const _0x5d1b75 = [..._0x368adf, 'value'];
      const _0x583452 = [..._0x368adf, "max"];
      const _0x121090 = this._actor.system._source || this._actor.system;
      const _0x4729b2 = MiscUtil.get(_0x121090, "system", ..._0x5d1b75) || 0x0;
      const _0xf1a977 = MiscUtil.get(_0x121090, 'system', ..._0x583452) || 0x0;
      if (_0x21ffa3 > _0xf1a977) {
        const _0x1bed67 = _0x21ffa3 - _0xf1a977;
        MiscUtil.set(_0x109d12, 'system', ..._0x5d1b75, _0x4729b2 + _0x1bed67);
        MiscUtil.set(_0x109d12, "system", ..._0x583452, _0x21ffa3);
        const _0x295202 = [..._0x368adf, "label"];
        if (!MiscUtil.get(_0x121090, "system", ..._0x295202)) {
          MiscUtil.set(_0x109d12, 'system', ..._0x295202, _0x56ffc2);
        }
      }
    }
    async ["_pImportEntry_pDoUpdateCharacter_psionics"]({
      actUpdate: _0x122c55,
      cls: _0x2d963a,
      sc: _0x492a69,
      dataBuilderOpts: _0x441fbd,
      otherExistingClassItems: _0x1005ad,
      otherExistingSubclassItems: _0x4adab6
    }) {
      const {
        totalMysticLevels: _0x28b9c8
      } = Charactermancer_Class_Util.getMysticProgression({
        'cls': _0x2d963a,
        'targetLevel': _0x441fbd.targetLevel,
        'otherExistingClassItems': _0x1005ad,
        'otherExistingSubclassItems': _0x4adab6
      });
      await this._pImportEntry_pDoUpdateCharacter_psionics_psiPoints({
        'actUpdate': _0x122c55,
        'totalMysticLevels': _0x28b9c8
      });
    }
    async ["_pImportEntry_pDoUpdateCharacter_psionics_psiPoints"]({
      actUpdate: _0x17274e,
      totalMysticLevels: _0x19cfca
    }) {
      if (!_0x19cfca) {
        return;
      }
      return Config.get("importPsionic", 'psiPointsResource') === ConfigConsts.C_SPELL_POINTS_RESOURCE__SHEET_ITEM ? UtilActors.pGetCreateActorPsiPointsItem({
        'actor': this._actor,
        'totalMysticLevels': _0x19cfca
      }) : this._pImportEntry_pDoUpdateCharacter_spellcasting_spellPsiPoints_resource({
        'actUpdate': _0x17274e,
        'amount': UtilDataConverter.getPsiPointTotal({
          'totalMysticLevels': _0x19cfca
        }),
        'label': "Psi Points",
        'resource': Config.getPsiPointsResource()
      });
    }
    async ["_pImportEntry_pDoUpdateCharacterHp"]({
      actUpdate: _0x372fd9,
      cls: _0x563c01,
      dataBuilderOpts: _0x11e4a1
    }) {
      if (!_0x11e4a1.isClassImport || !Charactermancer_Class_HpIncreaseModeSelect.isHpAvailable(_0x563c01)) {
        return;
      }
      const _0x4cc8d3 = Parser.getAbilityModNumber(Charactermancer_Util.getCurrentAbilityScores(this._actor).con);
      const _0xd4d7b3 = _0x11e4a1.isIncludesLevelOne && _0x11e4a1.proficiencyImportMode !== Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS;
      let _0x57c6fb = _0xd4d7b3 ? _0x563c01.hd.number * _0x563c01.hd.faces + _0x4cc8d3 : 0x0;
      const _0x57c448 = _0xd4d7b3 ? _0x11e4a1.numLevels - 0x1 : _0x11e4a1.numLevels;
      let _0x1e3fbe = null;
      if (_0xd4d7b3) {
        _0x1e3fbe = {
          '1': 'max'
        };
      }
      switch (_0x11e4a1.hpIncreaseMode) {
        case ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__TAKE_AVERAGE:
          {
            const _0x184c62 = Math.ceil(_0x563c01.hd.number * ((_0x563c01.hd.faces + 0x1) / 0x2));
            _0x57c6fb += _0x57c448 * Math.max(_0x184c62 + _0x4cc8d3, 0x1);
            _0x1e3fbe = _0x1e3fbe || {};
            for (let _0x1486b9 = _0x11e4a1.currentLevelThisClass + (_0xd4d7b3 ? 0x2 : 0x1); _0x1486b9 <= _0x11e4a1.targetLevelThisClass; ++_0x1486b9) {
              _0x1e3fbe['' + _0x1486b9] = 'avg';
            }
            break;
          }
        case ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__MIN:
        case ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__MAX:
          {
            const _0x597af2 = _0x11e4a1.hpIncreaseMode === ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__MIN ? _0x563c01.hd.number : _0x563c01.hd.number * _0x563c01.hd.faces;
            _0x57c6fb += _0x57c448 * Math.max(_0x597af2 + _0x4cc8d3, 0x1);
            _0x1e3fbe = _0x1e3fbe || {};
            for (let _0x53ceaf = _0x11e4a1.currentLevelThisClass + (_0xd4d7b3 ? 0x2 : 0x1); _0x53ceaf <= _0x11e4a1.targetLevelThisClass; ++_0x53ceaf) {
              _0x1e3fbe['' + _0x53ceaf] = _0x597af2;
            }
            break;
          }
        case ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__ROLL:
        case ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__ROLL_CUSTOM:
          {
            const _0x23f170 = _0x11e4a1.hpIncreaseMode === ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__ROLL ? _0x563c01.hd.number + 'd' + _0x563c01.hd.faces + " + " + _0x4cc8d3 : (_0x11e4a1.hpIncreaseCustomRollFormula || '0') + " + " + _0x4cc8d3;
            const _0x101ab8 = UtilDice.getReplacedCustomAttributes_class(_0x23f170, {
              'cls': _0x563c01
            });
            const _0x203531 = this._actor.getRollData();
            try {
              const _0x2b837a = new Roll(_0x101ab8, _0x203531);
              await _0x2b837a.evaluate({
                'async': true
              });
            } catch (_0x1f6e8d) {
              _0x57c6fb = 0x0;
              _0x1e3fbe = null;
              ui.notifications.error("Failed to evaluate HP increase formula \"" + _0x101ab8 + "\" (\"" + _0x23f170 + "\")! " + VeCt.STR_SEE_CONSOLE);
              setTimeout(() => {
                throw _0x1f6e8d;
              });
              break;
            }
            _0x1e3fbe = _0x1e3fbe || {};
            try {
              for (let _0x41a72a = _0x11e4a1.currentLevelThisClass + (_0xd4d7b3 ? 0x2 : 0x1); _0x41a72a <= _0x11e4a1.targetLevelThisClass; ++_0x41a72a) {
                const _0x1edb84 = new Roll(_0x101ab8, _0x203531);
                await _0x1edb84.evaluate({
                  'async': true
                });
                const _0x5cecf2 = Math.max(_0x1edb84.total, 0x1);
                _0x57c6fb += _0x5cecf2;
                await _0x1edb84.toMessage({
                  'flavor': "HP Increase (Level " + _0x41a72a + ')',
                  'sound': null,
                  'speaker': {
                    'actor': this._actor.id,
                    'alias': this._actor.name,
                    'scene': null,
                    'token': null
                  }
                });
                _0x1e3fbe['' + _0x41a72a] = _0x5cecf2 - _0x4cc8d3;
              }
            } catch (_0x70f67) {
              _0x57c6fb = 0x0;
              _0x1e3fbe = null;
              ui.notifications.error("Failed to evaluate HP increase formula \"" + _0x101ab8 + "\" (\"" + _0x23f170 + "\")! " + VeCt.STR_SEE_CONSOLE);
              setTimeout(() => {
                throw _0x70f67;
              });
            }
            break;
          }
        case ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__DO_NOT_INCREASE:
          {
            _0x57c6fb = 0x0;
            _0x1e3fbe = null;
            break;
          }
        default:
          throw new Error("Unhandled Hit Points increase mode \"" + _0x11e4a1.hpIncreaseMode + "\"");
      }
      if (_0x57c6fb) {
        const {
          value: _0x1be404,
          max: _0x99e62
        } = Charactermancer_Util.getBaseHp(this._actor);
        switch (_0x11e4a1.proficiencyImportMode) {
          case Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS:
            {
              const _0x180c73 = _0x1be404 + _0x57c6fb;
              const _0x13d914 = _0x99e62 == null ? null : _0x99e62 + _0x57c6fb;
              const _0x20e2a8 = UtilActors.isSetMaxHp({
                'actor': this._actor
              }) || _0x11e4a1.hpIncreaseMode !== ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__TAKE_AVERAGE || !_0x11e4a1.shouldBeMulticlass;
              MiscUtil.set(_0x372fd9, 'system', 'attributes', 'hp', "value", _0x180c73);
              if (_0x20e2a8) {
                MiscUtil.set(_0x372fd9, "system", "attributes", 'hp', 'max', _0x13d914);
              }
              break;
            }
          case Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY:
            {
              const _0x1a5a73 = (_0xd4d7b3 ? 0x0 : _0x1be404) + _0x57c6fb;
              const _0x1ab53f = _0x99e62 == null ? null : (_0xd4d7b3 ? 0x0 : _0x99e62) + _0x57c6fb;
              const _0x47c2cb = UtilActors.isSetMaxHp({
                'actor': this._actor
              }) || _0x11e4a1.hpIncreaseMode !== ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__TAKE_AVERAGE || _0x11e4a1.shouldBeMulticlass;
              MiscUtil.set(_0x372fd9, "system", "attributes", 'hp', "value", _0x1a5a73);
              if (_0x47c2cb) {
                MiscUtil.set(_0x372fd9, "system", "attributes", 'hp', "max", _0x1ab53f);
              }
              break;
            }
          case Charactermancer_Class_ProficiencyImportModeSelect.MODE_NONE:
            break;
          default:
            throw new Error("Unknown proficiency import mode \"" + _0x11e4a1.proficiencyImportMode + "\"");
        }
      }
      return _0x1e3fbe;
    }
    async ['_pImportEntry_pDoUpdateCharacter_languages']({
      actUpdate: _0x4e227e,
      cls: _0x228b0e,
      dataBuilderOpts: _0x2650ad
    }) {
      await DataConverter.pFillActorLanguageData(MiscUtil.get(this._actor, '_source', "system", "traits", "languages"), _0x228b0e.languageProficiencies, _0x4e227e.system, _0x2650ad);
    }
    async ['_pImportEntry_pDoUpdateCharacter_pPopulateLevelOneProficienciesAndEquipment'](_0x419193, _0x35f946, _0x4a7a16, _0x28132) {
      const _0x37b492 = {
        'chosenProficiencies': {}
      };
      _0x37b492.chosenProficiencies = await this._pImportEntry_pDoUpdateCharacter_pPopulateProficienciesFrom(_0x419193, _0x35f946.startingProficiencies, _0x35f946.proficiency, Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY, _0x28132);
      if (_0x28132.isCancelled) {
        return;
      }
      await this._pImportEntry_pDoUpdateCharacter_pPopulateEquipment(_0x35f946, _0x28132);
      if (_0x28132.isCancelled) {
        return;
      }
      return _0x37b492;
    }
    async ['_pImportEntry_pDoUpdateCharacter_pPopulateProficienciesFrom'](_0x394412, _0xeb22a, _0x154b68, _0x5be064, _0x9352d9) {
      const _0x204551 = {
        'skills': {}
      };
      if (_0xeb22a?.["skills"]) {
        const _0x7b1f57 = await DataConverter.pFillActorSkillData(MiscUtil.get(this._actor, "_source", 'system', 'skills'), _0xeb22a.skills, _0x394412.system, _0x9352d9);
        if (_0x9352d9.isCancelled) {
          return _0x204551;
        }
        _0x204551.skills = _0x7b1f57;
      }
      const _0x3a4ffa = Charactermancer_Class_Util.getToolProficiencyData(_0xeb22a);
      if (_0x3a4ffa?.["length"]) {
        await DataConverter.pFillActorToolData(MiscUtil.get(this._actor, "_source", "system", "tools"), _0x3a4ffa, _0x394412.system, _0x9352d9);
        if (_0x9352d9.isCancelled) {
          return _0x204551;
        }
      }
      const _0x4f5cb6 = await Charactermancer_Class_StartingProficiencies.pGetUserInput({
        'mode': _0x5be064,
        'primaryProficiencies': _0x5be064 === Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY ? _0xeb22a : null,
        'multiclassProficiencies': _0x5be064 === Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS ? _0xeb22a : null,
        'savingThrowsProficiencies': _0x154b68,
        'existingProficienciesFvttArmor': MiscUtil.get(this._actor, "_source", 'system', 'traits', "armorProf"),
        'existingProficienciesFvttWeapons': MiscUtil.get(this._actor, "_source", "system", "traits", 'weaponProf'),
        'existingProficienciesFvttSavingThrows': Charactermancer_Class_StartingProficiencies.getExistingProficienciesFvttSavingThrows(this._actor)
      });
      if (_0x4f5cb6 == null) {
        return _0x9352d9.isCancelled = true;
      }
      if (_0x4f5cb6 === VeCt.SYM_UI_SKIP) {
        return;
      }
      Charactermancer_Class_StartingProficiencies.applyFormDataToActorUpdate(_0x394412, _0x4f5cb6);
      return _0x204551;
    }
    async ["_pImportEntry_pDoUpdateCharacter_pPopulateMulticlassProficiencies"](_0x33360e, _0x430d83, _0x357f92, _0x466ac0) {
      const _0x355bd5 = {
        'chosenProficiencies': {}
      };
      if (_0x430d83.multiclassing && _0x430d83.multiclassing.proficienciesGained) {
        _0x355bd5.chosenProficiencies = await this._pImportEntry_pDoUpdateCharacter_pPopulateProficienciesFrom(_0x33360e, _0x430d83.multiclassing.proficienciesGained, null, Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS, _0x466ac0);
        if (_0x466ac0.isCancelled) {
          return;
        }
      }
      return _0x355bd5;
    }
    ["_getExistingClassItems"](_0x45b5f5) {
      return Charactermancer_Class_Util.getExistingClassItems(this._actor, _0x45b5f5);
    }
    ['_getExistingSubclassItems'](_0x44b177, _0x3507f9) {
      return Charactermancer_Class_Util.getExistingSubclassItems(this._actor, _0x44b177, _0x3507f9);
    }
    static ["_CurLevelMeta"] = class {
      constructor({
        curLevel = 0x0,
        existingCLassItem = null,
        existingSubclassItem = null
      } = {}) {
        this.curLevel = curLevel;
        this.existingClassItem = existingCLassItem;
        this.existingSubclassItem = existingSubclassItem;
      }
    };
    async ["_pImportEntry_pGetCurLevelFillClassData"]({
      actUpdate: _0x2e149,
      cls: _0x1ec2d5,
      sc: _0x1c513b,
      importOpts: _0x3370af,
      dataBuilderOpts: _0x3fdbe0,
      hpIncreasePerLevel: _0x2f7e46
    }) {
      const _0x2ec03b = new this.constructor._CurLevelMeta();
      const _0x45e7ff = await this._pGetProficiencyMeta({
        'actUpdate': _0x2e149,
        'cls': _0x1ec2d5,
        'sc': _0x1c513b,
        'dataBuilderOpts': _0x3fdbe0
      });
      if (_0x3fdbe0.isCancelled) {
        return;
      }
      const {
        existingClassItem: _0x4ac4b3,
        existingSubclassItem: _0x5a0beb
      } = await this._pImportEntry_pGetUserExistingClassSubclassItem({
        'cls': _0x1ec2d5,
        'sc': _0x1c513b,
        'dataBuilderOpts': _0x3fdbe0
      });
      if (_0x3fdbe0.isCancelled) {
        return;
      }
      _0x3fdbe0.classItem = _0x4ac4b3;
      _0x3fdbe0.subclassItem = _0x5a0beb;
      _0x2ec03b.existingClassItem = _0x4ac4b3;
      _0x2ec03b.existingSubclassItem = _0x5a0beb;
      await this._pImportEntry_pFillClassData({
        'cls': _0x1ec2d5,
        'sc': _0x1c513b,
        'proficiencyMeta': _0x45e7ff,
        'outCurLevelMeta': _0x2ec03b,
        'importOpts': _0x3370af,
        'dataBuilderOpts': _0x3fdbe0,
        'hpIncreasePerLevel': _0x2f7e46
      });
      await this._pImportEntry_pFillSubclassData({
        'cls': _0x1ec2d5,
        'sc': _0x1c513b,
        'proficiencyMeta': _0x45e7ff,
        'outCurLevelMeta': _0x2ec03b,
        'importOpts': _0x3370af,
        'dataBuilderOpts': _0x3fdbe0
      });
      return _0x2ec03b;
    }
    async ["_pGetProficiencyMeta"]({
      actUpdate: _0x3b23e2,
      cls: _0x4edc9f,
      sc: _0x4e2e47,
      dataBuilderOpts: _0xe8917a
    }) {
      if (!_0xe8917a.isClassImport || !_0xe8917a.isIncludesLevelOne) {
        return {};
      }
      switch (_0xe8917a.proficiencyImportMode) {
        case Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS:
          {
            return this._pImportEntry_pDoUpdateCharacter_pPopulateMulticlassProficiencies(_0x3b23e2, _0x4edc9f, _0x4e2e47, _0xe8917a);
          }
        case Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY:
          {
            return this._pImportEntry_pDoUpdateCharacter_pPopulateLevelOneProficienciesAndEquipment(_0x3b23e2, _0x4edc9f, _0x4e2e47, _0xe8917a);
          }
        case Charactermancer_Class_ProficiencyImportModeSelect.MODE_NONE:
          {
            return {};
          }
        default:
          throw new Error("Unknown proficiency import mode \"" + _0xe8917a.proficiencyImportMode + "\"");
      }
    }
    async ["_pImportEntry_pGetUserExistingClassSubclassItem"]({
      cls: _0x5e51e3,
      sc: _0x4b705a,
      dataBuilderOpts: _0x547ccd
    }) {
      const _0x3b60b2 = this._getExistingClassItems(_0x5e51e3);
      const _0xe76cb2 = this._getExistingSubclassItems(_0x5e51e3, _0x4b705a);
      if (!_0x3b60b2.length && !_0xe76cb2.length) {
        return {};
      }
      const _0x32f9e2 = _0x5e51e3 && _0x3b60b2.length > 0x1;
      const _0x5b28eb = _0x4b705a && _0xe76cb2.length > 0x1;
      if (_0x32f9e2 && _0x5b28eb) {
        const [_0x108e5f, _0x27a57d] = await this._pGetUserClassSubclassItems({
          'cls': _0x5e51e3,
          'sc': _0x4b705a,
          'existingClassItems': _0x3b60b2,
          'existingSubclassItems': _0xe76cb2
        });
        if (!_0x108e5f) {
          _0x547ccd.isCancelled = true;
          return {};
        }
        return _0x27a57d;
      }
      if (_0x32f9e2) {
        return {
          'existingClassItem': await this._pGetUserClassSubclassItem({
            'dataBuilderOpts': _0x547ccd,
            'clsOrSc': _0x5e51e3,
            'existingItems': _0x3b60b2,
            'nameUnnamed': "(Unnamed Class)"
          }),
          'existingSubclassItem': _0xe76cb2[0x0]
        };
      }
      if (_0x5b28eb) {
        return {
          'existingClassItem': _0x3b60b2[0x0],
          'existingSubclassItem': await this._pGetUserClassSubclassItem({
            'dataBuilderOpts': _0x547ccd,
            'clsOrSc': _0x4b705a,
            'existingItems': _0xe76cb2,
            'nameUnnamed': "(Unnamed Subclass)"
          })
        };
      }
      return {
        'existingClassItem': _0x3b60b2[0x0],
        'existingSubclassItem': _0xe76cb2[0x0]
      };
    }
    async ['_pImportEntry_pFillClassData']({
      cls: _0x5c96ca,
      sc: _0x18049d,
      proficiencyMeta: _0x3eae9d,
      outCurLevelMeta: _0x2c1348,
      importOpts: _0x51291a,
      dataBuilderOpts: _0x4820c9,
      hpIncreasePerLevel: _0x322f9f
    }) {
      const {
        existingClassItem: _0x1f36da
      } = _0x2c1348;
      const _0x1fb10f = await DataConverterClass.pGetClassItem(_0x5c96ca, {
        'sc': _0x18049d,
        'filterValues': _0x51291a.filterValues || this._pageFilter.filterBox.getValues(),
        'startingSkills': _0x3eae9d.chosenProficiencies && _0x3eae9d.chosenProficiencies.skills ? Object.keys(_0x3eae9d.chosenProficiencies.skills) : [],
        'proficiencyImportMode': _0x4820c9.proficiencyImportMode,
        'level': _0x4820c9.targetLevel,
        'isClsDereferenced': true,
        'actor': this._actor,
        'spellSlotLevelSelection': _0x51291a.spellSlotLevelSelection,
        'hpAdvancementValue': this._pImportEntry_pFillClassData_getHpAdvancementValue({
          'dataBuilderOpts': _0x4820c9,
          'hpIncreasePerLevel': _0x322f9f
        }),
        'taskRunner': _0x51291a.taskRunner
      });
      if (_0x1f36da) {
        let _0x2424b9 = false;
        const _0x59b68c = {
          '_id': _0x1f36da.id
        };
        const _0x4eaad8 = _0x1fb10f.system.description.value;
        if (_0x4eaad8 && !(_0x1f36da.system.description?.['value'] || '').trim()) {
          _0x2424b9 = true;
          MiscUtil.set(_0x59b68c, "system", "description", 'value', _0x4eaad8);
        }
        let _0x181982 = _0x1f36da.system.levels;
        if (_0x181982) {
          if (_0x4820c9.targetLevel > _0x181982) {
            _0x2424b9 = true;
            MiscUtil.set(_0x59b68c, 'system', 'levels', _0x4820c9.targetLevel);
          }
        }
        this._pImportEntry_pFillClassData_mutAdvancements({
          'existingClassItem': _0x1f36da,
          'update': _0x59b68c,
          'classItemData': _0x1fb10f
        });
        _0x59b68c.flags = {
          ..._0x1f36da.flags,
          [SharedConsts.MODULE_ID]: {
            ..._0x1f36da.flags?.[SharedConsts.MODULE_ID],
            ..._0x1fb10f.flags?.[SharedConsts.MODULE_ID]
          }
        };
        _0x4820c9.classItemUpdate = _0x59b68c;
        _0x4820c9.isPersistClassItemUpdate = _0x4820c9.isPersistClassItemUpdate || _0x2424b9;
        _0x2c1348.curLevel = _0x181982 || 0x0;
        _0x2c1348.existingClassItem = _0x1f36da;
        return;
      }
      _0x4820c9.classItemToCreate = _0x1fb10f;
    }
    ["_pImportEntry_pFillClassData_getHpAdvancementValue"]({
      dataBuilderOpts: _0xe8e05a,
      hpIncreasePerLevel: _0x13d9ba
    }) {
      if (_0xe8e05a.hpIncreaseMode === ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__DO_NOT_INCREASE) {
        return null;
      }
      return _0x13d9ba;
    }
    ["_pImportEntry_pFillClassData_mutAdvancements"]({
      existingClassItem: _0xfaab4a,
      update: _0x10eb7d,
      classItemData: _0x507237
    }) {
      if (!_0x507237.system.advancement?.["length"]) {
        return;
      }
      if (!_0xfaab4a._source.system.advancement?.["length"]) {
        return;
      }
      const _0x198bb6 = _0x507237.system.advancement.filter(_0x250112 => _0x250112.type === 'HitPoints');
      if (!_0x198bb6.length) {
        return;
      }
      if (_0x198bb6.length > 0x1) {
        return console.warn(...LGT, "Multiple \"HitPoints\"-type advancements found in class item data! This should never occur!");
      }
      const _0x3b7025 = _0x198bb6[0x0];
      const _0xd22501 = _0xfaab4a._source.system.advancement.filter(_0x40aceb => _0x40aceb.type === "HitPoints");
      if (!_0xd22501.length) {
        return;
      }
      if (_0xd22501.length > 0x1) {
        return console.warn(...LGT, "Multiple \"HitPoints\"-type advancements found in existing class item data! This should never occur!");
      }
      const _0x8f8fc6 = _0xd22501[0x0];
      const _0x54fa27 = _0xfaab4a._source.system.advancement.filter(_0x391a44 => _0x391a44.type !== 'HitPoints');
      const _0x28bf5d = MiscUtil.copy(_0x8f8fc6);
      Object.entries(_0x3b7025.value || {}).forEach(([_0x1cb23d, _0x2a4c23]) => {
        _0x28bf5d.value[_0x1cb23d] = _0x2a4c23;
      });
      _0x54fa27.push(_0x28bf5d);
      MiscUtil.set(_0x10eb7d, "system", "advancement", _0x54fa27);
    }
    async ["_pImportEntry_pFillSubclassData"]({
      cls: _0x4d16f5,
      sc: _0x2e59d1,
      proficiencyMeta: _0x188943,
      outCurLevelMeta: _0x39a1c3,
      importOpts: _0x13d272,
      dataBuilderOpts: _0x3ef40c
    }) {
      if (!_0x2e59d1) {
        return;
      }
      const {
        existingSubclassItem: _0x2adf9a
      } = _0x39a1c3;
      const _0x26a224 = await DataConverterClass.pGetSubclassItem(_0x4d16f5, _0x2e59d1, {
        'filterValues': _0x13d272.filterValues || this._pageFilter.filterBox.getValues(),
        'proficiencyImportMode': _0x3ef40c.proficiencyImportMode,
        'isScDereferenced': true,
        'actor': this._actor,
        'taskRunner': _0x13d272.taskRunner
      });
      if (_0x2adf9a) {
        let _0x502824 = false;
        const _0x1d91da = {
          '_id': _0x2adf9a.id
        };
        const _0x212283 = _0x26a224.system.description.value;
        if (_0x212283 && !(_0x2adf9a.system.description?.['value'] || '').trim()) {
          _0x502824 = true;
          MiscUtil.set(_0x1d91da, "system", "description", 'value', _0x212283);
        }
        _0x3ef40c.subclassItemUpdate = _0x1d91da;
        _0x3ef40c.isPersistSubclassItemUpdate = _0x3ef40c.isPersistSubclassItemUpdate || _0x502824;
        return;
      }
      _0x3ef40c.subclassItemToCreate = _0x26a224;
    }
    async ["_pGetUserClassSubclassItem"]({
      dataBuilderOpts: _0x3b4b9c,
      clsOrSc: _0x34ec6b,
      existingItems: _0x10fd52,
      nameUnnamed: _0x19df05
    }) {
      const _0x57b744 = _0x34ec6b.name || _0x19df05;
      const _0x2ae9da = await InputUiUtil.pGetUserEnum({
        'values': _0x10fd52,
        'placeholder': "Select Existing Item...",
        'title': "Select Existing Item to Import " + _0x57b744 + " Levels To",
        'fnDisplay': _0x5ed262 => {
          if (_0x5ed262 == null) {
            return "(Create New Item)";
          }
          return _0x5ed262.name || _0x19df05;
        },
        'isAllowNull': true
      });
      if (_0x2ae9da == null) {
        _0x3b4b9c.isCancelled = true;
        return null;
      }
      return _0x10fd52[_0x2ae9da];
    }
    async ["_pGetUserClassSubclassItems"]({
      cls: _0x553e07,
      sc: _0x3a794a,
      existingClassItems: _0x440e0f,
      existingSubclassItems: _0x53ca6e
    }) {
      const _0x2ba008 = (_0x553e07.name || "(Unnamed class)") + " (" + (_0x3a794a.name || "(Unnamed subclass)") + ')';
      const {
        $modalInner: _0x50a988,
        doClose: _0x178780,
        pGetResolved: _0x2a63f8,
        doAutoResize: _0x11ddd6
      } = await UtilApplications.pGetShowApplicationModal({
        'title': "Select Existing Items to Import " + _0x2ba008 + " Levels To"
      });
      const _0x73ab2b = BaseComponent.fromObject({
        'ixItemClass': null,
        'ixItemSubclass': null
      }, '*');
      const _0x3cd3fe = $("<button class=\"btn btn-primary mr-2\">OK</button>").click(async () => {
        const _0x2db958 = {
          'existingClassItem': _0x440e0f[_0x73ab2b._state.ixItemSubclass],
          'existingSubclassItem': _0x53ca6e[_0x73ab2b._state.ixItemSubclass]
        };
        return _0x178780(true, _0x2db958);
      });
      const _0x5ab5f2 = $("<button class=\"btn btn-default\">Cancel</button>").click(() => _0x178780(false));
      const _0x5b1c5b = ComponentUiUtil.$getSelEnum(_0x73ab2b, 'ixItemClass', {
        'values': _0x440e0f,
        'fnDisplay': _0x1828e8 => _0x1828e8 == null ? "(Create New Item)" : _0x1828e8.name || "(Unnamed class)",
        'displayNullAs': "(Create New Item)",
        'isAllowNull': true,
        'isSetIndexes': true
      });
      const _0x338765 = ComponentUiUtil.$getSelEnum(_0x73ab2b, "ixItemSubclass", {
        'values': _0x53ca6e,
        'fnDisplay': _0x27920f => _0x27920f == null ? "(Create New Item)" : _0x27920f.name || "(Unnamed subclass)",
        'displayNullAs': "(Create New Item)",
        'isAllowNull': true,
        'isSetIndexes': true
      });
      $$(_0x50a988)`<div class="ve-flex-col">
              <label class="split-v-center mb-2"><div class="no-shrink mr-2 w-100p text-right">Class item</div>${_0x5b1c5b}</label>
              <label class="split-v-center"><div class="no-shrink mr-2 w-100p text-right">Subclass item</div>${_0x338765}</label>
          </div>`;
      $$`<div class="ve-flex-v-center ve-flex-h-right no-shrink pb-1 pt-1 px-1">${_0x3cd3fe}${_0x5ab5f2}</div>`.appendTo(_0x50a988);
      _0x5b1c5b.focus();
      _0x11ddd6();
      return _0x2a63f8();
    }
    async ["_pImportCasterCantrips"](_0x45fb42, _0x16b19b, _0x185ca5, _0x1f41da, _0xfe2967) {
      if (_0x45fb42._foundryIsSkipImportCantrips) {
        return;
      }
      const _0x5eb890 = Charactermancer_Spell_Util.getCasterCantripProgressionMeta({
        'cls': _0x45fb42,
        'sc': _0x16b19b,
        'curLevel': _0x185ca5,
        'targetLevel': _0xfe2967.targetLevel
      });
      if (!_0x5eb890) {
        return;
      }
      const {
        maxCantripsHigh: _0x3517e6,
        deltaMaxCantrips: _0x62f9a
      } = _0x5eb890;
      if (!_0x62f9a || !_0x3517e6) {
        return;
      }
      const _0x3b2a07 = await Charactermancer_Spell_Modal.pGetUserInput({
        'actor': this._actor,
        'existingClass': _0xfe2967.classItemUpdate ? _0x45fb42 : null,
        'existingCasterMeta': Charactermancer_Spell_Util.getExistingCasterMeta({
          'cls': _0x45fb42,
          'sc': _0x16b19b,
          'actor': this._actor,
          'targetLevel': _0xfe2967.targetLevel
        }),
        'spellDatas': (await Vetools.pGetAllSpells({
          'isIncludeLoadedBrew': true,
          'isIncludeLoadedPrerelease': true,
          'isApplyBlocklist': true
        })).spell,
        'className': _0x45fb42.name,
        'classSource': _0x45fb42.source,
        'brewClassSpells': _0x45fb42.classSpells,
        'subclassName': _0x16b19b?.['name'],
        'subclassSource': _0x16b19b?.["source"],
        'brewSubclassSpells': _0x16b19b?.["subclassSpells"],
        'brewSubSubclassSpells': _0x16b19b?.["subSubclassSpells"],
        'maxLevel': 0x0,
        'maxLearnedCantrips': _0x3517e6
      });
      if (!_0x3b2a07) {
        return _0x1f41da.isCancelled = true;
      }
      if (_0x3b2a07 === VeCt.SYM_UI_SKIP) {
        return;
      }
      await Charactermancer_Spell.pApplyFormDataToActor(this._actor, _0x3b2a07, {
        'cls': _0x45fb42,
        'sc': _0x16b19b,
        'taskRunner': _0x1f41da.taskRunner
      });
    }
    async ['_pImportPreparedCasterSpells'](_0x5798a9, _0x305cb6, _0x5a2a3e, _0x4176ae, _0x53ea03) {
      if (_0x5798a9._foundryIsSkipImportPreparedSpells) {
        return;
      }
      const _0xed73bb = Charactermancer_Spell_Util.getCasterProgressionMeta({
        'casterProgression': DataConverter.getMaxCasterProgression(_0x5798a9.casterProgression, _0x305cb6?.["casterProgression"]),
        'curLevel': _0x5a2a3e,
        'targetLevel': _0x53ea03.targetLevel,
        'isBreakpointsOnly': true
      });
      if (!_0xed73bb) {
        return;
      }
      const {
        spellLevelLow: _0x5c9ebd,
        spellLevelHigh: _0x415c1d,
        deltaLevels: _0x3676c5
      } = _0xed73bb;
      const _0x5b7870 = await InputUiUtil.pGetUserBoolean({
        'title': "Populate Spellbook",
        'htmlDescription': "<p>Do you want to populate the spellbook for this class (for class level" + (_0x3676c5 === 0x1 ? '' : 's') + " " + (_0x3676c5 === 0x1 ? _0x53ea03.targetLevel : _0x5a2a3e + 0x1 + '-' + _0x53ea03.targetLevel) + ')?</p>',
        'textYes': 'Yes',
        'textNo': 'No'
      });
      if (!_0x5b7870) {
        return;
      }
      const _0x3cfc2f = _0x305cb6 ? PrereleaseUtil.hasSourceJson(_0x305cb6.source) : PrereleaseUtil.hasSourceJson(_0x5798a9.source);
      const _0x172fed = _0x305cb6 ? BrewUtil2.hasSourceJson(_0x305cb6.source) : BrewUtil2.hasSourceJson(_0x5798a9.source);
      const _0x40a1ad = !_0x172fed && (_0x3cfc2f || (_0x305cb6 ? SourceUtil.isNonstandardSource(_0x305cb6.source) : SourceUtil.isNonstandardSource(_0x5798a9.source)));
      const _0x49e3b7 = (await Vetools.pGetAllSpells({
        'isFilterNonStandard': !_0x40a1ad,
        'additionalSourcesBrew': _0x3cfc2f ? this._getPrereleaseSpellSources(_0x5798a9, _0x305cb6) : _0x172fed ? this._getBrewSpellSources(_0x5798a9, _0x305cb6) : null,
        'isApplyBlocklist': true
      })).spell;
      const _0x152c5a = await Charactermancer_Class_Util.pGetPreparableSpells(_0x49e3b7, _0x5798a9, _0x5c9ebd, _0x415c1d);
      if (!_0x152c5a.length) {
        return;
      }
      const {
        ImportListSpell: _0x2ae645
      } = await Promise.resolve().then(function () {
        return ImportListSpell$1;
      });
      const _0x527e0e = new _0x2ae645({
        'actor': this._actor
      });
      await _0x527e0e.pInit();
      for (const _0x42460d of _0x152c5a) {
        const _0xace1a8 = DataConverterSpell.getActorSpell(this._actor, _0x42460d.name, _0x42460d.source);
        if (_0xace1a8) {
          continue;
        }
        await _0x527e0e.pImportEntry(_0x42460d, {
          'taskRunner': _0x4176ae.taskRunner,
          'opts_pGetSpellItem': {
            ...(await UtilActors.pGetActorSpellItemOpts()),
            'ability': _0x53ea03.spellcastingAbility
          }
        });
      }
    }
    ["_getPrereleaseSpellSources"](_0x44f835, _0x177a8d) {
      return this._getPrereleaseBrewSpellSources({
        'cls': _0x44f835,
        'sc': _0x177a8d
      });
    }
    ["_getBrewSpellSources"](_0x2f4f2a, _0x4433df) {
      return this._getPrereleaseBrewSpellSources({
        'cls': _0x2f4f2a,
        'sc': _0x4433df
      });
    }
    ['_getPrereleaseBrewSpellSources']({
      cls: _0x50155b,
      sc: _0x4448de
    }) {
      const _0x3f76bb = new Set();
      if (!Parser.SOURCE_JSON_TO_ABV[_0x50155b.source]) {
        _0x3f76bb.add(_0x50155b.source);
      }
      if (_0x4448de && !Parser.SOURCE_JSON_TO_ABV[_0x4448de.source]) {
        _0x3f76bb.add(_0x4448de.source);
      }
      if (_0x50155b.classSpells) {
        _0x50155b.classSpells.filter(_0x7554b7 => _0x7554b7.source && !Parser.SOURCE_JSON_TO_ABV[_0x7554b7.source]).forEach(({
          source: _0x222c1c
        }) => _0x3f76bb.add(_0x222c1c));
      }
      if (_0x4448de && _0x4448de.subclassSpells) {
        _0x4448de.subclassSpells.filter(_0x4cef0a => _0x4cef0a.source && !Parser.SOURCE_JSON_TO_ABV[_0x4cef0a.source]).forEach(({
          source: _0x161340
        }) => _0x3f76bb.add(_0x161340));
      }
      return [..._0x3f76bb];
    }
    async ["_pImportEntry_pFillItemArrayAdditionalSpells"](_0xfeda88, _0x3f39e1, _0x31096d, _0x4e3e8b, _0x590645) {
      const _0x19087d = Charactermancer_Spell_Util.getCasterProgressionMeta({
        'casterProgression': _0xfeda88.casterProgression,
        'curLevel': _0x31096d,
        'targetLevel': _0x590645.targetLevel
      });
      const _0xc689a0 = await Charactermancer_AdditionalSpellsSelect.pGetUserInput({
        'additionalSpells': _0xfeda88.additionalSpells,
        'sourceHintText': _0xfeda88.name,
        'modalFilterSpells': await Charactermancer_AdditionalSpellsSelect.pGetInitModalFilterSpells(),
        'curLevel': _0x31096d,
        'targetLevel': _0x590645.targetLevel,
        'spellLevelLow': _0x19087d ? _0x19087d.spellLevelLow : null,
        'spellLevelHigh': _0x19087d ? _0x19087d.spellLevelHigh : null,
        'isStandalone': true
      });
      if (_0xc689a0 == null) {
        return _0x590645.isCancelled = true;
      }
      if (_0xc689a0 !== VeCt.SYM_UI_SKIP) {
        await Charactermancer_AdditionalSpellsSelect.pApplyFormDataToActor(this._actor, _0xc689a0, {
          'taskRunner': _0x4e3e8b.taskRunner,
          'abilityAbv': _0xfeda88.spellcastingAbility
        });
      }
      for (const _0x1fc849 of _0x3f39e1) {
        const _0x3b7578 = Charactermancer_Spell_Util.getCasterProgressionMeta({
          'casterProgression': _0x1fc849?.["casterProgression"] || _0xfeda88.casterProgression,
          'curLevel': _0x31096d,
          'targetLevel': _0x590645.targetLevel
        });
        const _0x3dd312 = await Charactermancer_AdditionalSpellsSelect.pGetUserInput({
          'additionalSpells': _0x1fc849.additionalSpells,
          'sourceHintText': _0x1fc849.name,
          'modalFilterSpells': await Charactermancer_AdditionalSpellsSelect.pGetInitModalFilterSpells(),
          'curLevel': _0x31096d,
          'targetLevel': _0x590645.targetLevel,
          'spellLevelLow': _0x3b7578 ? _0x3b7578.spellLevelLow : null,
          'spellLevelHigh': _0x3b7578 ? _0x3b7578.spellLevelHigh : null,
          'isStandalone': true
        });
        if (_0x3dd312 == null) {
          return _0x590645.isCancelled = true;
        }
        if (_0x3dd312 === VeCt.SYM_UI_SKIP) {
          continue;
        }
        await Charactermancer_AdditionalSpellsSelect.pApplyFormDataToActor(this._actor, _0x3dd312, {
          'taskRunner': _0x4e3e8b.taskRunner,
          'abilityAbv': _0x1fc849.spellcastingAbility
        });
      }
    }
    async ["_pImportEntry_pHandleFeatures"](_0x132c79, _0x5d86e3, _0x1b7f2d, _0x207673, _0x447e0b, _0x246076) {
      if (_0x132c79._foundryAllFeatures) {
        await this._pImportEntry_pFillItemArrayPredefinedFeatures({
          'allPreloadedFeatures': _0x132c79._foundryAllFeatures,
          'cls': _0x132c79,
          'sc': _0x5d86e3,
          'importOpts': _0x447e0b,
          'dataBuilderOpts': _0x246076
        });
        this._pImportEntry_handleConDifference({
          'conInitial': _0x132c79._foundryConInitial,
          'conFinal': _0x132c79._foundryConFinal,
          'isConPreApplied': true,
          'dataBuilderOpts': _0x246076
        });
        return;
      }
      const _0x593370 = _0x1b7f2d.filter(_0x4a1096 => _0x207673.includes(_0x4a1096.level - 0x1));
      const _0x44966b = await this._pImportEntry_pFillItemArrayFeatures(_0x593370, _0x447e0b, _0x246076);
      if (_0x246076.isCancelled) {
        return;
      }
      this._pImportEntry_handleConDifference({
        'conInitial': _0x44966b.conInitial,
        'conFinal': _0x44966b.conFinal,
        'dataBuilderOpts': _0x246076
      });
    }
    async ['_pImportEntry_pFillItemArrayPredefinedFeatures']({
      allPreloadedFeatures: _0x782ba8,
      cls: _0x765066,
      sc: _0x46fe30,
      importOpts: _0x52f454,
      dataBuilderOpts: _0x530945
    }) {
      const {
        ImportListClassFeature: _0x1c1d42
      } = await Promise.resolve().then(function () {
        return ImportListClassFeature$1;
      });
      const {
        ImportListOptionalFeature: _0x505059
      } = await Promise.resolve().then(function () {
        return ImportListOptionalFeature$1;
      });
      const _0x47d627 = new _0x1c1d42({
        'actor': this._actor
      });
      await _0x47d627.pInit();
      const _0x38c7d3 = new _0x505059({
        'actor': this._actor
      });
      await _0x38c7d3.pInit();
      for (const _0x5142ca of _0x782ba8) {
        if (_0x5142ca._foundryIsIgnoreFeature) {
          continue;
        }
        switch (_0x5142ca.type) {
          case "optionalfeature":
            {
              const _0x522594 = await _0x38c7d3.pImportEntry(_0x5142ca.entity, {
                'taskRunner': _0x52f454.taskRunner,
                'isCharactermancer': true,
                'isLeaf': true
              });
              const _0x3e1bc6 = this.constructor._getLevelledEmbeddedDocuments({
                'importSummary': _0x522594,
                'level': _0x5142ca.entity.level
              });
              const _0x3d4722 = _0x5142ca.entity?.['ancestorSubclassName'] ? _0x530945.importedSubclassFeatureLevelledEmbeddedDocuments : _0x530945.importedClassFeatureLevelledEmbeddedDocuments;
              _0x3d4722.push(..._0x3e1bc6);
              break;
            }
          case "classFeature":
            {
              const _0x35eeab = await _0x47d627.pImportEntry(_0x5142ca.entity, {
                'taskRunner': _0x52f454.taskRunner,
                'isCharactermancer': true,
                'isLeaf': true,
                'spellcastingAbilityAbv': _0x765066.spellcastingAbility
              });
              _0x530945.importedClassFeatureLevelledEmbeddedDocuments.push(...this.constructor._getLevelledEmbeddedDocuments({
                'importSummary': _0x35eeab,
                'level': _0x5142ca.entity.level
              }));
              break;
            }
          case "subclassFeature":
            {
              const _0x2887b2 = await _0x47d627.pImportEntry(_0x5142ca.entity, {
                'taskRunner': _0x52f454.taskRunner,
                'isCharactermancer': true,
                'isLeaf': true,
                'spellcastingAbilityAbv': _0x46fe30?.['spellcastingAbility']
              });
              _0x530945.importedSubclassFeatureLevelledEmbeddedDocuments.push(...this.constructor._getLevelledEmbeddedDocuments({
                'importSummary': _0x2887b2,
                'level': _0x5142ca.entity.level
              }));
              break;
            }
          default:
            throw new Error("Unhandled feature type \"" + _0x5142ca.type + "\"");
        }
      }
    }
    async ["_pImportEntry_pFillItemArrayFeatures"](_0x30a62d, _0x264d38, _0x39aed1) {
      const _0x2a4e55 = Charactermancer_Util.getCurrentAbilityScores(this._actor).con;
      const _0x34d5b9 = new Charactermancer_Class_Util.ExistingFeatureChecker(this._actor);
      const {
        ImportListClassFeature: _0x333f90
      } = await Promise.resolve().then(function () {
        return ImportListClassFeature$1;
      });
      const _0x57618e = new _0x333f90({
        'actor': this._actor
      });
      await _0x57618e.pInit();
      for (const _0x394781 of _0x30a62d) {
        const _0x25a8a0 = (_0x394781.name || '').toLowerCase().trim();
        if (_0x25a8a0 === "ability score improvement") {
          const _0x1e6dad = new ImportListClass.AbilityScoreIncrease(this._actor, _0x394781.level, _0x39aed1);
          _0x1e6dad.render(true);
          const _0x148963 = await _0x1e6dad.pWaitForUserInput();
          if (_0x148963) {
            const _0x5190d3 = new ImportListFeat({
              'actor': this._actor
            });
            await _0x5190d3.pImportEntry(_0x148963, {
              'taskRunner': _0x264d38.taskRunner,
              'isCharactermancer': _0x264d38.isCharactermancer
            });
          }
          continue;
        }
        if (_0x394781.loadeds?.['length']) {
          _0x394781.loadeds = _0x394781.loadeds.filter(_0x5235b1 => !_0x5235b1?.["_foundryIsIgnoreFeature"]);
          if (!_0x394781.loadeds.length) {
            continue;
          }
        }
        const _0x5e448e = await _0x57618e.pImportEntry(_0x394781, {
          'taskRunner': _0x264d38.taskRunner,
          'isCharactermancer': _0x264d38.isCharactermancer,
          'isPreLoadedFeature': true,
          'featureEntriesPageFilter': this._pageFilter,
          'featureEntriesPageFilterValues': _0x264d38.filterValues || this._pageFilter.filterBox.getValues(),
          'existingFeatureChecker': _0x34d5b9,
          'spellcastingAbilityAbv': _0x39aed1.spellcastingAbility
        });
        const _0xce72bc = this.constructor._getLevelledEmbeddedDocuments({
          'importSummary': _0x5e448e,
          'level': _0x394781.level
        });
        if (_0x394781.classFeature) {
          _0x39aed1.importedClassFeatureLevelledEmbeddedDocuments.push(..._0xce72bc);
        } else if (_0x394781.subclassFeature) {
          _0x39aed1.importedSubclassFeatureLevelledEmbeddedDocuments.push(..._0xce72bc);
        } else {
          console.warn(...LGT, "Class/subclass feature had neither \"classFeature\" nor \"subclassFeature\" set! This should never occur!");
        }
      }
      if (_0x39aed1.isCancelled) {
        return;
      }
      const _0x5d0e0b = Charactermancer_Util.getCurrentAbilityScores(this._actor).con;
      return {
        'conInitial': _0x2a4e55,
        'conFinal': _0x5d0e0b
      };
    }
    static ['_getLevelledEmbeddedDocuments']({
      importSummary: _0xfc6dcb,
      level: _0x369768
    }) {
      return _0xfc6dcb.imported.filter(_0x50dde5 => _0x50dde5.embeddedDocument).map(_0x1c8d3b => new UtilAdvancements.LevelledEmbeddedDocument_MinLevel1({
        'embeddedDocument': _0x1c8d3b.embeddedDocument,
        'level': _0x369768
      }));
    }
    ["_pImportEntry_handleConDifference"]({
      conInitial: _0x3f4660,
      conFinal: _0x612e5a,
      dataBuilderOpts: _0x593839,
      isConPreApplied: _0x42c0b7
    }) {
      if (_0x3f4660 == null || _0x612e5a == null || _0x612e5a === _0x3f4660) {
        return;
      }
      const _0x262a2d = Parser.getAbilityModNumber(_0x3f4660);
      const _0x563662 = Parser.getAbilityModNumber(_0x612e5a);
      const _0x4217f6 = (_0x593839.numLevelsPrev + (_0x42c0b7 ? 0x0 : _0x593839.numLevels)) * (_0x563662 - _0x262a2d);
      const {
        value: _0x5a7340,
        max: _0x24c21d
      } = Charactermancer_Util.getBaseHp(this._actor);
      const _0x4c41f9 = _0x5a7340 + _0x4217f6;
      const _0x435bdf = _0x24c21d == null ? null : _0x24c21d + _0x4217f6;
      MiscUtil.set(_0x593839.actorUpdate, "system", "attributes", 'hp', 'value', _0x4c41f9);
      if (UtilActors.isSetMaxHp({
        'actor': this._actor
      })) {
        MiscUtil.set(_0x593839.actorUpdate, "system", 'attributes', 'hp', "max", _0x435bdf);
      }
    }
    async ["_pImportEntry_pAddUpdateClassItem"](_0x525247, _0x331e57, _0x143386, _0x4851d8) {
      for (const {
        dataBuilderProp: _0x4b6152,
        dataBuilderPropOut: _0x152f81
      } of [{
        'dataBuilderProp': 'classItemToCreate',
        'dataBuilderPropOut': "classItem"
      }, {
        'dataBuilderProp': "subclassItemToCreate",
        'dataBuilderPropOut': "subclassItem"
      }]) {
        if (!_0x4851d8[_0x4b6152]) {
          continue;
        }
        const _0x2cf161 = await UtilDocuments.pCreateEmbeddedDocuments(this._actor, [_0x4851d8[_0x4b6152]], {
          'ClsEmbed': Item,
          'isRender': !_0x143386.isBatched,
          'keepId': true,
          'keepEmbeddedIds': true
        });
        _0x4851d8[_0x152f81] = DataConverter.getImportedEmbed(_0x2cf161, _0x4851d8[_0x4b6152])?.['document'];
      }
      const _0x577d8f = [_0x4851d8.isPersistClassItemUpdate ? _0x4851d8.classItemUpdate : null, _0x4851d8.isPersistSubclassItemUpdate ? _0x4851d8.subclassItemUpdate : null].filter(Boolean);
      if (_0x577d8f.length) {
        await UtilDocuments.pUpdateEmbeddedDocuments(this._actor, _0x577d8f, {
          'ClsEmbed': Item
        });
      }
      if (_0x4851d8.proficiencyImportMode === Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY && _0x4851d8.classItem?.['id']) {
        MiscUtil.set(_0x4851d8.actorUpdate, "system", "details", "originalClass", _0x4851d8.classItem.id);
      }
    }
    async ["_pImportEntry_pAddUnarmedStrike"]({
      importOpts: _0x2bb618
    }) {
      if (!Config.get(this._configGroup, 'isAddUnarmedStrike')) {
        return;
      }
      const _0x3dc72c = MiscUtil.get(this._actor, "items") || [];
      const _0x2dc087 = _0x3dc72c.some(_0x27295e => _0x27295e.name.split('(')[0x0].trim().toLowerCase() === ImportListClass._ITEM_NAME_UNARMED_STRIKE.toLowerCase());
      if (_0x2dc087) {
        return;
      }
      const _0xf6c4e2 = {
        'name': "Unarmed Strike",
        'source': Parser.SRC_PHB,
        'page': 0x95,
        'srd': true,
        'type': 'M',
        'rarity': "none",
        'weaponCategory': "simple",
        'foundrySystem': {
          'equipped': true,
          'damage.parts': [["1 + @mod", 'bludgeoning']],
          'ability': "str"
        }
      };
      const {
        ChooseImporter: _0x4a8cc1
      } = await Promise.resolve().then(function () {
        return ChooseImporter$1;
      });
      const _0xba2db0 = _0x4a8cc1.getImporter("item", {
        'actor': this._actor
      });
      await _0xba2db0.pInit();
      await _0xba2db0.pImportEntry(_0xf6c4e2, {
        'taskRunner': _0x2bb618.taskRunner
      });
    }
    async ["_pImportEntry_pAddAdvancements"](_0x22d22a) {
      if (_0x22d22a.importedClassFeatureLevelledEmbeddedDocuments.length) {
        await UtilAdvancements.pAddAdvancementLinks({
          'actor': this._actor,
          'parentEmbeddedDocument': _0x22d22a.classItem,
          'childLevelledEmbeddedDocuments': _0x22d22a.importedClassFeatureLevelledEmbeddedDocuments
        });
      }
      if (_0x22d22a.importedSubclassFeatureLevelledEmbeddedDocuments.length) {
        await UtilAdvancements.pAddAdvancementLinks({
          'actor': this._actor,
          'parentEmbeddedDocument': _0x22d22a.subclassItem,
          'childLevelledEmbeddedDocuments': _0x22d22a.importedSubclassFeatureLevelledEmbeddedDocuments
        });
      }
    }
    async ["_pImportEntry_pFinalise"](_0x4eb731, _0x314f99) {
      if (_0x314f99.formDataEquipment?.["data"]?.["currency"]) {
        MiscUtil.set(_0x314f99.actorUpdate, "system", "currency", _0x314f99.formDataEquipment.data.currency);
      }
      await this._pDoMergeAndApplyActorUpdate(_0x314f99.actorUpdate);
      await Charactermancer_StartingEquipment.pImportEquipmentItemEntries(this._actor, _0x314f99.formDataEquipment, {
        'taskRunner': _0x4eb731.taskRunner
      });
      if (_0x314f99.effects.length) {
        throw new Error("Class active effects should be populated on the class itself! This is a bug!");
      }
      if (Config.get("importSpell", Config.getSpellPointsKey({
        'actorType': this._actor?.["type"]
      })) === ConfigConsts.C_SPELL_POINTS_MODE__ENABLED_AND_UNLIMITED_SLOTS) {
        if (!UtilActors.hasActorSpellPointSlotEffect({
          'actor': this._actor
        })) {
          await UtilDocuments.pCreateEmbeddedDocuments(this._actor, UtilActors.getActorSpellPointsSlotsEffectData({
            'actor': this._actor,
            'sheetIem': _0x314f99.classItem
          }), {
            'ClsEmbed': ActiveEffect,
            'isRender': !_0x4eb731.isBatched
          });
        }
        Object.assign(_0x314f99.postItemActorUpdate, foundry.utils.flattenObject(UtilActors.getActorSpellPointsSlotsUpdateSys()));
      }
      Util.trimObject(_0x314f99.postItemActorUpdate);
      if (Object.keys(_0x314f99.postItemActorUpdate).length) {
        await UtilDocuments.pUpdateDocument(this._actor, _0x314f99.postItemActorUpdate);
      }
      await UtilActors.pLinkTempUuids({
        'actor': this._actor
      });
    }
    async ['_pValidateUserLevelIndices'](_0x54c00e, _0xad1063) {
      if (_0x54c00e.length > 0x1) {
        return;
      }
      if (_0x54c00e[0x0] === 0x0) {
        return;
      }
      const _0x2d20e3 = this._actor.items.filter(_0x24dec1 => _0x24dec1.type === "class");
      if (_0x2d20e3.length) {
        return;
      }
      const _0x6fafcf = _0x54c00e[0x0] + 0x1;
      const _0x38c508 = await InputUiUtil.pGetUserBoolean({
        'title': "Import Lower Levels?",
        'htmlDescription': "You have selected a single level to import (level " + _0x6fafcf + "). Would you like to import level" + (_0x6fafcf === 0x2 ? '' : 's') + " " + (_0x6fafcf === 0x2 ? '1' : '1-' + (_0x6fafcf - 0x1)) + " too?",
        'textYes': "Import Levels 1-" + _0x6fafcf,
        'textNo': "Import Level " + _0x6fafcf
      });
      if (_0x38c508 == null) {
        _0xad1063.isCancelled = true;
        return;
      }
      if (_0x38c508) {
        const _0x293a28 = _0x54c00e[0x0];
        for (let _0x24c712 = 0x0; _0x24c712 <= _0x293a28; ++_0x24c712) {
          _0x54c00e[_0x24c712] = _0x24c712;
        }
      }
    }
    async ['_pImportEntry_pDoUpdateCharacter_pPopulateEquipment'](_0x28d156, _0x3f80f7) {
      if (!_0x28d156.startingEquipment) {
        return;
      }
      const _0x3654e1 = new Charactermancer_StartingEquipment({
        'actor': this._actor,
        'startingEquipment': _0x28d156.startingEquipment,
        'appSubTitle': _0x28d156.name,
        'equiSpecialSource': _0x28d156.source,
        'equiSpecialPage': _0x28d156.page
      });
      const _0x55f1ec = await _0x3654e1.pWaitForUserInput();
      if (_0x55f1ec == null) {
        return _0x3f80f7.isCancelled = true;
      }
      if (_0x55f1ec === VeCt.SYM_UI_SKIP) {
        return;
      }
      _0x3f80f7.formDataEquipment = _0x55f1ec;
    }
    static ["_DEFAULT_FILTER_VALUES"] = null;
    static async ['pGetDefaultFilterValues']() {
      if (this._DEFAULT_FILTER_VALUES) {
        return MiscUtil.copy(this._DEFAULT_FILTER_VALUES);
      }
      const _0x268f55 = new ModalFilterClasses({
        'namespace': ModalFilterClasses.name + ".default"
      });
      await _0x268f55.pPreloadHidden();
      this._DEFAULT_FILTER_VALUES = _0x268f55.pageFilter.filterBox.getValues();
      return MiscUtil.copy(this._DEFAULT_FILTER_VALUES);
    }
    ["_getAsTag"](_0xd03c1) {
      const _0x23ba69 = this._content['class'][_0xd03c1.data.ixClass];
      const _0x4247d6 = DataUtil.generic.packUid(_0x23ba69, "class");
      return '@class[' + _0x4247d6 + ']';
    }
}
ImportListClass._AE_LABEL_BASE_AC = "Base/Unarmored AC";
ImportListClass._ITEM_NAME_UNARMED_STRIKE = "Unarmed Strike";
ImportListClass.ImportEntryOpts = class extends ImportListCharacter.ImportEntryOpts {
constructor(_0x499a50) {
    super(_0x499a50);
    _0x499a50 = _0x499a50 || {};
    this.isClassImport = !!_0x499a50.isClassImport;
    this.actorUpdate = {};
    this.postItemActorUpdate = {};
    this.classItemToCreate = null;
    this.classItemUpdate = null;
    this.isPersistClassItemUpdate = false;
    this.subclassItemToCreate = null;
    this.subclassItemUpdate = null;
    this.isPersistSubclassItemUpdate = false;
    this.classItem = null;
    this.subclassItem = null;
    this.formDataEquipment = null;
    this.targetLevel = null;
    this.numLevels = null;
    this.numLevelsPrev = null;
    this.isIncludesLevelOne = null;
    this.proficiencyImportMode = null;
    this.shouldBeMulticlass = null;
    this.hpIncreaseMode = null;
    this.hpIncreaseCustomRollFormula = null;
    this.importedClassFeatureLevelledEmbeddedDocuments = [];
    this.importedSubclassFeatureLevelledEmbeddedDocuments = [];
}
get ["currentLevelThisClass"]() {
    return this.targetLevel - this.numLevels;
}
get ["targetLevelThisClass"]() {
    return this.targetLevel;
}
};
ImportListClass.Utils = class {
static ["getDedupedData"]({
    allContentMerged: _0x275c3a
}) {
    _0x275c3a = MiscUtil.copy(_0x275c3a);
    Object.entries(_0x275c3a).forEach(([_0xac998, _0x20ab78]) => {
    if (_0xac998 !== "class") {
        return;
    }
    if (!(_0x20ab78 instanceof Array)) {
        return;
    }
    const _0x41714c = [];
    const _0x3a9dcf = new Set();
    _0x20ab78.forEach(_0x4d32a6 => {
        const _0x47b58a = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](_0x4d32a6);
        if (_0x3a9dcf.has(_0x47b58a)) {
        if (_0x4d32a6.subclasses?.["length"]) {
            const _0x287668 = _0x41714c.find(_0x14c555 => UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](_0x14c555) === _0x47b58a);
            (_0x287668.subclasses = _0x287668.subclasses || []).push(..._0x4d32a6.subclasses);
        }
        return;
        }
        _0x3a9dcf.add(_0x47b58a);
        _0x41714c.push(_0x4d32a6);
    });
    _0x275c3a[_0xac998] = _0x41714c;
    });
    return _0x275c3a;
}
static ["getBlocklistFilteredData"]({
    dedupedAllContentMerged: _0x26a00f
}) {
    _0x26a00f = {
    ..._0x26a00f
    };
    Object.entries(_0x26a00f).forEach(([_0x267ff5, _0x12e295]) => {
    if (_0x267ff5 !== 'class') {
        return;
    }
    if (!(_0x12e295 instanceof Array)) {
        return;
    }
    const _0x58cc6d = _0x12e295.filter(_0x549236 => {
        if (_0x549236.source === VeCt.STR_GENERIC) {
        return false;
        }
        return !ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER['class'](_0x549236), 'class', _0x549236.source, {
        'isNoCount': true
        });
    });
    _0x58cc6d.forEach(_0x7ea13a => {
        if (!_0x7ea13a.classFeatures) {
        return;
        }
        _0x7ea13a.classFeatures = _0x7ea13a.classFeatures.filter(_0x291189 => !ExcludeUtil.isExcluded(_0x291189.hash, "classFeature", _0x291189.source, {
        'isNoCount': true
        }));
    });
    _0x58cc6d.forEach(_0x510859 => {
        if (!_0x510859.subclasses) {
        return;
        }
        _0x510859.subclasses = _0x510859.subclasses.filter(_0x5c006d => {
        if (_0x5c006d.source === VeCt.STR_GENERIC) {
            return false;
        }
        return !ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER.subclass(_0x5c006d), 'subclass', _0x5c006d.source, {
            'isNoCount': true
        });
        });
        _0x510859.subclasses.forEach(_0x4312ed => {
        if (!_0x4312ed.subclassFeatures) {
            return;
        }
        _0x4312ed.subclassFeatures = _0x4312ed.subclassFeatures.filter(_0x2b18d0 => !ExcludeUtil.isExcluded(_0x2b18d0.hash, "subclassFeature", _0x2b18d0.source, {
            'isNoCount': true
        }));
        });
    });
    _0x26a00f[_0x267ff5] = _0x58cc6d;
    });
    return _0x26a00f;
}
};
/* ImportListClass.AbilityScoreIncrease = class extends Application {
constructor(_0x146394, _0x1e1fb1, _0x467340) {
    super({
    'title': "Ability Score Improvement—Level " + _0x1e1fb1,
    'template': SharedConsts.MODULE_LOCATION + "/template/ImportListClassAbilityScoreIncrease.hbs",
    'width': 0x280,
    'resizable': true
    });
    this._dataBuilderOpts = _0x467340;
    this._resolve = null;
    this._reject = null;
    this._pUserInput = new Promise((_0x11b60b, _0x4d0bb5) => {
    this._resolve = _0x11b60b;
    this._reject = _0x4d0bb5;
    });
    this._comp = new ImportListClass.AbilityScoreIncrease.Component(_0x146394, _0x467340, this.close.bind(this));
}
['activateListeners'](_0x3c5c91) {
    this._comp.render(_0x3c5c91);
}
async ['close']() {
    await super.close();
    if (!this._comp.isDataEntered) {
    this._dataBuilderOpts.isCancelled = true;
    }
    this._resolve(this._comp.getFeat());
}
['pWaitForUserInput']() {
    return this._pUserInput;
}
};
ImportListClass.AbilityScoreIncrease.Component = class extends BaseComponent {
constructor(_0xe3e412, _0x39d7c7, _0x171bd5) {
    super();
    this._actor = _0xe3e412;
    this._dataBuilderOpts = _0x39d7c7;
    this._fnClose = _0x171bd5;
    this._isDataEntered = false;
    Object.assign(this.__state, Charactermancer_Util.getBaseAbilityScores(this._actor));
}
get ['isDataEntered']() {
    return this._isDataEntered;
}
["render"](_0x2ea71e) {
    const _0x361fea = $("<button class=\"btn btn-default w-50 btn-5et\">Ability Score Improvement</button>").click(() => this._state.mode = "ability");
    const _0x370953 = $("<button class=\"btn btn-default w-50 btn-5et\">Feat</button>").click(() => this._state.mode = 'feat');
    const _0x461dc5 = $("<div class=\"ve-flex-col w-100 h-100\"></div>");
    const _0x2ca4a6 = $("<div class=\"ve-flex-col w-100 h-100\"></div>");
    const _0x4b6f73 = () => {
    const _0x805381 = this._state.mode === "ability";
    _0x361fea.toggleClass("active", _0x805381);
    _0x370953.toggleClass("active", !_0x805381);
    _0x461dc5.toggleVe(_0x805381);
    _0x2ca4a6.toggleVe(!_0x805381);
    };
    _0x4b6f73();
    this._addHookBase('mode', _0x4b6f73);
    this._render_ability(_0x461dc5);
    this._render_feat(_0x2ca4a6);
    $$(_0x2ea71e)`<div class="ve-flex-col w-100 h-100">
            <div class="ve-flex no-shrink btn-group mb-1">${_0x361fea}${_0x370953}</div>
            ${_0x461dc5}
            ${_0x2ca4a6}
        </div>`;
}
['_render_ability'](_0x401072) {
    const _0x19fad7 = ["str", 'dex', "con", "int", 'wis', "cha"].map(_0x1751b5 => {
    const _0x1f6a6e = $("<div class=\"col-2 ve-text-center\"></div>");
    const _0x4aad3b = $("<div class=\"col-2 ve-text-center\"></div>");
    const _0x1ed7ba = () => {
        _0x1f6a6e.text(this._state[_0x1751b5]);
        _0x4aad3b.text(Parser.getAbilityModifier(this._state[_0x1751b5]));
    };
    this._addHookBase(_0x1751b5, _0x1ed7ba);
    _0x1ed7ba();
    const _0xf70c40 = _0x1751b5 + "Bonus";
    const {
        $wrp: _0x153810,
        $ipt: _0xd78091
    } = ComponentUiUtil.$getIptNumber(this, _0xf70c40, 0x0, {
        'min': 0x0,
        'fallbackOnNaN': 0x0,
        'html': "<input type=\"text\" class=\"ve-text-center\" placeholder=\"0\">",
        'asMeta': true,
        'decorationRight': "ticker",
        'decorationLeft': 'spacer'
    });
    _0xd78091.click(() => _0xd78091.select());
    const _0x113442 = $("<div class=\"col-2 ve-text-center\"></div>");
    const _0xd0b4a8 = $("<div class=\"col-2 ve-text-center\"></div>");
    const _0x54aab7 = () => {
        const _0x24c6b4 = this._state[_0x1751b5] + this._state[_0xf70c40];
        _0x113442.text(_0x24c6b4);
        _0xd0b4a8.text(Parser.getAbilityModifier(_0x24c6b4));
        _0x113442.toggleClass('veapp__msg-error', _0x24c6b4 > 0x14).title(_0x24c6b4 > 0x14 ? "You can't increase an ability score above 20 using this feature." : '');
    };
    this._addHookBase(_0xf70c40, _0x54aab7);
    _0x54aab7();
    const _0xaa1a3e = $$`<div class="ve-flex w-100 my-1">
                <div class="col-1 text-right bold">${_0x1751b5.toUpperCase()}</div>
                ${_0x1f6a6e}
                ${_0x4aad3b}
                <div class="col-2">${_0x153810}</div>
                <div class="col-1 ve-text-center">=</div>
                ${_0x113442}
                ${_0xd0b4a8}
            </div>`;
    return {
        '$row': _0xaa1a3e,
        '$iptBonus': _0xd78091
    };
    });
    const _0x306df9 = $("<div class=\"ve-text-center\" title=\"Remaining\"></div>");
    const _0x1dd0a6 = () => {
    const _0x3107ad = ["strBonus", "dexBonus", "conBonus", "intBonus", "wisBonus", 'chaBonus'].map(_0x353184 => this._state[_0x353184]).reduce((_0x19463d, _0xbf3bc3) => _0x19463d + _0xbf3bc3, 0x0);
    const _0x47d3b4 = _0x3107ad > 0x2;
    _0x306df9.text("Remaining: " + (0x2 - _0x3107ad)).toggleClass("veapp__msg-error", _0x47d3b4);
    _0x19fad7.forEach(_0x5c6bab => _0x5c6bab.$iptBonus.toggleClass("form-control--error", _0x47d3b4));
    };
    ["strBonus", "dexBonus", "conBonus", "intBonus", "wisBonus", "chaBonus"].forEach(_0x4bf968 => this._addHookBase(_0x4bf968, _0x1dd0a6));
    _0x1dd0a6();
    const _0x130cd0 = $("<button class=\"btn btn-primary mr-2\">Confirm</button>").click(async () => {
    const _0xd633bb = [this._state.strBonus, this._state.dexBonus, this._state.conBonus, this._state.intBonus, this._state.wisBonus, this._state.chaBonus].reduce((_0x26f85f, _0x56431f) => _0x26f85f + _0x56431f, 0x0);
    if (_0xd633bb !== 0x2) {
        return ui.notifications.error("Please enter a combination of ability score changes which adds up to two!");
    }
    await this._pDoResolve(true);
    });
    const _0x105724 = $("<button class=\"btn btn-default mr-3\">Skip</button>").click(() => this._pDoResolve(VeCt.SYM_UI_SKIP));
    $$(_0x401072)`
        <div class="ve-flex w-100 my-1 bold">
            <div class="ve-text-center col-1"></div>
            <div class="ve-text-center col-2">Current</div>
            <div class="ve-text-center col-2 ve-muted">Mod</div>
            <div class="ve-text-center col-2 ve-text-center">${_0x306df9}</div>
            <div class="ve-text-center col-1"></div>
            <div class="ve-text-center col-2">Result</div>
            <div class="ve-text-center col-2 ve-muted">Mod</div>
        </div>
        <div class="ve-flex-col w-100 h-100">
            ${_0x19fad7.map(_0x5d1d19 => _0x5d1d19.$row)}
        </div>
        <div class="ve-flex-v-center ve-flex-h-right w-100">${_0x130cd0}${_0x105724}</div>
        `;
}
["_render_feat"](_0x1d62ca) {
    const _0x419ea3 = $("<button class=\"btn btn-default btn-5et w-100 mr-2\">Choose Feat</button>").click(async () => {
    const _0x2a6243 = await ImportListFeat.UserChoose.pGetUserChoice({
        'id': 'feats-classAbilityScoreIncrease',
        'name': "Feats",
        'singleName': "Feat",
        'wizardTitleWindow': "Select Source",
        'wizardTitlePanel3': "Configure and Open List",
        'wizardTitleButtonOpenImporter': "Open List"
    }, "classAbilityScoreIncrease");
    if (!_0x2a6243) {
        return;
    }
    const {
        page: _0xd8b692,
        source: _0x1d1a8c,
        hash: _0x3f4be4
    } = MiscUtil.get(_0x2a6243, "flags", SharedConsts.MODULE_ID) || {};
    if (!_0xd8b692 || !_0x1d1a8c || !_0x3f4be4) {
        return;
    }
    this._state.feat = await DataLoader.pCacheAndGet(_0xd8b692, _0x1d1a8c, _0x3f4be4);
    });
    const _0x17b7a5 = $('<div></div>');
    const _0x5d874d = () => {
    _0x17b7a5.empty();
    if (!this._state.feat) {
        return;
    }
    _0x17b7a5.html("<hr class=\"hr-1\"><h3 class=\"mb-2 mt-0 b-0\">Selected: " + this._state.feat.name + '</h3>');
    _0x17b7a5.empty();
    $$(_0x17b7a5)`<hr class="hr-1">
            ${Vetools.withUnpatchedDiceRendering(() => Renderer.hover.$getHoverContent_stats(UrlUtil.PG_FEATS, MiscUtil.copy(this._state.feat)))}`;
    };
    _0x5d874d();
    this._addHookBase("feat", _0x5d874d);
    const _0x341d31 = $("<button class=\"btn btn-primary btn-5et\">Confirm</button>").click(async () => {
    if (!this._state.feat) {
        return ui.notifications.error("Please select a feat!");
    }
    await this._pDoResolve(true);
    });
    const _0xa924c2 = $("<button class=\"btn btn-default btn-5et\">Skip</button>").click(() => this._pDoResolve(VeCt.SYM_UI_SKIP));
    $$(_0x1d62ca)`
        <div class="ve-flex-col h-100">
            <div class="ve-flex-v-center mb-1">
                ${_0x419ea3}
                <div class="ve-flex-v-center btn-group">${_0x341d31}${_0xa924c2}</div>
            </div>
            ${_0x17b7a5}
        </div>
        `;
}
async ['_pDoResolve'](_0x1edf4d) {
    if (!_0x1edf4d) {
    return this._fnClose();
    }
    if (_0x1edf4d === VeCt.SYM_UI_SKIP) {
    this._isDataEntered = true;
    return this._fnClose();
    }
    const _0x235b69 = this._getActorUpdate();
    if (_0x235b69) {
    this._isDataEntered = true;
    await UtilDocuments.pUpdateDocument(this._actor, _0x235b69);
    }
    if (this.getFeat()) {
    this._isDataEntered = true;
    }
    this._fnClose();
}
["_getActorUpdate"]() {
    if (this._state.mode !== "ability") {
    return null;
    }
    return {
    'system': {
        'abilities': {
        'str': {
            'value': this._state.str + this._state.strBonus
        },
        'dex': {
            'value': this._state.dex + this._state.dexBonus
        },
        'con': {
            'value': this._state.con + this._state.conBonus
        },
        'int': {
            'value': this._state.int + this._state.intBonus
        },
        'wis': {
            'value': this._state.wis + this._state.wisBonus
        },
        'cha': {
            'value': this._state.cha + this._state.chaBonus
        }
        }
    }
    };
}
["getFeat"]() {
    if (this._state.mode !== "feat") {
    return null;
    }
    return MiscUtil.copy(this._state.feat);
}
["_getDefaultState"]() {
    return {
    'mode': "ability",
    'str': 0x0,
    'dex': 0x0,
    'con': 0x0,
    'int': 0x0,
    'wis': 0x0,
    'cha': 0x0,
    'strBonus': 0x0,
    'dexBonus': 0x0,
    'conBonus': 0x0,
    'intBonus': 0x0,
    'wisBonus': 0x0,
    'chaBonus': 0x0,
    'feat': null
    };
}
}; */


export {ImportListClass}