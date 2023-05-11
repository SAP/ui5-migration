import {Extender} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";
import {ASTVisitor} from "../../../util/ASTVisitor";
import * as ESTree from "estree";

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
		const importToRemove = config.removeModulePath || "sap/ui/core/Core";

		const absoluteImports = defineCall.getAbsoluteDependencyPaths();

		const coreImportIndex = absoluteImports.findIndex(importString =>
			importString.endsWith(importToRemove)
		);

		if (coreImportIndex >= 0) {
			const paramToRemove = defineCall.paramNames[coreImportIndex];

			const variableNames = new Set<string>();
			const visitor = new ASTVisitor();

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
			});

			if (!variableNames.has(paramToRemove)) {
				defineCall.removeDependency(
					(
						defineCall.dependencyArray.elements[
							coreImportIndex
						] as ESTree.Literal
					).value as string,
					paramToRemove
				);
			}
		}

		return defineCall.addDependency(
			config.newModulePath,
			config.newVariableName
		);
	}
}

module.exports = new AddImportAndRemoveUnused();
