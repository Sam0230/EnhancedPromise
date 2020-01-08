# EnhancedPromise
Enhanced Promise for Node.js.
### Features
* Turning async functions into sync
* Querying status, result, reason in the script
* Providing sleep(seconds), msleep(milliseconds) functions
### Usage
``` JavaScript
require("enhanced_promise");
let p;
// require("enhanced_promise").originalPromise - Original Promise

function asyncFunction(a, b, callback) {
	setTimeout(callback.bind(undefined, a + b), 3000);
}

// This will print resolved 3 after three seconds. -------------------------------------------------
p = new Promise(function (resolve, reject, attachable, detach) {
	asyncFunction(1, 2, function (sum) {
		resolve(sum);
	});
});
p.attach(); // 0 OK.
console.log(p.status, p.result);
// This will print pending undefined after two seconds. ---------------------------------------------
p = new Promise(function (resolve, reject, attachable, detach) {
	asyncFunction(1, 2, function (sum) {
		resolve(sum);
	});
});
p.attach(2000); // -3 Timeout was reached.
console.log(p.status, p.result);
// This will print pending undefined after two seconds. ---------------------------------------------
p = new Promise(function (resolve, reject, attachable, detach) {
	asyncFunction(1, 2, function (sum) {
		resolve(sum);
	});
	setTimeout(function () {
		detach();
	}, 2000);
});
p.attach(); // -4 Detached.
console.log(p.status, p.result);
// This will print resolved 3 after three seconds. --------------------------------------------------
p = new Promise(function (resolve, reject, attachable, detach) {
	asyncFunction(1, 2, function (sum) {
		resolve(sum);
	});
	setTimeout(function () {
		detach();
	}, 2000);
});
p.attach(); // -4 Detached.
p.attach(); // 0 OK.
console.log(p.status, p.result);
// This will print pending undefined after two seconds. ---------------------------------------------
p = new Promise(function (resolve, reject, attachable, detach) {
	asyncFunction(1, 2, function (sum) {
		resolve(sum);
	});
	setTimeout(function () {
		attachable(false);
		detach();
	}, 2000);
});
p.attach(); // -4 Detached.
p.attach(); // -1 Not attachable.
console.log(p.status, p.result);
// This will print resolved 3 after three seconds. --------------------------------------------------
p = new Promise(function (resolve, reject, attachable, detach) {
	asyncFunction(1, 2, function (sum) {
		resolve(sum);
	});
	setTimeout(function () {
		attachable(false);
		detach();
	}, 2000);
});
p.attach(); // -4 Detached.
p.attachable = true;
p.attach(); // 0 OK.
console.log(p.status, p.result);
// This will print -2 after three seconds. ----------------------------------------------------------
p = new Promise(function (resolve, reject, attachable, detach) {
	asyncFunction(1, 2, function (sum) {
		resolve(sum);
	});
});
p.then(function () {
	console.log(p.attach()); // -2 Not pending.
});
p.attach();
// This will print 3 after three seconds. -----------------------------------------------------------
sleep(1.5);
msleep(1500);
console.log(1 + 2);
```