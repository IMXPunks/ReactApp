 // Import the class 
 // no need for .js extension in path cos it gets inferred automatically
 import { AxiosUtility } from './src/helper.utility'; 
//  const { AxiosUtility } = require('./src/helper.utility'); 
 // OR
//  const Customer = require('./path/to/Customer') 
 
 // Use the class
 var axiosUtility = new AxiosUtility();
 var name = axiosUtility.get()