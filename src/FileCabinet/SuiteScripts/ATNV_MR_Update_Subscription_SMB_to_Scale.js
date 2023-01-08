/**
 * Script Type: Map/Reduce
 * File Name: ATNV_MR_Update_Subscription_SMB_to_Scale.js
 * Script:	ATNV | MR | Updte Subs SMB to Scale  [customscript_atnv_mr_updte_subs_smb_scal]
 * 			Parameter: custscript_atnv_param_smb_to_scale_searc
 * Deployment: ATNV | MR | Updte Subs SMB to Scale	   [customdeploy_atnv_mr_updte_subs_smb_scal]
 * Scheduled: This Script is Called by Map Reduce Script "ATNV |MR| Evergreen Updte Subs End Date".
 *
 * 
 * Date			Author	                        Remarks
 * 19-08-2022   Janardhan S                     This Script Updates the Billing Plan,Bill Carrier Fee,Upgrade Plan and Billing Plan change Date.
 *                                              Ticket: FSP-238
 * 22-12-2022   Janardhan S                     Updates the Subscription Item Rate,Overage Usage Rate,Additional Discount Description,Set to Scale,
                                                Queue Charge Generation.(Eliminate Workflow 243)
 *                                              
 * 
 */

/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/email', 'N/runtime', 'N/error', 'N/format', 'N/config'],
    function(search, record, email, runtime, error, format, config) {
        // Start Of GetInput Data
        function getInputData(context) {
            try {
				// Define the Script Parameter
                var scriptObj = runtime.getCurrentScript();
                var zabSearch = scriptObj.getParameter({                // Get the Subscription Saved Search Id
                    name: 'custscript_atnv_param_smb_to_scale_searc'
                });
                var zabSearchObj = search.load({          // Load the Saved Search
                    id: zabSearch
                });
                return zabSearchObj;     // Return the Search Results to Reduce Stage
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
				// Get the Search Results from getInput Data
                var values = JSON.parse(context.values[0]);
                log.debug('values', values);
				
				// Get the Subscription Id & Subscription Record Type
				var zabId = values.id;
				var recType = values.recordType;
								log.debug('values',values);
								log.debug('recType',recType);

				var myDate = new Date();    // Get the Current Date
					log.debug('myDate',myDate);
					
			// Create Search on Subscription Item	
			var customrecordzab_subscription_itemSearchObj = search.create({
					  type: "customrecordzab_subscription_item",
					   filters:
					   [
						  ["custrecordzab_si_subscription","anyof",zabId]
					   ],
					   columns:
					   [
						  search.createColumn({name: "name",sort: search.Sort.ASC,label: "Name"}),
						  search.createColumn({name: "internalid", label: "Internal ID"}),
						  search.createColumn({name: "custrecordzab_si_item", label: "Item"}),
						   search.createColumn({name: "country",join: "CUSTRECORDZAB_SI_CUSTOMER",label: "Country"})
					   ]
					});
					var searchResultCount = customrecordzab_subscription_itemSearchObj.runPaged().count;
					log.debug("customrecordzab_subscription_itemSearchObj result count",searchResultCount);
					customrecordzab_subscription_itemSearchObj.run().each(function(result){
					   // .run().each has a limit of 4,000 results
					    var zabSubsItemInternalId = result.getValue('internalid');   // Get the Subscription Item Internal Id
					    var zabSubsItem = result.getValue('custrecordzab_si_item');   // Get the Item Internal Id
						var customerCountry = result.getValue({name: "country",join: "CUSTRECORDZAB_SI_CUSTOMER"});   // Get the Customer Country
						
						log.debug('zabSubsItemInternalId',zabSubsItemInternalId);
						log.debug('zabSubsItem',zabSubsItem);
						log.debug('customerCountry',customerCountry);
						
					// Load the Subscription Item Record
					var zabSubscriptionItemObj = record.load({
										type: 'customrecordzab_subscription_item',
										id: zabSubsItemInternalId
										});

						
						if(zabSubsItem == 105)   // Item - Base Fee (MTM)
						{
							rate = 999   
						zabSubscriptionItemObj.setValue('custrecordzab_si_rate',rate);   // Set Rate to 999
						}
						
						if((zabSubsItem == 206 || zabSubsItem == 9 || zabSubsItem == 8 || zabSubsItem == 208 || zabSubsItem == 16 || zabSubsItem == 15) && (customerCountry == 'United Sates'|| customerCountry == ''))                              
						{
							overageUsageRate = 0.025;
						zabSubscriptionItemObj.setValue('custrecordzab_si_overage_rate',overageUsageRate);   // Set Overage Usage Rate to 0.025
						}
						else if((zabSubsItem == 206 || zabSubsItem == 9 || zabSubsItem == 8 || zabSubsItem == 208 || zabSubsItem == 16 || zabSubsItem == 15) && customerCountry == 'Canada')                              
						{
							overageUsageRate = 0.06;
						zabSubscriptionItemObj.setValue('custrecordzab_si_overage_rate',overageUsageRate);   // Set Overage Usage Rate to 0.06
						}
						else if((zabSubsItem == 207 || zabSubsItem == 13 || zabSubsItem == 12) && customerCountry == 'Canada')                              
						{
							overageUsageRate = 0.025;
						zabSubscriptionItemObj.setValue('custrecordzab_si_overage_rate',overageUsageRate);    // Set Overage Usage Rate to 0.025
						}
						else if((zabSubsItem == 207 || zabSubsItem == 13 || zabSubsItem == 12) && (customerCountry == 'United Sates'|| customerCountry == ''))                              
						{
							overageUsageRate = 0.01;
						zabSubscriptionItemObj.setValue('custrecordzab_si_overage_rate',overageUsageRate);   // Set Overage Usage Rate to 0.01
						}
						
				if(zabSubsItem == 106)    
				{
					addDiscDesc = null;   
				zabSubscriptionItemObj.setValue('custrecordzab_si_discount_charge_desc',addDiscDesc);  // Set Additional Discount Description to null
				}
			    zabSubscriptionItemObj.setValue('custrecord_scg_set_to_scale',true);   // Set to Scale to true
				zabSubscriptionItemObj.setValue('custrecord_att_si_queue_fc_regen',true);  // Queue Charge Regeneration to true

					   zabSubscriptionItemObj.save();  // Save the Subscription Item Record
				
					   return true;
					});

               // Update the Subscription Record - Billing Plan,Bill Carrier Fees,Upgrade plan,Billing Plan Change Date
                record.submitFields({
                    type: recType,
                    id: zabId,
                    values: {
                        custrecord_scg_billing_plan: 2,
                        custrecord_scg_bill_carrier_fees:true,
						custrecord_scg_upgrade_plan:true,
						custrecord_billing_plan_change_date:myDate
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
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
		
	function getDateTimeTz() {
			var date = new Date();
			var dateTimeStr = format.format({ value: date, type: format.Type.DATETIMETZ });
			var dateTimeRaw = format.parse({ value: dateTimeStr, type: format.Type.DATETIMETZ });
			return dateTimeRaw;
		};

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