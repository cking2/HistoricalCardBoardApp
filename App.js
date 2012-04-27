Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items:[
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
                    fieldLabel: 'Query',
                    itemId: 'queryField',
                    anchor:'100%',
                    width: 700,
                    height: 300,
                    xtype: 'textarea',
                    value: '{\n\n}'
                },
                {
                    fieldLabel: 'Fields',
                    itemId: 'fieldsField',
                    anchor: '100%',
                    width: 700,
                    value: "ObjectID, _UnformattedID, Name"
                }
            ],
            
            buttons: [
                {
                    xtype: 'rallybutton',
                    text: 'Search',
                    itemId: 'searchButton'
                }
            ]
        },
        {
            xtype: 'panel',
            itemId: 'gridHolder',
            layout: 'fit',
            height: 400
        }
    ],
    launch: function() {
        var button = this.down('#searchButton');
        button.on('click', this.searchClicked, this);
    },
    
    searchClicked: function(){
        
        var queryField = this.down('#queryField');
        var query = queryField.getValue();
        var selectedFields = this.down('#fieldsField').getValue()
        if(selectedFields){
            if(selectedFields === 'true'){
                selectedFields = true;
            }
            else{
                selectedFields = selectedFields.split(', ');
            }
        }

        var callback = Ext.bind(this.processSnapshots, this);
        this.doSearch(query, selectedFields, callback);
    },
    
    doSearch: function(query, fields, callback){
        var workspace = this.context.getWorkspace().ObjectID;
        var queryUrl = 'https://rally1.rallydev.com/analytics/1.32/'+ workspace +
                        '/artifact/snapshot/query.js';
        var params = {
            find: query
        };
        
        if(fields){
            params.fields = Ext.JSON.encode(fields);
        }
        
        Ext.Ajax.cors = true;
        Ext.Ajax.request({
            url: queryUrl,
            method: 'GET',
            params: params,
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
            columns: columns
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
