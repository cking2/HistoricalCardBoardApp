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
		
		var callback = Ext.bind(this.processSnapshots, this);
		
		Ext.Ajax.cors = true;
        Ext.Ajax.request({
            url: queryUrl,
            method: 'GET',
            params: params,
            withCredentials: true,
            success: function(response){
                var text = response.responseText;
                var json = Ext.JSON.decode(text);
                callback(json.Results);
            }
        });
	},
	
	processSnapshots: function(snapshots){
		var allRecords = [];
		var ownerOidsMap = {};
		
		var l = snapshots.length;
		for(var i=0; i < l; ++i){
			var snapshot = snapshots[i];
			allRecords.push( this.convertSnapshotToModel(snapshot) );
		}
		
		/*TODO add owner names
		var l = snapshots.length;
		for(var i=0; i < l; ++i){
			var snapshot = snapshots[i];
			// dear reader: I'm sorry, avoiding 0 being falsy
			var key = ""+snapshot.Owner;
			var ownerEntry = ownerOidsMap[(key)];
			if(!ownerEntry){
				ownerEntry = [];
				ownerOidsMap[key] = ownerEntry
			}
			ownerEntry.push(i+1);
			allRecords.push( this.convertSnapshotToModel(snapshot) );
		}
		
		var ownerOids = [];
		for(var field in ownerOidsMap){
			if(ownerOidsMap.hasOwnProperty(field)){
				ownerOids.push(field);
			}
		}
		
		var usersFetchedCallback = Ext.bind(function(owners){
			for(var j=0; j < owners.length; ++j){
				var user = owners[j];
				
				//TODO get username from user obj
				var ownerName = user.Name;
				var ownerEntry = ownerOidsMap[""+user.ObjectID];
				if(ownerEntry){
					for(var k=0; k < ownerEntry.length; ++k){
						var ownerIndex = ownerEntry[k];
						// compensate for previous addition
						allRecords[ownerIndex -1].Owner = {
							Name: ownerName,
							ObjectID: user.ObjectID;
						};
					}
				}				
			}
			
			// we now have all the data and can add the cards
			this.addCardsWithOwners(allRecords);
		},
		this);
		
		//TODO ajax call to get owners from oids, update HistorialCard.getOwnerDataFromRecord()
		//wsapi.getUsersByOids(ownerOids, usersFetchedCallback)
	*/
		//TODO delete when doing the callback
		this.createAndAddCards(allRecords);
		this.fireEvent("dataretrieved", this, allRecords);	
    },
	
	addCardsWithOwners: function(records){
		this.createAndAddCards(allRecords);
		this.fireEvent("dataretrieved", this, allRecords);
	},
	
	convertSnapshotToModel: function(snapshot){
		var type = snapshot._Type[snapshot._Type.length-1];
		
		var modelData = Ext.apply({}, snapshot);
		return new this.models[type](modelData);
	},
	
	addCard: function(card, index) {
		if(!this.objectIDToCardMap){
			this.objectIDToCardMap = {};
		}
		
		this.callParent(arguments);
		
		var key = ""+ card.record.get('ObjectID');
		this.objectIDToCardMap[key] = card;
	}
});