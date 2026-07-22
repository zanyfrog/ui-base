                                
           
                 
                  
            
           
           
               
              

                                                                          

                                     
                      
                    
                   
                    
                    
                    
 

                                   
               
              
             
 

                                     
                
                     
                    
                   
                      
                   
 

                                               
                    
                
               
                    
                       
                       
                  
 

                                 
             
                           
                
                 
                     
                
                     
                       
                     
                     
                        
                         
                      
                                
                                          
                   
                 
 

                                     
             
                
                                                          
                  
                                 
 

                                  
             
              
                                                                            
                 
                   
 

                                     
             
                    
                            
                  
 

                                       
                           
                          
                           
                            
                             
 

                                     
             
                   
                               
                           
                          
                           
                            
                             
 

export function createPageImportArtifact(input   
              
                                        
                                   
               
 )                     {
  const now = input.now ?? new Date().toISOString();
  return {
    id: input.id ?? createId('artifact'),
    schemaVersion: 1,
    metadata: {
      projectName: input.metadata.projectName || 'Modernization Project',
      routePath: input.metadata.routePath || '/',
      pageName: input.metadata.pageName || 'Imported Page',
      sourceUrl: input.metadata.sourceUrl || '',
      createdAt: input.metadata.createdAt || now,
      updatedAt: now,
    },
    source: input.extraction.source,
    items: input.extraction.items,
    tree: input.extraction.tree,
    assets: input.extraction.assets,
    logs: input.extraction.logs,
  };
}

export function createId(prefix        )         {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') return `${prefix}_${cryptoApi.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
