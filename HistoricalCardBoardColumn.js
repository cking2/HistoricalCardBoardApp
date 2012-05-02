Ext.define('Rally.ui.cardboard.HistoricalCardBoardColumn', {
    extend: 'Rally.ui.cardboard.Column',
    componentCls: 'historical-cardboard-column',
	alias: 'widget.historicalcardboardcolumn',
	
	constructor: function(config) {
		this.callParent([config]);
	},
	
	_queryForData: function() {
		Rally.data.ModelFactory.getModels({
			types: this.types,
			success: this.loadSnapshots,
			scope: this
		});
	},
	
	loadSnapshots: function(models){
	
		this.models = models;
		
		var queryObj = {
			"__At": this.viewDate,
			"KanbanState": this.getValue(),
			"_ProjectHierarchy": this.appContext.getProject().ObjectID,
			"_Type": {"$in": this.types }
		};
		
		var query = Ext.JSON.encode(queryObj);
		
		//var workspace = Rally.environment.externalContext.scope.workspace.ObjectID;
		var workspace = this.appContext.getWorkspace().ObjectID;
        var queryUrl = 'https://rally1.rallydev.com/analytics/1.32/'+ workspace +
                        '/artifact/snapshot/query.js';
        var params = {
            find: query
        };
        
		params.fields = Ext.JSON.encode(["Rank", "KanbanState", "ObjectID", "Owner", "Name", "_UnformattedID", "Blocked", "Ready", "_ValidFrom", "_Type", "Project", "_ProjectHierarchy"]);
		var sortObj = {
			"_ValidFrom": 1
		};
        params.sort = Ext.JSON.encode(sortObj);
        params.pagesize = 200;
		
		Ext.Ajax.cors = true;
        Ext.Ajax.request({
            url: queryUrl,
            method: 'GET',
            params: params,
            withCredentials: true,
            success: function(response){
                var text = response.responseText;
                var json = Ext.JSON.decode(text);
                this.processSnapshots(json.Results);
            },
			scope: this
        });
	},
	
	processSnapshots: function(snapshots){
		var allRecords = [];
		var ownerOidsMap = {};

		var l = snapshots.length;
		for(var i=0; i < l; ++i){
			var snapshot = snapshots[i];
			allRecords.push( this.convertSnapshotToModel(snapshot) );
			
			if(!snapshot.Owner){
				continue;
			}
			
			// dear reader: I'm sorry, avoiding 0 being falsy
			var key = ""+snapshot.Owner;
			var ownerEntry = ownerOidsMap[(key)];
			if(!ownerEntry){
				ownerEntry = [];
				ownerOidsMap[key] = ownerEntry
			}
			ownerEntry.push(i+1);
		}
		
		var ownerOids = [];
		for(var field in ownerOidsMap){
			if(ownerOidsMap.hasOwnProperty(field)){
				ownerOids.push(field);
			}
		}
		
		var me = this;
		var usersFetchedCallback = Ext.bind(function(store, users){
			for(var j=0; j < users.length; ++j){
				var user = users[j];
				var ownerName = user.get('_refObjectName');
				var ownerEntry = ownerOidsMap[""+user.get('ObjectID')];
				if(ownerEntry){
					for(var k=0; k < ownerEntry.length; ++k){
						var ownerIndex = ownerEntry[k];
						// compensate for previous addition
						allRecords[ownerIndex -1].set('Owner', {
							Name: ownerName,
							ObjectID: user.get('ObjectID')
						});
					}
				}				
			}
			
			// we now have all the data and can add the cards
			this.addCardsWithOwners(allRecords);
			
			this.parentCardboard.stillToLoad--;
			if(this.parentCardboard.stillToLoad === 0){
				this.parentCardboard.animateDelta();
			}
			
		}, this);
		
		this.getUsersByOids(ownerOids, usersFetchedCallback);
    },
	
	getUsersByOids: function(ownerOids, usersFetchedCallback){
		if(ownerOids.length == 0){
			usersFetchedCallback(null, []);
			return;
		}
	
		var filter = Ext.create('Rally.data.QueryFilter', {
			 property: 'ObjectID',
			 value: ownerOids.pop()
		});
		
		Ext.Array.each(ownerOids, function(ownerOid){
			filter = filter.or({
				property: 'ObjectID',
				value: ownerOid
			});
		});
	
		var userStore = Ext.create('Rally.data.WsapiDataStore', {
			model: 'User',
			fetch: ['ObjectID', '_refObjectName'],
			autoLoad: true,
			filters: [filter],
			listeners: {
				load: usersFetchedCallback,
				scope: this
			}
		});
	},
	
	addCardsWithOwners: function(records){
		this.createAndAddCards(records);
		this.fireEvent("dataretrieved", this, records);
	},
	
	convertSnapshotToModel: function(snapshot){
		var type = snapshot._Type[snapshot._Type.length-1];
		return new this.models[type](snapshot);
	},
	
	createAndAddCard: function(record, index) {
		if(this.isMatchingRecord(record)) {
			var config = Ext.applyIf({
				 record: record
			}, this.cardConfig);
			
			if(this.startHidden){
				config.style = 'opacity: 0';
			}
			var card = Ext.widget(config.xtype, config);

			this.addCard(card, index);
		}
	},
	
	addCard: function(card, index) {
		
		if(!this.cards){
			this.cards = [];
			this.objectIDToCardMap = {};
		}
		
		this.cards.push(card);
		var key = ""+ card.record.get('ObjectID');
		this.objectIDToCardMap[key] = card;
		
		if(!this.objectIDToCardMap){
			this.objectIDToCardMap = {};
		}
		
		this.callParent(arguments);

		var key = ""+ card.record.get('ObjectID');
		this.objectIDToCardMap[key] = card;
		
		card.posBox = card.getEl().getBox();
		
		// card.getEl().on('mouseover', function(){
			// console.log('x,y ='+ card.getEl().getX());
		// });
	},
	
	refresh: function(newConfig) {
		this.callParent(arguments);
		this.cards = [];
		this.objectIDToCardMap = {};
	},
});