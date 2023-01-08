/**
 * Ticket: FSP-800
 * Script Type: User Event
 * File Name: ATNV_MR_Evergreen_update_subs_end_date.js
 * Script:	ATNV | UE | Update Deal Type  [customscript_atnv_ue_updte_dela_type]
 * Parameter: Items to Avoid [custscript_atnv_item_to_avoid_for_bill_p]
 * Deployment:	ATNV | UE | Update Deal Type  [customdeploy_atnv_ue_updte_dela_type]
 *
 * 
 * Date			      Version           Author	                    Remarks
 * 30,Nov-2022        1.00             Janardhan S                   This Script updates the Subscription Record Deal type sourcing from the Item. 	
 * 
 */

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * 
 * Version  Date            Author           Remark
 * 1.10     25 Nov 2022     Janardhan S      .
 */
define(['N/record', 'N/runtime', 'N/search', 'N/email', 'N/render', 'N/format'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(record, runtime, search, email, render, format) {
	
	  function beforeSubmit(context) {
    	
    	try{
			atnv_checkPlatFormFee(context);
    	}catch(e){
    		am_zsi_logError(e);
    	}

    }
	
	    // function to Update the Deal Type on Subscription Record
    function atnv_checkPlatFormFee(context)
	{
		   // Define Variables
			    var getItemstoAvoidArr;
				var getSubsItem;
				var getDealType; 
				var zsiRec = context.newRecord;
		
           // Get Script Paramater		
		        var scriptObj = runtime.getCurrentScript();
				var getItemstoAvoid = scriptObj.getParameter({     
					name: 'custscript_atnv_item_to_avoid_for_bill_p'          
				});
				
			 	log.debug('getItemstoAvoid',getItemstoAvoid);
				
				if(getItemstoAvoid)
                {
			  // Split the string to Array     
				 getItemstoAvoidArr = getItemstoAvoid.split(',');			
			
			   // Get the Subscription Item 
			        getSubsItem = zsiRec.getValue({
									fieldId: 'custrecordzab_si_item'
								});
						
						log.debug('getItemstoAvoidArr',getItemstoAvoidArr);
						log.debug('getSubsItem',getSubsItem);
						
						if(getItemstoAvoidArr.indexOf(getSubsItem) != -1)
						{
			   // Search Lookup to get the Deal type from Item Record
							var lookupResult = search.lookupFields({
													type: 'noninventoryitem',
													id: getSubsItem,
													columns: ['custitem_atnv_deal_type']
													});
					log.debug('lookupResult',lookupResult.custitem_atnv_deal_type.length);
							// Get the Item Deal type
							    if(lookupResult.custitem_atnv_deal_type.length != 0)
								{
								 getDealType = lookupResult.custitem_atnv_deal_type[0].value;
								}
						
					// Get the Subscription Id
					 var getSubsId = zsiRec.getValue({
										fieldId: 'custrecordzab_si_subscription'
									});
							log.debug('getSubsId',getSubsId);
							log.debug('getDealType',getDealType);
                    
					// Update the Subscription Deal Type
						record.submitFields({
								type: "customrecordzab_subscription",
								id: getSubsId,
								values: {
									 custrecord_atnv_deal_type: getDealType
								},
								options: {
									enableSourcing: false,
									ignoreMandatoryFields : true
								}
							});
				        }
		            }
	}
	
	
	    return {
        beforeSubmit: beforeSubmit
    };
    
});