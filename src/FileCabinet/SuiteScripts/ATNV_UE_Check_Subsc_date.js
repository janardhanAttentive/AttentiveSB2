/**
 * Script Type: User Event
 * File Name: ATNV_UE_Check_Subsc_date.js
 * Script:	ATNV | UE | Check Subs Date on Create  [customscript_atnv_ue_chk_subs_dte_create]
 * Deployment: ATNV | UE | Check Subs Date on Create	   [customdeploy_atnv_ue_chk_subs_dte_create]
 * Scheduled: This Script blocks the creation of Subscription if Date range overlaps with existing Subscription.
 *
 * 
 * Date			Author	                        Remarks
 * 19-08-2022   Janardhan S                     This Script blocks the creation of Subscription if Date range overlaps with existing Subscription.
 *                                              Ticket: 
 *                                              
 * 
 */

/**
 *
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search', 'N/config', 'N/task', 'N/error', 'N/format'],

function(runtime, record, search, config, task, error, format) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
    
    		var contextType = scriptContext.type;
            log.debug('scriptContext.UserEventType',contextType);
			var getSubsEndDate;
           
            var exeContext = runtime.executionContext;
            log.debug('exeContext',exeContext);
    		if (contextType === scriptContext.UserEventType.CREATE) 
            {
    			var rec = scriptContext.newRecord;
    			var exeContext = runtime.executionContext;
        		var userObj = runtime.getCurrentUser();
            	var userEmail = userObj.email;
				
				var getCustomer = rec.getValue('custrecordzab_s_customer');
				var getStartDate = rec.getValue('custrecordzab_s_start_date');
				var getEndDate = rec.getValue('custrecordzab_s_end_date');
				
												log.debug('getCustomer',getCustomer);
												log.debug('getStartDate',getStartDate);
												log.debug('getEndDate',getEndDate);

				
				
				var customerSearchObj = search.create({
					   type: "customer",
					   filters:
					   [
						  ["internalid","anyof",getCustomer]
					   ],
					   columns:
					   [
					       search.createColumn({
								 name: "datecreated",
								 sort: search.Sort.DESC,
								 label: "Date Created"
							  }),
						  search.createColumn({name: "altname", label: "Name"}),
						  search.createColumn({
							 name: "internalid",
							 join: "CUSTRECORDZAB_S_CUSTOMER",
							 label: "Internal ID"
						  }),
						  search.createColumn({
							 name: "name",
							 join: "CUSTRECORDZAB_S_CUSTOMER",
							 label: "Name"
						  }),
						  search.createColumn({
							 name: "custrecordzab_s_start_date",
							 join: "CUSTRECORDZAB_S_CUSTOMER",
							 label: "Start Date"
						  }),
						  search.createColumn({
							 name: "custrecordzab_s_end_date",
							 join: "CUSTRECORDZAB_S_CUSTOMER",
							 label: "End Date"
						  }),
						   search.createColumn({
							 name: "custrecord_att_cancellationdate",
							 join: "CUSTRECORDZAB_S_CUSTOMER",
							 label: "Cancellation Date"
						  }),
						   search.createColumn({
								 name: "formuladate",
								 formula: "{custrecordzab_s_customer.custrecordzab_s_end_date}",
								 label: "Formula (Date)"
							  })
					   ]
					});
					var getFormulaDate ;
					var getStartDate1;
					var getFormulaDate1;
					var getCancellationDate;
					
					var searchResultCount = customerSearchObj.runPaged().count;
					log.debug("customerSearchObj result count",searchResultCount);
					customerSearchObj.run().each(function(result){
					  							  
						getFormulaDate = result.getValue("formuladate");
						getCancellationDate = 	result.getValue({
													 name: "custrecord_att_cancellationdate",
													 join: "CUSTRECORDZAB_S_CUSTOMER"
												  });							
							log.debug('getFormulaDate',getFormulaDate);
							log.debug('getCancellationDate',getCancellationDate);
													  
							 if(getFormulaDate)
							 {								 
							getStartDate1 = format.parse({value:getStartDate, type: format.Type.DATE});
							getFormulaDate1 = format.parse({value:getFormulaDate, type: format.Type.DATE});
										log.debug('getStartDate1',getStartDate1);
										log.debug('getFormulaDate1',getFormulaDate1);
							
							if(getCancellationDate)
							{
							getCancellationDate = format.parse({value:getCancellationDate, type: format.Type.DATE});	
							
							    if(getCancellationDate <= getFormulaDate1)
								{
									 if(getCancellationDate >= getStartDate1)
									 {
									log.debug(' if condition getStartDate1',getStartDate1);
										 var errorObj = error.create({
														  name: 'Subscription Overlaps ---',
														  message: 'Subscription Start Date overlaps with previous Subscription End Date'
													  });

										  throw errorObj.name + '\n\n' + errorObj.message;
										  return false;
									 }
								}
							}
							else if(getFormulaDate1 >= getStartDate1)
										{
												log.debug(' if condition getStartDate1',getStartDate1);
										 var errorObj = error.create({
														  name: 'Subscription Overlaps ---',
														  message: 'Subscription Start Date overlaps with previous Subscription End Date'
													  });

										  throw errorObj.name + '\n\n' + errorObj.message;
										  return false;
										}
							 }
					   return true;
					});

				
            	
    		}
    }

    return {
        beforeSubmit: beforeSubmit
    };
});
