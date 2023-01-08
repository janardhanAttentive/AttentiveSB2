/**
 *
 * @NApiVersion 2.0
 * @NScriptType usereventscript
 * @author Seungyeon Shin
 */
 /**
 * Date			        Version           Author	                    Remarks
 * 22,September-2022    1.02              Janardhan S                  Add Seperate Validation for Customer to update Non Boomi Modified Date Field 
                                                                       when Billing Fee/Bill Carrier Fee Updated on Edit. 
 */																	
define ( ['N/record', 'N/runtime'] ,
    function(record, runtime) {
        function beforeSubmit(context) {
            if (context.type == 'create' || context.type == 'edit'){
            	var scriptObj = runtime.getCurrentScript();
            	var SCG_USER_EMAIL = scriptObj.getParameter('custscript_scg_email_address');
				var exeContext = runtime.executionContext;
				var userObj = runtime.getCurrentUser();
				var userEmail = userObj.email;
									var myRec = context.newRecord;

				
				            	log.debug('myRec.type', myRec.type);

				
				if(myRec.type == 'customer')      // Condition Check for Customer only
				{
            	log.debug('SCG_USER_EMAIL', SCG_USER_EMAIL);
            	log.debug('userEmail', userEmail);
            	log.debug('exeContext', exeContext);
					var myRec = context.newRecord;     // Get New Record Object
	                var oldRec = context.oldRecord;    // Get Old Record Object
					
					var getBillingPlan = myRec.getValue('custentity_scg_billing_plan');
					var getBillCarrierFees = myRec.getValue('custentity_scg_bill_carrier_fees');
					var getOldBillingPlan;
					var getOldBillCarrierFees;
					
					if(context.type != 'create')
					{
					 getOldBillingPlan = oldRec.getValue('custentity_scg_billing_plan');
					 getOldBillCarrierFees = oldRec.getValue('custentity_scg_bill_carrier_fees');

            	log.debug('getBillingPlan', getBillingPlan);
            	log.debug('getBillCarrierFees', getBillCarrierFees);
            	log.debug('getOldBillingPlan', getOldBillingPlan);
            	log.debug('getOldBillCarrierFees', getOldBillCarrierFees);
					}


				if (userEmail !== SCG_USER_EMAIL || (userEmail === SCG_USER_EMAIL && exeContext !== runtime.ContextType.WEBSERVICES)) {
					// Populate a DateTime field with current timestamp from function below
					
					if((getBillingPlan != getOldBillingPlan || getBillCarrierFees != getOldBillCarrierFees) && context.type == 'edit')
					{
					var dateTime = scriptObj.getParameter('custscript_scg_timestamp_field');
					log.debug('dateTime', dateTime);

	                var myRec = context.newRecord;
	                var myDate = new Date();
	                log.debug('myDate', myDate);

	                myRec.setValue(dateTime, myDate);
					}
					
					if(context.type == 'create' && userEmail !== SCG_USER_EMAIL)
					{
					var dateTime = scriptObj.getParameter('custscript_scg_timestamp_field');
					log.debug('dateTime', dateTime);

	                var myRec = context.newRecord;
	                var myDate = new Date();
	                log.debug('myDate', myDate);

	                myRec.setValue(dateTime, myDate);
					}
	            }
			}
			else{
				log.debug('SCG_USER_EMAIL', SCG_USER_EMAIL);
            	log.debug('userEmail', userEmail);
            	log.debug('exeContext', exeContext);

				if (userEmail !== SCG_USER_EMAIL || (userEmail === SCG_USER_EMAIL && exeContext !== runtime.ContextType.WEBSERVICES)) {
					// Populate a DateTime field with current timestamp from function below
					var dateTime = scriptObj.getParameter('custscript_scg_timestamp_field');
					log.debug('dateTime', dateTime);

	                var myRec = context.newRecord;
	                var myDate = new Date();
	                log.debug('myDate', myDate);

	                myRec.setValue(dateTime, myDate);
	            }
			}
					
            }
        }
        return {
            beforeSubmit: beforeSubmit
        };

        function isEmpty(stValue) { 
            if ((stValue == '') || (stValue == null) ||(stValue == undefined)) {
                return true;
            }
            return false;
        };

		function getDateTimeTz() {
			var date = new Date();
			var dateTimeStr = format.format({ value: date, type: format.Type.DATETIMETZ });
			var dateTimeRaw = format.parse({ value: dateTimeStr, type: format.Type.DATETIMETZ });
			return dateTimeRaw;
		};
    });