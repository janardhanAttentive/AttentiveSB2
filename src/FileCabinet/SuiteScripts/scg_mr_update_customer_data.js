/**
 * Description: This Script Updats the Customer Billing plan and carrier fee sourcing from the zab Subscription.
 * 
 * Version                  Date			      Author	                   Remarks
 * 1.00                                           SaaSCG Development           This Script Updats the Customer Billing plan and carrier 
 *                                                                              fee sourcing from the zab Subscription.
 * 1.02                     29,June-2022          Janardhan S                  Created Script Parameter to call the saved Search,removed the 
 *                                                                              Map Stage and used submit fields instead of loading the record to increase the performance.
 * /
 /**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope public
 */
 
define(['N/search', 'N/record', 'N/runtime'],
    function (search,record,runtime) {

        function getInputData() {
            try {
				
				var scriptObj = runtime.getCurrentScript();
				var zabSearch = scriptObj.getParameter({
					name: 'custscript_atnv_updte_cus_data_from_zab'
				});
			 var zabSearchObj =  search.load({
										id: zabSearch
											}); 
                return zabSearchObj;

            } catch (error) {
                throw error.message;
            }
        }

        function reduce(context) {

              var values = JSON.parse(context.values[0]);
				log.debug('values',values);
				
				var zabId = values.id;
				var zabrecType = values.recordType;
				var getBillingPlan = values.values.custrecord_scg_billing_plan.value;
				var getcarrierFee = values.values.custrecord_scg_bill_carrier_fees;
				var getCustomer = values.values.custrecordzab_s_customer.value;
								log.debug('zabId',zabId);
								log.debug('zabrecType',zabrecType);
								log.debug('getBillingPlan',getBillingPlan);
								log.debug('getcarrierFee',getcarrierFee);
								log.debug('getCustomer',getCustomer);	
		
		    if(getCustomer)
			{
				record.submitFields({
						type: record.Type.CUSTOMER,
						id: getCustomer,
						values: {
						'custentity_scg_billing_plan': getBillingPlan,
						'custentity_scg_bill_carrier_fees':getcarrierFee
						}
						});
			}
        }

        function summarize(summary) {


            handleErrors(summary);
            handleSummaryOutput(summary.output);

            // *********** HELPER FUNCTIONS ***********

            function handleErrors(summary) {
                var errorsArray = getErrorsArray(summary);
                if (!errorsArray || !errorsArray.length) {
                    log.debug('No errors encountered');
                    return;
                }

                for (var i in errorsArray) {
                    log.error('Error ' + i, errorsArray[i]);
                }

                if (errorsArray && errorsArray.length) {
                    //
                    // INSERT YOUR CODE HERE
                    //

                }

                return errorsArray;

                // *********** HELPER FUNCTIONS ***********
                function getErrorsArray(summary) {
                    var errorsArray = [];

                    if (summary.inputSummary.error) {
                        log.audit('Input Error', summary.inputSummary.error);
                        errorsArray.push('Input Error | MSG: ' + summary.inputSummary.error);
                    }
                    summary.mapSummary.errors.iterator().each(
                        function (key, e) {
                            var errorString = getErrorString(e);
                            log.audit('Map Error', 'KEY: ' + key + ' | ERROR: ' + errorString);
                            errorsArray.push('Map Error | KEY: ' + key + ' | ERROR: ' + errorString);
                            return true; // Must return true to keep
                            // looping
                        });

                    summary.reduceSummary.errors.iterator().each(
                        function (key, e) {
                            var errorString = getErrorString(e);
                            log.audit('Reduce Error', 'KEY: ' + key + ' | MSG: ' + errorString);
                            errorsArray.push('Reduce Error | KEY: ' + key + ' | MSG: ' + errorString);


                            //            UpdateStatus(key, 3, errorString);

                            return true; // Must return true to keep
                            // looping
                        });

                    return errorsArray;

                    // *********** HELPER FUNCTIONS ***********
                    function getErrorString(e) {
                        var errorString = '';
                        var errorObj = JSON.parse(e);
                        if (errorObj.type == 'error.SuiteScriptError' || errorObj.type == 'error.UserEventError') {
                            errorString = errorObj.name + ': ' + errorObj.message;
                        } else {
                            errorString = e;
                        }
                        return errorString;
                    }
                }
            }

            function handleSummaryOutput(output) {
                var contents = '';
                output.iterator().each(function (key, value) {
                    contents += (key + ' ' + value + '\n');
                    return true;
                });
                if (contents) {
                    log.debug('output', contents);
                }
            }

        }

        function isNullorEmpty(checkVal) {
            if (checkVal != null && checkVal != undefined && checkVal != '') {
                return false;
            } else {
                return true;
            }
        };




        return {
            getInputData: getInputData,
            reduce: reduce,
            summarize: summarize
        };
    }
);