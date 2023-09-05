import {Extender} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";
import {ASTVisitor} from "../../../util/ASTVisitor";
import * as ESTree from "estree";
import {Syntax} from "../../../Migration";

/**
 * Adds an import to the define statement
 */
class AddImportAndRemoveUnused implements Extender {
	extend(
		defineCall: SapUiDefineCall,
		config: {
			newModulePath: string;
			newVariableName: string;
			removeModulePath?: string;
		}
	): boolean {
		const importToRemove = "sap/ui/core/Core";

		const absoluteImports = defineCall.getAbsoluteDependencyPaths();

		const coreImportIndex = absoluteImports.findIndex(importString =>
			importString.endsWith(importToRemove)
		);

		let dependencyRemoved: boolean;

		if (coreImportIndex >= 0) {
			const paramToRemove = defineCall.paramNames[coreImportIndex];

			const variableNames = new Set<string>();
			const visitor = new ASTVisitor();
			let bGlobalGetCoreFound = false;

			visitor.visit(defineCall.factory.body, {
				visitIdentifier(identifierPath) {
					const oParentPath = identifierPath.parentPath;

					if (
						oParentPath.value.type !== "LabeledStatement" &&
						(oParentPath.value.type !== "Property" ||
							(oParentPath.value as ESTree.Property).key ===
								identifierPath.value) &&
						(oParentPath.value.type !== "MemberExpression" ||
							(oParentPath.value as ESTree.MemberExpression)
								.object === identifierPath.value)
					) {
						variableNames.add(
							(identifierPath.value as ESTree.Identifier).name
						);
					}
					this.traverse(identifierPath);
				},
				visitCallExpression(callPath) {
					const oCall = callPath.value;

					if (
						oCall.callee.type === Syntax.MemberExpression &&
						oCall.callee.property.type === Syntax.Identifier &&
						oCall.callee.property.name === "getCore" &&
						oCall.callee.object.type === Syntax.MemberExpression &&
						oCall.callee.object.property.type ===
							Syntax.Identifier &&
						oCall.callee.object.property.name === "ui" &&
						oCall.callee.object.object.type === Syntax.Identifier &&
						oCall.callee.object.object.name === "sap"
					) {
						bGlobalGetCoreFound = true;
					} else {
						this.traverse(callPath);
					}
				},
			});

			if (!bGlobalGetCoreFound && !variableNames.has(paramToRemove)) {
				dependencyRemoved = defineCall.removeDependency(
					(
						defineCall.dependencyArray.elements[
							coreImportIndex
						] as ESTree.Literal
					).value as string,
					paramToRemove
				);
			}
		}

		const moduleExists = absoluteImports.some(path =>
			path.endsWith(config.newModulePath)
		);

		if (moduleExists) {
			return dependencyRemoved;
		} else {
			return defineCall.addDependency(
				config.newModulePath,
				config.newVariableName
			);
		}
	}
}

module.exports = new AddImportAndRemoveUnused();
