require("co-mocha");
var assert = require("assert");
var User = require("../models/user");

describe("Test user model", function () {
    var name = "erich_test";
    var password = "pwd";
    after(function* () {
        yield User.delete(name);
    });

    it("should create a user", function* () {
        var user = new User();
        assert.equal("object", typeof user);
    });

    it("should assign fields", function* () {
        var user = new User({ userName: name });
        assert.equal(name, user.userName);
    });

    it("should have id after being saved to db", function* () {
        var user = new User({ userName: name, password: password });
        yield user.save();
        assert(user.id);
    });

    it("should find a saved user by user name", function* () {
        var user = new User({ userName: name, password: password });
        yield user.save();
        var dbUser = yield User.findByUserName(name);
        assert(name, dbUser.userName);
        assert(dbUser instanceof User);
    });

    it("should have a hashed password", function* () {
        var user = new User({ userName: name, password: password });
        yield user.save();
        assert.notEqual(password, user.password);
    });

    it("should have same hashed password", function* () {
        var user = new User({ userName: name, password: password });
        yield user.save();
        var dbUser = yield User.findByUserName(name);
        assert(user.userName, dbUser.userName);
    });

    it("should be valid with correct pwd", function* () {
        var user = new User({ userName: name, password: password });
        assert(yield user.validate(password));
        yield user.save();
        assert(yield user.validate(password));
    });
});