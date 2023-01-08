/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 * @author John Kumuyi
 * @description - Script to update Netsuite external ID from the Database ID coming from salesforce, and convert number to string value
 */
/**
 *
 * Date             Author
 * 2/22/2021        John Kumuyi
 * 08/09/2922       Janardhan S       Added Try Catch to capture Error logs in detail and setting the external Id in string format. 
 */
define(['N/record', 'N/log'], function (record, log) {
    var exports = {};
    function afterSubmit(context) {
		try{
        if (
            context.type !== context.UserEventType.CREATE &&
            context.type !== context.UserEventType.EDIT
        ) // Only trigger this script on Create or Edit Event
            return;
        log.debug("SCRIPT START");
        var custId = context.newRecord.id; // Get current record Id
        var custRec = record.load({ // Load current Record
            type: 'customer',
            id: custId,
            isDynamic: false,
        });
        var isInactive = custRec.getValue('isinactive'); // Check if record is active or not
        if (isInactive) return;
        var dbId = custRec.getValue('custentity_scg_db_id'); // Get Current record Database ID
        log.debug("Database ID", dbId);
		dbId = dbId+"";                             // Change Database ID to string format to remove .0
        custRec.setValue({                          // Set Current Database ID as External ID
            fieldId: 'externalid',
            value: dbId 
        });
        var externalId = custRec.getValue('externalid'); 
        log.debug("EXTERNAL ID", externalId)
        custRec.save(); // Save Record
    }
	catch(err)                          // Catch Execution Block to identify Errors if any
	{
		var error_Details = 'Context Type' + context.type + 'Entity Record Id' + custId;    // Displays the Conext and Customer Id
			log.error({
					title: 'After Submit Error Details',
					details: error_Details
					});
		   throw err;
	}
	}
    exports.afterSubmit = afterSubmit;
    return exports;
});