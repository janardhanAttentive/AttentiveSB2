/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * 
 * Version  Date            Author           Remark
 * 1.00     07 Apr 2021     Doug Humberd     Handles User Events on ZAB Subscription Item Records
 *                          Doug Humberd     Calculates and sets the 'End Date' field when MTM is checked and Free Trial End Date is empty (on Subscription record)
 * 1.05     12 May 2021     Doug Humberd     Updated 'am_zsi_setEndDate_MTM' to check Promotional Credit checkbox prior to setting End Date
 * 1.10     25 Nov 2022     Janardhan S       1) Updates the Subscription record if Platform Fee Item exists on the Subscription Item
 *                                            2) Updates the REGENERATE FORECAST CHARGES Field when Rate is changed.
 */
define(['N/record', 'N/runtime', 'N/search', 'N/email', 'N/render', 'N/format'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(record, runtime, search, email, render, format) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {string} context.type - Trigger type
     * @param {Form} context.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(context) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {Record} context.oldRecord - Old record
     * @param {string} context.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(context) {
    	
    	try{
    		am_zsi_setEndDate_MTM(context);
			atnv_update_regen_onrate_Change(context);
			//atnv_checkPlatFormFee(context);
			 atnv_queue_charge_gen(context);
    	}catch(e){
    		am_zsi_logError(e);
    	}

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {Record} context.oldRecord - Old record
     * @param {string} context.type - Trigger type
     * @Since 2015.2
     */
	 // Start of Function - Executes after Subscription Item record is saved
    function afterSubmit(context) {
		try{
			if (context.type == 'create')  // Context create only
					{
					atnv_checkPlatFormFee(context);    			// function to perform updation on Subscription Record Deal Type
					}
    	}catch(e){
    		am_zsi_logError(e);
    	}

    }
		 // End of Function - Executes after Subscription Item record is saved
	
         // Start of function to update queue charge Generation 
	function atnv_queue_charge_gen(context)
	{                
					   var zsiRec = context.newRecord;
					   log.debug('context.executionContext',runtime.executionContext);
					   log.debug('context.type',context.type);
				if (context.type == 'create' && runtime.executionContext == 'WEBSERVICES')
				 {
					// Sets the Queue Charge Gen to true only when subscription item at the time of create via Webservices only		
							zsiRec.setValue('custrecord_att_si_queue_fc_regen',true);	 
				 }
	}
	// End of function to update queue charge Generation

	
     // Start of function to update the Regen forecast charges when rate is changed - Before Submit
	function atnv_update_regen_onrate_Change(context)
	{
		// Define Variables
		var getNewRate;
		var getOldRate;
		// Getting the Record Old and New Record Contexts
			   var zsiNewRec = context.newRecord;
			   var zsiOldRec = context.oldRecord;
			   
					if (context.type == 'edit')        // Check for Subscription Item Edit Only
					{	
				         getOldRate = zsiOldRec.getValue({                   // Get the Old Rate Value
										fieldId: 'custrecordzab_si_rate'
									});
				
				         getNewRate = zsiNewRec.getValue({                   // Get the New Rate Value
										fieldId: 'custrecordzab_si_rate'
									});
				log.debug('getOldRate',getOldRate);
				log.debug('getNewRate',getNewRate);

						if(getOldRate != getNewRate)     // Check for Old Rate is not equal to New Rate
						{
							// Updates the Regen Forecast Charges to true
							zsiNewRec.setValue({
											fieldId: 'custrecordzab_si_generate_forecast_charg',
											value: true
										});	
						}
    	            }

	}
	     // End of function to update the Regen forecast charges when rate is changed.


    // Start of function to Update the Deal Type on Subscription Record
    function atnv_checkPlatFormFee(context)
	{
		   // Define Variables
			 //   var getItemstoAvoidArr=null;
				var getSubsItemDealType = null;
				var zsiRec = context.newRecord;
				    	var zsId = zsiRec.id;                            // Get the Subscription Item Internal Id
					 	log.debug('zsId',zsId);
     										
						// Get the Subscription Item Deal Type
			                 getSubsItemDealType = zsiRec.getValue({
									fieldId: 'custrecord_att_si_deal_type'
								});
							if(!isEmpty(getSubsItemDealType))
							{	
								// Get the Subscription Id
								 var getSubsId = zsiRec.getValue({
													fieldId: 'custrecordzab_si_subscription'
												});
										log.debug('getSubsId',getSubsId);
										log.debug('getSubsItemDealType',getSubsItemDealType);
								
								// Update the Subscription Deal Type
									record.submitFields({
											type: "customrecordzab_subscription",
											id: getSubsId,
											values: {
												 custrecord_atnv_deal_type: getSubsItemDealType
											},
											options: {
												enableSourcing: false,
												ignoreMandatoryFields : true
											}
										});	                   

                           //     updateSubsItemIncludedUnits(getSubsId) // Defaulting Included Units on MMS AND SMS Subscription Items								  
							}
	}
        // End of function to Update the Deal Type on Subscription Record

    
	/*
	// Start of function to update the Subscription Item Included Units for Item MMS or SMS
	function updateSubsItemIncludedUnits(subsId)
	{
		 // Define the Varaiables
		var subsItemInternalId = null;
		var subsItemName = null;
		var subsItemIncludedUnits = null;
		
		var customrecordzab_subscription_itemSearchObj = search.create({
								   type: "customrecordzab_subscription_item",
								   filters:
								   [
									  ["custrecordzab_si_subscription","anyof",subsId], 
									  "AND", 
									  ["custrecordzab_si_item","anyof","207","206"]        // Item MMS and SMS
								   ],
								   columns:
								   [
									  search.createColumn({name: "internalid",sort: search.Sort.ASC,label: "Internal Id"}),
									  search.createColumn({name: "custrecordzab_si_item",label: "Item"})
								   ]
								});
								var searchResultCount = customrecordzab_subscription_itemSearchObj.runPaged().count;
								log.debug("customrecordzab_subscription_itemSearchObj result count",searchResultCount);
								customrecordzab_subscription_itemSearchObj.run().each(function(result){
								   // .run().each has a limit of 4,000 results
								   subsItemInternalId = result.getValue('internalid');
							       subsItemName = result.getText('custrecordzab_si_item');
								   
								   if(subsItemName == 'MMS')
								   {
									  subsItemIncludedUnits = 2500;
								   }
								   else if(subsItemName == 'SMS')
								   {
									 subsItemIncludedUnits =  6000; 
								   }
								   
								   if(subsItemName == 'MMS' || subsItemName == 'SMS')
								   {
									  // Update the Subscription Item Included Unit
									record.submitFields({
											type: "customrecordzab_subscription_item",
											id: subsItemInternalId,
											values: {
												 custrecordzab_si_included_units: subsItemIncludedUnits
											},
											options: {
												enableSourcing: false,
												ignoreMandatoryFields : true
											}
										}); 
								   }
								   return true;
								});
	}
    // End of function	
	*/
 
    
    
    function am_zsi_setEndDate_MTM(context){
    	
    	//Run on Create
    	//if (context.type != 'create' && context.type != 'edit'){//TEMP CODE
    	if (context.type != 'create'){
    		return;
    	}
    	
    	var zsiRec = context.newRecord;
    	//var zsId = zsiRec.id;
    	
    	
    	var promCredit = zsiRec.getValue({
    		fieldId: 'custrecordatt_si_promotional_credit'
    	});
    	log.debug('Promotional Credit', promCredit);
    	
    	
    	var zabSubscr = zsiRec.getValue({
    		fieldId: 'custrecordzab_si_subscription'
    	});
    	log.debug('ZAB Subscription', zabSubscr);
    	
    	
    	//Lookup Values from the ZAB Subscription Record
		var zsFields = search.lookupFields({
    	    type: 'customrecordzab_subscription',
    	    id: zabSubscr,
    	    columns: ['custrecord_scg_mtm', 'custrecord_att_s_free_trial_end_date', 'custrecord_att_s_actual_trial_end_date', 'custrecord_scg_s_promo_credit_end_date']
    	});
    	log.debug('ZAB Subscription Fields', zsFields);
    	
		var mtm = zsFields.custrecord_scg_mtm;
    	log.debug('MTM', mtm);
    	
    	var freeTrial = '';
    	if (!isEmpty(zsFields.custrecord_att_s_free_trial_end_date)){
    		freeTrial = zsFields.custrecord_att_s_free_trial_end_date;
    	}
    	log.debug('Free Trial End Date', freeTrial);
    	
    	var actualTrial = '';
    	if (!isEmpty(zsFields.custrecord_att_s_actual_trial_end_date)){
    		actualTrial = zsFields.custrecord_att_s_actual_trial_end_date;
    	}
    	log.debug('Actual Trial End Date', actualTrial);
    	
    	var promCredEndDate = '';
    	if (!isEmpty(zsFields.custrecord_scg_s_promo_credit_end_date)){
    		promCredEndDate = zsFields.custrecord_scg_s_promo_credit_end_date;
    	}
    	log.debug('Promotional Credit End Date', promCredEndDate);
    	
    	
    	if (mtm == true && (isEmpty(freeTrial) || (!isEmpty(freeTrial) && !isEmpty(actualTrial)))){
    		
    		if (promCredit == false){
    			
    			var startDate = zsiRec.getValue({
            		fieldId: 'custrecordzab_si_start_date'
            	});
            	log.debug('Start Date', startDate);
            	
            	if (isEmpty(startDate)){
            		log.debug('Start Date Empty', 'EXIT');
            		return;
            	}
            	
            	var day = startDate.getDate();
            	log.debug('Day of Month', day);
            	
            	var endDate;
            	
            	
            	//Set End Date to End of Month
            	if (day == '1'){
            		
            		//Set the transaction date (obj) to a string
            		endDate = format.format({
            			value : startDate,
            			type : format.Type.DATE
            		});
            		log.debug('End Date (formatted from startDate object)', endDate);
            		
            		//Put End Date in NS Date Object
            		var date = new Date(endDate);
            		log.debug('date obj', date);
            		
            		//Change the object the the last day of the month
            		date.setMonth(date.getMonth() + 1);
            		date.setDate(date.getDate() - 1);
            		log.debug('date obj last of month', date);
            		
            		//Set the New Date Object (last of month) to a string
            		endDate = format.format({
            			value : date,
            			type : format.Type.DATE
            		});
            		log.debug('Last of Month (reformatted)', endDate);
            		
            		//Parse the string prior to writing to transaction record
            		endDate = format.parse({
            		value : endDate,
            		type : format.Type.DATE
            		});
            		log.debug('End Date After parse', endDate);
            		
            	}else{
            		
            		//Set the transaction date (obj) to a string
            		endDate = format.format({
            			value : startDate,
            			type : format.Type.DATE
            		});
            		log.debug('End Date (formatted from startDate object)', endDate);
            		
            		//Put End Date in NS Date Object
            		var date = new Date(endDate);
            		log.debug('date obj', date);
            		
            		//Change the object the the last day of the following month
            		date.setDate(1);
            		date.setMonth(date.getMonth() + 1);
            		date.setDate(date.getDate() - 1);
            		log.debug('date obj last of month', date);
            		
            		//Set the New Date Object (last of month) to a string
            		endDate = format.format({
            			value : date,
            			type : format.Type.DATE
            		});
            		log.debug('Last of Month (reformatted)', endDate);
            		
            		//Parse the string prior to writing to transaction record
            		endDate = format.parse({
            		value : endDate,
            		type : format.Type.DATE
            		});
            		log.debug('End Date After parse', endDate);
            		
            	}
            	
            	
            	//Set the End Date on the ZAB Subscription Record (Calculated Value)
            	zsiRec.setValue({
            	    fieldId: 'custrecordzab_si_end_date',
            	    value: endDate,
            	    ignoreFieldChange: true
            	});
    			
    		}else{//promCredit == true
    			
    			
    			//Put End Date in NS Date Object
        		var date = new Date(promCredEndDate);
        		log.debug('date obj', date);
        		
        		//Set the New Date Object (Promotional Credit End Date) to a string
        		endDate = format.format({
        			value : date,
        			type : format.Type.DATE
        		});
        		log.debug('Promotional Credit End Date (reformatted)', endDate);
        		
        		//Parse the string prior to writing to transaction record
        		endDate = format.parse({
        		value : endDate,
        		type : format.Type.DATE
        		});
        		log.debug('End Date After parse', endDate);
    			
    			
    			//Set the End Date on the ZAB Subscription Record (Promotional Credit End Date Value)
            	zsiRec.setValue({
            	    fieldId: 'custrecordzab_si_end_date',
            	    value: endDate,
            	    ignoreFieldChange: true
            	});
    			
    		}//End if (promCredit == true)

        	
    	}//End if (mtm == true && isEmpty(freeTrial))
    	
    	
    }
    
    
    
    
    
    
    function isEmpty(stValue)
    { 
        if ((stValue == '') || (stValue == null) ||(stValue == undefined))
        {
            return true;
        }
        
        return false;
    }  
    
    
    return {
        //beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});





/**
 * Logs an exception to the script execution log
 * 
 * @appliedtorecord customer
 * 
 * @param {String} e Exception
 * @returns {Void}
 */
function am_zsi_logError(e) {
	// Log the error based on available details
	if (e instanceof nlobjError) {
		log.error('System Error', e.getCode() + '\n' + e.getDetails());
		//alert(e.getCode() + '\n' + e.getDetails());
	} else {
		log.error('Unexpected Error', e.toString());
		//alert(e.toString());
	}
}