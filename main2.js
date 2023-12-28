import TestClass from './charactermancer/testclass.js';
Hooks.on('init', function () {
    console.log('main2.js initialized');
    console.log(TestClass);
    TestClass.funFunction();
});
