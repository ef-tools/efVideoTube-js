module.exports = function* (next) {
    if (this.claims)
        yield* next;
    else
        this.throw(401, "Unauthorized");
};