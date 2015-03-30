var i = 10;

function getNext() {
    console.log('get next');
    return new Promise((res, rej) => {
        setTimeout(function () {
            res(i--);
        }, 300);
    });
}


var crowler = function () {
    var sum = 0;
    console.log('crowler start', sum, i);
    return new Promise((res, rej) => {
        console.log('new promise');
        (function next() {
            return getNext().then((v) => {
                console.log('i', v);
                if (v) {
                    sum += v;
                    return next();
                } else {
                    res(sum);
                    return 'done';
                }
            });
        })();
    });
};

crowler().then((sum) => {
    console.log('res =', sum);
}, (e) => {
    console.log('error')
});

