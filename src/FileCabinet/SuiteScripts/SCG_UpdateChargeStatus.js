function scheduled()
{   
    var savedSearchId = '1135';
	// var savedSearchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_status_update_saved_search');

    // resultIndex points to record starting current resultSet in the entire results array
    var deploymentId = nlapiGetContext().getDeploymentId();
    var deployIndex = deploymentId.replace('customdeploy', '');
    var search = nlapiLoadSearch( null, savedSearchId );
    var searchResults = search.runSearch();
    var cols = search.getColumns();
    // resultIndex points to record starting current resultSet in the entire results array
    var resultIndex = 0 + (deployIndex - 1) * 1000;
    var resultStep = 1000; // Number of records returned in one step (maximum is 1000)
    var resultSet; // temporary variable used to store the result set

    do
    {
        resultSet = searchResults.getResults(resultIndex, resultIndex + resultStep);
        if(!resultSet || resultSet.length == 0)
            break;
        for (var i = 0; i < resultSet.length; i ++) 
        {   
            var recId = resultSet[i].getId();
            var recType = resultSet[i].getRecordType();
            dLog(recId,recType);
            try {
                nlapiSubmitField(recType, recId, 'custrecordzab_c_status', 5)
            } catch ( error ) {
                if ( error.getDetails != undefined ) {
                    nlapiLogExecution( "error", "Process Error", error.getCode() + ":" + error.getDetails() );
                } else {
                    nlapiLogExecution( "error", "Unexpected Error", error.toString() );
                }
            }
            
            checkGovernance();
        }
        checkGovernance();
        //resultIndex = resultIndex + 5000;
        
    } while (resultSet.length > 0);
 
}


/*============================================ Log =========================================*/
function dLog(title, details)
{
    nlapiLogExecution('Debug', title, details);
}
function eLog(title, details)
{
    nlapiLogExecution('Error', title, details);
}

function checkGovernance()
{
 var context = nlapiGetContext();
 if( context.getRemainingUsage() < 200 )
 {
    var state = nlapiYieldScript();
    if( state.status == 'FAILURE')
    {
        nlapiLogExecution("ERROR","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
        throw "Failed to yield script";
    } 
    else if ( state.status == 'RESUME' )
    {
         nlapiLogExecution("AUDIT", "Resuming script because of " + state.reason+".  Size = "+ state.size);
    }
  // state.status will never be SUCCESS because a success would imply a yield has occurred.  The equivalent response would be yield
 }
}