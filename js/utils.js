module.exports = class Utils{
    
    constructor(){
    }

    sum(arr) {
        return arr.reduce(function (prev, current, i, arr) {
            return (prev + current);
        });
    }
};