module.exports=function (rules, data) {
    let res = Object.keys(rules).map((key) => {
        if (key!="_id") {
            // check if exists and required
            if (!data[key] && rules[key].required) {
                return `Missing ${key}!`;
            } // check type with expected type
            else if (data[key] && typeof(data[key]) != rules[key].type) {
                console.log(typeof(data[key])+" = "+rules[key].type);
                return `Invalid type for ${key}`;
            }
        }
    });

    Array.prototype.isNull = function (){
        return this.join().replace(/,/g,'').length === 0;
    };
    if (res.isNull()) {
        res = "";
    }
    return res;
};