 /**
 * Ticket: FSP-125
 * Script Type: Client Script 
 * File Name: Atnv_CS_Department_Check.js
 * Script Id: ATNV | CS | Department Check on Deposit   [customscript_atnv_cs_dept_check_on_depos]  
 * Script Deployment: ATNV | CS | Department Check on Deposit   [customscript_atnv_cs_dept_check_on_depos]
 * Ticket: FS-781 
 *
 * 
 */
/**
 * Module Description
 * 
 * Version    Date             Author             Remarks
 *  1.00                     Janardhan S          This Script throws an alert when Department is not enetered in the Deposit Record.
 *
 */
/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/record','N/url','N/https','N/currentRecord','N/format'],
  function(record, url, https, currentRecord, format) {

 
	function validateLine(context) 
	{
				var currentRecord = context.currentRecord;
				var sublistName = context.sublistId;
				if (sublistName === 'cashback')
				{
	             var get_Dept = currentRecord.getCurrentSublistValue({
									sublistId: sublistName,
									fieldId: 'department'
									});
						log.debug('get_Dept',get_Dept);
					if(!get_Dept)
					{
						alert('Please Enter Department Value');
										return false;
					}
			
				}
				
			if (sublistName === 'other')
				{
	             var get_Dept = currentRecord.getCurrentSublistValue({
									sublistId: sublistName,
									fieldId: 'department'
									});
						log.debug('get_Dept',get_Dept);
					if(!get_Dept)
					{
						alert('Please Enter Department Value');
							return false;
					}
			
				}
				return true;
                }

    return {
	  validateLine: validateLine
	  };
});