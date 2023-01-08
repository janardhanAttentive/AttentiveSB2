/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/log', 'N/format'], function(record, log, format) {
    function beforeLoad(context) 
    {
        
    }

    function beforeSubmit(context) {
        
    }

    function afterSubmit(context) 
    {
       /* if (context.type !== context.UserEventType.CREATE)
            return;*/
        
        log.debug('After Submit', 'After Submit');
        var zabChargeRec = context.newRecord;
        if (zabChargeRec.getValue('custrecordzab_c_bill_date')) 
        {
            
            var billDate = new Date(zabChargeRec.getValue('custrecordzab_c_bill_date'));

            var lastday = new Date(billDate.getFullYear(), billDate.getMonth() + 1, 0);
            log.debug('lastday',lastday);

           // var changedDate = new Date();

            var changedDate = format.format({
                value: lastday,
                type: format.Type.DATE
            });
            log.debug('changedDate',changedDate);


            var parsedDate = format.parse({
                value: changedDate,
                type: format.Type.DATE
            });

            log.debug('parsedDate',parsedDate);

            var formatedDate = format.format({
                value: parsedDate,
                type: format.Type.DATE
            });

            log.debug('formatedDate',formatedDate);

            zabChargeRec.setValue({
                fieldId: 'custrecordzab_c_bill_date',
                value: changedDate
            });


            
            
           /* var call = record.create({
                type: record.Type.PHONE_CALL,
                isDynamic: true
            });
            call.setValue('title', 'Make follow-up call to new customer');
            call.setValue('assigned', customerRecord.getValue('salesrep'));
            call.setValue('phone', customerRecord.getValue('phone'));
            try {
                var callId = call.save();
                log.debug('Call record created successfully', 'Id: ' + callId);
            } catch (e) {
                log.error(e.name);
            }*/
            
        }
    }
    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
});