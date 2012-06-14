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
			viewDate: cfg.viewDate,
			parentCardboard: this
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
		this.createAnimationOverlay();
		this.refresh({
			viewDate: newViewDate,
			startHidden: true
		});
		//remove excess dnd elements
		Ext.each(Ext.query(".x-dd-drag-proxy"), function(item) {
			Ext.removeNode(item);
		});
	},
	
	createAnimationOverlay: function() {
		this.overlay = Ext.widget('container', {
			renderTo: Ext.getBody()
		});
		var overlayEl = this.overlay.getEl();
		overlayEl.setOpacity(0);
		overlayEl.setStyle("position", "absolute");
		overlayEl.addCls("cardboard");
		overlayEl.setSize(this.getWidth(), this.getHeight());
		overlayEl.setLeft(this.getEl().getX());
		overlayEl.setTop(this.getEl().getY());
		overlayEl.setStyle("z-index", "1");
		//overlayEl.setStyle("background-color", "blue");
		Ext.each(this.columnDefinitions, function(column) {
			Ext.each(column.cards, function(card) {
				var oldCardConfig = card.config;
				var newCard = Ext.widget(oldCardConfig.xtype, oldCardConfig);
				this.overlay.add(newCard);
				var newCardEl = newCard.getEl();
				newCardEl.setStyle("position", "absolute");
				newCardEl.setBox(card.posBox);
			}, this);
		}, this);
		
		overlayEl.setOpacity(1);
		
		Ext.each(this.overlay.items.items, function(ocards) {
			ocards.getEl().setOpacity(1);
		}, this);
	},
	
	getColumnByName: function(columnName) {
		Ext.Array.each(this.columnDefinitions, function(column){
			if(column.getValue() === columnName){
				return column;
			}
		});
		
		return null;
	},
	
	animateDelta: function() {
		debugger;
		console.log("Animating");
		if(!this.overlay){
			return;
		}
	
		var toDelete = [];
		var toMove = [];
	
		Ext.each(this.overlay.items.items, function(ovCard) {
			var objectID = ovCard.record.get('ObjectID');
			var key = ""+ objectID;
			var found = false;
			// try to find old card in new data
			for(var i=0; i < this.columnDefinitions.length; ++i){
				var column = this.columnDefinitions[i];
				var newCard = column.objectIDToCardMap[key];
				if(newCard){
					found = true;
					var moveRecord = {
						oldCard: ovCard,
						newCard: newCard
					}; 
					toMove.push(moveRecord);
					break;
				}
			}
			
			if(!found){
				toDelete.push(ovCard);
			}
			
		}, this);
		
		this.storiesToDelete = toDelete.length;
		if(this.storiesToDelete === 0) {
			this.moveOldStories(toMove);
		}
		
		Ext.each(toDelete, function(card) {
			card.animate({
				to: {
					opacity: 0
				},
				listeners: {
					afteranimate: function(){
						this.storiesToDelete--;
						if(this.storiesToDelete === 0){
							this.moveOldStories(toMove);
						}
					}, 
					scope: this
				}
			});	
		}, this);
		
	},
	
	moveOldStories: function(toMove){
		this.storiesToMove = toMove.length;
		if(this.storiesToMove === 0) {
			this.displayNewStories();
		}
		Ext.each(toMove, function(cards) {
			cards.oldCard.animate({
				duration: 1000,
				to: {
					x: cards.newCard.posBox.x,
					y: cards.newCard.posBox.y
				},
				listeners: {
					afteranimate: function(){
						if(cards.oldCard.record.get('Ready') != cards.newCard.record.get('Ready')) {
							if(cards.newCard.record.get('Ready')) {
								cards.oldCard.getEl().child(".card").addCls("ready");
							} else {
								cards.oldCard.getEl().child(".card").removeCls("ready");
							}
						}
						if(cards.oldCard.record.get('Blocked') != cards.newCard.record.get('Blocked')) {
							if(cards.newCard.record.get('Blocked')) {
								cards.oldCard.getEl().child(".card").addCls("blocked");
							} else {
								cards.oldCard.getEl().child(".card").removeCls("blocked");
							}
						}
						this.storiesToMove--;
						if(this.storiesToMove === 0){
							this.displayNewStories();
						}
					}, 
					scope: this
				}
			});
		}, this);
	},
	
	displayNewStories: function(){
		this.columnsToDisplay = this.columnDefinitions.length;
		this.storiesToDisplay = {};
		Ext.each(this.columnDefinitions, function(column) {
			this.columnsToDisplay--;
			var columnName = column.getValue();
			this.storiesToDisplay[columnName] = column.cards.length;
			Ext.each(column.cards, function(card) {
				card.animate({
					duration: 1000,
					to: {
						opacity: 1
					},
					listeners: {
						afteranimate: function(){
							this.storiesToDisplay[columnName]--;
							if(this.columnsToDisplay === 0 && this.storiesToDisplay[columnName] === 0){
								Ext.destroy(this.overlay);
								delete this.overlay;
							}
						},
						scope: this
					}
				});
			}, this);
		}, this);
	},
	
	refresh: function(newConfig) {
		Ext.merge(this, newConfig);
		if(newConfig.viewDate){
			this.columnConfig.viewDate = newConfig.viewDate;
			this.columnConfig.startHidden = newConfig.startHidden;
		}

		//get the data again
		this.stillToLoad = this.columnDefinitions.length;
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
					newColumnConfig.startHidden = newConfig.startHidden;
				}
				column.refresh(newColumnConfig);
			}, this);
		}
		
	},
	
	_parseColumns: function(models) {
		this.callParent(arguments);
		//this.stillToLoad = this.columnDefinitions.length;
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
			startHidden: this.startHidden,
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
