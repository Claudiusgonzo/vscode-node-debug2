/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import * as Core from 'vscode-chrome-debug-core';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.node-debug2.toggleSkippingFile', toggleSkippingFile));
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('extensionHost', new ExtensionHostDebugConfigurationProvider()));
}

export function deactivate() {
}

function toggleSkippingFile(path: string | number): void {
    if (!path) {
        const activeEditor = vscode.window.activeTextEditor;
        path = activeEditor && activeEditor.document.fileName;
    }

    if (path && vscode.debug.activeDebugSession) {
        const args: Core.IToggleSkipFileStatusArgs = typeof path === 'string' ? { path } : { sourceReference: path };
        vscode.debug.activeDebugSession.customRequest('toggleSkipFileStatus', args);
    }
}

class ExtensionHostDebugConfigurationProvider implements vscode.DebugConfigurationProvider {
    resolveDebugConfiguration(_folder: vscode.WorkspaceFolder | undefined, debugConfiguration: vscode.DebugConfiguration): vscode.ProviderResult<vscode.DebugConfiguration> {
        const useV3 = getWithoutDefault('debug.extensionHost.useV3') ?? getWithoutDefault('debug.javascript.usePreview') ?? isInsiders();

        if (useV3) {
            debugConfiguration['__workspaceFolder'] = '${workspaceFolder}';
            debugConfiguration.type = 'pwa-extensionHost';
        }

        return debugConfiguration;
    }
}

function getWithoutDefault<T>(setting: string): T | undefined {
    const info = vscode.workspace.getConfiguration().inspect<T>(setting);
    return info?.workspaceValue ?? info?.globalValue;
}

function isInsiders() {
    return vscode.env.uriScheme === 'vscode-insiders'
        || vscode.env.uriScheme === 'code-oss'
        || vscode.env.uriScheme === 'vscode-exploration';
}
