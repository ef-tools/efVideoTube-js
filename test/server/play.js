'use strict'
require("co-mocha");
let assert = require("assert");
let util = require("util");
let Path = require("path");
let _ = require("lodash");
let mockFs = require('mock-fs');
let webApp = require("../../web-app");
let User = require("../../models/user");
let Setting = require("../../models/setting");
let agentFactory = require("../../utils/agent-factory");
let config = require("../../config");
let constant = require("../../constant");
let mock = require("../mock");

describe("Test /play api", function () {
    let server = webApp.listen();
    let user, agent;

    before(function* () {
        let userName = "erich_test";
        let password = "pwdpwd";
        user = new User({ userName: userName, password: password });
        yield user.save();

        agent = agentFactory(server);
        let result = yield agent.post(constant.urls.signin).send({ userName: userName, password: password }).expect(200).end()
        agent.headers["Authorization"] = util.format("Bearer %s", result.body.token);

        mockFs(mock.fs);
    });
    after(function* () {
        yield User.deleteByUserName(user.userName);
        yield Setting.deleteByUserName(user.userName);
        mockFs.restore();
    });

    it("should get 401 without token", function* () {
        yield agentFactory(server).get(constant.urls.play).expect(401).end();
    });

    it("should get 404 on invalid path", function* () {
        yield agent.get(constant.urls.play).query({ path: "not exist" }).expect(404).end();
    });

    it("should get play info for mp4", function* () {
        let mp4Path = Path.join("Video", "ACG", "secret base ～君がくれたもの～.mp4");
        let parentPath = Path.dirname(mp4Path);
        let result = yield agent.get(constant.urls.play).query({ path: mp4Path }).expect(200, {
            name: Path.basename(mp4Path),
            video: "/Media/Video/ACG/secret base ～君がくれたもの～.mp4",
            subtitles: [],
            parent: {
                name: Path.basename(parentPath),
                path: parentPath
            }
        }).end();
        assert.strictEqual(result.body.name, Path.basename(mp4Path));
        assert.strictEqual(result.body.video, "/Media/Video/ACG/secret base ～君がくれたもの～.mp4");
        assert.deepStrictEqual(result.body.subtitles, []);
    });

    it("should get play info for webm", function* () {
        let webmPath = Path.join("Video", "ACG", "Blue_Sky_Azure_girl.webm");
        let result = yield agent.get(constant.urls.play).query({ path: webmPath }).expect(200).end();
        assert.strictEqual(result.body.name, Path.basename(webmPath));
        assert.strictEqual(result.body.video, "/Media/Video/ACG/Blue_Sky_Azure_girl.webm");
        assert.deepStrictEqual(result.body.subtitles, []);
    });
});