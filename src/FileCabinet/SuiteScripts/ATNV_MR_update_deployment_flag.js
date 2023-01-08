/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
/**
 * Module Description
 * 
 * Version    Date                       Author           Remarks
 *  2.x       October,20-2022            Janardhan S    
 *
 */

define(['N/https', 'N/error', 'N/record', 'N/search', 'N/runtime', 'N/encode', 'N/format', 'N/file'],

function (https, error, record, search, runtime, encode, format, file) {

 // Start Of GetInput Data
    function getInputData(context) {
        try {
			var scriptObj = runtime.getCurrentScript();
				var scriptDeploySearch = scriptObj.getParameter({
					name: 'custscript_param_update_deploy_flag'
				});
			 var scriptDeploySearchObj =  search.load({
										id: scriptDeploySearch
											}); 
                return scriptDeploySearchObj;          
       } 
		catch (error) {
            log.error({ title: 'error', details: error });
            throw error;
        }
    }

    // Start Of Reduce
	  function reduce(context) {
        try { 
		
		var scriptObj = runtime.getCurrentScript();
				var deployFlagCheck = scriptObj.getParameter({
					name: 'custscript_atnv_param_validate_deploy_fl'
				});
		
		var values = JSON.parse(context.values[0]);
					log.debug({ title: 'values', details:values });
		var scriptDeployId = values.id;
		var getRecordType = values.recordType;
							log.debug({ title: 'scriptDeployId', details:scriptDeployId });
					log.debug({ title: 'getRecordType', details:getRecordType });


				var id = record.submitFields({
								type: getRecordType,
								id: scriptDeployId,
								values: {
								isdeployed: deployFlagCheck
								},
								options: {
								enableSourcing: false,
								ignoreMandatoryFields : true
								}
								});
						
						
					context.write(context.key, context.values.length);
		}
         catch (error) {
            log.error({ title: 'error', details: error });
            throw error;
        }
    }
	

	 // Summarize the Results
    function summarize(summary) {
        try {
	 var totalRecordsUpdated = 0;
                summary.output.iterator().each(function (key, value)
                    {
                    totalRecordsUpdated += parseInt(value);
                    return true;
                    });
		log.audit('Summary Time','Total Seconds: '+summary.seconds);
    	log.audit('Summary Usage', 'Total Usage: '+summary.usage);
    	log.audit('Summary Yields', 'Total Yields: '+summary.yields);
                log.audit({
                    title: 'Total records updated',
                    details: totalRecordsUpdated
                });
        } catch (error) {
            log.error({ title: 'mapReduce.summarize', details: error });
            throw error;
        }
    }
	 return {
        getInputData: getInputData,
        reduce: reduce,
        summarize: summarize
    };
}
);
