const Handlebars = require('handlebars');

Handlebars.registerHelper('all', function (context, options) {
    var ret = "";
    var parsing = JSON.parse(context);
    for (var i = 0; i < parsing.length; i++) {
        ret = ret + options.fn(parsing[i]);
        //console.log(parsing[i]);
    }
    //ret = context;
    return ret;
});
