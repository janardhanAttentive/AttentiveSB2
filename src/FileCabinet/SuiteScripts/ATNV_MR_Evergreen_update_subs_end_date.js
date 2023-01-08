/**
 * Ticket: FSP-237
 * Script Type: Map/Reduce
 * File Name: ATNV_MR_Evergreen_update_subs_end_date.js
 * Script:	ATNV |MR| Evergreen Updte Subs End Date   [customscript_atnv_mr_updte_sub_end_date]
 * Parameter: Subscription Search [custscript_atnv_param_subscr_search], Subscription Item Search [custscript_atnv_param_subscr_item_search]
 * Deployment:	ATNV |MR| Evergreen Updte Subs End Date   [customdeploy_atnv_mr_updte_sub_end_date]
 *
 * 
 * Date			    Version           Author	                    Remarks
 * 22,August-2022    1.00             Janardhan S                   Part 1: This Script updates the Subscription Item End Date when the ZAB Subscription Item End Date is in the current month 
																	by adding the number of months in Evergreen Period in Months Field to the End Date.
																	Part 2:
																	This Script updates the ZAB Subscription End Date when the ZAB Subscription End Date is in the current month.
																	The script will update the End Date of the Subscription by adding the number of months in Evergreen Period in Months Field to the End Date.
 * 
 * 
 */

/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/email', 'N/runtime', 'N/error', 'N/format', 'N/task'],
    function(search, record, email, runtime, error, format, task) {
        // Start Of GetInput Data
        function getInputData(context) {
            try {
                var scriptObj = runtime.getCurrentScript();
                var zabSubscriptionSearch = scriptObj.getParameter({
                    name: 'custscript_atnv_param_subscr_search'
                });
				var zabSubscriptionObj;
				
				var myDate = new Date();
								var getCurrentDay = myDate.getDate();
							log.debug('getCurrentDay',getCurrentDay);
							
				  if(Number(getCurrentDay) > 15)                     // If Run Date exceeds 1st 15 days of the month then calls the search otherwise exit.
					{
                 zabSubscriptionObj = search.load({
                    id: zabSubscriptionSearch
                });
					}
                return zabSubscriptionObj;
            } catch (error) {
                log.error({
                    title: 'error',
                    details: error
                });
                throw error;
            }
        }


        function reduce(context) {
            try {

                var values = JSON.parse(context.values[0]);
                log.debug('values', values);

                var scriptObj = runtime.getCurrentScript();
                var zabSubscriptionItemSearch = scriptObj.getParameter({
                    name: 'custscript_atnv_param_subscr_item_search'
                });

                var zabSubsId = values.id;
                var zabRecType = values.recordType;
                log.debug('zabSubsId', zabSubsId);
                var evergreenDate = values.values.formuladate;
                log.debug('evergreenDate', evergreenDate);
				
				  var parseEvergreenDate = format.parse({
                        value: evergreenDate,
                        type: format.Type.DATE
                    });


                var zabSubscriptionItemObj = search.load({
                    id: zabSubscriptionItemSearch
                });


                var filters = zabSubscriptionItemObj.filters; //reference Search.filters object to a new variable
                var filterSubs = search.createFilter({ //create new filter
                    name: 'custrecordzab_si_subscription',
                    operator: search.Operator.ANYOF,
                    values: zabSubsId
                });
                filters.push(filterSubs); //add the filter using .push() method 


                var searchResult = zabSubscriptionItemObj.run().getRange({
                    start: 0,
                    end: 1000
                });
                for (var i = 0; i < searchResult.length; i++) {
                    var getSubs_ItemName;
                    var getSubs_ItemEndDate;
                    var getEvergreen_Months;
                    var getSubs_ItemId;
					var getFinalEndDate;
                  
                    getSubs_ItemId = searchResult[i].getValue({
                        name: 'internalid'
                    });
                    
					getFinalEndDate = searchResult[i].getValue({
                        name: "formuladate"
                    });

					log.debug('getFinalEndDate', getFinalEndDate);
					
					var parseFinalEndDate = format.parse({
                        value: getFinalEndDate,
                        type: format.Type.DATE
                    });
                    log.debug('parseFinalEndDate', parseFinalEndDate);

                    record.submitFields({
                        type: 'customrecordzab_subscription_item',
                        id: getSubs_ItemId,
                        values: {
                            custrecordzab_si_end_date: parseFinalEndDate
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: false
                        }
                    });
                }

          
                record.submitFields({
                    type: zabRecType,
                    id: zabSubsId,
                    values: {
                        custrecordzab_s_end_date: parseEvergreenDate
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: false
                    }
                });
            

                context.write(context.key, context.values.length);

            } catch (error) {

                log.error({
                    title: 'mapReduce.summarize',
                    details: error
                });
                throw error;
            }

        }

   /*
        function addMonths(DateObj,EvergreenMonths) {
			var lastDayOfMonth = new Date(DateObj.getFullYear(), DateObj.getMonth()+1, 0);
            log.debug('lastDayOfMonth', lastDayOfMonth.getDate());
			  var getLastDay = lastDayOfMonth.getDate();
			  var getDay = DateObj.getDate();
			  
			  if(getLastDay == getDay)
			  {
				     var mmm =  DateObj.setMonth(DateObj.getMonth() + Number(EvergreenMonths)); 
					            log.debug('mmm',DateObj);
                      var calcDate = new Date(DateObj.getFullYear(), DateObj.getMonth(), 0);	
					  					            log.debug('calcDate', calcDate);
                         var calcLastDay = calcDate.getDate();
					            log.debug('calcLastDay', calcDate.getDate());
								DateObj.setDate(calcLastDay);
	 
			  }
              else{
            var currentMonth = DateObj.getMonth() + DateObj.getFullYear() * 12;
            log.debug('currentMonth', currentMonth);
            DateObj.setMonth(DateObj.getMonth() + Number(EvergreenMonths));
            var diff = DateObj.getMonth() + DateObj.getFullYear() * 12 - currentMonth;
            log.debug('diff', diff);
			  }

            if (diff != Number(EvergreenMonths)) {
                log.debug('diff1', diff);
                DateObj.setDate(0);
            }
            return DateObj;
        }
		*/

        // Summarize the Results
        function summarize(summary) {
            try {
                var totalRecordsUpdated = 0;
                summary.output.iterator().each(function(key, value) {
                    totalRecordsUpdated += parseInt(value);
                    return true;
                });
                log.audit('Summary Time', 'Total Seconds: ' + summary.seconds);
                log.audit('Summary Usage', 'Total Usage: ' + summary.usage);
                log.audit('Summary Yields', 'Total Yields: ' + summary.yields);
                log.audit({
                    title: 'Total records updated',
                    details: totalRecordsUpdated
                });
				
				var mrTask = task.create({
							taskType: task.TaskType.MAP_REDUCE,
							scriptId: 'customscript_atnv_mr_updte_subs_smb_scal',
							deploymentId: 'customdeploy_atnv_mr_updte_subs_smb_scal'
							});
					var mrTaskId = mrTask.submit();
					var taskStatus = task.checkStatus(mrTaskId);
					log.debug('taskStatus',taskStatus);
				
            } catch (error) {
                log.error({
                    title: 'mapReduce.summarize',
                    details: error
                });
                throw error;
            }
        }
        return {
            getInputData: getInputData,
            reduce: reduce,
            summarize: summarize
        };
    });