 Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'iteration',
    comboboxConfig: {
        fieldLabel: 'Select an Iteration:',
        labelWidth: 100,
        width: 300
    },
  
    onScopeChange: function() {
	 if (this.down('#myChart')) {
	    this.down('#myChart').destroy();
	 }
	this._myMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait.This may take long if you have thousands of results..."});
        this._myMask.show();
	this._myStore = Ext.create('Rally.data.wsapi.Store', {
           model: 'UserStory',
	   limit: Infinity,
           fetch: ['ScheduleState','FormattedID',],
	   filters: [this.getContext().getTimeboxScope().getQueryFilter()],
           autoLoad: true,
           listeners: {
              load: this._onDataLoaded,
              scope: this
            }
       });
    },
     _onDataLoaded: function(store, data) {
        console.log('data',data);
          this._myMask.hide();
	  var records = [];
	  var verdictsGroups = ["Defined","In-Progress","Completed","Accepted"]

	  var definedCount = 0;
	  var inProgressCount = 0;
          var completedCount = 0;
          var acceptedCount = 0;
	  
	  var getColor = {
	      'Defined': '#CC9900',
	      'In-Progress': '#CCCC00', 
	      'Completed': '#99CC00',
              'Accepted': '#669900',
	  };

	  _.each(data, function(record) {
	      var scheduleState = record.get('ScheduleState');
	      switch(scheduleState)
	      {
		case "Defined":
		     definedCount++;
		      break;
                case "In-Progress":
		      inProgressCount++;
		      break;
		case "Completed":
		      completedCount++;
		      break;
		case "Accepted":
		      acceptedCount++;
	      }
	  });
	  if (this.down('#myChart')) {
		      this.remove('myChart');
	  }

	  this.add(
	      {
            xtype: 'rallychart',
            height: 400,
            storeType: 'Rally.data.WsapiDataStore',
            store: this._myStore,
            itemId: 'myChart',
            chartConfig: {
                chart: {
                    type: 'pie'
                },
                title: {
                    text: 'User Stories Count',
                    align: 'center'
                },
                tooltip: {
                    formatter: function () {
                       //return this.point.name + ': <b>' + Highcharts.numberFormat(this.percentage, 1) + '%</b><br />' + this.point.y;
                       return this.point.name + '<br />' + this.point.y; //by number. Comment out and uncomment the one above if want %
                        }
                },
                plotOptions : {
                     pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        point: {
                            events: {
                                click: function(event) {
                                    var options = this.options;
                                    alert(options.name + ' clicked');
                                }
                            }
                        },
                        dataLabels: {
                            enabled: true,
                            color: '#000000',
                            connectorColor: '#000000'
                        }
                    }
                }
            },            
            chartData: {
                series: [ 
                    {   
                        name: 'ScheduleStates',
                        data: [
                            {name: 'Defined',
                            y: definedCount,
                            color: getColor['Defined']
                            },
                            {name: 'In-Progress',
                            y: inProgressCount,
                            color: getColor['In-Progress']
                            },
                            {name: 'Completed',
                            y: completedCount,
                            color: getColor['Completed']
                            },
                            {name: 'Accepted',
                            y: acceptedCount,
                            color: getColor['Accepted']
                            }
                        ]
                    }
                ]
            }
	    }
	);
	this.down('#myChart')._unmask();
    }
     
 });
