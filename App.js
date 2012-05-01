Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items:[
		/* 
        {
            xtype: 'panel',
            layout: 'anchor',
            border: true,
            fieldDefaults: {
                labelWidth: 40
            },
            defaultType: 'textfield',
            bodyPadding: 5,
            items: [
                {
                    fieldLabel: 'View Date:',
                    itemId: 'viewDateField',
                    anchor:'100%',
                    width: 700,
                    value: 'current'
                },
                {
                    xtype: 'rallybutton',
					text: 'RUN FOR IT MARTY!',
					itemId: 'renderButton'
                }
            ]
        },
		*/
        {
			xtype: 'container',
			itemId: 'cardboardHolder'
		}
    ],
    launch: function() {
		this.down('#cardboardHolder').add({
			xtype: 'historicalcardboard',
			itemId: 'cardboard',
			types: ['HierarchicalRequirement', 'Defect'],
			attribute: 'KanbanState',
			viewDate: 'current',
			columnConfig: {
				appContext : this.context
			},
			columns: [ { value: "Initial AC" }, { value: "Ranked" }, { value: "In Dev" }, { value: "In Test" }, { value: "Accepted" }, { value: "Merged" }, { value: "Released" } ]
		});
	
		/* TODO
        var button = this.down('#renderButton');
        button.on('click', this.renderClicked, this);
		*/
    },
    
    renderClicked: function(){
        var viewDateField = this.down('#viewDateField');
        var viewDate = viewDateField.getValue();
		
		if( !(viewDate && viewDate.length > 0)) {
			viewDate = 'current';
		}
		
		this.down('#cardboard').setViewDate(viewDate);
    },
    
    createSortMap: function(csvFields){
        var fields = csvFields.split(', ');
        var sortMap = {};
        for(var field in fields){
            if(fields.hasOwnProperty(field)){
                sortMap[field] = 1;
            }
        }
        
        return sortMap;
    },
    
    doSearch: function(query, fields, sort, pageSize, callback){
        var workspace = this.context.getWorkspace().ObjectID;
        var queryUrl = 'https://rally1.rallydev.com/analytics/1.32/'+ workspace +
                        '/artifact/snapshot/query.js';
        var params = {
            find: query
        };
        
        if(fields){
            //TODO can't handle $slice expression
            params.fields = Ext.JSON.encode(fields);
        }
        
        if(sort){
            params.sort = sort;
        }
        
        if(pageSize){
            params.pagesize = pageSize;
        }
        
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
    
        var selectedFields = this.getFieldsFromSnapshots(snapshots);
        
        var snapshotStore = Ext.create('Ext.data.Store', {
            storeId:'snapshotStore',
            fields: selectedFields,
            data: {'items': snapshots},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });
        
        var columns = this.createColumnsForFields(selectedFields);
        var snapshotGrid = Ext.create('Ext.grid.Panel', {
            title: 'Snapshots',
            //store: Ext.data.StoreManager.lookup('snapshotStore'),
            store: snapshotStore,
            columns: columns,
            height: 400
        });
        
        var gridHolder = this.down('#gridHolder');
        gridHolder.removeAll(true);
        gridHolder.add(snapshotGrid);
    },
    
    getFieldsFromSnapshots: function(snapshots){
        if(snapshots.length === 0){
            return [];
        }
        
        var snapshot = snapshots[0];
        var fields = [];
        for(var key in snapshot){
            if (snapshot.hasOwnProperty(key)){
                fields.push(key);
            }
        }
        
        return fields;
    },
    
    createColumnsForFields: function(fields){
        var columns = [];
        for(var i=0; i < fields.length; ++i){
            var col = {
                header: fields[i],
                dataIndex: fields[i]
            };
            
            if(fields[i] === 'Name'){
                col.flex = 1;
            }
            columns.push(col);
        }
        
        return columns;
    }
});
