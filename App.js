Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items:[
    	{
    		xtype: 'component',
    		itemId: 'titleDate',
    		html: '<h1>Current Date: '+ Rally.util.DateTime.format(new Date(), "Y-m-d\\Th:i T(P)") +'</h1>',
    		style: 'text-align:center; font-size: 24px; margin: 10px 10px'
    	},
        {
            xtype: 'container',
            layout: 'auto',
            style: 'text-align:center',
            border: false,
            height: 60,
            defaults: {
				style: 'float:left; margin: 5px 5px'
			},
            defaultType: 'rallydatefield',
            items: [
                {
                    itemId: 'startDateField',
                    width: 100,
                    value: Rally.util.DateTime.add(new Date(), "day", -10)
                },
                {
                	xtype: 'container',
                	itemId: 'sliderHolder',
					layout: 'fit',
					width: 700
    			},
    			{
                    itemId: 'endDateField',
                    width: 100,
                    value: new Date()
                }
            ]
        },
        {
			xtype: 'container',
			itemId: 'cardboardHolder'
		}
    ],
    
    launch: function() {
    
    	var startDate = this.getStartDate();
    	var endDate = this.down('#endDateField').getValue();
    	this.currentDate = endDate;
    
    	var noDays = Rally.util.DateTime.getDifference(endDate, startDate, 'day');
    	var app = this;
    
    	this.down('#sliderHolder').add({
			xtype: 'slider',
			itemId: 'dateSlider',
			hideLabel: true,
			width: 700,
			increment: 1,
			minValue: 0,
			maxValue: noDays,
			value: noDays,
			tipText: function(thumb){
				var tickerDate = Rally.util.DateTime.add(app.getStartDate(), "day", thumb.value);
				return Ext.String.format('<b>{0}</b>',  Rally.util.DateTime.format(tickerDate, "m/d/Y"));
			},
			listeners: {
				'changecomplete': this.onDateChanged,
				scope: this
			}
		});
    
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
    },
    
    getStartDate: function(){
    	return this.down('#startDateField').getValue();
    },
    
    setCurrentDate: function(newDate){
    	this.currentDate = newDate;
    	this.setTitleDate(newDate);
    	this.down('#cardboard').updateViewDate(newDate);
    },
    
    setTitleDate: function(date){
    	var title = '<h1>Current Date: '+ Rally.util.DateTime.format(date, "Y-m-d\\Th:i T(P)") +'</h1>';
    	this.down('#titleDate').update(title);
    },
    
    getDateSliderValue: function(){
    	var tickCount = this.down('#dateSlider').getValue();
    	var date = Rally.util.DateTime.add(this.getStartDate(), "day", tickCount);
    	return date;
    },
    
    onDateChanged: function(slider, newTickCount){
    	var newDate = this.getDateSliderValue();
    	this.setCurrentDate(newDate);
    }
});
