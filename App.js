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
			columns: [ { value: "Initial AC" }, { value: "Ranked" }, { value: "In Dev" }, { value: "In Test" }, { value: "Accepted" }, { value: "Merged" } ]
		});
	
        var button = this.down('#renderButton');
        button.on('click', this.renderClicked, this);
    },
    
    renderClicked: function(){
        var viewDateField = this.down('#viewDateField');
        var viewDate = viewDateField.getValue();
		
		if( !(viewDate && viewDate.length > 0)) {
			viewDate = 'current';
		}
		
		this.down('#cardboard').updateViewDate(viewDate);
    }
});
