                                         
                 
                     
 

export function validateSource(sourceText        )                         {
  return {
    valid: sourceText.length >= 0,
    warnings: [],
  };
}
