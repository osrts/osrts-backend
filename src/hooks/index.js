/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/
'use strict';

// Hook that allows the use of "$search" (regex) in find()
// it replaces the $search by a real regex for mongoose
exports.searchRegex = function () {
  return function (hook) {
    const query = hook.params.query;
    for (let field in query) {
      if(query[field].$search && field.indexOf('$') === -1) {
        query[field] = { $regex: new RegExp(query[field].$search, 'i') };
      }
    }
    hook.params.query = query;
    return hook;
  };
};
