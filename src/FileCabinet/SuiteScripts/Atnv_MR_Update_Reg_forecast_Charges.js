/**
 * Ticket: FSP-137
 * Script Type: Map/Reduce
 * File Name: Atnv_MR_Update_Reg_forecast_Charges.js
 * Script:	ATNV | MR | Update Reg Forecast Charges   [customscript_atnv_mr_updte_reg_forecast]
 * Parameter: custscript_atnv_mr_updte_reg_charge
 * Deployment:	ATNV | MR | Update Reg Forecast Charges   [customdeploy_atnv_mr_updte_reg_forecast]
 * Schedule: Start from 7th Day of the Month
 *
 * Description: This Script Updates the Regenerate Forecast Charges to true and Queue charge Generation to False on Zab Subscription Item.
 * 
 * Date			               Author	                   Remarks
 * 23,June-2022               Janardhan S                  This Script Updates the Regenerate Forecast Charges to true and Queue charge Generation to False on Zab Subscription Item.
 * 
 * 
 */

/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/email', 'N/runtime', 'N/error'],
	function (search, record, email, runtime, error) {
		// Start Of GetInput Data
		function getInputData(context) {
			try {
				var scriptObj = runtime.getCurrentScript();
				var zabSubscriptionItemObj;
				var zabSubscriptionItem = scriptObj.getParameter({
					name: 'custscript_atnv_mr_updte_reg_charge'
				});
				
								var myDate = new Date();
								var getCurrentDay = myDate.getDate();
							log.debug('getCurrentDay',getCurrentDay);
							
							 var scheduledscriptinstanceSearchObj = search.create({
								 type: "scheduledscriptinstance",
								   filters:
								   [
									  ["script.internalid","anyof","60","581"], 
									  "AND", 
									  ["status","anyof","PENDING","PROCESSING"]
								   ],
								   columns:
								   [
									  search.createColumn({name: "mapreducestage", label: "Map/Reduce Stage"}),
									  search.createColumn({name: "status", label: "Status"})
								   ]
								});
var searchResultCount = scheduledscriptinstanceSearchObj.runPaged().count;
							
					if(Number(getCurrentDay) > 6 && searchResultCount == 0)                     // If Run Date exceeds 1st 6 days of the month then calls the search otherwise exit.
					{
						log.debug('getCurrentDay if',getCurrentDay);
			      zabSubscriptionItemObj =  search.load({
										id: zabSubscriptionItem
											}); 
					}
					else{
				  log.debug('Exit of Script','Exit of Script due to Rating Running/Day Between 1 to 6');
					}
                return zabSubscriptionItemObj;
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
				log.debug('values',values);
				
				var zabSubsItemId = values.id;
				var recType = values.recordType;
								log.debug('values',values);
								log.debug('recType',recType);
								log.debug('zabSubsItemId',zabSubsItemId);


				record.submitFields({
							type: recType,
							id: zabSubsItemId,
							values: {
								 custrecord_att_si_queue_fc_regen:false,
							     custrecordzab_si_generate_forecast_charg:true
							},
							options: {
								enableSourcing: false,
								ignoreMandatoryFields : false
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

		// Summarize the Results
		function summarize(summary) {
			try {
				var totalRecordsUpdated = 0;
				summary.output.iterator().each(function (key, value) {
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