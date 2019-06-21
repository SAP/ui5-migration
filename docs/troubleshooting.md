# Troubleshooting

## Circular (transitive) dependencies
The migration tooling tries to remove global library calls and adds the dependencies to the sap.ui.define call.
This may result in circular dependencies. These dependencies need to be resolved manually by the application developer.
Usually one of the dependency entries need to be removed.

## Lazy require
Lazy require (e.g. `sap.ui.require("some.ui5.lib");`) calls may be removed and added to the main sap.ui.define call of the module by the migration tool.
It can happen that some of the lazy required dependencies do not exist (anymore). In this case they need to be removed manually.
If a lazy require is still required, please use:

```javascript
sap.ui.require("some.ui5.lib", function(someUi5Lib) {
	/* app code */
});
```

## Unit test spies / mocks (e.g. for "jQuery.sap.log")
The migration tool replaces "jQuery.sap.log" calls with the dependency "sap/base/Log" which is not available in the global namespace. 
These references differ and if a unit test spies on "jQuery.sap.log" to check for a console message it fails.
In this case the test needs to require the "sap/base/Log" module and mock the methods on the provided object.
