let CPPModule;
try {
	CPPModule = require("./build/Release/CPPModule.node");
} catch (err) {
	if (err.code) {
		console.log("Please run build.sh to build C++ module first.");
		process.exit();
	}
}

module.exports.msleep = global.msleep = function msleep(milliseconds) {
	let reachedTimeout = Buffer.from("0");
	if (milliseconds != Infinity) {
		setTimeout(function () {
			reachedTimeout.write("1");
		}, milliseconds);
	} else {
		setInterval(function () {}, 2100000000); // Make sure the event loop is alive.
	}
	CPPModule(Buffer.from("0"), reachedTimeout, Buffer.from("1"), process._tickCallback);
};

module.exports.sleep = global.sleep = function sleep(seconds) {
	msleep(seconds * 1000);
};

let originalPromise = module.exports.originalPromise = global.Promise;

module.exports.Promise = global.Promise = class Promise extends originalPromise {
	constructor(executor) {
		if (executor.constructor != Function) {
			let errMessage;
			try {
				new originalPromise(executor);
			} catch (e) {
				errMessage = e.message;
			}
			throw new TypeError(errMessage);
		}
		let pending = Buffer.from("1"), Detacher = [], status, result, ret, callExecutor;
		super(function (resolve, reject) {
			callExecutor = function () {
				executor(function (value) {
					if (+(pending.toString())) {
						ret.status = "resolved";
						ret.result = value;
						resolve(value);
						pending.write("0");
					}
				},
				function (reason) {
					if (+(pending.toString())) {
						ret.status = "rejected";
						ret.result = reason;
						reject(reason);
						pending.write("0");
					}
				},
				function (value) {
					ret.attachable = value;
				},
				function () {
					if (+(pending.toString())) {
						for (let i = 0; i < Detacher.length; i++) {
							Detacher[i]();
						}
					}
				});
			};
		});
		ret = this;
		ret.attachable = true;
		ret.status = "pending";
		ret.result = undefined;
		callExecutor();
		ret.attach = function attach(timeout) {
			if (!ret.attachable) {
				return -1;
			}
			if (ret.status != "pending") {
				return -2;
			}
			process._tickCallback();
			let timeoutID, reachedTimeout = Buffer.from("0"), detachRequired = Buffer.from("0");
			if (timeout != undefined && timeout != Infinity) {
				timeoutID = setTimeout(function () {
					reachedTimeout.write("1");
				}, timeout);
			}
			let requireDetach = function requireDetach() {
				detachRequired.write("1");
			}
			requireDetach.remove = function () {
				for (let i = 0; i < Detacher.length; i++) {
					if (Detacher[i] == requireDetach) {
						Detacher.splice(i, 0);
					}
				}
			}
			Detacher.push(requireDetach);
			CPPModule(detachRequired, reachedTimeout, pending, process._tickCallback);
			if (Boolean(+reachedTimeout.toString())) {
				requireDetach.remove();
				return -3;
			}
			if (timeoutID) {
				clearTimeout(timeoutID);
			}
			if (Boolean(+detachRequired.toString())) {
				requireDetach.remove();
				return -4;
			}
			requireDetach.remove();
			return 0;
		};
	}
}
