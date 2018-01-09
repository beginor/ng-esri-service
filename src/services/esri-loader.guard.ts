import { Inject, Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot
} from '@angular/router';

import { ILoadScriptOptions, loadModules, loadScript } from 'esri-loader';

export class EsriLoaderGuard implements CanActivate {

    constructor(
        @Inject('ESRI_LOADER_OPTIONS') private options: EsriLoaderOptions
    ) { }

    public async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {
        try {
            // load esri script and dojoConfig;
            await loadScript({
                url: this.options.url,
                dojoConfig: this.options.dojoConfig
            });
            // add cors enabled hosts
            const [config] = await loadModules(['esri/config']);
            for (const host of this.options.corsEnabledHosts) {
                config.request.corsEnabledServers.push(host);
            }
            return true;
        }
        catch (ex) {
            console.error(ex);
            return false;
        }
    }

}

export interface EsriLoaderOptions extends ILoadScriptOptions {

    corsEnabledHosts: Array<{ host: string, withCredentials: boolean}>;

}
