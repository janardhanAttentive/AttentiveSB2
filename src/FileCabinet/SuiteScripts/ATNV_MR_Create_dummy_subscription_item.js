/**
 * Script Type:
 * File Name: ATNV_MR_Create_dummy_customer.js
 * Script:	ATNV | MR | Create Dummy Customer  [customscript_atnv_mr_create_dum_customer]
 * 				Parameter: 
 * Deployment:	 ATNV | MR | Create Dummy Customer  [customdeploy_atnv_mr_create_dum_customer]
 *
 * Description: 
 * 
 * Date			        Author	              Remarks
 * 24-11-2022           Janardhan S           This Script creates Dummy Customers and Delete based on the Paramter Defined
 * 
 */

/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/email', 'N/runtime', 'N/error', 'N/format'],
	function (search, record, email, runtime, error, format) {
		// Start Of GetInput Data
		function getInputData(context) {
			try {
				var recordArray = [];
					var scriptObj = runtime.getCurrentScript();
			
				var numOfSubsItems = scriptObj.getParameter({
					name: 'custscript_atnv_param_subs_item_to_creat'
				});
				
			for(var i=0;i<numOfSubsItems;i++)
			{
				recordArray.push({
					itemName: "Carrier Fees (Placeholder)",
					subscription: "Dummy Subscription"
				});
			}
			//	var jsonData = JSON.parse(transData);
				log.debug({
					title: 'recordArray',
					details: recordArray
				});
				return recordArray;
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
			var scriptObj = runtime.getCurrentScript();	
				var subsItemDeleteCheck = scriptObj.getParameter({
					name: 'custscript_atnv_param_subs_item_to_check'
				});
				var getSubscription = scriptObj.getParameter({
					name: 'custscript_atnv_param_subs'
				});
				
				var revRecstartDate = format.parse({
							value: '11/1/2022',
							type: format.Type.DATE
							});
				var endDate = format.parse({
							value: '11/30/2022',
							type: format.Type.DATE
							});
				
				var values = JSON.parse(context.values[0]);
				log.debug("values",values);
				  
				  var subscriptionItemObj = record.create({
										type: 'customrecordzab_subscription_item',
										isDynamic: false
										});
						      
								subscriptionItemObj.setValue({
										fieldId: 'custrecordzab_si_subscription',
										value: getSubscription
										});
								subscriptionItemObj.setValue({
										fieldId: 'custrecordzab_si_item',
										value: 106
										});
								subscriptionItemObj.setValue({
										fieldId: 'name',
										value: "Carrier Fees (Placeholder)"
										});		
								subscriptionItemObj.setValue({
										fieldId: 'custrecord_att_si_revrecstartdate',
										value: revRecstartDate
										});
							var subscriptionItemId = subscriptionItemObj.save();
							
				if(subsItemDeleteCheck)
				{
					// Search on Charge record
					var customrecordzab_chargeSearchObj = search.create({
					            type: "customrecordzab_charge",
							   filters:
							   [
								  ["custrecordzab_c_subscription_item","anyof",subscriptionItemId]
							   ],
							   columns:
							   [
								  search.createColumn({name: "internalid", label: "Internal ID"})
							   ]
							});
							var searchResultCount = customrecordzab_chargeSearchObj.runPaged().count;
							log.debug("customrecordzab_chargeSearchObj result count",searchResultCount);
							customrecordzab_chargeSearchObj.run().each(function(result){
							   // .run().each has a limit of 4,000 results
							   var chargeId = result.getValue('internalid');
										 record.delete({                                     // Delete the Charge
														type: 'customrecordzab_charge',
														id: chargeId,
														});
							   return true;
							});
							
				                 record.delete({
											type: 'customrecordzab_subscription_item',
											id: subscriptionItemId,
											});
				}

				context.write(context.key, context.values.length);

			} 
			catch (error) {
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