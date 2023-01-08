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
				// Define Variable
				var recordArray = [];
					var scriptObj = runtime.getCurrentScript();
			
			   // Get the Number of customers to create/delete
				var numOfCustomers = scriptObj.getParameter({
					name: 'custscript_atnv_num_of_cus_to_create'
				});
				
			// Looping the Customers to create/delete
			for(var i=0;i<numOfCustomers;i++)
			{
				recordArray.push({
					subsidiary: "Attentive Mobile USA",
					companyname: "Dummy Customer"
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
				var cusDeleteCheck = scriptObj.getParameter({
					name: 'custscript_atnv_customer_del_check'
				});
				
				var values = JSON.parse(context.values[0]);
				log.debug("values",values);
				  
				  var customerObj = record.create({
										type: 'customer',
										isDynamic: false
										});
								customerObj.setValue({
										fieldId: 'subsidiary',
										value: 1
										});
								customerObj.setValue({
										fieldId: 'companyname',
										value: "Dummy Company"
										});
							var customerId = customerObj.save();
							
				if(cusDeleteCheck)
				{
				                 record.delete({
											type: 'customer',
											id: customerId,
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