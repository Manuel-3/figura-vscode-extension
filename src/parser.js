module.exports.parse = function (lua, regex) {
    // todo: remove duplicates in the match as well as with the other defined ones like model, network, etc...

    // find names
    let x = lua.match(regex);

    if (x == null) return [];

    // reserved lua keywords
    let y = ["and","break","do","else","elseif","end","false","for","function","if",
             "in","local","nil","not","or","repeat","return","then","true","until","while"];

    // remove lua keywords from the results
    for (let i = 0; i < y.length; i++) {
        x = x.filter(f => f != y[i])
    }

    // remove duplicates from the results
    x = [...new Set(x)];
    
    return x;
}