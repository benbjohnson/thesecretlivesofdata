
define(["./model/node", "../../scripts/domReady/domReady-2.0.1!"], function (NodeTest, doc) {
    if (window.onerror) {
        window.onerror = console.log;
    }

    if (window.mochaPhantomJS) {
        mochaPhantomJS.run()
    } else {
        mocha.run();
    }
});
