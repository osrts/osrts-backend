/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/
'use strict';

// Hook that allows the use of "$search" (regex) in find()
// it replaces the $search by a real regex for mongoose
exports.searchRegex =  context => {
  const query = context.params.query;
  for (let field in query) {
    if(query[field].$search && field.indexOf('$') === -1) {
      query[field] = { $regex: new RegExp(query[field].$search, 'i') };
    }
  }
  context.params.query = query;
  return context;
};
