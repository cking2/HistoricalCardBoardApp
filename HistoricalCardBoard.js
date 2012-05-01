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
			enableCrossColumnRanking : false,
			enableRanking: false,
			readOnly: true
		});
		
		this.callParent([cfg]);
	},
});
