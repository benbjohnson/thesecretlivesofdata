define(["./raft/node"], function() {
    if (window.mochaPhantomJS) {
        mochaPhantomJS.run()
    } else {
        mocha.run();
    }
})
