Ext.define('Rally.ui.cardboard.HistoricalCardBoard', {
    extend: 'Rally.ui.cardboard.CardBoard',
    componentCls: 'historical-cardboard',
	alias: 'widget.historicalcardboard',
	
	 constructor: function(cfg) {
	 
		cfg = Ext.applyIf(cfg, {
			viewDate: "current"
		});
		
		var columnCfg = {
			xtype: 'historicalcardboardcolumn',
			displayField: 'Name',
			valueField: 'ObjectID',
			viewDate: cfg.viewDate
		};
		
		cfg.columnConfig = Ext.merge(columnCfg, cfg.columnConfig);
		
		cfg = Ext.applyIf(cfg, {
			cardConfig: {
				xtype: 'historicalcard'
			}
		});
		
		cfg = Ext.apply(cfg, {
			//enableCrossColumnRanking : false,
			//enableRanking: false,
			readOnly: true
		});
		
		this.callParent([cfg]);
	},
	
	updateViewDate: function(newViewDate){
		this.refresh({
			viewDate: newViewDate,
		});
	},
	
	refresh: function(newConfig) {
		//update the config
		Ext.merge(this, newConfig);
		if(newConfig.viewDate){
			this.columnConfig.viewDate = newConfig.viewDate;
		}

		//get the data again
		if (newConfig && (newConfig.types || newConfig.attribute || newConfig.columns)) {
			Ext.each(this.columnDefinitions, function(column) {
				column.destroy();
			});
			this._retrieveModels(this._parseColumns);
		} else {
			Ext.each(this.columnDefinitions, function(column) {
				var newColumnConfig = {storeConfig: this.storeConfig };
				if(newConfig.viewDate){
					newColumnConfig.viewDate = newConfig.viewDate;
				}
				column.refresh(newColumnConfig);
			}, this);
		}
	},
	
	_addColumn: function(column) {
		var config = Ext.applyIf(column, this.columnConfig);
		Ext.apply(config, {
			cardConfig: this.cardConfig,
			types: this.types,
			attribute: this.attribute,
			storeConfig: this.storeConfig,
			enableCrossColumnRanking: this.enableCrossColumnRanking,
			enableRanking: this.enableRanking,
			viewDate: this.viewDate,
			listeners: {
				aftercarddroppedsave: this._onAfterCardDroppedSave,
				ready: this._onColumnReady,
				scope: this
			},
			ddGroup: this.ddGroup
		});

		this.columnDefinitions.push(Ext.widget(config.xtype, config));
	},
});
