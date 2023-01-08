/**
 * Script Type: Map/Reduce
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
				// Define Variables
				var recordArray = [];
					var scriptObj = runtime.getCurrentScript();
			
			// Get the Number of Subscriptions to create
				var numOfSubs = scriptObj.getParameter({
					name: 'custscript_atnv_param_num_of_subs_to_cre'
				});
				
			// Looping the number of Subscriptions to create
			for(var i=0;i<numOfSubs;i++)
			{
				recordArray.push({
					customer: "27932 Dummy Company",
					subscriptionname: "Dummy Subscription"
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
				// Get the Script Paramater to delete created Subscription or Not and customer.
			var scriptObj = runtime.getCurrentScript();	
				var subsDeleteCheck = scriptObj.getParameter({
					name: 'custscript_atnv_param_subs_delete'
				});
				var getCustomer = scriptObj.getParameter({
					name: 'custscript_atnv_param_customer_for_subs'
				});
				
				// Parsing the static Date String to Date
				var startDate = format.parse({
							value: '11/1/2022',
							type: format.Type.DATE
							});
				var endDate = format.parse({
							value: '11/30/2022',
							type: format.Type.DATE
							});
				
				var values = JSON.parse(context.values[0]);
				log.debug("values",values);
				  
				  // Create Subscription
				  var subscriptionObj = record.create({
										type: 'customrecordzab_subscription',
										isDynamic: false
										});
						
                            // Set the Values on the Subscription record.						
								subscriptionObj.setValue({
										fieldId: 'custrecordzab_s_customer',
										value: getCustomer
										});
								subscriptionObj.setValue({
										fieldId: 'name',
										value: "Dummy Subscription"
										});
								subscriptionObj.setValue({
										fieldId: 'custrecordzab_s_start_date',
										value: startDate
										});
								subscriptionObj.setValue({
										fieldId: 'custrecordzab_s_end_date',
										value: endDate
										});
								subscriptionObj.setValue({
										fieldId: 'custrecordzab_s_charge_schedule',
										value: 9
										});
								subscriptionObj.setValue({
										fieldId: 'custrecord_scg_billing_plan',
										value: 1
										});
								subscriptionObj.setValue({
										fieldId: 'custrecordzab_s_consolidate_billing',
										value: false
										});
							var subscriptionId = subscriptionObj.save();   // Save the Subscription
							
				if(subsDeleteCheck)     // Check for deleting the Subscription created
				{
					// Search on Charge record
					var customrecordzab_chargeSearchObj = search.create({
					            type: "customrecordzab_charge",
							   filters:
							   [
								  ["custrecordzab_c_subscription","anyof",subscriptionId]
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
				
				// Search on Subscription Item
			var customrecordzab_subscription_itemSearchObj = search.create({				
							type: "customrecordzab_subscription_item",
							   filters:
							   [
								  ["custrecordzab_si_subscription","anyof",subscriptionId]
							   ],
							   columns:
							   [
								  search.createColumn({name: "internalid", label: "Internal ID"})
							   ]
							});
							var searchResultCount = customrecordzab_subscription_itemSearchObj.runPaged().count;
							log.debug("customrecordzab_subscription_itemSearchObj result count",searchResultCount);
							customrecordzab_subscription_itemSearchObj.run().each(function(result){
							   // .run().each has a limit of 4,000 results
							   var subsItem = result.getValue('internalid');
							               
							               record.delete({                                    // Delete the Subscription Item
														type: 'customrecordzab_subscription_item',
														id: subsItem,
														});
							   return true;
							});
							
							
							// Delete the Subscription record.
				                 record.delete({
											type: 'customrecordzab_subscription',
											id: subscriptionId,
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