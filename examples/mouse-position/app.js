(function () {
                  'use strict';

                  var babelHelpers_typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
                    return typeof obj;
                  } : function (obj) {
                    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
                  };

                  var babelHelpers_classCallCheck = function (instance, Constructor) {
                    if (!(instance instanceof Constructor)) {
                      throw new TypeError("Cannot call a class as a function");
                    }
                  };

                  var babelHelpers_createClass = function () {
                    function defineProperties(target, props) {
                      for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                      }
                    }

                    return function (Constructor, protoProps, staticProps) {
                      if (protoProps) defineProperties(Constructor.prototype, protoProps);
                      if (staticProps) defineProperties(Constructor, staticProps);
                      return Constructor;
                    };
                  }();

                  var babelHelpers_inherits = function (subClass, superClass) {
                    if (typeof superClass !== "function" && superClass !== null) {
                      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                    }

                    subClass.prototype = Object.create(superClass && superClass.prototype, {
                      constructor: {
                        value: subClass,
                        enumerable: false,
                        writable: true,
                        configurable: true
                      }
                    });
                    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
                  };

                  var babelHelpers_possibleConstructorReturn = function (self, call) {
                    if (!self) {
                      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                    }

                    return call && (typeof call === "object" || typeof call === "function") ? call : self;
                  };


                  var __commonjs_global = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
                  function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports, __commonjs_global), module.exports; }

                  var stepDo = function stepDo(just, iterator, x) {
                      return handleContinuation(just, iterator, iterator.next(x));
                  };

                  var handleContinuation = function handleContinuation(just, iterator, result) {
                      return result.done ? just(result.value) : result.value.chain(function (x) {
                          return stepDo(just, iterator, x);
                      });
                  };

                  // at :: t -> a -> Future t a
                  var at = function at(t, x) {
                      return new Future(t, x);
                  };

                  var newFuture = function newFuture() {
                      return at(Infinity, void 0);
                  };

                  var Future = function () {
                      function Future(time, value) {
                          babelHelpers_classCallCheck(this, Future);

                          this.time = time;
                          this.value = value;
                          this.action = void 0;
                          this.length = 0;
                      }

                      babelHelpers_createClass(Future, [{
                          key: "map",
                          value: function map(f) {
                              return _map(f, this);
                          }
                      }, {
                          key: "apply",
                          value: function apply(f) {
                              return _apply(f, this);
                          }
                      }, {
                          key: "setFuture",
                          value: function setFuture(t, x) {
                              _setFuture(t, x, this);
                          }
                      }]);
                      return Future;
                  }();

                  var Never = function (_Future) {
                      babelHelpers_inherits(Never, _Future);

                      function Never() {
                          babelHelpers_classCallCheck(this, Never);
                          return babelHelpers_possibleConstructorReturn(this, Object.getPrototypeOf(Never).call(this, Infinity, void 0));
                      }

                      babelHelpers_createClass(Never, [{
                          key: "map",
                          value: function map(f) {
                              return this;
                          }
                      }, {
                          key: "apply",
                          value: function apply(f) {
                              return this;
                          }
                      }, {
                          key: "setFuture",
                          value: function setFuture(t, x) {}
                      }]);
                      return Never;
                  }(Future);

                  var never$1 = new Never();

                  function _map(f, p) {
                      return p.time < Infinity ? at(p.time, f(p.value)) : mapFuture(f, p, newFuture());
                  }

                  function mapFuture(f, p, future) {
                      when(new Map(f, future), p);
                      return future;
                  }

                  var Map = function () {
                      function Map(f, promise) {
                          babelHelpers_classCallCheck(this, Map);

                          this.f = f;
                          this.promise = promise;
                      }

                      babelHelpers_createClass(Map, [{
                          key: "run",
                          value: function run(p) {
                              var f = this.f;
                              _setFuture(p.time, f(p.value), this.promise);
                          }
                      }]);
                      return Map;
                  }();

                  function _apply(f, p) {
                      return p.time < Infinity ? f(p) : applyFuture(f, p, newFuture());
                  }

                  function applyFuture(f, p, future) {
                      when(new Apply(f, future), p);
                      return future;
                  }

                  var Apply = function () {
                      function Apply(f, promise) {
                          babelHelpers_classCallCheck(this, Apply);

                          this.f = f;
                          this.promise = promise;
                      }

                      babelHelpers_createClass(Apply, [{
                          key: "run",
                          value: function run(p) {
                              var f = this.f;
                              when(new SetValue(this.promise), f(p));
                          }
                      }]);
                      return Apply;
                  }();

                  var any = function any(f, a, b) {
                      return a.time === Infinity && b.time === Infinity ? anyFuture(f, a, b, newFuture()) : f(a, b);
                  };

                  var anyFuture = function anyFuture(f, a, b, p) {
                      var any = new Any(f, a, b, p);
                      when(any, a);
                      when(any, b);
                      return p;
                  };

                  var Any = function () {
                      function Any(f, a, b, p) {
                          babelHelpers_classCallCheck(this, Any);

                          this.f = f;
                          this.a = a;
                          this.b = b;
                          this.p = p;
                      }

                      babelHelpers_createClass(Any, [{
                          key: "run",
                          value: function run(p) {
                              var f = this.f;
                              _setFuture(p.time, f(this.a, this.b), this.p);
                          }
                      }]);
                      return Any;
                  }();

                  var SetValue = function () {
                      function SetValue(p) {
                          babelHelpers_classCallCheck(this, SetValue);

                          this.p = p;
                      }

                      babelHelpers_createClass(SetValue, [{
                          key: "run",
                          value: function run(p) {
                              _setFuture(p.time, p.value, this.p);
                          }
                      }]);
                      return SetValue;
                  }();

                  function when(action, f) {
                      if (f.time < Infinity) {
                          action.run(f);
                      }if (f.action === undefined) {
                          f.action = action;
                      } else {
                          f[f.length++] = action;
                      }
                  }

                  function runActions(f) {
                      f.action.run(f);
                      f.action = undefined;

                      for (var i = 0; i < f.length; ++i) {
                          f[i].run(f);
                          f[i] = undefined;
                      }
                  }

                  function _setFuture(t, x, f) {
                      if (f.time < Infinity) {
                          return;
                      }

                      f.time = t;
                      f.value = x;

                      if (f.action === undefined) {
                          return;
                      }

                      runActions(f);
                  }

                  // Conceptually:
                  // type Event t a = Future t (a, Event t a)

                  var Event = function () {
                      function Event(runEvent) {
                          babelHelpers_classCallCheck(this, Event);

                          this._runEvent = runEvent;
                          this._value = void 0;
                      }

                      babelHelpers_createClass(Event, [{
                          key: 'runEvent',
                          value: function runEvent(t) {
                              return this._value === void 0 ? this._value = this._runEvent(t) : this._value;
                          }
                      }]);
                      return Event;
                  }();

                  var FutureEvent = function () {
                      function FutureEvent(future) {
                          babelHelpers_classCallCheck(this, FutureEvent);

                          this._value = future;
                      }

                      babelHelpers_createClass(FutureEvent, [{
                          key: 'runEvent',
                          value: function runEvent(t) {
                              return this._value;
                          }
                      }]);
                      return FutureEvent;
                  }();

                  // never :: Event t a

                  var never = new FutureEvent(never$1);

                  // runEvent :: (a -> ()) -> Event t a -> t -> Future t ()
                  var runEvent$1 = function runEvent(f, e, t) {
                      return e.runEvent(t).apply(function (_ref) {
                          var time = _ref.time;
                          var value = _ref.value;
                          return runEvent(f, value.next, time, f(value.value));
                      });
                  };

                  // trim :: t -> Event t a -> Event t a
                  // drop past events
                  var trim = function trim(e) {
                      return new Event(function (t) {
                          return trimNext(e.runEvent(t), t);
                      });
                  };
                  var trimNext = function trimNext(f, t) {
                      return f.time < t ? trim(f.value.next).runEvent(t) : f;
                  };

                  // map :: (a -> b) -> Event t a -> Event t b
                  var map$1 = function map(f, e) {
                      return new Event(function (t) {
                          return e.runEvent(t).map(function (_ref2) {
                              var value = _ref2.value;
                              var next = _ref2.next;
                              return eventStep(f(value), map(f, next));
                          });
                      });
                  };

                  // merge :: Event t a - Event t a -> Event t a
                  // Merge two events. Pick occurrence from e1 when e1 and e2
                  // occur simultaneously
                  var merge = function merge(e1, e2) {
                      return mergeWith(fst, e1, e2);
                  };

                  // mergeWith :: (a -> a -> a) -> Event t a -> Event t a -> Event t a
                  // Merge two events. Use f to combine simultaneous occurrences
                  var mergeWith = function mergeWith(f, e1, e2) {
                      return new Event(function (t) {
                          return mergeE(f, e1.runEvent(t), e2.runEvent(t));
                      });
                  };

                  var mergeE = function mergeE(f, e1, e2) {
                      return any(function (a, b) {
                          return mergeSelect(f, a, b);
                      }, e1, e2);
                  };

                  var mergeSelect = function mergeSelect(f, a, b) {
                      return a.time < b.time ? mergeNext(f, a, b) : b.time < a.time ? mergeNext(f, b, a) : mergeSimultaneous(f, a.time, a.value, b.value);
                  };

                  var mergeSimultaneous = function mergeSimultaneous(f, time, ev1, ev2) {
                      return eventStep(f(ev1.value, ev2.value), mergeWith(f, ev1.next, ev2.next));
                  };

                  var mergeNext = function mergeNext(f, _ref6, loser) {
                      var time = _ref6.time;
                      var value = _ref6.value;
                      return eventStep(value.value, mergeWith(f, new FutureEvent(loser), value.next));
                  };

                  // sampleWith :: (a -> b -> c) -> Signal t a -> Event t b -> Event t c
                  var sampleWith = function sampleWith(f, s, e) {
                      return new Event(function (t) {
                          return e.runEvent(t).apply(function (_ref8) {
                              var time = _ref8.time;
                              var value = _ref8.value;
                              return sampleWithNext(f, time, s.runSignal(time), value);
                          });
                      });
                  };

                  var sampleWithNext = function sampleWithNext(f, t, s, e) {
                      return at(t, eventStep(f(s.value, e.value), sampleWith(f, s.next, e.next)));
                  };

                  // sample :: Signal t a -> Event t b -> Event t a
                  var sample = function sample(s, e) {
                      return sampleWith(fst, s, e);
                  };

                  // type Occur a :: a -> Occur a
                  // newInput :: Clock t -> { occur :: Occur a, event :: Event t a }
                  var newInput = function newInput(clock) {
                      return nextEvent(clock, newFuture());
                  };

                  var nextEvent = function nextEvent(clock, future) {
                      return { occur: newOccur(clock, future), event: new FutureEvent(future) };
                  };

                  var newOccur = function newOccur(clock, future) {
                      return function (value) {
                          var _nextEvent = nextEvent(clock, newFuture());

                          var occur = _nextEvent.occur;
                          var event = _nextEvent.event;

                          future.setFuture(clock(), eventStep(value, event));
                          return occur;
                      };
                  };

                  // eventStep :: a -> Event t a -> (a, Event t a)
                  var eventStep = function eventStep(value, next) {
                      return { value: value, next: next };
                  };

                  // fst :: a -> a -> a
                  var fst = function fst(a, _) {
                      return a;
                  };

                  var Source = function () {
                      function Source(runSource) {
                          babelHelpers_classCallCheck(this, Source);

                          this.runSource = runSource;
                      }

                      babelHelpers_createClass(Source, [{
                          key: 'chain',
                          value: function chain(f) {
                              var _this = this;

                              return new Source(function (clock) {
                                  return _chain(f, clock, _this.runSource(clock));
                              });
                          }
                      }]);
                      return Source;
                  }();

                  function build(generator) {
                      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                          args[_key - 1] = arguments[_key];
                      }

                      return stepDo(just, generator.apply(this, args), void 0);
                  }

                  var newSource = function newSource(f) {
                      return new Source(newPushAdapter(f));
                  };

                  var just = function just(event) {
                      return new Source(function (_) {
                          return { dispose: noop, event: event };
                      });
                  };

                  var runEvent = function runEvent(f, source, clock) {
                      var _source$runSource = source.runSource(clock);

                      var dispose = _source$runSource.dispose;
                      var event = _source$runSource.event;

                      runEvent$1(f, event, clock());
                      return dispose;
                  };

                  var newPushAdapter = function newPushAdapter(f) {
                      return function (clock) {
                          var _newInput = newInput(clock);

                          var occur = _newInput.occur;
                          var event = _newInput.event;

                          var dispose = f(adapt(occur));
                          return { dispose: dispose, event: event };
                      };
                  };

                  var _chain = function _chain(f, clock, r1) {
                      return combineChain(r1, f(r1.event).runSource(clock));
                  };

                  var combineChain = function combineChain(r1, r2) {
                      return { dispose: disposeBoth(r2, r1), event: r2.event };
                  };

                  var disposeBoth = function disposeBoth(r1, r2) {
                      return function () {
                          r1.dispose();
                          r2.dispose();
                      };
                  };

                  var noop = function noop() {};

                  var adapt = function adapt(occur) {
                      return function (e) {
                          return occur = occur(e);
                      };
                  };

                  var newClock = function newClock(now) {
                      var start = now();
                      return function () {
                          return now() - start;
                      };
                  };

                  var runtime = __commonjs(function (module, exports, global) {
                  /**
                   * Copyright (c) 2014, Facebook, Inc.
                   * All rights reserved.
                   *
                   * This source code is licensed under the BSD-style license found in the
                   * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
                   * additional grant of patent rights can be found in the PATENTS file in
                   * the same directory.
                   */

                  !function (global) {
                    "use strict";

                    var hasOwn = Object.prototype.hasOwnProperty;
                    var undefined; // More compressible than void 0.
                    var iteratorSymbol = typeof Symbol === "function" && Symbol.iterator || "@@iterator";

                    var inModule = (typeof module === "undefined" ? "undefined" : babelHelpers_typeof(module)) === "object";
                    var runtime = global.regeneratorRuntime;
                    if (runtime) {
                      if (inModule) {
                        // If regeneratorRuntime is defined globally and we're in a module,
                        // make the exports object identical to regeneratorRuntime.
                        module.exports = runtime;
                      }
                      // Don't bother evaluating the rest of this file if the runtime was
                      // already defined globally.
                      return;
                    }

                    // Define the runtime globally (as expected by generated code) as either
                    // module.exports (if we're in a module) or a new, empty object.
                    runtime = global.regeneratorRuntime = inModule ? module.exports : {};

                    function wrap(innerFn, outerFn, self, tryLocsList) {
                      // If outerFn provided, then outerFn.prototype instanceof Generator.
                      var generator = Object.create((outerFn || Generator).prototype);
                      var context = new Context(tryLocsList || []);

                      // The ._invoke method unifies the implementations of the .next,
                      // .throw, and .return methods.
                      generator._invoke = makeInvokeMethod(innerFn, self, context);

                      return generator;
                    }
                    runtime.wrap = wrap;

                    // Try/catch helper to minimize deoptimizations. Returns a completion
                    // record like context.tryEntries[i].completion. This interface could
                    // have been (and was previously) designed to take a closure to be
                    // invoked without arguments, but in all the cases we care about we
                    // already have an existing method we want to call, so there's no need
                    // to create a new function object. We can even get away with assuming
                    // the method takes exactly one argument, since that happens to be true
                    // in every case, so we don't have to touch the arguments object. The
                    // only additional allocation required is the completion record, which
                    // has a stable shape and so hopefully should be cheap to allocate.
                    function tryCatch(fn, obj, arg) {
                      try {
                        return { type: "normal", arg: fn.call(obj, arg) };
                      } catch (err) {
                        return { type: "throw", arg: err };
                      }
                    }

                    var GenStateSuspendedStart = "suspendedStart";
                    var GenStateSuspendedYield = "suspendedYield";
                    var GenStateExecuting = "executing";
                    var GenStateCompleted = "completed";

                    // Returning this object from the innerFn has the same effect as
                    // breaking out of the dispatch switch statement.
                    var ContinueSentinel = {};

                    // Dummy constructor functions that we use as the .constructor and
                    // .constructor.prototype properties for functions that return Generator
                    // objects. For full spec compliance, you may wish to configure your
                    // minifier not to mangle the names of these two functions.
                    function Generator() {}
                    function GeneratorFunction() {}
                    function GeneratorFunctionPrototype() {}

                    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
                    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
                    GeneratorFunctionPrototype.constructor = GeneratorFunction;
                    GeneratorFunction.displayName = "GeneratorFunction";

                    // Helper for defining the .next, .throw, and .return methods of the
                    // Iterator interface in terms of a single ._invoke method.
                    function defineIteratorMethods(prototype) {
                      ["next", "throw", "return"].forEach(function (method) {
                        prototype[method] = function (arg) {
                          return this._invoke(method, arg);
                        };
                      });
                    }

                    runtime.isGeneratorFunction = function (genFun) {
                      var ctor = typeof genFun === "function" && genFun.constructor;
                      return ctor ? ctor === GeneratorFunction ||
                      // For the native GeneratorFunction constructor, the best we can
                      // do is to check its .name property.
                      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
                    };

                    runtime.mark = function (genFun) {
                      if (Object.setPrototypeOf) {
                        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
                      } else {
                        genFun.__proto__ = GeneratorFunctionPrototype;
                      }
                      genFun.prototype = Object.create(Gp);
                      return genFun;
                    };

                    // Within the body of any async function, `await x` is transformed to
                    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
                    // `value instanceof AwaitArgument` to determine if the yielded value is
                    // meant to be awaited. Some may consider the name of this method too
                    // cutesy, but they are curmudgeons.
                    runtime.awrap = function (arg) {
                      return new AwaitArgument(arg);
                    };

                    function AwaitArgument(arg) {
                      this.arg = arg;
                    }

                    function AsyncIterator(generator) {
                      // This invoke function is written in a style that assumes some
                      // calling function (or Promise) will handle exceptions.
                      function invoke(method, arg) {
                        var result = generator[method](arg);
                        var value = result.value;
                        return value instanceof AwaitArgument ? Promise.resolve(value.arg).then(invokeNext, invokeThrow) : Promise.resolve(value).then(function (unwrapped) {
                          // When a yielded Promise is resolved, its final value becomes
                          // the .value of the Promise<{value,done}> result for the
                          // current iteration. If the Promise is rejected, however, the
                          // result for this iteration will be rejected with the same
                          // reason. Note that rejections of yielded Promises are not
                          // thrown back into the generator function, as is the case
                          // when an awaited Promise is rejected. This difference in
                          // behavior between yield and await is important, because it
                          // allows the consumer to decide what to do with the yielded
                          // rejection (swallow it and continue, manually .throw it back
                          // into the generator, abandon iteration, whatever). With
                          // await, by contrast, there is no opportunity to examine the
                          // rejection reason outside the generator function, so the
                          // only option is to throw it from the await expression, and
                          // let the generator function handle the exception.
                          result.value = unwrapped;
                          return result;
                        });
                      }

                      if ((typeof process === "undefined" ? "undefined" : babelHelpers_typeof(process)) === "object" && process.domain) {
                        invoke = process.domain.bind(invoke);
                      }

                      var invokeNext = invoke.bind(generator, "next");
                      var invokeThrow = invoke.bind(generator, "throw");
                      var invokeReturn = invoke.bind(generator, "return");
                      var previousPromise;

                      function enqueue(method, arg) {
                        function callInvokeWithMethodAndArg() {
                          return invoke(method, arg);
                        }

                        return previousPromise =
                        // If enqueue has been called before, then we want to wait until
                        // all previous Promises have been resolved before calling invoke,
                        // so that results are always delivered in the correct order. If
                        // enqueue has not been called before, then it is important to
                        // call invoke immediately, without waiting on a callback to fire,
                        // so that the async generator function has the opportunity to do
                        // any necessary setup in a predictable way. This predictability
                        // is why the Promise constructor synchronously invokes its
                        // executor callback, and why async functions synchronously
                        // execute code before the first await. Since we implement simple
                        // async functions in terms of async generators, it is especially
                        // important to get this right, even though it requires care.
                        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg,
                        // Avoid propagating failures to Promises returned by later
                        // invocations of the iterator.
                        callInvokeWithMethodAndArg) : new Promise(function (resolve) {
                          resolve(callInvokeWithMethodAndArg());
                        });
                      }

                      // Define the unified helper method that is used to implement .next,
                      // .throw, and .return (see defineIteratorMethods).
                      this._invoke = enqueue;
                    }

                    defineIteratorMethods(AsyncIterator.prototype);

                    // Note that simple async functions are implemented on top of
                    // AsyncIterator objects; they just return a Promise for the value of
                    // the final result produced by the iterator.
                    runtime.async = function (innerFn, outerFn, self, tryLocsList) {
                      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));

                      return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
                      : iter.next().then(function (result) {
                        return result.done ? result.value : iter.next();
                      });
                    };

                    function makeInvokeMethod(innerFn, self, context) {
                      var state = GenStateSuspendedStart;

                      return function invoke(method, arg) {
                        if (state === GenStateExecuting) {
                          throw new Error("Generator is already running");
                        }

                        if (state === GenStateCompleted) {
                          if (method === "throw") {
                            throw arg;
                          }

                          // Be forgiving, per 25.3.3.3.3 of the spec:
                          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
                          return doneResult();
                        }

                        while (true) {
                          var delegate = context.delegate;
                          if (delegate) {
                            if (method === "return" || method === "throw" && delegate.iterator[method] === undefined) {
                              // A return or throw (when the delegate iterator has no throw
                              // method) always terminates the yield* loop.
                              context.delegate = null;

                              // If the delegate iterator has a return method, give it a
                              // chance to clean up.
                              var returnMethod = delegate.iterator["return"];
                              if (returnMethod) {
                                var record = tryCatch(returnMethod, delegate.iterator, arg);
                                if (record.type === "throw") {
                                  // If the return method threw an exception, let that
                                  // exception prevail over the original return or throw.
                                  method = "throw";
                                  arg = record.arg;
                                  continue;
                                }
                              }

                              if (method === "return") {
                                // Continue with the outer return, now that the delegate
                                // iterator has been terminated.
                                continue;
                              }
                            }

                            var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);

                            if (record.type === "throw") {
                              context.delegate = null;

                              // Like returning generator.throw(uncaught), but without the
                              // overhead of an extra function call.
                              method = "throw";
                              arg = record.arg;
                              continue;
                            }

                            // Delegate generator ran and handled its own exceptions so
                            // regardless of what the method was, we continue as if it is
                            // "next" with an undefined arg.
                            method = "next";
                            arg = undefined;

                            var info = record.arg;
                            if (info.done) {
                              context[delegate.resultName] = info.value;
                              context.next = delegate.nextLoc;
                            } else {
                              state = GenStateSuspendedYield;
                              return info;
                            }

                            context.delegate = null;
                          }

                          if (method === "next") {
                            context._sent = arg;

                            if (state === GenStateSuspendedYield) {
                              context.sent = arg;
                            } else {
                              context.sent = undefined;
                            }
                          } else if (method === "throw") {
                            if (state === GenStateSuspendedStart) {
                              state = GenStateCompleted;
                              throw arg;
                            }

                            if (context.dispatchException(arg)) {
                              // If the dispatched exception was caught by a catch block,
                              // then let that catch block handle the exception normally.
                              method = "next";
                              arg = undefined;
                            }
                          } else if (method === "return") {
                            context.abrupt("return", arg);
                          }

                          state = GenStateExecuting;

                          var record = tryCatch(innerFn, self, context);
                          if (record.type === "normal") {
                            // If an exception is thrown from innerFn, we leave state ===
                            // GenStateExecuting and loop back for another invocation.
                            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

                            var info = {
                              value: record.arg,
                              done: context.done
                            };

                            if (record.arg === ContinueSentinel) {
                              if (context.delegate && method === "next") {
                                // Deliberately forget the last sent value so that we don't
                                // accidentally pass it on to the delegate.
                                arg = undefined;
                              }
                            } else {
                              return info;
                            }
                          } else if (record.type === "throw") {
                            state = GenStateCompleted;
                            // Dispatch the exception by looping back around to the
                            // context.dispatchException(arg) call above.
                            method = "throw";
                            arg = record.arg;
                          }
                        }
                      };
                    }

                    // Define Generator.prototype.{next,throw,return} in terms of the
                    // unified ._invoke helper method.
                    defineIteratorMethods(Gp);

                    Gp[iteratorSymbol] = function () {
                      return this;
                    };

                    Gp.toString = function () {
                      return "[object Generator]";
                    };

                    function pushTryEntry(locs) {
                      var entry = { tryLoc: locs[0] };

                      if (1 in locs) {
                        entry.catchLoc = locs[1];
                      }

                      if (2 in locs) {
                        entry.finallyLoc = locs[2];
                        entry.afterLoc = locs[3];
                      }

                      this.tryEntries.push(entry);
                    }

                    function resetTryEntry(entry) {
                      var record = entry.completion || {};
                      record.type = "normal";
                      delete record.arg;
                      entry.completion = record;
                    }

                    function Context(tryLocsList) {
                      // The root entry object (effectively a try statement without a catch
                      // or a finally block) gives us a place to store values thrown from
                      // locations where there is no enclosing try statement.
                      this.tryEntries = [{ tryLoc: "root" }];
                      tryLocsList.forEach(pushTryEntry, this);
                      this.reset(true);
                    }

                    runtime.keys = function (object) {
                      var keys = [];
                      for (var key in object) {
                        keys.push(key);
                      }
                      keys.reverse();

                      // Rather than returning an object with a next method, we keep
                      // things simple and return the next function itself.
                      return function next() {
                        while (keys.length) {
                          var key = keys.pop();
                          if (key in object) {
                            next.value = key;
                            next.done = false;
                            return next;
                          }
                        }

                        // To avoid creating an additional object, we just hang the .value
                        // and .done properties off the next function object itself. This
                        // also ensures that the minifier will not anonymize the function.
                        next.done = true;
                        return next;
                      };
                    };

                    function values(iterable) {
                      if (iterable) {
                        var iteratorMethod = iterable[iteratorSymbol];
                        if (iteratorMethod) {
                          return iteratorMethod.call(iterable);
                        }

                        if (typeof iterable.next === "function") {
                          return iterable;
                        }

                        if (!isNaN(iterable.length)) {
                          var i = -1,
                              next = function next() {
                            while (++i < iterable.length) {
                              if (hasOwn.call(iterable, i)) {
                                next.value = iterable[i];
                                next.done = false;
                                return next;
                              }
                            }

                            next.value = undefined;
                            next.done = true;

                            return next;
                          };

                          return next.next = next;
                        }
                      }

                      // Return an iterator with no values.
                      return { next: doneResult };
                    }
                    runtime.values = values;

                    function doneResult() {
                      return { value: undefined, done: true };
                    }

                    Context.prototype = {
                      constructor: Context,

                      reset: function reset(skipTempReset) {
                        this.prev = 0;
                        this.next = 0;
                        this.sent = undefined;
                        this.done = false;
                        this.delegate = null;

                        this.tryEntries.forEach(resetTryEntry);

                        if (!skipTempReset) {
                          for (var name in this) {
                            // Not sure about the optimal order of these conditions:
                            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                              this[name] = undefined;
                            }
                          }
                        }
                      },

                      stop: function stop() {
                        this.done = true;

                        var rootEntry = this.tryEntries[0];
                        var rootRecord = rootEntry.completion;
                        if (rootRecord.type === "throw") {
                          throw rootRecord.arg;
                        }

                        return this.rval;
                      },

                      dispatchException: function dispatchException(exception) {
                        if (this.done) {
                          throw exception;
                        }

                        var context = this;
                        function handle(loc, caught) {
                          record.type = "throw";
                          record.arg = exception;
                          context.next = loc;
                          return !!caught;
                        }

                        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                          var entry = this.tryEntries[i];
                          var record = entry.completion;

                          if (entry.tryLoc === "root") {
                            // Exception thrown outside of any try block that could handle
                            // it, so set the completion value of the entire function to
                            // throw the exception.
                            return handle("end");
                          }

                          if (entry.tryLoc <= this.prev) {
                            var hasCatch = hasOwn.call(entry, "catchLoc");
                            var hasFinally = hasOwn.call(entry, "finallyLoc");

                            if (hasCatch && hasFinally) {
                              if (this.prev < entry.catchLoc) {
                                return handle(entry.catchLoc, true);
                              } else if (this.prev < entry.finallyLoc) {
                                return handle(entry.finallyLoc);
                              }
                            } else if (hasCatch) {
                              if (this.prev < entry.catchLoc) {
                                return handle(entry.catchLoc, true);
                              }
                            } else if (hasFinally) {
                              if (this.prev < entry.finallyLoc) {
                                return handle(entry.finallyLoc);
                              }
                            } else {
                              throw new Error("try statement without catch or finally");
                            }
                          }
                        }
                      },

                      abrupt: function abrupt(type, arg) {
                        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                          var entry = this.tryEntries[i];
                          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                            var finallyEntry = entry;
                            break;
                          }
                        }

                        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
                          // Ignore the finally entry if control is not jumping to a
                          // location outside the try/catch block.
                          finallyEntry = null;
                        }

                        var record = finallyEntry ? finallyEntry.completion : {};
                        record.type = type;
                        record.arg = arg;

                        if (finallyEntry) {
                          this.next = finallyEntry.finallyLoc;
                        } else {
                          this.complete(record);
                        }

                        return ContinueSentinel;
                      },

                      complete: function complete(record, afterLoc) {
                        if (record.type === "throw") {
                          throw record.arg;
                        }

                        if (record.type === "break" || record.type === "continue") {
                          this.next = record.arg;
                        } else if (record.type === "return") {
                          this.rval = record.arg;
                          this.next = "end";
                        } else if (record.type === "normal" && afterLoc) {
                          this.next = afterLoc;
                        }
                      },

                      finish: function finish(finallyLoc) {
                        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                          var entry = this.tryEntries[i];
                          if (entry.finallyLoc === finallyLoc) {
                            this.complete(entry.completion, entry.afterLoc);
                            resetTryEntry(entry);
                            return ContinueSentinel;
                          }
                        }
                      },

                      "catch": function _catch(tryLoc) {
                        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                          var entry = this.tryEntries[i];
                          if (entry.tryLoc === tryLoc) {
                            var record = entry.completion;
                            if (record.type === "throw") {
                              var thrown = record.arg;
                              resetTryEntry(entry);
                            }
                            return thrown;
                          }
                        }

                        // The context.catch method must only be called with a location
                        // argument that corresponds to a known catch block.
                        throw new Error("illegal catch attempt");
                      },

                      delegateYield: function delegateYield(iterable, resultName, nextLoc) {
                        this.delegate = {
                          iterator: values(iterable),
                          resultName: resultName,
                          nextLoc: nextLoc
                        };

                        return ContinueSentinel;
                      }
                    };
                  }(
                  // Among the various tricks for obtaining a reference to the global
                  // object, this seems to be the most reliable technique that does not
                  // use indirect eval (which violates Content Security Policy).
                  (typeof global === "undefined" ? "undefined" : babelHelpers_typeof(global)) === "object" ? global : (typeof window === "undefined" ? "undefined" : babelHelpers_typeof(window)) === "object" ? window : (typeof self === "undefined" ? "undefined" : babelHelpers_typeof(self)) === "object" ? self : this);
                  });

                  var $_core = __commonjs(function (module) {
                  var core = module.exports = { version: '1.2.6' };
                  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
                  });

                  var require$$1 = ($_core && typeof $_core === 'object' && 'default' in $_core ? $_core['default'] : $_core);

                  var $_global = __commonjs(function (module) {
                  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
                  var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
                  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
                  });

                  var require$$0$1 = ($_global && typeof $_global === 'object' && 'default' in $_global ? $_global['default'] : $_global);

                  var $_uid = __commonjs(function (module) {
                  var id = 0,
                      px = Math.random();
                  module.exports = function (key) {
                    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
                  };
                  });

                  var require$$4$4 = ($_uid && typeof $_uid === 'object' && 'default' in $_uid ? $_uid['default'] : $_uid);

                  var $_shared = __commonjs(function (module) {
                  var global = require$$0$1,
                      SHARED = '__core-js_shared__',
                      store = global[SHARED] || (global[SHARED] = {});
                  module.exports = function (key) {
                    return store[key] || (store[key] = {});
                  };
                  });

                  var require$$2$6 = ($_shared && typeof $_shared === 'object' && 'default' in $_shared ? $_shared['default'] : $_shared);

                  var $_wks = __commonjs(function (module) {
                  var store = require$$2$6('wks'),
                      uid = require$$4$4,
                      _Symbol = require$$0$1.Symbol;
                  module.exports = function (name) {
                    return store[name] || (store[name] = _Symbol && _Symbol[name] || (_Symbol || uid)('Symbol.' + name));
                  };
                  });

                  var require$$0 = ($_wks && typeof $_wks === 'object' && 'default' in $_wks ? $_wks['default'] : $_wks);

                  var $_iterators = __commonjs(function (module) {
                  module.exports = {};
                  });

                  var require$$1$1 = ($_iterators && typeof $_iterators === 'object' && 'default' in $_iterators ? $_iterators['default'] : $_iterators);

                  var $_fails = __commonjs(function (module) {
                  module.exports = function (exec) {
                    try {
                      return !!exec();
                    } catch (e) {
                      return true;
                    }
                  };
                  });

                  var require$$0$11 = ($_fails && typeof $_fails === 'object' && 'default' in $_fails ? $_fails['default'] : $_fails);

                  var $_descriptors = __commonjs(function (module) {
                  // Thank's IE8 for his funny defineProperty
                  module.exports = !require$$0$11(function () {
                    return Object.defineProperty({}, 'a', { get: function get() {
                        return 7;
                      } }).a != 7;
                  });
                  });

                  var require$$1$11 = ($_descriptors && typeof $_descriptors === 'object' && 'default' in $_descriptors ? $_descriptors['default'] : $_descriptors);

                  var $_propertyDesc = __commonjs(function (module) {
                  module.exports = function (bitmap, value) {
                    return {
                      enumerable: !(bitmap & 1),
                      configurable: !(bitmap & 2),
                      writable: !(bitmap & 4),
                      value: value
                    };
                  };
                  });

                  var require$$3 = ($_propertyDesc && typeof $_propertyDesc === 'object' && 'default' in $_propertyDesc ? $_propertyDesc['default'] : $_propertyDesc);

                  var $ = __commonjs(function (module) {
                  var $Object = Object;
                  module.exports = {
                    create: $Object.create,
                    getProto: $Object.getPrototypeOf,
                    isEnum: {}.propertyIsEnumerable,
                    getDesc: $Object.getOwnPropertyDescriptor,
                    setDesc: $Object.defineProperty,
                    setDescs: $Object.defineProperties,
                    getKeys: $Object.keys,
                    getNames: $Object.getOwnPropertyNames,
                    getSymbols: $Object.getOwnPropertySymbols,
                    each: [].forEach
                  };
                  });

                  var require$$1$4 = ($ && typeof $ === 'object' && 'default' in $ ? $['default'] : $);

                  var $_hide = __commonjs(function (module) {
                  var $ = require$$1$4,
                      createDesc = require$$3;
                  module.exports = require$$1$11 ? function (object, key, value) {
                    return $.setDesc(object, key, createDesc(1, value));
                  } : function (object, key, value) {
                    object[key] = value;
                    return object;
                  };
                  });

                  var require$$6 = ($_hide && typeof $_hide === 'object' && 'default' in $_hide ? $_hide['default'] : $_hide);

                  var $_has = __commonjs(function (module) {
                  var hasOwnProperty = {}.hasOwnProperty;
                  module.exports = function (it, key) {
                    return hasOwnProperty.call(it, key);
                  };
                  });

                  var require$$5 = ($_has && typeof $_has === 'object' && 'default' in $_has ? $_has['default'] : $_has);

                  var $_setToStringTag = __commonjs(function (module) {
                  var def = require$$1$4.setDesc,
                      has = require$$5,
                      TAG = require$$0('toStringTag');

                  module.exports = function (it, tag, stat) {
                    if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
                  };
                  });

                  var require$$2$3 = ($_setToStringTag && typeof $_setToStringTag === 'object' && 'default' in $_setToStringTag ? $_setToStringTag['default'] : $_setToStringTag);

                  var $_iterCreate = __commonjs(function (module) {
                  'use strict';

                  var $ = require$$1$4,
                      descriptor = require$$3,
                      setToStringTag = require$$2$3,
                      IteratorPrototype = {};

                  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
                  require$$6(IteratorPrototype, require$$0('iterator'), function () {
                    return this;
                  });

                  module.exports = function (Constructor, NAME, next) {
                    Constructor.prototype = $.create(IteratorPrototype, { next: descriptor(1, next) });
                    setToStringTag(Constructor, NAME + ' Iterator');
                  };
                  });

                  var require$$3$1 = ($_iterCreate && typeof $_iterCreate === 'object' && 'default' in $_iterCreate ? $_iterCreate['default'] : $_iterCreate);

                  var $_redefine = __commonjs(function (module) {
                  // add fake Function#toString
                  // for correct work wrapped methods / constructors with methods like LoDash isNative
                  var global = require$$0$1,
                      hide = require$$6,
                      SRC = require$$4$4('src'),
                      TO_STRING = 'toString',
                      $toString = Function[TO_STRING],
                      TPL = ('' + $toString).split(TO_STRING);

                  require$$1.inspectSource = function (it) {
                    return $toString.call(it);
                  };

                  (module.exports = function (O, key, val, safe) {
                    if (typeof val == 'function') {
                      val.hasOwnProperty(SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
                      val.hasOwnProperty('name') || hide(val, 'name', key);
                    }
                    if (O === global) {
                      O[key] = val;
                    } else {
                      if (!safe) delete O[key];
                      hide(O, key, val);
                    }
                  })(Function.prototype, TO_STRING, function toString() {
                    return typeof this == 'function' && this[SRC] || $toString.call(this);
                  });
                  });

                  var require$$7 = ($_redefine && typeof $_redefine === 'object' && 'default' in $_redefine ? $_redefine['default'] : $_redefine);

                  var $_aFunction = __commonjs(function (module) {
                  module.exports = function (it) {
                    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
                    return it;
                  };
                  });

                  var require$$1$7 = ($_aFunction && typeof $_aFunction === 'object' && 'default' in $_aFunction ? $_aFunction['default'] : $_aFunction);

                  var $_ctx = __commonjs(function (module) {
                  // optional / simple context binding
                  var aFunction = require$$1$7;
                  module.exports = function (fn, that, length) {
                    aFunction(fn);
                    if (that === undefined) return fn;
                    switch (length) {
                      case 1:
                        return function (a) {
                          return fn.call(that, a);
                        };
                      case 2:
                        return function (a, b) {
                          return fn.call(that, a, b);
                        };
                      case 3:
                        return function (a, b, c) {
                          return fn.call(that, a, b, c);
                        };
                    }
                    return function () /* ...args */{
                      return fn.apply(that, arguments);
                    };
                  };
                  });

                  var require$$4 = ($_ctx && typeof $_ctx === 'object' && 'default' in $_ctx ? $_ctx['default'] : $_ctx);

                  var $_export = __commonjs(function (module, exports) {
                  var global = require$$0$1,
                      core = require$$1,
                      hide = require$$6,
                      redefine = require$$7,
                      ctx = require$$4,
                      PROTOTYPE = 'prototype';

                  var $export = function $export(type, name, source) {
                    var IS_FORCED = type & $export.F,
                        IS_GLOBAL = type & $export.G,
                        IS_STATIC = type & $export.S,
                        IS_PROTO = type & $export.P,
                        IS_BIND = type & $export.B,
                        target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE],
                        exports = IS_GLOBAL ? core : core[name] || (core[name] = {}),
                        expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {}),
                        key,
                        own,
                        out,
                        exp;
                    if (IS_GLOBAL) source = name;
                    for (key in source) {
                      // contains in native
                      own = !IS_FORCED && target && key in target;
                      // export native or passed
                      out = (own ? target : source)[key];
                      // bind timers to global for call from export context
                      exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
                      // extend global
                      if (target && !own) redefine(target, key, out);
                      // export
                      if (exports[key] != out) hide(exports, key, exp);
                      if (IS_PROTO && expProto[key] != out) expProto[key] = out;
                    }
                  };
                  global.core = core;
                  // type bitmap
                  $export.F = 1; // forced
                  $export.G = 2; // global
                  $export.S = 4; // static
                  $export.P = 8; // proto
                  $export.B = 16; // bind
                  $export.W = 32; // wrap
                  module.exports = $export;
                  });

                  var require$$2 = ($_export && typeof $_export === 'object' && 'default' in $_export ? $_export['default'] : $_export);

                  var $_library = __commonjs(function (module) {
                  module.exports = false;
                  });

                  var require$$9$1 = ($_library && typeof $_library === 'object' && 'default' in $_library ? $_library['default'] : $_library);

                  var $_iterDefine = __commonjs(function (module) {
                  'use strict';

                  var LIBRARY = require$$9$1,
                      $export = require$$2,
                      redefine = require$$7,
                      hide = require$$6,
                      has = require$$5,
                      Iterators = require$$1$1,
                      $iterCreate = require$$3$1,
                      setToStringTag = require$$2$3,
                      getProto = require$$1$4.getProto,
                      ITERATOR = require$$0('iterator'),
                      BUGGY = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
                  ,
                      FF_ITERATOR = '@@iterator',
                      KEYS = 'keys',
                      VALUES = 'values';

                  var returnThis = function returnThis() {
                    return this;
                  };

                  module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
                    $iterCreate(Constructor, NAME, next);
                    var getMethod = function getMethod(kind) {
                      if (!BUGGY && kind in proto) return proto[kind];
                      switch (kind) {
                        case KEYS:
                          return function keys() {
                            return new Constructor(this, kind);
                          };
                        case VALUES:
                          return function values() {
                            return new Constructor(this, kind);
                          };
                      }return function entries() {
                        return new Constructor(this, kind);
                      };
                    };
                    var TAG = NAME + ' Iterator',
                        DEF_VALUES = DEFAULT == VALUES,
                        VALUES_BUG = false,
                        proto = Base.prototype,
                        $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT],
                        $default = $native || getMethod(DEFAULT),
                        methods,
                        key;
                    // Fix native
                    if ($native) {
                      var IteratorPrototype = getProto($default.call(new Base()));
                      // Set @@toStringTag to native iterators
                      setToStringTag(IteratorPrototype, TAG, true);
                      // FF fix
                      if (!LIBRARY && has(proto, FF_ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
                      // fix Array#{values, @@iterator}.name in V8 / FF
                      if (DEF_VALUES && $native.name !== VALUES) {
                        VALUES_BUG = true;
                        $default = function values() {
                          return $native.call(this);
                        };
                      }
                    }
                    // Define iterator
                    if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
                      hide(proto, ITERATOR, $default);
                    }
                    // Plug for library
                    Iterators[NAME] = $default;
                    Iterators[TAG] = returnThis;
                    if (DEFAULT) {
                      methods = {
                        values: DEF_VALUES ? $default : getMethod(VALUES),
                        keys: IS_SET ? $default : getMethod(KEYS),
                        entries: !DEF_VALUES ? $default : getMethod('entries')
                      };
                      if (FORCED) for (key in methods) {
                        if (!(key in proto)) redefine(proto, key, methods[key]);
                      } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
                    }
                    return methods;
                  };
                  });

                  var require$$6$2 = ($_iterDefine && typeof $_iterDefine === 'object' && 'default' in $_iterDefine ? $_iterDefine['default'] : $_iterDefine);

                  var $_defined = __commonjs(function (module) {
                  // 7.2.1 RequireObjectCoercible(argument)
                  module.exports = function (it) {
                    if (it == undefined) throw TypeError("Can't call method on  " + it);
                    return it;
                  };
                  });

                  var require$$0$26 = ($_defined && typeof $_defined === 'object' && 'default' in $_defined ? $_defined['default'] : $_defined);

                  var $_cof = __commonjs(function (module) {
                  var toString = {}.toString;

                  module.exports = function (it) {
                    return toString.call(it).slice(8, -1);
                  };
                  });

                  var require$$0$22 = ($_cof && typeof $_cof === 'object' && 'default' in $_cof ? $_cof['default'] : $_cof);

                  var $_iobject = __commonjs(function (module) {
                  // fallback for non-array-like ES3 and non-enumerable old V8 strings
                  var cof = require$$0$22;
                  module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
                    return cof(it) == 'String' ? it.split('') : Object(it);
                  };
                  });

                  var require$$1$19 = ($_iobject && typeof $_iobject === 'object' && 'default' in $_iobject ? $_iobject['default'] : $_iobject);

                  var $_toIobject = __commonjs(function (module) {
                  // to indexed object, toObject with fallback for non-array-like ES3 strings
                  var IObject = require$$1$19,
                      defined = require$$0$26;
                  module.exports = function (it) {
                    return IObject(defined(it));
                  };
                  });

                  var require$$0$5 = ($_toIobject && typeof $_toIobject === 'object' && 'default' in $_toIobject ? $_toIobject['default'] : $_toIobject);

                  var $_iterStep = __commonjs(function (module) {
                  module.exports = function (done, value) {
                    return { value: value, done: !!done };
                  };
                  });

                  var require$$5$2 = ($_iterStep && typeof $_iterStep === 'object' && 'default' in $_iterStep ? $_iterStep['default'] : $_iterStep);

                  var $_addToUnscopables = __commonjs(function (module) {
                  // 22.1.3.31 Array.prototype[@@unscopables]
                  var UNSCOPABLES = require$$0('unscopables'),
                      ArrayProto = Array.prototype;
                  if (ArrayProto[UNSCOPABLES] == undefined) require$$6(ArrayProto, UNSCOPABLES, {});
                  module.exports = function (key) {
                    ArrayProto[UNSCOPABLES][key] = true;
                  };
                  });

                  var require$$4$1 = ($_addToUnscopables && typeof $_addToUnscopables === 'object' && 'default' in $_addToUnscopables ? $_addToUnscopables['default'] : $_addToUnscopables);

                  var es6_array_iterator = __commonjs(function (module) {
                  'use strict';

                  var addToUnscopables = require$$4$1,
                      step = require$$5$2,
                      Iterators = require$$1$1,
                      toIObject = require$$0$5;

                  // 22.1.3.4 Array.prototype.entries()
                  // 22.1.3.13 Array.prototype.keys()
                  // 22.1.3.29 Array.prototype.values()
                  // 22.1.3.30 Array.prototype[@@iterator]()
                  module.exports = require$$6$2(Array, 'Array', function (iterated, kind) {
                    this._t = toIObject(iterated); // target
                    this._i = 0; // next index
                    this._k = kind; // kind
                    // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
                  }, function () {
                    var O = this._t,
                        kind = this._k,
                        index = this._i++;
                    if (!O || index >= O.length) {
                      this._t = undefined;
                      return step(1);
                    }
                    if (kind == 'keys') return step(0, index);
                    if (kind == 'values') return step(0, O[index]);
                    return step(0, [index, O[index]]);
                  }, 'values');

                  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
                  Iterators.Arguments = Iterators.Array;

                  addToUnscopables('keys');
                  addToUnscopables('values');
                  addToUnscopables('entries');
                  });

                  var web_dom_iterable = __commonjs(function (module) {
                  var global = require$$0$1,
                      hide = require$$6,
                      Iterators = require$$1$1,
                      ITERATOR = require$$0('iterator'),
                      NL = global.NodeList,
                      HTC = global.HTMLCollection,
                      NLProto = NL && NL.prototype,
                      HTCProto = HTC && HTC.prototype,
                      ArrayValues = Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
                  if (NLProto && !NLProto[ITERATOR]) hide(NLProto, ITERATOR, ArrayValues);
                  if (HTCProto && !HTCProto[ITERATOR]) hide(HTCProto, ITERATOR, ArrayValues);
                  });

                  var $_isObject = __commonjs(function (module) {
                  module.exports = function (it) {
                    return (typeof it === 'undefined' ? 'undefined' : babelHelpers_typeof(it)) === 'object' ? it !== null : typeof it === 'function';
                  };
                  });

                  var require$$2$2 = ($_isObject && typeof $_isObject === 'object' && 'default' in $_isObject ? $_isObject['default'] : $_isObject);

                  var $_domCreate = __commonjs(function (module) {
                  var isObject = require$$2$2,
                      document = require$$0$1.document
                  // in old IE typeof document.createElement is 'object'
                  ,
                      is = isObject(document) && isObject(document.createElement);
                  module.exports = function (it) {
                    return is ? document.createElement(it) : {};
                  };
                  });

                  var require$$2$7 = ($_domCreate && typeof $_domCreate === 'object' && 'default' in $_domCreate ? $_domCreate['default'] : $_domCreate);

                  var $_html = __commonjs(function (module) {
                  module.exports = require$$0$1.document && document.documentElement;
                  });

                  var require$$3$5 = ($_html && typeof $_html === 'object' && 'default' in $_html ? $_html['default'] : $_html);

                  var $_invoke = __commonjs(function (module) {
                  // fast apply, http://jsperf.lnkit.com/fast-apply/5
                  module.exports = function (fn, args, that) {
                                    var un = that === undefined;
                                    switch (args.length) {
                                                      case 0:
                                                                        return un ? fn() : fn.call(that);
                                                      case 1:
                                                                        return un ? fn(args[0]) : fn.call(that, args[0]);
                                                      case 2:
                                                                        return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);
                                                      case 3:
                                                                        return un ? fn(args[0], args[1], args[2]) : fn.call(that, args[0], args[1], args[2]);
                                                      case 4:
                                                                        return un ? fn(args[0], args[1], args[2], args[3]) : fn.call(that, args[0], args[1], args[2], args[3]);
                                    }return fn.apply(that, args);
                  };
                  });

                  var require$$1$3 = ($_invoke && typeof $_invoke === 'object' && 'default' in $_invoke ? $_invoke['default'] : $_invoke);

                  var $_task = __commonjs(function (module, exports, global) {
                  var ctx = require$$4,
                      invoke = require$$1$3,
                      html = require$$3$5,
                      cel = require$$2$7,
                      global = require$$0$1,
                      process = global.process,
                      setTask = global.setImmediate,
                      clearTask = global.clearImmediate,
                      MessageChannel = global.MessageChannel,
                      counter = 0,
                      queue = {},
                      ONREADYSTATECHANGE = 'onreadystatechange',
                      defer,
                      channel,
                      port;
                  var run = function run() {
                    var id = +this;
                    if (queue.hasOwnProperty(id)) {
                      var fn = queue[id];
                      delete queue[id];
                      fn();
                    }
                  };
                  var listner = function listner(event) {
                    run.call(event.data);
                  };
                  // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
                  if (!setTask || !clearTask) {
                    setTask = function setImmediate(fn) {
                      var args = [],
                          i = 1;
                      while (arguments.length > i) {
                        args.push(arguments[i++]);
                      }queue[++counter] = function () {
                        invoke(typeof fn == 'function' ? fn : Function(fn), args);
                      };
                      defer(counter);
                      return counter;
                    };
                    clearTask = function clearImmediate(id) {
                      delete queue[id];
                    };
                    // Node.js 0.8-
                    if (require$$0$22(process) == 'process') {
                      defer = function defer(id) {
                        process.nextTick(ctx(run, id, 1));
                      };
                      // Browsers with MessageChannel, includes WebWorkers
                    } else if (MessageChannel) {
                        channel = new MessageChannel();
                        port = channel.port2;
                        channel.port1.onmessage = listner;
                        defer = ctx(port.postMessage, port, 1);
                        // Browsers with postMessage, skip WebWorkers
                        // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
                      } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
                          defer = function defer(id) {
                            global.postMessage(id + '', '*');
                          };
                          global.addEventListener('message', listner, false);
                          // IE8-
                        } else if (ONREADYSTATECHANGE in cel('script')) {
                            defer = function defer(id) {
                              html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
                                html.removeChild(this);
                                run.call(id);
                              };
                            };
                            // Rest old browsers
                          } else {
                              defer = function defer(id) {
                                setTimeout(ctx(run, id, 1), 0);
                              };
                            }
                  }
                  module.exports = {
                    set: setTask,
                    clear: clearTask
                  };
                  });

                  var require$$1$2 = ($_task && typeof $_task === 'object' && 'default' in $_task ? $_task['default'] : $_task);

                  var web_immediate = __commonjs(function (module) {
                  var $export = require$$2,
                      $task = require$$1$2;
                  $export($export.G + $export.B, {
                    setImmediate: $task.set,
                    clearImmediate: $task.clear
                  });
                  });

                  var $_path = __commonjs(function (module) {
                  module.exports = require$$0$1;
                  });

                  var require$$2$8 = ($_path && typeof $_path === 'object' && 'default' in $_path ? $_path['default'] : $_path);

                  var $_partial = __commonjs(function (module) {
                  'use strict';

                  var path = require$$2$8,
                      invoke = require$$1$3,
                      aFunction = require$$1$7;
                  module.exports = function () /* ...pargs */{
                    var fn = aFunction(this),
                        length = arguments.length,
                        pargs = Array(length),
                        i = 0,
                        _ = path._,
                        holder = false;
                    while (length > i) {
                      if ((pargs[i] = arguments[i++]) === _) holder = true;
                    }return function () /* ...args */{
                      var that = this,
                          $$ = arguments,
                          $$len = $$.length,
                          j = 0,
                          k = 0,
                          args;
                      if (!holder && !$$len) return invoke(fn, pargs, that);
                      args = pargs.slice();
                      if (holder) for (; length > j; j++) {
                        if (args[j] === _) args[j] = $$[k++];
                      }while ($$len > k) {
                        args.push($$[k++]);
                      }return invoke(fn, args, that);
                    };
                  };
                  });

                  var require$$0$2 = ($_partial && typeof $_partial === 'object' && 'default' in $_partial ? $_partial['default'] : $_partial);

                  var web_timers = __commonjs(function (module) {
                  // ie9- setTimeout & setInterval additional parameters fix
                  var global = require$$0$1,
                      $export = require$$2,
                      invoke = require$$1$3,
                      partial = require$$0$2,
                      navigator = global.navigator,
                      MSIE = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
                  var wrap = function wrap(set) {
                    return MSIE ? function (fn, time /*, ...args */) {
                      return set(invoke(partial, [].slice.call(arguments, 2), typeof fn == 'function' ? fn : Function(fn)), time);
                    } : set;
                  };
                  $export($export.G + $export.B + $export.F * MSIE, {
                    setTimeout: wrap(global.setTimeout),
                    setInterval: wrap(global.setInterval)
                  });
                  });

                  var js_array_statics = __commonjs(function (module) {
                  // JavaScript 1.6 / Strawman array statics shim
                  var $ = require$$1$4,
                      $export = require$$2,
                      $ctx = require$$4,
                      $Array = require$$1.Array || Array,
                      statics = {};
                  var setStatics = function setStatics(keys, length) {
                    $.each.call(keys.split(','), function (key) {
                      if (length == undefined && key in $Array) statics[key] = $Array[key];else if (key in []) statics[key] = $ctx(Function.call, [][key], length);
                    });
                  };
                  setStatics('pop,reverse,shift,keys,values,entries', 1);
                  setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
                  setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' + 'reduce,reduceRight,copyWithin,fill');
                  $export($export.S, 'Array', statics);
                  });

                  var $_classof = __commonjs(function (module) {
                  // getting tag from 19.1.3.6 Object.prototype.toString()
                  var cof = require$$0$22,
                      TAG = require$$0('toStringTag')
                  // ES3 wrong here
                  ,
                      ARG = cof(function () {
                    return arguments;
                  }()) == 'Arguments';

                  module.exports = function (it) {
                    var O, T, B;
                    return it === undefined ? 'Undefined' : it === null ? 'Null'
                    // @@toStringTag case
                    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
                    // builtinTag case
                    : ARG ? cof(O)
                    // ES3 arguments fallback
                    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
                  };
                  });

                  var require$$3$3 = ($_classof && typeof $_classof === 'object' && 'default' in $_classof ? $_classof['default'] : $_classof);

                  var core_getIteratorMethod = __commonjs(function (module) {
                  var classof = require$$3$3,
                      ITERATOR = require$$0('iterator'),
                      Iterators = require$$1$1;
                  module.exports = require$$1.getIteratorMethod = function (it) {
                    if (it != undefined) return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
                  };
                  });

                  var require$$0$15 = (core_getIteratorMethod && typeof core_getIteratorMethod === 'object' && 'default' in core_getIteratorMethod ? core_getIteratorMethod['default'] : core_getIteratorMethod);

                  var $_toInteger = __commonjs(function (module) {
                  // 7.1.4 ToInteger
                  var ceil = Math.ceil,
                      floor = Math.floor;
                  module.exports = function (it) {
                    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
                  };
                  });

                  var require$$0$25 = ($_toInteger && typeof $_toInteger === 'object' && 'default' in $_toInteger ? $_toInteger['default'] : $_toInteger);

                  var $_toLength = __commonjs(function (module) {
                  // 7.1.15 ToLength
                  var toInteger = require$$0$25,
                      min = Math.min;
                  module.exports = function (it) {
                    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
                  };
                  });

                  var require$$0$16 = ($_toLength && typeof $_toLength === 'object' && 'default' in $_toLength ? $_toLength['default'] : $_toLength);

                  var $_anObject = __commonjs(function (module) {
                  var isObject = require$$2$2;
                  module.exports = function (it) {
                    if (!isObject(it)) throw TypeError(it + ' is not an object!');
                    return it;
                  };
                  });

                  var require$$0$10 = ($_anObject && typeof $_anObject === 'object' && 'default' in $_anObject ? $_anObject['default'] : $_anObject);

                  var $_isArrayIter = __commonjs(function (module) {
                  // check on default Array iterator
                  var Iterators = require$$1$1,
                      ITERATOR = require$$0('iterator'),
                      ArrayProto = Array.prototype;

                  module.exports = function (it) {
                    return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
                  };
                  });

                  var require$$3$4 = ($_isArrayIter && typeof $_isArrayIter === 'object' && 'default' in $_isArrayIter ? $_isArrayIter['default'] : $_isArrayIter);

                  var $_iterCall = __commonjs(function (module) {
                  // call something on iterator step with safe closing on error
                  var anObject = require$$0$10;
                  module.exports = function (iterator, fn, value, entries) {
                    try {
                      return entries ? fn(anObject(value)[0], value[1]) : fn(value);
                      // 7.4.6 IteratorClose(iterator, completion)
                    } catch (e) {
                      var ret = iterator['return'];
                      if (ret !== undefined) anObject(ret.call(iterator));
                      throw e;
                    }
                  };
                  });

                  var require$$4$2 = ($_iterCall && typeof $_iterCall === 'object' && 'default' in $_iterCall ? $_iterCall['default'] : $_iterCall);

                  var $_forOf = __commonjs(function (module) {
                  var ctx = require$$4,
                      call = require$$4$2,
                      isArrayIter = require$$3$4,
                      anObject = require$$0$10,
                      toLength = require$$0$16,
                      getIterFn = require$$0$15;
                  module.exports = function (iterable, entries, fn, that) {
                    var iterFn = getIterFn(iterable),
                        f = ctx(fn, that, entries ? 2 : 1),
                        index = 0,
                        length,
                        step,
                        iterator;
                    if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
                    // fast case for arrays with default iterator
                    if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
                      entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
                    } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
                      call(iterator, f, step.value, entries);
                    }
                  };
                  });

                  var require$$7$2 = ($_forOf && typeof $_forOf === 'object' && 'default' in $_forOf ? $_forOf['default'] : $_forOf);

                  var $_collectionToJson = __commonjs(function (module) {
                  // https://github.com/DavidBruant/Map-Set.prototype.toJSON
                  var forOf = require$$7$2,
                      classof = require$$3$3;
                  module.exports = function (NAME) {
                    return function toJSON() {
                      if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
                      var arr = [];
                      forOf(this, false, arr.push, arr);
                      return arr;
                    };
                  };
                  });

                  var require$$0$3 = ($_collectionToJson && typeof $_collectionToJson === 'object' && 'default' in $_collectionToJson ? $_collectionToJson['default'] : $_collectionToJson);

                  var es7_set_toJson = __commonjs(function (module) {
                  // https://github.com/DavidBruant/Map-Set.prototype.toJSON
                  var $export = require$$2;

                  $export($export.P, 'Set', { toJSON: require$$0$3('Set') });
                  });

                  var es7_map_toJson = __commonjs(function (module) {
                  // https://github.com/DavidBruant/Map-Set.prototype.toJSON
                  var $export = require$$2;

                  $export($export.P, 'Map', { toJSON: require$$0$3('Map') });
                  });

                  var $_objectToArray = __commonjs(function (module) {
                  var $ = require$$1$4,
                      toIObject = require$$0$5,
                      isEnum = $.isEnum;
                  module.exports = function (isEntries) {
                    return function (it) {
                      var O = toIObject(it),
                          keys = $.getKeys(O),
                          length = keys.length,
                          i = 0,
                          result = [],
                          key;
                      while (length > i) {
                        if (isEnum.call(O, key = keys[i++])) {
                          result.push(isEntries ? [key, O[key]] : O[key]);
                        }
                      }return result;
                    };
                  };
                  });

                  var require$$0$4 = ($_objectToArray && typeof $_objectToArray === 'object' && 'default' in $_objectToArray ? $_objectToArray['default'] : $_objectToArray);

                  var es7_object_entries = __commonjs(function (module) {
                  // http://goo.gl/XkBrjD
                  var $export = require$$2,
                      $entries = require$$0$4(true);

                  $export($export.S, 'Object', {
                    entries: function entries(it) {
                      return $entries(it);
                    }
                  });
                  });

                  var es7_object_values = __commonjs(function (module) {
                  // http://goo.gl/XkBrjD
                  var $export = require$$2,
                      $values = require$$0$4(false);

                  $export($export.S, 'Object', {
                    values: function values(it) {
                      return $values(it);
                    }
                  });
                  });

                  var $_ownKeys = __commonjs(function (module) {
                  // all object keys, includes non-enumerable and symbols
                  var $ = require$$1$4,
                      anObject = require$$0$10,
                      Reflect = require$$0$1.Reflect;
                  module.exports = Reflect && Reflect.ownKeys || function ownKeys(it) {
                    var keys = $.getNames(anObject(it)),
                        getSymbols = $.getSymbols;
                    return getSymbols ? keys.concat(getSymbols(it)) : keys;
                  };
                  });

                  var require$$0$6 = ($_ownKeys && typeof $_ownKeys === 'object' && 'default' in $_ownKeys ? $_ownKeys['default'] : $_ownKeys);

                  var es7_object_getOwnPropertyDescriptors = __commonjs(function (module) {
                  // https://gist.github.com/WebReflection/9353781
                  var $ = require$$1$4,
                      $export = require$$2,
                      ownKeys = require$$0$6,
                      toIObject = require$$0$5,
                      createDesc = require$$3;

                  $export($export.S, 'Object', {
                    getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
                      var O = toIObject(object),
                          setDesc = $.setDesc,
                          getDesc = $.getDesc,
                          keys = ownKeys(O),
                          result = {},
                          i = 0,
                          key,
                          D;
                      while (keys.length > i) {
                        D = getDesc(O, key = keys[i++]);
                        if (key in result) setDesc(result, key, createDesc(0, D));else result[key] = D;
                      }return result;
                    }
                  });
                  });

                  var $_replacer = __commonjs(function (module) {
                  module.exports = function (regExp, replace) {
                    var replacer = replace === Object(replace) ? function (part) {
                      return replace[part];
                    } : replace;
                    return function (it) {
                      return String(it).replace(regExp, replacer);
                    };
                  };
                  });

                  var require$$0$7 = ($_replacer && typeof $_replacer === 'object' && 'default' in $_replacer ? $_replacer['default'] : $_replacer);

                  var es7_regexp_escape = __commonjs(function (module) {
                  // https://github.com/benjamingr/RexExp.escape
                  var $export = require$$2,
                      $re = require$$0$7(/[\\^$*+?.()|[\]{}]/g, '\\$&');

                  $export($export.S, 'RegExp', { escape: function escape(it) {
                      return $re(it);
                    } });
                  });

                  var $_stringTrim = __commonjs(function (module) {
                  var $export = require$$2,
                      defined = require$$0$26,
                      fails = require$$0$11,
                      spaces = '\t\n\u000b\f\r   ᠎    ' + '         　\u2028\u2029﻿',
                      space = '[' + spaces + ']',
                      non = '​',
                      ltrim = RegExp('^' + space + space + '*'),
                      rtrim = RegExp(space + space + '*$');

                  var exporter = function exporter(KEY, exec) {
                    var exp = {};
                    exp[KEY] = exec(trim);
                    $export($export.P + $export.F * fails(function () {
                      return !!spaces[KEY]() || non[KEY]() != non;
                    }), 'String', exp);
                  };

                  // 1 -> String#trimLeft
                  // 2 -> String#trimRight
                  // 3 -> String#trim
                  var trim = exporter.trim = function (string, TYPE) {
                    string = String(defined(string));
                    if (TYPE & 1) string = string.replace(ltrim, '');
                    if (TYPE & 2) string = string.replace(rtrim, '');
                    return string;
                  };

                  module.exports = exporter;
                  });

                  var require$$2$1 = ($_stringTrim && typeof $_stringTrim === 'object' && 'default' in $_stringTrim ? $_stringTrim['default'] : $_stringTrim);

                  var es7_string_trimRight = __commonjs(function (module) {
                  'use strict';
                  // https://github.com/sebmarkbage/ecmascript-string-left-right-trim

                  require$$2$1('trimRight', function ($trim) {
                    return function trimRight() {
                      return $trim(this, 2);
                    };
                  });
                  });

                  var es7_string_trimLeft = __commonjs(function (module) {
                  'use strict';
                  // https://github.com/sebmarkbage/ecmascript-string-left-right-trim

                  require$$2$1('trimLeft', function ($trim) {
                    return function trimLeft() {
                      return $trim(this, 1);
                    };
                  });
                  });

                  var $_stringRepeat = __commonjs(function (module) {
                  'use strict';

                  var toInteger = require$$0$25,
                      defined = require$$0$26;

                  module.exports = function repeat(count) {
                    var str = String(defined(this)),
                        res = '',
                        n = toInteger(count);
                    if (n < 0 || n == Infinity) throw RangeError("Count can't be negative");
                    for (; n > 0; (n >>>= 1) && (str += str)) {
                      if (n & 1) res += str;
                    }return res;
                  };
                  });

                  var require$$1$16 = ($_stringRepeat && typeof $_stringRepeat === 'object' && 'default' in $_stringRepeat ? $_stringRepeat['default'] : $_stringRepeat);

                  var $_stringPad = __commonjs(function (module) {
                  // https://github.com/ljharb/proposal-string-pad-left-right
                  var toLength = require$$0$16,
                      repeat = require$$1$16,
                      defined = require$$0$26;

                  module.exports = function (that, maxLength, fillString, left) {
                    var S = String(defined(that)),
                        stringLength = S.length,
                        fillStr = fillString === undefined ? ' ' : String(fillString),
                        intMaxLength = toLength(maxLength);
                    if (intMaxLength <= stringLength) return S;
                    if (fillStr == '') fillStr = ' ';
                    var fillLen = intMaxLength - stringLength,
                        stringFiller = repeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
                    if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
                    return left ? stringFiller + S : S + stringFiller;
                  };
                  });

                  var require$$0$8 = ($_stringPad && typeof $_stringPad === 'object' && 'default' in $_stringPad ? $_stringPad['default'] : $_stringPad);

                  var es7_string_padRight = __commonjs(function (module) {
                  'use strict';

                  var $export = require$$2,
                      $pad = require$$0$8;

                  $export($export.P, 'String', {
                    padRight: function padRight(maxLength /*, fillString = ' ' */) {
                      return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
                    }
                  });
                  });

                  var es7_string_padLeft = __commonjs(function (module) {
                  'use strict';

                  var $export = require$$2,
                      $pad = require$$0$8;

                  $export($export.P, 'String', {
                    padLeft: function padLeft(maxLength /*, fillString = ' ' */) {
                      return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
                    }
                  });
                  });

                  var $_stringAt = __commonjs(function (module) {
                  var toInteger = require$$0$25,
                      defined = require$$0$26;
                  // true  -> String#at
                  // false -> String#codePointAt
                  module.exports = function (TO_STRING) {
                    return function (that, pos) {
                      var s = String(defined(that)),
                          i = toInteger(pos),
                          l = s.length,
                          a,
                          b;
                      if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
                      a = s.charCodeAt(i);
                      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
                    };
                  };
                  });

                  var require$$1$5 = ($_stringAt && typeof $_stringAt === 'object' && 'default' in $_stringAt ? $_stringAt['default'] : $_stringAt);

                  var es7_string_at = __commonjs(function (module) {
                  'use strict';
                  // https://github.com/mathiasbynens/String.prototype.at

                  var $export = require$$2,
                      $at = require$$1$5(true);

                  $export($export.P, 'String', {
                    at: function at(pos) {
                      return $at(this, pos);
                    }
                  });
                  });

                  var $_toIndex = __commonjs(function (module) {
                  var toInteger = require$$0$25,
                      max = Math.max,
                      min = Math.min;
                  module.exports = function (index, length) {
                    index = toInteger(index);
                    return index < 0 ? max(index + length, 0) : min(index, length);
                  };
                  });

                  var require$$1$17 = ($_toIndex && typeof $_toIndex === 'object' && 'default' in $_toIndex ? $_toIndex['default'] : $_toIndex);

                  var $_arrayIncludes = __commonjs(function (module) {
                  // false -> Array#indexOf
                  // true  -> Array#includes
                  var toIObject = require$$0$5,
                      toLength = require$$0$16,
                      toIndex = require$$1$17;
                  module.exports = function (IS_INCLUDES) {
                    return function ($this, el, fromIndex) {
                      var O = toIObject($this),
                          length = toLength(O.length),
                          index = toIndex(fromIndex, length),
                          value;
                      // Array#includes uses SameValueZero equality algorithm
                      if (IS_INCLUDES && el != el) while (length > index) {
                        value = O[index++];
                        if (value != value) return true;
                        // Array#toIndex ignores holes, Array#includes - not
                      } else for (; length > index; index++) {
                          if (IS_INCLUDES || index in O) {
                            if (O[index] === el) return IS_INCLUDES || index;
                          }
                        }return !IS_INCLUDES && -1;
                    };
                  };
                  });

                  var require$$1$6 = ($_arrayIncludes && typeof $_arrayIncludes === 'object' && 'default' in $_arrayIncludes ? $_arrayIncludes['default'] : $_arrayIncludes);

                  var es7_array_includes = __commonjs(function (module) {
                  'use strict';

                  var $export = require$$2,
                      $includes = require$$1$6(true);

                  $export($export.P, 'Array', {
                    // https://github.com/domenic/Array.prototype.includes
                    includes: function includes(el /*, fromIndex = 0 */) {
                      return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
                    }
                  });

                  require$$4$1('includes');
                  });

                  var $_setProto = __commonjs(function (module) {
                  // Works with __proto__ only. Old v8 can't work with null proto objects.
                  /* eslint-disable no-proto */
                  var getDesc = require$$1$4.getDesc,
                      isObject = require$$2$2,
                      anObject = require$$0$10;
                  var check = function check(O, proto) {
                    anObject(O);
                    if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
                  };
                  module.exports = {
                    set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
                    function (test, buggy, set) {
                      try {
                        set = require$$4(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
                        set(test, []);
                        buggy = !(test instanceof Array);
                      } catch (e) {
                        buggy = true;
                      }
                      return function setPrototypeOf(O, proto) {
                        check(O, proto);
                        if (buggy) O.__proto__ = proto;else set(O, proto);
                        return O;
                      };
                    }({}, false) : undefined),
                    check: check
                  };
                  });

                  var require$$0$9 = ($_setProto && typeof $_setProto === 'object' && 'default' in $_setProto ? $_setProto['default'] : $_setProto);

                  var es6_reflect_setPrototypeOf = __commonjs(function (module) {
                  // 26.1.14 Reflect.setPrototypeOf(target, proto)
                  var $export = require$$2,
                      setProto = require$$0$9;

                  if (setProto) $export($export.S, 'Reflect', {
                    setPrototypeOf: function setPrototypeOf(target, proto) {
                      setProto.check(target, proto);
                      try {
                        setProto.set(target, proto);
                        return true;
                      } catch (e) {
                        return false;
                      }
                    }
                  });
                  });

                  var es6_reflect_set = __commonjs(function (module) {
                  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
                  var $ = require$$1$4,
                      has = require$$5,
                      $export = require$$2,
                      createDesc = require$$3,
                      anObject = require$$0$10,
                      isObject = require$$2$2;

                  function set(target, propertyKey, V /*, receiver*/) {
                    var receiver = arguments.length < 4 ? target : arguments[3],
                        ownDesc = $.getDesc(anObject(target), propertyKey),
                        existingDescriptor,
                        proto;
                    if (!ownDesc) {
                      if (isObject(proto = $.getProto(target))) {
                        return set(proto, propertyKey, V, receiver);
                      }
                      ownDesc = createDesc(0);
                    }
                    if (has(ownDesc, 'value')) {
                      if (ownDesc.writable === false || !isObject(receiver)) return false;
                      existingDescriptor = $.getDesc(receiver, propertyKey) || createDesc(0);
                      existingDescriptor.value = V;
                      $.setDesc(receiver, propertyKey, existingDescriptor);
                      return true;
                    }
                    return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
                  }

                  $export($export.S, 'Reflect', { set: set });
                  });

                  var es6_reflect_preventExtensions = __commonjs(function (module) {
                  // 26.1.12 Reflect.preventExtensions(target)
                  var $export = require$$2,
                      anObject = require$$0$10,
                      $preventExtensions = Object.preventExtensions;

                  $export($export.S, 'Reflect', {
                    preventExtensions: function preventExtensions(target) {
                      anObject(target);
                      try {
                        if ($preventExtensions) $preventExtensions(target);
                        return true;
                      } catch (e) {
                        return false;
                      }
                    }
                  });
                  });

                  var es6_reflect_ownKeys = __commonjs(function (module) {
                  // 26.1.11 Reflect.ownKeys(target)
                  var $export = require$$2;

                  $export($export.S, 'Reflect', { ownKeys: require$$0$6 });
                  });

                  var es6_reflect_isExtensible = __commonjs(function (module) {
                  // 26.1.10 Reflect.isExtensible(target)
                  var $export = require$$2,
                      anObject = require$$0$10,
                      $isExtensible = Object.isExtensible;

                  $export($export.S, 'Reflect', {
                    isExtensible: function isExtensible(target) {
                      anObject(target);
                      return $isExtensible ? $isExtensible(target) : true;
                    }
                  });
                  });

                  var es6_reflect_has = __commonjs(function (module) {
                  // 26.1.9 Reflect.has(target, propertyKey)
                  var $export = require$$2;

                  $export($export.S, 'Reflect', {
                    has: function has(target, propertyKey) {
                      return propertyKey in target;
                    }
                  });
                  });

                  var es6_reflect_getPrototypeOf = __commonjs(function (module) {
                  // 26.1.8 Reflect.getPrototypeOf(target)
                  var $export = require$$2,
                      getProto = require$$1$4.getProto,
                      anObject = require$$0$10;

                  $export($export.S, 'Reflect', {
                    getPrototypeOf: function getPrototypeOf(target) {
                      return getProto(anObject(target));
                    }
                  });
                  });

                  var es6_reflect_getOwnPropertyDescriptor = __commonjs(function (module) {
                  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
                  var $ = require$$1$4,
                      $export = require$$2,
                      anObject = require$$0$10;

                  $export($export.S, 'Reflect', {
                    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
                      return $.getDesc(anObject(target), propertyKey);
                    }
                  });
                  });

                  var es6_reflect_get = __commonjs(function (module) {
                  // 26.1.6 Reflect.get(target, propertyKey [, receiver])
                  var $ = require$$1$4,
                      has = require$$5,
                      $export = require$$2,
                      isObject = require$$2$2,
                      anObject = require$$0$10;

                  function get(target, propertyKey /*, receiver*/) {
                    var receiver = arguments.length < 3 ? target : arguments[2],
                        desc,
                        proto;
                    if (anObject(target) === receiver) return target[propertyKey];
                    if (desc = $.getDesc(target, propertyKey)) return has(desc, 'value') ? desc.value : desc.get !== undefined ? desc.get.call(receiver) : undefined;
                    if (isObject(proto = $.getProto(target))) return get(proto, propertyKey, receiver);
                  }

                  $export($export.S, 'Reflect', { get: get });
                  });

                  var es6_reflect_enumerate = __commonjs(function (module) {
                  'use strict';
                  // 26.1.5 Reflect.enumerate(target)

                  var $export = require$$2,
                      anObject = require$$0$10;
                  var Enumerate = function Enumerate(iterated) {
                    this._t = anObject(iterated); // target
                    this._i = 0; // next index
                    var keys = this._k = [] // keys
                    ,
                        key;
                    for (key in iterated) {
                      keys.push(key);
                    }
                  };
                  require$$3$1(Enumerate, 'Object', function () {
                    var that = this,
                        keys = that._k,
                        key;
                    do {
                      if (that._i >= keys.length) return { value: undefined, done: true };
                    } while (!((key = keys[that._i++]) in that._t));
                    return { value: key, done: false };
                  });

                  $export($export.S, 'Reflect', {
                    enumerate: function enumerate(target) {
                      return new Enumerate(target);
                    }
                  });
                  });

                  var es6_reflect_deleteProperty = __commonjs(function (module) {
                  // 26.1.4 Reflect.deleteProperty(target, propertyKey)
                  var $export = require$$2,
                      getDesc = require$$1$4.getDesc,
                      anObject = require$$0$10;

                  $export($export.S, 'Reflect', {
                    deleteProperty: function deleteProperty(target, propertyKey) {
                      var desc = getDesc(anObject(target), propertyKey);
                      return desc && !desc.configurable ? false : delete target[propertyKey];
                    }
                  });
                  });

                  var es6_reflect_defineProperty = __commonjs(function (module) {
                  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
                  var $ = require$$1$4,
                      $export = require$$2,
                      anObject = require$$0$10;

                  // MS Edge has broken Reflect.defineProperty - throwing instead of returning false
                  $export($export.S + $export.F * require$$0$11(function () {
                    Reflect.defineProperty($.setDesc({}, 1, { value: 1 }), 1, { value: 2 });
                  }), 'Reflect', {
                    defineProperty: function defineProperty(target, propertyKey, attributes) {
                      anObject(target);
                      try {
                        $.setDesc(target, propertyKey, attributes);
                        return true;
                      } catch (e) {
                        return false;
                      }
                    }
                  });
                  });

                  var es6_reflect_construct = __commonjs(function (module) {
                  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
                  var $ = require$$1$4,
                      $export = require$$2,
                      aFunction = require$$1$7,
                      anObject = require$$0$10,
                      isObject = require$$2$2,
                      bind = Function.bind || require$$1.Function.prototype.bind;

                  // MS Edge supports only 2 arguments
                  // FF Nightly sets third argument as `new.target`, but does not create `this` from it
                  $export($export.S + $export.F * require$$0$11(function () {
                    function F() {}
                    return !(Reflect.construct(function () {}, [], F) instanceof F);
                  }), 'Reflect', {
                    construct: function construct(Target, args /*, newTarget*/) {
                      aFunction(Target);
                      var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
                      if (Target == newTarget) {
                        // w/o altered newTarget, optimization for 0-4 arguments
                        if (args != undefined) switch (anObject(args).length) {
                          case 0:
                            return new Target();
                          case 1:
                            return new Target(args[0]);
                          case 2:
                            return new Target(args[0], args[1]);
                          case 3:
                            return new Target(args[0], args[1], args[2]);
                          case 4:
                            return new Target(args[0], args[1], args[2], args[3]);
                        }
                        // w/o altered newTarget, lot of arguments case
                        var $args = [null];
                        $args.push.apply($args, args);
                        return new (bind.apply(Target, $args))();
                      }
                      // with altered newTarget, not support built-in constructors
                      var proto = newTarget.prototype,
                          instance = $.create(isObject(proto) ? proto : Object.prototype),
                          result = Function.apply.call(Target, instance, args);
                      return isObject(result) ? result : instance;
                    }
                  });
                  });

                  var es6_reflect_apply = __commonjs(function (module) {
                  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
                  var $export = require$$2,
                      _apply = Function.apply;

                  $export($export.S, 'Reflect', {
                    apply: function apply(target, thisArgument, argumentsList) {
                      return _apply.call(target, thisArgument, argumentsList);
                    }
                  });
                  });

                  var $_iterDetect = __commonjs(function (module) {
                  var ITERATOR = require$$0('iterator'),
                      SAFE_CLOSING = false;

                  try {
                    var riter = [7][ITERATOR]();
                    riter['return'] = function () {
                      SAFE_CLOSING = true;
                    };
                    Array.from(riter, function () {
                      throw 2;
                    });
                  } catch (e) {/* empty */}

                  module.exports = function (exec, skipClosing) {
                    if (!skipClosing && !SAFE_CLOSING) return false;
                    var safe = false;
                    try {
                      var arr = [7],
                          iter = arr[ITERATOR]();
                      iter.next = function () {
                        safe = true;
                      };
                      arr[ITERATOR] = function () {
                        return iter;
                      };
                      exec(arr);
                    } catch (e) {/* empty */}
                    return safe;
                  };
                  });

                  var require$$1$9 = ($_iterDetect && typeof $_iterDetect === 'object' && 'default' in $_iterDetect ? $_iterDetect['default'] : $_iterDetect);

                  var $_strictNew = __commonjs(function (module) {
                  module.exports = function (it, Constructor, name) {
                    if (!(it instanceof Constructor)) throw TypeError(name + ": use the 'new' operator!");
                    return it;
                  };
                  });

                  var require$$9 = ($_strictNew && typeof $_strictNew === 'object' && 'default' in $_strictNew ? $_strictNew['default'] : $_strictNew);

                  var $_redefineAll = __commonjs(function (module) {
                  var redefine = require$$7;
                  module.exports = function (target, src) {
                    for (var key in src) {
                      redefine(target, key, src[key]);
                    }return target;
                  };
                  });

                  var require$$11 = ($_redefineAll && typeof $_redefineAll === 'object' && 'default' in $_redefineAll ? $_redefineAll['default'] : $_redefineAll);

                  var $_collection = __commonjs(function (module) {
                  'use strict';

                  var global = require$$0$1,
                      $export = require$$2,
                      redefine = require$$7,
                      redefineAll = require$$11,
                      forOf = require$$7$2,
                      strictNew = require$$9,
                      isObject = require$$2$2,
                      fails = require$$0$11,
                      $iterDetect = require$$1$9,
                      setToStringTag = require$$2$3;

                  module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
                    var Base = global[NAME],
                        C = Base,
                        ADDER = IS_MAP ? 'set' : 'add',
                        proto = C && C.prototype,
                        O = {};
                    var fixMethod = function fixMethod(KEY) {
                      var fn = proto[KEY];
                      redefine(proto, KEY, KEY == 'delete' ? function (a) {
                        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
                      } : KEY == 'has' ? function has(a) {
                        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
                      } : KEY == 'get' ? function get(a) {
                        return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
                      } : KEY == 'add' ? function add(a) {
                        fn.call(this, a === 0 ? 0 : a);return this;
                      } : function set(a, b) {
                        fn.call(this, a === 0 ? 0 : a, b);return this;
                      });
                    };
                    if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
                      new C().entries().next();
                    }))) {
                      // create collection constructor
                      C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
                      redefineAll(C.prototype, methods);
                    } else {
                      var instance = new C()
                      // early implementations not supports chaining
                      ,
                          HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance
                      // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
                      ,
                          THROWS_ON_PRIMITIVES = fails(function () {
                        instance.has(1);
                      })
                      // most early implementations doesn't supports iterables, most modern - not close it correctly
                      ,
                          ACCEPT_ITERABLES = $iterDetect(function (iter) {
                        new C(iter);
                      }) // eslint-disable-line no-new
                      // for early implementations -0 and +0 not the same
                      ,
                          BUGGY_ZERO;
                      if (!ACCEPT_ITERABLES) {
                        C = wrapper(function (target, iterable) {
                          strictNew(target, C, NAME);
                          var that = new Base();
                          if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
                          return that;
                        });
                        C.prototype = proto;
                        proto.constructor = C;
                      }
                      IS_WEAK || instance.forEach(function (val, key) {
                        BUGGY_ZERO = 1 / key === -Infinity;
                      });
                      if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
                        fixMethod('delete');
                        fixMethod('has');
                        IS_MAP && fixMethod('get');
                      }
                      if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
                      // weak collections should not contains .clear method
                      if (IS_WEAK && proto.clear) delete proto.clear;
                    }

                    setToStringTag(C, NAME);

                    O[NAME] = C;
                    $export($export.G + $export.W + $export.F * (C != Base), O);

                    if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

                    return C;
                  };
                  });

                  var require$$0$12 = ($_collection && typeof $_collection === 'object' && 'default' in $_collection ? $_collection['default'] : $_collection);

                  var $_isArray = __commonjs(function (module) {
                  // 7.2.2 IsArray(argument)
                  var cof = require$$0$22;
                  module.exports = Array.isArray || function (arg) {
                    return cof(arg) == 'Array';
                  };
                  });

                  var require$$1$18 = ($_isArray && typeof $_isArray === 'object' && 'default' in $_isArray ? $_isArray['default'] : $_isArray);

                  var $_arraySpeciesCreate = __commonjs(function (module) {
                  // 9.4.2.3 ArraySpeciesCreate(originalArray, length)
                  var isObject = require$$2$2,
                      isArray = require$$1$18,
                      SPECIES = require$$0('species');
                  module.exports = function (original, length) {
                    var C;
                    if (isArray(original)) {
                      C = original.constructor;
                      // cross-realm fallback
                      if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
                      if (isObject(C)) {
                        C = C[SPECIES];
                        if (C === null) C = undefined;
                      }
                    }return new (C === undefined ? Array : C)(length);
                  };
                  });

                  var require$$0$27 = ($_arraySpeciesCreate && typeof $_arraySpeciesCreate === 'object' && 'default' in $_arraySpeciesCreate ? $_arraySpeciesCreate['default'] : $_arraySpeciesCreate);

                  var $_toObject = __commonjs(function (module) {
                  // 7.1.13 ToObject(argument)
                  var defined = require$$0$26;
                  module.exports = function (it) {
                    return Object(defined(it));
                  };
                  });

                  var require$$2$5 = ($_toObject && typeof $_toObject === 'object' && 'default' in $_toObject ? $_toObject['default'] : $_toObject);

                  var $_arrayMethods = __commonjs(function (module) {
                  // 0 -> Array#forEach
                  // 1 -> Array#map
                  // 2 -> Array#filter
                  // 3 -> Array#some
                  // 4 -> Array#every
                  // 5 -> Array#find
                  // 6 -> Array#findIndex
                  var ctx = require$$4,
                      IObject = require$$1$19,
                      toObject = require$$2$5,
                      toLength = require$$0$16,
                      asc = require$$0$27;
                  module.exports = function (TYPE) {
                    var IS_MAP = TYPE == 1,
                        IS_FILTER = TYPE == 2,
                        IS_SOME = TYPE == 3,
                        IS_EVERY = TYPE == 4,
                        IS_FIND_INDEX = TYPE == 6,
                        NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
                    return function ($this, callbackfn, that) {
                      var O = toObject($this),
                          self = IObject(O),
                          f = ctx(callbackfn, that, 3),
                          length = toLength(self.length),
                          index = 0,
                          result = IS_MAP ? asc($this, length) : IS_FILTER ? asc($this, 0) : undefined,
                          val,
                          res;
                      for (; length > index; index++) {
                        if (NO_HOLES || index in self) {
                          val = self[index];
                          res = f(val, index, O);
                          if (TYPE) {
                            if (IS_MAP) result[index] = res; // map
                            else if (res) switch (TYPE) {
                                case 3:
                                  return true; // some
                                case 5:
                                  return val; // find
                                case 6:
                                  return index; // findIndex
                                case 2:
                                  result.push(val); // filter
                              } else if (IS_EVERY) return false; // every
                          }
                        }
                      }return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
                    };
                  };
                  });

                  var require$$2$4 = ($_arrayMethods && typeof $_arrayMethods === 'object' && 'default' in $_arrayMethods ? $_arrayMethods['default'] : $_arrayMethods);

                  var $_collectionWeak = __commonjs(function (module) {
                  'use strict';

                  var hide = require$$6,
                      redefineAll = require$$11,
                      anObject = require$$0$10,
                      isObject = require$$2$2,
                      strictNew = require$$9,
                      forOf = require$$7$2,
                      createArrayMethod = require$$2$4,
                      $has = require$$5,
                      WEAK = require$$4$4('weak'),
                      isExtensible = Object.isExtensible || isObject,
                      arrayFind = createArrayMethod(5),
                      arrayFindIndex = createArrayMethod(6),
                      id = 0;

                  // fallback for frozen keys
                  var frozenStore = function frozenStore(that) {
                    return that._l || (that._l = new FrozenStore());
                  };
                  var FrozenStore = function FrozenStore() {
                    this.a = [];
                  };
                  var findFrozen = function findFrozen(store, key) {
                    return arrayFind(store.a, function (it) {
                      return it[0] === key;
                    });
                  };
                  FrozenStore.prototype = {
                    get: function get(key) {
                      var entry = findFrozen(this, key);
                      if (entry) return entry[1];
                    },
                    has: function has(key) {
                      return !!findFrozen(this, key);
                    },
                    set: function set(key, value) {
                      var entry = findFrozen(this, key);
                      if (entry) entry[1] = value;else this.a.push([key, value]);
                    },
                    'delete': function _delete(key) {
                      var index = arrayFindIndex(this.a, function (it) {
                        return it[0] === key;
                      });
                      if (~index) this.a.splice(index, 1);
                      return !! ~index;
                    }
                  };

                  module.exports = {
                    getConstructor: function getConstructor(wrapper, NAME, IS_MAP, ADDER) {
                      var C = wrapper(function (that, iterable) {
                        strictNew(that, C, NAME);
                        that._i = id++; // collection id
                        that._l = undefined; // leak store for frozen objects
                        if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
                      });
                      redefineAll(C.prototype, {
                        // 23.3.3.2 WeakMap.prototype.delete(key)
                        // 23.4.3.3 WeakSet.prototype.delete(value)
                        'delete': function _delete(key) {
                          if (!isObject(key)) return false;
                          if (!isExtensible(key)) return frozenStore(this)['delete'](key);
                          return $has(key, WEAK) && $has(key[WEAK], this._i) && delete key[WEAK][this._i];
                        },
                        // 23.3.3.4 WeakMap.prototype.has(key)
                        // 23.4.3.4 WeakSet.prototype.has(value)
                        has: function has(key) {
                          if (!isObject(key)) return false;
                          if (!isExtensible(key)) return frozenStore(this).has(key);
                          return $has(key, WEAK) && $has(key[WEAK], this._i);
                        }
                      });
                      return C;
                    },
                    def: function def(that, key, value) {
                      if (!isExtensible(anObject(key))) {
                        frozenStore(that).set(key, value);
                      } else {
                        $has(key, WEAK) || hide(key, WEAK, {});
                        key[WEAK][that._i] = value;
                      }return that;
                    },
                    frozenStore: frozenStore,
                    WEAK: WEAK
                  };
                  });

                  var require$$3$2 = ($_collectionWeak && typeof $_collectionWeak === 'object' && 'default' in $_collectionWeak ? $_collectionWeak['default'] : $_collectionWeak);

                  var es6_weakSet = __commonjs(function (module) {
                  'use strict';

                  var weak = require$$3$2;

                  // 23.4 WeakSet Objects
                  require$$0$12('WeakSet', function (get) {
                    return function WeakSet() {
                      return get(this, arguments.length > 0 ? arguments[0] : undefined);
                    };
                  }, {
                    // 23.4.3.1 WeakSet.prototype.add(value)
                    add: function add(value) {
                      return weak.def(this, value, true);
                    }
                  }, weak, false, true);
                  });

                  var es6_weakMap = __commonjs(function (module) {
                  'use strict';

                  var $ = require$$1$4,
                      redefine = require$$7,
                      weak = require$$3$2,
                      isObject = require$$2$2,
                      has = require$$5,
                      frozenStore = weak.frozenStore,
                      WEAK = weak.WEAK,
                      isExtensible = Object.isExtensible || isObject,
                      tmp = {};

                  // 23.3 WeakMap Objects
                  var $WeakMap = require$$0$12('WeakMap', function (get) {
                    return function WeakMap() {
                      return get(this, arguments.length > 0 ? arguments[0] : undefined);
                    };
                  }, {
                    // 23.3.3.3 WeakMap.prototype.get(key)
                    get: function get(key) {
                      if (isObject(key)) {
                        if (!isExtensible(key)) return frozenStore(this).get(key);
                        if (has(key, WEAK)) return key[WEAK][this._i];
                      }
                    },
                    // 23.3.3.5 WeakMap.prototype.set(key, value)
                    set: function set(key, value) {
                      return weak.def(this, key, value);
                    }
                  }, weak, true, true);

                  // IE11 WeakMap frozen keys fix
                  if (new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7) {
                    $.each.call(['delete', 'has', 'get', 'set'], function (key) {
                      var proto = $WeakMap.prototype,
                          method = proto[key];
                      redefine(proto, key, function (a, b) {
                        // store frozen objects on leaky map
                        if (isObject(a) && !isExtensible(a)) {
                          var result = frozenStore(this)[key](a, b);
                          return key == 'set' ? this : result;
                          // store all the rest on native weakmap
                        }return method.call(this, a, b);
                      });
                    });
                  }
                  });

                  var $_setSpecies = __commonjs(function (module) {
                  'use strict';

                  var global = require$$0$1,
                      $ = require$$1$4,
                      DESCRIPTORS = require$$1$11,
                      SPECIES = require$$0('species');

                  module.exports = function (KEY) {
                    var C = global[KEY];
                    if (DESCRIPTORS && C && !C[SPECIES]) $.setDesc(C, SPECIES, {
                      configurable: true,
                      get: function get() {
                        return this;
                      }
                    });
                  };
                  });

                  var require$$1$10 = ($_setSpecies && typeof $_setSpecies === 'object' && 'default' in $_setSpecies ? $_setSpecies['default'] : $_setSpecies);

                  var $_collectionStrong = __commonjs(function (module) {
                  'use strict';

                  var $ = require$$1$4,
                      hide = require$$6,
                      redefineAll = require$$11,
                      ctx = require$$4,
                      strictNew = require$$9,
                      defined = require$$0$26,
                      forOf = require$$7$2,
                      $iterDefine = require$$6$2,
                      step = require$$5$2,
                      ID = require$$4$4('id'),
                      $has = require$$5,
                      isObject = require$$2$2,
                      setSpecies = require$$1$10,
                      DESCRIPTORS = require$$1$11,
                      isExtensible = Object.isExtensible || isObject,
                      SIZE = DESCRIPTORS ? '_s' : 'size',
                      id = 0;

                  var fastKey = function fastKey(it, create) {
                    // return primitive with prefix
                    if (!isObject(it)) return (typeof it === 'undefined' ? 'undefined' : babelHelpers_typeof(it)) == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
                    if (!$has(it, ID)) {
                      // can't set id to frozen object
                      if (!isExtensible(it)) return 'F';
                      // not necessary to add id
                      if (!create) return 'E';
                      // add missing object id
                      hide(it, ID, ++id);
                      // return object id with prefix
                    }return 'O' + it[ID];
                  };

                  var getEntry = function getEntry(that, key) {
                    // fast case
                    var index = fastKey(key),
                        entry;
                    if (index !== 'F') return that._i[index];
                    // frozen object case
                    for (entry = that._f; entry; entry = entry.n) {
                      if (entry.k == key) return entry;
                    }
                  };

                  module.exports = {
                    getConstructor: function getConstructor(wrapper, NAME, IS_MAP, ADDER) {
                      var C = wrapper(function (that, iterable) {
                        strictNew(that, C, NAME);
                        that._i = $.create(null); // index
                        that._f = undefined; // first entry
                        that._l = undefined; // last entry
                        that[SIZE] = 0; // size
                        if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
                      });
                      redefineAll(C.prototype, {
                        // 23.1.3.1 Map.prototype.clear()
                        // 23.2.3.2 Set.prototype.clear()
                        clear: function clear() {
                          for (var that = this, data = that._i, entry = that._f; entry; entry = entry.n) {
                            entry.r = true;
                            if (entry.p) entry.p = entry.p.n = undefined;
                            delete data[entry.i];
                          }
                          that._f = that._l = undefined;
                          that[SIZE] = 0;
                        },
                        // 23.1.3.3 Map.prototype.delete(key)
                        // 23.2.3.4 Set.prototype.delete(value)
                        'delete': function _delete(key) {
                          var that = this,
                              entry = getEntry(that, key);
                          if (entry) {
                            var next = entry.n,
                                prev = entry.p;
                            delete that._i[entry.i];
                            entry.r = true;
                            if (prev) prev.n = next;
                            if (next) next.p = prev;
                            if (that._f == entry) that._f = next;
                            if (that._l == entry) that._l = prev;
                            that[SIZE]--;
                          }return !!entry;
                        },
                        // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
                        // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
                        forEach: function forEach(callbackfn /*, that = undefined */) {
                          var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3),
                              entry;
                          while (entry = entry ? entry.n : this._f) {
                            f(entry.v, entry.k, this);
                            // revert to the last existing entry
                            while (entry && entry.r) {
                              entry = entry.p;
                            }
                          }
                        },
                        // 23.1.3.7 Map.prototype.has(key)
                        // 23.2.3.7 Set.prototype.has(value)
                        has: function has(key) {
                          return !!getEntry(this, key);
                        }
                      });
                      if (DESCRIPTORS) $.setDesc(C.prototype, 'size', {
                        get: function get() {
                          return defined(this[SIZE]);
                        }
                      });
                      return C;
                    },
                    def: function def(that, key, value) {
                      var entry = getEntry(that, key),
                          prev,
                          index;
                      // change existing entry
                      if (entry) {
                        entry.v = value;
                        // create new entry
                      } else {
                          that._l = entry = {
                            i: index = fastKey(key, true), // <- index
                            k: key, // <- key
                            v: value, // <- value
                            p: prev = that._l, // <- previous entry
                            n: undefined, // <- next entry
                            r: false // <- removed
                          };
                          if (!that._f) that._f = entry;
                          if (prev) prev.n = entry;
                          that[SIZE]++;
                          // add to index
                          if (index !== 'F') that._i[index] = entry;
                        }return that;
                    },
                    getEntry: getEntry,
                    setStrong: function setStrong(C, NAME, IS_MAP) {
                      // add .keys, .values, .entries, [@@iterator]
                      // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
                      $iterDefine(C, NAME, function (iterated, kind) {
                        this._t = iterated; // target
                        this._k = kind; // kind
                        this._l = undefined; // previous
                      }, function () {
                        var that = this,
                            kind = that._k,
                            entry = that._l;
                        // revert to the last existing entry
                        while (entry && entry.r) {
                          entry = entry.p;
                        } // get next entry
                        if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
                          // or finish the iteration
                          that._t = undefined;
                          return step(1);
                        }
                        // return step by kind
                        if (kind == 'keys') return step(0, entry.k);
                        if (kind == 'values') return step(0, entry.v);
                        return step(0, [entry.k, entry.v]);
                      }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

                      // add [@@species], 23.1.2.2, 23.2.2.2
                      setSpecies(NAME);
                    }
                  };
                  });

                  var require$$1$8 = ($_collectionStrong && typeof $_collectionStrong === 'object' && 'default' in $_collectionStrong ? $_collectionStrong['default'] : $_collectionStrong);

                  var es6_set = __commonjs(function (module) {
                  'use strict';

                  var strong = require$$1$8;

                  // 23.2 Set Objects
                  require$$0$12('Set', function (get) {
                    return function Set() {
                      return get(this, arguments.length > 0 ? arguments[0] : undefined);
                    };
                  }, {
                    // 23.2.3.1 Set.prototype.add(value)
                    add: function add(value) {
                      return strong.def(this, value = value === 0 ? 0 : value, value);
                    }
                  }, strong);
                  });

                  var es6_map = __commonjs(function (module) {
                  'use strict';

                  var strong = require$$1$8;

                  // 23.1 Map Objects
                  require$$0$12('Map', function (get) {
                    return function Map() {
                      return get(this, arguments.length > 0 ? arguments[0] : undefined);
                    };
                  }, {
                    // 23.1.3.6 Map.prototype.get(key)
                    get: function get(key) {
                      var entry = strong.getEntry(this, key);
                      return entry && entry.v;
                    },
                    // 23.1.3.9 Map.prototype.set(key, value)
                    set: function set(key, value) {
                      return strong.def(this, key === 0 ? 0 : key, value);
                    }
                  }, strong, true);
                  });

                  var $_microtask = __commonjs(function (module) {
                  var global = require$$0$1,
                      macrotask = require$$1$2.set,
                      Observer = global.MutationObserver || global.WebKitMutationObserver,
                      process = global.process,
                      Promise = global.Promise,
                      isNode = require$$0$22(process) == 'process',
                      head,
                      last,
                      notify;

                  var flush = function flush() {
                    var parent, domain, fn;
                    if (isNode && (parent = process.domain)) {
                      process.domain = null;
                      parent.exit();
                    }
                    while (head) {
                      domain = head.domain;
                      fn = head.fn;
                      if (domain) domain.enter();
                      fn(); // <- currently we use it only for Promise - try / catch not required
                      if (domain) domain.exit();
                      head = head.next;
                    }last = undefined;
                    if (parent) parent.enter();
                  };

                  // Node.js
                  if (isNode) {
                    notify = function notify() {
                      process.nextTick(flush);
                    };
                    // browsers with MutationObserver
                  } else if (Observer) {
                      var toggle = 1,
                          node = document.createTextNode('');
                      new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
                      notify = function notify() {
                        node.data = toggle = -toggle;
                      };
                      // environments with maybe non-completely correct, but existent Promise
                    } else if (Promise && Promise.resolve) {
                        notify = function notify() {
                          Promise.resolve().then(flush);
                        };
                        // for other environments - macrotask based on:
                        // - setImmediate
                        // - MessageChannel
                        // - window.postMessag
                        // - onreadystatechange
                        // - setTimeout
                      } else {
                          notify = function notify() {
                            // strange IE + webpack dev server bug - use .call(global)
                            macrotask.call(global, flush);
                          };
                        }

                  module.exports = function asap(fn) {
                    var task = { fn: fn, next: undefined, domain: isNode && process.domain };
                    if (last) last.next = task;
                    if (!head) {
                      head = task;
                      notify();
                    }last = task;
                  };
                  });

                  var require$$6$1 = ($_microtask && typeof $_microtask === 'object' && 'default' in $_microtask ? $_microtask['default'] : $_microtask);

                  var $_speciesConstructor = __commonjs(function (module) {
                  // 7.3.20 SpeciesConstructor(O, defaultConstructor)
                  var anObject = require$$0$10,
                      aFunction = require$$1$7,
                      SPECIES = require$$0('species');
                  module.exports = function (O, D) {
                    var C = anObject(O).constructor,
                        S;
                    return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
                  };
                  });

                  var require$$7$1 = ($_speciesConstructor && typeof $_speciesConstructor === 'object' && 'default' in $_speciesConstructor ? $_speciesConstructor['default'] : $_speciesConstructor);

                  var $_sameValue = __commonjs(function (module) {
                  // 7.2.9 SameValue(x, y)
                  module.exports = Object.is || function is(x, y) {
                    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
                  };
                  });

                  var require$$0$13 = ($_sameValue && typeof $_sameValue === 'object' && 'default' in $_sameValue ? $_sameValue['default'] : $_sameValue);

                  var es6_promise = __commonjs(function (module, exports, global) {
                  'use strict';

                  var $ = require$$1$4,
                      LIBRARY = require$$9$1,
                      global = require$$0$1,
                      ctx = require$$4,
                      classof = require$$3$3,
                      $export = require$$2,
                      isObject = require$$2$2,
                      anObject = require$$0$10,
                      aFunction = require$$1$7,
                      strictNew = require$$9,
                      forOf = require$$7$2,
                      setProto = require$$0$9.set,
                      same = require$$0$13,
                      SPECIES = require$$0('species'),
                      speciesConstructor = require$$7$1,
                      asap = require$$6$1,
                      PROMISE = 'Promise',
                      process = global.process,
                      isNode = classof(process) == 'process',
                      P = global[PROMISE],
                      Wrapper;

                  var testResolve = function testResolve(sub) {
                    var test = new P(function () {});
                    if (sub) test.constructor = Object;
                    return P.resolve(test) === test;
                  };

                  var USE_NATIVE = function () {
                    var works = false;
                    function P2(x) {
                      var self = new P(x);
                      setProto(self, P2.prototype);
                      return self;
                    }
                    try {
                      works = P && P.resolve && testResolve();
                      setProto(P2, P);
                      P2.prototype = $.create(P.prototype, { constructor: { value: P2 } });
                      // actual Firefox has broken subclass support, test that
                      if (!(P2.resolve(5).then(function () {}) instanceof P2)) {
                        works = false;
                      }
                      // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
                      if (works && require$$1$11) {
                        var thenableThenGotten = false;
                        P.resolve($.setDesc({}, 'then', {
                          get: function get() {
                            thenableThenGotten = true;
                          }
                        }));
                        works = thenableThenGotten;
                      }
                    } catch (e) {
                      works = false;
                    }
                    return works;
                  }();

                  // helpers
                  var sameConstructor = function sameConstructor(a, b) {
                    // library wrapper special case
                    if (LIBRARY && a === P && b === Wrapper) return true;
                    return same(a, b);
                  };
                  var getConstructor = function getConstructor(C) {
                    var S = anObject(C)[SPECIES];
                    return S != undefined ? S : C;
                  };
                  var isThenable = function isThenable(it) {
                    var then;
                    return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
                  };
                  var PromiseCapability = function PromiseCapability(C) {
                    var resolve, reject;
                    this.promise = new C(function ($$resolve, $$reject) {
                      if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
                      resolve = $$resolve;
                      reject = $$reject;
                    });
                    this.resolve = aFunction(resolve), this.reject = aFunction(reject);
                  };
                  var perform = function perform(exec) {
                    try {
                      exec();
                    } catch (e) {
                      return { error: e };
                    }
                  };
                  var notify = function notify(record, isReject) {
                    if (record.n) return;
                    record.n = true;
                    var chain = record.c;
                    asap(function () {
                      var value = record.v,
                          ok = record.s == 1,
                          i = 0;
                      var run = function run(reaction) {
                        var handler = ok ? reaction.ok : reaction.fail,
                            resolve = reaction.resolve,
                            reject = reaction.reject,
                            result,
                            then;
                        try {
                          if (handler) {
                            if (!ok) record.h = true;
                            result = handler === true ? value : handler(value);
                            if (result === reaction.promise) {
                              reject(TypeError('Promise-chain cycle'));
                            } else if (then = isThenable(result)) {
                              then.call(result, resolve, reject);
                            } else resolve(result);
                          } else reject(value);
                        } catch (e) {
                          reject(e);
                        }
                      };
                      while (chain.length > i) {
                        run(chain[i++]);
                      } // variable length - can't use forEach
                      chain.length = 0;
                      record.n = false;
                      if (isReject) setTimeout(function () {
                        var promise = record.p,
                            handler,
                            console;
                        if (isUnhandled(promise)) {
                          if (isNode) {
                            process.emit('unhandledRejection', value, promise);
                          } else if (handler = global.onunhandledrejection) {
                            handler({ promise: promise, reason: value });
                          } else if ((console = global.console) && console.error) {
                            console.error('Unhandled promise rejection', value);
                          }
                        }record.a = undefined;
                      }, 1);
                    });
                  };
                  var isUnhandled = function isUnhandled(promise) {
                    var record = promise._d,
                        chain = record.a || record.c,
                        i = 0,
                        reaction;
                    if (record.h) return false;
                    while (chain.length > i) {
                      reaction = chain[i++];
                      if (reaction.fail || !isUnhandled(reaction.promise)) return false;
                    }return true;
                  };
                  var $reject = function $reject(value) {
                    var record = this;
                    if (record.d) return;
                    record.d = true;
                    record = record.r || record; // unwrap
                    record.v = value;
                    record.s = 2;
                    record.a = record.c.slice();
                    notify(record, true);
                  };
                  var $resolve = function $resolve(value) {
                    var record = this,
                        then;
                    if (record.d) return;
                    record.d = true;
                    record = record.r || record; // unwrap
                    try {
                      if (record.p === value) throw TypeError("Promise can't be resolved itself");
                      if (then = isThenable(value)) {
                        asap(function () {
                          var wrapper = { r: record, d: false }; // wrap
                          try {
                            then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
                          } catch (e) {
                            $reject.call(wrapper, e);
                          }
                        });
                      } else {
                        record.v = value;
                        record.s = 1;
                        notify(record, false);
                      }
                    } catch (e) {
                      $reject.call({ r: record, d: false }, e); // wrap
                    }
                  };

                  // constructor polyfill
                  if (!USE_NATIVE) {
                    // 25.4.3.1 Promise(executor)
                    P = function Promise(executor) {
                      aFunction(executor);
                      var record = this._d = {
                        p: strictNew(this, P, PROMISE), // <- promise
                        c: [], // <- awaiting reactions
                        a: undefined, // <- checked in isUnhandled reactions
                        s: 0, // <- state
                        d: false, // <- done
                        v: undefined, // <- value
                        h: false, // <- handled rejection
                        n: false // <- notify
                      };
                      try {
                        executor(ctx($resolve, record, 1), ctx($reject, record, 1));
                      } catch (err) {
                        $reject.call(record, err);
                      }
                    };
                    require$$11(P.prototype, {
                      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
                      then: function then(onFulfilled, onRejected) {
                        var reaction = new PromiseCapability(speciesConstructor(this, P)),
                            promise = reaction.promise,
                            record = this._d;
                        reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
                        reaction.fail = typeof onRejected == 'function' && onRejected;
                        record.c.push(reaction);
                        if (record.a) record.a.push(reaction);
                        if (record.s) notify(record, false);
                        return promise;
                      },
                      // 25.4.5.1 Promise.prototype.catch(onRejected)
                      'catch': function _catch(onRejected) {
                        return this.then(undefined, onRejected);
                      }
                    });
                  }

                  $export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: P });
                  require$$2$3(P, PROMISE);
                  require$$1$10(PROMISE);
                  Wrapper = require$$1[PROMISE];

                  // statics
                  $export($export.S + $export.F * !USE_NATIVE, PROMISE, {
                    // 25.4.4.5 Promise.reject(r)
                    reject: function reject(r) {
                      var capability = new PromiseCapability(this),
                          $$reject = capability.reject;
                      $$reject(r);
                      return capability.promise;
                    }
                  });
                  $export($export.S + $export.F * (!USE_NATIVE || testResolve(true)), PROMISE, {
                    // 25.4.4.6 Promise.resolve(x)
                    resolve: function resolve(x) {
                      // instanceof instead of internal slot check because we should fix it without replacement native Promise core
                      if (x instanceof P && sameConstructor(x.constructor, this)) return x;
                      var capability = new PromiseCapability(this),
                          $$resolve = capability.resolve;
                      $$resolve(x);
                      return capability.promise;
                    }
                  });
                  $export($export.S + $export.F * !(USE_NATIVE && require$$1$9(function (iter) {
                    P.all(iter)['catch'](function () {});
                  })), PROMISE, {
                    // 25.4.4.1 Promise.all(iterable)
                    all: function all(iterable) {
                      var C = getConstructor(this),
                          capability = new PromiseCapability(C),
                          resolve = capability.resolve,
                          reject = capability.reject,
                          values = [];
                      var abrupt = perform(function () {
                        forOf(iterable, false, values.push, values);
                        var remaining = values.length,
                            results = Array(remaining);
                        if (remaining) $.each.call(values, function (promise, index) {
                          var alreadyCalled = false;
                          C.resolve(promise).then(function (value) {
                            if (alreadyCalled) return;
                            alreadyCalled = true;
                            results[index] = value;
                            --remaining || resolve(results);
                          }, reject);
                        });else resolve(results);
                      });
                      if (abrupt) reject(abrupt.error);
                      return capability.promise;
                    },
                    // 25.4.4.4 Promise.race(iterable)
                    race: function race(iterable) {
                      var C = getConstructor(this),
                          capability = new PromiseCapability(C),
                          reject = capability.reject;
                      var abrupt = perform(function () {
                        forOf(iterable, false, function (promise) {
                          C.resolve(promise).then(capability.resolve, reject);
                        });
                      });
                      if (abrupt) reject(abrupt.error);
                      return capability.promise;
                    }
                  });
                  });

                  var $_fixReWks = __commonjs(function (module) {
                  'use strict';

                  var hide = require$$6,
                      redefine = require$$7,
                      fails = require$$0$11,
                      defined = require$$0$26,
                      wks = require$$0;

                  module.exports = function (KEY, length, exec) {
                    var SYMBOL = wks(KEY),
                        original = ''[KEY];
                    if (fails(function () {
                      var O = {};
                      O[SYMBOL] = function () {
                        return 7;
                      };
                      return ''[KEY](O) != 7;
                    })) {
                      redefine(String.prototype, KEY, exec(defined, SYMBOL, original));
                      hide(RegExp.prototype, SYMBOL, length == 2
                      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
                      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
                      ? function (string, arg) {
                        return original.call(string, this, arg);
                      }
                      // 21.2.5.6 RegExp.prototype[@@match](string)
                      // 21.2.5.9 RegExp.prototype[@@search](string)
                      : function (string) {
                        return original.call(string, this);
                      });
                    }
                  };
                  });

                  var require$$0$14 = ($_fixReWks && typeof $_fixReWks === 'object' && 'default' in $_fixReWks ? $_fixReWks['default'] : $_fixReWks);

                  var es6_regexp_split = __commonjs(function (module) {
                  // @@split logic
                  require$$0$14('split', 2, function (defined, SPLIT, $split) {
                    // 21.1.3.17 String.prototype.split(separator, limit)
                    return function split(separator, limit) {
                      'use strict';

                      var O = defined(this),
                          fn = separator == undefined ? undefined : separator[SPLIT];
                      return fn !== undefined ? fn.call(separator, O, limit) : $split.call(String(O), separator, limit);
                    };
                  });
                  });

                  var es6_regexp_search = __commonjs(function (module) {
                  // @@search logic
                  require$$0$14('search', 1, function (defined, SEARCH) {
                    // 21.1.3.15 String.prototype.search(regexp)
                    return function search(regexp) {
                      'use strict';

                      var O = defined(this),
                          fn = regexp == undefined ? undefined : regexp[SEARCH];
                      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
                    };
                  });
                  });

                  var es6_regexp_replace = __commonjs(function (module) {
                  // @@replace logic
                  require$$0$14('replace', 2, function (defined, REPLACE, $replace) {
                    // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
                    return function replace(searchValue, replaceValue) {
                      'use strict';

                      var O = defined(this),
                          fn = searchValue == undefined ? undefined : searchValue[REPLACE];
                      return fn !== undefined ? fn.call(searchValue, O, replaceValue) : $replace.call(String(O), searchValue, replaceValue);
                    };
                  });
                  });

                  var es6_regexp_match = __commonjs(function (module) {
                  // @@match logic
                  require$$0$14('match', 1, function (defined, MATCH) {
                    // 21.1.3.11 String.prototype.match(regexp)
                    return function match(regexp) {
                      'use strict';

                      var O = defined(this),
                          fn = regexp == undefined ? undefined : regexp[MATCH];
                      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
                    };
                  });
                  });

                  var $_flags = __commonjs(function (module) {
                  'use strict';
                  // 21.2.5.3 get RegExp.prototype.flags

                  var anObject = require$$0$10;
                  module.exports = function () {
                    var that = anObject(this),
                        result = '';
                    if (that.global) result += 'g';
                    if (that.ignoreCase) result += 'i';
                    if (that.multiline) result += 'm';
                    if (that.unicode) result += 'u';
                    if (that.sticky) result += 'y';
                    return result;
                  };
                  });

                  var require$$5$1 = ($_flags && typeof $_flags === 'object' && 'default' in $_flags ? $_flags['default'] : $_flags);

                  var es6_regexp_flags = __commonjs(function (module) {
                  // 21.2.5.3 get RegExp.prototype.flags()
                  var $ = require$$1$4;
                  if (require$$1$11 && /./g.flags != 'g') $.setDesc(RegExp.prototype, 'flags', {
                    configurable: true,
                    get: require$$5$1
                  });
                  });

                  var $_isRegexp = __commonjs(function (module) {
                  // 7.2.8 IsRegExp(argument)
                  var isObject = require$$2$2,
                      cof = require$$0$22,
                      MATCH = require$$0('match');
                  module.exports = function (it) {
                    var isRegExp;
                    return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
                  };
                  });

                  var require$$1$12 = ($_isRegexp && typeof $_isRegexp === 'object' && 'default' in $_isRegexp ? $_isRegexp['default'] : $_isRegexp);

                  var es6_regexp_constructor = __commonjs(function (module, exports, global) {
                  var $ = require$$1$4,
                      global = require$$0$1,
                      isRegExp = require$$1$12,
                      $flags = require$$5$1,
                      $RegExp = global.RegExp,
                      Base = $RegExp,
                      proto = $RegExp.prototype,
                      re1 = /a/g,
                      re2 = /a/g
                  // "new" creates a new object, old webkit buggy here
                  ,
                      CORRECT_NEW = new $RegExp(re1) !== re1;

                  if (require$$1$11 && (!CORRECT_NEW || require$$0$11(function () {
                    re2[require$$0('match')] = false;
                    // RegExp constructor can alter flags and IsRegExp works correct with @@match
                    return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
                  }))) {
                    $RegExp = function RegExp(p, f) {
                      var piRE = isRegExp(p),
                          fiU = f === undefined;
                      return !(this instanceof $RegExp) && piRE && p.constructor === $RegExp && fiU ? p : CORRECT_NEW ? new Base(piRE && !fiU ? p.source : p, f) : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f);
                    };
                    $.each.call($.getNames(Base), function (key) {
                      key in $RegExp || $.setDesc($RegExp, key, {
                        configurable: true,
                        get: function get() {
                          return Base[key];
                        },
                        set: function set(it) {
                          Base[key] = it;
                        }
                      });
                    });
                    proto.constructor = $RegExp;
                    $RegExp.prototype = proto;
                    require$$7(global, 'RegExp', $RegExp);
                  }

                  require$$1$10('RegExp');
                  });

                  var es6_array_findIndex = __commonjs(function (module) {
                  'use strict';
                  // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)

                  var $export = require$$2,
                      $find = require$$2$4(6),
                      KEY = 'findIndex',
                      forced = true;
                  // Shouldn't skip holes
                  if (KEY in []) Array(1)[KEY](function () {
                    forced = false;
                  });
                  $export($export.P + $export.F * forced, 'Array', {
                    findIndex: function findIndex(callbackfn /*, that = undefined */) {
                      return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
                    }
                  });
                  require$$4$1(KEY);
                  });

                  var es6_array_find = __commonjs(function (module) {
                  'use strict';
                  // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)

                  var $export = require$$2,
                      $find = require$$2$4(5),
                      KEY = 'find',
                      forced = true;
                  // Shouldn't skip holes
                  if (KEY in []) Array(1)[KEY](function () {
                    forced = false;
                  });
                  $export($export.P + $export.F * forced, 'Array', {
                    find: function find(callbackfn /*, that = undefined */) {
                      return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
                    }
                  });
                  require$$4$1(KEY);
                  });

                  var $_arrayFill = __commonjs(function (module) {
                  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
                  'use strict';

                  var toObject = require$$2$5,
                      toIndex = require$$1$17,
                      toLength = require$$0$16;
                  module.exports = [].fill || function fill(value /*, start = 0, end = @length */) {
                    var O = toObject(this),
                        length = toLength(O.length),
                        $$ = arguments,
                        $$len = $$.length,
                        index = toIndex($$len > 1 ? $$[1] : undefined, length),
                        end = $$len > 2 ? $$[2] : undefined,
                        endPos = end === undefined ? length : toIndex(end, length);
                    while (endPos > index) {
                      O[index++] = value;
                    }return O;
                  };
                  });

                  var require$$1$13 = ($_arrayFill && typeof $_arrayFill === 'object' && 'default' in $_arrayFill ? $_arrayFill['default'] : $_arrayFill);

                  var es6_array_fill = __commonjs(function (module) {
                  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
                  var $export = require$$2;

                  $export($export.P, 'Array', { fill: require$$1$13 });

                  require$$4$1('fill');
                  });

                  var $_arrayCopyWithin = __commonjs(function (module) {
                  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
                  'use strict';

                  var toObject = require$$2$5,
                      toIndex = require$$1$17,
                      toLength = require$$0$16;

                  module.exports = [].copyWithin || function copyWithin(target /*= 0*/, start /*= 0, end = @length*/) {
                    var O = toObject(this),
                        len = toLength(O.length),
                        to = toIndex(target, len),
                        from = toIndex(start, len),
                        $$ = arguments,
                        end = $$.length > 2 ? $$[2] : undefined,
                        count = Math.min((end === undefined ? len : toIndex(end, len)) - from, len - to),
                        inc = 1;
                    if (from < to && to < from + count) {
                      inc = -1;
                      from += count - 1;
                      to += count - 1;
                    }
                    while (count-- > 0) {
                      if (from in O) O[to] = O[from];else delete O[to];
                      to += inc;
                      from += inc;
                    }return O;
                  };
                  });

                  var require$$1$14 = ($_arrayCopyWithin && typeof $_arrayCopyWithin === 'object' && 'default' in $_arrayCopyWithin ? $_arrayCopyWithin['default'] : $_arrayCopyWithin);

                  var es6_array_copyWithin = __commonjs(function (module) {
                  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
                  var $export = require$$2;

                  $export($export.P, 'Array', { copyWithin: require$$1$14 });

                  require$$4$1('copyWithin');
                  });

                  var es6_array_species = __commonjs(function (module) {
                  require$$1$10('Array');
                  });

                  var es6_array_of = __commonjs(function (module) {
                  'use strict';

                  var $export = require$$2;

                  // WebKit Array.of isn't generic
                  $export($export.S + $export.F * require$$0$11(function () {
                    function F() {}
                    return !(Array.of.call(F) instanceof F);
                  }), 'Array', {
                    // 22.1.2.3 Array.of( ...items)
                    of: function of() /* ...args */{
                      var index = 0,
                          $$ = arguments,
                          $$len = $$.length,
                          result = new (typeof this == 'function' ? this : Array)($$len);
                      while ($$len > index) {
                        result[index] = $$[index++];
                      }result.length = $$len;
                      return result;
                    }
                  });
                  });

                  var es6_array_from = __commonjs(function (module) {
                  'use strict';

                  var ctx = require$$4,
                      $export = require$$2,
                      toObject = require$$2$5,
                      call = require$$4$2,
                      isArrayIter = require$$3$4,
                      toLength = require$$0$16,
                      getIterFn = require$$0$15;
                  $export($export.S + $export.F * !require$$1$9(function (iter) {
                    Array.from(iter);
                  }), 'Array', {
                    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
                    from: function from(arrayLike /*, mapfn = undefined, thisArg = undefined*/) {
                      var O = toObject(arrayLike),
                          C = typeof this == 'function' ? this : Array,
                          $$ = arguments,
                          $$len = $$.length,
                          mapfn = $$len > 1 ? $$[1] : undefined,
                          mapping = mapfn !== undefined,
                          index = 0,
                          iterFn = getIterFn(O),
                          length,
                          result,
                          step,
                          iterator;
                      if (mapping) mapfn = ctx(mapfn, $$len > 2 ? $$[2] : undefined, 2);
                      // if object isn't iterable or it's array with default iterator - use simple case
                      if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
                        for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
                          result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
                        }
                      } else {
                        length = toLength(O.length);
                        for (result = new C(length); length > index; index++) {
                          result[index] = mapping ? mapfn(O[index], index) : O[index];
                        }
                      }
                      result.length = index;
                      return result;
                    }
                  });
                  });

                  var $_failsIsRegexp = __commonjs(function (module) {
                  var MATCH = require$$0('match');
                  module.exports = function (KEY) {
                    var re = /./;
                    try {
                      '/./'[KEY](re);
                    } catch (e) {
                      try {
                        re[MATCH] = false;
                        return !'/./'[KEY](re);
                      } catch (f) {/* empty */}
                    }return true;
                  };
                  });

                  var require$$0$17 = ($_failsIsRegexp && typeof $_failsIsRegexp === 'object' && 'default' in $_failsIsRegexp ? $_failsIsRegexp['default'] : $_failsIsRegexp);

                  var $_stringContext = __commonjs(function (module) {
                  // helper for String#{startsWith, endsWith, includes}
                  var isRegExp = require$$1$12,
                      defined = require$$0$26;

                  module.exports = function (that, searchString, NAME) {
                    if (isRegExp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
                    return String(defined(that));
                  };
                  });

                  var require$$1$15 = ($_stringContext && typeof $_stringContext === 'object' && 'default' in $_stringContext ? $_stringContext['default'] : $_stringContext);

                  var es6_string_startsWith = __commonjs(function (module) {
                  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
                  'use strict';

                  var $export = require$$2,
                      toLength = require$$0$16,
                      context = require$$1$15,
                      STARTS_WITH = 'startsWith',
                      $startsWith = ''[STARTS_WITH];

                  $export($export.P + $export.F * require$$0$17(STARTS_WITH), 'String', {
                    startsWith: function startsWith(searchString /*, position = 0 */) {
                      var that = context(this, searchString, STARTS_WITH),
                          $$ = arguments,
                          index = toLength(Math.min($$.length > 1 ? $$[1] : undefined, that.length)),
                          search = String(searchString);
                      return $startsWith ? $startsWith.call(that, search, index) : that.slice(index, index + search.length) === search;
                    }
                  });
                  });

                  var es6_string_repeat = __commonjs(function (module) {
                  var $export = require$$2;

                  $export($export.P, 'String', {
                    // 21.1.3.13 String.prototype.repeat(count)
                    repeat: require$$1$16
                  });
                  });

                  var es6_string_includes = __commonjs(function (module) {
                  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
                  'use strict';

                  var $export = require$$2,
                      context = require$$1$15,
                      INCLUDES = 'includes';

                  $export($export.P + $export.F * require$$0$17(INCLUDES), 'String', {
                    includes: function includes(searchString /*, position = 0 */) {
                      return !! ~context(this, searchString, INCLUDES).indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
                    }
                  });
                  });

                  var es6_string_endsWith = __commonjs(function (module) {
                  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
                  'use strict';

                  var $export = require$$2,
                      toLength = require$$0$16,
                      context = require$$1$15,
                      ENDS_WITH = 'endsWith',
                      $endsWith = ''[ENDS_WITH];

                  $export($export.P + $export.F * require$$0$17(ENDS_WITH), 'String', {
                    endsWith: function endsWith(searchString /*, endPosition = @length */) {
                      var that = context(this, searchString, ENDS_WITH),
                          $$ = arguments,
                          endPosition = $$.length > 1 ? $$[1] : undefined,
                          len = toLength(that.length),
                          end = endPosition === undefined ? len : Math.min(toLength(endPosition), len),
                          search = String(searchString);
                      return $endsWith ? $endsWith.call(that, search, end) : that.slice(end - search.length, end) === search;
                    }
                  });
                  });

                  var es6_string_codePointAt = __commonjs(function (module) {
                  'use strict';

                  var $export = require$$2,
                      $at = require$$1$5(false);
                  $export($export.P, 'String', {
                    // 21.1.3.3 String.prototype.codePointAt(pos)
                    codePointAt: function codePointAt(pos) {
                      return $at(this, pos);
                    }
                  });
                  });

                  var es6_string_iterator = __commonjs(function (module) {
                  'use strict';

                  var $at = require$$1$5(true);

                  // 21.1.3.27 String.prototype[@@iterator]()
                  require$$6$2(String, 'String', function (iterated) {
                    this._t = String(iterated); // target
                    this._i = 0; // next index
                    // 21.1.5.2.1 %StringIteratorPrototype%.next()
                  }, function () {
                    var O = this._t,
                        index = this._i,
                        point;
                    if (index >= O.length) return { value: undefined, done: true };
                    point = $at(O, index);
                    this._i += point.length;
                    return { value: point, done: false };
                  });
                  });

                  var es6_string_trim = __commonjs(function (module) {
                  'use strict';
                  // 21.1.3.25 String.prototype.trim()

                  require$$2$1('trim', function ($trim) {
                    return function trim() {
                      return $trim(this, 3);
                    };
                  });
                  });

                  var es6_string_raw = __commonjs(function (module) {
                  var $export = require$$2,
                      toIObject = require$$0$5,
                      toLength = require$$0$16;

                  $export($export.S, 'String', {
                    // 21.1.2.4 String.raw(callSite, ...substitutions)
                    raw: function raw(callSite) {
                      var tpl = toIObject(callSite.raw),
                          len = toLength(tpl.length),
                          $$ = arguments,
                          $$len = $$.length,
                          res = [],
                          i = 0;
                      while (len > i) {
                        res.push(String(tpl[i++]));
                        if (i < $$len) res.push(String($$[i]));
                      }return res.join('');
                    }
                  });
                  });

                  var es6_string_fromCodePoint = __commonjs(function (module) {
                  var $export = require$$2,
                      toIndex = require$$1$17,
                      fromCharCode = String.fromCharCode,
                      $fromCodePoint = String.fromCodePoint;

                  // length should be 1, old FF problem
                  $export($export.S + $export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
                    // 21.1.2.2 String.fromCodePoint(...codePoints)
                    fromCodePoint: function fromCodePoint(x) {
                      // eslint-disable-line no-unused-vars
                      var res = [],
                          $$ = arguments,
                          $$len = $$.length,
                          i = 0,
                          code;
                      while ($$len > i) {
                        code = +$$[i++];
                        if (toIndex(code, 0x10ffff) !== code) throw RangeError(code + ' is not a valid code point');
                        res.push(code < 0x10000 ? fromCharCode(code) : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00));
                      }return res.join('');
                    }
                  });
                  });

                  var es6_math_trunc = __commonjs(function (module) {
                  // 20.2.2.34 Math.trunc(x)
                  var $export = require$$2;

                  $export($export.S, 'Math', {
                    trunc: function trunc(it) {
                      return (it > 0 ? Math.floor : Math.ceil)(it);
                    }
                  });
                  });

                  var $_mathExpm1 = __commonjs(function (module) {
                  // 20.2.2.14 Math.expm1(x)
                  module.exports = Math.expm1 || function expm1(x) {
                    return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
                  };
                  });

                  var require$$0$18 = ($_mathExpm1 && typeof $_mathExpm1 === 'object' && 'default' in $_mathExpm1 ? $_mathExpm1['default'] : $_mathExpm1);

                  var es6_math_tanh = __commonjs(function (module) {
                  // 20.2.2.33 Math.tanh(x)
                  var $export = require$$2,
                      expm1 = require$$0$18,
                      exp = Math.exp;

                  $export($export.S, 'Math', {
                    tanh: function tanh(x) {
                      var a = expm1(x = +x),
                          b = expm1(-x);
                      return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
                    }
                  });
                  });

                  var es6_math_sinh = __commonjs(function (module) {
                  // 20.2.2.30 Math.sinh(x)
                  var $export = require$$2,
                      expm1 = require$$0$18,
                      exp = Math.exp;

                  // V8 near Chromium 38 has a problem with very small numbers
                  $export($export.S + $export.F * require$$0$11(function () {
                    return !Math.sinh(-2e-17) != -2e-17;
                  }), 'Math', {
                    sinh: function sinh(x) {
                      return Math.abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (Math.E / 2);
                    }
                  });
                  });

                  var $_mathSign = __commonjs(function (module) {
                  // 20.2.2.28 Math.sign(x)
                  module.exports = Math.sign || function sign(x) {
                    return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
                  };
                  });

                  var require$$0$19 = ($_mathSign && typeof $_mathSign === 'object' && 'default' in $_mathSign ? $_mathSign['default'] : $_mathSign);

                  var es6_math_sign = __commonjs(function (module) {
                  // 20.2.2.28 Math.sign(x)
                  var $export = require$$2;

                  $export($export.S, 'Math', { sign: require$$0$19 });
                  });

                  var es6_math_log2 = __commonjs(function (module) {
                  // 20.2.2.22 Math.log2(x)
                  var $export = require$$2;

                  $export($export.S, 'Math', {
                    log2: function log2(x) {
                      return Math.log(x) / Math.LN2;
                    }
                  });
                  });

                  var $_mathLog1p = __commonjs(function (module) {
                  // 20.2.2.20 Math.log1p(x)
                  module.exports = Math.log1p || function log1p(x) {
                    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
                  };
                  });

                  var require$$0$20 = ($_mathLog1p && typeof $_mathLog1p === 'object' && 'default' in $_mathLog1p ? $_mathLog1p['default'] : $_mathLog1p);

                  var es6_math_log1p = __commonjs(function (module) {
                  // 20.2.2.20 Math.log1p(x)
                  var $export = require$$2;

                  $export($export.S, 'Math', { log1p: require$$0$20 });
                  });

                  var es6_math_log10 = __commonjs(function (module) {
                  // 20.2.2.21 Math.log10(x)
                  var $export = require$$2;

                  $export($export.S, 'Math', {
                    log10: function log10(x) {
                      return Math.log(x) / Math.LN10;
                    }
                  });
                  });

                  var es6_math_imul = __commonjs(function (module) {
                  // 20.2.2.18 Math.imul(x, y)
                  var $export = require$$2,
                      $imul = Math.imul;

                  // some WebKit versions fails with big numbers, some has wrong arity
                  $export($export.S + $export.F * require$$0$11(function () {
                    return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
                  }), 'Math', {
                    imul: function imul(x, y) {
                      var UINT16 = 0xffff,
                          xn = +x,
                          yn = +y,
                          xl = UINT16 & xn,
                          yl = UINT16 & yn;
                      return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
                    }
                  });
                  });

                  var es6_math_hypot = __commonjs(function (module) {
                  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
                  var $export = require$$2,
                      abs = Math.abs;

                  $export($export.S, 'Math', {
                    hypot: function hypot(value1, value2) {
                      // eslint-disable-line no-unused-vars
                      var sum = 0,
                          i = 0,
                          $$ = arguments,
                          $$len = $$.length,
                          larg = 0,
                          arg,
                          div;
                      while (i < $$len) {
                        arg = abs($$[i++]);
                        if (larg < arg) {
                          div = larg / arg;
                          sum = sum * div * div + 1;
                          larg = arg;
                        } else if (arg > 0) {
                          div = arg / larg;
                          sum += div * div;
                        } else sum += arg;
                      }
                      return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
                    }
                  });
                  });

                  var es6_math_fround = __commonjs(function (module) {
                  // 20.2.2.16 Math.fround(x)
                  var $export = require$$2,
                      sign = require$$0$19,
                      pow = Math.pow,
                      EPSILON = pow(2, -52),
                      EPSILON32 = pow(2, -23),
                      MAX32 = pow(2, 127) * (2 - EPSILON32),
                      MIN32 = pow(2, -126);

                  var roundTiesToEven = function roundTiesToEven(n) {
                    return n + 1 / EPSILON - 1 / EPSILON;
                  };

                  $export($export.S, 'Math', {
                    fround: function fround(x) {
                      var $abs = Math.abs(x),
                          $sign = sign(x),
                          a,
                          result;
                      if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
                      a = (1 + EPSILON32 / EPSILON) * $abs;
                      result = a - (a - $abs);
                      if (result > MAX32 || result != result) return $sign * Infinity;
                      return $sign * result;
                    }
                  });
                  });

                  var es6_math_expm1 = __commonjs(function (module) {
                  // 20.2.2.14 Math.expm1(x)
                  var $export = require$$2;

                  $export($export.S, 'Math', { expm1: require$$0$18 });
                  });

                  var es6_math_cosh = __commonjs(function (module) {
                  // 20.2.2.12 Math.cosh(x)
                  var $export = require$$2,
                      exp = Math.exp;

                  $export($export.S, 'Math', {
                    cosh: function cosh(x) {
                      return (exp(x = +x) + exp(-x)) / 2;
                    }
                  });
                  });

                  var es6_math_clz32 = __commonjs(function (module) {
                  // 20.2.2.11 Math.clz32(x)
                  var $export = require$$2;

                  $export($export.S, 'Math', {
                    clz32: function clz32(x) {
                      return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
                    }
                  });
                  });

                  var es6_math_cbrt = __commonjs(function (module) {
                  // 20.2.2.9 Math.cbrt(x)
                  var $export = require$$2,
                      sign = require$$0$19;

                  $export($export.S, 'Math', {
                    cbrt: function cbrt(x) {
                      return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
                    }
                  });
                  });

                  var es6_math_atanh = __commonjs(function (module) {
                  // 20.2.2.7 Math.atanh(x)
                  var $export = require$$2;

                  $export($export.S, 'Math', {
                    atanh: function atanh(x) {
                      return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
                    }
                  });
                  });

                  var es6_math_asinh = __commonjs(function (module) {
                  // 20.2.2.5 Math.asinh(x)
                  var $export = require$$2;

                  function asinh(x) {
                    return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
                  }

                  $export($export.S, 'Math', { asinh: asinh });
                  });

                  var es6_math_acosh = __commonjs(function (module) {
                  // 20.2.2.3 Math.acosh(x)
                  var $export = require$$2,
                      log1p = require$$0$20,
                      sqrt = Math.sqrt,
                      $acosh = Math.acosh;

                  // V8 bug https://code.google.com/p/v8/issues/detail?id=3509
                  $export($export.S + $export.F * !($acosh && Math.floor($acosh(Number.MAX_VALUE)) == 710), 'Math', {
                    acosh: function acosh(x) {
                      return (x = +x) < 1 ? NaN : x > 94906265.62425156 ? Math.log(x) + Math.LN2 : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
                    }
                  });
                  });

                  var es6_number_parseInt = __commonjs(function (module) {
                  // 20.1.2.13 Number.parseInt(string, radix)
                  var $export = require$$2;

                  $export($export.S, 'Number', { parseInt: parseInt });
                  });

                  var es6_number_parseFloat = __commonjs(function (module) {
                  // 20.1.2.12 Number.parseFloat(string)
                  var $export = require$$2;

                  $export($export.S, 'Number', { parseFloat: parseFloat });
                  });

                  var es6_number_minSafeInteger = __commonjs(function (module) {
                  // 20.1.2.10 Number.MIN_SAFE_INTEGER
                  var $export = require$$2;

                  $export($export.S, 'Number', { MIN_SAFE_INTEGER: -0x1fffffffffffff });
                  });

                  var es6_number_maxSafeInteger = __commonjs(function (module) {
                  // 20.1.2.6 Number.MAX_SAFE_INTEGER
                  var $export = require$$2;

                  $export($export.S, 'Number', { MAX_SAFE_INTEGER: 0x1fffffffffffff });
                  });

                  var $_isInteger = __commonjs(function (module) {
                  // 20.1.2.3 Number.isInteger(number)
                  var isObject = require$$2$2,
                      floor = Math.floor;
                  module.exports = function isInteger(it) {
                    return !isObject(it) && isFinite(it) && floor(it) === it;
                  };
                  });

                  var require$$0$21 = ($_isInteger && typeof $_isInteger === 'object' && 'default' in $_isInteger ? $_isInteger['default'] : $_isInteger);

                  var es6_number_isSafeInteger = __commonjs(function (module) {
                  // 20.1.2.5 Number.isSafeInteger(number)
                  var $export = require$$2,
                      isInteger = require$$0$21,
                      abs = Math.abs;

                  $export($export.S, 'Number', {
                    isSafeInteger: function isSafeInteger(number) {
                      return isInteger(number) && abs(number) <= 0x1fffffffffffff;
                    }
                  });
                  });

                  var es6_number_isNan = __commonjs(function (module) {
                  // 20.1.2.4 Number.isNaN(number)
                  var $export = require$$2;

                  $export($export.S, 'Number', {
                    isNaN: function isNaN(number) {
                      return number != number;
                    }
                  });
                  });

                  var es6_number_isInteger = __commonjs(function (module) {
                  // 20.1.2.3 Number.isInteger(number)
                  var $export = require$$2;

                  $export($export.S, 'Number', { isInteger: require$$0$21 });
                  });

                  var es6_number_isFinite = __commonjs(function (module) {
                  // 20.1.2.2 Number.isFinite(number)
                  var $export = require$$2,
                      _isFinite = require$$0$1.isFinite;

                  $export($export.S, 'Number', {
                    isFinite: function isFinite(it) {
                      return typeof it == 'number' && _isFinite(it);
                    }
                  });
                  });

                  var es6_number_epsilon = __commonjs(function (module) {
                  // 20.1.2.1 Number.EPSILON
                  var $export = require$$2;

                  $export($export.S, 'Number', { EPSILON: Math.pow(2, -52) });
                  });

                  var $_toPrimitive = __commonjs(function (module) {
                  // 7.1.1 ToPrimitive(input [, PreferredType])
                  var isObject = require$$2$2;
                  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
                  // and the second argument - flag - preferred type is a string
                  module.exports = function (it, S) {
                    if (!isObject(it)) return it;
                    var fn, val;
                    if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
                    if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
                    if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
                    throw TypeError("Can't convert object to primitive value");
                  };
                  });

                  var require$$4$3 = ($_toPrimitive && typeof $_toPrimitive === 'object' && 'default' in $_toPrimitive ? $_toPrimitive['default'] : $_toPrimitive);

                  var es6_number_constructor = __commonjs(function (module, exports, global) {
                  'use strict';

                  var $ = require$$1$4,
                      global = require$$0$1,
                      has = require$$5,
                      cof = require$$0$22,
                      toPrimitive = require$$4$3,
                      fails = require$$0$11,
                      $trim = require$$2$1.trim,
                      NUMBER = 'Number',
                      $Number = global[NUMBER],
                      Base = $Number,
                      proto = $Number.prototype
                  // Opera ~12 has broken Object#toString
                  ,
                      BROKEN_COF = cof($.create(proto)) == NUMBER,
                      TRIM = 'trim' in String.prototype;

                  // 7.1.3 ToNumber(argument)
                  var toNumber = function toNumber(argument) {
                    var it = toPrimitive(argument, false);
                    if (typeof it == 'string' && it.length > 2) {
                      it = TRIM ? it.trim() : $trim(it, 3);
                      var first = it.charCodeAt(0),
                          third,
                          radix,
                          maxCode;
                      if (first === 43 || first === 45) {
                        third = it.charCodeAt(2);
                        if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
                      } else if (first === 48) {
                          switch (it.charCodeAt(1)) {
                            case 66:case 98:
                              radix = 2;maxCode = 49;break; // fast equal /^0b[01]+$/i
                            case 79:case 111:
                              radix = 8;maxCode = 55;break; // fast equal /^0o[0-7]+$/i
                            default:
                              return +it;
                          }
                          for (var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++) {
                            code = digits.charCodeAt(i);
                            // parseInt parses a string to a first unavailable symbol
                            // but ToNumber should return NaN if a string contains unavailable symbols
                            if (code < 48 || code > maxCode) return NaN;
                          }return parseInt(digits, radix);
                        }
                    }return +it;
                  };

                  if (!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')) {
                    $Number = function Number(value) {
                      var it = arguments.length < 1 ? 0 : value,
                          that = this;
                      return that instanceof $Number
                      // check on 1..constructor(foo) case
                       && (BROKEN_COF ? fails(function () {
                        proto.valueOf.call(that);
                      }) : cof(that) != NUMBER) ? new Base(toNumber(it)) : toNumber(it);
                    };
                    $.each.call(require$$1$11 ? $.getNames(Base) : (
                    // ES3:
                    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
                    // ES6 (in case, if modules with ES6 Number statics required before):
                    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' + 'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger').split(','), function (key) {
                      if (has(Base, key) && !has($Number, key)) {
                        $.setDesc($Number, key, $.getDesc(Base, key));
                      }
                    });
                    $Number.prototype = proto;
                    proto.constructor = $Number;
                    require$$7(global, NUMBER, $Number);
                  }
                  });

                  var es6_function_hasInstance = __commonjs(function (module) {
                  'use strict';

                  var $ = require$$1$4,
                      isObject = require$$2$2,
                      HAS_INSTANCE = require$$0('hasInstance'),
                      FunctionProto = Function.prototype;
                  // 19.2.3.6 Function.prototype[@@hasInstance](V)
                  if (!(HAS_INSTANCE in FunctionProto)) $.setDesc(FunctionProto, HAS_INSTANCE, { value: function value(O) {
                      if (typeof this != 'function' || !isObject(O)) return false;
                      if (!isObject(this.prototype)) return O instanceof this;
                      // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
                      while (O = $.getProto(O)) {
                        if (this.prototype === O) return true;
                      }return false;
                    } });
                  });

                  var es6_function_name = __commonjs(function (module) {
                  var setDesc = require$$1$4.setDesc,
                      createDesc = require$$3,
                      has = require$$5,
                      FProto = Function.prototype,
                      nameRE = /^\s*function ([^ (]*)/,
                      NAME = 'name';
                  // 19.2.4.2 name
                  NAME in FProto || require$$1$11 && setDesc(FProto, NAME, {
                    configurable: true,
                    get: function get() {
                      var match = ('' + this).match(nameRE),
                          name = match ? match[1] : '';
                      has(this, NAME) || setDesc(this, NAME, createDesc(5, name));
                      return name;
                    }
                  });
                  });

                  var $_getNames = __commonjs(function (module) {
                  // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
                  var toIObject = require$$0$5,
                      getNames = require$$1$4.getNames,
                      toString = {}.toString;

                  var windowNames = (typeof window === 'undefined' ? 'undefined' : babelHelpers_typeof(window)) == 'object' && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

                  var getWindowNames = function getWindowNames(it) {
                    try {
                      return getNames(it);
                    } catch (e) {
                      return windowNames.slice();
                    }
                  };

                  module.exports.get = function getOwnPropertyNames(it) {
                    if (windowNames && toString.call(it) == '[object Window]') return getWindowNames(it);
                    return getNames(toIObject(it));
                  };
                  });

                  var require$$6$3 = ($_getNames && typeof $_getNames === 'object' && 'default' in $_getNames ? $_getNames['default'] : $_getNames);

                  var $_objectSap = __commonjs(function (module) {
                  // most Object methods by ES6 should accept primitives
                  var $export = require$$2,
                      core = require$$1,
                      fails = require$$0$11;
                  module.exports = function (KEY, exec) {
                    var fn = (core.Object || {})[KEY] || Object[KEY],
                        exp = {};
                    exp[KEY] = exec(fn);
                    $export($export.S + $export.F * fails(function () {
                      fn(1);
                    }), 'Object', exp);
                  };
                  });

                  var require$$0$23 = ($_objectSap && typeof $_objectSap === 'object' && 'default' in $_objectSap ? $_objectSap['default'] : $_objectSap);

                  var es6_object_getOwnPropertyNames = __commonjs(function (module) {
                  // 19.1.2.7 Object.getOwnPropertyNames(O)
                  require$$0$23('getOwnPropertyNames', function () {
                    return require$$6$3.get;
                  });
                  });

                  var es6_object_keys = __commonjs(function (module) {
                  // 19.1.2.14 Object.keys(O)
                  var toObject = require$$2$5;

                  require$$0$23('keys', function ($keys) {
                    return function keys(it) {
                      return $keys(toObject(it));
                    };
                  });
                  });

                  var es6_object_getPrototypeOf = __commonjs(function (module) {
                  // 19.1.2.9 Object.getPrototypeOf(O)
                  var toObject = require$$2$5;

                  require$$0$23('getPrototypeOf', function ($getPrototypeOf) {
                    return function getPrototypeOf(it) {
                      return $getPrototypeOf(toObject(it));
                    };
                  });
                  });

                  var es6_object_getOwnPropertyDescriptor = __commonjs(function (module) {
                  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
                  var toIObject = require$$0$5;

                  require$$0$23('getOwnPropertyDescriptor', function ($getOwnPropertyDescriptor) {
                    return function getOwnPropertyDescriptor(it, key) {
                      return $getOwnPropertyDescriptor(toIObject(it), key);
                    };
                  });
                  });

                  var es6_object_isExtensible = __commonjs(function (module) {
                  // 19.1.2.11 Object.isExtensible(O)
                  var isObject = require$$2$2;

                  require$$0$23('isExtensible', function ($isExtensible) {
                    return function isExtensible(it) {
                      return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
                    };
                  });
                  });

                  var es6_object_isSealed = __commonjs(function (module) {
                  // 19.1.2.13 Object.isSealed(O)
                  var isObject = require$$2$2;

                  require$$0$23('isSealed', function ($isSealed) {
                    return function isSealed(it) {
                      return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
                    };
                  });
                  });

                  var es6_object_isFrozen = __commonjs(function (module) {
                  // 19.1.2.12 Object.isFrozen(O)
                  var isObject = require$$2$2;

                  require$$0$23('isFrozen', function ($isFrozen) {
                    return function isFrozen(it) {
                      return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
                    };
                  });
                  });

                  var es6_object_preventExtensions = __commonjs(function (module) {
                  // 19.1.2.15 Object.preventExtensions(O)
                  var isObject = require$$2$2;

                  require$$0$23('preventExtensions', function ($preventExtensions) {
                    return function preventExtensions(it) {
                      return $preventExtensions && isObject(it) ? $preventExtensions(it) : it;
                    };
                  });
                  });

                  var es6_object_seal = __commonjs(function (module) {
                  // 19.1.2.17 Object.seal(O)
                  var isObject = require$$2$2;

                  require$$0$23('seal', function ($seal) {
                    return function seal(it) {
                      return $seal && isObject(it) ? $seal(it) : it;
                    };
                  });
                  });

                  var es6_object_freeze = __commonjs(function (module) {
                  // 19.1.2.5 Object.freeze(O)
                  var isObject = require$$2$2;

                  require$$0$23('freeze', function ($freeze) {
                    return function freeze(it) {
                      return $freeze && isObject(it) ? $freeze(it) : it;
                    };
                  });
                  });

                  var es6_object_toString = __commonjs(function (module) {
                  'use strict';
                  // 19.1.3.6 Object.prototype.toString()

                  var classof = require$$3$3,
                      test = {};
                  test[require$$0('toStringTag')] = 'z';
                  if (test + '' != '[object z]') {
                    require$$7(Object.prototype, 'toString', function toString() {
                      return '[object ' + classof(this) + ']';
                    }, true);
                  }
                  });

                  var es6_object_setPrototypeOf = __commonjs(function (module) {
                  // 19.1.3.19 Object.setPrototypeOf(O, proto)
                  var $export = require$$2;
                  $export($export.S, 'Object', { setPrototypeOf: require$$0$9.set });
                  });

                  var es6_object_is = __commonjs(function (module) {
                  // 19.1.3.10 Object.is(value1, value2)
                  var $export = require$$2;
                  $export($export.S, 'Object', { is: require$$0$13 });
                  });

                  var $_objectAssign = __commonjs(function (module) {
                  // 19.1.2.1 Object.assign(target, source, ...)
                  var $ = require$$1$4,
                      toObject = require$$2$5,
                      IObject = require$$1$19;

                  // should work with symbols and should have deterministic property order (V8 bug)
                  module.exports = require$$0$11(function () {
                    var a = Object.assign,
                        A = {},
                        B = {},
                        S = Symbol(),
                        K = 'abcdefghijklmnopqrst';
                    A[S] = 7;
                    K.split('').forEach(function (k) {
                      B[k] = k;
                    });
                    return a({}, A)[S] != 7 || Object.keys(a({}, B)).join('') != K;
                  }) ? function assign(target, source) {
                    // eslint-disable-line no-unused-vars
                    var T = toObject(target),
                        $$ = arguments,
                        $$len = $$.length,
                        index = 1,
                        getKeys = $.getKeys,
                        getSymbols = $.getSymbols,
                        isEnum = $.isEnum;
                    while ($$len > index) {
                      var S = IObject($$[index++]),
                          keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S),
                          length = keys.length,
                          j = 0,
                          key;
                      while (length > j) {
                        if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
                      }
                    }
                    return T;
                  } : Object.assign;
                  });

                  var require$$0$24 = ($_objectAssign && typeof $_objectAssign === 'object' && 'default' in $_objectAssign ? $_objectAssign['default'] : $_objectAssign);

                  var es6_object_assign = __commonjs(function (module) {
                  // 19.1.3.1 Object.assign(target, source)
                  var $export = require$$2;

                  $export($export.S + $export.F, 'Object', { assign: require$$0$24 });
                  });

                  var $_enumKeys = __commonjs(function (module) {
                  // all enumerable object keys, includes symbols
                  var $ = require$$1$4;
                  module.exports = function (it) {
                    var keys = $.getKeys(it),
                        getSymbols = $.getSymbols;
                    if (getSymbols) {
                      var symbols = getSymbols(it),
                          isEnum = $.isEnum,
                          i = 0,
                          key;
                      while (symbols.length > i) {
                        if (isEnum.call(it, key = symbols[i++])) keys.push(key);
                      }
                    }
                    return keys;
                  };
                  });

                  var require$$5$3 = ($_enumKeys && typeof $_enumKeys === 'object' && 'default' in $_enumKeys ? $_enumKeys['default'] : $_enumKeys);

                  var $_keyof = __commonjs(function (module) {
                  var $ = require$$1$4,
                      toIObject = require$$0$5;
                  module.exports = function (object, el) {
                    var O = toIObject(object),
                        keys = $.getKeys(O),
                        length = keys.length,
                        index = 0,
                        key;
                    while (length > index) {
                      if (O[key = keys[index++]] === el) return key;
                    }
                  };
                  });

                  var require$$7$3 = ($_keyof && typeof $_keyof === 'object' && 'default' in $_keyof ? $_keyof['default'] : $_keyof);

                  var es6_symbol = __commonjs(function (module, exports, global) {
                  'use strict';
                  // ECMAScript 6 symbols shim

                  var $ = require$$1$4,
                      global = require$$0$1,
                      has = require$$5,
                      DESCRIPTORS = require$$1$11,
                      $export = require$$2,
                      redefine = require$$7,
                      $fails = require$$0$11,
                      shared = require$$2$6,
                      setToStringTag = require$$2$3,
                      uid = require$$4$4,
                      wks = require$$0,
                      keyOf = require$$7$3,
                      $names = require$$6$3,
                      enumKeys = require$$5$3,
                      isArray = require$$1$18,
                      anObject = require$$0$10,
                      toIObject = require$$0$5,
                      createDesc = require$$3,
                      getDesc = $.getDesc,
                      setDesc = $.setDesc,
                      _create = $.create,
                      getNames = $names.get,
                      $Symbol = global.Symbol,
                      $JSON = global.JSON,
                      _stringify = $JSON && $JSON.stringify,
                      setter = false,
                      HIDDEN = wks('_hidden'),
                      isEnum = $.isEnum,
                      SymbolRegistry = shared('symbol-registry'),
                      AllSymbols = shared('symbols'),
                      useNative = typeof $Symbol == 'function',
                      ObjectProto = Object.prototype;

                  // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
                  var setSymbolDesc = DESCRIPTORS && $fails(function () {
                    return _create(setDesc({}, 'a', {
                      get: function get() {
                        return setDesc(this, 'a', { value: 7 }).a;
                      }
                    })).a != 7;
                  }) ? function (it, key, D) {
                    var protoDesc = getDesc(ObjectProto, key);
                    if (protoDesc) delete ObjectProto[key];
                    setDesc(it, key, D);
                    if (protoDesc && it !== ObjectProto) setDesc(ObjectProto, key, protoDesc);
                  } : setDesc;

                  var wrap = function wrap(tag) {
                    var sym = AllSymbols[tag] = _create($Symbol.prototype);
                    sym._k = tag;
                    DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
                      configurable: true,
                      set: function set(value) {
                        if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
                        setSymbolDesc(this, tag, createDesc(1, value));
                      }
                    });
                    return sym;
                  };

                  var isSymbol = function isSymbol(it) {
                    return (typeof it === 'undefined' ? 'undefined' : babelHelpers_typeof(it)) == 'symbol';
                  };

                  var $defineProperty = function defineProperty(it, key, D) {
                    if (D && has(AllSymbols, key)) {
                      if (!D.enumerable) {
                        if (!has(it, HIDDEN)) setDesc(it, HIDDEN, createDesc(1, {}));
                        it[HIDDEN][key] = true;
                      } else {
                        if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
                        D = _create(D, { enumerable: createDesc(0, false) });
                      }return setSymbolDesc(it, key, D);
                    }return setDesc(it, key, D);
                  };
                  var $defineProperties = function defineProperties(it, P) {
                    anObject(it);
                    var keys = enumKeys(P = toIObject(P)),
                        i = 0,
                        l = keys.length,
                        key;
                    while (l > i) {
                      $defineProperty(it, key = keys[i++], P[key]);
                    }return it;
                  };
                  var $create = function create(it, P) {
                    return P === undefined ? _create(it) : $defineProperties(_create(it), P);
                  };
                  var $propertyIsEnumerable = function propertyIsEnumerable(key) {
                    var E = isEnum.call(this, key);
                    return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
                  };
                  var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
                    var D = getDesc(it = toIObject(it), key);
                    if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
                    return D;
                  };
                  var $getOwnPropertyNames = function getOwnPropertyNames(it) {
                    var names = getNames(toIObject(it)),
                        result = [],
                        i = 0,
                        key;
                    while (names.length > i) {
                      if (!has(AllSymbols, key = names[i++]) && key != HIDDEN) result.push(key);
                    }return result;
                  };
                  var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
                    var names = getNames(toIObject(it)),
                        result = [],
                        i = 0,
                        key;
                    while (names.length > i) {
                      if (has(AllSymbols, key = names[i++])) result.push(AllSymbols[key]);
                    }return result;
                  };
                  var $stringify = function stringify(it) {
                    if (it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
                    var args = [it],
                        i = 1,
                        $$ = arguments,
                        replacer,
                        $replacer;
                    while ($$.length > i) {
                      args.push($$[i++]);
                    }replacer = args[1];
                    if (typeof replacer == 'function') $replacer = replacer;
                    if ($replacer || !isArray(replacer)) replacer = function replacer(key, value) {
                      if ($replacer) value = $replacer.call(this, key, value);
                      if (!isSymbol(value)) return value;
                    };
                    args[1] = replacer;
                    return _stringify.apply($JSON, args);
                  };
                  var buggyJSON = $fails(function () {
                    var S = $Symbol();
                    // MS Edge converts symbol values to JSON as {}
                    // WebKit converts symbol values to JSON as null
                    // V8 throws on boxed symbols
                    return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
                  });

                  // 19.4.1.1 Symbol([description])
                  if (!useNative) {
                    $Symbol = function _Symbol() {
                      if (isSymbol(this)) throw TypeError('Symbol is not a constructor');
                      return wrap(uid(arguments.length > 0 ? arguments[0] : undefined));
                    };
                    redefine($Symbol.prototype, 'toString', function toString() {
                      return this._k;
                    });

                    isSymbol = function isSymbol(it) {
                      return it instanceof $Symbol;
                    };

                    $.create = $create;
                    $.isEnum = $propertyIsEnumerable;
                    $.getDesc = $getOwnPropertyDescriptor;
                    $.setDesc = $defineProperty;
                    $.setDescs = $defineProperties;
                    $.getNames = $names.get = $getOwnPropertyNames;
                    $.getSymbols = $getOwnPropertySymbols;

                    if (DESCRIPTORS && !require$$9$1) {
                      redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
                    }
                  }

                  var symbolStatics = {
                    // 19.4.2.1 Symbol.for(key)
                    'for': function _for(key) {
                      return has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
                    },
                    // 19.4.2.5 Symbol.keyFor(sym)
                    keyFor: function keyFor(key) {
                      return keyOf(SymbolRegistry, key);
                    },
                    useSetter: function useSetter() {
                      setter = true;
                    },
                    useSimple: function useSimple() {
                      setter = false;
                    }
                  };
                  // 19.4.2.2 Symbol.hasInstance
                  // 19.4.2.3 Symbol.isConcatSpreadable
                  // 19.4.2.4 Symbol.iterator
                  // 19.4.2.6 Symbol.match
                  // 19.4.2.8 Symbol.replace
                  // 19.4.2.9 Symbol.search
                  // 19.4.2.10 Symbol.species
                  // 19.4.2.11 Symbol.split
                  // 19.4.2.12 Symbol.toPrimitive
                  // 19.4.2.13 Symbol.toStringTag
                  // 19.4.2.14 Symbol.unscopables
                  $.each.call(('hasInstance,isConcatSpreadable,iterator,match,replace,search,' + 'species,split,toPrimitive,toStringTag,unscopables').split(','), function (it) {
                    var sym = wks(it);
                    symbolStatics[it] = useNative ? sym : wrap(sym);
                  });

                  setter = true;

                  $export($export.G + $export.W, { Symbol: $Symbol });

                  $export($export.S, 'Symbol', symbolStatics);

                  $export($export.S + $export.F * !useNative, 'Object', {
                    // 19.1.2.2 Object.create(O [, Properties])
                    create: $create,
                    // 19.1.2.4 Object.defineProperty(O, P, Attributes)
                    defineProperty: $defineProperty,
                    // 19.1.2.3 Object.defineProperties(O, Properties)
                    defineProperties: $defineProperties,
                    // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
                    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
                    // 19.1.2.7 Object.getOwnPropertyNames(O)
                    getOwnPropertyNames: $getOwnPropertyNames,
                    // 19.1.2.8 Object.getOwnPropertySymbols(O)
                    getOwnPropertySymbols: $getOwnPropertySymbols
                  });

                  // 24.3.2 JSON.stringify(value [, replacer [, space]])
                  $JSON && $export($export.S + $export.F * (!useNative || buggyJSON), 'JSON', { stringify: $stringify });

                  // 19.4.3.5 Symbol.prototype[@@toStringTag]
                  setToStringTag($Symbol, 'Symbol');
                  // 20.2.1.9 Math[@@toStringTag]
                  setToStringTag(Math, 'Math', true);
                  // 24.3.3 JSON[@@toStringTag]
                  setToStringTag(global.JSON, 'JSON', true);
                  });

                  var es5 = __commonjs(function (module) {
                  'use strict';

                  var $ = require$$1$4,
                      $export = require$$2,
                      DESCRIPTORS = require$$1$11,
                      createDesc = require$$3,
                      html = require$$3$5,
                      cel = require$$2$7,
                      has = require$$5,
                      cof = require$$0$22,
                      invoke = require$$1$3,
                      fails = require$$0$11,
                      anObject = require$$0$10,
                      aFunction = require$$1$7,
                      isObject = require$$2$2,
                      toObject = require$$2$5,
                      toIObject = require$$0$5,
                      toInteger = require$$0$25,
                      toIndex = require$$1$17,
                      toLength = require$$0$16,
                      IObject = require$$1$19,
                      IE_PROTO = require$$4$4('__proto__'),
                      createArrayMethod = require$$2$4,
                      arrayIndexOf = require$$1$6(false),
                      ObjectProto = Object.prototype,
                      ArrayProto = Array.prototype,
                      arraySlice = ArrayProto.slice,
                      arrayJoin = ArrayProto.join,
                      defineProperty = $.setDesc,
                      getOwnDescriptor = $.getDesc,
                      defineProperties = $.setDescs,
                      factories = {},
                      IE8_DOM_DEFINE;

                  if (!DESCRIPTORS) {
                    IE8_DOM_DEFINE = !fails(function () {
                      return defineProperty(cel('div'), 'a', { get: function get() {
                          return 7;
                        } }).a != 7;
                    });
                    $.setDesc = function (O, P, Attributes) {
                      if (IE8_DOM_DEFINE) try {
                        return defineProperty(O, P, Attributes);
                      } catch (e) {/* empty */}
                      if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
                      if ('value' in Attributes) anObject(O)[P] = Attributes.value;
                      return O;
                    };
                    $.getDesc = function (O, P) {
                      if (IE8_DOM_DEFINE) try {
                        return getOwnDescriptor(O, P);
                      } catch (e) {/* empty */}
                      if (has(O, P)) return createDesc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
                    };
                    $.setDescs = defineProperties = function defineProperties(O, Properties) {
                      anObject(O);
                      var keys = $.getKeys(Properties),
                          length = keys.length,
                          i = 0,
                          P;
                      while (length > i) {
                        $.setDesc(O, P = keys[i++], Properties[P]);
                      }return O;
                    };
                  }
                  $export($export.S + $export.F * !DESCRIPTORS, 'Object', {
                    // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
                    getOwnPropertyDescriptor: $.getDesc,
                    // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
                    defineProperty: $.setDesc,
                    // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
                    defineProperties: defineProperties
                  });

                  // IE 8- don't enum bug keys
                  var keys1 = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' + 'toLocaleString,toString,valueOf').split(',')
                  // Additional keys for getOwnPropertyNames
                  ,
                      keys2 = keys1.concat('length', 'prototype'),
                      keysLen1 = keys1.length;

                  // Create object with `null` prototype: use iframe Object with cleared prototype
                  var _createDict = function createDict() {
                    // Thrash, waste and sodomy: IE GC bug
                    var iframe = cel('iframe'),
                        i = keysLen1,
                        gt = '>',
                        iframeDocument;
                    iframe.style.display = 'none';
                    html.appendChild(iframe);
                    iframe.src = 'javascript:'; // eslint-disable-line no-script-url
                    // createDict = iframe.contentWindow.Object;
                    // html.removeChild(iframe);
                    iframeDocument = iframe.contentWindow.document;
                    iframeDocument.open();
                    iframeDocument.write('<script>document.F=Object</script' + gt);
                    iframeDocument.close();
                    _createDict = iframeDocument.F;
                    while (i--) {
                      delete _createDict.prototype[keys1[i]];
                    }return _createDict();
                  };
                  var createGetKeys = function createGetKeys(names, length) {
                    return function (object) {
                      var O = toIObject(object),
                          i = 0,
                          result = [],
                          key;
                      for (key in O) {
                        if (key != IE_PROTO) has(O, key) && result.push(key);
                      } // Don't enum bug & hidden keys
                      while (length > i) {
                        if (has(O, key = names[i++])) {
                          ~arrayIndexOf(result, key) || result.push(key);
                        }
                      }return result;
                    };
                  };
                  var Empty = function Empty() {};
                  $export($export.S, 'Object', {
                    // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
                    getPrototypeOf: $.getProto = $.getProto || function (O) {
                      O = toObject(O);
                      if (has(O, IE_PROTO)) return O[IE_PROTO];
                      if (typeof O.constructor == 'function' && O instanceof O.constructor) {
                        return O.constructor.prototype;
                      }return O instanceof Object ? ObjectProto : null;
                    },
                    // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
                    getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
                    // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
                    create: $.create = $.create || function (O, /*?*/Properties) {
                      var result;
                      if (O !== null) {
                        Empty.prototype = anObject(O);
                        result = new Empty();
                        Empty.prototype = null;
                        // add "__proto__" for Object.getPrototypeOf shim
                        result[IE_PROTO] = O;
                      } else result = _createDict();
                      return Properties === undefined ? result : defineProperties(result, Properties);
                    },
                    // 19.1.2.14 / 15.2.3.14 Object.keys(O)
                    keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false)
                  });

                  var construct = function construct(F, len, args) {
                    if (!(len in factories)) {
                      for (var n = [], i = 0; i < len; i++) {
                        n[i] = 'a[' + i + ']';
                      }factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
                    }
                    return factories[len](F, args);
                  };

                  // 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
                  $export($export.P, 'Function', {
                    bind: function bind(that /*, args... */) {
                      var fn = aFunction(this),
                          partArgs = arraySlice.call(arguments, 1);
                      var bound = function bound() /* args... */{
                        var args = partArgs.concat(arraySlice.call(arguments));
                        return this instanceof bound ? construct(fn, args.length, args) : invoke(fn, args, that);
                      };
                      if (isObject(fn.prototype)) bound.prototype = fn.prototype;
                      return bound;
                    }
                  });

                  // fallback for not array-like ES3 strings and DOM objects
                  $export($export.P + $export.F * fails(function () {
                    if (html) arraySlice.call(html);
                  }), 'Array', {
                    slice: function slice(begin, end) {
                      var len = toLength(this.length),
                          klass = cof(this);
                      end = end === undefined ? len : end;
                      if (klass == 'Array') return arraySlice.call(this, begin, end);
                      var start = toIndex(begin, len),
                          upTo = toIndex(end, len),
                          size = toLength(upTo - start),
                          cloned = Array(size),
                          i = 0;
                      for (; i < size; i++) {
                        cloned[i] = klass == 'String' ? this.charAt(start + i) : this[start + i];
                      }return cloned;
                    }
                  });
                  $export($export.P + $export.F * (IObject != Object), 'Array', {
                    join: function join(separator) {
                      return arrayJoin.call(IObject(this), separator === undefined ? ',' : separator);
                    }
                  });

                  // 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
                  $export($export.S, 'Array', { isArray: require$$1$18 });

                  var createArrayReduce = function createArrayReduce(isRight) {
                    return function (callbackfn, memo) {
                      aFunction(callbackfn);
                      var O = IObject(this),
                          length = toLength(O.length),
                          index = isRight ? length - 1 : 0,
                          i = isRight ? -1 : 1;
                      if (arguments.length < 2) for (;;) {
                        if (index in O) {
                          memo = O[index];
                          index += i;
                          break;
                        }
                        index += i;
                        if (isRight ? index < 0 : length <= index) {
                          throw TypeError('Reduce of empty array with no initial value');
                        }
                      }
                      for (; isRight ? index >= 0 : length > index; index += i) {
                        if (index in O) {
                          memo = callbackfn(memo, O[index], index, this);
                        }
                      }return memo;
                    };
                  };

                  var methodize = function methodize($fn) {
                    return function (arg1 /*, arg2 = undefined */) {
                      return $fn(this, arg1, arguments[1]);
                    };
                  };

                  $export($export.P, 'Array', {
                    // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
                    forEach: $.each = $.each || methodize(createArrayMethod(0)),
                    // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
                    map: methodize(createArrayMethod(1)),
                    // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
                    filter: methodize(createArrayMethod(2)),
                    // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
                    some: methodize(createArrayMethod(3)),
                    // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
                    every: methodize(createArrayMethod(4)),
                    // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
                    reduce: createArrayReduce(false),
                    // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
                    reduceRight: createArrayReduce(true),
                    // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
                    indexOf: methodize(arrayIndexOf),
                    // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
                    lastIndexOf: function lastIndexOf(el, fromIndex /* = @[*-1] */) {
                      var O = toIObject(this),
                          length = toLength(O.length),
                          index = length - 1;
                      if (arguments.length > 1) index = Math.min(index, toInteger(fromIndex));
                      if (index < 0) index = toLength(length + index);
                      for (; index >= 0; index--) {
                        if (index in O) if (O[index] === el) return index;
                      }return -1;
                    }
                  });

                  // 20.3.3.1 / 15.9.4.4 Date.now()
                  $export($export.S, 'Date', { now: function now() {
                      return +new Date();
                    } });

                  var lz = function lz(num) {
                    return num > 9 ? num : '0' + num;
                  };

                  // 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
                  // PhantomJS / old WebKit has a broken implementations
                  $export($export.P + $export.F * (fails(function () {
                    return new Date(-5e13 - 1).toISOString() != '0385-07-25T07:06:39.999Z';
                  }) || !fails(function () {
                    new Date(NaN).toISOString();
                  })), 'Date', {
                    toISOString: function toISOString() {
                      if (!isFinite(this)) throw RangeError('Invalid time value');
                      var d = this,
                          y = d.getUTCFullYear(),
                          m = d.getUTCMilliseconds(),
                          s = y < 0 ? '-' : y > 9999 ? '+' : '';
                      return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) + '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) + 'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) + ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
                    }
                  });
                  });

                  var shim = __commonjs(function (module) {
                  module.exports = require$$1;
                  });

                  var index = __commonjs(function (module, exports, global) {
                  "use strict";





                  if (global._babelPolyfill) {
                    throw new Error("only one instance of babel-polyfill is allowed");
                  }
                  global._babelPolyfill = true;
                  });

                  // Conceptually:
                  // type Signal t a = t -> (a, Signal t a)

                  // A time-varying value

                  var Signal = function () {
                      function Signal(runSignal) {
                          babelHelpers_classCallCheck(this, Signal);

                          this._runSignal = runSignal;
                          this._value = void 0;
                      }

                      babelHelpers_createClass(Signal, [{
                          key: 'runSignal',
                          value: function runSignal(t) {
                              return this._value === void 0 ? this._value = this._runSignal(t) : this._value;
                          }
                      }, {
                          key: 'map',
                          value: function map(f) {
                              var _this = this;

                              return new Signal(function (t) {
                                  return mapSignal(f, _this.runSignal(t));
                              });
                          }
                      }, {
                          key: 'ap',
                          value: function ap(xs) {
                              return this.liftA2(apply, xs);
                          }
                      }, {
                          key: 'liftA2',
                          value: function liftA2(f, b) {
                              var _this2 = this;

                              return new Signal(function (t) {
                                  return liftA2Signal(f, _this2.runSignal(t), b.runSignal(t));
                              });
                          }
                      }, {
                          key: 'liftA3',
                          value: function liftA3(f, b, c) {
                              var _this3 = this;

                              return new Signal(function (t) {
                                  return liftA3Signal(f, _this3.runSignal(t), b.runSignal(t), c.runSignal(t));
                              });
                          }
                      }]);
                      return Signal;
                  }();

                  // Internal signal helpers

                  var mapSignal = function mapSignal(f, _ref) {
                      var value = _ref.value;
                      var next = _ref.next;
                      return signalStep(f(value), next.map(f));
                  };

                  var liftA2Signal = function liftA2Signal(f, _ref2, _ref3) {
                      var v1 = _ref2.value;
                      var n1 = _ref2.next;
                      var v2 = _ref3.value;
                      var n2 = _ref3.next;
                      return signalStep(f(v1, v2), liftA2(f, n1, n2));
                  };

                  var apply = function apply(f, x) {
                      return f(x);
                  };

                  // A Signal whose value doesn't vary

                  var ConstSignal = function () {
                      function ConstSignal(x) {
                          babelHelpers_classCallCheck(this, ConstSignal);

                          this.value = x;
                          this.next = this;
                      }

                      babelHelpers_createClass(ConstSignal, [{
                          key: 'runSignal',
                          value: function runSignal(t) {
                              return this;
                          }
                      }, {
                          key: 'map',
                          value: function map(f) {
                              var _this4 = this;

                              return new Signal(function (t) {
                                  return mapSignal(f, _this4);
                              });
                          }
                      }, {
                          key: 'ap',
                          value: function ap(xs) {
                              return xs.map(this.value);
                          }
                      }, {
                          key: 'liftA2',
                          value: function liftA2(f, b) {
                              var _this5 = this;

                              return b.map(function (b) {
                                  return f(_this5.value, b);
                              });
                          }
                      }, {
                          key: 'liftA3',
                          value: function liftA3(f, b, c) {
                              var _this6 = this;

                              return b.liftA2(function (b, c) {
                                  return f(_this6.value, b, c);
                              }, c);
                          }
                      }]);
                      return ConstSignal;
                  }();

                  // constant :: a -> Signal t a
                  var constant = function constant(x) {
                      return new ConstSignal(x);
                  };

                  // liftA2 :: (a -> b -> c) -> Signal t a -> Signal t b -> Signal t c
                  var liftA2 = function liftA2(f, s1, s2) {
                      return s1.liftA2(f, s2);
                  };

                  // liftA3 :: (a -> b -> c -> d) -> Signal t a -> Signal t b -> Signal t c -> Signal t d
                  var liftA3 = function liftA3(f, s1, s2, s3) {
                      return s1.liftA3(f, s2, s3);
                  };

                  var liftA3Signal = function liftA3Signal(f, _ref4, _ref5, _ref6) {
                      var v1 = _ref4.value;
                      var n1 = _ref4.next;
                      var v2 = _ref5.value;
                      var n2 = _ref5.next;
                      var v3 = _ref6.value;
                      var n3 = _ref6.next;
                      return signalStep(f(v1, v2, v3), liftA3(f, n1, n2, n3));
                  };

                  // step :: a -> Event t a -> Signal t a
                  var step = function step(x, e) {
                      return switcher(constant(x), map$1(constant, e));
                  };

                  // switcher :: Signal t a -> Event t (Signal t a) -> Signal t a
                  var switcher = function switcher(inits, e) {
                      return new Signal(function (t) {
                          return stepET(inits, trim(e).runEvent(t), t);
                      });
                  };

                  var stepET = function stepET(s, ev, t) {
                      return ev.time <= t ? switchTo(ev.value, t) : stayAt(s.runSignal(t), ev);
                  };

                  var stepE = function stepE(s, ev) {
                      return new Signal(function (t) {
                          return stepET(s, ev, t);
                      });
                  };

                  var stayAt = function stayAt(sv, ev) {
                      return signalStep(sv.value, stepE(sv.next, ev));
                  };

                  var switchTo = function switchTo(_ref7, t) {
                      var value = _ref7.value;
                      var next = _ref7.next;
                      return switchToS(value.runSignal(t), next);
                  };

                  var switchToS = function switchToS(_ref8, e) {
                      var value = _ref8.value;
                      var next = _ref8.next;
                      return signalStep(value, switcher(next, e));
                  };

                  // signalStep :: a -> Signal t a -> (a, Signal t a)
                  var signalStep = function signalStep(value, next) {
                      return { value: value, next: next };
                  };

                  var domEvent = function domEvent(ev, node) {
                      var capture = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
                      return newSource(function (occur) {
                          return addListener(ev, node, capture, occur);
                      });
                  };

                  var addListener = function addListener(ev, node, capture, occur) {
                      node.addEventListener(ev, occur, capture);
                      return function () {
                          return node.removeEventListener(ev, occur, capture);
                      };
                  };

                  var mousemove = function mousemove(node) {
                      var capture = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
                      return domEvent('mousemove', node, capture);
                  };
                  var keydown = function keydown(node) {
                      var capture = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
                      return domEvent('keydown', node, capture);
                  };

                  var join = function join(sep) {
                      return function (a, b) {
                          return a + sep + b;
                      };
                  };
                  var render = function render(e) {
                      return document.body.innerHTML = e;
                  };

                  var updates = build(regeneratorRuntime.mark(function _callee(window) {
                      var mouse, key, coords, keyCode, s;
                      return regeneratorRuntime.wrap(function _callee$(_context) {
                          while (1) {
                              switch (_context.prev = _context.next) {
                                  case 0:
                                      _context.next = 2;
                                      return mousemove(window);

                                  case 2:
                                      mouse = _context.sent;
                                      _context.next = 5;
                                      return keydown(window);

                                  case 5:
                                      key = _context.sent;
                                      coords = step('-,-', map$1(function (e) {
                                          return e.clientX + ',' + e.clientY;
                                      }, mouse));
                                      keyCode = step('-', map$1(function (e) {
                                          return e.keyCode;
                                      }, key));
                                      s = liftA2(join(':'), coords, keyCode);
                                      return _context.abrupt('return', sample(s, merge(mouse, key)));

                                  case 10:
                                  case 'end':
                                      return _context.stop();
                              }
                          }
                      }, _callee, this);
                  }), window);

                  runEvent(render, updates, newClock(Date.now));

}());