String.prototype.toAscii = String.prototype.toAscii || function() {
    return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/Æ/g, "AE").replace(/æ/g, "ae");
};
Array.prototype.mergeMap || Object.defineProperty(Array.prototype, "mergeMap", {
    enumerable: false,
    writable: true,
    value: function(fnMap) {
        return this.map((...args)=>fnMap(...args)).filter(it=>it != null).reduce((a,b)=>Object.assign(a, b), {});
    },
});
String.prototype.toUrlified = String.prototype.toUrlified || function() {
    return encodeURIComponent(this.toLowerCase()).toLowerCase();
}
;
String.prototype.qq = String.prototype.qq || function() {
    return this.escapeQuotes();
}
;
String.prototype.escapeQuotes = String.prototype.escapeQuotes || function() {
    return this.replace(/'/g, `&apos;`).replace(/"/g, `&quot;`).replace(/</g, `&lt;`).replace(/>/g, `&gt;`);
}
;

export {toAscii, mergeMap};